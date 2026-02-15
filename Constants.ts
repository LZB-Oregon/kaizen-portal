
import { Employee } from './types';

/**
 * 🚀 LA-Z-BOY IDEA SYSTEM - CONFIGURATION
 */

// Your direct link to the white logo on Google Drive
export const LOGO_URL = 'https://drive.google.com/uc?export=view&id=1GoMTdwYlhG3pEGAv08X8g2oU7iQu6LEJ';

// READ: Google Sheet CSV for Employees (Must be Published to Web as CSV)
export const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1x4HTctUsmsfTl-_wVMCT92g2GgDxk2sJLr8YE31HU8U/pub?output=csv';

/**
 * GOOGLE SHEETS STORAGE
 * 1. Setup your Google Sheet using the Apps Script found in the Admin Setup guide.
 * 2. Update the SCRIPT_URL below.
 */
export const SUBMISSIONS_READ_URL = ''; 
export const SUBMISSIONS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx546CTd7Wbr66VN8WA3eeq910tVompR06dAIyUVqGC_-awzVNLvSgbzqN8C5I3RLwh3A/exec'; 

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
