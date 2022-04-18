import { objectType, enumType, extendType, intArg, nonNull, stringArg, arg } from "nexus";


export const User = objectType({
    name: 'User', 
    definition(t) {
        t.string('wallet')
        t.nonNull.int('id')
        t.field('role', {type: Role})
        
    }
})

const Role = enumType({
    name: 'Role',
    members: ['USER', 'CREATOR'],
  })


  export const UserQuery = extendType({
      type : 'Query',
      definition(t) {
          t.list.field('users', {
              type: 'User',
              resolve(_parent, _args, ctx) {
                return ctx.prisma.user.findMany()
              }
          })

          t.field('getUser', {
            type : 'User',
            args: {
              id: nonNull(intArg()),
          },
          resolve(_parent, _args, ctx) {
            return ctx.prisma.user.findUnique(
              {
                where: { id: _args.id },
              }
            )
          },
          })
      }

  })

  
