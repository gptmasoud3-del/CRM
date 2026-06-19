import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const permissions = [
  "*",
  "users.read", "users.create", "users.update", "users.disable",
  "roles.read", "roles.create", "roles.update", "roles.delete",
  "customers.read", "customers.create", "customers.update", "customers.delete", "customers.export", "customers.import", "customers.assign_owner", "customers.view_sensitive", "customers.view_audit_logs", "customers.bulk_update",
  "leads.read", "leads.create", "leads.update", "leads.delete", "leads.convert", "leads.assign", "leads.export",
  "lead.view", "lead.create", "lead.update", "lead.delete", "lead.convert", "lead.assign", "lead.export", "lead.overrideProbability",
  "opportunities.read", "opportunities.create", "opportunities.update", "opportunities.delete", "opportunities.change_stage", "opportunities.close_won", "opportunities.close_lost",
  "activities.read", "activities.create", "activities.update", "activities.delete",
  "tasks.read", "tasks.create", "tasks.update", "tasks.delete", "tasks.assign",
  "tickets.read", "tickets.create", "tickets.update", "tickets.delete",
  "reports.read", "reports.export",
  "settings.read", "settings.update",
  "audit_logs.read"
];

const rolePermissions: Record<string, string[]> = {
  "Super Admin": ["*"],
  "CRM Admin": permissions.filter((p) => p !== "*"),
  "Sales Manager": ["customers.read", "customers.create", "customers.update", "customers.export", "customers.import", "customers.assign_owner", "customers.view_sensitive", "customers.view_audit_logs", "customers.bulk_update", "leads.read", "leads.create", "leads.update", "leads.assign", "leads.convert", "leads.export", "lead.view", "lead.create", "lead.update", "lead.assign", "lead.convert", "lead.export", "lead.overrideProbability", "opportunities.read", "opportunities.create", "opportunities.update", "opportunities.change_stage", "opportunities.close_won", "opportunities.close_lost", "activities.read", "activities.create", "tasks.read", "tasks.create", "tasks.update", "tasks.assign", "reports.read"],
  "Sales Agent": ["customers.read", "customers.create", "customers.update", "customers.view_sensitive", "leads.read", "leads.create", "leads.update", "leads.convert", "opportunities.read", "opportunities.create", "opportunities.update", "opportunities.change_stage", "activities.read", "activities.create", "tasks.read", "tasks.create", "tasks.update", "tickets.read"],
  "Support Manager": ["customers.read", "customers.update", "tickets.read", "tickets.create", "tickets.update", "activities.read", "activities.create", "tasks.read", "tasks.create", "tasks.update", "reports.read"],
  "Support Agent": ["customers.read", "tickets.read", "tickets.create", "tickets.update", "activities.read", "activities.create", "tasks.read", "tasks.create", "tasks.update"],
  "Marketing User": ["leads.read", "leads.create", "leads.update", "leads.export", "customers.read", "reports.read"],
  "Data Analyst": ["customers.read", "customers.export", "customers.view_audit_logs", "leads.read", "leads.export", "opportunities.read", "reports.read", "reports.export"],
  "Read-only Executive": ["customers.read", "leads.read", "opportunities.read", "tickets.read", "reports.read"]
};

async function main() {
  const team = await prisma.team.upsert({ where: { id: "00000000-0000-0000-0000-000000000001" }, update: {}, create: { id: "00000000-0000-0000-0000-000000000001", name: "تیم اصلی" } });

  for (const key of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, module: key === "*" ? "system" : key.split(".")[0], description: key === "*" ? "دسترسی کامل" : `دسترسی ${key}` }
    });
  }

  for (const [name, keys] of Object.entries(rolePermissions)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { description: `نقش ${name}` },
      create: { name, description: `نقش ${name}`, isSystem: true }
    });
    const permissionRows = await prisma.permission.findMany({ where: { key: { in: keys } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({ data: permissionRows.map((permission) => ({ roleId: role.id, permissionId: permission.id })), skipDuplicates: true });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "Super Admin" } });
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com";
  const adminPasswordHash = await bcrypt.hash(process.env.INITIAL_ADMIN_PASSWORD ?? "change_me_immediately", Number(process.env.BCRYPT_SALT_ROUNDS ?? 12));
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { status: "active", passwordHash: adminPasswordHash },
    create: {
      name: process.env.INITIAL_ADMIN_NAME ?? "مدیر سیستم",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      teamId: team.id,
      roles: { create: { roleId: adminRole.id } }
    }
  });

  const stages = [
    ["سرنخ اولیه", 1, 10, "#64748B", false, false],
    ["احراز صلاحیت", 2, 25, "#2563EB", false, false],
    ["نیازسنجی", 3, 40, "#7C3AED", false, false],
    ["ارسال پیشنهاد", 4, 60, "#F59E0B", false, false],
    ["مذاکره", 5, 80, "#EA580C", false, false],
    ["برنده", 6, 100, "#00A700", true, false],
    ["از دست رفته", 7, 0, "#D50000", false, true]
  ] as const;
  for (const [name, order, probability, color, isWon, isLost] of stages) {
    await prisma.pipelineStage.upsert({ where: { name }, update: { order, probability, color, isWon, isLost }, create: { name, order, probability, color, isWon, isLost } });
  }

  if (process.env.SEED_DEMO_DATA === "true") {
    const qualification = await prisma.pipelineStage.findUniqueOrThrow({ where: { name: "احراز صلاحیت" } });
    const proposal = await prisma.pipelineStage.findUniqueOrThrow({ where: { name: "ارسال پیشنهاد" } });
    const negotiation = await prisma.pipelineStage.findUniqueOrThrow({ where: { name: "مذاکره" } });

    const salesRole = await prisma.role.findUniqueOrThrow({ where: { name: "Sales Agent" } });
    const supportRole = await prisma.role.findUniqueOrThrow({ where: { name: "Support Agent" } });
    const managerRole = await prisma.role.findUniqueOrThrow({ where: { name: "Sales Manager" } });
    const demoUsers = [
      ["سارا احمدی", "sara.sales@example.com", salesRole.id],
      ["علی محمدی", "ali.support@example.com", supportRole.id],
      ["مینا کریمی", "mina.manager@example.com", managerRole.id]
    ] as const;
    const demoPasswordHash = await bcrypt.hash("Demo@123456", 12);
    for (const [name, email, roleId] of demoUsers) {
      const user = await prisma.user.upsert({
        where: { email },
        update: { name, status: "active", teamId: team.id, passwordHash: demoPasswordHash },
        create: { name, email, passwordHash: demoPasswordHash, teamId: team.id, roles: { create: { roleId } } }
      });
      await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId } }, update: {}, create: { userId: user.id, roleId } });
    }

    const customersData = [
      { customerCode: "CUS-000101", name: "شرکت توسعه پارس", fullName: "شرکت توسعه پارس", displayName: "توسعه پارس", companyName: "توسعه پارس", phone: "02191000000", mobile: "09121001010", email: "info@pars.example", status: "active" as const, segment: "سازمانی", tier: "طلایی", tierLevel: "gold" as const, city: "تهران", province: "تهران", clv: 250000000, totalRevenue: 620000000, totalDeals: 7, openDealsCount: 2, wonDealsCount: 4, lostDealsCount: 1, healthScore: 82, churnRisk: "low" as const, satisfactionScore: 88, industry: "نرم‌افزار", source: "وب‌سایت", lastInteractionAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), nextFollowUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { customerCode: "CUS-000102", name: "فروشگاه آریا", fullName: "فروشگاه آریا", displayName: "آریا تجارت", companyName: "آریا تجارت", phone: "02188000000", mobile: "09121002020", email: "contact@arya.example", status: "prospect" as const, segment: "خرده‌فروشی", tier: "نقره‌ای", tierLevel: "silver" as const, city: "اصفهان", province: "اصفهان", clv: 72000000, totalRevenue: 18000000, totalDeals: 2, openDealsCount: 1, wonDealsCount: 1, lostDealsCount: 0, healthScore: 61, churnRisk: "medium" as const, satisfactionScore: 72, industry: "فروشگاه آنلاین", source: "نمایشگاه", lastInteractionAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), nextFollowUpAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
      { customerCode: "CUS-000103", name: "گروه صنعتی سپهر", fullName: "گروه صنعتی سپهر", displayName: "سپهر", companyName: "سپهر", phone: "02634000000", mobile: "09121003030", email: "crm@sepehr.example", status: "at_risk" as const, segment: "صنعتی", tier: "طلایی", tierLevel: "gold" as const, city: "کرج", province: "البرز", clv: 380000000, totalRevenue: 410000000, totalDeals: 5, openDealsCount: 1, wonDealsCount: 3, lostDealsCount: 1, healthScore: 38, churnRisk: "high" as const, satisfactionScore: 41, industry: "تولید", source: "معرفی مشتری", lastInteractionAt: new Date(Date.now() - 72 * 24 * 60 * 60 * 1000), nextFollowUpAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
    ];
    const customers = [];
    for (const item of customersData) {
      const existing = await prisma.customer.findFirst({ where: { email: item.email, deletedAt: null } });
      const customer = existing
        ? await prisma.customer.update({ where: { id: existing.id }, data: { ...item, ownerId: admin.id, assignedTeamId: team.id, tags: ["نمونه"] } })
        : await prisma.customer.create({ data: { type: "company", ...item, ownerId: admin.id, assignedTeamId: team.id, tags: ["نمونه"] } });
      customers.push(customer);
    }

    const leadsData = [
      {
        name: "نیما رضایی",
        firstName: "نیما",
        lastName: "رضایی",
        fullName: "نیما رضایی",
        companyName: "راهکار نو",
        businessName: "راهکار نو",
        phone: "02191001010",
        mobile: "09120000000",
        email: "nima@example.com",
        website: "https://rahkar.example",
        source: "CAMPAIGN",
        campaign: "کمپین لجستیک فروشگاه‌ها",
        status: "new" as const,
        probability: 5,
        score: 76,
        priority: "high" as const,
        businessType: "ONLINE_SHOP",
        industry: "فروشگاه اینترنتی",
        monthlyShipmentVolume: 1800,
        averageDailyOrders: 60,
        originCities: ["تهران"],
        destinationCities: ["تهران", "کرج", "قم"],
        mainServiceNeed: "IN_CITY_DELIVERY",
        currentCourierProvider: "پیک محلی",
        painPoints: "تاخیر در تحویل و نبود گزارش لحظه‌ای",
        hasApiNeed: true,
        nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        name: "الهام صادقی",
        firstName: "الهام",
        lastName: "صادقی",
        fullName: "الهام صادقی",
        companyName: "بازار آنلاین",
        businessName: "بازار آنلاین",
        phone: "02188001111",
        mobile: "09121111111",
        email: "elham@example.com",
        source: "WEB_FORM",
        campaign: "فرم سایت",
        status: "contacted" as const,
        probability: 15,
        score: 64,
        priority: "medium" as const,
        businessType: "MARKETPLACE",
        industry: "مارکت‌پلیس",
        monthlyShipmentVolume: 9500,
        averageDailyOrders: 320,
        originCities: ["تهران", "اصفهان"],
        destinationCities: ["کل کشور"],
        mainServiceNeed: "COMBINED_SERVICE",
        currentCourierProvider: "چند سرویس‌دهنده",
        painPoints: "تسویه COD و مرجوعی پیچیده است",
        hasCodPaymentNeed: true,
        hasReverseLogisticsNeed: true,
        lastContactAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextFollowUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        name: "کامران نادری",
        firstName: "کامران",
        lastName: "نادری",
        fullName: "کامران نادری",
        companyName: "پخش شرق",
        businessName: "پخش شرق",
        phone: "05132222222",
        mobile: "09122222222",
        email: "kamran@example.com",
        source: "EXHIBITION",
        campaign: "نمایشگاه تجارت الکترونیک",
        status: "qualified" as const,
        probability: 40,
        score: 88,
        priority: "urgent" as const,
        businessType: "DISTRIBUTION",
        industry: "پخش و توزیع",
        monthlyShipmentVolume: 22000,
        averageDailyOrders: 750,
        originCities: ["مشهد"],
        destinationCities: ["تهران", "خراسان رضوی", "خراسان جنوبی"],
        mainServiceNeed: "INTER_CITY_DELIVERY",
        currentCourierProvider: "باربری سنتی",
        painPoints: "رهگیری بین‌شهری و SLA ثابت نیاز دارد",
        hasWarehousingNeed: true,
        expectedStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        lastContactAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        nextFollowUpAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    ];
    for (const item of leadsData) {
      const exists = await prisma.lead.findFirst({ where: { email: item.email, deletedAt: null } });
      if (!exists) await prisma.lead.create({ data: { ...item, ownerId: admin.id, assignedToId: admin.id, createdById: admin.id, tags: ["نمونه"] } });
    }

    const opportunitiesData = [
      { customerId: customers[0].id, title: "تمدید قرارداد سالانه", amount: 480000000, probability: 25, stageId: qualification.id, nextStep: "ارسال پیشنهاد مالی" },
      { customerId: customers[1].id, title: "راه‌اندازی CRM شعب", amount: 180000000, probability: 60, stageId: proposal.id, nextStep: "جلسه بررسی فنی" },
      { customerId: customers[2].id, title: "بسته پشتیبانی ویژه", amount: 95000000, probability: 80, stageId: negotiation.id, nextStep: "نهایی‌سازی تخفیف" }
    ];
    for (const item of opportunitiesData) {
      const exists = await prisma.opportunity.findFirst({ where: { title: item.title, customerId: item.customerId, deletedAt: null } });
      if (!exists) await prisma.opportunity.create({ data: { ...item, ownerId: admin.id, expectedCloseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) } });
    }

    const tasksData = [
      { title: "پیگیری قرارداد توسعه پارس", customerId: customers[0].id, priority: "high" as const, dueInHours: 24 },
      { title: "ارسال پروپوزال فروشگاه آریا", customerId: customers[1].id, priority: "medium" as const, dueInHours: 48 },
      { title: "تماس اضطراری با سپهر", customerId: customers[2].id, priority: "urgent" as const, dueInHours: -6 }
    ];
    for (const item of tasksData) {
      const exists = await prisma.task.findFirst({ where: { title: item.title, entityId: item.customerId } });
      if (!exists) await prisma.task.create({ data: { title: item.title, ownerId: admin.id, assignedById: admin.id, entityType: "customer", entityId: item.customerId, priority: item.priority, dueDate: new Date(Date.now() + item.dueInHours * 60 * 60 * 1000) } });
    }

    const ticketsData = [
      { code: "TCK-1405-0001", customerId: customers[0].id, subject: "شکایت مشتری درباره تأخیر در تحویل", description: "مشتری اعلام کرده چند مرسوله سازمانی دیرتر از SLA تحویل شده است.", type: "customer_complaint", channel: "phone", team: "support", priority: "high" as const, status: "open" as const, hours: 8 },
      { code: "TCK-1405-0002", customerId: customers[0].id, subject: "بررسی SLA برای مشتری سازمانی", description: "نیاز به بررسی فوری وضعیت SLA و ارائه گزارش به مدیر حساب.", type: "sla_review", channel: "internal", team: "management", priority: "critical" as const, status: "in_progress" as const, hours: 4 },
      { code: "TCK-1405-0003", customerId: customers[1].id, subject: "مغایرت فاکتور ماهانه", description: "مشتری نسبت به مبلغ فاکتور ماهانه درخواست بررسی مالی دارد.", type: "financial_issue", channel: "email", team: "finance", priority: "medium" as const, status: "pending" as const, hours: 24 },
      { code: "TCK-1405-0004", customerId: customers[2].id, subject: "مفقودی مرسوله در مسیر", description: "یک مرسوله مهم در مسیر بین‌شهری نیازمند پیگیری عملیات است.", type: "operational_issue", channel: "messenger", team: "operations", priority: "urgent" as const, status: "escalated" as const, hours: 6 },
      { code: "TCK-1405-0005", customerId: customers[1].id, subject: "درخواست فعال‌سازی سرویس جدید", description: "مشتری درخواست فعال‌سازی سرویس ارسال اکسپرس را ثبت کرده است.", type: "general_request", channel: "customer_portal", team: "support", priority: "low" as const, status: "resolved" as const, hours: 72 }
    ];
    for (const item of ticketsData) {
      const exists = await prisma.ticket.findFirst({ where: { subject: item.subject, customerId: item.customerId } });
      if (!exists) {
        const { hours, ...ticket } = item;
        await prisma.ticket.create({ data: { ...ticket, ownerId: admin.id, slaDueAt: new Date(Date.now() + hours * 60 * 60 * 1000), priorityScore: ticket.priority === "critical" ? 5 : ticket.priority === "urgent" ? 4 : ticket.priority === "high" ? 3 : ticket.priority === "medium" ? 2 : 1 } });
      }
    }

    const activityExists = await prisma.activity.findFirst({ where: { entityType: "customer", entityId: customers[0].id, title: "تماس خوشامدگویی" } });
    if (!activityExists) {
      await prisma.activity.create({ data: { entityType: "customer", entityId: customers[0].id, activityType: "call", title: "تماس خوشامدگویی", outcome: "نیاز به پیگیری فروش", createdById: admin.id } });
      await prisma.activity.create({ data: { entityType: "customer", entityId: customers[1].id, activityType: "meeting", title: "جلسه معرفی محصول", outcome: "علاقه‌مند به نسخه سازمانی", createdById: admin.id } });
      await prisma.activity.create({ data: { entityType: "customer", entityId: customers[2].id, activityType: "note", title: "یادداشت ریسک ریزش", description: "مشتری به دلیل تأخیر پاسخ‌گویی ریسک‌دار شده است.", createdById: admin.id, isPrivate: true } });
    }
  }

  console.log(`Seed completed. Admin: ${adminEmail}`);
}

main().finally(async () => prisma.$disconnect());
