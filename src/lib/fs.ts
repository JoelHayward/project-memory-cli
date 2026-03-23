import fs from 'fs';
import path from 'path';

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function listDirs(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath).filter((f) => {
    return fs.statSync(path.join(dirPath, f)).isDirectory();
  });
}

export function touchGitkeep(dirPath: string): void {
  ensureDir(dirPath);
  writeFile(path.join(dirPath, '.gitkeep'), '');
}
