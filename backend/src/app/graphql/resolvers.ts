import { context, Context } from "./context"
import { Prisma } from "@prisma/client"
import { argsToArgsConfig } from "graphql/type/definition"


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
        },
        user : async (_parent: any, _args: Prisma.DropDetailsWhereUniqueInput, ctx: Context, _info: any) => {
            
            const {id} = _args;

            const result = await ctx.prisma.user.findUnique({
                where : {
                    id
                }
            })

            return result;

        },

        getDropperChain : async (_parent: any, _args: Prisma.AirDropTokenWhereInput, ctx: Context, _info: any) => {
            const {chainName} = _args;

            const result = await ctx.prisma.airDropToken.findMany({
                where : {
                   chainName 
                }
            })

            return result;
        },


        getDropParticipants : async (_parent: any, _args: Prisma.DropParticipantsWhereUniqueInput, ctx: Context, _info: any) => {

            const {dropId} = _args;

            const result = await ctx.prisma.dropParticipants.findUnique({
                where : {
                    id : dropId
                }
            })

            return result;
        },

        getDropDetails : async (_parent: any, _args: Prisma.DropDetailsWhereUniqueInput, ctx: Context, _info: any) => {
            const  {dropId} = _args;

            const result = await context.prisma.dropDetails.findUnique({
                where : {
                    dropId
                }
            })


            return result;
        }
    },


    Mutation: {
        // createAirDrop: async (_parent: any, args: Prisma.AirDropTokenCreateInput, ctx: Context, _info: any) => {

        //     const { coinName, chainName, coinSymbol, type, status, startTime, endTime, requirementType, maxNumber} = args

        //     const response = await ctx.prisma.airDropToken.create({
        //         data: {
        //             coinName,
        //             chainName,
        //             coinSymbol,
        //             type,
        //             requirementType,
        //             status,
        //             startTime,
        //             endTime,
        //             maxNumber
        //         }


        //     })

        //     return response
        // },

        deleteAirDrop: async (_parent: any, args: Prisma.AirDropTokenWhereUniqueInput, context: Context, info: any) => {
            const { id } = args

            const response = await context.prisma.airDropToken.delete({
                where: {
                    id,
                },
            })

            return response
        },

        createUser : async (_parent : any, args : Prisma.UserCreateInput, context : Context, info : any) => {

            const  {wallet} = args;
            const response = await context.prisma.user.create({
                data : {
                    wallet 
                }
            })

            return response;
        },

       enterDropDetails : async (_parent :any, args : Prisma.DropDetailsCreateInput, context : Context, info : any) => {

        const {logo, website, socials, description, steps, drop} = args;

        await context.prisma.dropDetails.create({
            data : {
                website,
                logo,
                socials,
                description,
                steps,
                drop
            }
        })
       },

       enterDropParticipants : async (_parent: any, _args: Prisma.DropParticipantsCreateInput, ctx: Context, _info: any) => {
           const {participants, drop} = _args;

           const response = await ctx.prisma.dropParticipants.create({
               data : {
                   participants : participants,
                   drop : drop
               }
           })

           return response;
       }
    }

   

}
