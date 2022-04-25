import { airDropType } from "@prisma/client";
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { verifyPassWord } from "../../functions/verify_password";
import assert from 'assert'
import { bufferToHex, ecrecover, fromRpcSig, hashPersonalMessage, publicToAddress, toBuffer } from 'ethereumjs-util'

export const DropParticipants = objectType({
    name: 'DropParticipants',
    definition(t) {
        t.int('id')
        t.int('dropId')
        t.list.string('participants')
    }
})

export const DropParticipantsQuery = extendType({
    type: 'Query',
    definition(t) {
        t.list.field('getDropParticipants', {
            type: 'DropParticipants',
            args: {
                id: nonNull(intArg()),
                wallet: nonNull(stringArg()),
                signature: nonNull(stringArg())
            },
            async resolve(_parent, _args, ctx) {



                const user = await ctx.prisma.user.findUnique(
                    {
                        where: { wallet: _args.wallet }
                    }
                )

                const msg = `I am signing my one-time nonce: ${user.nonce}`;

                const msgBuffer = toBuffer(msg);
                const msgHash = hashPersonalMessage(msgBuffer);
                const signatureBuffer = toBuffer(_args.signature);
                const signatureParams = fromRpcSig(signatureBuffer.toString());
                const publicKey = ecrecover(
                    msgHash,
                    signatureParams.v,
                    signatureParams.r,
                    signatureParams.s
                );
                const addressBuffer = publicToAddress(publicKey);
                const address = bufferToHex(addressBuffer);

                if(address.toLowerCase() === _args.wallet.toLowerCase()) {
                    return ctx.prisma.dropParticipants.findUnique(
                        {
                            where: { id: _args.id },
                        }
                    )
                } else {
                    throw new Error("Unauthorized!")
                }

                
            }
        })
    }
})

export const DropMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('enterDrop', {
            type: 'DropParticipants',
            args: {
                dropId: intArg(),
                wallet: stringArg(),
                password: stringArg()
            },
            async resolve(_parent, _args, ctx) {

                const airDrop = await ctx.prisma.airDropToken.findUnique(
                    {
                        where: { id: _args.dropId }
                    }
                )

                if (airDrop.endTime > new Date(Date.now())) {
                    throw new Error('Drop Has Ended')
                }

                if (airDrop?.status == "Cancelled") {
                    throw new Error('Drop Has Been Cancelled')
                }

                if (airDrop.type == airDropType.USER_LIMITED) {
                    const result = await verifyPassWord(_args.password, _args.dropId);

                    if (!result) {
                        throw new Error("invalid password")
                    }
                }


                return ctx.prisma.dropParticipants.create({
                    data: {
                        dropId: _args.dropId,
                    }
                })
            }
        })
    }
})