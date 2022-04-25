import { extendType, intArg, objectType, stringArg } from "nexus";
import { generatePassword } from "../../functions/random_password_generator";
export const PasswordProtected = objectType({
    name : 'PasswordProtected',
    definition(t) {
        t.int('id')
        t.int('dropId')
        t.list.field('passwords', {
            type : 'String',
        })
        t.field('airDrop', {
            type : 'AirDropToken',
            resolve : (_parent,_args,  ctx) => {
                ctx.prisma.passwordProtected.findUnique({
                    where: { id: _parent.id || undefined },
                }).airDrop()
            }
        })
    }
})


export const getPasswordsQuery = extendType({
    type: 'Query',
    definition(t) {
        t.list.string('getPasswords', {
            args : {
                wallet:  stringArg(),
                dropId : intArg()
              },
              async resolve(_parent, _args, ctx) { 

                const user = await ctx.prisma.user.findUnique(
                    {
                        where : {wallet : _args.wallet}
                    }
                )
            
                if(user?.wallet != _args.wallet) {
                    throw new Error("Unauthorized!");
                }

                return await ctx.prisma.passwordProtected.findUnique({
                    where : {
                        dropId : _args.dropId
                    }
                })
              }

              
              
        })

        
    }
})

