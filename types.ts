
export type ModuleId = 'oficina' | 'restaurante' | 'orcamento' | 'funil' | 'nps' | 'inspeção' | 'clients' | 'config';

export interface ModuleSubscription {
  id: ModuleId;
  status: 'nao_assinado' | 'teste_ativo' | 'assinatura_ativa' | 'bloqueado';
  testeFim?: string;
  testeUsado: boolean;
}

export interface AccountLicense {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  username: string;
  password?: string;
  status: 'Ativo' | 'Bloqueado';
  createdAt: string;
  expirationDate: string; // ISO String
  allowedModules: ModuleId[];
  planType?: 'mensal' | 'semestral' | 'anual';
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  pin: string;
  modules: string[];
  actions: string[];
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

export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  system: string;
}

export interface SystemConfig {
  companyName: string;
  companyLogo: string;
}

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
