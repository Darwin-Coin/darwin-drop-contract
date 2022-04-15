import { arg, extendType, intArg, nonNull, objectType } from "nexus";
import { User } from "./User";

export const DropParticipants = objectType({
    name : 'DropParticipants',
    definition(t) {
        t.int('id')
        t.int('dropId')
        t.list.field('participants', {
            type : 'User', 
            resolve : (parent, _, ctx) => {
                return ctx.prisma.user.findMany()
            }
        })
    }
})

export const DropQuery = extendType({
    type : 'Query',
    
    definition(t) {
        t.list.field('getDropParticipants', {
            type: 'String',
            args: {
                id: nonNull(intArg()),
            },
            resolve(_parent, _args, ctx) {
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
                type : 'String',
                args : {
                    dropId: intArg(),
                }
            })
        }
})