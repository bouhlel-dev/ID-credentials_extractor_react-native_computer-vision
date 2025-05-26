export interface IDScanData {
  id?: number;
  name: string;
  dateOfBirth: string;
  idNumber: string;
  address: string;
  issueDate?: string;
  expiryDate?: string;
  scanDate: string;
  imageUri?: string;
}

export type ScanStatus = 'idle' | 'scanning' | 'analyzing' | 'completed' | 'error';
