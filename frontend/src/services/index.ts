import { mockVaultRepository } from '@/data/mock/mockRepository';
import { unconnectedAuthService } from './auth';
import type { VaultRepository } from './vaultRepository';
import type { AuthService } from './auth';

/** The single place where the app chooses its backend. Swap these two lines for Supabase later. */
export const vaultRepository: VaultRepository = mockVaultRepository;
export const authService: AuthService = unconnectedAuthService;

export { NotConnectedError } from './auth';
export { RepositoryError } from './vaultRepository';
