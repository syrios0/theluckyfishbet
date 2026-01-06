const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // 1. Get User
    const user = await prisma.user.findFirst({
        where: { username: "TestOyuncu" }
    })

    // 2. Get Match (Any match)
    const match = await prisma.match.findFirst()

    if (!user || !match) {
        console.log("Kullanıcı veya Maç bulunamadı.")
        return
    }

    // 3. Place Bet
    const bet = await prisma.bet.create({
        data: {
            userId: user.id,
            matchId: match.id,
            amount: 100.00,
            choice: "HOME", // User selects HOME Team (1)
            status: "OPEN",
            potentialPayout: 100.00 * parseFloat(match.oddsA)
        }
    })

    // Deduct Balance
    await prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: 100.00 } }
    })

    console.log('Bahis oluşturuldu:', bet)
    console.log('Kullanıcı bakiyesi düşüldü.')
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
