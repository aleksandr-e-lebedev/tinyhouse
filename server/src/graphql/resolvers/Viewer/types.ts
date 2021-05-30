export interface LogInWithGoogleArgs {
  input: {
    code: string;
  };
}

export interface ConnectStripeArgs {
  input: {
    code: string;
  };
}

export interface GoogleUserDetails {
  id: string;
  name: string;
  avatar: string;
  email: string;
}
