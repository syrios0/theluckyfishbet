const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        const user = await prisma.user.create({
            data: {
                username: 'TestOyuncu',
                balance: 1000.00,
                role: "USER"
            },
        })
        console.log('Test kullanıcısı oluşturuldu:', user)
    } catch (e) {
        if (e.code === 'P2002') {
            console.log('Test kullanıcısı zaten mevcut.')
        } else {
            console.error(e)
        }
    } finally {
        await prisma.$disconnect()
    }
}

main()
