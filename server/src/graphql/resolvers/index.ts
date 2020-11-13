import { IResolvers } from 'apollo-server-express';
import merge from 'lodash.merge';

import { listingResolvers } from './Listings';

export const resolvers = merge(listingResolvers) as IResolvers;
