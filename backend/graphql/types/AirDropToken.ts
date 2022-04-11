import { timeStamp } from "console";
import { objectType, enumType , extendType} from "nexus";
import { User } from "./User";


export const AirDropToken = objectType({
    name : 'AirDrop',
    definition(t) {
        t.string('coinName')
        t.string('chainName')
        t.string('status')
        t.string('coinSymbol')
        t.int('id')
        t.field('user', {type : User})
        t.field('type' , {type : Type})
    }
})

const Type = enumType({
    name: 'Type',
    members: ['LOTTERY', 'USER_LIMITED', 'TOKEN_LIMITED'],
  })

  export const AirDropTokenQuery = extendType({
    type: 'Query',
    definition(t) {
      t.nonNull.list.field('airDrops', {
        type: 'AirDropToken',
        resolve(_parent, _args, ctx) {
          return ctx.prisma.airDrop.findMany()
        },
      })
    },
  })