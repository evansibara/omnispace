import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';
import { AuthService } from './auth.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register-tenant')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async registerTenant(@Body() dto: RegisterTenantDto, @Res({ passthrough: true }) res: Response) {
    const { session, token } = await this.authService.registerTenant(dto);
    res.cookie(this.authService.getCookieName(), token, this.authService.getCookieOptions());
    return { message: 'Tenant registered successfully', data: session };
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { session, token } = await this.authService.login(dto);
    res.cookie(this.authService.getCookieName(), token, this.authService.getCookieOptions());
    return { message: 'Login successful', data: session };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(this.authService.getCookieName());
    return { message: 'Logged out successfully', data: null };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() user: AuthenticatedUser) {
    const session = await this.authService.getSession(user.id);
    return { message: 'Session retrieved', data: session };
  }
}
