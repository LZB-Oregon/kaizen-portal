
import { Employee } from './types';

/**
 * 🚀 KAIZEN PORTAL DEPLOYMENT CHECKLIST
 * 
 * STEP 1: GOOGLE SHEET (The Database)
 * - Create a sheet with headers: id, name, department, location, photoUrl
 * - File > Share > Publish to Web > Choose "CSV" format.
 * - Paste that URL below in SHEET_CSV_URL.
 * 
 * STEP 2: GOOGLE DRIVE (The Photos)
 * - Upload photos to a Drive folder.
 * - Set folder sharing to "Anyone with the link can view".
 * - Paste the "Share Link" into the photoUrl column of your sheet.
 * 
 * STEP 3: GITHUB & VERCEL (The Hosting)
 * - Upload these files to a GitHub Repo.
 * - Connect Repo to Vercel.com.
 * - ADD ENVIRONMENT VARIABLE in Vercel: API_KEY = (Your Gemini Key).
 */

export const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJOKqZPOrdvtrM6-ZymWciDvm-t7ol58ZiNyBFmgmy_u_mLlE_qd9XGCI7ATa64dnuwVNmEVGp3Owd/pub?output=csv'; // <-- PASTE PUBLISHED CSV LINK HERE

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
    location: 'North Plant',
    photoUrl: 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?w=200&h=200&fit=crop' 
  }
];

export const WASTE_TYPES = [
  'Defects', 'Overproduction', 'Waiting', 'Non-Utilized Talent', 
  'Transportation', 'Inventory', 'Motion', 'Extra-Processing'
];
