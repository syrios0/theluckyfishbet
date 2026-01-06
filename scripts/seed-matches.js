const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Maçlar oluşturuluyor...')

    // Temizle (İsteğe bağlı, çakışmayı önlemek için)
    // await prisma.match.deleteMany({})

    const matches = [
        {
            teamA: 'Los Santos Panic',
            teamALogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Los_Angeles_Lakers_logo.svg/1200px-Los_Angeles_Lakers_logo.svg.png',
            teamB: 'Liberty City Penetrators',
            teamBLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/New_York_Knicks_logo.svg/1200px-New_York_Knicks_logo.svg.png',
            startTime: new Date(Date.now() + 3600000), // 1 saat sonra
            sport: 'BASKETBALL',
            overUnderLine: 210.5,
            status: 'PENDING',
            oddsA: 1.85,
            oddsB: 2.10,
            oddsOver: 1.90,
            oddsUnder: 1.90
        },
        {
            teamA: 'Galatasaray',
            teamALogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Galatasaray_Star_Logo.svg/1200px-Galatasaray_Star_Logo.svg.png',
            teamB: 'Fenerbahçe',
            teamBLogo: 'https://upload.wikimedia.org/wikipedia/tr/thumb/8/86/Fenerbah%C3%A7e_SK.png/1200px-Fenerbah%C3%A7e_SK.png',
            startTime: new Date(Date.now() + 7200000), // 2 saat sonra
            sport: 'FOOTBALL',
            overUnderLine: 2.5,
            status: 'PENDING',
            oddsA: 2.30,
            oddsB: 2.80,
            oddsDraw: 3.10,
            oddsOver: 1.70,
            oddsUnder: 2.10,
            oddsBothTeamsScoreYes: 1.65,
            oddsBothTeamsScoreNo: 2.20
        },
        {
            teamA: 'Real Madrid',
            teamALogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
            teamB: 'Barcelona',
            teamBLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png',
            startTime: new Date(Date.now() - 86400000), // Dün (Tamamlanmış gibi yapalım veya pending kalsın)
            sport: 'FOOTBALL',
            overUnderLine: 3.5,
            status: 'ENDED',
            result: '3-1',
            scoreA: 3,
            scoreB: 1,
            oddsA: 2.10,
            oddsB: 3.40,
            oddsDraw: 3.50
        }
    ]

    for (const match of matches) {
        await prisma.match.create({
            data: match
        })
    }

    console.log(`✅ ${matches.length} maç veritabanına eklendi.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
