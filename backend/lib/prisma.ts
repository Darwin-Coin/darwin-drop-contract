import { PrismaClient } from '@prisma/client'



declare global {
    var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
    
}

export default prisma