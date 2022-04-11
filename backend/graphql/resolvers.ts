import { AirDropToken } from "@prisma/client"

export const resolvers = {
    Query : {
        airDrops: (_parent: any, _args: any, ctx: { prisma: { airDrops: { findMany: () => [AirDropToken] } } }) => {
            return  ctx.prisma.airDrops.findMany()
        }
    }
}