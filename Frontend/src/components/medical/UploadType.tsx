export type ScanPattern =
  | "ulcer"        
  | "patches"
  | "swelling"    
  | "high-risk"  
  | "normal";     

export type UploadState =
  | "idle"
  | "dragging"
  | "uploading"
  | "analyzing"
  | "complete"
  | "camera"
  | "questions"
  | "summary"
  | "error"; 

// نتيجة التحليل لكل صورة
export interface UploadResult {
  pattern: ScanPattern;   
  confidence: number;     
  date?: string;          
  notes?: string;         
}