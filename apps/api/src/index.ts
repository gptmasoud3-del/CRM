import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import morgan from "morgan";
import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4000);
const accessSecret = process.env.JWT_ACCESS_SECRET ?? "dev_access_secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret";
const accessTtl = (process.env.JWT_ACCESS_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];
const refreshTtl = (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

type AuthUser = {
  id: string;
  email: string;
  name: string;
  permissions: string[];
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.text({ type: ["text/csv", "text/plain"], limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("combined"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "درخواست‌های ورود بیش از حد مجاز است. چند دقیقه بعد دوباره تلاش کنید." }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const idSchema = z.object({ id: z.string().uuid() });
const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  status: z.enum(["active", "disabled"]).optional(),
  roleIds: z.array(z.string().uuid()).optional(),
  teamId: z.string().uuid().nullable().optional()
});

const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissionIds: z.array(z.string().uuid()).optional()
});

const customerSchema = z.object({
  type: z.enum(["individual", "company"]).default("individual"),
  customerCode: z.string().optional().nullable(),
  name: z.string().min(2).optional(),
  fullName: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  displayName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  nationalIdOrCompanyId: z.string().optional().nullable(),
  nationalId: z.string().optional().nullable(),
  economicCode: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "prospect", "at_risk", "lost", "blocked"]).default("prospect"),
  segment: z.string().optional().nullable(),
  tier: z.string().optional().nullable(),
  tierLevel: z.enum(["bronze", "silver", "gold", "platinum", "vip"]).optional().nullable(),
  source: z.string().optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
  assignedTeamId: z.string().uuid().optional().nullable(),
  industry: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  clv: z.coerce.number().nonnegative().default(0),
  totalRevenue: z.coerce.number().nonnegative().default(0),
  totalDeals: z.coerce.number().int().nonnegative().default(0),
  openDealsCount: z.coerce.number().int().nonnegative().default(0),
  wonDealsCount: z.coerce.number().int().nonnegative().default(0),
  lostDealsCount: z.coerce.number().int().nonnegative().default(0),
  lastInteractionAt: z.coerce.date().optional().nullable(),
  nextFollowUpAt: z.coerce.date().optional().nullable(),
  healthScore: z.coerce.number().int().min(0).max(100).default(50),
  churnRisk: z.enum(["low", "medium", "high"]).default("low"),
  satisfactionScore: z.coerce.number().int().min(0).max(100).optional().nullable(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.unknown()).optional().nullable(),
  allowDuplicate: z.boolean().optional()
});

const leadSchema = z.object({
  name: z.string().min(2).optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  fullName: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  businessName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  email: z.preprocess((value) => value === "" ? undefined : value, z.string().email("ایمیل معتبر نیست.").optional().nullable()),
  website: z.preprocess((value) => value === "" ? undefined : value, z.string().url("آدرس وب‌سایت معتبر نیست.").optional().nullable()),
  nationalId: z.string().optional().nullable(),
  economicCode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  businessType: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  monthlyShipmentVolume: z.coerce.number().int().nonnegative().optional().nullable(),
  averageDailyOrders: z.coerce.number().int().nonnegative().optional().nullable(),
  originCities: z.array(z.string()).default([]),
  destinationCities: z.array(z.string()).default([]),
  mainServiceNeed: z.string().optional().nullable(),
  currentCourierProvider: z.string().optional().nullable(),
  painPoints: z.string().optional().nullable(),
  expectedStartDate: z.coerce.date().optional().nullable(),
  hasApiNeed: z.boolean().default(false),
  hasCodPaymentNeed: z.boolean().default(false),
  hasWarehousingNeed: z.boolean().default(false),
  hasReverseLogisticsNeed: z.boolean().default(false),
  source: z.string().optional().nullable(),
  campaign: z.string().optional().nullable(),
  status: z.enum(["new", "assigned", "contacted", "in_review", "qualified", "proposal_sent", "negotiation", "unqualified", "disqualified", "converted", "lost", "duplicate"]).default("new"),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  score: z.coerce.number().int().min(0).max(100).default(0),
  stage: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent", "critical"]).default("medium"),
  ownerId: z.string().uuid().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
  lastContactAt: z.coerce.date().optional().nullable(),
  nextFollowUpAt: z.coerce.date().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
  lostReason: z.string().optional().nullable(),
  disqualificationReason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdById: z.string().uuid().optional().nullable(),
  updatedById: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).default([])
});

const opportunitySchema = z.object({
  customerId: z.string().uuid(),
  leadId: z.string().uuid().optional().nullable(),
  title: z.string().min(2),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.preprocess((value) => value === "" ? undefined : value, z.string().email().optional().nullable()),
  amount: z.coerce.number().positive("مبلغ فرصت باید بزرگ‌تر از صفر باشد."),
  expectedMonthlyRevenue: z.coerce.number().nonnegative().default(0),
  expectedShipmentCount: z.coerce.number().int().nonnegative().optional().nullable(),
  probability: z.coerce.number().int().min(0).max(100).default(10),
  stageId: z.string().uuid(),
  ownerId: z.string().uuid().optional().nullable(),
  source: z.string().optional().nullable(),
  serviceType: z.string().optional().nullable(),
  expectedCloseDate: z.coerce.date().optional().nullable(),
  status: z.enum(["open", "won", "lost"]).default("open"),
  priority: z.enum(["low", "medium", "high", "urgent", "critical"]).default("medium"),
  lostReason: z.string().optional().nullable(),
  competitor: z.string().optional().nullable(),
  nextStep: z.string().optional().nullable(),
  nextAction: z.string().optional().nullable(),
  nextFollowUpAt: z.coerce.date().optional().nullable(),
  originCities: z.array(z.string()).default([]),
  destinationCities: z.array(z.string()).default([]),
  shipmentType: z.string().optional().nullable(),
  deliverySLA: z.string().optional().nullable(),
  codRequired: z.boolean().default(false),
  apiIntegrationRequired: z.boolean().default(false),
  warehousingRequired: z.boolean().default(false),
  fulfillmentRequired: z.boolean().default(false),
  insuranceRequired: z.boolean().default(false),
  specialHandling: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});

const activitySchema = z.object({
  entityType: z.enum(["customer", "lead", "opportunity", "ticket", "task", "contract", "shipment", "general"]),
  entityId: z.string().uuid().optional().nullable(),
  activityType: z.enum(["call", "email", "meeting", "sms", "note", "system", "follow_up", "chat", "file", "whatsapp", "visit", "contract_review", "support_followup", "finance_followup", "other"]),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
  status: z.enum(["open", "completed", "cancelled", "needs_followup", "failed"]).default("open"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  result: z.enum(["successful", "no_answer", "busy", "not_interested", "interested", "needs_followup", "scheduled_meeting", "sent_proposal", "resolved", "unresolved"]).optional().nullable(),
  channel: z.enum(["phone", "in_person", "email", "sms", "whatsapp", "system", "internal", "other"]).optional().nullable(),
  relatedName: z.string().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
  occurredAt: z.coerce.date().optional(),
  activityAt: z.coerce.date().optional(),
  nextFollowUpAt: z.coerce.date().optional().nullable(),
  completedAt: z.coerce.date().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
  isPrivate: z.boolean().default(false)
});

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  type: z.string().default("general"),
  ownerId: z.string().uuid(),
  assignedById: z.string().uuid().optional().nullable(),
  entityType: z.enum(["customer", "lead", "opportunity", "ticket"]).optional().nullable(),
  entityId: z.string().uuid().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent", "critical"]).default("medium"),
  priorityScore: z.coerce.number().int().min(0).max(100).optional(),
  status: z.enum(["open", "in_progress", "done", "canceled", "overdue"]).default("open"),
  dueDate: z.coerce.date().optional().nullable(),
  resultNote: z.string().optional().nullable(),
  reminderAt: z.coerce.date().optional().nullable()
});

const ticketSchema = z.object({
  code: z.string().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
  opportunityId: z.string().uuid().optional().nullable(),
  subject: z.string().min(2),
  description: z.string().min(2),
  type: z.string().default("general_request"),
  typeScore: z.coerce.number().int().optional(),
  channel: z.string().default("phone"),
  channelScore: z.coerce.number().int().optional(),
  status: z.enum(["open", "pending", "in_progress", "escalated", "resolved", "closed", "canceled"]).default("open"),
  statusScore: z.coerce.number().int().optional(),
  priority: z.enum(["low", "medium", "high", "urgent", "critical"]).default("medium"),
  priorityScore: z.coerce.number().int().optional(),
  ownerId: z.string().uuid().optional().nullable(),
  team: z.string().default("support"),
  category: z.string().optional().nullable(),
  firstResponseAt: z.coerce.date().optional().nullable(),
  slaDueAt: z.coerce.date().optional().nullable(),
  resolvedAt: z.coerce.date().optional().nullable(),
  closedAt: z.coerce.date().optional().nullable(),
  resolution: z.string().optional().nullable(),
  cancelReason: z.string().optional().nullable(),
  internalNote: z.string().optional().nullable(),
  tags: z.array(z.string()).default([])
});

function signAccess(user: AuthUser) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name, permissions: user.permissions }, accessSecret, { expiresIn: accessTtl });
}

function signRefresh(userId: string) {
  return jwt.sign({ sub: userId }, refreshSecret, { expiresIn: refreshTtl });
}

async function getAuthUser(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } }
  });
  if (!user || user.status !== "active") return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    permissions: [...new Set(user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.key)))]
  };
}

async function audit(req: Request, action: string, entityType: string, entityId?: string | null, previousValue?: unknown, newValue?: unknown) {
  const json = (value: unknown) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  await prisma.auditLog.create({
    data: {
      actorId: req.user?.id,
      action,
      entityType,
      entityId: entityId ?? undefined,
      previousValue: json(previousValue) as Prisma.InputJsonValue,
      newValue: json(newValue) as Prisma.InputJsonValue,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    }
  });
}

function auth(required = true) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.get("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies.accessToken;
    if (!token) {
      if (!required) return next();
      return res.status(401).json({ message: "برای دسترسی باید وارد شوید." });
    }
    try {
      const decoded = jwt.verify(token, accessSecret) as jwt.JwtPayload;
      const user = await getAuthUser(String(decoded.sub));
      if (!user) return res.status(401).json({ message: "نشست کاربری معتبر نیست یا کاربر غیرفعال شده است." });
      req.user = user;
      next();
    } catch {
      res.status(401).json({ message: "نشست منقضی شده است. دوباره وارد شوید." });
    }
  };
}

function can(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "برای دسترسی باید وارد شوید." });
    const aliases: Record<string, string[]> = {
      "leads.read": ["lead.view"],
      "leads.create": ["lead.create"],
      "leads.update": ["lead.update"],
      "leads.delete": ["lead.delete"],
      "leads.convert": ["lead.convert"],
      "leads.assign": ["lead.assign"],
      "leads.export": ["lead.export"]
    };
    const allowed = [permission, ...(aliases[permission] ?? [])];
    if (!allowed.some((item) => req.user!.permissions.includes(item)) && !req.user.permissions.includes("*")) {
      return res.status(403).json({ message: "شما به این بخش دسترسی ندارید." });
    }
    next();
  };
}

function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({
        message: "اطلاعات فرم معتبر نیست.",
        errors: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
      });
    }
    req.body = result.data;
    next();
  };
}

function parseList(req: Request) {
  return listSchema.parse(req.query);
}

function meta(page: number, pageSize: number, total: number) {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

const statusLabels: Record<string, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  prospect: "بالقوه",
  at_risk: "ریسک‌دار",
  lost: "از دست رفته",
  new: "جدید",
  assigned: "تخصیص‌یافته",
  contacted: "تماس گرفته‌شده",
  in_review: "در حال بررسی",
  qualified: "واجد شرایط",
  proposal_sent: "ارسال پیشنهاد",
  negotiation: "در مذاکره",
  disqualified: "رد شده",
  converted: "تبدیل‌شده",
  unqualified: "فاقد شرایط",
  duplicate: "تکراری",
  open: "باز",
  pending: "در انتظار",
  in_progress: "در حال انجام",
  escalated: "ارجاع شده",
  resolved: "حل‌شده",
  closed: "بسته",
  canceled: "لغوشده",
  won: "برنده",
  done: "انجام‌شده"
};

app.get("/api/health", (_req, res) => res.json({ ok: true, name: "CRM API" }));

app.post("/api/auth/login", authLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== "active" || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "ایمیل یا رمز عبور نادرست است." });
  }
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const authUser = await getAuthUser(user.id);
  if (!authUser) return res.status(401).json({ message: "کاربر مجاز نیست." });
  const accessToken = signAccess(authUser);
  const refreshToken = signRefresh(user.id);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  req.user = authUser;
  await audit(req, "auth.login", "user", user.id);
  res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax" });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax" });
  res.json({ accessToken, refreshToken, user: authUser });
});

app.post("/api/auth/logout", auth(), async (req, res) => {
  await prisma.refreshToken.updateMany({ where: { userId: req.user!.id, revokedAt: null }, data: { revokedAt: new Date() } });
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  await audit(req, "auth.logout", "user", req.user!.id);
  res.json({ message: "با موفقیت خارج شدید." });
});

app.post("/api/auth/refresh", async (req, res) => {
  const token = req.body?.refreshToken ?? req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "نشست تازه‌سازی موجود نیست." });
  try {
    const decoded = jwt.verify(token, refreshSecret) as jwt.JwtPayload;
    const records = await prisma.refreshToken.findMany({ where: { userId: String(decoded.sub), revokedAt: null } });
    const matched = await Promise.all(records.map(async (record) => (await bcrypt.compare(token, record.tokenHash)) ? record : null));
    if (!matched.some(Boolean)) return res.status(401).json({ message: "نشست تازه‌سازی معتبر نیست." });
    const user = await getAuthUser(String(decoded.sub));
    if (!user) return res.status(401).json({ message: "کاربر مجاز نیست." });
    const accessToken = signAccess(user);
    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax" });
    res.json({ accessToken, user });
  } catch {
    res.status(401).json({ message: "نشست تازه‌سازی منقضی شده است." });
  }
});

app.get("/api/auth/me", auth(), (req, res) => res.json({ user: req.user }));

app.get("/api/users", auth(), can("users.read"), async (req, res) => {
  const { page, pageSize, search } = parseList(req);
  const where: Prisma.UserWhereInput = search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : {};
  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" }, include: { roles: { include: { role: true } }, team: true } }),
    prisma.user.count({ where })
  ]);
  res.json({ data: data.map(({ passwordHash: _passwordHash, ...user }) => user), meta: meta(page, pageSize, total) });
});

app.post("/api/users", auth(), can("users.create"), validate(userSchema.extend({ password: z.string().min(8) })), async (req, res) => {
  const { roleIds = [], password, ...payload } = req.body;
  const created = await prisma.user.create({
    data: {
      ...payload,
      passwordHash: await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS ?? 12)),
      roles: { create: roleIds.map((roleId: string) => ({ roleId })) }
    },
    include: { roles: { include: { role: true } } }
  });
  await audit(req, "users.create", "user", created.id, undefined, { email: created.email, name: created.name });
  res.status(201).json(created);
});

app.get("/api/users/:id", auth(), can("users.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const user = await prisma.user.findUnique({ where: { id }, include: { roles: { include: { role: true } }, team: true } });
  if (!user) return res.status(404).json({ message: "کاربر پیدا نشد." });
  const { passwordHash: _passwordHash, ...safe } = user;
  res.json(safe);
});

app.patch("/api/users/:id", auth(), can("users.update"), validate(userSchema.partial()), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.user.findUnique({ where: { id }, include: { roles: true } });
  if (!previous) return res.status(404).json({ message: "کاربر پیدا نشد." });
  const { roleIds, password, ...payload } = req.body;
  const updated = await prisma.$transaction(async (tx) => {
    if (roleIds) {
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.userRole.createMany({ data: roleIds.map((roleId: string) => ({ userId: id, roleId })) });
    }
    return tx.user.update({
      where: { id },
      data: { ...payload, ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) },
      include: { roles: { include: { role: true } } }
    });
  });
  await audit(req, "users.update", "user", id, previous, updated);
  res.json(updated);
});

app.patch("/api/users/:id/disable", auth(), can("users.disable"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const updated = await prisma.user.update({ where: { id }, data: { status: "disabled" } });
  await audit(req, "users.disable", "user", id);
  res.json(updated);
});

app.patch("/api/users/:id/enable", auth(), can("users.update"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const updated = await prisma.user.update({ where: { id }, data: { status: "active" } });
  await audit(req, "users.enable", "user", id);
  res.json(updated);
});

app.get("/api/roles", auth(), can("roles.read"), async (_req, res) => {
  const data = await prisma.role.findMany({ include: { permissions: { include: { permission: true } } }, orderBy: { name: "asc" } });
  res.json({ data, meta: meta(1, data.length || 1, data.length) });
});

app.post("/api/roles", auth(), can("roles.create"), validate(roleSchema), async (req, res) => {
  const { permissionIds = [], ...payload } = req.body;
  const role = await prisma.role.create({ data: { ...payload, permissions: { create: permissionIds.map((permissionId: string) => ({ permissionId })) } } });
  await audit(req, "roles.create", "role", role.id, undefined, role);
  res.status(201).json(role);
});

app.get("/api/roles/:id", auth(), can("roles.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const role = await prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } } } });
  if (!role) return res.status(404).json({ message: "نقش پیدا نشد." });
  res.json(role);
});

app.patch("/api/roles/:id", auth(), can("roles.update"), validate(roleSchema.partial()), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.role.findUnique({ where: { id }, include: { permissions: true } });
  if (!previous) return res.status(404).json({ message: "نقش پیدا نشد." });
  const { permissionIds, ...payload } = req.body;
  const role = await prisma.$transaction(async (tx) => {
    if (permissionIds) {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.rolePermission.createMany({ data: permissionIds.map((permissionId: string) => ({ roleId: id, permissionId })) });
    }
    return tx.role.update({ where: { id }, data: payload, include: { permissions: { include: { permission: true } } } });
  });
  await audit(req, "roles.update", "role", id, previous, role);
  res.json(role);
});

app.delete("/api/roles/:id", auth(), can("roles.delete"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return res.status(404).json({ message: "نقش پیدا نشد." });
  if (role.isSystem) return res.status(409).json({ message: "نقش سیستمی قابل حذف نیست." });
  await prisma.role.delete({ where: { id } });
  await audit(req, "roles.delete", "role", id, role);
  res.status(204).send();
});

app.get("/api/permissions", auth(), can("roles.read"), async (_req, res) => {
  const data = await prisma.permission.findMany({ orderBy: [{ module: "asc" }, { key: "asc" }] });
  res.json({ data, meta: meta(1, data.length || 1, data.length) });
});

app.get("/api/notifications", auth(), async (req, res) => {
  const data = await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" }, take: 30 });
  res.json({ data, unread: data.filter((item) => !item.readAt).length });
});

app.patch("/api/notifications/:id/read", auth(), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const updated = await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  res.json(updated);
});

app.get("/api/search", auth(), async (req, res) => {
  const q = normalizeText(req.query.q);
  if (!q) return res.json({ data: [] });
  const [customers, leads, opportunities, tasks, tickets] = await prisma.$transaction([
    prisma.customer.findMany({ where: { deletedAt: null, OR: [{ name: { contains: q, mode: "insensitive" } }, { displayName: { contains: q, mode: "insensitive" } }, { mobile: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }, take: 5 }),
    prisma.lead.findMany({ where: { deletedAt: null, OR: [{ name: { contains: q, mode: "insensitive" } }, { companyName: { contains: q, mode: "insensitive" } }, { mobile: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }] }, take: 5 }),
    prisma.opportunity.findMany({ where: { deletedAt: null, OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, take: 5 }),
    prisma.task.findMany({ where: { deletedAt: null, OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, take: 5 }),
    prisma.ticket.findMany({ where: { deletedAt: null, OR: [{ code: { contains: q, mode: "insensitive" } }, { subject: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, take: 5 })
  ]);
  res.json({ data: [
    ...customers.map((item) => ({ type: "customer", label: item.displayName ?? item.name, subtitle: "مشتری", path: `/customers/${item.id}` })),
    ...leads.map((item) => ({ type: "lead", label: item.name, subtitle: "لید", path: `/leads/${item.id}` })),
    ...opportunities.map((item) => ({ type: "opportunity", label: item.title, subtitle: "فرصت", path: `/opportunities/${item.id}` })),
    ...tasks.map((item) => ({ type: "task", label: item.title, subtitle: "وظیفه", path: "/tasks" })),
    ...tickets.map((item) => ({ type: "ticket", label: item.subject, subtitle: "تیکت", path: "/tickets" }))
  ] });
});

app.post("/api/roles/:id/permissions", auth(), can("roles.update"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const permissionIds = z.array(z.string().uuid()).parse(req.body.permissionIds ?? []);
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: id } }),
    prisma.rolePermission.createMany({ data: permissionIds.map((permissionId) => ({ roleId: id, permissionId })) })
  ]);
  await audit(req, "roles.permissions.update", "role", id, undefined, { permissionIds });
  res.json({ message: "دسترسی‌های نقش به‌روزرسانی شد." });
});

function crud(config: {
  path: string;
  entity: string;
  delegate: any;
  schema: z.AnyZodObject;
  updateSchema?: z.AnyZodObject;
  permission: string;
  searchFields: string[];
  include?: object;
  softDelete?: boolean;
}) {
  app.get(`/api/${config.path}`, auth(), can(`${config.permission}.read`), async (req, res) => {
    const { page, pageSize, search, sortBy, sortOrder } = parseList(req);
    const where: any = { ...(config.softDelete ? { deletedAt: null } : {}) };
    if (search) where.OR = config.searchFields.map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
    const [data, total] = await prisma.$transaction([
      config.delegate.findMany({ where, include: config.include, skip: (page - 1) * pageSize, take: pageSize, orderBy: { [sortBy]: sortOrder } }),
      config.delegate.count({ where })
    ]);
    res.json({ data, meta: meta(page, pageSize, total) });
  });

  app.post(`/api/${config.path}`, auth(), can(`${config.permission}.create`), validate(config.schema), async (req, res) => {
    const created = await config.delegate.create({ data: req.body, include: config.include });
    await audit(req, `${config.permission}.create`, config.entity, created.id, undefined, created);
    res.status(201).json(created);
  });

  app.get(`/api/${config.path}/:id`, auth(), can(`${config.permission}.read`), async (req, res) => {
    const { id } = idSchema.parse(req.params);
    const item = await config.delegate.findUnique({ where: { id }, include: config.include });
    if (!item || item.deletedAt) return res.status(404).json({ message: "رکورد پیدا نشد." });
    res.json(item);
  });

  app.patch(`/api/${config.path}/:id`, auth(), can(`${config.permission}.update`), validate(config.updateSchema ?? config.schema.partial()), async (req, res) => {
    const { id } = idSchema.parse(req.params);
    const previous = await config.delegate.findUnique({ where: { id } });
    if (!previous || previous.deletedAt) return res.status(404).json({ message: "رکورد پیدا نشد." });
    const updated = await config.delegate.update({ where: { id }, data: req.body, include: config.include });
    await audit(req, `${config.permission}.update`, config.entity, id, previous, updated);
    res.json(updated);
  });

  app.delete(`/api/${config.path}/:id`, auth(), can(`${config.permission}.delete`), async (req, res) => {
    const { id } = idSchema.parse(req.params);
    const previous = await config.delegate.findUnique({ where: { id } });
    if (!previous || previous.deletedAt) return res.status(404).json({ message: "رکورد پیدا نشد." });
    if (config.softDelete) await config.delegate.update({ where: { id }, data: { deletedAt: new Date() } });
    else await config.delegate.delete({ where: { id } });
    await audit(req, `${config.permission}.delete`, config.entity, id, previous);
    res.status(204).send();
  });
}

const customerInclude = { owner: { select: { id: true, name: true, email: true } }, assignedTeam: true };

function normalizeText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

async function generateCustomerCode() {
  const count = await prisma.customer.count();
  return `CUS-${String(count + 1).padStart(6, "0")}`;
}

function customerDisplayName(data: any) {
  return normalizeText(data.displayName) ?? normalizeText(data.companyName) ?? normalizeText(data.fullName) ?? normalizeText(data.name) ?? "مشتری بدون نام";
}

function customerPrismaData(input: any, customerCode?: string, options: { allowRelationDisconnect?: boolean } = {}) {
  const {
    allowDuplicate: _allowDuplicate,
    ownerId,
    assignedTeamId,
    ...data
  } = input;

  const displayName = customerDisplayName(data);
  const name = normalizeText(data.name) ?? displayName;

  return {
    ...data,
    customerCode: normalizeText(data.customerCode) ?? customerCode,
    name,
    fullName: normalizeText(data.fullName) ?? name,
    displayName,
    mobile: normalizeText(data.mobile) ?? normalizeText(data.phone),
    tier: normalizeText(data.tier) ?? data.tierLevel ?? undefined,
    website: normalizeText(data.website),
    ...(ownerId
      ? { owner: { connect: { id: ownerId } } }
      : ownerId === null && options.allowRelationDisconnect
        ? { owner: { disconnect: true } }
        : {}),
    ...(assignedTeamId
      ? { assignedTeam: { connect: { id: assignedTeamId } } }
      : assignedTeamId === null && options.allowRelationDisconnect
        ? { assignedTeam: { disconnect: true } }
        : {})
  };
}

async function findCustomerDuplicates(input: Record<string, unknown>, excludeId?: string) {
  const checks = [
    ["mobile", input.mobile],
    ["phone", input.phone],
    ["email", input.email],
    ["nationalId", input.nationalId],
    ["economicCode", input.economicCode],
    ["companyName", input.companyName],
    ["fullName", input.fullName ?? input.name]
  ].filter(([, value]) => normalizeText(value));
  if (!checks.length) return [];
  return prisma.customer.findMany({
    where: {
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: checks.map(([field, value]) => ({ [field as string]: { equals: normalizeText(value), mode: "insensitive" } }))
    },
    take: 8,
    select: { id: true, customerCode: true, displayName: true, name: true, companyName: true, mobile: true, phone: true, email: true, nationalId: true, economicCode: true, status: true }
  });
}

async function customerSummary(id: string) {
  const [customer, openDealsCount, wonDealsCount, lostDealsCount, openTicketsCount, criticalTicketsCount, tasksCount, lastActivity] = await prisma.$transaction([
    prisma.customer.findUnique({ where: { id }, include: customerInclude }),
    prisma.opportunity.count({ where: { customerId: id, status: "open", deletedAt: null } }),
    prisma.opportunity.count({ where: { customerId: id, status: "won", deletedAt: null } }),
    prisma.opportunity.count({ where: { customerId: id, status: "lost", deletedAt: null } }),
    prisma.ticket.count({ where: { customerId: id, status: { in: ["open", "pending"] } } }),
    prisma.ticket.count({ where: { customerId: id, priority: { in: ["critical", "urgent"] }, status: { in: ["open", "pending"] } } }),
    prisma.task.count({ where: { entityType: "customer", entityId: id, status: { in: ["open", "in_progress", "overdue"] } } }),
    prisma.activity.findFirst({ where: { entityType: "customer", entityId: id }, orderBy: { occurredAt: "desc" } })
  ]);
  if (!customer || customer.deletedAt) return null;
  let healthScore = 75;
  const lastInteractionAt = customer.lastInteractionAt ?? lastActivity?.occurredAt;
  if (lastInteractionAt) {
    const days = (Date.now() - lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24);
    if (days > 60) healthScore -= 25;
    else if (days > 30) healthScore -= 15;
    else if (days < 14) healthScore += 8;
  } else {
    healthScore -= 20;
  }
  if (criticalTicketsCount > 0) healthScore -= 25;
  if (openDealsCount > 0) healthScore += 10;
  if (customer.status === "at_risk") healthScore -= 25;
  if (customer.status === "lost" || customer.status === "blocked") healthScore -= 40;
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));
  const churnRisk = healthScore < 40 ? "high" : healthScore < 65 ? "medium" : "low";
  return { customer, metrics: { openDealsCount, wonDealsCount, lostDealsCount, openTicketsCount, criticalTicketsCount, tasksCount, healthScore, churnRisk, lastInteractionAt } };
}

function customerWhereFromQuery(req: Request): Prisma.CustomerWhereInput {
  const q = req.query;
  const where: Prisma.CustomerWhereInput = { deletedAt: null };
  const search = normalizeText(q.search);
  if (search) {
    where.OR = ["name", "fullName", "displayName", "companyName", "mobile", "phone", "email", "customerCode", "nationalId", "economicCode"].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  }
  if (normalizeText(q.status)) where.status = q.status as any;
  if (normalizeText(q.type)) where.type = q.type as any;
  if (normalizeText(q.segment)) where.segment = { contains: String(q.segment), mode: "insensitive" };
  if (normalizeText(q.tierLevel)) where.tierLevel = q.tierLevel as any;
  if (normalizeText(q.ownerId)) where.ownerId = String(q.ownerId);
  if (q.withoutOwner === "true") where.ownerId = null;
  if (normalizeText(q.city)) where.city = { contains: String(q.city), mode: "insensitive" };
  if (normalizeText(q.province)) where.province = { contains: String(q.province), mode: "insensitive" };
  if (normalizeText(q.source)) where.source = { contains: String(q.source), mode: "insensitive" };
  if (q.atRisk === "true") (where as any).OR = [...((where as any).OR ?? []), { status: "at_risk" }, { churnRisk: "high" }, { healthScore: { lte: 45 } }];
  if (q.noRecentActivity === "true") (where as any).OR = [...((where as any).OR ?? []), { lastInteractionAt: null }, { lastInteractionAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }];
  return where;
}

async function notifyAssignment(userId: string | null | undefined, title: string, message: string, entityType: string, entityId: string, path: string) {
  if (!userId) return;
  await prisma.notification.create({ data: { userId, title, message, entityType, entityId, path } }).catch(() => undefined);
}

app.get("/api/customers/duplicates", auth(), can("customers.read"), async (req, res) => {
  const duplicates = await findCustomerDuplicates(req.query as Record<string, unknown>);
  res.json({ data: duplicates, meta: meta(1, duplicates.length || 1, duplicates.length) });
});

app.get("/api/customers/export", auth(), can("customers.export"), async (req, res) => {
  const canViewSensitive = req.user!.permissions.includes("customers.view_sensitive") || req.user!.permissions.includes("*");
  const rows = await prisma.customer.findMany({ where: customerWhereFromQuery(req), include: { owner: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  const exportRows = rows.map((row) => ({
    customerCode: row.customerCode,
    displayName: row.displayName ?? row.name,
    mobile: canViewSensitive ? row.mobile : row.mobile?.replace(/^(.{4}).+(.{2})$/, "$1*****$2"),
    phone: canViewSensitive ? row.phone : row.phone?.replace(/^(.{4}).+(.{2})$/, "$1*****$2"),
    email: canViewSensitive ? row.email : row.email?.replace(/(^.).+(@.+$)/, "$1***$2"),
    status: row.status,
    tier: row.tierLevel,
    owner: row.owner?.name,
    city: row.city,
    healthScore: row.healthScore
  }));
  await audit(req, "customers.export", "customer", null, undefined, { rows: exportRows.length });
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment("customers.csv");
  res.send(`\uFEFF${toCsv(exportRows)}`);
});

app.post("/api/customers/import", auth(), can("customers.import"), async (req, res) => {
  const rows = parseCsv(String(req.body ?? ""));
  let imported = 0;
  const errors: Array<{ row: number; message: string }> = [];
  for (const [index, row] of rows.entries()) {
    const parsed = customerSchema.safeParse({
      type: row.type || "individual",
      fullName: row.fullName || row.name,
      name: row.name || row.fullName || row.companyName,
      companyName: row.companyName,
      mobile: row.mobile || row.phone,
      phone: row.phone,
      email: row.email || undefined,
      status: row.status || "prospect",
      tierLevel: row.tierLevel || "bronze",
      source: row.source,
      city: row.city,
      province: row.province,
      tags: []
    });
    if (!parsed.success) {
      errors.push({ row: index + 2, message: "اطلاعات مشتری معتبر نیست." });
      continue;
    }
    const duplicates = await findCustomerDuplicates(parsed.data);
    if (duplicates.length) {
      errors.push({ row: index + 2, message: "مشتری تکراری است." });
      continue;
    }
    await prisma.customer.create({ data: customerPrismaData(parsed.data, await generateCustomerCode()) });
    imported += 1;
  }
  await audit(req, "customers.import", "customer", null, undefined, { totalRows: rows.length, imported, failed: errors.length });
  res.json({ totalRows: rows.length, importedRows: imported, failedRows: errors.length, duplicateRows: errors.filter((e) => e.message.includes("تکراری")).length, errors });
});

app.patch("/api/customers/bulk", auth(), can("customers.bulk_update"), async (req, res) => {
  const body = z.object({
    ids: z.array(z.string().uuid()).min(1),
    ownerId: z.string().uuid().nullable().optional(),
    status: z.enum(["active", "inactive", "prospect", "at_risk", "lost", "blocked"]).optional(),
    tag: z.string().optional()
  }).parse(req.body);

  const data: Prisma.CustomerUncheckedUpdateManyInput = {};

  if ("ownerId" in body) data.ownerId = body.ownerId;
  if (body.status) data.status = body.status;

  const updated = await prisma.customer.updateMany({
    where: { id: { in: body.ids }, deletedAt: null },
    data
  });

  if (body.tag) {
    const customers = await prisma.customer.findMany({
      where: { id: { in: body.ids }, deletedAt: null }
    });

    await Promise.all(
      customers.map((customer) =>
        prisma.customer.update({
          where: { id: customer.id },
          data: {
            tags: [...new Set([...customer.tags, body.tag!])]
          }
        })
      )
    );
  }

  await audit(req, "customers.bulk_update", "customer", null, undefined, body);

  res.json({ updated: updated.count });
});

app.get("/api/customers", auth(), can("customers.read"), async (req, res) => {
  const { page, pageSize } = parseList(req);
  const sortBy = String(req.query.sortBy ?? "createdAt");
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
  const allowedSort = new Set(["name", "displayName", "createdAt", "updatedAt", "lastInteractionAt", "clv", "totalRevenue", "healthScore", "openDealsCount"]);
  const where = customerWhereFromQuery(req);
  const [data, total] = await prisma.$transaction([
    prisma.customer.findMany({ where, include: customerInclude, skip: (page - 1) * pageSize, take: pageSize, orderBy: { [allowedSort.has(sortBy) ? sortBy : "createdAt"]: sortOrder } }),
    prisma.customer.count({ where })
  ]);
  res.json({ data, meta: meta(page, pageSize, total) });
});

app.post("/api/customers", auth(), can("customers.create"), validate(customerSchema), async (req, res) => {
  const duplicates = await findCustomerDuplicates(req.body);
  if (duplicates.length && !req.body.allowDuplicate) {
    return res.status(409).json({ message: "مشتری مشابه پیدا شد. برای ادامه ثبت، تأیید کنید.", duplicates });
  }
  const created = await prisma.customer.create({ data: customerPrismaData(req.body, await generateCustomerCode()), include: customerInclude });
  await audit(req, "customers.create", "customer", created.id, undefined, created);
  res.status(201).json(created);
});

app.get("/api/customers/:id/summary", auth(), can("customers.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const summary = await customerSummary(id);
  if (!summary) return res.status(404).json({ message: "مشتری پیدا نشد." });
  res.json(summary);
});

app.get("/api/customers/:id/audit-logs", auth(), can("customers.view_audit_logs"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const data = await prisma.auditLog.findMany({ where: { entityType: "customer", entityId: id }, include: { actor: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  res.json({ data, meta: meta(1, data.length || 1, data.length) });
});

app.post("/api/customers/:id/activities", auth(), can("activities.create"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const created = await createActivity(req, { ...req.body, entityType: "customer", entityId: id });
  await prisma.customer.update({ where: { id }, data: { lastInteractionAt: created.occurredAt } });
  await audit(req, "customers.activity.create", "customer", id, undefined, created);
  res.status(201).json(created);
});

app.post("/api/customers/:id/tasks", auth(), can("tasks.create"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const payload = taskSchema.parse({ ...req.body, entityType: "customer", entityId: id });
  const created = await prisma.task.create({ data: payload, include: { owner: { select: { id: true, name: true } } } });
  await audit(req, "customers.task.create", "customer", id, undefined, created);
  res.status(201).json(created);
});

app.post("/api/customers/:id/opportunities", auth(), can("opportunities.create"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const payload = opportunitySchema.parse({ ...req.body, customerId: id });
  const created = await prisma.opportunity.create({ data: payload, include: { stage: true, customer: true, owner: { select: { id: true, name: true } } } });
  await audit(req, "customers.opportunity.create", "customer", id, undefined, created);
  res.status(201).json(created);
});

app.post("/api/customers/:id/tickets", auth(), can("tickets.create"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const payload = ticketSchema.parse({ ...req.body, customerId: id });
  const created = await prisma.ticket.create({ data: payload, include: { owner: { select: { id: true, name: true } } } });
  await audit(req, "customers.ticket.create", "customer", id, undefined, created);
  res.status(201).json(created);
});

app.patch("/api/customers/:id/owner", auth(), can("customers.assign_owner"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const ownerId = z.string().uuid().nullable().parse(req.body.ownerId);
  const previous = await prisma.customer.findUnique({ where: { id } });
  const updated = await prisma.customer.update({ where: { id }, data: { ownerId }, include: customerInclude });
  await audit(req, "customers.owner.update", "customer", id, previous, updated);
  res.json(updated);
});

app.patch("/api/customers/:id/status", auth(), can("customers.update"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const status = z.enum(["active", "inactive", "prospect", "at_risk", "lost", "blocked"]).parse(req.body.status);
  const previous = await prisma.customer.findUnique({ where: { id } });
  const updated = await prisma.customer.update({ where: { id }, data: { status }, include: customerInclude });
  await audit(req, "customers.status.update", "customer", id, previous, updated);
  res.json(updated);
});

app.get("/api/customers/:id", auth(), can("customers.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const customer = await prisma.customer.findUnique({ where: { id }, include: customerInclude });
  if (!customer || customer.deletedAt) return res.status(404).json({ message: "مشتری پیدا نشد." });
  res.json(customer);
});

app.patch("/api/customers/:id", auth(), can("customers.update"), validate(customerSchema.partial()), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.customer.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "مشتری پیدا نشد." });
  const duplicates = await findCustomerDuplicates(req.body, id);
  if (duplicates.length && !req.body.allowDuplicate) {
    return res.status(409).json({ message: "مشتری مشابه پیدا شد. برای ادامه ویرایش، تأیید کنید.", duplicates });
  }
  const updated = await prisma.customer.update({ where: { id }, data: customerPrismaData(req.body, undefined, { allowRelationDisconnect: true }), include: customerInclude });
  await audit(req, "customers.update", "customer", id, previous, updated);
  res.json(updated);
});

app.delete("/api/customers/:id", auth(), can("customers.delete"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.customer.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "مشتری پیدا نشد." });
  await prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit(req, "customers.delete", "customer", id, previous);
  res.status(204).send();
});

const leadInclude = { owner: { select: { id: true, name: true, email: true } } };
const leadStatusProbability: Record<string, number> = {
  new: 5,
  assigned: 10,
  contacted: 15,
  in_review: 25,
  qualified: 40,
  proposal_sent: 60,
  negotiation: 75,
  converted: 100,
  unqualified: 0,
  disqualified: 0,
  lost: 0,
  duplicate: 0
};
const leadPriorityScore: Record<string, number> = { low: 20, medium: 50, high: 75, urgent: 90, critical: 95 };

function splitList(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return typeof value === "string" ? value.split(/[،,]/).map((item) => item.trim()).filter(Boolean) : [];
}

function ensureLeadPayload(input: any, req: Request, partial = false) {
  const data = { ...input };
  const personalName = [normalizeText(data.firstName), normalizeText(data.lastName)].filter(Boolean).join(" ");
  const displayName = normalizeText(data.name) ?? normalizeText(data.fullName) ?? normalizeText(personalName) ?? normalizeText(data.companyName) ?? normalizeText(data.businessName);
  const contact = normalizeText(data.mobile) ?? normalizeText(data.phone);

  if (!partial || displayName !== undefined) data.name = displayName;
  if (!partial && !displayName) throw Object.assign(new Error("نام لید یا نام شرکت الزامی است."), { statusCode: 422 });
  if (!partial && !contact) throw Object.assign(new Error("شماره موبایل یا تلفن الزامی است."), { statusCode: 422 });
  if (data.mobile && !/^09\d{9}$/.test(String(data.mobile))) throw Object.assign(new Error("شماره موبایل ایران معتبر نیست."), { statusCode: 422 });
  if (!partial && !normalizeText(data.source)) throw Object.assign(new Error("منبع لید الزامی است."), { statusCode: 422 });
  if (!partial && !normalizeText(data.ownerId)) data.ownerId = req.user!.id;
  if (!partial && !normalizeText(data.ownerId)) throw Object.assign(new Error("مسئول پیگیری الزامی است."), { statusCode: 422 });
  if (data.status === "converted" && !data.convertedCustomerId) throw Object.assign(new Error("ثبت وضعیت تبدیل‌شده فقط از مسیر تبدیل به مشتری مجاز است."), { statusCode: 422 });
  if (data.status === "lost" && !normalizeText(data.lostReason)) throw Object.assign(new Error("برای لید از دست رفته، دلیل الزامی است."), { statusCode: 422 });
  if (data.status === "disqualified" && !normalizeText(data.disqualificationReason)) throw Object.assign(new Error("برای لید رد شده، دلیل الزامی است."), { statusCode: 422 });
  if (data.nextFollowUpAt && new Date(data.nextFollowUpAt).getTime() < Date.now() && !req.user!.permissions.includes("*")) {
    throw Object.assign(new Error("تاریخ پیگیری بعدی نباید در گذشته باشد."), { statusCode: 422 });
  }

  if ("originCities" in data) data.originCities = splitList(data.originCities);
  if ("destinationCities" in data) data.destinationCities = splitList(data.destinationCities);
  const status = data.status ?? "new";
  const expectedProbability = leadStatusProbability[status] ?? 5;
  const canOverride = req.user!.permissions.includes("*") || req.user!.permissions.includes("lead.overrideProbability");
  data.probability = canOverride && data.probability !== undefined ? Number(data.probability) : expectedProbability;

  const priorityScore = leadPriorityScore[data.priority ?? "medium"] ?? 50;
  const statusScore = Math.round((data.probability ?? expectedProbability) / 4);
  const volumeScore = Number(data.monthlyShipmentVolume ?? 0) >= 10000 ? 25 : Number(data.monthlyShipmentVolume ?? 0) >= 1000 ? 15 : Number(data.monthlyShipmentVolume ?? 0) > 0 ? 8 : 0;
  const serviceScore = data.hasApiNeed || data.hasCodPaymentNeed || data.mainServiceNeed === "API_INTEGRATION" || data.mainServiceNeed === "COD" ? 10 : 0;
  const sourceScore = ["REFERRAL", "DIRECT_SALES"].includes(String(data.source ?? "")) ? 10 : 0;
  data.score = Math.max(0, Math.min(100, Math.round(priorityScore * 0.45 + statusScore + volumeScore + serviceScore + sourceScore)));
  data.fullName = normalizeText(data.fullName) ?? displayName;
  data.updatedById = req.user!.id;
  if (!partial) data.createdById = req.user!.id;
  return data;
}

function leadWhereFromQuery(req: Request): Prisma.LeadWhereInput {
  const q = req.query;
  const where: Prisma.LeadWhereInput = { deletedAt: null, isDeleted: false };
  const search = normalizeText(q.search ?? q.q);
  if (search) {
    where.OR = ["name", "fullName", "companyName", "businessName", "phone", "mobile", "email", "description", "notes"].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  }
  if (normalizeText(q.status)) where.status = q.status as any;
  if (normalizeText(q.source)) where.source = String(q.source);
  if (normalizeText(q.priority)) where.priority = q.priority as any;
  if (normalizeText(q.ownerId)) where.ownerId = String(q.ownerId);
  if (q.withoutFollowUp === "true") where.nextFollowUpAt = null;
  if (q.overdue === "true") where.nextFollowUpAt = { lt: new Date() };
  if (normalizeText(q.createdFrom) || normalizeText(q.createdTo)) where.createdAt = { ...(normalizeText(q.createdFrom) ? { gte: new Date(String(q.createdFrom)) } : {}), ...(normalizeText(q.createdTo) ? { lte: new Date(String(q.createdTo)) } : {}) };
  if (normalizeText(q.nextFollowUpFrom) || normalizeText(q.nextFollowUpTo)) where.nextFollowUpAt = { ...(normalizeText(q.nextFollowUpFrom) ? { gte: new Date(String(q.nextFollowUpFrom)) } : {}), ...(normalizeText(q.nextFollowUpTo) ? { lte: new Date(String(q.nextFollowUpTo)) } : {}) };
  return where;
}

app.get("/api/leads/export", auth(), can("leads.export"), async (req, res) => {
  const rows = await prisma.lead.findMany({ where: leadWhereFromQuery(req), include: leadInclude, orderBy: { createdAt: "desc" } });
  const exportRows = rows.map((row) => ({
    name: row.name,
    companyName: row.companyName ?? row.businessName,
    phone: row.mobile ?? row.phone,
    email: row.email,
    source: row.source,
    status: row.status,
    probability: row.probability,
    priority: row.priority,
    monthlyShipmentVolume: row.monthlyShipmentVolume,
    owner: row.owner?.name,
    createdAt: row.createdAt,
    lastContactAt: row.lastContactAt,
    nextFollowUpAt: row.nextFollowUpAt
  }));
  await audit(req, "leads.export", "lead", null, undefined, { rows: exportRows.length });
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment("leads.csv");
  res.send(`\uFEFF${toCsv(exportRows)}`);
});

app.get("/api/leads", auth(), can("leads.read"), async (req, res) => {
  const { page, pageSize } = parseList(req);
  const sortBy = String(req.query.sortBy ?? "createdAt");
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
  const allowedSort = new Set(["createdAt", "updatedAt", "probability", "priority", "score", "lastContactAt", "nextFollowUpAt", "monthlyShipmentVolume"]);
  const where = leadWhereFromQuery(req);
  const [data, total] = await prisma.$transaction([
    prisma.lead.findMany({ where, include: leadInclude, skip: (page - 1) * pageSize, take: pageSize, orderBy: { [allowedSort.has(sortBy) ? sortBy : "createdAt"]: sortOrder } }),
    prisma.lead.count({ where })
  ]);
  res.json({ data, meta: meta(page, pageSize, total) });
});

app.post("/api/leads", auth(), can("leads.create"), validate(leadSchema), async (req, res) => {
  try {
    const data = ensureLeadPayload(req.body, req);
    const created = await prisma.lead.create({ data, include: leadInclude });
    await prisma.activity.create({ data: { entityType: "lead", entityId: created.id, activityType: "system", title: "ایجاد لید", description: "لید جدید در سیستم ثبت شد.", createdById: req.user!.id } });
    await audit(req, "leads.create", "lead", created.id, undefined, created);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ message: err.message ?? "ثبت لید ناموفق بود." });
  }
});

app.get("/api/leads/:id/activities", auth(), can("leads.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const data = await prisma.activity.findMany({ where: { entityType: "lead", entityId: id }, include: { createdBy: { select: { id: true, name: true } } }, orderBy: { occurredAt: "desc" } });
  res.json({ data, meta: meta(1, data.length || 1, data.length) });
});

app.post("/api/leads/:id/activities", auth(), can("activities.create"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead || lead.deletedAt || lead.isDeleted) return res.status(404).json({ message: "لید پیدا نشد." });
  const created = await prisma.$transaction(async (tx) => {
    const payload = activitySchema.parse({ ...req.body, entityType: "lead", entityId: id });
    validateActivityRules(payload);
    const activityAt = payload.activityAt ?? payload.occurredAt ?? new Date();
    const activity = await tx.activity.create({ data: { ...payload, entityId: id, relatedName: lead.companyName ?? lead.businessName ?? lead.name, occurredAt: activityAt, activityAt, metadata: payload.metadata === null ? undefined : payload.metadata, createdById: req.user!.id } as any, include: { createdBy: { select: { id: true, name: true } } } });
    await tx.lead.update({ where: { id }, data: { lastContactAt: new Date(), nextFollowUpAt: req.body.nextFollowUpAt ? new Date(req.body.nextFollowUpAt) : lead.nextFollowUpAt } });
    return activity;
  });
  await audit(req, "leads.activity.create", "lead", id, undefined, created);
  res.status(201).json(created);
});

app.patch("/api/leads/:id/status", auth(), can("leads.update"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const body = z.object({ status: leadSchema.shape.status, lostReason: z.string().optional(), disqualificationReason: z.string().optional() }).parse(req.body);
  const previous = await prisma.lead.findUnique({ where: { id } });
  if (!previous || previous.deletedAt || previous.isDeleted) return res.status(404).json({ message: "لید پیدا نشد." });
  try {
    const data = ensureLeadPayload({ status: body.status, lostReason: body.lostReason, disqualificationReason: body.disqualificationReason }, req, true);
    const updated = await prisma.lead.update({ where: { id }, data, include: leadInclude });
    await prisma.activity.create({ data: { entityType: "lead", entityId: id, activityType: "system", title: "تغییر وضعیت لید", description: `وضعیت لید به ${statusLabels[updated.status] ?? updated.status} تغییر کرد.`, createdById: req.user!.id } });
    await audit(req, "leads.status.update", "lead", id, previous, updated);
    res.json(updated);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ message: err.message ?? "تغییر وضعیت ناموفق بود." });
  }
});

app.post("/api/leads/:id/assign", auth(), can("leads.assign"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const ownerId = z.string().uuid().parse(req.body.ownerId);
  const previous = await prisma.lead.findUnique({ where: { id } });
  if (!previous || previous.deletedAt || previous.isDeleted) return res.status(404).json({ message: "لید پیدا نشد." });
  const updated = await prisma.lead.update({ where: { id }, data: { ownerId, status: previous.status === "new" ? "assigned" : previous.status, updatedById: req.user!.id }, include: leadInclude });
  await prisma.activity.create({ data: { entityType: "lead", entityId: id, activityType: "system", title: "تغییر مسئول پیگیری", createdById: req.user!.id } });
  await audit(req, "leads.assign", "lead", id, previous, updated);
  res.json(updated);
});

app.post("/api/leads/:id/convert", auth(), can("leads.convert"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const body = z.object({ customerType: z.enum(["individual", "company"]).default("company"), allowDuplicate: z.boolean().optional(), linkCustomerId: z.string().uuid().optional() }).parse(req.body ?? {});
  const lead = await prisma.lead.findUnique({ where: { id }, include: leadInclude });
  if (!lead || lead.deletedAt || lead.isDeleted) return res.status(404).json({ message: "لید پیدا نشد." });
  if (lead.convertedAt || lead.convertedCustomerId) return res.status(409).json({ message: "این لید قبلاً تبدیل شده است." });
  if (!["qualified", "proposal_sent", "negotiation", "converted"].includes(lead.status)) return res.status(422).json({ message: "فقط لیدهای واجد شرایط، ارسال پیشنهاد یا در مذاکره قابل تبدیل هستند." });
  if (!lead.ownerId) return res.status(422).json({ message: "قبل از تبدیل، مسئول پیگیری را مشخص کنید." });
  if (!(lead.companyName || (lead.name && (lead.mobile || lead.phone)))) return res.status(422).json({ message: "برای تبدیل، نام شرکت یا نام شخص همراه شماره تماس الزامی است." });
  if (lead.mobile && !/^09\d{9}$/.test(lead.mobile)) return res.status(422).json({ message: "شماره موبایل لید معتبر نیست." });

  const duplicateInput = { mobile: lead.mobile, phone: lead.phone, email: lead.email, companyName: lead.companyName, fullName: lead.fullName ?? lead.name, economicCode: lead.economicCode, nationalId: lead.nationalId };
  const duplicates = await findCustomerDuplicates(duplicateInput);
  if (duplicates.length && !body.allowDuplicate && !body.linkCustomerId) {
    return res.status(409).json({ message: "مشتری مشابه پیدا شد. می‌توانید به مشتری موجود وصل کنید یا با تأیید مدیریتی مشتری جدید بسازید.", duplicates });
  }

  const nextCustomerCode = await generateCustomerCode();
  const result = await prisma.$transaction(async (tx) => {
    const linkedCustomer = body.linkCustomerId
      ? await tx.customer.findUnique({ where: { id: body.linkCustomerId } })
      : null;
    const customer = linkedCustomer ?? await tx.customer.create({
      data: {
        customerCode: nextCustomerCode,
        type: body.customerType,
        name: lead.companyName ?? lead.fullName ?? lead.name,
        fullName: lead.fullName ?? lead.name,
        displayName: lead.companyName ?? lead.businessName ?? lead.name,
        companyName: lead.companyName ?? lead.businessName,
        phone: lead.phone,
        mobile: lead.mobile ?? lead.phone,
        email: lead.email,
        website: lead.website,
        nationalId: lead.nationalId,
        economicCode: lead.economicCode,
        source: lead.source,
        ownerId: lead.ownerId,
        status: "prospect",
        segment: "تبدیل‌شده از لید",
        industry: lead.industry,
        tags: [...new Set([...lead.tags, "تبدیل‌شده از لید"])],
        customFields: JSON.parse(JSON.stringify({
          leadId: lead.id,
          businessType: lead.businessType,
          monthlyShipmentVolume: lead.monthlyShipmentVolume,
          averageDailyOrders: lead.averageDailyOrders,
          originCities: lead.originCities,
          destinationCities: lead.destinationCities,
          mainServiceNeed: lead.mainServiceNeed,
          painPoints: lead.painPoints
        })) as Prisma.InputJsonValue
      }
    });
    const converted = await tx.lead.update({ where: { id }, data: { status: "converted", probability: 100, convertedAt: new Date(), convertedCustomerId: customer.id, updatedById: req.user!.id }, include: leadInclude });
    await tx.activity.create({ data: { entityType: "lead", entityId: id, activityType: "system", title: "تبدیل به مشتری", description: `لید به مشتری ${customer.displayName ?? customer.name} تبدیل شد.`, createdById: req.user!.id } });
    const stage = await tx.pipelineStage.findFirst({ orderBy: { order: "asc" } });
    const opportunity = stage ? await tx.opportunity.create({
      data: {
        customerId: customer.id,
        title: `فرصت همکاری لجستیکی با ${customer.displayName ?? customer.name}`,
        amount: 0,
        probability: Math.min(lead.probability || 40, 90),
        stageId: stage.id,
        ownerId: lead.ownerId,
        source: lead.source,
        description: lead.description ?? lead.notes
      }
    }) : null;
    return { customer, lead: converted, opportunity };
  });
  await audit(req, "leads.convert", "lead", id, lead, result);
  res.json(result);
});

app.get("/api/leads/:id", auth(), can("leads.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const lead = await prisma.lead.findUnique({ where: { id }, include: leadInclude });
  if (!lead || lead.deletedAt || lead.isDeleted) return res.status(404).json({ message: "لید پیدا نشد." });
  res.json(lead);
});

app.patch("/api/leads/:id", auth(), can("leads.update"), validate(leadSchema.partial()), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.lead.findUnique({ where: { id } });
  if (!previous || previous.deletedAt || previous.isDeleted) return res.status(404).json({ message: "لید پیدا نشد." });
  try {
    const updated = await prisma.lead.update({ where: { id }, data: ensureLeadPayload(req.body, req, true), include: leadInclude });
    await audit(req, "leads.update", "lead", id, previous, updated);
    res.json(updated);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ message: err.message ?? "ویرایش لید ناموفق بود." });
  }
});

app.delete("/api/leads/:id", auth(), can("leads.delete"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.lead.findUnique({ where: { id } });
  if (!previous || previous.deletedAt || previous.isDeleted) return res.status(404).json({ message: "لید پیدا نشد." });
  await prisma.lead.update({ where: { id }, data: { deletedAt: new Date(), isDeleted: true, updatedById: req.user!.id } });
  await audit(req, "leads.delete", "lead", id, previous);
  res.status(204).send();
});

const opportunityInclude = { customer: true, lead: { select: { id: true, name: true, companyName: true, mobile: true, phone: true } }, stage: true, owner: { select: { id: true, name: true, email: true } } };

function opportunityData(input: any, req: Request, previous?: any) {
  const amount = Number(input.amount ?? previous?.amount ?? 0);
  const probability = Number(input.probability ?? previous?.probability ?? 10);
  const status = input.status ?? previous?.status ?? "open";
  if ((status === "lost" || input.lostReason) && !normalizeText(input.lostReason ?? previous?.lostReason)) throw Object.assign(new Error("برای فرصت بازنده، دلیل شکست الزامی است."), { statusCode: 422 });
  return {
    ...input,
    ownerId: input.ownerId ?? previous?.ownerId ?? req.user!.id,
    weightedAmount: amount * probability / 100,
    updatedById: req.user!.id,
    ...(previous ? {} : { createdById: req.user!.id }),
    closedAt: status === "won" || status === "lost" ? new Date() : input.closedAt,
    wonAt: status === "won" ? new Date() : input.wonAt,
    lostAt: status === "lost" ? new Date() : input.lostAt
  };
}

function opportunityWhereFromQuery(req: Request): Prisma.OpportunityWhereInput {
  const { search } = parseList(req);
  const q = req.query;
  const where: Prisma.OpportunityWhereInput = { deletedAt: null };
  if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }, { phone: { contains: search, mode: "insensitive" } }, { customer: { name: { contains: search, mode: "insensitive" } } }];
  if (normalizeText(q.stageId)) where.stageId = String(q.stageId);
  if (normalizeText(q.status)) where.status = q.status as any;
  if (normalizeText(q.priority)) where.priority = q.priority as any;
  if (normalizeText(q.ownerId)) where.ownerId = String(q.ownerId);
  if (normalizeText(q.customerId)) where.customerId = String(q.customerId);
  if (normalizeText(q.source)) where.source = { contains: String(q.source), mode: "insensitive" };
  if (normalizeText(q.serviceType)) where.serviceType = String(q.serviceType);
  if (normalizeText(q.amountMin) || normalizeText(q.amountMax)) where.amount = { ...(normalizeText(q.amountMin) ? { gte: Number(q.amountMin) } : {}), ...(normalizeText(q.amountMax) ? { lte: Number(q.amountMax) } : {}) };
  if (normalizeText(q.probabilityMin) || normalizeText(q.probabilityMax)) where.probability = { ...(normalizeText(q.probabilityMin) ? { gte: Number(q.probabilityMin) } : {}), ...(normalizeText(q.probabilityMax) ? { lte: Number(q.probabilityMax) } : {}) };
  if (q.overdue === "true") where.AND = [{ expectedCloseDate: { lt: new Date() } }, { status: "open" }];
  if (q.withoutFollowUp === "true") where.nextFollowUpAt = null;
  return where;
}

app.get("/api/opportunities/export/csv", auth(), can("opportunities.read"), async (req, res) => {
  const rows = await prisma.opportunity.findMany({ where: opportunityWhereFromQuery(req), include: opportunityInclude, orderBy: { createdAt: "desc" } });
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment("opportunities.csv");
  res.send(`\uFEFF${toCsv(rows.map((row) => ({ id: row.id, title: row.title, customer: row.customer?.displayName ?? row.customer?.name, amount: row.amount, weightedAmount: row.weightedAmount, probability: row.probability, stage: row.stage?.name, status: row.status, priority: row.priority, owner: row.owner?.name, source: row.source, serviceType: row.serviceType, createdAt: row.createdAt, expectedCloseDate: row.expectedCloseDate, closedAt: row.closedAt, lostReason: row.lostReason })))}`);
});

app.get("/api/opportunities", auth(), can("opportunities.read"), async (req, res) => {
  const { page, pageSize, sortBy, sortOrder } = parseList(req);
  const allowedSort = new Set(["createdAt", "updatedAt", "amount", "weightedAmount", "probability", "expectedCloseDate", "nextFollowUpAt"]);
  const where = opportunityWhereFromQuery(req);
  const [data, total] = await prisma.$transaction([
    prisma.opportunity.findMany({ where, include: opportunityInclude, skip: (page - 1) * pageSize, take: pageSize, orderBy: { [allowedSort.has(sortBy) ? sortBy : "createdAt"]: sortOrder } }),
    prisma.opportunity.count({ where })
  ]);
  res.json({ data, meta: meta(page, pageSize, total) });
});

app.post("/api/opportunities", auth(), can("opportunities.create"), validate(opportunitySchema), async (req, res) => {
  try {
    const created = await prisma.opportunity.create({ data: opportunityData(req.body, req), include: opportunityInclude });
    await notifyAssignment(created.ownerId, "فرصت جدید به شما اختصاص یافت", created.title, "opportunity", created.id, "/opportunities");
    await audit(req, "opportunities.create", "opportunity", created.id, undefined, created);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ message: err.message ?? "ثبت فرصت ناموفق بود." });
  }
});

app.get("/api/opportunities/:id", auth(), can("opportunities.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const opportunity = await prisma.opportunity.findUnique({ where: { id }, include: opportunityInclude });
  if (!opportunity || opportunity.deletedAt) return res.status(404).json({ message: "فرصت پیدا نشد." });
  res.json(opportunity);
});

app.patch("/api/opportunities/:id", auth(), can("opportunities.update"), validate(opportunitySchema.partial()), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.opportunity.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "فرصت پیدا نشد." });
  try {
    const updated = await prisma.opportunity.update({ where: { id }, data: opportunityData(req.body, req, previous), include: opportunityInclude });
    if (updated.ownerId && updated.ownerId !== previous.ownerId) await notifyAssignment(updated.ownerId, "فرصت به شما اختصاص یافت", updated.title, "opportunity", updated.id, "/opportunities");
    await audit(req, "opportunities.update", "opportunity", id, previous, updated);
    res.json(updated);
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ message: err.message ?? "ویرایش فرصت ناموفق بود." });
  }
});

app.delete("/api/opportunities/:id", auth(), can("opportunities.delete"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.opportunity.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "فرصت پیدا نشد." });
  await prisma.opportunity.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit(req, "opportunities.delete", "opportunity", id, previous);
  res.status(204).send();
});

app.post("/api/opportunities/:id/mark-won", auth(), can("opportunities.close_won"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const wonStage = await prisma.pipelineStage.findFirst({ where: { isWon: true } });
  const previous = await prisma.opportunity.findUnique({ where: { id } });
  if (!previous) return res.status(404).json({ message: "فرصت پیدا نشد." });
  const updated = await prisma.opportunity.update({ where: { id }, data: { status: "won", probability: 100, weightedAmount: previous.amount, stageId: wonStage?.id ?? previous.stageId, wonAt: new Date(), closedAt: new Date() }, include: opportunityInclude });
  await prisma.customer.update({ where: { id: updated.customerId }, data: { status: "active" } }).catch(() => undefined);
  await audit(req, "opportunities.mark_won", "opportunity", id, previous, updated);
  res.json(updated);
});

app.post("/api/opportunities/:id/mark-lost", auth(), can("opportunities.close_lost"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const lostReason = z.string().min(2).parse(req.body.lostReason);
  const previous = await prisma.opportunity.findUnique({ where: { id } });
  if (!previous) return res.status(404).json({ message: "فرصت پیدا نشد." });
  const lostStage = await prisma.pipelineStage.findFirst({ where: { isLost: true } });
  const updated = await prisma.opportunity.update({ where: { id }, data: { status: "lost", probability: 0, weightedAmount: 0, stageId: lostStage?.id ?? previous.stageId, lostAt: new Date(), closedAt: new Date(), lostReason, competitor: req.body.competitor }, include: opportunityInclude });
  await audit(req, "opportunities.mark_lost", "opportunity", id, previous, updated);
  res.json(updated);
});

app.post("/api/opportunities/:id/tasks", auth(), can("tasks.create"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) return res.status(404).json({ message: "فرصت پیدا نشد." });
  const payload = taskSchema.parse({ title: req.body.title ?? `پیگیری فرصت ${opportunity.title}`, ownerId: req.body.ownerId ?? opportunity.ownerId ?? req.user!.id, priority: req.body.priority ?? opportunity.priority, dueDate: req.body.dueDate ?? opportunity.nextFollowUpAt, entityType: "opportunity", entityId: id, type: "follow_up" });
  const created = await prisma.task.create({ data: { ...payload, assignedById: req.user!.id }, include: taskInclude });
  await notifyAssignment(created.ownerId, "وظیفه فرصت به شما اختصاص یافت", created.title, "task", created.id, "/tasks");
  res.status(201).json(created);
});

app.post("/api/opportunities/:id/activities", auth(), can("activities.create"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const created = await createActivity(req, { ...req.body, entityType: "opportunity", entityId: id });
  await prisma.opportunity.update({ where: { id }, data: { lastActivityAt: created.occurredAt } });
  res.status(201).json(created);
});

const activityInclude = { createdBy: { select: { id: true, name: true, email: true } } };

async function relatedEntityName(entityType: string, entityId?: string | null) {
  if (!entityId || entityType === "general") return entityType === "general" ? "عمومی" : null;
  if (entityType === "lead") {
    const row = await prisma.lead.findUnique({ where: { id: entityId }, select: { name: true, companyName: true, businessName: true } });
    return row ? row.companyName ?? row.businessName ?? row.name : null;
  }
  if (entityType === "customer") {
    const row = await prisma.customer.findUnique({ where: { id: entityId }, select: { name: true, displayName: true, companyName: true } });
    return row ? row.displayName ?? row.companyName ?? row.name : null;
  }
  if (entityType === "opportunity") {
    const row = await prisma.opportunity.findUnique({ where: { id: entityId }, select: { title: true } });
    return row?.title ?? null;
  }
  if (entityType === "ticket") {
    const row = await prisma.ticket.findUnique({ where: { id: entityId }, select: { code: true, subject: true } });
    return row ? row.code ? `${row.code} - ${row.subject}` : row.subject : null;
  }
  if (entityType === "task") {
    const row = await prisma.task.findUnique({ where: { id: entityId }, select: { title: true } });
    return row?.title ?? null;
  }
  return null;
}

async function ensureRelatedEntity(entityType: string, entityId?: string | null) {
  if (entityType === "general") return;
  if (!entityId) {
    const error = new Error("رکورد مرتبط را انتخاب کنید.") as Error & { statusCode?: number };
    error.statusCode = 422;
    throw error;
  }
  const exists =
    entityType === "lead" ? await prisma.lead.findFirst({ where: { id: entityId, deletedAt: null, isDeleted: false }, select: { id: true } }) :
    entityType === "customer" ? await prisma.customer.findFirst({ where: { id: entityId, deletedAt: null }, select: { id: true } }) :
    entityType === "opportunity" ? await prisma.opportunity.findFirst({ where: { id: entityId, deletedAt: null }, select: { id: true } }) :
    entityType === "ticket" ? await prisma.ticket.findFirst({ where: { id: entityId, deletedAt: null }, select: { id: true } }) :
    entityType === "task" ? await prisma.task.findFirst({ where: { id: entityId, deletedAt: null }, select: { id: true } }) :
    null;
  if (!exists) {
    const error = new Error("رکورد مرتبط پیدا نشد.") as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }
}

function validateActivityRules(data: any) {
  const activityAt = new Date(data.activityAt ?? data.occurredAt ?? Date.now());
  if (data.nextFollowUpAt && new Date(data.nextFollowUpAt).getTime() < activityAt.getTime()) {
    const error = new Error("تاریخ پیگیری بعدی نباید قبل از تاریخ فعالیت باشد.") as Error & { statusCode?: number };
    error.statusCode = 422;
    throw error;
  }
  if (data.status === "needs_followup" && !data.nextFollowUpAt) {
    const error = new Error("برای وضعیت نیازمند پیگیری، تاریخ پیگیری بعدی الزامی است.") as Error & { statusCode?: number };
    error.statusCode = 422;
    throw error;
  }
  if (data.activityType === "meeting" && !normalizeText(data.description)) {
    const error = new Error("برای جلسه، توضیحات یا محل جلسه الزامی است.") as Error & { statusCode?: number };
    error.statusCode = 422;
    throw error;
  }
}

function activityWhereFromQuery(req: Request): Prisma.ActivityWhereInput {
  const { search } = parseList(req);
  const q = req.query;
  const where: Prisma.ActivityWhereInput = { deletedAt: null };
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { description: { contains: search, mode: "insensitive" } },
    { outcome: { contains: search, mode: "insensitive" } },
    { relatedName: { contains: search, mode: "insensitive" } }
  ];
  if (normalizeText(q.type)) where.activityType = q.type as any;
  if (normalizeText(q.status)) where.status = q.status as any;
  if (normalizeText(q.priority)) where.priority = q.priority as any;
  if (normalizeText(q.result)) where.result = q.result as any;
  if (normalizeText(q.channel)) where.channel = q.channel as any;
  if (normalizeText(q.relatedType)) where.entityType = q.relatedType as any;
  if (normalizeText(q.relatedId)) where.entityId = String(q.relatedId);
  if (normalizeText(q.createdById)) where.createdById = String(q.createdById);
  if (normalizeText(q.assignedToId)) where.assignedToId = String(q.assignedToId);
  if (normalizeText(q.fromDate) || normalizeText(q.toDate)) where.activityAt = { ...(normalizeText(q.fromDate) ? { gte: new Date(String(q.fromDate)) } : {}), ...(normalizeText(q.toDate) ? { lte: new Date(String(q.toDate)) } : {}) };
  if (q.hasFollowUp === "true") where.nextFollowUpAt = { not: null };
  if (q.isOverdue === "true") where.AND = [{ nextFollowUpAt: { lt: new Date() } }, { status: { notIn: ["completed", "cancelled"] } }];
  return where;
}

function withActivityComputed(activity: any) {
  return {
    ...activity,
    isOverdue: !!activity.nextFollowUpAt && new Date(activity.nextFollowUpAt).getTime() < Date.now() && !["completed", "cancelled"].includes(activity.status)
  };
}

async function createActivity(req: Request, input: any) {
  const parsed = activitySchema.parse(input);
  validateActivityRules(parsed);
  await ensureRelatedEntity(parsed.entityType, parsed.entityId);
  const activityAt = parsed.activityAt ?? parsed.occurredAt ?? new Date();
  const relatedName = normalizeText(parsed.relatedName) ?? await relatedEntityName(parsed.entityType, parsed.entityId);
  const created = await prisma.activity.create({
    data: {
      ...parsed,
      entityId: parsed.entityId ?? "00000000-0000-0000-0000-000000000000",
      relatedName,
      occurredAt: activityAt,
      activityAt,
      completedAt: parsed.status === "completed" ? (parsed.completedAt ?? new Date()) : parsed.completedAt,
      metadata: parsed.metadata === null ? undefined : parsed.metadata,
      createdById: req.user!.id
    } as any,
    include: activityInclude
  });
  if (created.entityType === "lead" && created.entityId) {
    const scoreDelta = created.result === "successful" ? 10 : created.result === "scheduled_meeting" ? 20 : created.result === "sent_proposal" ? 25 : created.result === "no_answer" ? -5 : created.result === "not_interested" ? -20 : 0;
    await prisma.lead.updateMany({ where: { id: created.entityId }, data: { lastContactAt: created.activityAt, nextFollowUpAt: created.nextFollowUpAt, score: { increment: scoreDelta } } });
  }
  if (created.entityType === "opportunity" && created.entityId) await prisma.opportunity.updateMany({ where: { id: created.entityId }, data: { lastActivityAt: created.activityAt } });
  return created;
}

app.get("/api/activities/export", auth(), can("activities.read"), async (req, res) => {
  const rows = await prisma.activity.findMany({ where: activityWhereFromQuery(req), include: activityInclude, orderBy: { activityAt: "desc" } });
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment("activities.csv");
  res.send(`\uFEFF${toCsv(rows.map((row) => ({ عنوان: row.title, نوع: row.activityType, وضعیت: row.status, اولویت: row.priority, نتیجه: row.result, کانال: row.channel, موجودیت: row.entityType, نام_موجودیت: row.relatedName, ثبت_کننده: row.createdBy?.name, تاریخ_فعالیت: row.activityAt, پیگیری_بعدی: row.nextFollowUpAt, توضیحات: row.description })))}`);
});

app.get("/api/activities/followups/today", auth(), can("activities.read"), async (_req, res) => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  const data = await prisma.activity.findMany({ where: { deletedAt: null, nextFollowUpAt: { gte: start, lte: end }, status: { notIn: ["completed", "cancelled"] } }, include: activityInclude, orderBy: { nextFollowUpAt: "asc" } });
  res.json({ data: data.map(withActivityComputed), meta: meta(1, data.length || 1, data.length) });
});

app.get("/api/activities/followups/overdue", auth(), can("activities.read"), async (_req, res) => {
  const data = await prisma.activity.findMany({ where: { deletedAt: null, nextFollowUpAt: { lt: new Date() }, status: { notIn: ["completed", "cancelled"] } }, include: activityInclude, orderBy: { nextFollowUpAt: "asc" } });
  res.json({ data: data.map(withActivityComputed), meta: meta(1, data.length || 1, data.length) });
});

app.get("/api/activities/timeline/:relatedType/:relatedId", auth(), can("activities.read"), async (req, res) => {
  const relatedType = z.enum(["customer", "lead", "opportunity", "ticket", "task"]).parse(req.params.relatedType);
  const relatedId = z.string().uuid().parse(req.params.relatedId);
  const data = await prisma.activity.findMany({ where: { deletedAt: null, entityType: relatedType, entityId: relatedId }, include: activityInclude, orderBy: { activityAt: "desc" } });
  res.json({ data: data.map(withActivityComputed), meta: meta(1, data.length || 1, data.length) });
});

app.get("/api/activities", auth(), can("activities.read"), async (req, res) => {
  const { page, pageSize } = parseList(req);
  const where = activityWhereFromQuery(req);
  const [data, total] = await prisma.$transaction([
    prisma.activity.findMany({ where, include: activityInclude, skip: (page - 1) * pageSize, take: pageSize, orderBy: { activityAt: "desc" } }),
    prisma.activity.count({ where })
  ]);
  res.json({ data: data.map(withActivityComputed), meta: meta(page, pageSize, total) });
});

app.post("/api/activities", auth(), can("activities.create"), async (req, res) => {
  try {
    const created = await createActivity(req, req.body);
    await audit(req, "activities.create", "activity", created.id, undefined, created);
    res.status(201).json(withActivityComputed(created));
  } catch (err: any) {
    res.status(err.statusCode ?? 422).json({ message: err.message ?? "ثبت فعالیت ناموفق بود." });
  }
});

app.get("/api/activities/:id", auth(), can("activities.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const item = await prisma.activity.findUnique({ where: { id }, include: activityInclude });
  if (!item || item.deletedAt) return res.status(404).json({ message: "فعالیت پیدا نشد." });
  res.json(withActivityComputed(item));
});

app.patch("/api/activities/:id", auth(), can("activities.update"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.activity.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "فعالیت پیدا نشد." });
  if (previous.activityType === "system" && !req.user!.permissions.includes("*")) return res.status(403).json({ message: "فعالیت سیستمی قابل ویرایش نیست." });
  const parsed = activitySchema.partial().parse(req.body);
  validateActivityRules({ ...previous, ...parsed });
  if (parsed.entityType || parsed.entityId) await ensureRelatedEntity(parsed.entityType ?? previous.entityType, parsed.entityId ?? previous.entityId);
  const activityAt = parsed.activityAt ?? parsed.occurredAt;
  const updateData = { ...parsed, ...(activityAt ? { occurredAt: activityAt, activityAt } : {}), ...(parsed.entityId === null ? { entityId: undefined } : {}), metadata: parsed.metadata === null ? Prisma.JsonNull : parsed.metadata, relatedName: parsed.relatedName ?? (parsed.entityType || parsed.entityId ? await relatedEntityName(parsed.entityType ?? previous.entityType, parsed.entityId ?? previous.entityId) : undefined), completedAt: parsed.status === "completed" ? (parsed.completedAt ?? new Date()) : parsed.completedAt };
  const updated = await prisma.activity.update({ where: { id }, data: updateData as any, include: activityInclude });
  await audit(req, "activities.update", "activity", id, previous, updated);
  res.json(withActivityComputed(updated));
});

app.delete("/api/activities/:id", auth(), can("activities.delete"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.activity.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "فعالیت پیدا نشد." });
  if (previous.activityType === "system" && !req.user!.permissions.includes("*")) return res.status(403).json({ message: "فعالیت سیستمی قابل حذف نیست." });
  await prisma.activity.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit(req, "activities.delete", "activity", id, previous);
  res.status(204).send();
});

app.post("/api/activities/:id/convert-to-task", auth(), can("tasks.create"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity || activity.deletedAt) return res.status(404).json({ message: "فعالیت پیدا نشد." });
  const created = await prisma.task.create({
    data: {
      title: activity.title,
      description: activity.description,
      type: "follow_up",
      ownerId: activity.assignedToId ?? req.user!.id,
      assignedById: req.user!.id,
      entityType: activity.entityType,
      entityId: activity.entityId,
      priority: activity.priority === "urgent" ? "urgent" : activity.priority,
      priorityScore: priorityScores[activity.priority] ?? 50,
      dueDate: activity.nextFollowUpAt,
      status: "open"
    },
    include: { owner: { select: { id: true, name: true, email: true } }, assignedBy: { select: { id: true, name: true } } }
  });
  await prisma.activity.update({ where: { id }, data: { metadata: { convertedTaskId: created.id } } });
  await audit(req, "activities.convert_to_task", "activity", id, activity, created);
  res.status(201).json(withTaskComputed(created));
});
const taskInclude = { owner: { select: { id: true, name: true, email: true } }, assignedBy: { select: { id: true, name: true } } };
const ticketInclude = { customer: { select: { id: true, name: true, displayName: true, phone: true, mobile: true } }, lead: { select: { id: true, name: true, companyName: true, phone: true, mobile: true } }, owner: { select: { id: true, name: true, email: true } } };
const priorityScores: Record<string, number> = { low: 25, medium: 50, high: 75, urgent: 100, critical: 100 };
const ticketPriorityScores: Record<string, number> = { low: 1, medium: 2, high: 3, urgent: 4, critical: 5 };
const ticketStatusScores: Record<string, number> = { open: 1, pending: 2, in_progress: 3, escalated: 4, resolved: 5, closed: 6, canceled: 7 };
const ticketTypeScores: Record<string, number> = { general_request: 1, customer_complaint: 2, operational_issue: 3, financial_issue: 4, technical_issue: 5, contract_request: 6, sla_review: 7, sales_follow_up: 8 };
const ticketChannelScores: Record<string, number> = { phone: 1, email: 2, messenger: 3, customer_portal: 4, website: 5, in_person: 6, api: 7, internal: 8 };

function taskWhereFromQuery(req: Request): Prisma.TaskWhereInput {
  const { search } = parseList(req);
  const q = req.query;
  const where: Prisma.TaskWhereInput = { deletedAt: null };
  if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }];
  if (normalizeText(q.status)) where.status = q.status as any;
  if (normalizeText(q.priority)) where.priority = q.priority as any;
  if (normalizeText(q.type)) where.type = String(q.type);
  if (normalizeText(q.ownerId)) where.ownerId = String(q.ownerId);
  if (q.mine === "true") where.ownerId = req.user!.id;
  if (normalizeText(q.relationType)) where.entityType = q.relationType as any;
  if (normalizeText(q.entityId)) where.entityId = String(q.entityId);
  if (q.today === "true") {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    where.dueDate = { gte: start, lte: end };
  }
  if (q.overdue === "true") where.AND = [{ dueDate: { lt: new Date() } }, { status: { notIn: ["done", "canceled"] } }];
  return where;
}

function withTaskComputed(task: any) {
  return { ...task, isOverdue: !!task.dueDate && new Date(task.dueDate).getTime() < Date.now() && !["done", "canceled"].includes(task.status) };
}

function ticketWhereFromQuery(req: Request): Prisma.TicketWhereInput {
  const { search } = parseList(req);
  const q = req.query;
  const where: Prisma.TicketWhereInput = { deletedAt: null };
  if (search) where.OR = [{ subject: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }];
  if (normalizeText(q.status)) where.status = q.status as any;
  if (normalizeText(q.priority)) where.priority = q.priority as any;
  if (normalizeText(q.type)) where.type = String(q.type);
  if (normalizeText(q.channel)) where.channel = String(q.channel);
  if (normalizeText(q.team)) where.team = String(q.team);
  if (normalizeText(q.ownerId)) where.ownerId = String(q.ownerId);
  if (normalizeText(q.customerId)) where.customerId = String(q.customerId);
  if (normalizeText(q.leadId)) where.leadId = String(q.leadId);
  if (q.slaState === "breached") where.AND = [{ slaDueAt: { lt: new Date() } }, { status: { notIn: ["resolved", "closed", "canceled"] } }];
  return where;
}

function slaState(ticket: any) {
  if (["resolved", "closed", "canceled"].includes(ticket.status)) return "پایان‌یافته";
  if (!ticket.slaDueAt) return "بدون SLA";
  const due = new Date(ticket.slaDueAt).getTime();
  if (due < Date.now()) return "نقض شده";
  if (due - Date.now() <= 24 * 60 * 60 * 1000) return "نزدیک به نقض";
  return "عادی";
}

function withTicketComputed(ticket: any) {
  return { ...ticket, slaState: slaState(ticket) };
}

async function generateTicketCode() {
  const count = await prisma.ticket.count();
  return `TCK-1405-${String(count + 1).padStart(4, "0")}`;
}

app.get("/api/tasks/export", auth(), can("tasks.read"), async (req, res) => {
  const rows = await prisma.task.findMany({ where: taskWhereFromQuery(req), include: taskInclude, orderBy: { createdAt: "desc" } });
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment("tasks.csv");
  res.send(`\uFEFF${toCsv(rows.map((row) => ({ id: row.id, title: row.title, type: row.type, status: row.status, priority: row.priority, owner: row.owner?.name, relation: row.entityType, dueDate: row.dueDate, createdAt: row.createdAt, result: row.resultNote })))}`);
});

app.get("/api/tasks", auth(), can("tasks.read"), async (req, res) => {
  const { page, pageSize } = parseList(req);
  const where = taskWhereFromQuery(req);
  const [data, total] = await prisma.$transaction([
    prisma.task.findMany({ where, include: taskInclude, skip: (page - 1) * pageSize, take: pageSize, orderBy: { dueDate: "asc" } }),
    prisma.task.count({ where })
  ]);
  res.json({ data: data.map(withTaskComputed), meta: meta(page, pageSize, total) });
});

app.post("/api/tasks", auth(), can("tasks.create"), validate(taskSchema), async (req, res) => {
  const data = { ...req.body, priorityScore: req.body.priorityScore ?? priorityScores[req.body.priority ?? "medium"], assignedById: req.body.assignedById ?? req.user!.id };
  const created = await prisma.task.create({ data, include: taskInclude });
  await notifyAssignment(created.ownerId, "وظیفه جدید به شما اختصاص یافت", created.title, "task", created.id, "/tasks");
  if (created.entityType && created.entityId) await prisma.activity.create({ data: { entityType: created.entityType, entityId: created.entityId, activityType: "system", title: "ایجاد وظیفه", description: created.title, createdById: req.user!.id } });
  await audit(req, "tasks.create", "task", created.id, undefined, created);
  res.status(201).json(withTaskComputed(created));
});

app.patch("/api/tasks/:id", auth(), can("tasks.update"), validate(taskSchema.partial()), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.task.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "وظیفه پیدا نشد." });
  const updated = await prisma.task.update({ where: { id }, data: { ...req.body, priorityScore: req.body.priority ? priorityScores[req.body.priority] : undefined }, include: taskInclude });
  if (updated.ownerId !== previous.ownerId) await notifyAssignment(updated.ownerId, "وظیفه به شما اختصاص یافت", updated.title, "task", updated.id, "/tasks");
  await audit(req, "tasks.update", "task", id, previous, updated);
  res.json(withTaskComputed(updated));
});

app.delete("/api/tasks/:id", auth(), can("tasks.delete"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.task.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "وظیفه پیدا نشد." });
  await prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit(req, "tasks.delete", "task", id, previous);
  res.status(204).send();
});

app.get("/api/tickets/export", auth(), can("tickets.read"), async (req, res) => {
  const rows = await prisma.ticket.findMany({ where: ticketWhereFromQuery(req), include: ticketInclude, orderBy: { createdAt: "desc" } });
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment("tickets.csv");
  res.send(`\uFEFF${toCsv(rows.map((row) => ({ code: row.code, subject: row.subject, customer: row.customer?.displayName ?? row.customer?.name, lead: row.lead?.name, type: row.type, channel: row.channel, priority: row.priority, status: row.status, owner: row.owner?.name, team: row.team, slaDueAt: row.slaDueAt, slaState: slaState(row) })))}`);
});

app.get("/api/tickets", auth(), can("tickets.read"), async (req, res) => {
  const { page, pageSize } = parseList(req);
  const where = ticketWhereFromQuery(req);
  const [data, total] = await prisma.$transaction([
    prisma.ticket.findMany({ where, include: ticketInclude, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    prisma.ticket.count({ where })
  ]);
  res.json({ data: data.map(withTicketComputed), meta: meta(page, pageSize, total) });
});

app.post("/api/tickets", auth(), can("tickets.create"), validate(ticketSchema), async (req, res) => {
  if (!req.body.customerId && !req.body.leadId) return res.status(422).json({ message: "انتخاب مشتری یا لید برای تیکت الزامی است." });
  const data = { ...req.body, code: req.body.code ?? await generateTicketCode(), typeScore: ticketTypeScores[req.body.type] ?? 1, channelScore: ticketChannelScores[req.body.channel] ?? 1, statusScore: ticketStatusScores[req.body.status] ?? 1, priorityScore: ticketPriorityScores[req.body.priority] ?? 2 };
  const created = await prisma.ticket.create({ data, include: ticketInclude });
  await notifyAssignment(created.ownerId, "تیکت جدید به شما اختصاص یافت", created.subject, "ticket", created.id, "/tickets");
  await prisma.ticketHistory.create({ data: { ticketId: created.id, toStatus: created.status, changedById: req.user!.id, note: "ایجاد تیکت" } });
  await audit(req, "tickets.create", "ticket", created.id, undefined, created);
  res.status(201).json(withTicketComputed(created));
});

app.patch("/api/tickets/:id", auth(), can("tickets.update"), validate(ticketSchema.partial()), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.ticket.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "تیکت پیدا نشد." });
  const updated = await prisma.ticket.update({ where: { id }, data: { ...req.body, typeScore: req.body.type ? ticketTypeScores[req.body.type] : undefined, channelScore: req.body.channel ? ticketChannelScores[req.body.channel] : undefined, statusScore: req.body.status ? ticketStatusScores[req.body.status] : undefined, priorityScore: req.body.priority ? ticketPriorityScores[req.body.priority] : undefined }, include: ticketInclude });
  if (updated.ownerId && updated.ownerId !== previous.ownerId) await notifyAssignment(updated.ownerId, "تیکت به شما اختصاص یافت", updated.subject, "ticket", updated.id, "/tickets");
  await audit(req, "tickets.update", "ticket", id, previous, updated);
  res.json(withTicketComputed(updated));
});

app.patch("/api/tickets/:id/status", auth(), can("tickets.update"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const body = z.object({ status: ticketSchema.shape.status, note: z.string().optional(), resolution: z.string().optional(), cancelReason: z.string().optional() }).parse(req.body);
  const previous = await prisma.ticket.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "تیکت پیدا نشد." });
  if (body.status === "resolved" && !body.resolution) return res.status(422).json({ message: "برای حل تیکت، توضیح راهکار الزامی است." });
  if (body.status === "canceled" && !body.cancelReason) return res.status(422).json({ message: "برای لغو تیکت، دلیل لغو الزامی است." });
  const updated = await prisma.ticket.update({ where: { id }, data: { status: body.status, statusScore: ticketStatusScores[body.status], resolution: body.resolution, cancelReason: body.cancelReason, resolvedAt: body.status === "resolved" ? new Date() : previous.resolvedAt, closedAt: body.status === "closed" ? new Date() : previous.closedAt }, include: ticketInclude });
  await prisma.ticketHistory.create({ data: { ticketId: id, fromStatus: previous.status, toStatus: updated.status, changedById: req.user!.id, note: body.note ?? body.resolution ?? body.cancelReason } });
  await audit(req, "tickets.status.update", "ticket", id, previous, updated);
  res.json(withTicketComputed(updated));
});

app.post("/api/tickets/:id/create-task", auth(), can("tasks.create"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket || ticket.deletedAt) return res.status(404).json({ message: "تیکت پیدا نشد." });
  const created = await prisma.task.create({ data: { title: `پیگیری تیکت ${ticket.code ?? ticket.subject}`, description: ticket.subject, type: "support", ownerId: ticket.ownerId ?? req.user!.id, assignedById: req.user!.id, entityType: "ticket", entityId: ticket.id, priority: ticket.priority, priorityScore: priorityScores[ticket.priority] ?? 50, status: "open", dueDate: ticket.slaDueAt }, include: taskInclude });
  await audit(req, "tickets.create_task", "ticket", id, undefined, created);
  res.status(201).json(withTaskComputed(created));
});

app.delete("/api/tickets/:id", auth(), can("tickets.delete"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.ticket.findUnique({ where: { id } });
  if (!previous || previous.deletedAt) return res.status(404).json({ message: "تیکت پیدا نشد." });
  await prisma.ticket.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit(req, "tickets.delete", "ticket", id, previous);
  res.status(204).send();
});

app.get("/api/customers/:id/timeline", auth(), can("customers.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const data = await prisma.activity.findMany({ where: { entityType: "customer", entityId: id }, include: { createdBy: { select: { id: true, name: true } } }, orderBy: { occurredAt: "desc" } });
  res.json({ data, meta: meta(1, data.length || 1, data.length) });
});

app.get("/api/customers/:id/opportunities", auth(), can("customers.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const data = await prisma.opportunity.findMany({ where: { customerId: id, deletedAt: null }, include: { stage: true, owner: { select: { id: true, name: true } } } });
  res.json({ data, meta: meta(1, data.length || 1, data.length) });
});

app.get("/api/customers/:id/tickets", auth(), can("customers.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const data = await prisma.ticket.findMany({ where: { customerId: id }, include: { owner: { select: { id: true, name: true } } } });
  res.json({ data, meta: meta(1, data.length || 1, data.length) });
});

app.get("/api/customers/:id/tasks", auth(), can("customers.read"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const data = await prisma.task.findMany({ where: { entityType: "customer", entityId: id }, include: { owner: { select: { id: true, name: true } } } });
  res.json({ data, meta: meta(1, data.length || 1, data.length) });
});

app.post("/api/opportunities/:id/change-stage", auth(), can("opportunities.change_stage"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const stageId = z.string().uuid().parse(req.body.stageId);
  const lostReason = z.string().optional().parse(req.body.lostReason);
  const stage = await prisma.pipelineStage.findUnique({ where: { id: stageId } });
  if (!stage) return res.status(404).json({ message: "مرحله قیف پیدا نشد." });
  if (stage.isLost && !lostReason) return res.status(422).json({ message: "برای باخت فرصت، دلیل باخت الزامی است." });
  const previous = await prisma.opportunity.findUnique({ where: { id } });
  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      stageId,
      probability: stage.probability,
      status: stage.isWon ? "won" : stage.isLost ? "lost" : "open",
      wonAt: stage.isWon ? new Date() : null,
      lostAt: stage.isLost ? new Date() : null,
      lostReason: stage.isLost ? lostReason : null
    },
    include: { stage: true, customer: true }
  });
  await prisma.activity.create({ data: { entityType: "opportunity", entityId: id, activityType: "system", title: "تغییر مرحله فرصت", description: `مرحله فرصت به ${stage.name} تغییر کرد.`, createdById: req.user!.id } });
  await audit(req, "opportunities.change_stage", "opportunity", id, previous, updated);
  res.json(updated);
});

app.post("/api/opportunities/:id/close-won", auth(), can("opportunities.close_won"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const wonStage = await prisma.pipelineStage.findFirst({ where: { isWon: true } });
  const updated = await prisma.opportunity.update({ where: { id }, data: { status: "won", wonAt: new Date(), stageId: wonStage?.id } });
  await audit(req, "opportunities.close_won", "opportunity", id, undefined, updated);
  res.json(updated);
});

app.post("/api/opportunities/:id/close-lost", auth(), can("opportunities.close_lost"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const lostReason = z.string().min(2).parse(req.body.lostReason);
  const lostStage = await prisma.pipelineStage.findFirst({ where: { isLost: true } });
  const updated = await prisma.opportunity.update({ where: { id }, data: { status: "lost", lostAt: new Date(), lostReason, stageId: lostStage?.id } });
  await audit(req, "opportunities.close_lost", "opportunity", id, undefined, updated);
  res.json(updated);
});

app.get("/api/entities/:entityType/:entityId/activities", auth(), can("activities.read"), async (req, res) => {
  const entityType = z.enum(["customer", "lead", "opportunity", "ticket", "task"]).parse(req.params.entityType);
  const entityId = z.string().uuid().parse(req.params.entityId);
  const data = await prisma.activity.findMany({ where: { entityType, entityId }, include: { createdBy: { select: { id: true, name: true } } }, orderBy: { occurredAt: "desc" } });
  res.json({ data, meta: meta(1, data.length || 1, data.length) });
});

app.post("/api/tasks/:id/complete", auth(), can("tasks.update"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const previous = await prisma.task.findUnique({ where: { id } });
  const resultNote = z.string().optional().parse(req.body.resultNote);
  const updated = await prisma.task.update({ where: { id }, data: { status: "done", completedAt: new Date(), resultNote } });
  await audit(req, "tasks.complete", "task", id, previous, updated);
  res.json(updated);
});

app.get("/api/pipeline-stages", auth(), can("opportunities.read"), async (_req, res) => {
  const data = await prisma.pipelineStage.findMany({ orderBy: { order: "asc" } });
  res.json({ data, meta: meta(1, data.length || 1, data.length) });
});

app.patch("/api/pipeline-stages/:id", auth(), can("settings.update"), async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const body = z.object({
    name: z.string().min(2).optional(),
    order: z.coerce.number().int().min(1).optional(),
    probability: z.coerce.number().int().min(0).max(100).optional(),
    color: z.string().min(4).optional()
  }).parse(req.body);
  const previous = await prisma.pipelineStage.findUnique({ where: { id } });
  if (!previous) return res.status(404).json({ message: "مرحله قیف فروش پیدا نشد." });
  const updated = await prisma.pipelineStage.update({ where: { id }, data: body });
  await audit(req, "pipeline_stages.update", "pipeline_stage", id, previous, updated);
  res.json(updated);
});

app.get("/api/reports/dashboard", auth(), can("reports.read"), async (_req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [customers, newLeads, openOpportunities, pipeline, tasksToday, overdueTasks, openTickets, slaSoon, leadSources, stages, activities, ticketStatuses] = await prisma.$transaction([
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.lead.count({ where: { status: "new", deletedAt: null } }),
    prisma.opportunity.count({ where: { status: "open", deletedAt: null } }),
    prisma.opportunity.aggregate({ where: { status: "open", deletedAt: null }, _sum: { amount: true } }),
    prisma.task.count({ where: { dueDate: { gte: todayStart }, status: { in: ["open", "in_progress"] } } }),
    prisma.task.count({ where: { dueDate: { lt: new Date() }, status: { in: ["open", "in_progress"] } } }),
    prisma.ticket.count({ where: { status: { in: ["open", "pending", "in_progress", "escalated"] } } }),
    prisma.ticket.count({ where: { slaDueAt: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000) }, status: { in: ["open", "pending", "in_progress", "escalated"] } } }),
    prisma.lead.groupBy({ by: ["source"], _count: true, where: { deletedAt: null }, orderBy: { source: "asc" } }),
    prisma.opportunity.groupBy({ by: ["stageId"], _count: true, _sum: { amount: true }, where: { deletedAt: null }, orderBy: { stageId: "asc" } }),
    prisma.activity.groupBy({ by: ["activityType"], _count: true, where: { occurredAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, orderBy: { activityType: "asc" } }),
    prisma.ticket.groupBy({ by: ["status"], _count: true, orderBy: { status: "asc" } })
  ]);
  const stageRows = await prisma.pipelineStage.findMany();
  res.json({
    cards: { customers, newLeads, openOpportunities, pipelineValue: Number(pipeline._sum.amount ?? 0), tasksToday, overdueTasks, openTickets, slaSoon },
    charts: {
      leadSources: leadSources.map((row) => ({ name: row.source ?? "نامشخص", value: row._count })),
      stages: stages.map((row) => ({ name: stageRows.find((stage) => stage.id === row.stageId)?.name ?? "نامشخص", count: row._count, amount: Number(row._sum?.amount ?? 0) })),
      activities: activities.map((row) => ({ name: row.activityType, value: row._count })),
      tickets: ticketStatuses.map((row) => ({ name: statusLabels[row.status] ?? row.status, value: row._count }))
    }
  });
});

function reportDateWhere(req: Request) {
  const from = normalizeText(req.query.from);
  const to = normalizeText(req.query.to);
  return from || to ? { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } : undefined;
}

function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

async function reportSummary(req: Request) {
  const createdAt = reportDateWhere(req);
  const ownerId = normalizeText(req.query.ownerId);
  const customerId = normalizeText(req.query.customerId);
  const status = normalizeText(req.query.status);
  const priority = normalizeText(req.query.priority);
  const source = normalizeText(req.query.source);
  const leadWhere: Prisma.LeadWhereInput = { deletedAt: null, isDeleted: false, ...(createdAt ? { createdAt } : {}), ...(ownerId ? { ownerId } : {}), ...(status ? { status: status as any } : {}), ...(source ? { source } : {}) };
  const opportunityWhere: Prisma.OpportunityWhereInput = { deletedAt: null, ...(createdAt ? { createdAt } : {}), ...(ownerId ? { ownerId } : {}), ...(customerId ? { customerId } : {}), ...(status ? { status: status as any } : {}) };
  const taskWhere: Prisma.TaskWhereInput = { deletedAt: null, ...(createdAt ? { createdAt } : {}), ...(ownerId ? { ownerId } : {}), ...(priority ? { priority: priority as any } : {}) };
  const ticketWhere: Prisma.TicketWhereInput = { deletedAt: null, ...(createdAt ? { createdAt } : {}), ...(ownerId ? { ownerId } : {}), ...(customerId ? { customerId } : {}), ...(status ? { status: status as any } : {}), ...(priority ? { priority: priority as any } : {}) };
  const activityWhere: Prisma.ActivityWhereInput = { deletedAt: null, ...(createdAt ? { activityAt: createdAt } : {}), ...(ownerId ? { OR: [{ createdById: ownerId }, { assignedToId: ownerId }] } : {}) };
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const [totalLeads, convertedLeads, openOpportunities, weightedPipeline, openTickets, slaBreaches, overdueTasks, todayActivities, salesFunnel, leadByStatus, leadBySource, activityByType, activityByUser, slaByStatus, detailRows] = await prisma.$transaction([
    prisma.lead.count({ where: leadWhere }),
    prisma.lead.count({ where: { ...leadWhere, status: "converted" } }),
    prisma.opportunity.count({ where: { ...opportunityWhere, status: "open" } }),
    prisma.opportunity.aggregate({ where: { ...opportunityWhere, status: "open" }, _sum: { weightedAmount: true, amount: true } }),
    prisma.ticket.count({ where: { ...ticketWhere, status: { in: ["open", "pending", "in_progress", "escalated"] } } }),
    prisma.ticket.count({ where: { ...ticketWhere, slaDueAt: { lt: new Date() }, status: { notIn: ["resolved", "closed", "canceled"] } } }),
    prisma.task.count({ where: { ...taskWhere, dueDate: { lt: new Date() }, status: { notIn: ["done", "canceled"] } } }),
    prisma.activity.count({ where: { ...activityWhere, activityAt: { gte: todayStart } } }),
    prisma.opportunity.groupBy({ by: ["stageId"], where: opportunityWhere, _count: true, _sum: { amount: true, weightedAmount: true }, orderBy: { stageId: "asc" } }),
    prisma.lead.groupBy({ by: ["status"], where: leadWhere, _count: true, orderBy: { status: "asc" } }),
    prisma.lead.groupBy({ by: ["source"], where: leadWhere, _count: true, orderBy: { source: "asc" } }),
    prisma.activity.groupBy({ by: ["activityType"], where: activityWhere, _count: true, orderBy: { activityType: "asc" } }),
    prisma.activity.groupBy({ by: ["createdById"], where: activityWhere, _count: true, orderBy: { createdById: "asc" } }),
    prisma.ticket.groupBy({ by: ["priority", "status"], where: ticketWhere, _count: true, orderBy: [{ priority: "asc" }, { status: "asc" }] }),
    prisma.opportunity.findMany({ where: opportunityWhere, take: 25, orderBy: { updatedAt: "desc" }, include: { customer: { select: { name: true, displayName: true } }, owner: { select: { name: true } }, stage: true } })
  ]);
  const [stages, users] = await prisma.$transaction([
    prisma.pipelineStage.findMany({ orderBy: { order: "asc" } }),
    prisma.user.findMany({ select: { id: true, name: true } })
  ]);
  const totalWonLost = await prisma.opportunity.count({ where: { ...opportunityWhere, status: { in: ["won", "lost"] } } });
  const wonCount = await prisma.opportunity.count({ where: { ...opportunityWhere, status: "won" } });
  return {
    kpis: {
      totalLeads,
      leadConversionRate: percent(convertedLeads, totalLeads),
      openOpportunities,
      weightedPipeline: Number(weightedPipeline._sum.weightedAmount ?? weightedPipeline._sum.amount ?? 0),
      openTickets,
      slaBreaches,
      overdueTasks,
      todayActivities
    },
    reports: {
      salesFunnel: {
        stages: stages.map((stage) => {
          const row = salesFunnel.find((item) => item.stageId === stage.id);
          return { stage: stage.name, count: row?._count ?? 0, totalAmount: Number(row?._sum?.amount ?? 0), weightedAmount: Number(row?._sum?.weightedAmount ?? 0), conversionRate: stage.probability, averageDaysInStage: 0 };
        }),
        wonCount,
        lostCount: Math.max(0, totalWonLost - wonCount),
        winRate: percent(wonCount, totalWonLost)
      },
      leadConversion: {
        totalLeads,
        convertedLeads,
        conversionRate: percent(convertedLeads, totalLeads),
        byStatus: leadByStatus.map((row) => ({ status: row.status, count: row._count })),
        bySource: leadBySource.map((row) => ({ source: row.source ?? "نامشخص", total: row._count, converted: 0, conversionRate: 0 }))
      },
      activitySummary: {
        byType: activityByType.map((row) => ({ type: row.activityType, count: row._count })),
        byUser: activityByUser.map((row) => ({ user: users.find((user) => user.id === row.createdById)?.name ?? "نامشخص", count: row._count }))
      },
      slaStatus: {
        byStatus: slaByStatus.map((row) => ({ priority: row.priority, status: row.status, count: row._count })),
        breaches: slaBreaches
      }
    },
    details: detailRows.map((row) => ({ type: "opportunity", id: row.id, title: row.title, customer: row.customer?.displayName ?? row.customer?.name, owner: row.owner?.name, status: row.status, priority: row.priority, amount: Number(row.amount ?? 0), stage: row.stage.name, createdAt: row.createdAt, updatedAt: row.updatedAt }))
  };
}

app.get("/api/reports/summary", auth(), can("reports.read"), async (req, res) => {
  res.json(await reportSummary(req));
});

app.get("/api/reports/sales-pipeline", auth(), can("reports.read"), async (_req, res) => {
  const data = await prisma.pipelineStage.findMany({ orderBy: { order: "asc" }, include: { opportunities: { where: { deletedAt: null }, include: { customer: true, owner: { select: { id: true, name: true } } } } } });
  res.json({ data });
});

app.get("/api/reports/lead-conversion", auth(), can("reports.read"), async (_req, res) => {
  const data = await prisma.lead.groupBy({ by: ["status", "source"], _count: true, where: { deletedAt: null }, orderBy: [{ status: "asc" }, { source: "asc" }] });
  res.json({ data });
});

app.get("/api/reports/activity-summary", auth(), can("reports.read"), async (_req, res) => {
  const data = await prisma.activity.groupBy({ by: ["activityType"], _count: true, orderBy: { activityType: "asc" } });
  res.json({ data });
});

app.get("/api/reports/support-sla", auth(), can("reports.read"), async (_req, res) => {
  const data = await prisma.ticket.groupBy({ by: ["priority", "status"], _count: true, orderBy: [{ priority: "asc" }, { status: "asc" }] });
  res.json({ data });
});

app.get("/api/reports/export", auth(), can("reports.export"), async (req, res) => {
  const summary = await reportSummary(req);
  const rows = summary.details.map((row: any) => ({ نوع: "فرصت", عنوان: row.title, مشتری: row.customer, مرحله: row.stage, وضعیت: row.status, اولویت: row.priority, مبلغ: row.amount, مسئول: row.owner, ایجاد: row.createdAt, بروزرسانی: row.updatedAt }));
  await audit(req, "reports.export", "report", null, undefined, { rows: rows.length });
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment("crm-report.csv");
  res.send(`\uFEFF${toCsv(rows)}`);
});

app.get("/api/audit-logs", auth(), can("audit_logs.read"), async (req, res) => {
  const { page, pageSize, search } = parseList(req);
  const where: Prisma.AuditLogWhereInput = search ? { OR: [{ action: { contains: search, mode: "insensitive" } }, { entityType: { contains: search, mode: "insensitive" } }] } : {};
  const [data, total] = await prisma.$transaction([
    prisma.auditLog.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" }, include: { actor: { select: { id: true, name: true, email: true } } } }),
    prisma.auditLog.count({ where })
  ]);
  res.json({ data, meta: meta(page, pageSize, total) });
});

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const columns = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\n");
}

async function exportEntity(req: Request, res: Response, entity: "customer" | "lead" | "opportunity", rows: Record<string, unknown>[]) {
  await audit(req, `${entity}s.export`, entity, null, undefined, { rows: rows.length });
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment(`${entity}s.csv`);
  res.send(`\uFEFF${toCsv(rows)}`);
}

app.get("/api/export/customers", auth(), can("customers.export"), async (req, res) => {
  const rows = await prisma.customer.findMany({ where: { deletedAt: null }, select: { id: true, name: true, phone: true, email: true, status: true, city: true, createdAt: true } });
  await exportEntity(req, res, "customer", rows);
});

app.get("/api/export/leads", auth(), can("leads.export"), async (req, res) => {
  const rows = await prisma.lead.findMany({ where: { deletedAt: null }, select: { id: true, name: true, phone: true, email: true, status: true, source: true, createdAt: true } });
  await exportEntity(req, res, "lead", rows);
});

app.get("/api/export/opportunities", auth(), can("reports.export"), async (req, res) => {
  const rows = await prisma.opportunity.findMany({ where: { deletedAt: null }, select: { id: true, title: true, amount: true, probability: true, status: true, createdAt: true } });
  await exportEntity(req, res, "opportunity", rows);
});

function parseCsv(text: string) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((h) => h.trim());
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

app.post("/api/import/customers", auth(), can("customers.import"), async (req, res) => {
  const rows = parseCsv(String(req.body ?? ""));
  let imported = 0;
  const errors: Array<{ row: number; message: string }> = [];
  for (const [index, row] of rows.entries()) {
    const parsed = customerSchema.safeParse({ type: row.type || "individual", name: row.name, phone: row.phone, email: row.email || undefined, status: row.status || "prospect", source: row.source, city: row.city, tags: [] });
    if (!parsed.success) {
      errors.push({ row: index + 2, message: "اطلاعات مشتری معتبر نیست." });
      continue;
    }
    const duplicate = await prisma.customer.findFirst({ where: { OR: [{ email: parsed.data.email ?? undefined }, { phone: parsed.data.phone ?? undefined }], deletedAt: null } });
    if (duplicate) {
      errors.push({ row: index + 2, message: "مشتری تکراری است." });
      continue;
    }
    await prisma.customer.create({ data: customerPrismaData(parsed.data, await generateCustomerCode()) });
    imported += 1;
  }
  await audit(req, "customers.import", "customer", null, undefined, { totalRows: rows.length, imported, failed: errors.length });
  res.json({ totalRows: rows.length, importedRows: imported, failedRows: errors.length, duplicateRows: errors.filter((e) => e.message.includes("تکراری")).length, errors });
});

app.post("/api/import/leads", auth(), can("leads.create"), async (req, res) => {
  const rows = parseCsv(String(req.body ?? ""));
  let imported = 0;
  const errors: Array<{ row: number; message: string }> = [];
  for (const [index, row] of rows.entries()) {
    const parsed = leadSchema.safeParse({ name: row.name || row.fullName || row.companyName, fullName: row.fullName || row.name, companyName: row.companyName, phone: row.phone, mobile: row.mobile || row.phone, email: row.email || undefined, source: row.source || "OTHER", status: row.status || "new", priority: row.priority || "medium", ownerId: req.user!.id, tags: [] });
    if (!parsed.success) {
      errors.push({ row: index + 2, message: "اطلاعات لید معتبر نیست." });
      continue;
    }
    const duplicate = await prisma.lead.findFirst({ where: { OR: [{ email: parsed.data.email ?? undefined }, { phone: parsed.data.phone ?? undefined }], deletedAt: null } });
    if (duplicate) {
      errors.push({ row: index + 2, message: "لید تکراری است." });
      continue;
    }
    await prisma.lead.create({ data: ensureLeadPayload(parsed.data, req) });
    imported += 1;
  }
  await audit(req, "leads.import", "lead", null, undefined, { totalRows: rows.length, imported, failed: errors.length });
  res.json({ totalRows: rows.length, importedRows: imported, failedRows: errors.length, duplicateRows: errors.filter((e) => e.message.includes("تکراری")).length, errors });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err instanceof z.ZodError) return res.status(422).json({ message: "اطلاعات ارسالی معتبر نیست.", errors: err.issues });
  res.status(500).json({ message: "خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.", code: "INTERNAL_ERROR" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`CRM API listening on ${port}`));
}

export { app, prisma };
