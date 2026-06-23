import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password123!';

async function main() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  const tenant = await prisma.tenant.create({
    data: { name: 'Acme Creative Agency', slug: 'acme-creative', plan: 'AGENCY' },
  });

  const superAdmin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      fullName: 'Sarah Admin',
      email: 'admin@acme.test',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });

  const projectManager = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      fullName: 'Pablo Manager',
      email: 'pm@acme.test',
      password: hashedPassword,
      role: UserRole.PROJECT_MANAGER,
    },
  });

  const developer = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      fullName: 'Dana Developer',
      email: 'dev@acme.test',
      password: hashedPassword,
      role: UserRole.DEVELOPER,
    },
  });

  const clientContact = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      fullName: 'Casey Client',
      email: 'client@acme.test',
      password: hashedPassword,
      role: UserRole.CLIENT,
    },
  });

  const clientOrg = await prisma.clientOrganization.create({
    data: {
      tenantId: tenant.id,
      companyName: 'Northwind Traders',
      contactUserId: clientContact.id,
    },
  });

  const project = await prisma.project.create({
    data: {
      tenantId: tenant.id,
      title: 'Northwind Website Redesign',
      description: 'Full redesign of the Northwind marketing site and storefront.',
      clientId: clientOrg.id,
      projectManagerId: projectManager.id,
      targetDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      status: 'ACTIVE',
      team: { create: [{ userId: projectManager.id }, { userId: developer.id }] },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: project.id,
        title: 'Wireframe homepage',
        description: 'Low-fidelity wireframes for the new homepage layout.',
        status: 'DONE',
        priority: 'HIGH',
        assigneeId: developer.id,
        position: 0,
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        title: 'Implement product listing page',
        description: 'Build the responsive product grid with filters.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assigneeId: developer.id,
        position: 0,
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        title: 'Client review of checkout flow',
        description: 'Walk the client through the new checkout UX.',
        status: 'TODO',
        priority: 'LOW',
        assigneeId: null,
        position: 0,
      },
    ],
  });

  const taskCount = await prisma.task.count({ where: { projectId: project.id } });
  const taskCountDone = await prisma.task.count({ where: { projectId: project.id, status: 'DONE' } });
  await prisma.project.update({
    where: { id: project.id },
    data: { taskCount, taskCountDone, completionRate: Math.round((taskCountDone / taskCount) * 100) },
  });

  console.log('Seed complete. Demo accounts (all share the same password):');
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  SUPER_ADMIN:      ${superAdmin.email}`);
  console.log(`  PROJECT_MANAGER:  ${projectManager.email}`);
  console.log(`  DEVELOPER:        ${developer.email}`);
  console.log(`  CLIENT:           ${clientContact.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
