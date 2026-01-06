const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Veritabanı şeması senkronize ediliyor...')

    try {
        // 1. Şemayı veritabanına uygula (npx prisma db push)
        // stdio: 'inherit' ile çıktıyı konsolda göster
        execSync('npx prisma db push', { stdio: 'inherit' })
        console.log('✅ Veritabanı şeması güncellendi.')
    } catch (error) {
        console.error('❌ Şema güncellenirken hata oluştu. Lütfen Docker/Postgres bağlantınızı kontrol edin.')
        console.error(error.message)
        return
    }

    console.log('\n👤 Admin kullanıcısı kontrol ediliyor...')

    // 2. Admin kullanıcısını oluştur veya güncelle
    const adminUsername = 'admin'

    try {
        const existingAdmin = await prisma.user.findUnique({
            where: { username: adminUsername }
        })

        if (!existingAdmin) {
            await prisma.user.create({
                data: {
                    username: adminUsername,
                    role: 'ADMIN',
                    balance: 100000.00 // Test için yüksek bakiye
                }
            })
            console.log('✅ Admin hesabı oluşturuldu (Kullanıcı: admin, Rol: ADMIN, Bakiye: 100,000)')
        } else {
            // Eğer admin varsa rolünü ve bakiyesini güncelle (garanti olsun diye)
            if (existingAdmin.role !== 'ADMIN') {
                await prisma.user.update({
                    where: { username: adminUsername },
                    data: { role: 'ADMIN' }
                })
                console.log('✅ Mevcut "admin" kullanıcısına ADMIN yetkisi verildi.')
            } else {
                console.log('ℹ️ Admin kullanıcısı zaten mevcut.')
            }
        }

    } catch (error) {
        console.error('❌ Admin kullanıcısı işlemleri sırasında hata:', error.message)
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
