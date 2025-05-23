export interface TimeCode {
  time: number;
  description: string;
}

export interface CanvasElement<T = string> {
  type: T;
  content?: string;
  width?: number;
  height?: number;
  widthIn?: 'pixels' | 'percent';
  title?: string;
  variant?: 'ul' | 'ol';
  items?: string[];
} 