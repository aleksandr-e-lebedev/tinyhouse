import { Request, Response } from 'express';
import { promisify } from 'util';
import jwt, { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';

import { NODE_ENV, JWT_SECRET, JWT_DURATION } from '../../config';
import { Database, User } from '../types';

interface JwtPayload {
  viewerId: string;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: true,
  secure: NODE_ENV === 'development' ? false : true,
};

export const createJwt = async (viewerId: string): Promise<string> => {
  const sign = promisify<JwtPayload, Secret, SignOptions, string>(jwt.sign);
  const token = await sign({ viewerId }, JWT_SECRET, {
    expiresIn: JWT_DURATION,
  });

  return token;
};

export const getJwtPayload = async (token: string): Promise<JwtPayload> => {
  const verify = promisify<
    string,
    Secret,
    VerifyOptions | undefined,
    JwtPayload
  >(jwt.verify);

  const payload = await verify(token, JWT_SECRET, undefined);

  return payload;
};

export const authorize = async (
  db: Database,
  req: Request,
  res: Response
): Promise<User | undefined | null> => {
  const { jwt } = req.cookies as Record<string, string | undefined>;
  const token = req.get('X-CSRF-TOKEN');

  if (!jwt || !token) {
    res.clearCookie('jwt', cookieOptions);
    return;
  }

  const { viewerId } = await getJwtPayload(jwt);

  const viewer = await db.users.findOne({
    _id: viewerId,
    token,
  });

  return viewer;
};
