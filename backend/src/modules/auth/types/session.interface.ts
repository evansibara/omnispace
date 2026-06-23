import { TenantPlan, UserRole } from '@prisma/client';

export interface SessionUser {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  jobTitle: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface SessionTenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  logoUrl: string | null;
  createdAt: string;
}

export interface Session {
  user: SessionUser;
  tenant: SessionTenant;
}
