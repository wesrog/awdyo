import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from "@apollo/client/link/ws";
import { HttpLink } from "@apollo/client/link/http"
import { getMainDefinition } from '@apollo/client/utilities';
import { split } from '@apollo/client';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000'
})

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true
  }
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink
)

export default new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      console.log('connect...');
    },
    onDisconnect: (webSocket, context) => {
      console.log('disconnect...');
    },
  },
});