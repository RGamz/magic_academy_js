// utils/fileReader.js — simple utility to read JSON files from filesystem
import fs from 'fs';

export async function readJSON(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}
