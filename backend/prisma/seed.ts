/**
 * OmniSpace — Database Seeder
 * ---------------------------------------------------------------------------
 * Generates a large, realistic dataset for performance & pagination testing:
 *   - 3 tenants (FREE / AGENCY / ENTERPRISE)
 *   - ~15 internal users/tenant (1 SUPER_ADMIN, several PMs, several DEVELOPERs)
 *   - ~20 client organizations/tenant (each with 1 CLIENT-role contact user)
 *   - ~40 projects/tenant spread across all ProjectStatus values
 *   - 10–40 tasks/project (status & priority randomized)
 *   - Comments scattered across projects & tasks
 *   - A handful of ReportJobs per project
 *
 * All seeded users share the password: Password123!
 *
 * Run with:  npm run prisma:seed
 * (uses the `prisma.seed` entry in package.json -> ts-node prisma/seed.ts)
 * ---------------------------------------------------------------------------
 */

import {
  PrismaClient,
  UserRole,
  TenantPlan,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  ReportJobStatus,
  Prisma,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// ─── Config ──────────────────────────────────────────────────────────────
const SHARED_PASSWORD = "Password123!";
const PMS_PER_TENANT = 4;
const DEVS_PER_TENANT = 10;
const CLIENT_ORGS_PER_TENANT = 20;
const PROJECTS_PER_TENANT = 40;
const MIN_TASKS_PER_PROJECT = 10;
const MAX_TASKS_PER_PROJECT = 40;
const MAX_COMMENTS_PER_PROJECT = 6;
const MAX_COMMENTS_PER_TASK = 4;
const REPORT_JOBS_PER_PROJECT = 3;

const TENANT_BLUEPRINTS: { name: string; plan: TenantPlan }[] = [
  { name: "Northwind Studio", plan: TenantPlan.FREE },
  { name: "Bluecrest Digital Agency", plan: TenantPlan.AGENCY },
  { name: "Vertex Enterprise Solutions", plan: TenantPlan.ENTERPRISE },
];

function pick<T>(arr: readonly T[]): T {
  return arr[faker.number.int({ min: 0, max: arr.length - 1 })];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seeding OmniSpace database...\n");

  const hashedPassword = await bcrypt.hash(SHARED_PASSWORD, 10);

  // Wipe existing data (children first, respecting FK order).
  console.log("🧹 Clearing existing data...");
  await prisma.comment.deleteMany();
  await prisma.reportJob.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectTeamMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.clientOrganization.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  for (const blueprint of TENANT_BLUEPRINTS) {
    console.log(`\n🏢 Tenant: ${blueprint.name} (${blueprint.plan})`);

    const tenant = await prisma.tenant.create({
      data: {
        name: blueprint.name,
        slug: slugify(blueprint.name),
        plan: blueprint.plan,
        logoUrl: faker.image.urlPicsumPhotos({ width: 128, height: 128 }),
      },
    });

    // ── Internal users: 1 SUPER_ADMIN, N PMs, N DEVELOPERs ────────────────
    const superAdmin = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        fullName: faker.person.fullName(),
        email: faker.internet
          .email({ provider: `${tenant.slug}.test` })
          .toLowerCase(),
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        avatarUrl: faker.image.avatar(),
        jobTitle: "Founder & CEO",
        isActive: true,
      },
    });

    const projectManagers = [];
    for (let i = 0; i < PMS_PER_TENANT; i++) {
      const pm = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          fullName: faker.person.fullName(),
          email: faker.internet
            .email({ provider: `${tenant.slug}.test` })
            .toLowerCase(),
          password: hashedPassword,
          role: UserRole.PROJECT_MANAGER,
          avatarUrl: faker.image.avatar(),
          jobTitle: "Project Manager",
          isActive: faker.datatype.boolean({ probability: 0.95 }),
        },
      });
      projectManagers.push(pm);
    }

    const developers = [];
    for (let i = 0; i < DEVS_PER_TENANT; i++) {
      const dev = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          fullName: faker.person.fullName(),
          email: faker.internet
            .email({ provider: `${tenant.slug}.test` })
            .toLowerCase(),
          password: hashedPassword,
          role: UserRole.DEVELOPER,
          avatarUrl: faker.image.avatar(),
          jobTitle: pick([
            "Backend Engineer",
            "Frontend Engineer",
            "Full-Stack Engineer",
            "QA Engineer",
            "UI/UX Designer",
          ]),
          isActive: faker.datatype.boolean({ probability: 0.95 }),
        },
      });
      developers.push(dev);
    }

    console.log(
      `   👤 Users: 1 SUPER_ADMIN, ${projectManagers.length} PMs, ${developers.length} DEVELOPERs`,
    );

    // ── Client organizations (each has its own CLIENT-role contact user) ──
    const clientOrgs = [];
    for (let i = 0; i < CLIENT_ORGS_PER_TENANT; i++) {
      const companyName = faker.company.name();
      const contactUser = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          fullName: faker.person.fullName(),
          email: faker.internet
            .email({ provider: `${tenant.slug}.test` })
            .toLowerCase(),
          password: hashedPassword,
          role: UserRole.CLIENT,
          avatarUrl: faker.image.avatar(),
          jobTitle: pick(["Owner", "Marketing Director", "Operations Lead"]),
          isActive: true,
        },
      });

      const clientOrg = await prisma.clientOrganization.create({
        data: {
          tenantId: tenant.id,
          companyName,
          contactUserId: contactUser.id,
        },
      });
      clientOrgs.push(clientOrg);
    }

    console.log(`   🤝 Client organizations: ${clientOrgs.length}`);

    // ── Projects ───────────────────────────────────────────────────────────
    const allStatuses = Object.values(ProjectStatus);
    let totalTasks = 0;
    let totalComments = 0;
    let totalReportJobs = 0;

    for (let p = 0; p < PROJECTS_PER_TENANT; p++) {
      const status = allStatuses[p % allStatuses.length]; // even spread
      const client = pick(clientOrgs);
      const projectManager = pick(projectManagers);

      const project = await prisma.project.create({
        data: {
          tenantId: tenant.id,
          title: faker.company.catchPhrase(),
          description: faker.lorem.paragraph(),
          status,
          clientId: client.id,
          projectManagerId: projectManager.id,
          targetDeadline: faker.date.soon({ days: 180 }),
        },
      });

      // Team: 2-6 random developers (+ the PM is implicit via projectManagerId)
      const teamSize = faker.number.int({ min: 2, max: 6 });
      const teamMembers = faker.helpers.arrayElements(developers, teamSize);
      await prisma.projectTeamMember.createMany({
        data: teamMembers.map((u) => ({
          projectId: project.id,
          userId: u.id,
        })),
        skipDuplicates: true,
      });

      // ── Tasks ───────────────────────────────────────────────────────────
      const taskCount = faker.number.int({
        min: MIN_TASKS_PER_PROJECT,
        max: MAX_TASKS_PER_PROJECT,
      });

      const taskRows: Prisma.TaskCreateManyInput[] = [];
      for (let t = 0; t < taskCount; t++) {
        const taskStatus = pick(Object.values(TaskStatus));
        taskRows.push({
          tenantId: tenant.id,
          projectId: project.id,
          title: faker.hacker.phrase(),
          description: faker.lorem.sentences(2),
          status: taskStatus,
          priority: pick(Object.values(TaskPriority)),
          assigneeId: faker.datatype.boolean({ probability: 0.85 })
            ? pick(teamMembers).id
            : null,
          dueDate: faker.datatype.boolean({ probability: 0.7 })
            ? faker.date.soon({ days: 90 })
            : null,
          position: t,
        });
      }
      await prisma.task.createMany({ data: taskRows });

      const createdTasks = await prisma.task.findMany({
        where: { projectId: project.id },
        select: { id: true, status: true },
      });
      totalTasks += createdTasks.length;

      const doneCount = createdTasks.filter(
        (t) => t.status === TaskStatus.DONE,
      ).length;
      const completionRate =
        createdTasks.length > 0
          ? Math.round((doneCount / createdTasks.length) * 100)
          : 0;

      await prisma.project.update({
        where: { id: project.id },
        data: {
          taskCount: createdTasks.length,
          taskCountDone: doneCount,
          completionRate,
        },
      });

      // ── Comments (mix of project-level and task-level) ─────────────────
      const allParticipants: { id: string }[] = [
        { id: projectManager.id },
        ...teamMembers.map((u) => ({ id: u.id })),
        { id: client.contactUserId },
      ];

      const projectCommentCount = faker.number.int({
        min: 0,
        max: MAX_COMMENTS_PER_PROJECT,
      });
      const commentRows: Prisma.CommentCreateManyInput[] = [];
      for (let c = 0; c < projectCommentCount; c++) {
        commentRows.push({
          tenantId: tenant.id,
          projectId: project.id,
          taskId: null,
          authorId: pick(allParticipants).id,
          body: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        });
      }

      // A handful of tasks get task-level comments too
      const tasksWithComments = faker.helpers.arrayElements(
        createdTasks,
        Math.min(createdTasks.length, faker.number.int({ min: 0, max: 10 })),
      );
      for (const task of tasksWithComments) {
        const n = faker.number.int({ min: 1, max: MAX_COMMENTS_PER_TASK });
        for (let c = 0; c < n; c++) {
          commentRows.push({
            tenantId: tenant.id,
            projectId: project.id,
            taskId: task.id,
            authorId: pick(allParticipants).id,
            body: faker.lorem.sentences(
              faker.number.int({ min: 1, max: 2 }),
            ),
          });
        }
      }

      if (commentRows.length > 0) {
        await prisma.comment.createMany({ data: commentRows });
        totalComments += commentRows.length;

        // keep Task.commentCount in sync for tasks that received comments
        const perTask = new Map<string, number>();
        for (const row of commentRows) {
          if (!row.taskId) continue;
          perTask.set(row.taskId, (perTask.get(row.taskId) ?? 0) + 1);
        }
        await Promise.all(
          Array.from(perTask.entries()).map(([taskId, count]) =>
            prisma.task.update({
              where: { id: taskId },
              data: { commentCount: count },
            }),
          ),
        );
      }

      // ── Report jobs ──────────────────────────────────────────────────────
      const reportRows: Prisma.ReportJobCreateManyInput[] = [];
      for (let r = 0; r < REPORT_JOBS_PER_PROJECT; r++) {
        const jobStatus = pick(Object.values(ReportJobStatus));
        reportRows.push({
          tenantId: tenant.id,
          projectId: project.id,
          status: jobStatus,
          periodLabel: faker.date.month({ abbreviated: false }) + " " + faker.date.past().getFullYear(),
          downloadUrl:
            jobStatus === ReportJobStatus.READY
              ? `https://files.omnispace.test/reports/${faker.string.uuid()}.pdf`
              : null,
        });
      }
      await prisma.reportJob.createMany({ data: reportRows });
      totalReportJobs += reportRows.length;

      if ((p + 1) % 10 === 0) {
        console.log(`   📁 Projects seeded: ${p + 1}/${PROJECTS_PER_TENANT}`);
      }
    }

    console.log(
      `   ✅ ${PROJECTS_PER_TENANT} projects | ${totalTasks} tasks | ${totalComments} comments | ${totalReportJobs} report jobs`,
    );
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  const [tenants, users, clientOrgs, projects, tasks, comments, reportJobs] =
    await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.clientOrganization.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.comment.count(),
      prisma.reportJob.count(),
    ]);

  console.log("\n📊 Final counts:");
  console.table({
    tenants,
    users,
    clientOrganizations: clientOrgs,
    projects,
    tasks,
    comments,
    reportJobs,
  });

  console.log(`\n🔑 All seeded users share the password: ${SHARED_PASSWORD}`);
  console.log("   Tip: query `users` table in DBeaver filtered by role=SUPER_ADMIN");
  console.log("   to grab a login email for each tenant.\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });