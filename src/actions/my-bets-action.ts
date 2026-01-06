"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getMyBets() {
    const session = await auth()
    if (!session?.user?.id) {
        return []
    }

    try {
        const bets = await prisma.bet.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                match: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return bets
    } catch (error) {
        console.error("Failed to fetch my bets:", error)
        return []
    }
}
