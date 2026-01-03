
import React from 'react';
import { Farmer, CropLoad, QualityGrade, Sale, Market } from './types';

export const TAMIL_NADU_MARKETS: Market[] = [
  { id: 'M001', name: 'Salem (Dhadagapatti)', district: 'Salem' },
  { id: 'M002', name: 'Coimbatore (R.S. Puram)', district: 'Coimbatore' },
  { id: 'M003', name: 'Madurai (Anna Nagar)', district: 'Madurai' },
  { id: 'M004', name: 'Trichy (Gandhi Market)', district: 'Trichy' },
  { id: 'M005', name: 'Chennai (Koyambedu)', district: 'Chennai' },
  { id: 'M006', name: 'Hosur Uzhavar Sandhai', district: 'Krishnagiri' },
];

export const INITIAL_FARMERS: Farmer[] = [
  { id: 'F001', name: 'Ravi Kumar', phone: '9876543210', village: 'Soolagiri', primaryCrop: 'Tomato', marketId: 'M001' },
  { id: 'F002', name: 'Lakshmi Narayanan', phone: '9845678901', village: 'Kelamangalam', primaryCrop: 'Carrot', marketId: 'M001' },
  { id: 'F003', name: 'Muthu Swamy', phone: '9123456789', village: 'Bargur', primaryCrop: 'Beans', marketId: 'M002' },
  { id: 'F004', name: 'Anitha Selvam', phone: '9988776655', village: 'Omalur', primaryCrop: 'Onion', marketId: 'M001' },
];

export const INITIAL_LOADS: CropLoad[] = [
  { id: 'L101', farmerId: 'F001', marketId: 'M001', crop: 'Tomato', quantity: 250, grade: QualityGrade.A, date: '2023-10-24', status: 'SOLD' },
  { id: 'L102', farmerId: 'F002', marketId: 'M001', crop: 'Carrot', quantity: 150, grade: QualityGrade.B, date: '2023-10-24', status: 'PENDING' },
  { id: 'L103', farmerId: 'F004', marketId: 'M001', crop: 'Onion', quantity: 500, grade: QualityGrade.A, date: '2023-10-24', status: 'SOLD' },
];

export const INITIAL_SALES: Sale[] = [
  { id: 'S201', loadId: 'L101', farmerId: 'F001', marketId: 'M001', pricePerUnit: 35, buyerName: 'Zomato Hyperpure', totalAmount: 8750, deductions: 437.5, netAmount: 8312.5, timestamp: '2023-10-24T10:30:00Z' },
  { id: 'S202', loadId: 'L103', farmerId: 'F004', marketId: 'M001', pricePerUnit: 42, buyerName: 'BigBasket', totalAmount: 21000, deductions: 1050, netAmount: 19950, timestamp: '2023-10-24T11:15:00Z' }
];

export const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 15.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Inventory: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Sales: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Chat: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
};
