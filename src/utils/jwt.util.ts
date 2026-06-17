import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { env } from '../config/env.config';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface JWTRefreshPayload {
  userId: string;
  tokenId: string;
}

export class JWTUtil {
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
      issuer: 'school-management-api',
    } as SignOptions);
  }

  static generateRefreshToken(payload: JWTRefreshPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      issuer: 'school-management-api',
    } as SignOptions);
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: 'school-management-api',
    } as VerifyOptions) as JWTPayload;
  }

  static verifyRefreshToken(token: string): JWTRefreshPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'school-management-api',
    } as VerifyOptions) as JWTRefreshPayload;
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}