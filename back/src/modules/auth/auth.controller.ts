import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpStatus,
  HttpCode,
  Version,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TwoFactorDto } from './dto/two-factor.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SafeUser } from './types';
import { Public } from '../../common/decorators/public.decorator'; // 👈 Import Public decorator

interface AuthenticatedRequest extends ExpressRequest {
  user: SafeUser;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ Public GET login info
  @Get('login')
  @Public()
  @ApiOperation({ summary: 'Get login instructions' })
  @ApiResponse({
    status: 200,
    description: 'Instructions for POST /auth/login',
  })
  getLoginInfo() {
    return {
      message: 'POST to this endpoint with credentials to authenticate',
      requiredFields: ['email', 'password'],
      endpoint: 'POST /api/auth/login',
    };
  }

  @UseGuards(LocalAuthGuard, RateLimitGuard)
  @Post('login')
  @Public() // ✅ Allow unauthenticated access
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Request() req: AuthenticatedRequest) {
    const result = await this.authService.login(req.user);
    
    // Handle 2FA requirement
    if ('requiresTwoFactor' in result) {
      return {
        requiresTwoFactor: result.requiresTwoFactor,
        tempToken: result.tempToken,
      };
    }
    
    // Handle successful login - return data directly (TransformInterceptor will wrap it)
    return {
      user: result.user,
      tokens: result.tokens,
      tenant: result.tenant,
    };
  }

  @UseGuards(RateLimitGuard)
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile data' })
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @UseGuards(RateLimitGuard)
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiBody({ schema: { example: { email: 'user@example.com' } } })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @UseGuards(RateLimitGuard)
  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({
    schema: {
      example: {
        token: 'jwt-reset-token',
        password: 'newStrongPassword123',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetData: { token: string; password: string }) {
    return this.authService.resetPassword(resetData.token, resetData.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('enable-2fa')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret & QR code' })
  @ApiResponse({ status: 200, description: '2FA secret generated' })
  async enableTwoFactor(@Request() req: AuthenticatedRequest) {
    return this.authService.enableTwoFactor(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-2fa')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2FA code and activate' })
  @ApiBody({ type: TwoFactorDto })
  @ApiResponse({ status: 200, description: '2FA verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid 2FA token' })
  async verifyTwoFactor(
    @Request() req: AuthenticatedRequest,
    @Body() twoFactorDto: TwoFactorDto,
  ) {
    return this.authService.verifyTwoFactor(req.user.id, twoFactorDto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Request() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.id);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Access token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokenWithRefreshToken(refreshTokenDto.refreshToken);
  }
}
