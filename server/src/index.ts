import express, { Application } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';

import { NODE_ENV, PORT } from './config';
import { connectDatabase } from './database';
import { typeDefs, resolvers } from './graphql';

const mount = async (app: Application) => {
  const db = await connectDatabase();

  if (NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/build')));

    app.get('/*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
    });
  }

  app.use(cookieParser());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ db, req, res }),
  });

  server.applyMiddleware({
    app,
    path: '/api',
    bodyParserConfig: { limit: '2mb' },
  });

  app.listen(PORT, () => {
    console.log(`[app]: http://localhost:${PORT}`);
  });
};

void mount(express());
