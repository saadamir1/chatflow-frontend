import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  ApolloLink,
  from,
} from "@apollo/client";
import { onError } from '@apollo/client/link/error';
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from "@apollo/client/utilities";

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: "http://localhost:3001/graphql",
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:3001/graphql',
    connectionParams: () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
  })
);

// Auth link to add JWT token to requests
const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Refresh token handling
let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (token) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

async function refreshAccessToken() {
  if (isRefreshing) {
    return new Promise((resolve) => {
      pendingRequests.push(resolve);
    });
  }
  isRefreshing = true;
  try {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch('http://localhost:3001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `mutation RefreshToken($refreshTokenInput: RefreshTokenInput!) {\n  refreshToken(refreshTokenInput: $refreshTokenInput) {\n    access_token\n    refresh_token\n  }\n}`,
        variables: { refreshTokenInput: { refreshToken } },
      }),
    });
    const result = await response.json();
    const tokens = result?.data?.refreshToken;
    if (!tokens?.access_token) throw new Error('Refresh failed');
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
    }
    resolvePendingRequests(tokens.access_token);
    return tokens.access_token;
  } catch (e) {
    resolvePendingRequests(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      try { window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: 'Session expired. Please sign in again.' } })); } catch {}
      window.location.href = '/';
    }
    throw e;
  } finally {
    isRefreshing = false;
  }
}

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const isUnauthorized =
    (networkError && networkError.statusCode === 401) ||
    (graphQLErrors && graphQLErrors.some((e) => String(e.message).toLowerCase().includes('unauthorized')));

  if (!isUnauthorized) return;

  return new ApolloLink((op, fwd) => {
    return new Promise((resolve, reject) => {
      refreshAccessToken()
        .then((newAccessToken) => {
          if (!newAccessToken) {
            reject(new Error('Unable to refresh'));
            return;
          }
          const oldHeaders = op.getContext().headers || {};
          op.setContext({
            headers: {
              ...oldHeaders,
              authorization: `Bearer ${newAccessToken}`,
            },
          });
          const sub = fwd(op).subscribe({
            next: resolve,
            error: reject,
            complete: () => {},
          });
        })
        .catch(reject);
    });
  }).request(operation, forward);
});

// Split link - use WebSocket for subscriptions, HTTP for queries/mutations
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  from([errorLink, authLink, httpLink])
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
