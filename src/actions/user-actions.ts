"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUsers(query?: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return []
    }

    try {
        const users = await prisma.user.findMany({
            where: query ? {
                username: { contains: query }
            } : undefined,
            orderBy: { createdAt: 'desc' }
        })
        return users
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return []
    }
}

export async function getUser(userId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return null
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                bets: {
                    include: {
                        match: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })
        return user
    } catch (error) {
        console.error("Failed to fetch user:", error)
        return null
    }
}

export async function updateUserRole(userId: string, role: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        })
        revalidatePath("/admin/users")
        revalidatePath(`/admin/users/${userId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update user role:", error)
        return { success: false, error: "Failed to update role" }
    }
}
