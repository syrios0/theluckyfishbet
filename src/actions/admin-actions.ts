"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getAdminStats() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return null
    }

    try {
        const [
            totalUserBalance,
            activeMatchesCount,
            totalBetsCount,
            pendingWithdrawalsCount,
            recentBets,
            recentUsers,
            // New Stats
            totalDeposits,
            totalWithdrawals,
            totalWonBetsPayout,
            totalBetStakes
        ] = await Promise.all([
            // 1. Total User Balance
            prisma.user.aggregate({ _sum: { balance: true } }),
            // 2. Active Matches
            prisma.match.count({
                where: { status: { in: ["PENDING", "LIVE"] }, deletedAt: null }
            }),
            // 3. Total Bets
            prisma.bet.count(),
            // 4. Pending Withdrawals
            prisma.transaction.count({
                where: { type: "WITHDRAW_REQUEST", status: "PENDING" }
            }),
            // 5. Recent Bets
            prisma.bet.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { username: true } },
                    match: { select: { teamA: true, teamB: true } }
                }
            }),
            // 6. Recent Users
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { username: true, createdAt: true, balance: true }
            }),
            // 7. Total Deposits
            prisma.transaction.aggregate({
                where: { type: "DEPOSIT", status: "COMPLETED" },
                _sum: { amount: true }
            }),
            // 8. Total Withdrawals
            prisma.transaction.aggregate({
                where: { type: { in: ["WITHDRAW_COMPLETED", "WITHDRAW_REQUEST"] }, status: { in: ["COMPLETED", "PENDING"] } }, // Including pending for visibility if needed, or strictly completed. Let's stick to COMPLETED for actual flow.
                _sum: { amount: true }
            }),
            // 9. Total Won Payouts (Cost to House)
            prisma.bet.aggregate({
                where: { status: "WON" },
                _sum: { potentialPayout: true }
            }),
            // 10. Total Staked (Revenue to House)
            prisma.bet.aggregate({
                _sum: { amount: true }
            })
        ])

        const houseRevenue = totalBetStakes._sum.amount ? Number(totalBetStakes._sum.amount) : 0
        const houseCost = totalWonBetsPayout._sum.potentialPayout ? Number(totalWonBetsPayout._sum.potentialPayout) : 0
        const netHouseProfit = houseRevenue - houseCost

        const totalDeps = totalDeposits._sum.amount || 0
        const totalWds = totalWithdrawals._sum.amount || 0

        return {
            totalUserBalance: totalUserBalance._sum.balance || 0,
            activeMatchesCount,
            totalBetsCount,
            pendingWithdrawalsCount,
            recentBets,
            recentUsers,
            netHouseProfit,
            totalDeposits: totalDeps,
            totalWithdrawals: totalWds
        }
    } catch (error) {
        console.error("Failed to fetch admin stats:", error)
        return null
    }
}
