import { extendType, intArg, objectType } from "nexus";
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


export const PasswordMutation = extendType({
    type : 'Mutation', 
        definition(t) {
            t.nonNull.field('generatePasswords', {
                type : 'String',
                args : {
                    participants : intArg(),
                    dropId : intArg()
                },
                resolve(_parent, _args, ctx) {
                    const passwords = generatePassword(_args.participants)
                
                    return ctx.prisma.passwordProtected.create({
                        data : {
                            passwords : _args.passwords,
                            dropId : _args.dropId
                        }
                    })
                }
            })
        }
    
})