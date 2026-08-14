import { Controller, Post, Body, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthUser } from '@webhook-auto/types';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '@webhook-auto/validation';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    try {
      const validated = RegisterSchema.parse(body);
      const result = await this.authService.register(validated as any);
      return { success: true, data: result };
    } catch (err: any) {
      if (err?.name === 'ZodError') {
        const firstIssue = err.issues?.[0]?.message || 'Invalid registration input';
        throw new BadRequestException(firstIssue);
      }
      throw err;
    }
  }

  @Post('login')
  async login(@Body() body: any) {
    try {
      const validated = LoginSchema.parse(body);
      const result = await this.authService.login(validated as any);
      return { success: true, data: result };
    } catch (err: any) {
      if (err?.name === 'ZodError') {
        const firstIssue = err.issues?.[0]?.message || 'Invalid login input';
        throw new BadRequestException(firstIssue);
      }
      throw err;
    }
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    try {
      const validated = RefreshTokenSchema.parse(body);
      const result = await this.authService.refreshToken(validated.refreshToken);
      return { success: true, data: result };
    } catch (err: any) {
      if (err?.name === 'ZodError') {
        const firstIssue = err.issues?.[0]?.message || 'Invalid refresh token format';
        throw new BadRequestException(firstIssue);
      }
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: AuthUser) {
    return { success: true, data: user };
  }

  @Post('logout')
  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }
}
