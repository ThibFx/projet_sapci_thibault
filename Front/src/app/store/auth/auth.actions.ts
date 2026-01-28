import { LoginCredentials, RegisterPayload, User } from '../../core/services/auth.service';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: LoginCredentials) {}
}

export class LoginSuccess {
  static readonly type = '[Auth] Login Success';
  constructor(public user: User) {}
}

export class LoginFailed {
  static readonly type = '[Auth] Login Failed';
  constructor(public error: string) {}
}

export class Register {
  static readonly type = '[Auth] Register';
  constructor(public payload: RegisterPayload) {}
}

export class RegisterSuccess {
  static readonly type = '[Auth] Register Success';
  constructor(public user: User) {}
}

export class RegisterFailed {
  static readonly type = '[Auth] Register Failed';
  constructor(public error: string) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class LogoutSuccess {
  static readonly type = '[Auth] Logout Success';
}

export class RefreshToken {
  static readonly type = '[Auth] Refresh Token';
}

export class CheckAuth {
  static readonly type = '[Auth] Check Auth';
}

export class ClearError {
  static readonly type = '[Auth] Clear Error';
}
