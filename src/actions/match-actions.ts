"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Match } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getMatches() {
    try {
        // 1. Önce 3 haftadan eski ve henüz silinmemiş maçları soft-delete yapalım
        const threeWeeksAgo = new Date()
        threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)

        await prisma.match.updateMany({
            where: {
                startTime: { lt: threeWeeksAgo },
                deletedAt: null
            },
            data: {
                deletedAt: new Date()
            }
        })

        // 2. Sadece silinmemiş maçları getir
        const matches = await prisma.match.findMany({
            where: {
                deletedAt: null
            },
            orderBy: { startTime: 'desc' }
        })
        return matches
    } catch (error) {
        console.error("Failed to fetch matches:", error)
        return []
    }
}

export async function getActiveMatches() {
    try {
        const matches = await prisma.match.findMany({
            where: {
                status: {
                    in: ["PENDING", "LIVE"]
                },
                deletedAt: null
            },
            orderBy: { startTime: 'asc' }
        })
        return matches
    } catch (error) {
        console.error("Failed to fetch matches:", error)
        return []
    }
}
export async function getCompletedMatches(date?: Date) {
    try {
        let whereClause: any = {
            status: "ENDED",
            deletedAt: null
        }

        if (date) {
            // Specific date filter: Start of day to End of day
            const startOfDay = new Date(date)
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date(date)
            endOfDay.setHours(23, 59, 59, 999)

            whereClause.startTime = {
                gte: startOfDay,
                lte: endOfDay
            }
        } else {
            // Default: Last 7 days
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            whereClause.startTime = {
                gte: sevenDaysAgo
            }
        }

        const matches = await prisma.match.findMany({
            where: whereClause,
            orderBy: { startTime: 'desc' }
        })
        return matches
    } catch (error) {
        console.error("Failed to fetch completed matches:", error)
        return []
    }
}

export async function getArchivedMatches() {
    try {
        const matches = await prisma.match.findMany({
            where: {
                deletedAt: { not: null }
            },
            orderBy: { deletedAt: 'desc' }
        })
        return matches
    } catch (error) {
        console.error("Failed to fetch archived matches:", error)
        return []
    }
}

export type MatchFormData = {
    teamA: string
    teamB: string
    teamALogo?: string
    teamBLogo?: string
    startTime: Date
    oddsA: string
    oddsB: string
    oddsDraw?: string
    oddsOver?: string
    oddsUnder?: string
    oddsHomeOver?: string
    oddsAwayOver?: string
    sport: string
    overUnderLine: string
}

export async function createMatch(data: MatchFormData) {
    const session = await auth()

    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Yetkisiz işlem." }
    }

    try {
        await prisma.match.create({
            data: {
                teamA: data.teamA,
                teamB: data.teamB,
                teamALogo: data.teamALogo,
                teamBLogo: data.teamBLogo,
                startTime: data.startTime,
                oddsA: parseFloat(data.oddsA),
                oddsB: parseFloat(data.oddsB),
                oddsDraw: data.oddsDraw ? parseFloat(data.oddsDraw) : null,
                oddsOver: data.oddsOver ? parseFloat(data.oddsOver) : null,
                oddsUnder: data.oddsUnder ? parseFloat(data.oddsUnder) : null,
                oddsHomeOver: data.oddsHomeOver ? parseFloat(data.oddsHomeOver) : null,
                oddsAwayOver: data.oddsAwayOver ? parseFloat(data.oddsAwayOver) : null,
                sport: data.sport,
                overUnderLine: parseFloat(data.overUnderLine),
                status: "PENDING"
            }
        })
        revalidatePath("/admin/matches")
        return { success: true }
    } catch (error) {
        console.error("Failed to create match:", error)
        return { success: false, error: String(error) }
    }
}

export async function updateMatch(matchId: string, data: MatchFormData) {
    const session = await auth()

    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Yetkisiz işlem." }
    }

    try {
        await prisma.match.update({
            where: { id: matchId },
            data: {
                teamA: data.teamA,
                teamB: data.teamB,
                teamALogo: data.teamALogo,
                teamBLogo: data.teamBLogo,
                startTime: data.startTime,
                oddsA: parseFloat(data.oddsA),
                oddsB: parseFloat(data.oddsB),
                oddsDraw: data.oddsDraw ? parseFloat(data.oddsDraw) : null,
                oddsOver: data.oddsOver ? parseFloat(data.oddsOver) : null,
                oddsUnder: data.oddsUnder ? parseFloat(data.oddsUnder) : null,
                oddsHomeOver: data.oddsHomeOver ? parseFloat(data.oddsHomeOver) : null,
                oddsAwayOver: data.oddsAwayOver ? parseFloat(data.oddsAwayOver) : null,
                sport: data.sport,
                overUnderLine: parseFloat(data.overUnderLine),
            }
        })
        revalidatePath("/admin/matches")
        return { success: true }
    } catch (error) {
        console.error("Failed to update match:", error)
        return { success: false, error: String(error) }
    }
}

export async function resultMatch(matchId: string, resultScore: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        // Parse score "2-1" -> 2, 1
        const [scoreHomeStr, scoreAwayStr] = resultScore.split("-")
        const scoreHome = parseInt(scoreHomeStr)
        const scoreAway = parseInt(scoreAwayStr)

        if (isNaN(scoreHome) || isNaN(scoreAway)) {
            return { success: false, error: "Geçersiz skor formatı (Örn: 2-1)" }
        }

        // Determine Winners
        let winningChoiceString = "DRAW"
        if (scoreHome > scoreAway) winningChoiceString = "HOME"
        if (scoreAway > scoreHome) winningChoiceString = "AWAY"

        const totalGoals = scoreHome + scoreAway
        // We need to fetch the match first to get the line, but we are inside a transaction update in step 1.
        // Let's fetch it first or use the updated return.

        let winningOverUnder = "PENDING" // Calculated below after fetch

        await prisma.$transaction(async (tx) => {
            // 1. Get Match Info & Update Status
            // We need the 'overUnderLine' which might not be in the form input (maybe we should have passed it? No, it's in DB)
            // Ideally we fetch first.
            const match = await tx.match.update({
                where: { id: matchId },
                data: {
                    status: "ENDED",
                    result: resultScore,
                    scoreA: scoreHome,
                    scoreB: scoreAway
                }
            })

            const line = match.overUnderLine ? match.overUnderLine.toNumber() : 2.5
            winningOverUnder = totalGoals > line ? "OVER" : "UNDER"

            // 2. Find all OPEN bets
            const bets = await tx.bet.findMany({
                where: {
                    matchId: matchId,
                    status: "OPEN"
                }
            })

            // 3. Process Bets
            for (const bet of bets) {
                let isWinner = false

                // 1X2 Logic
                if (bet.choice === "HOME" || bet.choice === "AWAY" || bet.choice === "DRAW") {
                    if (bet.choice === winningChoiceString) isWinner = true
                }
                // Over/Under Logic
                else if (bet.choice === "OVER" || bet.choice === "UNDER") {
                    if (bet.choice === winningOverUnder) isWinner = true
                }
                // Team Over Logic (Home > 1.5)
                else if (bet.choice === "HOME_OVER") {
                    if (scoreHome > 1.5) isWinner = true
                }
                // Team Over Logic (Away > 1.5)
                else if (bet.choice === "AWAY_OVER") {
                    if (scoreAway > 1.5) isWinner = true
                }

                if (isWinner) {
                    // Payout
                    await tx.user.update({
                        where: { id: bet.userId },
                        data: { balance: { increment: bet.potentialPayout } }
                    })

                    // Transaction Log
                    await tx.transaction.create({
                        data: {
                            userId: bet.userId,
                            amount: bet.potentialPayout,
                            type: "BET_WIN",
                            reference: `Kazanan Bahis: ${match.teamA} vs ${match.teamB} (${bet.choice})`
                        }
                    })

                    await tx.bet.update({
                        where: { id: bet.id },
                        data: { status: "WON" }
                    })
                } else {
                    await tx.bet.update({
                        where: { id: bet.id },
                        data: { status: "LOST" }
                    })
                }
            }
        })

        revalidatePath("/admin/matches")
        return { success: true }
    } catch (error) {
        console.error("Failed to result match:", error)
        return { success: false, error: "Sonuçlandırma hatası." }
    }
}

export async function deleteMatch(matchId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        // Soft delete
        await prisma.match.update({
            where: { id: matchId },
            data: { deletedAt: new Date() }
        })
        revalidatePath("/admin/matches")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete match:", error)
        return { success: false, error: "Failed to delete match" }
    }
}

export async function restoreMatch(matchId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.match.update({
            where: { id: matchId },
            data: { deletedAt: null }
        })
        revalidatePath("/admin/matches")
        return { success: true }
    } catch (error) {
        console.error("Failed to restore match:", error)
        return { success: false, error: "Failed to restore match" }
    }
}
