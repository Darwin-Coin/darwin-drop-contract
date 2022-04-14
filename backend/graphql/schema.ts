// /graphql/schema.ts
import { AirDropToken, User, airDropType} from '@prisma/client'
import { makeSchema } from 'nexus'
import { join } from 'path'
import * as types from '../types'

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(process.cwd(), 'node_modules', '@types', 'nexus-typegen', 'index.d.ts'),
    schema: join(process.cwd(), 'graphql', 'schema.graphql'),
  },
  contextType: {
    export: 'Context',
    module: join(process.cwd(), 'graphql', 'context.ts'),
  },
})

type Query = {
    airDrops : [AirDropToken]
    airDrop (id: number): AirDropToken
    users : [User]
    user (id : number) : User
    myAirDrops (userId : number) : [AirDropToken]
}

type Mutation = {
  createAirDrop(coinName : String, chainName : String, status : String, startTime : Date, endTime : Date, coinSymbol : String, userId : number, type : airDropType) : AirDropToken
  deleteAirDrop(id : String) : AirDropToken
  createUser(wallet : String) : User
}