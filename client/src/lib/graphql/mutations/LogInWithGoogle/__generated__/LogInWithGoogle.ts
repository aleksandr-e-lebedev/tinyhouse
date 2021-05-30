/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogInWithGoogleInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: LogInWithGoogle
// ====================================================

export interface LogInWithGoogle_logInWithGoogle {
  __typename: "Viewer";
  id: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}

export interface LogInWithGoogle {
  logInWithGoogle: LogInWithGoogle_logInWithGoogle;
}

export interface LogInWithGoogleVariables {
  input: LogInWithGoogleInput;
}
