
import { Employee } from './types';

/**
 * 🚀 LA-Z-BOY IDEA SYSTEM - CONFIGURATION
 */

// Your direct link to the white logo on Google Drive
export const LOGO_URL = 'https://drive.google.com/uc?export=view&id=1GoMTdwYlhG3pEGAv08X8g2oU7iQu6LEJ';

// READ: Google Sheet CSV for Employees
export const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJOKqZPOrdvtrM6-ZymWciDvm-t7ol58ZiNyBFmgmy_u_mLlE_qd9XGCI7ATa64dnuwVNmEVGp3Owd/pub?output=csv';

// READ: Google Sheet CSV for Submissions (Publish the 'Submissions' tab as CSV)
// REPLACE THIS with your published Submissions CSV URL
export const SUBMISSIONS_READ_URL = ''; 

// WRITE: Google Apps Script Web App URL
// REPLACE THIS with your deployed Apps Script URL
export const SUBMISSIONS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8OuAzK7KHu-hnA3KOuHtVvaLkPRHkP9VOxX7YC0lf0gaPZsvLFGaFjulJX4KRec8T/exec'; 

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
