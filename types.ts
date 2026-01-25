
export enum ModuleStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED'
}

export interface ServiceItem {
  id: string;
  type: 'PEÇA' | 'MÃO DE OBRA' | 'NOTA';
  description: string;
  brand: string; // Nova coluna
  quantity: number; // Nova coluna
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
  status: 'Aberto' | 'Orçamento' | 'Execução' | 'Pronto' | 'Entregue';
  createdAt: string;
  items: ServiceItem[];
  photos?: string[];
  total: number;
}