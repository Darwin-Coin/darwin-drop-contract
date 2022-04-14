import { Context } from "./context"
import { Prisma } from "@prisma/client"


export const resolvers = {
    Query: {
        airDrops: async (_parent: any, _args: any, ctx: Context, _info: any) => {
            return await ctx.prisma.airDropToken.findMany()
        },
        airDrop: async (_obj: any, args: Prisma.AirDropTokenWhereUniqueInput, context: Context, _info: any) => {
            const { id } = args

            const response = await context.prisma.airDropToken.findUnique({
                where: {
                    id,
                },
            })

            return response
        },
        myAirDrops: async (_parent: any, _args: Prisma.AirDropTokenWhereUniqueInput, ctx: Context, _info: any) => {
            const { id } = _args

            const response = await ctx.prisma.airDropToken.findUnique({
                where: {
                    id
                },
            })

            return response
        },
        users : async (_parent: any, _args: any, ctx: Context, _info: any) => {
            return await ctx.prisma.user.findMany()
        }
    },


    Mutation: {
        createAirDrop: async (_parent: any, args: Prisma.AirDropTokenCreateInput, ctx: Context, _info: any) => {

            const { coinName, chainName, coinSymbol, type, User, status, startTime, endTime } = args

            const response = await ctx.prisma.airDropToken.create({
                data: {
                    coinName,
                    chainName,
                    coinSymbol,
                    type,
                    User,
                    status,
                    startTime,
                    endTime
                }


            })

            return response
        },

        deleteAirDrop: async (_parent: any, args: Prisma.AirDropTokenWhereUniqueInput, context: Context, info: any) => {
            const { id } = args

            const response = await context.prisma.airDropToken.delete({
                where: {
                    id,
                },
            })

            return response
        },
    }



}