import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import { AuthStateModel, initialAuthState } from './auth.model';
import {
  Login,
  LoginSuccess,
  LoginFailed,
  Register,
  RegisterSuccess,
  RegisterFailed,
  Logout,
  LogoutSuccess,
  CheckAuth,
  ClearError
} from './auth.actions';
import { AuthService, User } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';

@State<AuthStateModel>({
  name: 'auth',
  defaults: initialAuthState
})
@Injectable()
export class AuthState {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static user(state: AuthStateModel): User | null {
    return state.user;
  }

  @Selector()
  static isLoading(state: AuthStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static error(state: AuthStateModel): string | null {
    return state.error;
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ isLoading: true, error: null });

    return this.authService.login(action.payload).pipe(
      tap((response) => {
        ctx.dispatch(new LoginSuccess(response.user));
      }),
      catchError((error) => {
        const message = error.error?.message || 'Erreur lors de la connexion';
        ctx.dispatch(new LoginFailed(message));
        return EMPTY;
      })
    );
  }

  @Action(LoginSuccess)
  loginSuccess(ctx: StateContext<AuthStateModel>, action: LoginSuccess) {
    ctx.patchState({
      user: action.user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }

  @Action(LoginFailed)
  loginFailed(ctx: StateContext<AuthStateModel>, action: LoginFailed) {
    ctx.patchState({
      isLoading: false,
      error: action.error
    });
  }

  @Action(Register)
  register(ctx: StateContext<AuthStateModel>, action: Register) {
    ctx.patchState({ isLoading: true, error: null });

    return this.authService.register(action.payload).pipe(
      tap((response) => {
        ctx.dispatch(new RegisterSuccess(response.user));
      }),
      catchError((error) => {
        const message = error.error?.message || 'Erreur lors de l\'inscription';
        ctx.dispatch(new RegisterFailed(message));
        return EMPTY;
      })
    );
  }

  @Action(RegisterSuccess)
  registerSuccess(ctx: StateContext<AuthStateModel>, action: RegisterSuccess) {
    ctx.patchState({
      user: action.user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }

  @Action(RegisterFailed)
  registerFailed(ctx: StateContext<AuthStateModel>, action: RegisterFailed) {
    ctx.patchState({
      isLoading: false,
      error: action.error
    });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    return this.authService.logout().pipe(
      tap(() => {
        ctx.dispatch(new LogoutSuccess());
      }),
      catchError(() => {
        // Meme en cas d'erreur, deconnecter localement
        this.tokenService.clearTokens();
        ctx.dispatch(new LogoutSuccess());
        return EMPTY;
      })
    );
  }

  @Action(LogoutSuccess)
  logoutSuccess(ctx: StateContext<AuthStateModel>) {
    ctx.setState(initialAuthState);
  }

  @Action(CheckAuth)
  checkAuth(ctx: StateContext<AuthStateModel>) {
    if (!this.tokenService.hasTokens()) {
      return;
    }

    ctx.patchState({ isLoading: true });

    return this.authService.getCurrentUser().pipe(
      tap((user) => {
        ctx.patchState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      }),
      catchError(() => {
        this.tokenService.clearTokens();
        ctx.patchState({
          isLoading: false,
          isAuthenticated: false,
          user: null
        });
        return EMPTY;
      })
    );
  }

  @Action(ClearError)
  clearError(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ error: null });
  }
}
