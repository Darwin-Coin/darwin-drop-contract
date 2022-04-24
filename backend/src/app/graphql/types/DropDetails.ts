import { extendType, intArg, list, nonNull, objectType, stringArg } from "nexus";


export const DropDetails = objectType({
    name : 'DropDetails',
    definition(t) {
        t.int('id'),
        t.int('dropId'),
        t.field('drop', {
            type : 'AirDropToken',
            resolve : (parent, _, ctx) => {
                return ctx.prisma.dropDetails
                .findUnique({
                    where: { id: parent.dropId || undefined },
                })
            }
        }),
        t.string('website'),
        t.string('logo'),
        t.string('steps')
        t.string('description')
        t.list.string('socials')
    }
})

export const GetDropDetailsQuery = extendType({
    type : 'Query',
    definition(t) {
        t.field('getDropDetails', {
            type : 'DropDetails',
            args : {
                id: nonNull(intArg()),
            },
            resolve(_parent, _args, ctx) {
                return ctx.prisma.dropDetails.findUnique({
                    where: { id: _args.id },
                })
            }
        })
    }
})

export const DropDetailsMutation = extendType({
    type : 'Mutation',
    definition(t) {
        t.nonNull.field('enterDropDetails', {
            type : 'DropDetails',
            args : {
                dropId : intArg(),
                website : stringArg(),
                logo : stringArg(),
                description : stringArg(),
                steps: stringArg(),
                socials : list(stringArg())

            },
            resolve(_parent, _args, ctx) {
                return ctx.prisma.dropDetails.create({
                    data : {
                        dropId : _args.dropId,
                        website : _args.website,
                        logo : _args.llogo,
                        socials : _args.socials,
                        steps: _args.steps,
                        description : _args.description
                    }
                })
            }
        }),
        t.nonNull.field('updateDropDetails', {
            type : 'DropDetails',
            args : {
                dropId : intArg(),
                website : stringArg(),
                logo : stringArg(),
                description : stringArg(),
                steps: stringArg(),
                socials : list(stringArg())

            },
            resolve(_parent, _args, ctx) {
                return ctx.prisma.dropDetails.update({
                        where : {
                        dropId : _args.dropId
                    },
                    data : {
                        dropId : _args.dropId,
                        website : _args.website,
                        logo : _args.llogo,
                        socials : _args.socials,
                        steps: _args.steps,
                        description : _args.description
                    }
                })
            }
        })
    }
})