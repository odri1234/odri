// Common type definitions for the billing system

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Enhanced API Response types based on backend
export interface BackendApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  ispId?: string;
  tenantId?: string;
  phone?: string;
  profilePicture?: string;
  lastLogin?: Date;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  expiryDate?: Date;
  enableHotspot?: boolean;
  enablePPPoE?: boolean;
  require2FA?: boolean;
  autoSuspendAfterDays?: number;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  notificationEmail?: string;
  defaultBandwidthPackageId?: string;
  isp?: {
    id: string;
    name: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export enum IspStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_APPROVAL = 'pending_approval',
  TRIAL = 'trial',
}

export enum IspTier {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  PREMIUM = 'premium',
}

export interface IspMetadata {
  businessInfo?: {
    registrationNumber: string;
    taxNumber: string;
    licenseNumber: string;
    industry: string;
  };
  financialInfo?: {
    bankAccount: string;
    paymentMethods: string[];
    currency: string;
    timezone: string;
  };
  technicalInfo?: {
    defaultBandwidth: string;
    maxClients: number;
    supportedProtocols: string[];
  };
  contactInfo?: {
    supportEmail: string;
    billingEmail: string;
    technicalEmail: string;
    emergencyPhone: string;
  };
  suspensionReason?: string;
  [key: string]: any;
}

export interface ISP {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  status: IspStatus;
  isActive: boolean;
  tier: IspTier;
  registrationNumber?: string;
  taxNumber?: string;
  licenseNumber?: string;
  currency: string;
  timezone?: string;
  maxClients: number;
  currentClients: number;
  monthlyRevenue: number;
  outstandingReceivables: number;
  expiryDate?: Date;
  lastActivityAt?: Date;
  webhookUrl?: string;
  webhookSecret?: string;
  apiKey?: string;
  metadata?: IspMetadata;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  ownerId: string;
  settings?: IspSettings;
  branding?: IspBranding;
}

export interface IspSettings {
  id: string;
  ispId: string;
  enableHotspot: boolean;
  enablePPPoE: boolean;
  require2FA: boolean;
  maxConcurrentSessions: number;
  sessionTimeout: number;
  enableUsageLogging: boolean;
  autoSuspendAfterDays?: number;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  defaultPackageId?: string;
  customPortalUrl?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  currency?: string;
  timezone?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IspBranding {
  id: string;
  ispId: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  enableDarkMode: boolean;
  showLogoOnLogin: boolean;
  contactEmail: string;
  logo?: string;
  favicon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  basePrice: number;
  ispId: string;
  pricings?: PlanPricing[];
  dynamicPricings?: DynamicPricing[];
  usageMetrics?: UsageMetric[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanPricing {
  id: string;
  plan?: Plan;
  priceType: string; // e.g., 'monthly', 'yearly', 'daily'
  price: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DynamicPricing {
  id: string;
  plan?: Plan;
  factor: number;
  condition: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageMetric {
  id: string;
  plan?: Plan;
  dataUsed: number;
  timestamp: Date;
  userId: string;
}

export interface Payment {
  id: string;
  paymentReference: string;
  userId: string;
  clientId?: string;
  ispId?: string;
  amount: number;
  paymentMethod?: string;
  status: PaymentStatus;
  transactionId?: string;
  description?: string;
  refundReason?: string;
  refundDate?: Date;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  client?: Client;
  isp?: Isp;
}

export enum VoucherValidityUnit {
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  WEEKS = 'WEEKS',
}

export enum VoucherStatus {
  UNUSED = 'UNUSED',
  USED = 'USED',
}

export interface Voucher {
  id: string;
  code: string;
  amount: number;
  validityUnit: VoucherValidityUnit;
  duration: number;
  status: VoucherStatus;
  ispId?: string;
  planId?: string;
  batchId?: string;
  expiresAt?: Date;
  isRedeemed: boolean;
  redeemedByClientId?: string;
  redeemedAt?: Date;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ClientStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}

export enum ConnectionType {
  HOTSPOT = 'hotspot',
  PPPOE = 'pppoe',
  STATIC = 'static',
  DHCP = 'dhcp',
}

export interface ClientMetadata {
  package?: string;
  bandwidthLimit?: string;
  dataLimit?: string;
  priority?: number;
  customFields?: Record<string, any>;
  billingInfo?: {
    plan: string;
    amount: number;
    currency: string;
    cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  connectionInfo?: {
    connectionType: ConnectionType;
    vlan?: number;
    queueName?: string;
  };
  suspensionReason?: string;
}

export interface Client {
  id: string;
  userId: string;
  user?: User;
  ispId: string;
  isp?: ISP;
  macAddress?: string;
  ipAddress?: string;
  routerId?: string;
  profileName?: string;
  status: ClientStatus;
  isActive: boolean;
  connectionType: ConnectionType;
  bandwidthLimit?: string;
  dataLimit?: string;
  dataLimitBytes?: number;
  dataUsed: number;
  priority: number;
  vlanId?: number;
  queueName?: string;
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  expiryDate?: Date;
  nextBillingDate?: Date;
  balance: number;
  currency: string;
  billingCycle?: string;
  isOnline: boolean;
  maxSessions: number;
  currentSessions: number;
  totalSessions: number;
  lastKnownIp?: string;
  lastUserAgent?: string;
  metadata?: ClientMetadata;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
}

export interface Session {
  id: string;
  userId: string;
  planId: string;
  status: SessionStatus;
  startTime: Date;
  endTime?: Date;
  ipAddress: string;
  macAddress: string;
  deviceInfo?: string;
  bytesIn: number;
  bytesOut: number;
  location?: string;
  ispId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums - Updated to match backend exactly
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ISP_ADMIN = 'ISP_ADMIN',
  ISP_STAFF = 'ISP_STAFF',
  CLIENT = 'CLIENT',
  STAFF = 'STAFF',
  AUDITOR = 'AUDITOR',
  SUPPORT = 'SUPPORT',
  TECHNICIAN = 'TECHNICIAN',
  FINANCE = 'FINANCE'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PROCESSING = 'PROCESSING'
}

export enum PaymentMethod {
  MPESA = 'MPESA',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  VOUCHER = 'VOUCHER',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE'
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DISCONNECTED = 'DISCONNECTED',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED'
}

export enum VoucherType {
  TIME = 'time',
  DATA = 'data',
  UNLIMITED = 'unlimited'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertType {
  SYSTEM = 'system',
  NETWORK = 'network',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential'
}

export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Filter and sort interfaces
export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  ispId?: string;
  userId?: string;
  planId?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSessions: number;
  totalSessions: number;
  totalPlans: number;
  totalVouchers: number;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId?: string;
  ispId?: string;
  isRead: boolean;
  createdAt: Date;
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  tenant?: TenantInfo;
}

export interface LoginResponse {
  data: AuthResponse;
}

export interface RegisterResponse {
  data: {
    user: User;
    message: string;
  };
}

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
  tenantId?: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  tenantId: string;
}

export interface CreateUserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}

export interface CreatePlanFormData {
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  uploadSpeed?: number;
  downloadSpeed?: number;
  speedLimit?: number;
  dataLimit?: number;
  isPrepaid?: boolean;
  isActive: boolean;
}

export interface CreateISPFormData {
  name: string;
  email: string;
  phone: string;
  ownerId?: string;
  isActive: boolean;
  settings?: {
    enableHotspot: boolean;
    enablePPPoE: boolean;
    require2FA: boolean;
    maxConcurrentSessions: number;
    sessionTimeout: number;
    enableUsageLogging: boolean;
    autoSuspendAfterDays?: number;
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
  };
  branding?: {
    companyName: string;
    primaryColor: string;
    secondaryColor: string;
    contactEmail: string;
  };
}

export interface CreatePaymentFormData {
  amount: number;
  paymentMethod: PaymentMethod;
  userId: string;
  clientId?: string;
  ispId?: string;
  description?: string;
  webhookUrl?: string;
}

export interface CreateVoucherFormData {
  type: 'time' | 'data' | 'unlimited';
  value: number;
  quantity: number;
  expiresAt?: Date;
  planId?: string;
  prefix?: string;
  length?: number;
}

export interface CreateRouterFormData {
  name: string;
  ipAddress: string;
  port: number;
  username: string;
  password: string;
  description?: string;
}

export interface CreateHotspotUserFormData {
  username: string;
  password: string;
  profile: string;
  routerId: string;
  comment?: string;
  limitUptime?: string;
  limitBytesIn?: number;
  limitBytesOut?: number;
  limitBytesTotal?: number;
}

// API Error interface
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp: string;
  path: string;
  method: string;
}

// Theme and branding
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  mode: 'light' | 'dark';
}

// Tenant context
export interface TenantInfo {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  branding: ThemeConfig;
}

// MikroTik Types
export interface MikroTikRouter {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  username: string;
  status: 'online' | 'offline';
  connectedUsers: number;
  totalUsers: number;
  lastSeen?: Date;
  isActive: boolean;
  description?: string;
  ispId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HotspotUser {
  id: string;
  username: string;
  password: string;
  profile: string;
  routerId: string;
  comment?: string;
  limitUptime?: string;
  limitBytesIn?: number;
  limitBytesOut?: number;
  limitBytesTotal?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectedUser {
  id: string;
  username: string;
  ipAddress: string;
  macAddress: string;
  sessionTime: string;
  bytesIn: number;
  bytesOut: number;
  routerId: string;
  connectedAt: Date;
}

// Analytics Types
export interface RevenueSummary {
  totalRevenue: number;
  currency: string;
  transactionCount: number;
  averageRevenuePerUser: number;
  growthRate: number;
  dailyAverageRevenue: number;
  period: { startDate: string; endDate: string };
}

export interface UsageSummary {
  totalDataUsageMB: number;
  sessionCount: number;
  averageSessionDuration: number;
  peakUsageTime: string;
  averageUsagePerUserMB: number;
  period: { startDate: string; endDate: string };
}

// Monitoring Types
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  timestamp: Date;
  services: {
    database: boolean;
    redis: boolean;
    external: boolean;
  };
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'system' | 'network' | 'security' | 'performance';
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  ispId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  ispId?: string;
  metadata?: Record<string, any>;
}

// AI Types
export interface AnomalyDetection {
  id: string;
  type: 'bandwidth' | 'usage' | 'payment' | 'security';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedUsers?: string[];
  recommendations: string[];
  isResolved: boolean;
  detectedAt: Date;
  resolvedAt?: Date;
}

export interface PricingSuggestion {
  planId: string;
  currentPrice: number;
  suggestedPrice: number;
  confidence: number;
  reasoning: string;
  marketAnalysis: {
    competitorPrices: number[];
    demandLevel: 'low' | 'medium' | 'high';
    seasonalFactor: number;
  };
  generatedAt: Date;
}

// Backup Types
export interface Backup {
  id: string;
  name: string;
  description?: string;
  size: number;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  filePath?: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  description: string;
  route?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}