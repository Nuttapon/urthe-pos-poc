export interface ScanEntry {
  barcode: string;
  timestamp: Date;
}

export interface PassPRNTResult {
  success: boolean;
  code: number;
  message: string;
}
