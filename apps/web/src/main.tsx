import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  CheckSquare,
  ClipboardList,
  Download,
  FileClock,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Ticket,
  Upload,
  Users,
  UserSquare2,
  X
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const LOGO_SRC = "/logo.svg";

type ApiList<T> = { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number } };
type AuthUser = { id: string; name: string; email: string; permissions: string[] };
type Entity = Record<string, any>;

const labels: Record<string, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  prospect: "بالقوه",
  at_risk: "در معرض ریسک",
  lost: "از دست رفته",
  blocked: "مسدود",
  individual: "حقیقی",
  company: "حقوقی",
  bronze: "برنزی",
  silver: "نقره‌ای",
  gold: "طلایی",
  platinum: "پلاتینیوم",
  vip: "ویژه",
  new: "جدید",
  assigned: "تخصیص‌یافته",
  contacted: "تماس گرفته‌شده",
  in_review: "در حال بررسی",
  qualified: "واجد شرایط",
  unqualified: "فاقد شرایط",
  proposal_sent: "ارسال پیشنهاد",
  negotiation: "در مذاکره",
  disqualified: "رد شده",
  converted: "تبدیل‌شده",
  duplicate: "تکراری",
  open: "باز",
  pending: "در انتظار",
  in_progress: "در حال انجام",
  done: "انجام‌شده",
  canceled: "لغوشده",
  overdue: "عقب‌افتاده",
  escalated: "ارجاع‌شده",
  resolved: "حل‌شده",
  closed: "بسته",
  low: "کم",
  medium: "متوسط",
  high: "زیاد",
  urgent: "فوری",
  critical: "بحرانی",
  won: "برنده",
  call: "تماس",
  meeting: "جلسه",
  note: "یادداشت",
  email: "ایمیل",
  sms: "پیامک",
  whatsapp: "واتساپ",
  follow_up: "پیگیری",
  visit: "بازدید حضوری",
  contract_review: "بررسی قرارداد",
  support_followup: "پیگیری پشتیبانی",
  finance_followup: "پیگیری مالی",
  system: "سیستمی",
  other: "سایر",
  completed: "انجام‌شده",
  cancelled: "لغوشده",
  needs_followup: "نیازمند پیگیری",
  failed: "ناموفق",
  successful: "موفق",
  no_answer: "بدون پاسخ",
  busy: "اشغال",
  not_interested: "عدم تمایل",
  interested: "علاقه‌مند",
  scheduled_meeting: "جلسه زمان‌بندی شد",
  sent_proposal: "پروپوزال ارسال شد",
  unresolved: "حل نشده",
  phone: "تلفن",
  in_person: "حضوری",
  internal: "داخلی",
  customer: "مشتری",
  lead: "لید",
  opportunity: "فرصت",
  ticket: "تیکت",
  task: "وظیفه",
  general: "عمومی"
};

const taskTypes = [["general", "عمومی"], ["call", "تماس"], ["follow_up", "پیگیری"], ["meeting", "جلسه"], ["email", "ایمیل"], ["whatsapp", "واتساپ"], ["proposal", "پروپوزال"], ["contract", "قرارداد"], ["finance", "مالی"], ["operation", "عملیات"], ["support", "پشتیبانی"], ["delivery", "ارسال/تحویل"], ["report", "گزارش"]];
const taskStatuses = [["open", "باز"], ["in_progress", "در حال انجام"], ["done", "انجام‌شده"], ["canceled", "لغوشده"], ["overdue", "عقب‌افتاده"]];
const priorityOptions = [["low", "کم"], ["medium", "متوسط"], ["high", "زیاد"], ["urgent", "فوری"], ["critical", "بحرانی"]];
const relationTypes = [["", "بدون ارتباط"], ["lead", "لید"], ["customer", "مشتری"], ["opportunity", "فرصت فروش"], ["ticket", "تیکت پشتیبانی"]];
const ticketTypes = [["general_request", "درخواست عمومی"], ["customer_complaint", "شکایت مشتری"], ["operational_issue", "مشکل عملیاتی"], ["financial_issue", "مشکل مالی"], ["technical_issue", "مشکل فنی"], ["contract_request", "درخواست قراردادی"], ["sla_review", "بررسی SLA"], ["sales_follow_up", "پیگیری فروش"]];
const ticketChannels = [["phone", "تماس تلفنی"], ["email", "ایمیل"], ["messenger", "واتساپ / پیام‌رسان"], ["customer_portal", "پنل مشتری"], ["website", "وب‌سایت"], ["in_person", "حضوری"], ["api", "API"], ["internal", "داخلی"]];
const ticketStatuses = [["open", "باز"], ["pending", "در انتظار"], ["in_progress", "در حال بررسی"], ["escalated", "ارجاع‌شده"], ["resolved", "حل‌شده"], ["closed", "بسته‌شده"], ["canceled", "لغوشده"]];
const ticketTeams = [["support", "پشتیبانی"], ["operations", "عملیات"], ["finance", "مالی"], ["sales", "فروش"], ["technical", "فنی"], ["management", "مدیریت"]];
const activityTypes = [["call", "تماس"], ["meeting", "جلسه"], ["note", "یادداشت"], ["email", "ایمیل"], ["sms", "پیامک"], ["whatsapp", "واتساپ"], ["follow_up", "پیگیری"], ["visit", "بازدید حضوری"], ["contract_review", "بررسی قرارداد"], ["support_followup", "پیگیری پشتیبانی"], ["finance_followup", "پیگیری مالی"], ["system", "سیستمی"], ["other", "سایر"]];
const activityStatuses = [["open", "باز"], ["completed", "انجام‌شده"], ["cancelled", "لغوشده"], ["needs_followup", "نیازمند پیگیری"], ["failed", "ناموفق"]];
const activityPriorities = [["low", "کم"], ["medium", "متوسط"], ["high", "زیاد"], ["urgent", "فوری"]];
const activityResults = [["successful", "موفق"], ["no_answer", "بدون پاسخ"], ["busy", "اشغال"], ["not_interested", "عدم تمایل"], ["interested", "علاقه‌مند"], ["needs_followup", "نیازمند پیگیری"], ["scheduled_meeting", "جلسه زمان‌بندی شد"], ["sent_proposal", "پروپوزال ارسال شد"], ["resolved", "حل شد"], ["unresolved", "حل نشده"]];
const activityChannels = [["phone", "تلفن"], ["in_person", "حضوری"], ["email", "ایمیل"], ["sms", "پیامک"], ["whatsapp", "واتساپ"], ["system", "سیستم"], ["internal", "داخلی"], ["other", "سایر"]];
const activityEntityTypes = [["lead", "لید"], ["customer", "مشتری"], ["opportunity", "فرصت"], ["ticket", "تیکت"], ["task", "وظیفه"], ["general", "عمومی"]];

const leadStatuses = [
  { label: "جدید", value: "new", probability: 5 },
  { label: "تماس گرفته‌شده", value: "contacted", probability: 15 },
  { label: "در حال بررسی", value: "in_review", probability: 25 },
  { label: "واجد شرایط", value: "qualified", probability: 40 },
  { label: "ارسال پیشنهاد", value: "proposal_sent", probability: 60 },
  { label: "در مذاکره", value: "negotiation", probability: 75 },
  { label: "تبدیل به مشتری", value: "converted", probability: 100 },
  { label: "رد شده", value: "disqualified", probability: 0 },
  { label: "از دست رفته", value: "lost", probability: 0 }
];

const leadPriorities = [
  { label: "کم", value: "low", score: 20 },
  { label: "متوسط", value: "medium", score: 50 },
  { label: "زیاد", value: "high", score: 75 },
  { label: "فوری", value: "urgent", score: 90 }
];

const leadSources = [
  ["WEBSITE", "وب‌سایت"],
  ["PHONE_CALL", "تماس تلفنی"],
  ["WEB_FORM", "فرم سایت"],
  ["CAMPAIGN", "کمپین تبلیغاتی"],
  ["SOCIAL_MEDIA", "شبکه‌های اجتماعی"],
  ["REFERRAL", "معرفی مشتری"],
  ["EXHIBITION", "نمایشگاه"],
  ["DIRECT_SALES", "فروش مستقیم"],
  ["MARKETPLACE", "مارکت‌پلیس"],
  ["OTHER", "سایر"]
];

const businessTypes = [
  ["ONLINE_SHOP", "فروشگاه اینترنتی"],
  ["MARKETPLACE", "مارکت‌پلیس"],
  ["ENTERPRISE", "شرکت سازمانی"],
  ["SOCIAL_SELLER", "فروشنده اینستاگرامی"],
  ["MANUFACTURER", "تولیدکننده"],
  ["DISTRIBUTION", "پخش و توزیع"],
  ["SMB", "فروشنده خرد"],
  ["OTHER", "سایر"]
];

const serviceNeeds = [
  ["IN_CITY_DELIVERY", "ارسال درون‌شهری"],
  ["INTER_CITY_DELIVERY", "ارسال بین‌شهری"],
  ["EXPRESS_DELIVERY", "ارسال اکسپرس"],
  ["COD", "پرداخت در محل"],
  ["WAREHOUSING", "انبارداری"],
  ["REVERSE_LOGISTICS", "لجستیک معکوس / مرجوعی"],
  ["API_INTEGRATION", "API و اتصال سیستمی"],
  ["COMBINED_SERVICE", "سرویس ترکیبی"]
];

const modules = [
  { path: "/dashboard", label: "داشبورد", icon: LayoutDashboard, permission: "reports.read" },
  { path: "/leads", label: "لیدها", icon: UserSquare2, permission: "leads.read" },
  { path: "/opportunities", label: "فرصت‌ها", icon: Briefcase, permission: "opportunities.read" },
  { path: "/pipeline", label: "قیف فروش", icon: ClipboardList, permission: "opportunities.read" },
  { path: "/customers", label: "مشتریان", icon: Users, permission: "customers.read" },
  { path: "/tasks", label: "وظایف", icon: CheckSquare, permission: "tasks.read" },
  { path: "/activities", label: "فعالیت‌ها", icon: Activity, permission: "activities.read" },
  { path: "/tickets", label: "تیکت‌ها", icon: Ticket, permission: "tickets.read" },
  { path: "/reports", label: "گزارش‌ها", icon: BarChart3, permission: "reports.read" },
  { path: "/admin/users", label: "مدیریت کاربران", icon: Users, permission: "users.read" },
  { path: "/admin/roles", label: "نقش‌ها و دسترسی‌ها", icon: ShieldCheck, permission: "roles.read" },
  { path: "/admin/settings", label: "تنظیمات", icon: Settings, permission: "settings.read" },
  { path: "/audit-logs", label: "گزارش لاگ سیستم", icon: FileClock, permission: "audit_logs.read" }
];

const pageConfig: Record<string, any> = {
  customers: {
    title: "مشتریان",
    endpoint: "customers",
    permission: "customers",
    create: "مشتری جدید",
    empty: "هنوز هیچ مشتری ثبت نشده است.",
    columns: [["name", "نام"], ["phone", "تلفن"], ["email", "ایمیل"], ["status", "وضعیت"], ["segment", "بخش"], ["owner.name", "مالک"]],
    form: [
      ["name", "نام مشتری", "text"],
      ["companyName", "نام شرکت", "text"],
      ["phone", "شماره تماس", "text"],
      ["email", "ایمیل", "email"],
      ["status", "وضعیت", "select", ["prospect", "active", "inactive", "at_risk", "lost"]],
      ["segment", "بخش", "text"],
      ["city", "شهر", "text"],
      ["source", "منبع جذب", "text"]
    ],
    defaults: { type: "individual", tags: [] }
  },
  leads: {
    title: "لیدها",
    endpoint: "leads",
    permission: "leads",
    create: "لید جدید",
    empty: "هنوز هیچ لیدی ثبت نشده است. می‌توانید لید جدید بسازید یا فایل CSV وارد کنید.",
    columns: [["name", "نام"], ["phone", "تلفن"], ["email", "ایمیل"], ["status", "وضعیت"], ["source", "منبع"], ["priority", "اولویت"], ["owner.name", "مالک"]],
    form: [
      ["name", "نام لید", "text"],
      ["companyName", "شرکت", "text"],
      ["phone", "شماره تماس", "text"],
      ["email", "ایمیل", "email"],
      ["source", "منبع", "text"],
      ["campaign", "کمپین", "text"],
      ["status", "وضعیت", "select", ["new", "assigned", "contacted", "qualified", "unqualified", "lost", "duplicate"]],
      ["priority", "اولویت", "select", ["low", "medium", "high", "urgent"]]
    ],
    defaults: { tags: [], score: 0 }
  },
  opportunities: {
    title: "فرصت‌ها",
    endpoint: "opportunities",
    permission: "opportunities",
    create: "فرصت جدید",
    empty: "هنوز هیچ فرصتی ثبت نشده است.",
    columns: [["title", "عنوان"], ["customer.name", "مشتری"], ["amount", "مبلغ"], ["probability", "احتمال"], ["stage.name", "مرحله"], ["status", "وضعیت"]],
    form: [
      ["title", "عنوان فرصت", "text"],
      ["customerId", "شناسه مشتری", "text"],
      ["stageId", "شناسه مرحله", "text"],
      ["amount", "مبلغ", "number"],
      ["probability", "احتمال موفقیت", "select", ["10", "25", "40", "60", "80", "100"]],
      ["expectedCloseDate", "تاریخ بسته‌شدن", "date"],
      ["nextStep", "گام بعدی", "text"]
    ],
    defaults: {}
  },
  tasks: {
    title: "وظایف",
    endpoint: "tasks",
    permission: "tasks",
    create: "وظیفه جدید",
    empty: "وظیفه‌ای برای نمایش وجود ندارد.",
    columns: [["title", "عنوان"], ["owner.name", "مسئول"], ["priority", "اولویت"], ["status", "وضعیت"], ["dueDate", "سررسید"]],
    form: [["title", "عنوان", "text"], ["description", "توضیحات", "textarea"], ["ownerId", "شناسه مسئول", "text"], ["priority", "اولویت", "select", ["low", "medium", "high", "urgent"]], ["dueDate", "سررسید", "date"]],
    defaults: {}
  },
  activities: {
    title: "فعالیت‌ها",
    endpoint: "activities",
    permission: "activities",
    create: "ثبت فعالیت",
    empty: "هنوز فعالیتی ثبت نشده است.",
    columns: [["title", "عنوان"], ["activityType", "نوع"], ["entityType", "موجودیت"], ["createdBy.name", "ثبت‌کننده"], ["occurredAt", "زمان"]],
    form: [["title", "عنوان", "text"], ["description", "توضیحات", "textarea"], ["entityType", "نوع موجودیت", "select", ["customer", "lead", "opportunity", "ticket"]], ["entityId", "شناسه موجودیت", "text"], ["activityType", "نوع فعالیت", "select", ["call", "email", "meeting", "sms", "note", "follow_up"]]],
    defaults: {}
  },
  tickets: {
    title: "تیکت‌ها",
    endpoint: "tickets",
    permission: "tickets",
    create: "تیکت جدید",
    empty: "تیکتی برای نمایش وجود ندارد.",
    columns: [["subject", "موضوع"], ["customer.name", "مشتری"], ["priority", "اولویت"], ["status", "وضعیت"], ["slaDueAt", "مهلت SLA"], ["owner.name", "مسئول"]],
    form: [["subject", "موضوع", "text"], ["description", "توضیحات", "textarea"], ["customerId", "شناسه مشتری", "text"], ["priority", "اولویت", "select", ["low", "medium", "high", "critical"]], ["status", "وضعیت", "select", ["open", "pending", "resolved", "closed"]], ["slaDueAt", "مهلت SLA", "date"]],
    defaults: {}
  },
  users: {
    title: "مدیریت کاربران",
    endpoint: "users",
    permission: "users",
    create: "کاربر جدید",
    empty: "هنوز کاربری ثبت نشده است.",
    columns: [["name", "نام"], ["email", "ایمیل"], ["status", "وضعیت"], ["team.name", "تیم"]],
    form: [["name", "نام", "text"], ["email", "ایمیل", "email"], ["password", "رمز عبور", "password"], ["status", "وضعیت", "select", ["active", "disabled"]]],
    defaults: { status: "active" }
  }
};

function getValue(row: Entity, key: string) {
  return key.split(".").reduce((value, part) => value?.[part], row);
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof Blob ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    credentials: "include"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "خطای ناشناخته رخ داد." }));
    throw new Error(error.message || "درخواست ناموفق بود.");
  }
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("text/csv")) return (await response.text()) as T;
  return response.json();
}

function has(user: AuthUser | null, permission: string) {
  const aliases: Record<string, string[]> = {
    "leads.read": ["lead.view"],
    "leads.create": ["lead.create"],
    "leads.update": ["lead.update"],
    "leads.delete": ["lead.delete"],
    "leads.convert": ["lead.convert"],
    "leads.assign": ["lead.assign"],
    "leads.export": ["lead.export"]
  };
  return !!user && (user.permissions.includes("*") || [permission, ...(aliases[permission] ?? [])].some((item) => user.permissions.includes(item)));
}

function Login({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("change_me_immediately");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api<{ accessToken: string; user: AuthUser }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("accessToken", result.accessToken);
      onLogin(result.user);
      history.replaceState(null, "", "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-copy">
          <img className="brand-logo" src={LOGO_SRC} alt="لوگوی شرکت" />
          <h1>CRM سازمانی دیجى‌اکسپرس</h1>
          <p>مدیریت مشتریان، لیدها، فرصت‌ها و پشتیبانی در یک محیط فارسی، سریع و قابل اتکا.</p>
          <div className="hero-grid">
            <span>دید ۳۶۰ درجه مشتری</span>
            <span>قیف فروش زنده</span>
            <span>RBAC و گزارش لاگ سیستم</span>
            <span>گزارش‌های عملیاتی</span>
          </div>
        </div>
        <form className="login-card" onSubmit={submit}>
          <Lock size={28} />
          <h2>ورود به سامانه</h2>
          <label>ایمیل</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          <label>رمز عبور</label>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          {error && <div className="error-state">{error}</div>}
          <button className="primary" disabled={loading}>{loading ? "در حال ورود..." : "ورود"}</button>
          <p className="hint">اطلاعات پیش‌فرض فقط از seed اولیه ساخته می‌شود و باید در تولید تغییر کند.</p>
        </form>
      </section>
    </main>
  );
}

function Shell({ user, children, onLogout }: { user: AuthUser; children: React.ReactNode; onLogout: () => void }) {
  const [path, setPath] = useState(location.pathname === "/" ? "/dashboard" : location.pathname);
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(() => localStorage.getItem("sidebarPinned") !== "false");
  useEffect(() => {
    const listener = () => setPath(location.pathname);
    addEventListener("popstate", listener);
    return () => removeEventListener("popstate", listener);
  }, []);
  useEffect(() => {
    api<{ data: any[] }>("/notifications").then((result) => setNotifications(result.data)).catch(() => undefined);
  }, [path]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (globalSearch.trim().length < 2) return setSearchResults([]);
      api<{ data: any[] }>(`/search?q=${encodeURIComponent(globalSearch)}`).then((result) => setSearchResults(result.data)).catch(() => setSearchResults([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [globalSearch]);
  function navigate(next: string) {
    history.pushState(null, "", next);
    dispatchEvent(new PopStateEvent("popstate"));
    setPath(next);
    setSearchResults([]);
    setSidebarOpen(false);
  }
  async function openNotification(item: any) {
    await api(`/notifications/${item.id}/read`, { method: "PATCH" }).catch(() => undefined);
    setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, readAt: new Date().toISOString() } : notification));
    setShowNotifications(false);
    navigate(item.path);
  }
  function toggleSidebarPinned() {
    setSidebarPinned((current) => {
      localStorage.setItem("sidebarPinned", String(!current));
      return !current;
    });
  }
  const unreadCount = notifications.filter((item) => !item.readAt).length;
  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""} ${sidebarPinned ? "sidebar-pinned" : "sidebar-unpinned"}`}>
      <button className="mobile-menu-button" onClick={() => setSidebarOpen(true)}><Menu size={22} />منو</button>
      {!sidebarPinned && <button className="desktop-menu-button" onClick={toggleSidebarPinned}><Menu size={18} />نمایش منو</button>}
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      <aside className="sidebar">
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18} />بستن</button>
        <button className="desktop-pin-toggle" onClick={toggleSidebarPinned}>{sidebarPinned ? "Unpin منو" : "Pin منو"}</button>
        <div className="logo"><img src={LOGO_SRC} alt="لوگوی شرکت" /><strong>CRM</strong></div>
        <nav>
          {modules.filter((item) => has(user, item.permission)).map((item) => {
            const Icon = item.icon;
            return <button key={item.path} className={path.startsWith(item.path) ? "active" : ""} onClick={() => navigate(item.path)}><Icon size={18} />{item.label}</button>;
          })}
        </nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div className="global-search">
            <div className="searchbox"><Search size={18} /><input value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="جست‌وجوی سراسری در تمام صفحات..." /></div>
            {searchResults.length > 0 && <div className="search-results">{searchResults.map((item) => <button key={`${item.type}-${item.path}-${item.label}`} onClick={() => navigate(item.path)}><strong>{item.label}</strong><span>{item.subtitle}</span></button>)}</div>}
          </div>
          <div className="top-actions">
            <div className="notification-wrap">
              <button className="icon-button" onClick={() => setShowNotifications(!showNotifications)}><Bell size={18} />{unreadCount > 0 && <b>{unreadCount.toLocaleString("fa-IR")}</b>}</button>
              {showNotifications && <div className="notification-menu">{notifications.length === 0 ? <p>نوتیفیکیشنی وجود ندارد.</p> : notifications.map((item) => <button key={item.id} className={item.readAt ? "" : "unread"} onClick={() => openNotification(item)}><strong>{item.title}</strong><span>{item.message}</span><small>{persianDateTime(item.createdAt)}</small></button>)}</div>}
            </div>
            <div className="user-chip"><span>{user.name}</span></div>
            <button className="ghost" onClick={onLogout}><LogOut size={16} />خروج</button>
          </div>
        </header>
        <main className="content">{children}</main>
      </section>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState("");
  useEffect(() => {
    api<any>("/reports/dashboard").then(setData).catch((err) => setError(err.message));
  }, []);
  const cards = [
    ["تعداد مشتریان", data?.cards?.customers, "مشتریان ثبت‌شده"],
    ["لیدهای جدید", data?.cards?.newLeads, "نیازمند پیگیری"],
    ["فرصت‌های باز", data?.cards?.openOpportunities, "در قیف فروش"],
    ["ارزش قیف فروش", money(data?.cards?.pipelineValue), "بر اساس فرصت‌های باز"],
    ["وظایف امروز", data?.cards?.tasksToday, "برنامه کاری"],
    ["وظایف عقب‌افتاده", data?.cards?.overdueTasks, "نیازمند اقدام"],
    ["تیکت‌های باز", data?.cards?.openTickets, "پشتیبانی"],
    ["SLA نزدیک به نقض", data?.cards?.slaSoon, "هشدار عملیاتی"]
  ];
  return (
    <PageHeader title="داشبورد مدیریتی" description="نمای زنده از فروش، پشتیبانی و فعالیت‌های روزانه">
      {error && <div className="error-state">{error}</div>}
      {!data ? <Skeleton /> : (
        <>
          <div className="kpi-grid">{cards.map(([title, value, note]) => <article className="kpi-card" key={title}><span>{title}</span><strong>{value ?? 0}</strong><small>{note}</small></article>)}</div>
          <div className="chart-grid">
            <ChartCard title="لیدها بر اساس منبع" data={data.charts.leadSources} />
            <ChartCard title="فرصت‌ها بر اساس مرحله" data={data.charts.stages} bar />
            <ChartCard title="فعالیت‌ها در ۷ روز اخیر" data={data.charts.activities} />
            <ChartCard title="وضعیت تیکت‌ها" data={data.charts.tickets} />
          </div>
        </>
      )}
    </PageHeader>
  );
}

function ChartCard({ title, data, bar = false }: { title: string; data: any[]; bar?: boolean }) {
  const colors = ["#21409A", "#FFC10E", "#00A700", "#D50000", "#64748B", "#7C3AED", "#EA580C"];
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800}>{Number(value ?? 0).toLocaleString("fa-IR")}</text>;
  };
  return (
    <article className="panel">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={230}>
        {bar ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="تعداد" fill="#21409A" radius={[8, 8, 0, 0]}>
              <LabelList dataKey="count" position="insideTop" fill="#fff" formatter={(value: any) => Number(value ?? 0).toLocaleString("fa-IR")} />
            </Bar>
          </BarChart>
        ) : (
          <PieChart>
            <Pie dataKey="value" nameKey="name" data={data} outerRadius={82} labelLine={false} label={renderPieLabel}>
              {data.map((_: any, index: number) => <Cell key={index} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </article>
  );
}

function EntityPage({ type, user }: { type: keyof typeof pageConfig; user: AuthUser }) {
  const config = pageConfig[type];
  const [rows, setRows] = useState<Entity[]>([]);
  const [metaInfo, setMetaInfo] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load(page = 1) {
    setLoading(true);
    setError("");
    try {
      const result = await api<ApiList<Entity>>(`/${config.endpoint}?page=${page}&pageSize=25&search=${encodeURIComponent(search)}`);
      setRows(result.data);
      setMetaInfo(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت اطلاعات ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, [type]);

  async function remove(id: string) {
    if (!confirm("آیا از حذف این رکورد مطمئن هستید؟ این عملیات در گزارش لاگ سیستم ثبت می‌شود.")) return;
    await api(`/${config.endpoint}/${id}`, { method: "DELETE" });
    load(metaInfo.page);
  }

  async function exportCsv() {
    const csv = await api<string>(`/export/${config.endpoint}`);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${config.endpoint}.csv`;
    link.click();
  }

  return (
    <PageHeader title={config.title} description="جست‌وجو، فیلتر، ثبت و مدیریت داده‌های عملیاتی">
      <div className="toolbar">
        <div className="searchbox inline"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && load(1)} placeholder={`جست‌وجو در ${config.title}...`} /></div>
        <button className="ghost" onClick={() => load(1)}>اعمال فیلتر</button>
        {has(user, `${config.permission}.export`) && <button className="ghost" onClick={exportCsv}><Download size={16} />خروجی CSV</button>}
        {has(user, `${config.permission}.create`) && <button className="primary" onClick={() => setShowForm(true)}><Plus size={16} />{config.create}</button>}
      </div>
      {error && <div className="error-state">{error}</div>}
      {loading ? <Skeleton /> : rows.length === 0 ? <EmptyState text={config.empty} action={config.create} onAction={() => setShowForm(true)} /> : (
        <DataTable rows={rows} columns={config.columns} onDelete={has(user, `${config.permission}.delete`) ? remove : undefined} />
      )}
      <Pagination meta={metaInfo} onPage={load} />
      {showForm && <EntityForm config={config} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(1); }} />}
    </PageHeader>
  );
}

function EntityForm({ config, onClose, onSaved }: { config: any; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<Record<string, any>>(config.defaults);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api(`/${config.endpoint}`, { method: "POST", body: JSON.stringify(values) });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت اطلاعات ناموفق بود.");
    }
  }
  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <h2>{config.create}</h2>
        <div className="form-grid">
          {config.form.map(([name, label, type, options]: any[]) => (
            <label key={name} className={type === "textarea" ? "wide" : ""}>{label}
              {type === "select" ? <select value={values[name] ?? ""} onChange={(event) => setValues({ ...values, [name]: event.target.value })}><option value="">انتخاب کنید</option>{options.map((option: string) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select> :
                type === "textarea" ? <textarea value={values[name] ?? ""} onChange={(event) => setValues({ ...values, [name]: event.target.value })} /> :
                  <input type={type} value={values[name] ?? ""} onChange={(event) => setValues({ ...values, [name]: type === "number" ? Number(event.target.value) : event.target.value })} />}
            </label>
          ))}
        </div>
        {error && <div className="error-state">{error}</div>}
        <div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>انصراف</button><button className="primary">ذخیره</button></div>
      </form>
    </div>
  );
}

function Pipeline() {
  const [stages, setStages] = useState<any[]>([]);
  const [error, setError] = useState("");
  async function load() {
    try {
      const result = await api<{ data: any[] }>("/reports/sales-pipeline");
      setStages(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت قیف فروش ناموفق بود.");
    }
  }
  useEffect(() => { load(); }, []);
  async function move(id: string, stageId: string, isLost: boolean) {
    const lostReason = isLost ? prompt("دلیل باخت فرصت را وارد کنید:") : undefined;
    if (isLost && !lostReason) return;
    await api(`/opportunities/${id}/change-stage`, { method: "POST", body: JSON.stringify({ stageId, lostReason }) });
    load();
  }
  return (
    <PageHeader title="قیف فروش" description="نمای کانبان فرصت‌ها همراه با تغییر مرحله و ثبت حسابرسی">
      {error && <div className="error-state">{error}</div>}
      <div className="kanban">
        {stages.map((stage) => (
          <section className="kanban-column" key={stage.id}>
            <header><span style={{ background: stage.color }} />{stage.name}<small>{stage.opportunities.length}</small></header>
            {stage.opportunities.map((opportunity: any) => (
              <article className="deal-card" key={opportunity.id}>
                <strong>{opportunity.title}</strong>
                <small>{opportunity.customer?.name}</small>
                <b>{money(opportunity.amount)}</b>
                <select value={stage.id} onChange={(event) => move(opportunity.id, event.target.value, stages.find((item) => item.id === event.target.value)?.isLost)}>
                  {stages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </article>
            ))}
          </section>
        ))}
      </div>
    </PageHeader>
  );
}

const leadColumns = [
  ["name", "نام"],
  ["companyName", "شرکت / کسب‌وکار"],
  ["mobile", "تلفن"],
  ["email", "ایمیل"],
  ["source", "منبع"],
  ["status", "وضعیت"],
  ["probability", "احتمال"],
  ["priority", "اولویت"],
  ["monthlyShipmentVolume", "حجم ماهانه"],
  ["owner.name", "مسئول"],
  ["lastContactAt", "آخرین تماس"],
  ["nextFollowUpAt", "پیگیری بعدی"]
];

function optionLabel(options: Array<any>, value: any) {
  const found = options.find((item) => Array.isArray(item) ? item[0] === value : item.value === value);
  return found ? (Array.isArray(found) ? found[1] : found.label) : (labels[value] ?? value ?? "—");
}

function LeadModule({ user }: { user: AuthUser }) {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const listener = () => setPath(location.pathname);
    addEventListener("popstate", listener);
    return () => removeEventListener("popstate", listener);
  }, []);
  const id = path.match(/^\/leads\/([^/]+)/)?.[1];
  return id ? <LeadDetail id={id} user={user} /> : <LeadList user={user} />;
}

function LeadList({ user }: { user: AuthUser }) {
  const [rows, setRows] = useState<any[]>([]);
  const [metaInfo, setMetaInfo] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", status: "", source: "", priority: "", ownerId: "", overdue: false, withoutFollowUp: false, sortBy: "createdAt", sortOrder: "desc" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(page = 1) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), pageSize: "25", sortBy: filters.sortBy, sortOrder: filters.sortOrder });
    Object.entries(filters).forEach(([key, value]) => {
      if (value && !["sortBy", "sortOrder"].includes(key)) params.set(key, String(value));
    });
    try {
      const result = await api<ApiList<any>>(`/leads?${params.toString()}`);
      setRows(result.data);
      setMetaInfo(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت اطلاعات لیدها با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  function openLead(id: string) {
    history.pushState(null, "", `/leads/${id}`);
    dispatchEvent(new PopStateEvent("popstate"));
  }

  async function remove(id: string) {
    if (!confirm("آیا از حذف نرم این لید مطمئن هستید؟")) return;
    await api(`/leads/${id}`, { method: "DELETE" });
    load(metaInfo.page);
  }

  async function exportCsv() {
    const params = new URLSearchParams({ search: filters.search, status: filters.status, source: filters.source, priority: filters.priority });
    const csv = await api<string>(`/leads/export?${params.toString()}`);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "leads.csv";
    link.click();
  }

  async function quickStatus(id: string, status: string) {
    const extra: any = {};
    if (status === "lost") extra.lostReason = prompt("دلیل از دست رفتن لید را وارد کنید:");
    if (status === "disqualified") extra.disqualificationReason = prompt("دلیل رد شدن لید را وارد کنید:");
    if ((status === "lost" && !extra.lostReason) || (status === "disqualified" && !extra.disqualificationReason)) return;
    await api(`/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, ...extra }) });
    load(metaInfo.page);
  }

  return (
    <PageHeader title="لیدها" description="ثبت، ارزیابی، پیگیری و تبدیل سرنخ‌های فروش لجستیکی به مشتری واقعی">
      <div className="toolbar advanced-toolbar">
        <div className="searchbox inline"><Search size={18} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} onKeyDown={(event) => event.key === "Enter" && load(1)} placeholder="جست‌وجو در نام، شرکت، تلفن، ایمیل یا توضیحات..." /></div>
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">همه وضعیت‌ها</option>{leadStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        <select value={filters.source} onChange={(event) => setFilters({ ...filters, source: event.target.value })}><option value="">همه منابع</option>{leadSources.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="">همه اولویت‌ها</option>{leadPriorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        <select value={filters.sortBy} onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}><option value="createdAt">تاریخ ایجاد</option><option value="probability">احتمال</option><option value="priority">اولویت</option><option value="lastContactAt">آخرین تماس</option><option value="nextFollowUpAt">پیگیری بعدی</option></select>
        <button className="ghost" onClick={() => load(1)}>اعمال فیلتر</button>
        {has(user, "leads.export") && <button className="ghost" onClick={exportCsv}><Download size={16} />خروجی CSV</button>}
        {has(user, "leads.create") && <button className="primary" onClick={() => setShowForm(true)}><Plus size={16} />لید جدید</button>}
      </div>
      <div className="filter-chips">
        <label><input type="checkbox" checked={filters.overdue} onChange={(event) => setFilters({ ...filters, overdue: event.target.checked })} /> پیگیری عقب‌افتاده</label>
        <label><input type="checkbox" checked={filters.withoutFollowUp} onChange={(event) => setFilters({ ...filters, withoutFollowUp: event.target.checked })} /> بدون پیگیری بعدی</label>
      </div>
      <div className="stats-grid compact">
        <article><span>کل لیدها</span><strong>{metaInfo.total.toLocaleString("fa-IR")}</strong></article>
        <article><span>لیدهای واجد شرایط</span><strong>{rows.filter((row) => row.status === "qualified").length.toLocaleString("fa-IR")}</strong></article>
        <article><span>تبدیل‌شده در صفحه</span><strong>{rows.filter((row) => row.status === "converted").length.toLocaleString("fa-IR")}</strong></article>
        <article><span>میانگین احتمال</span><strong>{rows.length ? Math.round(rows.reduce((sum, row) => sum + Number(row.probability ?? 0), 0) / rows.length).toLocaleString("fa-IR") : "۰"}٪</strong></article>
      </div>
      {error && <div className="error-state">{error}</div>}
      {loading ? <Skeleton /> : rows.length === 0 ? <EmptyState text="هنوز هیچ لیدی ثبت نشده است. برای شروع، روی دکمه «لید جدید» کلیک کنید." action="لید جدید" onAction={() => setShowForm(true)} /> : (
        <DataTable rows={rows} columns={leadColumns} renderCell={(row, key) => {
          if (key === "source") return optionLabel(leadSources, row.source);
          if (key === "probability") return <span className="probability-pill">{Number(row.probability ?? 0).toLocaleString("fa-IR")}٪</span>;
          return format(getValue(row, key));
        }} actions={(row) => (
          <div className="row-actions">
            <button className="ghost" onClick={() => openLead(row.id)}>جزئیات</button>
            {has(user, "leads.update") && <button className="ghost" onClick={() => setEditing(row)}>ویرایش</button>}
            {has(user, "leads.update") && <select value={row.status} onChange={(event) => quickStatus(row.id, event.target.value)}>{leadStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>}
            {has(user, "leads.delete") && <button className="danger" onClick={() => remove(row.id)}>حذف</button>}
          </div>
        )} />
      )}
      <Pagination meta={metaInfo} onPage={load} />
      {showForm && <LeadForm user={user} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(1); }} />}
      {editing && <LeadForm user={user} initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(metaInfo.page); }} />}
    </PageHeader>
  );
}

function LeadForm({ user, initial, onClose, onSaved }: { user: AuthUser; initial?: any; onClose: () => void; onSaved: () => void }) {
  const defaultStatus = initial?.status ?? "new";
  const [values, setValues] = useState<Record<string, any>>({
    status: defaultStatus,
    probability: leadStatuses.find((item) => item.value === defaultStatus)?.probability ?? 5,
    priority: initial?.priority ?? "medium",
    source: initial?.source ?? "WEBSITE",
    ownerId: initial?.ownerId ?? user.id,
    hasApiNeed: false,
    hasCodPaymentNeed: false,
    hasWarehousingNeed: false,
    hasReverseLogisticsNeed: false,
    ...initial
  });
  const [users, setUsers] = useState<AuthUser[]>([user]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const required = ["source", "status", "priority", "ownerId"];
  const logisticsNeedLabels: Record<string, string> = {
    hasApiNeed: "نیاز به API",
    hasCodPaymentNeed: "نیاز به پرداخت در محل",
    hasWarehousingNeed: "نیاز به انبارداری",
    hasReverseLogisticsNeed: "نیاز به مرجوعی"
  };

  useEffect(() => {
    api<ApiList<AuthUser>>("/users?pageSize=100").then((result) => setUsers(result.data)).catch(() => setUsers([user]));
  }, []);

  function setField(name: string, value: any) {
    if (name === "status") {
      const probability = leadStatuses.find((item) => item.value === value)?.probability ?? 0;
      setValues((current) => ({ ...current, status: value, probability }));
    } else if (name === "priority") {
      const score = leadPriorities.find((item) => item.value === value)?.score ?? 50;
      setValues((current) => ({ ...current, priority: value, score }));
    } else {
      setValues((current) => ({ ...current, [name]: value }));
    }
  }

  function invalid(name: string) {
    const hasIdentity = Boolean(values.name || values.fullName || values.companyName || values.businessName);
    const hasContact = Boolean(values.mobile || values.phone);
    return submitted && ((name === "identity" && !hasIdentity) || (name === "contact" && !hasContact) || (required.includes(name) && !values[name]) || (name === "lostReason" && values.status === "lost" && !values.lostReason) || (name === "disqualificationReason" && values.status === "disqualified" && !values.disqualificationReason));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    if (invalid("identity") || invalid("contact") || required.some(invalid) || invalid("lostReason") || invalid("disqualificationReason")) {
      setError("لطفاً فیلدهای الزامی مشخص‌شده با رنگ قرمز را تکمیل کنید.");
      return;
    }
    setSaving(true);
    try {
      const { owner: _owner, originCitiesText, destinationCitiesText, ...rest } = values;
      const payload: Record<string, any> = {
        ...rest,
        originCities: String(originCitiesText ?? values.originCities ?? "").split(/[،,]/).map((item) => item.trim()).filter(Boolean),
        destinationCities: String(destinationCitiesText ?? values.destinationCities ?? "").split(/[،,]/).map((item) => item.trim()).filter(Boolean)
      };
      await api(initial ? `/leads/${initial.id}` : "/leads", { method: initial ? "PATCH" : "POST", body: JSON.stringify(payload) });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت اطلاعات لید ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  const requiredMark = <span className="required-star">*</span>;
  const textField = (name: string, label: string, type = "text", marker?: string) => <label className={invalid(marker ?? name) ? "field-invalid" : ""}>{label}{marker ? requiredMark : null}<input type={type} value={values[name] ?? ""} onChange={(event) => setField(name, type === "number" ? Number(event.target.value) : event.target.value)} />{invalid(marker ?? name) && <small>این فیلد الزامی است.</small>}</label>;
  const selectField = (name: string, label: string, options: any[], requiredField = false) => <label className={invalid(name) ? "field-invalid" : ""}>{label}{requiredField ? requiredMark : null}<select value={values[name] ?? ""} onChange={(event) => setField(name, event.target.value)}><option value="">انتخاب کنید</option>{options.map((item) => Array.isArray(item) ? <option key={item[0]} value={item[0]}>{item[1]}</option> : <option key={item.value} value={item.value}>{item.label}</option>)}</select>{invalid(name) && <small>این فیلد الزامی است.</small>}</label>;

  return (
    <div className="modal-backdrop">
      <form className="modal wide-modal" onSubmit={submit}>
        <h2>{initial ? "ویرایش لید" : "لید جدید"}</h2>
        <section className="form-section"><h3>اطلاعات تماس</h3><div className="form-grid">
          {textField("name", "نام یا نام لید", "text", "identity")}
          {textField("companyName", "نام شرکت / کسب‌وکار", "text", "identity")}
          {textField("mobile", "موبایل", "text", "contact")}
          {textField("phone", "تلفن", "text", "contact")}
          {textField("email", "ایمیل", "email")}
          {textField("website", "وب‌سایت", "url")}
        </div></section>
        <section className="form-section"><h3>اطلاعات شرکت و نیاز لجستیکی</h3><div className="form-grid">
          {selectField("businessType", "نوع کسب‌وکار", businessTypes)}
          {textField("industry", "صنعت")}
          {textField("monthlyShipmentVolume", "حجم مرسوله ماهانه", "number")}
          {textField("averageDailyOrders", "میانگین سفارش روزانه", "number")}
          {selectField("mainServiceNeed", "نیاز اصلی خدمات", serviceNeeds)}
          {textField("currentCourierProvider", "سرویس‌دهنده فعلی")}
          {textField("originCitiesText", "شهرهای مبدا")}
          {textField("destinationCitiesText", "شهرهای مقصد")}
          <label className="wide">نقاط درد / چالش‌ها<textarea value={values.painPoints ?? ""} onChange={(event) => setField("painPoints", event.target.value)} /></label>
          <div className="checkbox-grid wide">
            {["hasApiNeed", "hasCodPaymentNeed", "hasWarehousingNeed", "hasReverseLogisticsNeed"].map((key) => <label className="check-item" key={key}><input type="checkbox" checked={!!values[key]} onChange={(event) => setField(key, event.target.checked)} />{logisticsNeedLabels[key]}</label>)}
          </div>
        </div></section>
        <section className="form-section"><h3>اطلاعات فروش</h3><div className="form-grid">
          {selectField("source", "منبع لید", leadSources, true)}
          {selectField("status", "وضعیت لید", leadStatuses, true)}
          {selectField("priority", "اولویت", leadPriorities, true)}
          <label>احتمال<input type="number" min={0} max={100} value={values.probability ?? 0} readOnly={!has(user, "lead.overrideProbability")} onChange={(event) => setField("probability", Number(event.target.value))} /></label>
          <label className={invalid("ownerId") ? "field-invalid" : ""}>مسئول پیگیری{requiredMark}<select value={values.ownerId ?? ""} onChange={(event) => setField("ownerId", event.target.value)}>{users.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{invalid("ownerId") && <small>این فیلد الزامی است.</small>}</label>
          {textField("nextFollowUpAt", "تاریخ پیگیری بعدی", "date")}
          {values.status === "lost" && textField("lostReason", "دلیل از دست رفتن", "text", "lostReason")}
          {values.status === "disqualified" && textField("disqualificationReason", "دلیل رد شدن", "text", "disqualificationReason")}
        </div></section>
        <section className="form-section"><h3>توضیحات و یادداشت‌ها</h3><div className="form-grid">
          <label className="wide">توضیحات<textarea value={values.description ?? ""} onChange={(event) => setField("description", event.target.value)} /></label>
          <label className="wide">یادداشت داخلی<textarea value={values.notes ?? ""} onChange={(event) => setField("notes", event.target.value)} /></label>
        </div></section>
        {error && <div className="error-state">{error}</div>}
        <div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>انصراف</button><button className="primary" disabled={saving}>{saving ? "در حال ذخیره..." : "ثبت لید"}</button></div>
      </form>
    </div>
  );
}

function LeadDetail({ id, user }: { id: string; user: AuthUser }) {
  const [lead, setLead] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [activityText, setActivityText] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [leadResult, activityResult] = await Promise.all([api<any>(`/leads/${id}`), api<ApiList<any>>(`/leads/${id}/activities`)]);
      setLead(leadResult);
      setActivities(activityResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت جزئیات لید ناموفق بود.");
    }
  }

  useEffect(() => { load(); }, [id]);

  async function addActivity() {
    if (!activityText.trim()) return;
    await api(`/leads/${id}/activities`, { method: "POST", body: JSON.stringify({ activityType: "note", title: "یادداشت پیگیری", description: activityText }) });
    setActivityText("");
    load();
  }

  async function convert() {
    if (!confirm("آیا این لید به مشتری تبدیل شود؟")) return;
    try {
      await api(`/leads/${id}/convert`, { method: "POST", body: JSON.stringify({ customerType: lead.companyName ? "company" : "individual" }) });
      alert("لید با موفقیت به مشتری تبدیل شد.");
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "تبدیل لید ناموفق بود.");
    }
  }

  if (error) return <PageHeader title="جزئیات لید" description=""><div className="error-state">{error}</div></PageHeader>;
  if (!lead) return <PageHeader title="جزئیات لید" description=""><Skeleton /></PageHeader>;

  return (
    <PageHeader title={lead.name} description="پرونده کامل لید، وضعیت فروش و تاریخچه پیگیری">
      <div className="toolbar"><button className="ghost" onClick={() => { history.pushState(null, "", "/leads"); dispatchEvent(new PopStateEvent("popstate")); }}>بازگشت</button>{has(user, "leads.convert") && lead.status !== "converted" && <button className="primary" onClick={convert}>تبدیل به مشتری</button>}</div>
      <div className="detail-layout">
        <section className="detail-card"><h3>خلاصه لید</h3><p><b>شرکت:</b> {lead.companyName ?? "—"}</p><p><b>وضعیت:</b> {format(lead.status)}</p><p><b>احتمال:</b> {Number(lead.probability ?? 0).toLocaleString("fa-IR")}٪</p><p><b>اولویت:</b> {format(lead.priority)}</p><p><b>مسئول:</b> {lead.owner?.name ?? "—"}</p></section>
        <section className="detail-card"><h3>تماس و کسب‌وکار</h3><p><b>موبایل:</b> {lead.mobile ?? lead.phone ?? "—"}</p><p><b>ایمیل:</b> {lead.email ?? "—"}</p><p><b>منبع:</b> {optionLabel(leadSources, lead.source)}</p><p><b>نوع کسب‌وکار:</b> {optionLabel(businessTypes, lead.businessType)}</p><p><b>نیاز اصلی:</b> {optionLabel(serviceNeeds, lead.mainServiceNeed)}</p></section>
        <section className="detail-card"><h3>اطلاعات هویتی</h3><p><b>نام:</b> {lead.name ?? "—"}</p><p><b>نام:</b> {lead.firstName ?? "—"}</p><p><b>نام خانوادگی:</b> {lead.lastName ?? "—"}</p><p><b>نام کامل:</b> {lead.fullName ?? "—"}</p><p><b>نام تجاری:</b> {lead.businessName ?? "—"}</p><p><b>شناسه ملی:</b> {lead.nationalId ?? "—"}</p><p><b>کد اقتصادی:</b> {lead.economicCode ?? "—"}</p></section>
        <section className="detail-card"><h3>راه‌های ارتباطی</h3><p><b>موبایل:</b> {lead.mobile ?? "—"}</p><p><b>تلفن:</b> {lead.phone ?? "—"}</p><p><b>ایمیل:</b> {lead.email ?? "—"}</p><p><b>وب‌سایت:</b> {lead.website ?? "—"}</p><p><b>آخرین تماس:</b> {persianDateTime(lead.lastContactAt)}</p><p><b>پیگیری بعدی:</b> {persianDateTime(lead.nextFollowUpAt)}</p></section>
        <section className="detail-card"><h3>نیاز لجستیکی</h3><p><b>صنعت:</b> {lead.industry ?? "—"}</p><p><b>حجم مرسوله ماهانه:</b> {format(lead.monthlyShipmentVolume)}</p><p><b>میانگین سفارش روزانه:</b> {format(lead.averageDailyOrders)}</p><p><b>سرویس‌دهنده فعلی:</b> {lead.currentCourierProvider ?? "—"}</p><p><b>مبداها:</b> {(lead.originCities ?? []).join("، ") || "—"}</p><p><b>مقصدها:</b> {(lead.destinationCities ?? []).join("، ") || "—"}</p><p><b>شروع مورد انتظار:</b> {persianDate(lead.expectedStartDate)}</p></section>
        <section className="detail-card"><h3>نیازهای ویژه</h3><p><b>نیاز API:</b> {lead.hasApiNeed ? "دارد" : "ندارد"}</p><p><b>پرداخت در محل:</b> {lead.hasCodPaymentNeed ? "دارد" : "ندارد"}</p><p><b>انبارداری:</b> {lead.hasWarehousingNeed ? "دارد" : "ندارد"}</p><p><b>لجستیک معکوس:</b> {lead.hasReverseLogisticsNeed ? "دارد" : "ندارد"}</p><p><b>چالش‌ها:</b> {lead.painPoints ?? "—"}</p></section>
        <section className="detail-card"><h3>اطلاعات فروش</h3><p><b>کمپین:</b> {lead.campaign ?? "—"}</p><p><b>امتیاز لید:</b> {format(lead.score)}</p><p><b>مرحله:</b> {lead.stage ?? "—"}</p><p><b>مسئول تخصیص:</b> {lead.assignedToId ?? "—"}</p><p><b>تبدیل شده در:</b> {persianDateTime(lead.convertedAt)}</p><p><b>شناسه مشتری تبدیل‌شده:</b> {lead.convertedCustomerId ?? "—"}</p></section>
        <section className="detail-card"><h3>دلایل و برچسب‌ها</h3><p><b>دلیل رد:</b> {lead.rejectionReason ?? "—"}</p><p><b>دلیل از دست رفتن:</b> {lead.lostReason ?? "—"}</p><p><b>دلیل فاقد شرایط:</b> {lead.disqualificationReason ?? "—"}</p><p><b>برچسب‌ها:</b> {(lead.tags ?? []).join("، ") || "—"}</p><p><b>تاریخ ایجاد:</b> {persianDateTime(lead.createdAt)}</p><p><b>آخرین بروزرسانی:</b> {persianDateTime(lead.updatedAt)}</p></section>
        <section className="detail-card wide"><h3>توضیحات و یادداشت‌ها</h3><p><b>توضیحات:</b> {lead.description ?? "—"}</p><p><b>یادداشت داخلی:</b> {lead.notes ?? "—"}</p></section>
        <section className="detail-card wide"><h3>ثبت پیگیری</h3><textarea value={activityText} onChange={(event) => setActivityText(event.target.value)} placeholder="نتیجه تماس، یادداشت یا برنامه پیگیری را وارد کنید..." /><button className="primary" onClick={addActivity}>ثبت فعالیت</button></section>
        <section className="detail-card wide"><h3>Timeline فعالیت‌ها</h3>{activities.length === 0 ? <p>هنوز فعالیتی ثبت نشده است.</p> : activities.map((item) => <article className="timeline-item" key={item.id}><strong>{item.title}</strong><span>{persianDateTime(item.activityAt ?? item.occurredAt ?? item.createdAt)} · {format(item.activityType)} · {format(item.result)}</span><p>{item.description ?? item.outcome ?? "—"}</p></article>)}</section>
      </div>
    </PageHeader>
  );
}

function AdvancedTaskPage({ user }: { user: AuthUser }) {
  const [rows, setRows] = useState<any[]>([]);
  const [metaInfo, setMetaInfo] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", type: "", overdue: false, today: false, mine: false });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(page = 1) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "25", search: filters.search });
    Object.entries(filters).forEach(([key, value]) => { if (value && key !== "search") params.set(key, String(value)); });
    try {
      const result = await api<ApiList<any>>(`/tasks?${params.toString()}`);
      setRows(result.data);
      setMetaInfo(result.meta);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت وظایف ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  async function complete(row: any) {
    const resultNote = prompt("نتیجه انجام وظیفه را وارد کنید:") ?? "";
    await api(`/tasks/${row.id}/complete`, { method: "POST", body: JSON.stringify({ resultNote }) });
    load(metaInfo.page);
  }

  async function remove(id: string) {
    if (!confirm("آیا از حذف این وظیفه مطمئن هستید؟")) return;
    await api(`/tasks/${id}`, { method: "DELETE" });
    load(metaInfo.page);
  }

  async function exportCsv() {
    const csv = await api<string>("/tasks/export");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tasks.csv";
    link.click();
  }

  return (
    <PageHeader title="وظایف" description="مدیریت اقدام‌ها، پیگیری‌ها و یادآورهای عملیاتی">
      <div className="toolbar advanced-toolbar">
        <div className="searchbox inline"><Search size={18} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="جست‌وجو در عنوان یا توضیحات..." /></div>
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">همه وضعیت‌ها</option>{taskStatuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="">همه اولویت‌ها</option>{priorityOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">همه نوع‌ها</option>{taskTypes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <button className="ghost" onClick={() => load(1)}>اعمال فیلتر</button>
        <button className="ghost" onClick={exportCsv}><Download size={16} />خروجی CSV</button>
        <button className="primary" onClick={() => setShowForm(true)}><Plus size={16} />وظیفه جدید</button>
      </div>
      <div className="filter-chips"><label><input type="checkbox" checked={filters.today} onChange={(event) => setFilters({ ...filters, today: event.target.checked })} /> امروز</label><label><input type="checkbox" checked={filters.overdue} onChange={(event) => setFilters({ ...filters, overdue: event.target.checked })} /> عقب‌افتاده</label><label><input type="checkbox" checked={filters.mine} onChange={(event) => setFilters({ ...filters, mine: event.target.checked })} /> وظایف من</label></div>
      <div className="stats-grid compact"><article><span>کل وظایف</span><strong>{metaInfo.total.toLocaleString("fa-IR")}</strong></article><article><span>باز</span><strong>{rows.filter((r) => r.status === "open").length.toLocaleString("fa-IR")}</strong></article><article><span>امروز</span><strong>{rows.filter((r) => r.dueDate && new Date(r.dueDate).toDateString() === new Date().toDateString()).length.toLocaleString("fa-IR")}</strong></article><article><span>عقب‌افتاده</span><strong>{rows.filter((r) => r.isOverdue).length.toLocaleString("fa-IR")}</strong></article><article><span>انجام‌شده</span><strong>{rows.filter((r) => r.status === "done").length.toLocaleString("fa-IR")}</strong></article></div>
      {error && <div className="error-state">{error}</div>}
      {loading ? <Skeleton /> : rows.length === 0 ? <EmptyState text="وظیفه‌ای برای نمایش وجود ندارد." action="وظیفه جدید" onAction={() => setShowForm(true)} /> : <DataTable rows={rows} columns={[["title", "عنوان"], ["type", "نوع"], ["entityType", "مرتبط با"], ["owner.name", "مسئول"], ["priority", "اولویت"], ["status", "وضعیت"], ["dueDate", "سررسید"], ["resultNote", "نتیجه"]]} renderCell={(row, key) => key === "type" ? optionLabel(taskTypes, row.type) : key === "entityType" ? optionLabel(relationTypes, row.entityType ?? "") : format(getValue(row, key))} actions={(row) => <div className="row-actions"><button className="ghost" onClick={() => setEditing(row)}>ویرایش</button>{row.status !== "done" && <button className="primary" onClick={() => complete(row)}>انجام شد</button>}<button className="danger" onClick={() => remove(row.id)}>حذف</button></div>} />}
      <Pagination meta={metaInfo} onPage={load} />
      {showForm && <TaskForm user={user} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(1); }} />}
      {editing && <TaskForm user={user} initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(metaInfo.page); }} />}
    </PageHeader>
  );
}

function TaskForm({ user, initial, onClose, onSaved }: { user: AuthUser; initial?: any; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<Record<string, any>>({ title: "", type: "general", status: "open", priority: "medium", ownerId: initial?.ownerId ?? user.id, dueDate: "", ...initial });
  const [users, setUsers] = useState<AuthUser[]>([user]);
  const [relatedRows, setRelatedRows] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { api<ApiList<AuthUser>>("/users?pageSize=100").then((r) => setUsers(r.data)).catch(() => undefined); }, []);
  useEffect(() => {
    if (!values.entityType) return setRelatedRows([]);
    const endpoint = values.entityType === "customer" ? "customers" : values.entityType === "lead" ? "leads" : values.entityType === "opportunity" ? "opportunities" : "tickets";
    api<ApiList<any>>(`/${endpoint}?pageSize=50`).then((result) => setRelatedRows(result.data)).catch(() => setRelatedRows([]));
  }, [values.entityType]);
  const required = ["title", "type", "status", "priority", "ownerId", "dueDate"];
  const invalid = (key: string) => submitted && required.includes(key) && !values[key];
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (required.some(invalid)) return setError("لطفاً فیلدهای الزامی را تکمیل کنید.");
    const { id: _id, owner: _owner, assignedBy: _assignedBy, isOverdue: _isOverdue, createdAt: _createdAt, updatedAt: _updatedAt, completedAt: _completedAt, deletedAt: _deletedAt, ...rest } = values;
    const payload = { ...rest, entityType: values.entityType || null, entityId: values.entityId || null };
    try {
      await api(initial ? `/tasks/${initial.id}` : "/tasks", { method: initial ? "PATCH" : "POST", body: JSON.stringify(payload) });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت وظیفه ناموفق بود.");
    }
  }
  const req = <span className="required-star">*</span>;
  const input = (key: string, label: string, type = "text") => <label className={invalid(key) ? "field-invalid" : ""}>{label}{required.includes(key) && req}<input type={type} value={values[key] ?? ""} onChange={(event) => setValues({ ...values, [key]: type === "number" ? Number(event.target.value) : event.target.value })} />{invalid(key) && <small>این فیلد الزامی است.</small>}</label>;
  const select = (key: string, label: string, options: string[][]) => <label className={invalid(key) ? "field-invalid" : ""}>{label}{required.includes(key) && req}<select value={values[key] ?? ""} onChange={(event) => setValues({ ...values, [key]: event.target.value })}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>{invalid(key) && <small>این فیلد الزامی است.</small>}</label>;
  return <div className="modal-backdrop"><form className="modal wide-modal" onSubmit={submit}><h2>{initial ? "ویرایش وظیفه" : "وظیفه جدید"}</h2><div className="form-grid">{input("title", "عنوان وظیفه")}{select("type", "نوع وظیفه", taskTypes)}{select("status", "وضعیت", taskStatuses)}{select("priority", "اولویت", priorityOptions)}<label className={invalid("ownerId") ? "field-invalid" : ""}>مسئول انجام{req}<select value={values.ownerId ?? ""} onChange={(event) => setValues({ ...values, ownerId: event.target.value })}>{users.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select>{invalid("ownerId") && <small>این فیلد الزامی است.</small>}</label>{input("dueDate", "تاریخ سررسید", "date")}{select("entityType", "ارتباط با", relationTypes)}<label>رکورد مرتبط<select value={values.entityId ?? ""} onChange={(event) => setValues({ ...values, entityId: event.target.value })}><option value="">انتخاب خودکار از لیست</option>{relatedRows.map((item) => <option key={item.id} value={item.id}>{item.displayName ?? item.name ?? item.title ?? item.subject ?? item.code}</option>)}</select></label><label className="wide">توضیحات<textarea value={values.description ?? ""} onChange={(event) => setValues({ ...values, description: event.target.value })} /></label><label className="wide">نتیجه انجام کار<textarea value={values.resultNote ?? ""} onChange={(event) => setValues({ ...values, resultNote: event.target.value })} /></label></div>{error && <div className="error-state">{error}</div>}<div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>انصراف</button><button className="primary">ثبت وظیفه</button></div></form></div>;
}

function AdvancedTicketPage({ user }: { user: AuthUser }) {
  const [rows, setRows] = useState<any[]>([]);
  const [metaInfo, setMetaInfo] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", type: "", team: "", slaState: "" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [error, setError] = useState("");
  async function load(page = 1) {
    const params = new URLSearchParams({ page: String(page), pageSize: "25", search: filters.search });
    Object.entries(filters).forEach(([key, value]) => { if (value && key !== "search") params.set(key, String(value)); });
    try { const result = await api<ApiList<any>>(`/tickets?${params.toString()}`); setRows(result.data); setMetaInfo(result.meta); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "دریافت تیکت‌ها ناموفق بود."); }
  }
  useEffect(() => { load(1); }, []);
  async function exportCsv() { const csv = await api<string>("/tickets/export"); const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "tickets.csv"; link.click(); }
  async function remove(id: string) { if (!confirm("آیا از حذف این تیکت مطمئن هستید؟")) return; await api(`/tickets/${id}`, { method: "DELETE" }); load(metaInfo.page); }
  async function createTask(row: any) { await api(`/tickets/${row.id}/create-task`, { method: "POST" }); alert("وظیفه از تیکت ساخته شد."); }
  return <PageHeader title="تیکت‌ها" description="مدیریت درخواست‌ها، شکایات، مشکلات و پیگیری‌های مشتریان و عملیات"><div className="toolbar advanced-toolbar"><div className="searchbox inline"><Search size={18} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="جست‌وجو در کد، موضوع یا شرح..." /></div><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">همه وضعیت‌ها</option>{ticketStatuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="">همه اولویت‌ها</option>{priorityOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">همه نوع‌ها</option>{ticketTypes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><select value={filters.team} onChange={(event) => setFilters({ ...filters, team: event.target.value })}><option value="">همه تیم‌ها</option>{ticketTeams.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><button className="ghost" onClick={() => load(1)}>اعمال فیلتر</button><button className="ghost" onClick={() => setFilters({ search: "", status: "", priority: "", type: "", team: "", slaState: "" })}>ریست</button><button className="ghost" onClick={exportCsv}><Download size={16} />خروجی CSV</button><button className="primary" onClick={() => setShowForm(true)}><Plus size={16} />تیکت جدید</button></div><div className="stats-grid compact"><article><span>کل تیکت‌ها</span><strong>{metaInfo.total.toLocaleString("fa-IR")}</strong></article><article><span>باز</span><strong>{rows.filter((r) => r.status === "open").length.toLocaleString("fa-IR")}</strong></article><article><span>در انتظار</span><strong>{rows.filter((r) => r.status === "pending").length.toLocaleString("fa-IR")}</strong></article><article><span>بحرانی</span><strong>{rows.filter((r) => r.priority === "critical").length.toLocaleString("fa-IR")}</strong></article><article><span>SLA نقض شده</span><strong>{rows.filter((r) => r.slaState === "نقض شده").length.toLocaleString("fa-IR")}</strong></article><article><span>بسته‌شده</span><strong>{rows.filter((r) => r.status === "closed").length.toLocaleString("fa-IR")}</strong></article></div>{error && <div className="error-state">{error}</div>}<DataTable rows={rows} columns={[["code", "کد"], ["subject", "موضوع"], ["customer.displayName", "مشتری"], ["lead.name", "لید"], ["type", "نوع"], ["channel", "کانال"], ["priority", "اولویت"], ["status", "وضعیت"], ["owner.name", "مسئول"], ["team", "تیم"], ["slaState", "SLA"]]} renderCell={(row, key) => key === "type" ? optionLabel(ticketTypes, row.type) : key === "channel" ? optionLabel(ticketChannels, row.channel) : key === "team" ? optionLabel(ticketTeams, row.team) : format(getValue(row, key))} actions={(row) => <div className="row-actions"><button className="ghost" onClick={() => setEditing(row)}>ویرایش</button><button className="ghost" onClick={() => createTask(row)}>ایجاد وظیفه</button><button className="danger" onClick={() => remove(row.id)}>حذف</button></div>} /><Pagination meta={metaInfo} onPage={load} />{showForm && <TicketForm user={user} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(1); }} />}{editing && <TicketForm user={user} initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(metaInfo.page); }} />}</PageHeader>;
}

function TicketForm({ user, initial, onClose, onSaved }: { user: AuthUser; initial?: any; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<Record<string, any>>({ subject: "", description: "", type: "general_request", channel: "phone", priority: "medium", status: "open", ownerId: initial?.ownerId ?? user.id, team: "support", ...initial });
  const [users, setUsers] = useState<AuthUser[]>([user]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { api<ApiList<AuthUser>>("/users?pageSize=100").then((r) => setUsers(r.data)).catch(() => undefined); }, []);
  useEffect(() => {
    api<ApiList<any>>("/customers?pageSize=100").then((r) => setCustomers(r.data)).catch(() => undefined);
    api<ApiList<any>>("/leads?pageSize=100").then((r) => setLeads(r.data)).catch(() => undefined);
  }, []);
  const required = ["subject", "description", "type", "channel", "priority", "status", "ownerId", "team"];
  const invalid = (key: string) => submitted && ((required.includes(key) && !values[key]) || (key === "relation" && !values.customerId && !values.leadId));
  async function submit(event: FormEvent) { event.preventDefault(); setSubmitted(true); if (required.some(invalid) || invalid("relation")) return setError("لطفاً فیلدهای الزامی و حداقل مشتری یا لید را تکمیل کنید."); try { const { id: _id, customer: _customer, lead: _lead, owner: _owner, slaState: _slaState, createdAt: _createdAt, updatedAt: _updatedAt, resolvedAt: _resolvedAt, closedAt: _closedAt, deletedAt: _deletedAt, ...payload } = values; await api(initial ? `/tickets/${initial.id}` : "/tickets", { method: initial ? "PATCH" : "POST", body: JSON.stringify(payload) }); onSaved(); } catch (err) { setError(err instanceof Error ? err.message : "ثبت تیکت ناموفق بود."); } }
  const req = <span className="required-star">*</span>;
  const input = (key: string, label: string, type = "text") => <label className={invalid(key) ? "field-invalid" : ""}>{label}{required.includes(key) && req}<input type={type} value={values[key] ?? ""} onChange={(event) => setValues({ ...values, [key]: event.target.value })} />{invalid(key) && <small>این فیلد الزامی است.</small>}</label>;
  const select = (key: string, label: string, options: string[][]) => <label className={invalid(key) ? "field-invalid" : ""}>{label}{required.includes(key) && req}<select value={values[key] ?? ""} onChange={(event) => setValues({ ...values, [key]: event.target.value })}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>{invalid(key) && <small>این فیلد الزامی است.</small>}</label>;
  return <div className="modal-backdrop"><form className="modal wide-modal" onSubmit={submit}><h2>{initial ? "ویرایش تیکت" : "تیکت جدید"}</h2><div className="form-grid">{input("subject", "موضوع تیکت")}<label className={invalid("relation") ? "field-invalid" : ""}>مشتری مرتبط{req}<select value={values.customerId ?? ""} onChange={(event) => setValues({ ...values, customerId: event.target.value })}><option value="">انتخاب مشتری</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.displayName ?? item.name}</option>)}</select>{invalid("relation") && <small>مشتری یا لید الزامی است.</small>}</label><label className={invalid("relation") ? "field-invalid" : ""}>لید مرتبط<select value={values.leadId ?? ""} onChange={(event) => setValues({ ...values, leadId: event.target.value })}><option value="">انتخاب لید</option>{leads.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{select("type", "نوع تیکت", ticketTypes)}{select("channel", "کانال دریافت", ticketChannels)}{select("priority", "اولویت", priorityOptions)}{select("status", "وضعیت", ticketStatuses)}<label className={invalid("ownerId") ? "field-invalid" : ""}>مسئول{req}<select value={values.ownerId ?? ""} onChange={(event) => setValues({ ...values, ownerId: event.target.value })}>{users.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>{select("team", "تیم مسئول", ticketTeams)}{input("slaDueAt", "مهلت SLA", "datetime-local")}<label className="wide field-required">شرح تیکت{req}<textarea value={values.description ?? ""} onChange={(event) => setValues({ ...values, description: event.target.value })} /></label><label className="wide">یادداشت داخلی<textarea value={values.internalNote ?? ""} onChange={(event) => setValues({ ...values, internalNote: event.target.value })} /></label></div>{error && <div className="error-state">{error}</div>}<div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>انصراف</button><button className="primary">ثبت تیکت</button></div></form></div>;
}

const opportunitySources = [["وب‌سایت", "وب‌سایت"], ["تماس ورودی", "تماس ورودی"], ["کمپین تبلیغاتی", "کمپین تبلیغاتی"], ["نمایشگاه", "نمایشگاه"], ["معرفی مشتری", "معرفی مشتری"], ["شبکه اجتماعی", "شبکه اجتماعی"], ["فروش حضوری", "فروش حضوری"], ["فروش تلفنی", "فروش تلفنی"], ["همکاری قبلی", "همکاری قبلی"], ["مشتری فعلی", "مشتری فعلی"], ["Import فایل", "Import فایل"], ["سایر", "سایر"]];
const opportunityServices = [["IN_CITY_DELIVERY", "ارسال درون‌شهری"], ["INTER_CITY_DELIVERY", "ارسال بین‌شهری"], ["EXPRESS_DELIVERY", "ارسال اکسپرس"], ["ECONOMY_DELIVERY", "ارسال اقتصادی"], ["CONTRACT_LOGISTICS", "لجستیک قراردادی"], ["WAREHOUSING", "انبارداری"], ["FULFILLMENT", "Fulfillment"], ["API_INTEGRATION", "اتصال API"], ["COD", "پرداخت در محل"], ["PACKAGING", "بسته‌بندی"], ["REVERSE_LOGISTICS", "مرجوعی"], ["DEDICATED_SLA", "SLA اختصاصی"], ["CUSTOM_ENTERPRISE", "سرویس سازمانی سفارشی"]];
const opportunityBooleanLabels: Record<string, string> = { codRequired: "پرداخت در محل", apiIntegrationRequired: "اتصال API", warehousingRequired: "انبارداری", fulfillmentRequired: "Fulfillment", insuranceRequired: "بیمه مرسوله" };

function AdvancedOpportunityPage({ user }: { user: AuthUser }) {
  const [rows, setRows] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [metaInfo, setMetaInfo] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", stageId: "", status: "", priority: "", source: "", serviceType: "", overdue: false, withoutFollowUp: false });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(page = 1) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "25", search: filters.search });
    Object.entries(filters).forEach(([key, value]) => { if (value && key !== "search") params.set(key, String(value)); });
    try {
      const [opportunities, stageRows] = await Promise.all([api<ApiList<any>>(`/opportunities?${params.toString()}`), api<{ data: any[] }>("/pipeline-stages")]);
      setRows(opportunities.data);
      setMetaInfo(opportunities.meta);
      setStages(stageRows.data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت فرصت‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(1); }, []);
  async function exportCsv() { const csv = await api<string>("/opportunities/export/csv"); const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "opportunities.csv"; link.click(); }
  async function remove(id: string) { if (!confirm("آیا از حذف نرم این فرصت مطمئن هستید؟")) return; await api(`/opportunities/${id}`, { method: "DELETE" }); load(metaInfo.page); }
  async function markWon(row: any) { await api(`/opportunities/${row.id}/mark-won`, { method: "POST" }); load(metaInfo.page); }
  async function markLost(row: any) { const lostReason = prompt("دلیل شکست فرصت را وارد کنید:"); if (!lostReason) return; await api(`/opportunities/${row.id}/mark-lost`, { method: "POST", body: JSON.stringify({ lostReason }) }); load(metaInfo.page); }
  async function createTask(row: any) { await api(`/opportunities/${row.id}/tasks`, { method: "POST", body: JSON.stringify({ title: `پیگیری فرصت ${row.title}` }) }); alert("وظیفه پیگیری ساخته شد."); }
  const openRows = rows.filter((row) => row.status === "open");
  return <PageHeader title="فرصت‌ها" description="جستجو، فیلتر، ثبت و مدیریت فرصت‌های فروش لجستیکی">
    <div className="toolbar advanced-toolbar"><div className="searchbox inline"><Search size={18} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="جستجو در عنوان، مشتری، توضیحات و شماره تماس..." /></div><select value={filters.stageId} onChange={(event) => setFilters({ ...filters, stageId: event.target.value })}><option value="">همه مراحل</option>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">همه وضعیت‌ها</option><option value="open">باز</option><option value="won">برنده</option><option value="lost">بازنده</option></select><select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="">همه اولویت‌ها</option>{priorityOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><select value={filters.serviceType} onChange={(event) => setFilters({ ...filters, serviceType: event.target.value })}><option value="">همه سرویس‌ها</option>{opportunityServices.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><button className="ghost" onClick={() => load(1)}>اعمال فیلتر</button><button className="ghost" onClick={() => setFilters({ search: "", stageId: "", status: "", priority: "", source: "", serviceType: "", overdue: false, withoutFollowUp: false })}>ریست</button><button className="ghost" onClick={exportCsv}><Download size={16} />خروجی CSV</button><button className="primary" onClick={() => setShowForm(true)}><Plus size={16} />فرصت جدید</button></div>
    <div className="filter-chips"><label><input type="checkbox" checked={filters.overdue} onChange={(event) => setFilters({ ...filters, overdue: event.target.checked })} /> نزدیک/گذشته از تاریخ بستن</label><label><input type="checkbox" checked={filters.withoutFollowUp} onChange={(event) => setFilters({ ...filters, withoutFollowUp: event.target.checked })} /> بدون پیگیری</label></div>
    <div className="stats-grid compact"><article><span>فرصت‌های باز</span><strong>{openRows.length.toLocaleString("fa-IR")}</strong></article><article><span>ارزش کل Pipeline</span><strong>{money(openRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0))}</strong></article><article><span>ارزش وزنی</span><strong>{money(openRows.reduce((sum, row) => sum + Number(row.weightedAmount ?? 0), 0))}</strong></article><article><span>برنده</span><strong>{rows.filter((row) => row.status === "won").length.toLocaleString("fa-IR")}</strong></article><article><span>بازنده</span><strong>{rows.filter((row) => row.status === "lost").length.toLocaleString("fa-IR")}</strong></article></div>
    {error && <div className="error-state">{error}</div>}
    {loading ? <Skeleton /> : rows.length === 0 ? <EmptyState text="هنوز فرصتی ثبت نشده است." action="ایجاد فرصت جدید" onAction={() => setShowForm(true)} /> : <DataTable rows={rows} columns={[["title", "عنوان"], ["customer.displayName", "مشتری"], ["amount", "مبلغ"], ["weightedAmount", "مبلغ وزنی"], ["probability", "احتمال"], ["stage.name", "مرحله"], ["status", "وضعیت"], ["priority", "اولویت"], ["owner.name", "مسئول"], ["expectedCloseDate", "تاریخ بستن"], ["nextAction", "اقدام بعدی"]]} renderCell={(row, key) => key === "amount" || key === "weightedAmount" ? money(getValue(row, key)) : key === "probability" ? `${Number(row.probability ?? 0).toLocaleString("fa-IR")}٪` : format(getValue(row, key))} actions={(row) => <div className="row-actions"><button className="ghost" onClick={() => setEditing(row)}>ویرایش</button><button className="ghost" onClick={() => createTask(row)}>وظیفه</button>{row.status !== "won" && <button className="primary" onClick={() => markWon(row)}>برنده</button>}{row.status !== "lost" && <button className="ghost" onClick={() => markLost(row)}>بازنده</button>}<button className="danger" onClick={() => remove(row.id)}>حذف</button></div>} />}
    <Pagination meta={metaInfo} onPage={load} />
    {showForm && <OpportunityForm user={user} stages={stages} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(1); }} />}
    {editing && <OpportunityForm user={user} stages={stages} initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(metaInfo.page); }} />}
  </PageHeader>;
}

function OpportunityForm({ user, stages, initial, onClose, onSaved }: { user: AuthUser; stages: any[]; initial?: any; onClose: () => void; onSaved: () => void }) {
  const firstStage = stages[0];
  const [values, setValues] = useState<Record<string, any>>({ title: "", customerId: "", amount: 0, probability: firstStage?.probability ?? 10, stageId: firstStage?.id ?? "", status: "open", priority: "medium", source: "وب‌سایت", serviceType: "IN_CITY_DELIVERY", ownerId: initial?.ownerId ?? user.id, ...initial });
  const [users, setUsers] = useState<AuthUser[]>([user]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { api<ApiList<AuthUser>>("/users?pageSize=100").then((r) => setUsers(r.data)).catch(() => undefined); }, []);
  const required = ["title", "customerId", "amount", "stageId", "status", "priority", "source", "serviceType", "ownerId", "expectedCloseDate"];
  const invalid = (key: string) => submitted && ((required.includes(key) && !values[key]) || (key === "amount" && Number(values.amount) <= 0) || (key === "lostReason" && values.status === "lost" && !values.lostReason));
  function setField(key: string, value: any) {
    if (key === "stageId") {
      const stage = stages.find((item) => item.id === value);
      setValues((current) => ({ ...current, stageId: value, probability: stage?.probability ?? current.probability, status: stage?.isWon ? "won" : stage?.isLost ? "lost" : current.status }));
    } else {
      setValues((current) => ({ ...current, [key]: value }));
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (required.some(invalid) || invalid("lostReason")) return setError("لطفاً فیلدهای الزامی مشخص‌شده را تکمیل کنید.");
    const { customer: _customer, lead: _lead, stage: _stage, owner: _owner, weightedAmount: _weightedAmount, id: _id, createdAt: _createdAt, updatedAt: _updatedAt, deletedAt: _deletedAt, originCitiesText, destinationCitiesText, ...rest } = values;
    const payload = { ...rest, originCities: String(originCitiesText ?? values.originCities ?? "").split(/[،,]/).map((item) => item.trim()).filter(Boolean), destinationCities: String(destinationCitiesText ?? values.destinationCities ?? "").split(/[،,]/).map((item) => item.trim()).filter(Boolean) };
    try { await api(initial ? `/opportunities/${initial.id}` : "/opportunities", { method: initial ? "PATCH" : "POST", body: JSON.stringify(payload) }); onSaved(); } catch (err) { setError(err instanceof Error ? err.message : "ثبت فرصت ناموفق بود."); }
  }
  const req = <span className="required-star">*</span>;
  const input = (key: string, label: string, type = "text") => <label className={invalid(key) ? "field-invalid" : ""}>{label}{required.includes(key) && req}<input type={type} value={values[key] ?? ""} onChange={(event) => setField(key, type === "number" ? Number(event.target.value) : event.target.value)} />{invalid(key) && <small>این فیلد الزامی است.</small>}</label>;
  const select = (key: string, label: string, options: string[][]) => <label className={invalid(key) ? "field-invalid" : ""}>{label}{required.includes(key) && req}<select value={values[key] ?? ""} onChange={(event) => setField(key, event.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
  return <div className="modal-backdrop"><form className="modal wide-modal" onSubmit={submit}><h2>{initial ? "ویرایش فرصت" : "فرصت جدید"}</h2><section className="form-section"><h3>اطلاعات پایه</h3><div className="form-grid">{input("title", "عنوان فرصت")} {input("customerId", "شناسه مشتری")} {input("leadId", "شناسه لید")} {input("contactPerson", "فرد تصمیم‌گیرنده")} {input("phone", "تلفن رابط")} {input("email", "ایمیل رابط", "email")} {select("source", "منبع فرصت", opportunitySources)} {select("serviceType", "نوع سرویس", opportunityServices)}</div></section><section className="form-section"><h3>اطلاعات فروش</h3><div className="form-grid">{input("amount", "مبلغ کل", "number")} {input("expectedMonthlyRevenue", "درآمد ماهانه مورد انتظار", "number")} {input("expectedShipmentCount", "تعداد ارسال مورد انتظار", "number")}<label>مبلغ وزنی<input readOnly value={money(Number(values.amount ?? 0) * Number(values.probability ?? 0) / 100)} /></label>{input("expectedCloseDate", "تاریخ بستن احتمالی", "date")}<label className={invalid("ownerId") ? "field-invalid" : ""}>مسئول فروش{req}<select value={values.ownerId ?? ""} onChange={(event) => setField("ownerId", event.target.value)}>{users.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div></section><section className="form-section"><h3>مرحله و پیگیری</h3><div className="form-grid"><label className={invalid("stageId") ? "field-invalid" : ""}>مرحله فروش{req}<select value={values.stageId ?? ""} onChange={(event) => setField("stageId", event.target.value)}>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label><label>احتمال<input readOnly type="number" value={values.probability ?? 0} /></label>{select("status", "وضعیت", [["open", "باز"], ["won", "برنده"], ["lost", "بازنده"]])}{select("priority", "اولویت", priorityOptions)}{input("nextAction", "اقدام بعدی")} {input("nextFollowUpAt", "زمان پیگیری بعدی", "datetime-local")} {values.status === "lost" && input("lostReason", "دلیل شکست")}{input("competitor", "رقیب احتمالی")}</div></section><section className="form-section"><h3>اطلاعات لجستیکی</h3><div className="form-grid">{input("originCitiesText", "شهرهای مبدأ")} {input("destinationCitiesText", "شهرهای مقصد")} {input("shipmentType", "نوع مرسوله")} {input("deliverySLA", "SLA تحویل")} {["codRequired", "apiIntegrationRequired", "warehousingRequired", "fulfillmentRequired", "insuranceRequired"].map((key) => <label className="check-item" key={key}><input type="checkbox" checked={!!values[key]} onChange={(event) => setField(key, event.target.checked)} />{opportunityBooleanLabels[key]}</label>)}<label className="wide">شرایط خاص<textarea value={values.specialHandling ?? ""} onChange={(event) => setField("specialHandling", event.target.value)} /></label><label className="wide">توضیحات<textarea value={values.description ?? ""} onChange={(event) => setField("description", event.target.value)} /></label></div></section>{error && <div className="error-state">{error}</div>}<div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>انصراف</button><button className="primary">ثبت فرصت</button></div></form></div>;
}

const customerColumns = [
  ["customerCode", "کد"],
  ["displayName", "نام نمایشی"],
  ["mobile", "موبایل"],
  ["email", "ایمیل"],
  ["status", "وضعیت"],
  ["tierLevel", "Tier"],
  ["owner.name", "مالک"],
  ["city", "شهر"],
  ["healthScore", "سلامت"],
  ["lastInteractionAt", "آخرین تعامل"]
];

function CustomerModule({ user }: { user: AuthUser }) {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const listener = () => setPath(location.pathname);
    addEventListener("popstate", listener);
    return () => removeEventListener("popstate", listener);
  }, []);
  const id = path.match(/^\/customers\/([^/]+)/)?.[1];
  return id ? <CustomerDetail id={id} user={user} /> : <CustomerList user={user} />;
}

function CustomerList({ user }: { user: AuthUser }) {
  const [rows, setRows] = useState<any[]>([]);
  const [metaInfo, setMetaInfo] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", status: "", type: "", tierLevel: "", atRisk: false, withoutOwner: false, noRecentActivity: false, sortBy: "createdAt", sortOrder: "desc" });
  const [visibleColumns, setVisibleColumns] = useState(customerColumns.map(([key]) => key));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(page = 1) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), pageSize: "25", sortBy: filters.sortBy, sortOrder: filters.sortOrder });
    Object.entries(filters).forEach(([key, value]) => {
      if (value && !["sortBy", "sortOrder"].includes(key)) params.set(key, String(value));
    });
    try {
      const result = await api<ApiList<any>>(`/customers?${params.toString()}`);
      setRows(result.data);
      setMetaInfo(result.meta);
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت مشتریان ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  function openCustomer(id: string) {
    history.pushState(null, "", `/customers/${id}`);
    dispatchEvent(new PopStateEvent("popstate"));
  }

  async function remove(id: string) {
    if (!confirm("آیا از حذف نرم این مشتری مطمئن هستید؟")) return;
    await api(`/customers/${id}`, { method: "DELETE" });
    load(metaInfo.page);
  }

  async function bulkStatus(status: string) {
    if (!selectedIds.length) return alert("ابتدا مشتریان را انتخاب کنید.");
    await api("/customers/bulk", { method: "PATCH", body: JSON.stringify({ ids: selectedIds, status }) });
    load(metaInfo.page);
  }

  async function exportCsv() {
    const params = new URLSearchParams({ search: filters.search, status: filters.status, type: filters.type, tierLevel: filters.tierLevel });
    const csv = await api<string>(`/customers/export?${params.toString()}`);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "customers.csv";
    link.click();
  }

  return (
    <PageHeader title="مشتریان" description="لیست پیشرفته مشتریان، فیلتر عملیاتی، خروجی و مدیریت گروهی">
      <div className="toolbar advanced-toolbar">
        <div className="searchbox inline"><Search size={18} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} onKeyDown={(event) => event.key === "Enter" && load(1)} placeholder="جست‌وجو بر اساس نام، شرکت، موبایل، تلفن، ایمیل یا کد مشتری..." /></div>
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">همه وضعیت‌ها</option>{["active", "inactive", "prospect", "at_risk", "lost", "blocked"].map((item) => <option key={item} value={item}>{labels[item]}</option>)}</select>
        <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">همه انواع</option><option value="individual">حقیقی</option><option value="company">حقوقی</option></select>
        <select value={filters.tierLevel} onChange={(event) => setFilters({ ...filters, tierLevel: event.target.value })}><option value="">همه Tierها</option>{["bronze", "silver", "gold", "platinum", "vip"].map((item) => <option key={item} value={item}>{labels[item]}</option>)}</select>
        <select value={filters.sortBy} onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}><option value="createdAt">تاریخ ایجاد</option><option value="displayName">نام</option><option value="lastInteractionAt">آخرین تعامل</option><option value="clv">ارزش مشتری</option><option value="healthScore">Health Score</option><option value="openDealsCount">فرصت‌های باز</option></select>
        <button className="ghost" onClick={() => load(1)}>اعمال فیلتر</button>
        {has(user, "customers.export") && <button className="ghost" onClick={exportCsv}><Download size={16} />خروجی CSV</button>}
        {has(user, "customers.create") && <button className="primary" onClick={() => setShowForm(true)}><Plus size={16} />مشتری جدید</button>}
      </div>
      <div className="filter-chips">
        <label><input type="checkbox" checked={filters.atRisk} onChange={(event) => setFilters({ ...filters, atRisk: event.target.checked })} /> مشتریان ریسک‌دار</label>
        <label><input type="checkbox" checked={filters.withoutOwner} onChange={(event) => setFilters({ ...filters, withoutOwner: event.target.checked })} /> بدون مالک</label>
        <label><input type="checkbox" checked={filters.noRecentActivity} onChange={(event) => setFilters({ ...filters, noRecentActivity: event.target.checked })} /> بدون فعالیت اخیر</label>
      </div>
      <details className="column-picker"><summary>انتخاب ستون‌ها</summary><div className="checkbox-grid">{customerColumns.map(([key, label]) => <label className="check-item" key={key}><input type="checkbox" checked={visibleColumns.includes(key)} onChange={() => setVisibleColumns((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} />{label}</label>)}</div></details>
      {selectedIds.length > 0 && <div className="bulk-bar"><span>{selectedIds.length.toLocaleString("fa-IR")} مشتری انتخاب شده</span><button className="ghost" onClick={() => bulkStatus("active")}>فعال‌سازی</button><button className="ghost" onClick={() => bulkStatus("at_risk")}>ریسک‌دار</button><button className="danger" onClick={() => bulkStatus("blocked")}>مسدودسازی</button></div>}
      {error && <div className="error-state">{error}</div>}
      {loading ? <Skeleton /> : rows.length === 0 ? <EmptyState text="هنوز هیچ مشتری مطابق فیلترها وجود ندارد." action="ایجاد مشتری" onAction={() => setShowForm(true)} /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th><input type="checkbox" checked={selectedIds.length === rows.length} onChange={(event) => setSelectedIds(event.target.checked ? rows.map((row) => row.id) : [])} /></th>{customerColumns.filter(([key]) => visibleColumns.includes(key)).map(([, label]) => <th key={label}>{label}</th>)}<th>عملیات</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id}><td><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => setSelectedIds((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])} /></td>{customerColumns.filter(([key]) => visibleColumns.includes(key)).map(([key]) => <td key={key} onClick={() => openCustomer(row.id)}>{key === "healthScore" ? <HealthBadge score={row.healthScore} /> : format(getValue(row, key))}</td>)}<td><button className="ghost" onClick={() => setEditing(row)}>ویرایش</button>{has(user, "customers.delete") && <button className="danger" onClick={() => remove(row.id)}>حذف</button>}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      <Pagination meta={metaInfo} onPage={load} />
      {showForm && <CustomerForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(1); }} />}
      {editing && <CustomerForm customer={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(metaInfo.page); }} />}
    </PageHeader>
  );
}

function HealthBadge({ score }: { score: number }) {
  const label = score >= 70 ? "سالم" : score >= 45 ? "نیازمند توجه" : "پرریسک";
  return <span className={`health-badge ${score >= 70 ? "good" : score >= 45 ? "mid" : "bad"}`}>{score?.toLocaleString("fa-IR") ?? "۰"}٪ - {label}</span>;
}

function CustomerForm({ customer, onClose, onSaved }: { customer?: any; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<any>({
    type: customer?.type ?? "individual",
    fullName: customer?.fullName ?? customer?.name ?? "",
    companyName: customer?.companyName ?? "",
    displayName: customer?.displayName ?? "",
    mobile: customer?.mobile ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    nationalId: customer?.nationalId ?? "",
    economicCode: customer?.economicCode ?? "",
    registrationNumber: customer?.registrationNumber ?? "",
    status: customer?.status ?? "prospect",
    tierLevel: customer?.tierLevel ?? "bronze",
    segment: customer?.segment ?? "",
    source: customer?.source ?? "",
    industry: customer?.industry ?? "",
    website: customer?.website ?? "",
    city: customer?.city ?? "",
    province: customer?.province ?? "",
    address: customer?.address ?? "",
    postalCode: customer?.postalCode ?? "",
    clv: customer?.clv ?? 0,
    totalRevenue: customer?.totalRevenue ?? 0,
    healthScore: customer?.healthScore ?? 50,
    churnRisk: customer?.churnRisk ?? "low",
    tagsText: (customer?.tags ?? []).join("، ")
  });
  const [error, setError] = useState("");
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const requiredFields = ["fullName", "mobile", "status", "tierLevel", "source"];

  function setField(key: string, value: any) {
    setValues((current: any) => ({ ...current, [key]: value }));
  }

  async function submit(allowDuplicate = false) {
    setSubmitted(true);
    setError("");
    const missing = requiredFields.filter((key) => !String(values[key] ?? "").trim());
    if (missing.length) {
      setError("لطفاً فیلدهای الزامی مشخص‌شده با ستاره قرمز را تکمیل کنید.");
      return;
    }
    const payload = {
      ...values,
      name: values.displayName || values.companyName || values.fullName,
      tags: String(values.tagsText || "").split(/[،,]/).map((tag) => tag.trim()).filter(Boolean),
      allowDuplicate
    };
    delete (payload as any).tagsText;
    try {
      await api(customer ? `/customers/${customer.id}` : "/customers", { method: customer ? "PATCH" : "POST", body: JSON.stringify(payload) });
      onSaved();
    } catch (err: any) {
      if (err.message?.includes("مشابه")) {
        const response = await fetch(`${API_BASE}/customers/duplicates?mobile=${encodeURIComponent(values.mobile)}&email=${encodeURIComponent(values.email)}&nationalId=${encodeURIComponent(values.nationalId)}&companyName=${encodeURIComponent(values.companyName)}`, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }, credentials: "include" });
        const result = await response.json().catch(() => ({ data: [] }));
        setDuplicates(result.duplicates ?? result.data ?? []);
      }
      setError(err instanceof Error ? err.message : "ذخیره مشتری ناموفق بود.");
    }
  }

  const isInvalid = (key: string) => submitted && requiredFields.includes(key) && !String(values[key] ?? "").trim();
  const requiredMark = (key: string) => requiredFields.includes(key) ? <span className="required-star">*</span> : null;
  const field = (key: string, label: string, type = "text") => <label className={isInvalid(key) ? "field-invalid" : ""}>{label}{requiredMark(key)}<input type={type} value={values[key] ?? ""} onChange={(event) => setField(key, type === "number" ? Number(event.target.value) : event.target.value)} /></label>;
  return (
    <div className="modal-backdrop">
      <form className="modal large" onSubmit={(event) => { event.preventDefault(); submit(false); }}>
        <h2>{customer ? "ویرایش مشتری" : "ایجاد مشتری"}</h2>
        <div className="form-section"><h3>اطلاعات پایه</h3><div className="form-grid">
          <label>نوع مشتری<span className="required-star">*</span><select value={values.type} onChange={(event) => setField("type", event.target.value)}><option value="individual">حقیقی</option><option value="company">حقوقی</option></select></label>
          {field("fullName", "نام کامل")}
          {field("companyName", "نام شرکت")}
          {field("displayName", "نام نمایشی")}
        </div></div>
        <div className="form-section"><h3>تماس و اطلاعات حقوقی</h3><div className="form-grid">
          {field("mobile", "موبایل")}
          {field("phone", "تلفن")}
          {field("email", "ایمیل", "email")}
          {field("nationalId", "کد ملی")}
          {field("economicCode", "کد اقتصادی")}
          {field("registrationNumber", "شماره ثبت")}
        </div></div>
        <div className="form-section"><h3>دسته‌بندی و وضعیت</h3><div className="form-grid">
          <label className={isInvalid("status") ? "field-invalid" : ""}>وضعیت{requiredMark("status")}<select value={values.status} onChange={(event) => setField("status", event.target.value)}>{["active", "inactive", "prospect", "at_risk", "lost", "blocked"].map((item) => <option key={item} value={item}>{labels[item]}</option>)}</select></label>
          <label className={isInvalid("tierLevel") ? "field-invalid" : ""}>Tier{requiredMark("tierLevel")}<select value={values.tierLevel} onChange={(event) => setField("tierLevel", event.target.value)}>{["bronze", "silver", "gold", "platinum", "vip"].map((item) => <option key={item} value={item}>{labels[item]}</option>)}</select></label>
          {field("segment", "سگمنت")}
          {field("source", "منبع جذب")}
          {field("industry", "صنعت")}
          {field("website", "وب‌سایت")}
        </div></div>
        <div className="form-section"><h3>آدرس و تحلیل</h3><div className="form-grid">
          {field("city", "شهر")}
          {field("province", "استان")}
          {field("postalCode", "کد پستی")}
          {field("clv", "ارزش طول عمر مشتری", "number")}
          {field("totalRevenue", "مجموع درآمد", "number")}
          {field("healthScore", "Health Score", "number")}
          <label>ریسک ریزش<select value={values.churnRisk} onChange={(event) => setField("churnRisk", event.target.value)}><option value="low">کم</option><option value="medium">متوسط</option><option value="high">زیاد</option></select></label>
          <label className="wide">آدرس<textarea value={values.address ?? ""} onChange={(event) => setField("address", event.target.value)} /></label>
          <label className="wide">Tags<input value={values.tagsText ?? ""} onChange={(event) => setField("tagsText", event.target.value)} placeholder="مثلاً: کلیدی، سازمانی" /></label>
        </div></div>
        {duplicates.length > 0 && <div className="duplicate-warning"><strong>مشتری مشابه پیدا شد</strong>{duplicates.map((item) => <button type="button" className="ghost" key={item.id} onClick={() => { history.pushState(null, "", `/customers/${item.id}`); dispatchEvent(new PopStateEvent("popstate")); onClose(); }}>{item.displayName ?? item.name} - {item.mobile ?? item.email}</button>)}<button type="button" className="primary" onClick={() => submit(true)}>با وجود تشابه ذخیره کن</button></div>}
        {error && <div className="error-state">{error}</div>}
        <div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>انصراف</button><button className="primary">ذخیره</button></div>
      </form>
    </div>
  );
}

function CustomerDetail({ id, user }: { id: string; user: AuthUser }) {
  const [summary, setSummary] = useState<any>();
  const [tab, setTab] = useState("overview");
  const [tabRows, setTabRows] = useState<any[]>([]);
  const [error, setError] = useState("");
  async function load() {
    try {
      const result = await api<any>(`/customers/${id}/summary`);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت پروفایل مشتری ناموفق بود.");
    }
  }
  async function loadTab(nextTab = tab) {
    const map: Record<string, string> = { timeline: "timeline", opportunities: "opportunities", tasks: "tasks", tickets: "tickets", audit: "audit-logs" };
    if (!map[nextTab]) return setTabRows([]);
    try {
      const result = await api<ApiList<any>>(`/customers/${id}/${map[nextTab]}`);
      setTabRows(result.data);
    } catch {
      setTabRows([]);
    }
  }
  useEffect(() => { load(); }, [id]);
  useEffect(() => { loadTab(tab); }, [tab, id]);
  if (error) return <PageHeader title="پروفایل مشتری" description=""><div className="error-state">{error}</div></PageHeader>;
  if (!summary) return <Skeleton />;
  const customer = summary.customer;
  const metrics = summary.metrics;
  return (
    <PageHeader title={customer.displayName ?? customer.name} description={`کد مشتری: ${customer.customerCode ?? "—"}`}>
      <div className="customer-hero">
        <div><h2>{customer.displayName ?? customer.name}</h2><p>{customer.companyName || labels[customer.type]} · {customer.city || "شهر نامشخص"}</p></div>
        <HealthBadge score={metrics.healthScore} />
        <span className={`badge ${customer.status}`}>{labels[customer.status]}</span>
        <span className={`badge ${metrics.churnRisk}`}>ریسک ریزش: {labels[metrics.churnRisk]}</span>
      </div>
      <div className="customer-tabs">{["overview", "contact", "timeline", "opportunities", "tasks", "tickets", ...(has(user, "customers.view_audit_logs") ? ["audit"] : [])].map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{({ overview: "نمای کلی", contact: "اطلاعات تماس", timeline: "تایم‌لاین", opportunities: "فرصت‌ها", tasks: "وظایف", tickets: "تیکت‌ها", audit: "گزارش لاگ سیستم" } as any)[item]}</button>)}</div>
      {tab === "overview" && <div className="kpi-grid customer-kpis">
        <article className="kpi-card"><span>CLV</span><strong>{money(customer.clv)}</strong><small>ارزش طول عمر</small></article>
        <article className="kpi-card"><span>درآمد کل</span><strong>{money(customer.totalRevenue)}</strong><small>ثبت‌شده در CRM</small></article>
        <article className="kpi-card"><span>فرصت‌های باز</span><strong>{metrics.openDealsCount}</strong><small>در قیف فروش</small></article>
        <article className="kpi-card"><span>تیکت‌های باز</span><strong>{metrics.openTicketsCount}</strong><small>{metrics.criticalTicketsCount} بحرانی</small></article>
      </div>}
      {tab === "contact" && <div className="panel detail-grid">{["mobile", "phone", "email", "website", "nationalId", "economicCode", "registrationNumber", "city", "province", "address"].map((key) => <div key={key}><span>{({ mobile: "موبایل", phone: "تلفن", email: "ایمیل", website: "وب‌سایت", nationalId: "کد ملی", economicCode: "کد اقتصادی", registrationNumber: "شماره ثبت", city: "شهر", province: "استان", address: "آدرس" } as any)[key]}</span><strong>{customer[key] || "—"}</strong></div>)}</div>}
      {["timeline", "opportunities", "tasks", "tickets", "audit"].includes(tab) && <DataTable rows={tabRows} columns={tabColumns(tab)} />}
    </PageHeader>
  );
}

function tabColumns(tab: string) {
  if (tab === "timeline") return [["title", "عنوان"], ["activityType", "نوع"], ["createdBy.name", "ثبت‌کننده"], ["occurredAt", "زمان"]];
  if (tab === "opportunities") return [["title", "عنوان"], ["amount", "مبلغ"], ["stage.name", "مرحله"], ["probability", "احتمال"], ["expectedCloseDate", "تاریخ بسته‌شدن"]];
  if (tab === "tasks") return [["title", "عنوان"], ["priority", "اولویت"], ["status", "وضعیت"], ["owner.name", "مالک"], ["dueDate", "سررسید"]];
  if (tab === "tickets") return [["subject", "موضوع"], ["priority", "اولویت"], ["status", "وضعیت"], ["owner.name", "مالک"], ["slaDueAt", "SLA"]];
  return [["createdAt", "زمان"], ["actor.name", "کاربر"], ["action", "عملیات"], ["entityType", "موجودیت"]];
}

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  async function load() {
    try {
      const [userRows, roleRows] = await Promise.all([api<ApiList<any>>("/users"), api<{ data: any[] }>("/roles")]);
      setUsers(userRows.data);
      setRoles(roleRows.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت کاربران ناموفق بود.");
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleStatus(user: any) {
    await api(`/users/${user.id}/${user.status === "active" ? "disable" : "enable"}`, { method: "PATCH" });
    load();
  }

  return (
    <PageHeader title="مدیریت کاربران" description="ایجاد کاربر واقعی، تخصیص نقش و فعال یا غیرفعال کردن دسترسی">
      <div className="toolbar">
        <button className="primary" onClick={() => setShowForm(true)}><Plus size={16} />ایجاد کاربر</button>
      </div>
      {error && <div className="error-state">{error}</div>}
      <DataTable
        rows={users}
        columns={[["name", "نام"], ["email", "ایمیل"], ["status", "وضعیت"], ["roles", "نقش‌ها"]]}
        renderCell={(row, key) => key === "roles" ? row.roles?.map((item: any) => item.role.name).join("، ") || "—" : undefined}
        actions={(row) => <><button className="ghost" onClick={() => setEditingUser(row)}>ویرایش نقش‌ها</button><button className="ghost" onClick={() => toggleStatus(row)}>{row.status === "active" ? "غیرفعال‌سازی" : "فعال‌سازی"}</button></>}
      />
      {showForm && <UserForm roles={roles} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {editingUser && <UserForm user={editingUser} roles={roles} onClose={() => setEditingUser(null)} onSaved={() => { setEditingUser(null); load(); }} />}
    </PageHeader>
  );
}

function Roles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try {
      const [roleRows, permissionRows] = await Promise.all([api<{ data: any[] }>("/roles"), api<{ data: any[] }>("/permissions")]);
      setRoles(roleRows.data);
      setPermissions(permissionRows.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت نقش‌ها ناموفق بود.");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <PageHeader title="نقش‌ها و دسترسی‌ها" description="ایجاد نقش سفارشی و انتخاب دقیق سطح دسترسی هر نقش">
      <div className="toolbar">
        <button className="primary" onClick={() => setShowForm(true)}><Plus size={16} />ایجاد نقش</button>
      </div>
      {error && <div className="error-state">{error}</div>}
      <div className="permission-matrix">
        <table><thead><tr><th>نقش</th><th>توضیح</th><th>دسترسی‌ها</th></tr></thead><tbody>
          {roles.map((role) => <tr key={role.id}><td>{role.name}</td><td>{role.description}</td><td>{role.permissions?.map((p: any) => p.permission.key).join("، ")}</td></tr>)}
        </tbody></table>
      </div>
      <p className="hint">تعداد دسترسی‌های تعریف‌شده: {permissions.length}</p>
      {showForm && <RoleForm permissions={permissions} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </PageHeader>
  );
}

function UserForm({ user, roles, onClose, onSaved }: { user?: any; roles: any[]; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    status: user?.status ?? "active",
    roleIds: (user?.roles ?? []).map((item: any) => item.role.id) as string[]
  });
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const payload = { ...values, ...(user && !values.password ? { password: undefined } : {}) };
      await api(user ? `/users/${user.id}` : "/users", { method: user ? "PATCH" : "POST", body: JSON.stringify(payload) });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ایجاد کاربر ناموفق بود.");
    }
  }
  function toggleRole(roleId: string) {
    setValues((current) => ({ ...current, roleIds: current.roleIds.includes(roleId) ? current.roleIds.filter((id) => id !== roleId) : [...current.roleIds, roleId] }));
  }
  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <h2>{user ? "ویرایش کاربر و نقش‌ها" : "ایجاد کاربر جدید"}</h2>
        <div className="form-grid">
          <label>نام<input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} required /></label>
          <label>ایمیل<input type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} required /></label>
          <label>رمز عبور<input type="password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} required={!user} minLength={8} placeholder={user ? "برای عدم تغییر خالی بگذارید" : ""} /></label>
          <label>وضعیت<select value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value })}><option value="active">فعال</option><option value="disabled">غیرفعال</option></select></label>
        </div>
        <section className="checkbox-panel">
          <h3>نقش‌های کاربر</h3>
          <div className="checkbox-grid">
            {roles.map((role) => <label key={role.id} className="check-item"><input type="checkbox" checked={values.roleIds.includes(role.id)} onChange={() => toggleRole(role.id)} />{role.name}</label>)}
          </div>
        </section>
        {error && <div className="error-state">{error}</div>}
        <div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>انصراف</button><button className="primary">ذخیره کاربر</button></div>
      </form>
    </div>
  );
}

function RoleForm({ permissions, onClose, onSaved }: { permissions: any[]; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState({ name: "", description: "", permissionIds: [] as string[] });
  const [error, setError] = useState("");
  const grouped = useMemo(() => permissions.reduce<Record<string, any[]>>((acc, permission) => {
    acc[permission.module] = [...(acc[permission.module] || []), permission];
    return acc;
  }, {}), [permissions]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/roles", { method: "POST", body: JSON.stringify(values) });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ایجاد نقش ناموفق بود.");
    }
  }
  function togglePermission(permissionId: string) {
    setValues((current) => ({ ...current, permissionIds: current.permissionIds.includes(permissionId) ? current.permissionIds.filter((id) => id !== permissionId) : [...current.permissionIds, permissionId] }));
  }
  return (
    <div className="modal-backdrop">
      <form className="modal large" onSubmit={submit}>
        <h2>ایجاد نقش جدید</h2>
        <div className="form-grid">
          <label>نام نقش<input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} required /></label>
          <label>توضیح<input value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} /></label>
        </div>
        <section className="checkbox-panel">
          <h3>سطح دسترسی‌ها</h3>
          {Object.entries(grouped).map(([module, modulePermissions]) => (
            <div className="permission-group" key={module}>
              <strong>{module === "system" ? "دسترسی کامل" : module}</strong>
              <div className="checkbox-grid">
                {modulePermissions.map((permission) => <label key={permission.id} className="check-item"><input type="checkbox" checked={values.permissionIds.includes(permission.id)} onChange={() => togglePermission(permission.id)} />{permission.description}</label>)}
              </div>
            </div>
          ))}
        </section>
        {error && <div className="error-state">{error}</div>}
        <div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>انصراف</button><button className="primary">ذخیره نقش</button></div>
      </form>
    </div>
  );
}

function AuditLogs() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api<ApiList<any>>("/audit-logs").then((r) => setRows(r.data)).catch((err) => setError(err.message)); }, []);
  return (
    <PageHeader title="گزارش لاگ سیستم" description="ردیابی تغییرات حساس، خروجی‌ها و عملیات مدیریتی">
      {error && <div className="error-state">{error}</div>}
      <DataTable rows={rows} columns={[["createdAt", "زمان"], ["actor.name", "کاربر"], ["action", "عملیات"], ["entityType", "موجودیت"], ["entityId", "شناسه"]]} />
    </PageHeader>
  );
}

function selectOptionText(options: string[][], value: any) {
  return options.find(([key]) => key === value)?.[1] ?? labels[value] ?? value ?? "—";
}

function AdvancedActivitiesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [metaInfo, setMetaInfo] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", type: "", status: "", priority: "", result: "", relatedType: "", hasFollowUp: false, isOverdue: false });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(page = 1) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), pageSize: "25", search: filters.search });
    Object.entries(filters).forEach(([key, value]) => { if (value && key !== "search") params.set(key, String(value)); });
    try {
      const result = await api<ApiList<any>>(`/activities?${params.toString()}`);
      setRows(result.data);
      setMetaInfo(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت فعالیت‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  async function remove(id: string) {
    if (!confirm("آیا از حذف این فعالیت مطمئن هستید؟")) return;
    await api(`/activities/${id}`, { method: "DELETE" });
    load(metaInfo.page);
  }

  async function convertToTask(row: any) {
    await api(`/activities/${row.id}/convert-to-task`, { method: "POST" });
    alert("فعالیت با موفقیت به وظیفه تبدیل شد.");
  }

  function exportCsv() {
    location.href = `${API_BASE}/activities/export?${new URLSearchParams(Object.entries(filters).filter(([, value]) => value).map(([key, value]) => [key, String(value)])).toString()}`;
  }

  return (
    <PageHeader title="فعالیت‌ها" description="Timeline عملیاتی تمام تماس‌ها، جلسات، یادداشت‌ها و پیگیری‌های CRM">
      <div className="toolbar filters-bar activity-filters">
        <input placeholder="جستجو در عنوان، توضیحات یا نام موجودیت..." value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">همه نوع‌ها</option>{activityTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">همه وضعیت‌ها</option>{activityStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="">همه اولویت‌ها</option>{activityPriorities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select value={filters.relatedType} onChange={(event) => setFilters({ ...filters, relatedType: event.target.value })}><option value="">همه موجودیت‌ها</option>{activityEntityTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <label className="inline-check"><input type="checkbox" checked={filters.hasFollowUp} onChange={(event) => setFilters({ ...filters, hasFollowUp: event.target.checked })} /> دارای پیگیری</label>
        <label className="inline-check"><input type="checkbox" checked={filters.isOverdue} onChange={(event) => setFilters({ ...filters, isOverdue: event.target.checked })} /> عقب‌افتاده</label>
        <button className="ghost" onClick={() => load(1)}>اعمال فیلتر</button>
        <button className="ghost" onClick={exportCsv}><Download size={16} /> خروجی CSV</button>
        <button className="primary" onClick={() => setShowForm(true)}><Plus size={16} /> ثبت فعالیت</button>
      </div>
      {error && <div className="error-state">{error}</div>}
      {loading ? <Skeleton /> : rows.length === 0 ? <EmptyState text="هنوز فعالیتی ثبت نشده است." action="ثبت اولین فعالیت" onAction={() => setShowForm(true)} /> : (
        <>
          <DataTable
            rows={rows}
            columns={[["title", "عنوان"], ["activityType", "نوع"], ["entityType", "موجودیت"], ["relatedName", "نام رکورد"], ["createdBy.name", "ثبت‌کننده"], ["assignedToId", "مسئول پیگیری"], ["activityAt", "تاریخ فعالیت"], ["nextFollowUpAt", "پیگیری بعدی"], ["result", "نتیجه"], ["status", "وضعیت"], ["priority", "اولویت"]]}
            renderCell={(row, key) => key === "activityAt" || key === "nextFollowUpAt" ? persianDateTime(getValue(row, key)) : undefined}
            actions={(row) => <div className="row-actions"><button className="ghost" onClick={() => setDetails(row)}>مشاهده</button><button className="ghost" onClick={() => setEditing(row)}>ویرایش</button><button className="ghost" onClick={() => convertToTask(row)}>تبدیل به وظیفه</button><button className="danger" onClick={() => remove(row.id)}>حذف</button></div>}
          />
          <Pagination meta={metaInfo} onPage={load} />
        </>
      )}
      {showForm && <ActivityForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(1); }} />}
      {editing && <ActivityForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(metaInfo.page); }} />}
      {details && <ActivityDetails activity={details} onClose={() => setDetails(null)} />}
    </PageHeader>
  );
}

function ActivityForm({ initial, onClose, onSaved }: { initial?: any; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<any>({ entityType: "lead", activityType: "call", status: "open", priority: "medium", channel: "phone", activityAt: new Date().toISOString().slice(0, 16), ...(initial ? { ...initial, activityAt: initial.activityAt?.slice(0, 16), nextFollowUpAt: initial.nextFollowUpAt?.slice(0, 16) } : {}) });
  const [users, setUsers] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const required = ["title", "activityType", "entityType", "activityAt", "status", "priority"];
  const needsRecord = values.entityType && values.entityType !== "general";

  useEffect(() => { api<ApiList<any>>("/users?pageSize=100").then((r) => setUsers(r.data)).catch(() => undefined); }, []);
  useEffect(() => {
    if (!needsRecord) { setRecords([]); return; }
    const endpoint = values.entityType === "task" ? "tasks" : `${values.entityType}s`;
    api<ApiList<any>>(`/${endpoint}?pageSize=100`).then((r) => setRecords(r.data)).catch(() => setRecords([]));
  }, [values.entityType]);

  function invalid(key: string) {
    if (!submitted) return false;
    if (required.includes(key) && !values[key]) return true;
    if (key === "entityId" && needsRecord && !values.entityId) return true;
    if (key === "nextFollowUpAt" && values.status === "needs_followup" && !values.nextFollowUpAt) return true;
    if (key === "description" && values.activityType === "meeting" && !values.description) return true;
    return false;
  }

  function label(text: string, key: string, isRequired = false) {
    return <>{text}{isRequired && <span className="required-star">*</span>}{invalid(key) && <small>این فیلد الزامی است.</small>}</>;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    if (required.some((key) => !values[key]) || (needsRecord && !values.entityId) || (values.status === "needs_followup" && !values.nextFollowUpAt) || (values.activityType === "meeting" && !values.description)) return;
    if (values.nextFollowUpAt && new Date(values.nextFollowUpAt) < new Date(values.activityAt)) {
      setError("تاریخ پیگیری بعدی نباید قبل از تاریخ فعالیت باشد.");
      return;
    }
    try {
      const payload = { ...values, entityId: needsRecord ? values.entityId : undefined };
      await api(initial ? `/activities/${initial.id}` : "/activities", { method: initial ? "PATCH" : "POST", body: JSON.stringify(payload) });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره فعالیت ناموفق بود.");
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal large" onSubmit={submit}>
        <h2>{initial ? "ویرایش فعالیت" : "ثبت فعالیت جدید"}</h2>
        <div className="form-grid">
          <label className={invalid("title") ? "field-invalid" : ""}>{label("عنوان فعالیت", "title", true)}<input value={values.title ?? ""} onChange={(event) => setValues({ ...values, title: event.target.value })} /></label>
          <label className={invalid("activityType") ? "field-invalid" : ""}>{label("نوع فعالیت", "activityType", true)}<select value={values.activityType ?? ""} onChange={(event) => setValues({ ...values, activityType: event.target.value })}>{activityTypes.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
          <label className={invalid("entityType") ? "field-invalid" : ""}>{label("موجودیت مرتبط", "entityType", true)}<select value={values.entityType ?? ""} onChange={(event) => setValues({ ...values, entityType: event.target.value, entityId: "" })}>{activityEntityTypes.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
          <label className={invalid("entityId") ? "field-invalid" : ""}>{label("رکورد مرتبط", "entityId", needsRecord)}<select disabled={!needsRecord} value={values.entityId ?? ""} onChange={(event) => setValues({ ...values, entityId: event.target.value })}><option value="">{needsRecord ? "انتخاب کنید" : "بدون رکورد"}</option>{records.map((item) => <option key={item.id} value={item.id}>{item.name ?? item.displayName ?? item.title ?? item.subject ?? item.code}</option>)}</select></label>
          <label className={invalid("activityAt") ? "field-invalid" : ""}>{label("تاریخ و زمان فعالیت", "activityAt", true)}<input type="datetime-local" value={values.activityAt ?? ""} onChange={(event) => setValues({ ...values, activityAt: event.target.value })} /><small>نمایش تاریخ‌ها در جدول و جزئیات شمسی است.</small></label>
          <label>مسئول پیگیری<select value={values.assignedToId ?? ""} onChange={(event) => setValues({ ...values, assignedToId: event.target.value || null })}><option value="">بدون مسئول</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
          <label className={invalid("status") ? "field-invalid" : ""}>{label("وضعیت", "status", true)}<select value={values.status ?? ""} onChange={(event) => setValues({ ...values, status: event.target.value })}>{activityStatuses.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
          <label className={invalid("priority") ? "field-invalid" : ""}>{label("اولویت", "priority", true)}<select value={values.priority ?? ""} onChange={(event) => setValues({ ...values, priority: event.target.value })}>{activityPriorities.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
          <label>کانال ارتباطی<select value={values.channel ?? ""} onChange={(event) => setValues({ ...values, channel: event.target.value || null })}><option value="">انتخاب کنید</option>{activityChannels.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
          <label>نتیجه فعالیت<select value={values.result ?? ""} onChange={(event) => setValues({ ...values, result: event.target.value || null })}><option value="">انتخاب کنید</option>{activityResults.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
          <label className={invalid("nextFollowUpAt") ? "field-invalid" : ""}>{label("تاریخ پیگیری بعدی", "nextFollowUpAt", values.status === "needs_followup")}<input type="datetime-local" value={values.nextFollowUpAt ?? ""} onChange={(event) => setValues({ ...values, nextFollowUpAt: event.target.value })} /></label>
          <label className={`wide ${invalid("description") ? "field-invalid" : ""}`}>{label("توضیحات", "description", values.activityType === "meeting")}<textarea value={values.description ?? ""} onChange={(event) => setValues({ ...values, description: event.target.value })} /></label>
        </div>
        {error && <div className="error-state">{error}</div>}
        <div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>انصراف</button><button className="primary">ذخیره فعالیت</button></div>
      </form>
    </div>
  );
}

function ActivityDetails({ activity, onClose }: { activity: any; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>جزئیات فعالیت</h2>
        <div className="detail-grid">
          <p><span>عنوان</span><strong>{activity.title}</strong></p>
          <p><span>نوع</span><strong>{selectOptionText(activityTypes, activity.activityType)}</strong></p>
          <p><span>موجودیت</span><strong>{format(activity.entityType)}</strong></p>
          <p><span>نام رکورد</span><strong>{activity.relatedName ?? "—"}</strong></p>
          <p><span>ثبت‌کننده</span><strong>{activity.createdBy?.name ?? "—"}</strong></p>
          <p><span>تاریخ فعالیت</span><strong>{persianDateTime(activity.activityAt)}</strong></p>
          <p><span>پیگیری بعدی</span><strong>{persianDateTime(activity.nextFollowUpAt)}</strong></p>
          <p><span>نتیجه</span><strong>{format(activity.result)}</strong></p>
          <p><span>وضعیت</span><strong>{format(activity.status)}</strong></p>
          <p><span>اولویت</span><strong>{format(activity.priority)}</strong></p>
          <p className="wide"><span>توضیحات</span><strong>{activity.description ?? "—"}</strong></p>
        </div>
        <div className="modal-actions"><button className="primary" onClick={onClose}>بستن</button></div>
      </div>
    </div>
  );
}

function Reports() {
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState({ type: "summary", from: "", to: "", ownerId: "", customerId: "", status: "", priority: "", source: "" });
  const [users, setUsers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState("salesFunnel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value).map(([key, value]) => [key, String(value)]));
    try {
      const result = await api<any>(`/reports/summary?${params.toString()}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت گزارش‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    api<ApiList<any>>("/users?pageSize=100").then((r) => setUsers(r.data)).catch(() => undefined);
    api<ApiList<any>>("/customers?pageSize=100").then((r) => setCustomers(r.data)).catch(() => undefined);
  }, []);

  function exportReport() {
    location.href = `${API_BASE}/reports/export?${new URLSearchParams(Object.entries(filters).filter(([, value]) => value).map(([key, value]) => [key, String(value)])).toString()}`;
  }

  const kpis = data?.kpis ?? {};
  const salesFunnel = data?.reports?.salesFunnel?.stages ?? [];
  const leadStatus = data?.reports?.leadConversion?.byStatus ?? [];
  const activityByType = data?.reports?.activitySummary?.byType ?? [];
  const slaStatus = data?.reports?.slaStatus?.byStatus ?? [];

  return (
    <PageHeader title="گزارش‌ها" description="گزارش‌های لید، فروش، تبدیل، فعالیت، تیکت، SLA و عملکرد کاربران">
      <div className="toolbar filters-bar report-filters">
        <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="summary">خلاصه مدیریتی</option><option value="sales_funnel">قیف فروش</option><option value="lead_conversion">تبدیل لید</option><option value="activities">فعالیت‌ها</option><option value="sla">SLA</option></select>
        <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
        <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
        <select value={filters.ownerId} onChange={(event) => setFilters({ ...filters, ownerId: event.target.value })}><option value="">همه کاربران</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select>
        <select value={filters.customerId} onChange={(event) => setFilters({ ...filters, customerId: event.target.value })}><option value="">همه مشتریان</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.displayName ?? customer.name}</option>)}</select>
        <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="">همه اولویت‌ها</option>{priorityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <button className="ghost" onClick={() => setFilters({ type: "summary", from: "", to: "", ownerId: "", customerId: "", status: "", priority: "", source: "" })}>پاک کردن فیلترها</button>
        <button className="primary" onClick={load}>اعمال گزارش</button>
        <button className="ghost" onClick={exportReport}><Download size={16} /> خروجی CSV</button>
      </div>
      {error && <div className="error-state">{error}</div>}
      {loading ? <Skeleton /> : data && <>
        <div className="kpi-grid">
          <article className="kpi-card"><span>کل لیدها</span><strong>{format(kpis.totalLeads)}</strong></article>
          <article className="kpi-card"><span>نرخ تبدیل لید</span><strong>{format(kpis.leadConversionRate)}٪</strong></article>
          <article className="kpi-card"><span>فرصت‌های باز</span><strong>{format(kpis.openOpportunities)}</strong></article>
          <article className="kpi-card"><span>ارزش قیف فروش</span><strong>{money(kpis.weightedPipeline)}</strong></article>
          <article className="kpi-card"><span>تیکت‌های باز</span><strong>{format(kpis.openTickets)}</strong></article>
          <article className="kpi-card"><span>SLA نقض‌شده</span><strong>{format(kpis.slaBreaches)}</strong></article>
          <article className="kpi-card"><span>وظایف عقب‌افتاده</span><strong>{format(kpis.overdueTasks)}</strong></article>
          <article className="kpi-card"><span>فعالیت‌های امروز</span><strong>{format(kpis.todayActivities)}</strong></article>
        </div>
        <div className="report-grid">
          {[["salesFunnel", "گزارش قیف فروش", "تعداد و ارزش فرصت‌ها در هر مرحله"], ["leadConversion", "گزارش تبدیل لید", "کیفیت لیدها و نرخ تبدیل"], ["activitySummary", "خلاصه فعالیت‌ها", "تماس‌ها، جلسات و پیگیری‌ها"], ["slaStatus", "وضعیت SLA پشتیبانی", "تیکت‌های نقض‌شده و اولویت‌ها"]].map(([key, title, desc]) => <article className={`panel report-card ${activeReport === key ? "active" : ""}`} key={key}><BarChart3 /><h3>{title}</h3><p>{desc}</p><button className="ghost" onClick={() => setActiveReport(key)}>مشاهده گزارش</button></article>)}
        </div>
        <div className="chart-grid">
          {activeReport === "salesFunnel" && <ChartCard title="قیف فروش بر اساس مرحله" data={salesFunnel.map((row: any) => ({ name: row.stage, count: row.count, amount: row.totalAmount }))} />}
          {activeReport === "leadConversion" && <ChartCard title="وضعیت لیدها" data={leadStatus.map((row: any) => ({ name: labels[row.status] ?? row.status, value: row.count }))} />}
          {activeReport === "activitySummary" && <ChartCard title="فعالیت‌ها بر اساس نوع" data={activityByType.map((row: any) => ({ name: labels[row.type] ?? row.type, value: row.count }))} />}
          {activeReport === "slaStatus" && <ChartCard title="تیکت‌ها بر اساس SLA و اولویت" data={slaStatus.map((row: any) => ({ name: `${labels[row.priority] ?? row.priority} / ${labels[row.status] ?? row.status}`, count: row.count }))} />}
        </div>
        {data.details?.length ? <section className="panel"><h3>جدول تفصیلی</h3><DataTable rows={data.details} columns={[["type", "نوع رکورد"], ["title", "عنوان"], ["customer", "مشتری"], ["owner", "مسئول"], ["status", "وضعیت"], ["priority", "اولویت"], ["amount", "مبلغ"], ["stage", "مرحله"], ["createdAt", "تاریخ ایجاد"], ["updatedAt", "آخرین بروزرسانی"]]} /></section> : <div className="empty-state"><h3>داده‌ای برای فیلترهای انتخاب‌شده وجود ندارد.</h3></div>}
      </>}
    </PageHeader>
  );
}

function SettingsPage() {
  const [stages, setStages] = useState<any[]>([]);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  async function loadStages() {
    api<{ data: any[] }>("/pipeline-stages").then((r) => setStages(r.data)).catch((err) => setError(err.message));
  }
  useEffect(() => { loadStages(); }, []);
  async function saveStage(stage: any) {
    setSavingId(stage.id);
    setError("");
    try {
      await api(`/pipeline-stages/${stage.id}`, { method: "PATCH", body: JSON.stringify({ name: stage.name, order: stage.order, probability: stage.probability, color: stage.color }) });
      await loadStages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره مرحله ناموفق بود.");
    } finally {
      setSavingId("");
    }
  }
  return (
    <PageHeader title="تنظیمات" description="تنظیمات پایه سیستم و مراحل قیف فروش">
      {error && <div className="error-state">{error}</div>}
      <div className="panel">
        <h3>مراحل قیف فروش</h3>
        <p className="muted">نام، احتمال و رنگ مراحل را فارسی و قابل استفاده در قیف فروش، فرصت‌ها و گزارش‌ها تنظیم کنید.</p>
        <div className="editable-stage-list">
          {stages.map((stage) => (
            <article className="stage-editor" key={stage.id}>
              <label>ترتیب<input type="number" value={stage.order} onChange={(event) => setStages((current) => current.map((item) => item.id === stage.id ? { ...item, order: Number(event.target.value) } : item))} /></label>
              <label>نام فارسی<input value={stage.name} onChange={(event) => setStages((current) => current.map((item) => item.id === stage.id ? { ...item, name: event.target.value } : item))} /></label>
              <label>احتمال<input type="number" min={0} max={100} value={stage.probability} onChange={(event) => setStages((current) => current.map((item) => item.id === stage.id ? { ...item, probability: Number(event.target.value) } : item))} /></label>
              <label>رنگ<input type="color" value={stage.color} onChange={(event) => setStages((current) => current.map((item) => item.id === stage.id ? { ...item, color: event.target.value } : item))} /></label>
              <button className="primary" onClick={() => saveStage(stage)} disabled={savingId === stage.id}>{savingId === stage.id ? "در حال ذخیره..." : "ذخیره"}</button>
            </article>
          ))}
        </div>
      </div>
    </PageHeader>
  );
}

function PageHeader({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <><div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div></div>{children}</>;
}

function DataTable({ rows, columns, onDelete, actions, renderCell }: { rows: Entity[]; columns: string[][]; onDelete?: (id: string) => void; actions?: (row: Entity) => React.ReactNode; renderCell?: (row: Entity, key: string) => React.ReactNode | undefined }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}<th>عملیات</th></tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row.id}>{columns.map(([key]) => <td key={key}>{renderCell?.(row, key) ?? format(getValue(row, key))}</td>)}<td>{actions?.(row)}{onDelete && <button className="danger" onClick={() => onDelete(row.id)}>حذف</button>}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ text, action, onAction }: { text: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><Upload size={32} /><h3>{text}</h3><p>برای شروع می‌توانید رکورد جدید بسازید یا داده‌ها را از مسیر Import وارد کنید.</p><button className="primary" onClick={onAction}>{action}</button></div>;
}

function Skeleton() {
  return <div className="skeleton"><span /><span /><span /><span /></div>;
}

function Pagination({ meta, onPage }: { meta: any; onPage: (page: number) => void }) {
  if (!meta.total) return null;
  return <div className="pagination"><button className="ghost" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>قبلی</button><span>صفحه {meta.page} از {meta.totalPages}</span><button className="ghost" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>بعدی</button></div>;
}

function money(value: any) {
  return Number(value ?? 0).toLocaleString("fa-IR") + " ریال";
}

function persianDate(value: any) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function persianDateTime(value: any) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function format(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  if (labels[value]) return <span className={`badge ${value}`}>{labels[value]}</span>;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return persianDate(value);
  if (value instanceof Date) return persianDate(value);
  if (typeof value === "number") return value.toLocaleString("fa-IR");
  return String(value);
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [path, setPath] = useState(location.pathname === "/" ? "/dashboard" : location.pathname);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !user) api<{ user: AuthUser }>("/auth/me").then((result) => { setUser(result.user); localStorage.setItem("user", JSON.stringify(result.user)); }).catch(() => localStorage.removeItem("accessToken"));
    const listener = () => setPath(location.pathname);
    addEventListener("popstate", listener);
    return () => removeEventListener("popstate", listener);
  }, []);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    localStorage.clear();
    setUser(null);
    history.replaceState(null, "", "/login");
  }

  if (!user || path === "/login") return <Login onLogin={(next) => { setUser(next); localStorage.setItem("user", JSON.stringify(next)); }} />;

  let page: React.ReactNode = <Dashboard />;
  if (path.startsWith("/customers")) page = <CustomerModule user={user} />;
  else if (path.startsWith("/leads")) page = <LeadModule user={user} />;
  else if (path.startsWith("/opportunities")) page = <AdvancedOpportunityPage user={user} />;
  else if (path.startsWith("/pipeline")) page = <Pipeline />;
  else if (path.startsWith("/tasks")) page = <AdvancedTaskPage user={user} />;
  else if (path.startsWith("/activities")) page = <AdvancedActivitiesPage />;
  else if (path.startsWith("/tickets")) page = <AdvancedTicketPage user={user} />;
  else if (path.startsWith("/reports")) page = <Reports />;
  else if (path.startsWith("/admin/users")) page = <AdminUsers />;
  else if (path.startsWith("/admin/roles")) page = <Roles />;
  else if (path.startsWith("/admin/settings")) page = <SettingsPage />;
  else if (path.startsWith("/audit-logs")) page = <AuditLogs />;

  return <Shell user={user} onLogout={logout}>{page}</Shell>;
}

createRoot(document.getElementById("root")!).render(<App />);
