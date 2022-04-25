import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    await prisma.user.create({
        data : {
            wallet : '0x696958A7f7AFB33F7B6ccA1273719A129Bf6dB5Ctfg'
        }
    })


    await prisma.airDropToken.create({
        data : {
            chainName : 'Polygon',
            coinName : 'Matic',
            type : 'LOTTERY',
            maxNumber : 2,
            requirementType : 'TOKEN_REQUIRED',  
            status : 'active',
            coinSymbol: 'MATIC',
            chainId : 'BNB',
            startTime : new Date(1478708162022),
            endTime : new Date(1478708162022)
        }
    })

    await prisma.airDropToken.create({
      data : {
          chainName : 'Mainnet',
          coinName : 'Matic',
          type : 'USER_LIMITED',
          status : 'active',
          maxNumber : 2,
          chainId : 'BNB',
          requirementType : 'NFT_REQUIRED',
          coinSymbol: 'MATIC',
          startTime : new Date(1478708162022),
          endTime : new Date(1478708162022)
      }
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })