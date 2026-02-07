
export type ModuleId = 'oficina' | 'restaurante' | 'orcamento' | 'funil' | 'nps' | 'inspeção' | 'clients' | 'config';

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

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  pin: string;
  modules: string[];
  actions: string[];
}

export interface ServiceItem {
  id: string;
  type: 'PEÇA' | 'MÃO DE OBRA';
  description: string;
  quantity: number;
  price: number;
}

export interface PhotoWithObs {
  url: string;
  obs?: string;
  timestamp: string;
}

export interface ServiceOrder {
  id: string;
  clientName: string;
  phone: string;
  vehicle: string;
  plate: string;
  description: string;
  items: ServiceItem[];
  photos: PhotoWithObs[];
  total: number;
  status: 'Aberto' | 'Orçamento' | 'Execução' | 'Pronto' | 'Entregue' | 'Reprovado';
  createdAt: string;
}
