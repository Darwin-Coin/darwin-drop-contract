import { objectType, enumType } from "nexus";
import { AirDropToken } from "./AirDropToken";


export const User = objectType({
    name: 'User', 
    definition(t) {
        t.string('wallet')
        t.nonNull.int('id')
        t.field('role', {type: Role})
        t.list.field('airDrops', {type : AirDropToken, 
            async resolve (_parent, _args, ctx) {
            return await ctx.prisma.user.findUnique({
                where : {
                    id : _parent.id
                }
            }).airDrops()
        }
        })
    }
})

const Role = enumType({
    name: 'Role',
    members: ['USER', 'CREATOR'],
  })