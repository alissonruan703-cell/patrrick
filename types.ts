
export type ModuleId = 'oficina' | 'restaurante' | 'orcamento' | 'funil' | 'nps' | 'inspeção' | 'clients';

export interface ModuleSubscription {
  id: ModuleId;
  status: 'nao_assinado' | 'teste_ativo' | 'assinatura_ativa' | 'bloqueado';
  testeFim?: string;
  testeUsado: boolean;
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
  profileId: string;
  title: string;
  message: string;
  type: 'urgent' | 'info' | 'success' | 'warning';
  read: boolean;
  timestamp: string;
  link?: string;
  moduleId?: ModuleId;
}

export interface ServiceOrder {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  vehicle: string;
  plate: string;
  description: string;
  budgetNotes?: string;
  items: ServiceItem[];
  photos: PhotoWithObs[];
  total: number;
  status: 'Aberto' | 'Orçamento' | 'Aguardando Peças' | 'Execução' | 'Pendente Cliente' | 'Pronto' | 'Entregue' | 'Reprovado' | 'Garantia' | 'Finalizado';
  createdAt: string;
  responsibleId?: string;
}

export interface PhotoWithObs {
  url: string;
  obs?: string;
  timestamp: string;
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

// Added missing SystemConfig interface for branding and global configuration
export interface SystemConfig {
  companyName: string;
  companyLogo: string;
}

// Added missing AccountLicense interface for SaaS license management
export interface AccountLicense {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  username: string;
  password?: string;
  status: 'Ativo' | 'Bloqueado';
  createdAt: string;
  expirationDate: string;
  allowedModules: string[];
}

// Added missing HistoryEvent interface for audit logs and activity tracking
export interface HistoryEvent {
  id: string;
  timestamp: string;
  profileId: string;
  profileName: string;
  action: string;
  details: string;
  moduleId: string;
  clientId?: string;
  link?: string;
}

// Added missing Client interface for private customer database management
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string;
  createdAt: string;
  tags: string[];
  customFields: Record<string, any>;
}
