'use client';

import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from '../contexts/AuthContext';
import client from '../lib/apollo-client';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ApolloProvider client={client}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}