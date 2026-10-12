/**
 * Authentication seam.
 *
 * There is intentionally NO working implementation in this build: no credentials
 * are checked, stored or sent anywhere. Both methods reject with
 * `NotConnectedError`, and the screens present that honestly.
 *
 * When Supabase arrives, implement `AuthService` with supabase.auth and export it
 * from `src/services/index.ts`. Keys belong in EXPO_PUBLIC_* env vars for the
 * public anon key only. Never put a service-role key in the app.
 */
export class NotConnectedError extends Error {
  constructor(feature = 'Accounts') {
    super(`${feature} are not connected yet.`);
    this.name = 'NotConnectedError';
  }
}

export interface SignInInput { email: string; password: string }
export interface SignUpInput extends SignInInput { fullName: string }

export interface AuthService {
  signIn(input: SignInInput): Promise<void>;
  signUp(input: SignUpInput): Promise<void>;
}

export const unconnectedAuthService: AuthService = {
  async signIn() {
    throw new NotConnectedError();
  },
  async signUp() {
    throw new NotConnectedError();
  },
};
