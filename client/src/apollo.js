import { ApolloClient } from 'apollo-client';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from "apollo-link-ws";
import { onError } from 'apollo-link-error';

import introspectionQueryResultData from './fragmentTypes.json';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData
});

const SERVER = process.env.NODE_ENV === 'development' ? 'localhost' : '139.59.37.105';

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://${SERVER}:8080/graphql`,
  options: {
    reconnect: true
  }
});

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );

      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    }),
    wsLink,
    new HttpLink({ uri: `http://${SERVER}:8080/graphql` })
  ]),
  cache: new InMemoryCache({ fragmentMatcher })
});

export default client;
