"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getAllBets() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return []
    }

    try {
        const bets = await prisma.bet.findMany({
            include: {
                user: true,
                match: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return bets
    } catch (error) {
        console.error("Failed to fetch bets:", error)
        return []
    }
}

export async function placeBet(matchId: string, choice: "HOME" | "DRAW" | "AWAY" | "OVER" | "UNDER" | "HOME_OVER" | "AWAY_OVER" | "KG_VAR" | "KG_YOK", amount: number) {
    const session = await auth()
    if (!session?.user) {
        return { success: false, error: "Giriş yapmalısınız." }
    }

    if (amount < 1000 || amount > 10000) {
        return { success: false, error: "Bahis tutarı $1000 ile $10000 arasında olmalıdır." }
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get User and Lock Balance (conceptually, via atomic update later)
            const user = await tx.user.findUnique({
                where: { id: session.user.id }
            })

            if (!user) throw new Error("Kullanıcı bulunamadı.")
            if (user.balance.toNumber() < amount) {
                throw new Error("Yetersiz bakiye.")
            }

            // 1.5 Check for Existing Bet on this Match
            // Only OPEN bets should block new ones. If previous was Cancelled/Lost/Won, they can't bet again?
            // User requirement: "bir maça oynadıktan sonra o maça tekrar oynayamaz... iptal edebilir... sonra tekrar oynayabilir"
            // So we only block if status is OPEN. Failed/Cancelled doesn't block.
            const existingBet = await tx.bet.findFirst({
                where: {
                    userId: user.id,
                    matchId: matchId,
                    status: "OPEN"
                }
            })

            if (existingBet) {
                throw new Error("Bu maça zaten açık bir bahsiniz var. Yeni bahis yapmak için eskisini iptal etmelisiniz.")
            }

            // 2. Get Match and Verify Odds/Status
            const match = await tx.match.findUnique({
                where: { id: matchId }
            })

            if (!match) throw new Error("Maç bulunamadı.")
            if (match.status !== "PENDING" && match.status !== "LIVE") {
                throw new Error("Bahisler kapalı.")
            }

            // Time Rule: 30 minutes before start
            const now = new Date()
            const timeDiff = match.startTime.getTime() - now.getTime()
            const thirtyMinutesInMs = 30 * 60 * 1000

            if (timeDiff < thirtyMinutesInMs) {
                throw new Error("Maça 30 dakikadan az kaldığı için bahisler kapanmıştır.")
            }

            // Determine Odds
            let odds: any = match.oddsA // Default to something, updated below
            if (choice === "HOME") odds = match.oddsA
            if (choice === "DRAW") odds = match.oddsDraw
            if (choice === "AWAY") odds = match.oddsB
            if (choice === "OVER") odds = match.oddsOver
            if (choice === "UNDER") odds = match.oddsUnder
            if (choice === "HOME_OVER") odds = match.oddsHomeOver
            if (choice === "AWAY_OVER") odds = match.oddsAwayOver
            if (choice === "KG_VAR") odds = match.oddsBothTeamsScoreYes
            if (choice === "KG_YOK") odds = match.oddsBothTeamsScoreNo

            if (!odds) {
                throw new Error("Bu bahis seçeneği bu maç için aktif değil.")
            }

            const potentialPayout = amount * odds.toNumber()

            // 3. Create Bet
            const bet = await tx.bet.create({
                data: {
                    userId: user.id,
                    matchId: match.id,
                    amount: amount,
                    choice: choice,
                    status: "OPEN",
                    potentialPayout: potentialPayout
                }
            })

            // 4. Deduct Balance
            await tx.user.update({
                where: { id: user.id },
                data: {
                    balance: { decrement: amount }
                }
            })

            // 5. Create Transaction Record
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    amount: amount,
                    type: "BET_PLACED", // Ensure this exists in Enum or String
                    reference: `Bahis: ${match.teamA} - ${match.teamB} (${choice})`
                }
            })

            return bet
        })

        return { success: true, bet: result }

    } catch (error: any) {
        console.error("Bet placement failed:", error)
        return { success: false, error: error.message || "Bahis yapılırken bir hata oluştu." }
    }
}

export async function cancelBet(betId: string) {
    const session = await auth()
    if (!session?.user) {
        return { success: false, error: "Giriş yapmalısınız." }
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get Bet with Match
            const bet = await tx.bet.findUnique({
                where: { id: betId },
                include: { match: true }
            })

            if (!bet) throw new Error("Bahis bulunamadı.")

            // 2. Checking Ownership
            if (bet.userId !== session.user.id) throw new Error("Bu işlem için yetkiniz yok.")

            // 3. Check Status
            if (bet.status !== "OPEN") throw new Error("Bu bahis artık iptal edilemez.")

            // 4. Check Time Rule (3 Hours before start)
            const now = new Date()
            const timeDiff = bet.match.startTime.getTime() - now.getTime()
            const threeHoursInMs = 3 * 60 * 60 * 1000

            if (timeDiff < threeHoursInMs) {
                throw new Error("Maça 3 saatten az kaldığı için bahis iptal edilemez.")
            }

            // 5. Update Bet Status
            // We use 'CANCELLED' status (Need to make sure logic handles non-OPEN bets correctly everywhere)
            // Ideally we might want to DELETE the bet so they can bet again easily without clutter,
            // but keeping record is safer. 
            // Since placeBet checks for status: "OPEN", setting to "CANCELLED" allows re-betting.
            await tx.bet.update({
                where: { id: bet.id },
                data: { status: "CANCELLED" } // Assuming CANCELLED string is valid or just use 'REFUNDED' if preferred? Using 'CANCELLED'
            })

            // 6. Refund Balance
            await tx.user.update({
                where: { id: bet.userId },
                data: {
                    balance: { increment: bet.amount }
                }
            })

            // 7. Create Transaction Record
            await tx.transaction.create({
                data: {
                    userId: bet.userId,
                    amount: bet.amount,
                    type: "BET_REFUND",
                    reference: `Bahis İptali: ${bet.match.teamA} - ${bet.match.teamB}`
                }
            })

            return bet
        })

        return { success: true }
    } catch (error: any) {
        console.error("Bet cancellation failed:", error)
        return { success: false, error: error.message || "İptal işlemi başarısız." }
    }
}
