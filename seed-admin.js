const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const userId = "mock-user-uuid-123" // The ID returned by auth.ts Mock Provider

    try {
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                username: "admin",
                balance: 10000.00, // Give admin plenty of money for testing
                role: "ADMIN"
            }
        })
        console.log('Admin kullanıcısı (Mock) hazırlandı:', user)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
