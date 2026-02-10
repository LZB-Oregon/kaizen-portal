
export interface Employee {
  id: string;
  name: string;
  department: string;
  location: string;
  photoUrl: string;
}

export type WasteType = 'Defects' | 'Overproduction' | 'Waiting' | 'Non-Utilized Talent' | 'Transportation' | 'Inventory' | 'Motion' | 'Extra-Processing';

export interface KaizenSubmission {
  id: string;
  location: string;
  employeeId: string;
  employeeName: string;
  employeePhoto: string;
  problem: string;
  impact: string;
  idea: string;
  wasteType?: WasteType;
  aiAnalysis?: string;
  submittedAt: string;
}

export enum AppRoute {
  SUBMIT = 'submit',
  HUDDLE_WALL = 'huddle',
  QR_GEN = 'qr'
}
