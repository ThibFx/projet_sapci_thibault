import { User } from '../../core/services/auth.service';

export interface AuthStateModel {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const initialAuthState: AuthStateModel = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};
