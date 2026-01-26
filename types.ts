
export enum ModuleStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED'
}

export interface SystemConfig {
  companyName: string;
  companyLogo: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  pin: string; // PIN de 4 dígitos
  modules: string[]; // ['oficina', 'orcamento', 'restaurante', 'config']
  actions: string[]; // ['create_os', 'edit_os', 'delete_os', 'manage_profiles', 'view_logs']
}

export interface AccountLicense {
  id: string;
  fullName: string;
  companyName: string;
  username: string;
  password: string;
  email: string;
  status: 'Ativo' | 'Bloqueado';
  createdAt: string;
  expirationDate: string;
  allowedModules: string[]; // Sistemas contratados pela empresa
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

export interface ServiceItem {
  id: string;
  type: 'PEÇA' | 'MÃO DE OBRA' | 'NOTA';
  description: string;
  brand: string;
  quantity: number;
  price: number;
  timestamp: string;
}

export interface ServiceOrder {
  id: string;
  clientName: string;
  phone: string;
  vehicle: string;
  plate: string;
  description: string;
  observation?: string;
  status: 'Aberto' | 'Orçamento' | 'Execução' | 'Pronto' | 'Entregue' | 'Reprovado';
  createdAt: string;
  items: ServiceItem[];
  photos?: string[];
  total: number;
}
