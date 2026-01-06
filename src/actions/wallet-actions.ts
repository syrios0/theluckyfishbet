"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Dev ortamı için varsayılan test ID
const FLEECA_GATEWAY_ID = process.env.FLEECA_GATEWAY_ID || "G-TEST-12345"

export async function getTransactions() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: session.user.id },
            orderBy: { timestamp: 'desc' }
        })
        return transactions
    } catch (error) {
        console.error("Failed to fetch transactions:", error)
        return []
    }
}

export async function getUserBalance() {
    const session = await auth()
    if (!session?.user?.id) return 0

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { balance: true }
        })
        return user?.balance?.toNumber() || 0
    } catch (error) {
        console.error("Failed to fetch balance:", error)
        return 0
    }
}

export async function createDepositLink(amount: number) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Oturum açmanız gerekiyor." }
    }

    if (amount < 100) {
        return { success: false, error: "Minimum yatırım tutarı $100'dır." }
    }

    // Fleeca Gateway URL oluşturma
    // Format: https://banking-tr.gta.world/gateway/<GATEWAY_ID>/0/<AMOUNT>?orderId=<ORDER_ID>&userId=<USER_ID>

    // Geçici bir işlem kaydı oluşturabiliriz veya direkt yönlendirebiliriz.
    // Güvenlik için önce PENDING bir transaction oluşturalım.

    try {
        // Not: Fleeca'dan dönüşte bu işlemi güncelleyeceğiz.
        // Şimdilik URL'i oluşturup dönüyoruz.
        const orderId = Math.random().toString(36).substring(7).toUpperCase()

        const gatewayUrl = `https://banking-tr.gta.world/gateway/${FLEECA_GATEWAY_ID}/0/${amount}?orderId=${orderId}&userId=${session.user.id}`

        return { success: true, url: gatewayUrl }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Ödeme linki oluşturulamadı." }
    }
}

export async function createWithdrawRequest(amount: number, iban: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Oturum açmanız gerekiyor." }
    }

    if (amount < 100) {
        return { success: false, error: "Minimum çekim tutarı $100'dır." }
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (!user || user.balance.toNumber() < amount) {
            return { success: false, error: "Yetersiz bakiye." }
        }

        await prisma.$transaction(async (tx) => {
            // 1. Bakiyeyi düş
            await tx.user.update({
                where: { id: session.user.id },
                data: { balance: { decrement: amount } }
            })

            // 2. Talep oluştur
            await tx.transaction.create({
                data: {
                    userId: session.user.id,
                    amount: amount,
                    type: "WITHDRAW_REQUEST",
                    status: "PENDING",
                    reference: `IBAN: ${iban}`
                }
            })
        })

        revalidatePath("/wallet")
        return { success: true }
    } catch (error) {
        console.error("Withdraw error:", error)
        return { success: false, error: "Çekim talebi oluşturulamadı." }
    }
}
