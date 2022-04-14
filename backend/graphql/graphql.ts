import { ApolloServer } from 'apollo-server';
import { schema } from './schema'
import { resolvers } from './resolvers';
import { createContext } from './context';


const server = new ApolloServer({
  schema,
  resolvers,
  context: createContext,
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});