"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPendingWithdrawals() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return []

    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                type: "WITHDRAW_REQUEST",
                status: "PENDING"
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        })
        return transactions
    } catch (error) {
        console.error("Failed to fetch withdrawals:", error)
        return []
    }
}

export async function approveWithdrawal(transactionId: string) {
    const session = await auth()

    if (!session?.user?.id) return { success: false, error: "Oturum açılmamış." }
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Yetkisiz işlem." }
    }

    try {
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "COMPLETED" }
        })

        revalidatePath("/admin/withdrawals")
        revalidatePath("/wallet")
        return { success: true }
    } catch (error) {
        console.error("Approve error:", error)
        return { success: false, error: "İşlem onaylanamadı." }
    }
}

export async function rejectWithdrawal(transactionId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { success: false, error: "Yetkisiz işlem." }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Transaction'ı bul
            const transaction = await tx.transaction.findUnique({
                where: { id: transactionId }
            })

            if (!transaction) throw new Error("İşlem bulunamadı.")

            // 2. Bakiyeyi iade et
            await tx.user.update({
                where: { id: transaction.userId },
                data: { balance: { increment: transaction.amount } }
            })

            // 3. Statüyü REJECTED yap
            await tx.transaction.update({
                where: { id: transactionId },
                data: { status: "REJECTED" }
            })

            // 4. İade kaydı oluştur (Opsiyonel ama iyi olur)
            await tx.transaction.create({
                data: {
                    userId: transaction.userId,
                    amount: transaction.amount,
                    type: "BET_REFUND", // veya WITHDRAW_REFUND
                    status: "COMPLETED",
                    reference: `Refund for withdrawal #${transaction.id}`
                }
            })
        })

        revalidatePath("/admin/withdrawals")
        revalidatePath("/wallet")
        return { success: true }
    } catch (error) {
        console.error("Reject error:", error)
        return { success: false, error: "İşlem reddedilemedi." }
    }
}

export async function getAllTransactions() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return []

    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 100
        })
        return transactions
    } catch (error) {
        console.error("Failed to fetch transactions:", error)
        return []
    }
}
