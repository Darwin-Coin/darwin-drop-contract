import { objectType, enumType, extendType, nonNull, intArg, stringArg, arg } from "nexus";
;


export const AirDropToken = objectType({
    name: 'AirDropToken',
    definition(t) {
        t.string('coinName')
        t.string('chainName')
        t.string('status')
        t.string('coinSymbol')
        t.string('chainId')
        t.int('maxNumber')
        t.nonNull.int('id')
        t.nonNull.int('userId')
        t.field('User', {
            type : 'User',
            resolve : (parent, _, ctx) => {
                return ctx.prisma.airDropToken
                .findUnique({
                    where: { id: parent.userId || undefined },
                })
                .User();
            }
        })
        t.field('type', { type: DropType })
        t.field('requirementType', { type: requirementType })
    }
})


export const AirDropQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('getDrops', {
      type : 'AirDropToken',
      resolve(_parent, _args, ctx) {
        return ctx.prisma.airDropToken.findMany()
      },
    })

    t.list.field('getTokensByChain', {
      type : 'AirDropToken',
      args: {
        chainId: nonNull(stringArg()),
    },
     resolve(_parent, _args, ctx) {
      return ctx.prisma.airDropToken.findUnique(
        {
          where: { chainId: _args.chainId},
        }
      )
    },
    }),

    t.field('getAirDrop', {
      type : 'AirDropToken',
      args: {
        id: nonNull(intArg()),
    },
    resolve(_parent, _args, ctx) {
      return ctx.prisma.airDropToken.findUnique(
        {
          where: { id: _args.id },
        }
      )
    },
    })

    t.list.field('getMyDrops', {type : 'AirDropToken', 
    args: {
      id: nonNull(intArg()),
      wallet : nonNull(stringArg())
    },
    async resolve(_parent, _args, ctx) { 

      const user = await ctx.prisma.user.findUnique(
        {
            where : {id : _args.id}
        }
    )

    if(user?.wallet != _args.wallet) {
        throw new Error("Unauthorized!");
    }
      return ctx.prisma.airDropToken.findUnique(
        {
          where: { id: _args.id },
        }
      )
    }
  })
  }
})






const DropType = enumType({
    name: 'Type',
    members: ['LOTTERY', 'USER_LIMITED', 'TOKEN_LIMITED'],
})



const requirementType = enumType({
    name: 'RequirementType',
    members: ['TOKEN_REQUIRED',
        'NFT_REQUIRED',
        'PASSWORD'],
})

// export const AirDropMutation = extendType({
//   type: 'Mutation',
//   definition(t) {
//     // t.nonNull.field('createAirDropToken', {
//     //   type : 'AirDropToken',
//     //   args : {
//     //     coinName :  nonNull(stringArg()),
//     //     chainName :  nonNull(stringArg()),
//     //     coinSymbol :  nonNull(stringArg()),
//     //     status :  nonNull(stringArg()),
//     //     userId : intArg(),
//     //     maxNumber : intArg(),
//     //     startTime : nonNull(stringArg()),
//     //     endTime : nonNull(stringArg()),
//     //     type : arg({
//     //       type : DropType
//     //     }),
//     //     requirementType : arg({
//     //       type : requirementType
//     //     }),
//     //   },
//     //   resolve(_parent, _args, ctx) {
//     //     return ctx.prisma.airDropToken.create(
//     //       {
//     //         data : {
//     //           chainName : _args.chainName,
//     //           coinName : _args.coinName,
//     //           coinSymbol : _args.coinSymbol,
//     //           userId : _args.userId,
//     //           status : _args.status,
//     //           maxNumber : _args.maxNumber,
//     //           endTime : new Date(_args.endTime),
//     //           startTime : new Date(_args.startTime),
//     //           type : _args.type,
//     //           requirementType : _args.requirementType
//     //         }
//     //       }
//     //     )
//     //   }
//     // })
//     t.nonNull.field('cancelAirDrop', {
//       type : 'AirDropToken',
//       args : {
//         id : nonNull(intArg()),
//         wallet : nonNull(stringArg())
//       },
//       resolve(_parent, _args, ctx) {
//         return ctx.prisma.airDropToken.update(
//           {
//             where: { id: _args.id },
//             data : {
//               status : 'Cancelled'
//             }
//           }
//         )
//       }
//     })
//     // t.field('deleteDropToken', {
//     //   type: 'AirDropToken',
//     //         args: {
//     //             id: nonNull(intArg()),
//     //         },
//     //         resolve(_parent, _args, ctx) {
//     //           return ctx.prisma.airDropToken.delete({
//     //             where: { id: _args.id },
//     //           })
//     //         }
//     // })
//   }
// })

