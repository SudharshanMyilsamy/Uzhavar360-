
export enum UserRole {
  COLLECTOR = 'COLLECTOR',
  ADMIN = 'ADMIN',
  FARMER = 'FARMER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Market {
  id: string;
  name: string;
  district: string;
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  primaryCrop: string;
  marketId: string;
}

export enum QualityGrade {
  A = 'A',
  B = 'B',
  C = 'C'
}

export interface CropLoad {
  id: string;
  farmerId: string;
  marketId: string;
  crop: string;
  quantity: number; // in kg
  grade: QualityGrade;
  date: string;
  status: 'PENDING' | 'SOLD';
}

export interface Sale {
  id: string;
  loadId: string;
  farmerId: string;
  marketId: string;
  pricePerUnit: number;
  buyerName: string;
  totalAmount: number;
  deductions: number;
  netAmount: number;
  timestamp: string;
}

export interface SmsLog {
  id: string;
  farmerName: string;
  phone: string;
  message: string;
  timestamp: string;
  status: 'DELIVERED' | 'FAILED';
}

export interface PriceTrend {
  date: string;
  crop: string;
  avgPrice: number;
}
