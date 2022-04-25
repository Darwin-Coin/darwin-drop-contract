import { airDropType } from "@prisma/client";
import {extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { verifyPassWord } from "../../functions/verify_password";


export const DropParticipants = objectType({
    name : 'DropParticipants',
    definition(t) {
        t.int('id')
        t.int('dropId')
        t.list.string('participants')
    }
})

export const DropParticipantsQuery = extendType({
    type : 'Query',
    definition(t) {
        t.list.field('getDropParticipants', {
            type: 'DropParticipants',
            args: {
                id: nonNull(intArg()),
                wallet : nonNull(stringArg())
            },
            async resolve(_parent, _args, ctx) {

                const drop = await ctx.prisma.airDropToken.findUnique(
                    {
                        where : {id : _args.id}
                    }
                )

                if(drop?.ownerWallet != _args.wallet) {
                    throw new Error("Unauthorized!");
                }

    
                return ctx.prisma.dropParticipants.findUnique(
                    {
                        where: { id: _args.id },
                    } 
                )
            }
        })
    }
})

export const DropMutation = extendType({
        type : 'Mutation',
        definition(t) {
            t.nonNull.field('enterDrop', {
                type : 'DropParticipants',
                args : {
                    dropId: intArg(),
                    wallet : stringArg(),
                    password : stringArg()
                },
                async resolve(_parent, _args, ctx) {

                    const airDrop = await ctx.prisma.airDropToken.findUnique(
                        {
                            where : {id : _args.dropId}
                        }
                    )
                
                    if(airDrop.endTime > new Date(Date.now())) {
                        throw new Error('Drop Has Ended')
                    }

                    if(airDrop?.status == "Cancelled") {
                        throw new Error('Drop Has Been Cancelled')
                    }

                    if(airDrop.type  == airDropType.USER_LIMITED) {
                       const result = await verifyPassWord(_args.password, _args.dropId);

                       if(!result) {
                            throw new Error("invalid password")
                       } 
                    }


                    return ctx.prisma.dropParticipants.create({
                        data : {
                            dropId : _args.dropId,
                        }
                    })
                }
            })
        }
})