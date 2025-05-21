import fs from 'fs';
import path from 'path';
import db from '../models/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Heading tracker to keep the latest heading at each level
const createHeadingTracker = () => Array(10).fill(null);

const getFullHeadingContext = (headings) =>
  headings.filter(Boolean).join('\n');

export const handleUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const content = fs.readFileSync(file.path, 'utf-8');
    const lines = content.split('\n');

    const chunks = [];
    const links = [];
    const headings = createHeadingTracker();

    let tableBuffer = [];
    let insideTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Heading detection
      const headingMatch = line.match(/^(#{1,10})\s+(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        headings[level - 1] = `${headingMatch[1]} ${headingMatch[2]}`;
        // Clear deeper headings
        for (let j = level; j < 10; j++) {
          headings[j] = null;
        }
        continue;
      }

      // Table start or continuation
      if (line.startsWith('|')) {
        insideTable = true;
        tableBuffer.push(line);
        continue;
      }

      // End of table
      if (insideTable && (!line || !line.startsWith('|'))) {
        insideTable = false;

        if (tableBuffer.length >= 2) {
          const headers = tableBuffer[0].split('|').map(h => h.trim()).filter(Boolean);
          for (let j = 2; j < tableBuffer.length; j++) {
            const row = tableBuffer[j].split('|').map(c => c.trim()).filter(Boolean);
            if (row.length === headers.length) {
              const rowText = headers.map((h, k) => `${h}: ${row[k]}`).join('\n');
              const fullContext = getFullHeadingContext(headings);
              chunks.push(`${fullContext}\n${rowText}`);
            }
          }
        }

        tableBuffer = [];
      }

      // Paragraph text
      if (line && !line.startsWith('|')) {
        const fullContext = getFullHeadingContext(headings);
        chunks.push(`${fullContext}\n${line}`);

        // Detect links
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
        let match;
        while ((match = linkRegex.exec(line)) !== null) {
          links.push({
            url: match[2],
            chunkIndex: chunks.length,
          });
        }
      }
    }

    // Handle leftover table at EOF
    if (tableBuffer.length >= 2) {
      const headers = tableBuffer[0].split('|').map(h => h.trim()).filter(Boolean);
      for (let j = 2; j < tableBuffer.length; j++) {
        const row = tableBuffer[j].split('|').map(c => c.trim()).filter(Boolean);
        if (row.length === headers.length) {
          const rowText = headers.map((h, k) => `${h}: ${row[k]}`).join('\n');
          const fullContext = getFullHeadingContext(headings);
          chunks.push(`${fullContext}\n${rowText}`);
        }
      }
    }

    // Insert document
    const docResult = await db.query(
      'INSERT INTO documents(filename) VALUES($1) RETURNING id',
      [file.originalname]
    );
    const docId = docResult.rows[0].id;

    // Insert chunks
    for (let i = 0; i < chunks.length; i++) {
      await db.query(
        'INSERT INTO chunks(document_id, chunk_number, content) VALUES($1, $2, $3)',
        [docId, i + 1, chunks[i]]
      );
    }

    // Insert links
    for (const link of links) {
      await db.query(
        'INSERT INTO document_links(document_id, chunk_number, url) VALUES($1, $2, $3)',
        [docId, link.chunkIndex, link.url]
      );
    }

    res.status(200).json({ message: 'File uploaded and processed successfully', documentId: docId });
  } catch (err) {
    console.error('❌ Error in handleUpload:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
