const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Misafir hesapları oluşturuluyor...')

    const guests = [
        { username: 'Misafir_1', balance: 5000.00 },
        { username: 'Misafir_2', balance: 5000.00 },
        { username: 'Misafir_3', balance: 5000.00 },
        { username: 'Misafir_4', balance: 5000.00 },
        { username: 'Misafir_5', balance: 5000.00 },
    ]

    for (const guest of guests) {
        try {
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { username: guest.username }
            })

            if (!existingUser) {
                const user = await prisma.user.create({
                    data: {
                        username: guest.username,
                        balance: guest.balance,
                        role: "USER"
                    }
                })
                console.log(`✅ Oluşturuldu: ${user.username} (ID: ${user.id})`)
            } else {
                console.log(`⚠️ Zaten var: ${guest.username}`)
            }
        } catch (e) {
            console.error(`❌ Hata (${guest.username}):`, e.message)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
