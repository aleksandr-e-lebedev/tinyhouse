import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';

import { connectDatabase } from './database';
import { typeDefs, resolvers } from './graphql';

const port = process.env.PORT || 9000;

const mount = async (app: Application) => {
  const db = await connectDatabase();

  app.use(cookieParser(process.env.COOKIE_SECRET));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ db, req, res }),
  });

  server.applyMiddleware({ app, path: '/api' });
  app.listen(port);

  console.log(`[app]: http://localhost:${port}`);
};

void mount(express());
