
import { Farmer, Sale, CropLoad } from './types';

export function generateSaleSms(farmer: Farmer, sale: Sale, load: CropLoad): string {
  return `Uzhavar360: Hi ${farmer.name}, your ${load.quantity}kg of ${load.crop} (Grade ${load.grade}) has been sold for ₹${sale.pricePerUnit}/kg. Total: ₹${sale.totalAmount}. Deductions: ₹${sale.deductions}. Net Amount: ₹${sale.netAmount} will be credited shortly.`;
}

export function generateDailySummarySms(farmer: Farmer, netTotal: number): string {
  return `Uzhavar360: Daily Summary for ${farmer.name}. Total earnings today: ₹${netTotal}. Thank you for using Uzhavar360.`;
}
