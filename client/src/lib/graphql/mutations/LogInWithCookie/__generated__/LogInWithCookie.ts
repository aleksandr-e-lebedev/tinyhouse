/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: LogInWithCookie
// ====================================================

export interface LogInWithCookie_logInWithCookie {
  __typename: "Viewer";
  id: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}

export interface LogInWithCookie {
  logInWithCookie: LogInWithCookie_logInWithCookie;
}
