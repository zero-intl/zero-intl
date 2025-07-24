export interface ExtractedMessage {
  id: string;
  defaultMessage?: string;
  description?: string;
  file: string;
}

export interface ExtractionOptions {
  pattern: string[];
  outputFile?: string;
}

export interface ExtractionResult {
  messages: ExtractedMessage[];
  totalFiles: number;
  totalMessages: number;
}
