export enum Rank {
  CEL = 'Coronel',
  TEN_CEL = 'Tenente-Coronel',
  MAJ = 'Major',
  CAP = 'Capitão',
  TEN1 = '1º Tenente',
  TEN2 = '2º Tenente',
  ASP = 'Aspirante',
  SUB = 'Subtenente',
  SGT1 = '1º Sargento',
  SGT2 = '2º Sargento',
  SGT3 = '3º Sargento',
  CB = 'Cabo',
  SD = 'Soldado',
}

export enum ServiceType {
  CARNAVAL = 'Carnaval',
  REVEILLON = 'Réveillon',
  SEMANA_SANTA = 'Semana Santa',
  ELEICAO = 'Operação Eleição',
  FORTAL = 'Fortal',
  ESCALA_EXTRA = 'Escala Extra',
  OUTROS = 'Outros',
}

export enum LeaveStatus {
  AVAILABLE = 'Disponível',
  USED = 'Gozada',
  EXPIRED = 'Expirada',
}

export interface Officer {
  id: string;
  name: string;
  rank: Rank;
  matricula?: string;
  unit?: string;
  createdAt: number;
}

export interface LeaveRecord {
  id: string;
  officerId: string;
  serviceType: ServiceType;
  serviceDescription?: string; // Novo campo para o nome do serviço
  serviceDate: string; // ISO Date YYYY-MM-DD
  amount: number;
  status: LeaveStatus;
  dateUsed?: string; // ISO Date YYYY-MM-DD
  notes?: string;
}

export interface UserProfile {
  isAdmin: boolean;
  name: string;
}

export const RANKS_LIST = Object.values(Rank);
export const SERVICE_TYPES_LIST = Object.values(ServiceType);