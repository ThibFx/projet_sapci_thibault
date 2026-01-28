import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { jwtConfig, JwtPayload, RefreshTokenPayload } from '../config/jwt';
import { RegisterBody, LoginBody, TokenResponse } from '../dto/auth.dto';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(data: RegisterBody): Promise<TokenResponse> {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe deja');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await User.create({
      email: data.email,
      passwordHash,
      name: data.name
    });

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async login(data: LoginBody): Promise<TokenResponse> {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    let decoded: RefreshTokenPayload;

    try {
      decoded = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret) as RefreshTokenPayload;
    } catch {
      throw new Error('Refresh token invalide ou expire');
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.refreshToken) {
      throw new Error('Refresh token invalide');
    }

    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
      throw new Error('Refresh token invalide');
    }

    const accessToken = this.generateAccessToken(user);

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await User.update(
      { refreshToken: null },
      { where: { id: userId } }
    );
  }

  async getUserById(userId: string): Promise<User | null> {
    return User.findByPk(userId);
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Stocker le refresh token hashe en BDD
    const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await User.update(
      { refreshToken: hashedRefreshToken },
      { where: { id: user.id } }
    );

    return { accessToken, refreshToken };
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email
    };

    const options: SignOptions = {
      expiresIn: jwtConfig.accessTokenExpiry
    };

    return jwt.sign(payload, jwtConfig.accessTokenSecret, options);
  }

  private generateRefreshToken(user: User): string {
    const payload: RefreshTokenPayload = {
      userId: user.id
    };

    const options: SignOptions = {
      expiresIn: jwtConfig.refreshTokenExpiry
    };

    return jwt.sign(payload, jwtConfig.refreshTokenSecret, options);
  }
}

export const authService = new AuthService();
