import { mockVaultRepository } from '@/data/mock/mockRepository';
import { supabaseVaultRepository } from './supabaseVaultRepository';
import { supabaseAuthService } from './auth';
import type { VaultRepository } from './vaultRepository';
import type { AuthService } from './auth';

export const vaultRepository: VaultRepository = supabaseVaultRepository;
export const previewVaultRepository: VaultRepository = mockVaultRepository;
export const authService: AuthService = supabaseAuthService;

export { NotConnectedError } from './auth';
export { RepositoryError } from './vaultRepository';