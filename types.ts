
export enum ModuleStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED'
}

export interface Module {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
  icon: string;
  path: string;
}

export interface ServiceOrder {
  id: string;
  clientName: string;
  vehicle: string;
  plate: string;
  description: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  date: string;
  total: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
}
