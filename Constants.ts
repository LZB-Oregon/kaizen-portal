
import { Employee } from './types';

/**
 * 🚀 LA-Z-BOY IDEA SYSTEM - CONFIGURATION
 */

// Switching to Clearbit logo API which is highly reliable for production web apps
export const LOGO_URL = 'https://logo.clearbit.com/la-z-boy.com';

export const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJOKqZPOrdvtrM6-ZymWciDvm-t7ol58ZiNyBFmgmy_u_mLlE_qd9XGCI7ATa64dnuwVNmEVGp3Owd/pub?output=csv';

export const LOCATIONS = [
  "Prep and Receiving", "Main Office HQ", "Delta Park", "Tualatin",
  "Happy Valley", "Tanasbourne", "Salem", "Eugene",
  "Bend", "Medford", "Delivery","Service"
];

export const FALLBACK_EMPLOYEES: Employee[] = [
  { 
    id: 'demo1', 
    name: 'Setup Required', 
    department: 'Admin', 
    location: 'Main Office HQ',
    photoUrl: 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?w=200&h=200&fit=crop' 
  }
];

export const WASTE_TYPES = [
  'Defects', 'Overproduction', 'Waiting', 'Non-Utilized Talent', 
  'Transportation', 'Inventory', 'Motion', 'Extra-Processing'
];
