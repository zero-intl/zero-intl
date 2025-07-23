import { glob } from 'glob';
import { extname } from 'path';

export class FileScanner {
  private readonly supportedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);

  async scanFiles(patterns: string[]): Promise<string[]> {
    const allFiles = new Set<string>();

    for (const pattern of patterns) {
      try {
        const files = await glob(pattern, {
          ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**']
        });

        files.forEach(file => {
          if (this.isSupportedFile(file)) {
            allFiles.add(file);
          }
        });
      } catch (error) {
        console.warn(`Warning: Failed to scan pattern "${pattern}":`, error);
      }
    }

    return Array.from(allFiles).sort();
  }

  private isSupportedFile(filePath: string): boolean {
    const ext = extname(filePath);
    return this.supportedExtensions.has(ext);
  }
}
