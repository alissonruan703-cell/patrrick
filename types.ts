
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
  pin: string;
}

export interface AccountLicense {
  id: string;
  companyName: string;
  username: string;
  password: string;
  status: 'Ativo' | 'Bloqueado';
  createdAt: string;
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
