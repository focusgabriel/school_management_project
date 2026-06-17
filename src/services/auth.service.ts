import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { repositories } from '../repositories';
import { emailService } from './email.service';
import { PasswordUtil } from '../utils/password.util';
import { JWTUtil, JWTPayload } from '../utils/jwt.util';
import { ApiError } from '../utils/api-error.util';
import { createChildLogger } from '../config/logger.config';
import { PASSWORD_RESET_EXPIRY_HOURS, MAX_LOGIN_ATTEMPTS } from '../utils/constants.util';
import type { RegisterInput, LoginInput, ResetPasswordInput, ChangePasswordInput } from '../schemas/auth.schema';

const logger = createChildLogger('AuthService');

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await repositories.user.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    const hashedPassword = await PasswordUtil.hash(input.password);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await repositories.user.create({
      email: input.email.toLowerCase(),
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      phone: input.phone,
      emailVerificationToken,
      emailVerificationExpires,
      status: 'pending',
    });

    await emailService.sendEmailVerification(
      user.email,
      emailVerificationToken,
      `${user.firstName} ${user.lastName}`
    );

    logger.info({ userId: user.id, email: user.email }, 'User registered successfully');

    const { password, refreshToken, passwordResetToken, ...safeUser } = user;
    return safeUser;
  }

  async login(input: LoginInput, ipAddress?: string) {
    const user = await repositories.user.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw ApiError.tooManyRequests('Account is locked due to too many failed login attempts. Try again later.');
    }

    if (user.status === 'suspended') {
      throw ApiError.forbidden('Your account has been suspended. Please contact the administrator.');
    }

    if (user.status === 'inactive') {
      throw ApiError.forbidden('Your account is inactive. Please contact the administrator.');
    }

    const isPasswordValid = await PasswordUtil.compare(input.password, user.password);
    if (!isPasswordValid) {
      await repositories.user.incrementFailedAttempts(user.id);
      logger.warn({ userId: user.id, email: user.email, ipAddress }, 'Failed login attempt');
      throw ApiError.unauthorized('Invalid email or password');
    }

    const failedAttempts = parseInt(user.failedLoginAttempts || '0');
    if (failedAttempts > 0) {
      await repositories.user.resetFailedAttempts(user.id);
    }

    await repositories.user.updateLastLogin(user.id);

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = JWTUtil.generateAccessToken(payload);
    const refreshToken = JWTUtil.generateRefreshToken({
      userId: user.id,
      tokenId: uuidv4(),
    });

    await repositories.user.updateRefreshToken(user.id, refreshToken);

    logger.info({ userId: user.id, email: user.email, ipAddress }, 'User logged in successfully');

    const { password, passwordResetToken, passwordResetExpires, emailVerificationToken, ...safeUser } = user;

    return {
      user: safeUser,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = JWTUtil.verifyRefreshToken(refreshToken);
      const user = await repositories.user.findByRefreshToken(refreshToken);

      if (!user) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      const newPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = JWTUtil.generateAccessToken(newPayload);
      const newRefreshToken = JWTUtil.generateRefreshToken({
        userId: user.id,
        tokenId: uuidv4(),
      });

      await repositories.user.updateRefreshToken(user.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error({ error }, 'Token refresh failed');
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await repositories.user.updateRefreshToken(userId, null);
    logger.info({ userId }, 'User logged out successfully');
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await repositories.user.findByEmail(email);
    if (!user) {
      return { message: 'If your email is registered, you will receive a password reset link' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);

    await repositories.user.setPasswordResetToken(user.id, resetToken, resetExpires);
    await emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      `${user.firstName} ${user.lastName}`
    );

    logger.info({ userId: user.id, email: user.email }, 'Password reset email sent');

    return { message: 'If your email is registered, you will receive a password reset link' };
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = await repositories.user.findByPasswordResetToken(input.token);
    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const hashedPassword = await PasswordUtil.hash(input.password);
    await repositories.user.updatePassword(user.id, hashedPassword);
    await repositories.user.updateRefreshToken(user.id, null);

    logger.info({ userId: user.id }, 'Password reset successfully');

    return { message: 'Password reset successfully. Please login with your new password.' };
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await repositories.user.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isCurrentPasswordValid = await PasswordUtil.compare(input.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await PasswordUtil.hash(input.newPassword);
    await repositories.user.updatePassword(userId, hashedPassword);

    logger.info({ userId }, 'Password changed successfully');

    return { message: 'Password changed successfully' };
  }

  async verifyEmail(token: string) {
    const user = await repositories.user.findOne({ emailVerificationToken: token });
    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw ApiError.badRequest('Verification token has expired');
    }

    await repositories.user.update(user.id, {
      emailVerified: true,
      status: 'active',
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    logger.info({ userId: user.id }, 'Email verified successfully');

    return { message: 'Email verified successfully' };
  }

  async getProfile(userId: string) {
    const user = await repositories.user.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const { password, refreshToken, passwordResetToken, passwordResetExpires, emailVerificationToken, emailVerificationExpires, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, data: Partial<{ firstName: string; lastName: string; phone: string; avatar: string; address: string; city: string; state: string; country: string; postalCode: string }>) {
    const user = await repositories.user.update(userId, { ...data, updatedAt: new Date() });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const { password, refreshToken, passwordResetToken, passwordResetExpires, emailVerificationToken, emailVerificationExpires, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();