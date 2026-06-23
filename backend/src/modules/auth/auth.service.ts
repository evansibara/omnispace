import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Prisma, Tenant, User, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';
import { Session } from './types/session.interface';

const SLUG_SUFFIX_LENGTH = 6;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerTenant(dto: RegisterTenantDto): Promise<{ session: Session; token: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const slug = await this.generateUniqueSlug(dto.organizationName);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const { tenant, user } = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.organizationName,
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          fullName: dto.fullName,
          email: dto.email,
          password: hashedPassword,
          role: UserRole.SUPER_ADMIN,
        },
      });

      return { tenant, user };
    });

    const token = this.signToken(user.id, tenant.id, user.role);
    return { session: this.toSession(user, tenant), token };
  }

  async login(dto: LoginDto): Promise<{ session: Session; token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: user.tenantId } });
    if (!tenant) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.signToken(user.id, tenant.id, user.role);
    return { session: this.toSession(user, tenant), token };
  }

  async getSession(userId: string): Promise<Session> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Session is no longer valid.');
    }
    const tenant = await this.prisma.tenant.findUnique({ where: { id: user.tenantId } });
    if (!tenant) {
      throw new UnauthorizedException('Session is no longer valid.');
    }
    return this.toSession(user, tenant);
  }

  getCookieOptions() {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      maxAge: this.parseExpiryToMs(this.configService.get<string>('JWT_EXPIRES_IN', '7d')),
    };
  }

  getCookieName(): string {
    return this.configService.get<string>('COOKIE_NAME', 'access_token');
  }

  private signToken(userId: string, tenantId: string, role: UserRole): string {
    return this.jwtService.sign(
      { sub: userId, tenantId, role },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
      },
    );
  }

  private toSession(user: User, tenant: Tenant): Session {
    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        jobTitle: user.jobTitle,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        logoUrl: tenant.logoUrl,
        createdAt: tenant.createdAt.toISOString(),
      },
    };
  }

  private async generateUniqueSlug(organizationName: string): Promise<string> {
    const base = organizationName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'tenant';

    let slug = base;
    let attempt = 0;
    while (await this.prisma.tenant.findUnique({ where: { slug } })) {
      attempt += 1;
      const suffix = Math.random()
        .toString(36)
        .slice(2, 2 + SLUG_SUFFIX_LENGTH);
      slug = `${base}-${suffix}`;
      if (attempt > 5) break;
    }
    return slug;
  }

  private parseExpiryToMs(expiry: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiry);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * multipliers[unit];
  }
}
