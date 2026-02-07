
export type ModuleId = 'oficina' | 'restaurante' | 'orcamento' | 'funil' | 'nps' | 'inspeção' | 'clients' | 'config';

export interface PlanOption {
  label: 'Mensal' | 'Semestral' | 'Anual';
  price: string;
  days: number;
  link: string;
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
  expirationDate: string; 
  allowedModules: ModuleId[];
}

// Added UserProfile interface to fix import errors in Oficina.tsx, ActivityLog.tsx, and others
export interface UserProfile {
  id: string;
  name: string;
  role: string;
  actions?: string[];
  functions?: string[];
  avatar?: string;
  lastAccess?: string;
}

// Added LogEntry interface to fix import errors in auditor and history files
export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  system: string;
}

// Added PhotoWithObs interface to fix import error in Oficina.tsx
export interface PhotoWithObs {
  url: string;
  timestamp: string;
}

export interface ServiceItem {
  id: string;
  type: 'PEÇA' | 'MÃO DE OBRA';
  description: string;
  brand?: string; // Added brand as it is used in Oficina.tsx forms
  quantity: number;
  price: number;
  timestamp?: string; // Added timestamp as it is used when adding items in Oficina.tsx
}

export interface ServiceOrder {
  id: string;
  clientName: string;
  phone: string;
  vehicle: string;
  plate: string;
  description: string;
  items: ServiceItem[];
  photos: PhotoWithObs[]; // Updated to use PhotoWithObs instead of inline object
  total: number;
  status: 'Aberto' | 'Orçamento' | 'Execução' | 'Pronto' | 'Entregue' | 'Reprovado';
  createdAt: string;
  clientId?: string; // Added for client-specific filtering in Clients.tsx
}

export interface SystemConfig {
  companyName: string;
  companyLogo: string;
}

// Added Notification interface to fix import error in pages/Notifications.tsx
export interface Notification {
  id: string;
  read: boolean;
  moduleId?: string;
  timestamp: string;
  type: 'urgent' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  link?: string;
}

// Added HistoryEvent interface to fix import error in MyHistory.tsx and Clients.tsx
export interface HistoryEvent {
  id: string;
  moduleId: string;
  profileId: string;
  profileName: string;
  timestamp: string;
  action: string;
  details: string;
  link?: string;
  clientId?: string;
}

// Added Client interface to fix import error in Clients.tsx
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  createdAt: string;
  tags: string[];
  customFields: Record<string, any>;
}
