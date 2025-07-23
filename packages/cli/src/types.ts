export interface ExtractedMessage {
  id: string;
  defaultMessage?: string;
  description?: string;
  file: string;
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
}

export interface ExtractionOptions {
  pattern: string[];
  outFile?: string;
  format?: 'json' | 'csv' | 'simple-json';
  extractSourceLocation?: boolean;
  removeDefaultMessage?: boolean;
  additionalComponentNames?: string[];
}

export interface ExtractionResult {
  messages: ExtractedMessage[];
  totalFiles: number;
  totalMessages: number;
}
