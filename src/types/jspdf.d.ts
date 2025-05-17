declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: {
      orientation?: 'p' | 'portrait' | 'l' | 'landscape';
      unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc';
      format?: string | number[];
    });
    text(text: string, x: number, y: number, options?: any): jsPDF;
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    setFontSize(size: number): jsPDF;
    save(filename: string): void;
    internal: {
      pageSize: {
        width: number;
        height: number;
      };
    };
  }
}

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    [key: string]: any;
  }
  interface jsPDF {
    autoTable(options: UserOptions): void;
    autoTable(theme: string | null, options: UserOptions): void;
  }
} 