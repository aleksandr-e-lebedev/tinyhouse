import { Request, Response } from 'express';

import { Database, User } from '../types';

const cookieOptions = {
  httpOnly: true,
  sameSite: true,
  signed: true,
  secure: process.env.NODE_ENV === 'development' ? false : true,
};

export const authorize = async (
  db: Database,
  req: Request,
  res: Response
): Promise<User | undefined | null> => {
  const { viewer: userId } = req.signedCookies as Record<
    string,
    string | false | undefined
  >;

  const token = req.get('X-CSRF-TOKEN');

  if (!userId || !token) {
    res.clearCookie('viewer', cookieOptions);
    return;
  }

  const viewer = await db.users.findOne({
    _id: userId,
    token,
  });

  return viewer;
};
