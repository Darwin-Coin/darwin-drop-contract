import { ApolloServer } from 'apollo-server'
import { schema } from './graphql/schema'
import { context } from './graphql/context'

const server = new ApolloServer({
  schema,
  context,
  introspection: true,                                      // 1 
})

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`graphql api running at ${url}graphql`)
})


