const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin', 10)
  const user = await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: { login: 'admin', password: hash, role: 'admin' }
  })
  console.log('Admin user ready:', user.login, '| role:', user.role)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
