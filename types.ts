
export type ModuleId = 'oficina' | 'restaurante' | 'orcamento' | 'funil' | 'nps' | 'inspeção' | 'clients';

export interface ModuleSubscription {
  id: ModuleId;
  status: 'nao_assinado' | 'trial_ativo' | 'assinatura_ativa' | 'bloqueado';
  trialEnd?: string;
  trialUsed: boolean;
}

export interface Profile {
  id: string;
  name: string;
  role: string;
  lastAccess: string;
  permissions: string[];
}

export interface Account {
  id: string;
  companyName: string;
  adminName: string;
  email: string;
  passwordHash: string;
  pin: string;
  subscriptions: ModuleSubscription[];
  settings: AccountSettings;
}

export interface AccountSettings {
  customClientFields: { name: string; type: string }[];
  tags: string[];
  funnelStages: string[];
  restaurantCategories: string[];
  inspectionTemplates: { id: string; name: string; items: string[] }[];
  logoUrl?: string;
}

export interface Notification {
  id: string;
  profileId: string; // Specific profile or 'admin' for global system alerts
  title: string;
  message: string;
  type: 'urgent' | 'info' | 'success' | 'warning';
  read: boolean;
  timestamp: string;
  link?: string;
  moduleId?: ModuleId;
}

export interface HistoryEvent {
  id: string;
  timestamp: string;
  profileId: string;
  profileName: string;
  moduleId: ModuleId | 'account';
  action: string;
  details: string;
  clientId?: string;
  link?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string;
  tags: string[];
  customFields: Record<string, string>;
  createdAt: string;
}

export interface SystemConfig {
  companyName: string;
  companyLogo: string;
}

export interface AccountLicense {
  id: string;
  fullName: string;
  companyName: string;
  username: string;
  password?: string;
  email: string;
  status: 'Ativo' | 'Bloqueado';
  createdAt: string;
  expirationDate: string;
  allowedModules: string[];
}

export interface ServiceOrder {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  vehicle: string;
  plate: string;
  description: string;
  items: ServiceItem[];
  photos: string[];
  total: number;
  status: 'Aberto' | 'Orçamento' | 'Execução' | 'Pronto' | 'Entregue' | 'Reprovado';
  createdAt: string;
  responsibleId?: string;
}

export interface ServiceItem {
  id: string;
  type: 'PEÇA' | 'MÃO DE OBRA';
  description: string;
  brand: string;
  quantity: number;
  price: number;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  pin: string;
  modules: string[];
  actions: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  system: string;
}
