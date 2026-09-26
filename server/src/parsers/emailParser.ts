import { simpleParser, ParsedMail } from 'mailparser';
import crypto from 'crypto';

export interface ParsedEmailData {
  messageId: string;
  subject: string;
  fromAddress: string;
  fromName: string;
  toAddresses: string[];
  ccAddresses: string[];
  replyTo: string;
  returnPath: string;
  date: string;
  bodyText: string;
  bodyHtmlSanitized: string;
  rawHeaders: string;
  headerMap: Record<string, string | string[] | undefined>;
  receivedHeaders: string[];
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    checksum: string;
  }>;
  rawSha256: string;
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, 'blocked-js:');
}

export async function parseEmailBuffer(buffer: Buffer | string): Promise<ParsedEmailData> {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer, 'utf-8');
  const rawSha256 = crypto.createHash('sha256').update(buf).digest('hex');

  let parsed: ParsedMail;
  try {
    parsed = await simpleParser(buf);
  } catch (err) {
    console.warn('[EmailParser] mailparser encountered error, falling back to basic MIME header extraction:', err);
    return parseRawEmailFallback(buf.toString('utf-8'), rawSha256);
  }

  // Extract from address and display name
  const fromObj = parsed.from?.value?.[0];
  const fromAddress = fromObj?.address || '';
  const fromName = fromObj?.name || '';

  // Extract To and CC
  const toAddresses: string[] = [];
  if (parsed.to) {
    const toArr = Array.isArray(parsed.to) ? parsed.to : [parsed.to];
    toArr.forEach(t => {
      t.value?.forEach(v => {
        if (v.address) toAddresses.push(v.address);
      });
    });
  }

  const ccAddresses: string[] = [];
  if (parsed.cc) {
    const ccArr = Array.isArray(parsed.cc) ? parsed.cc : [parsed.cc];
    ccArr.forEach(c => {
      c.value?.forEach(v => {
        if (v.address) ccAddresses.push(v.address);
      });
    });
  }

  // Reply-To and Return-Path
  const replyToObj = parsed.replyTo?.value?.[0];
  const replyTo = replyToObj?.address || fromAddress;

  const headerMap: Record<string, string | string[] | undefined> = {};
  const receivedHeaders: string[] = [];

  if (parsed.headers) {
    for (const [key, value] of parsed.headers) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'received') {
        if (Array.isArray(value)) {
          value.forEach(v => receivedHeaders.push(typeof v === 'string' ? v : JSON.stringify(v)));
        } else if (value) {
          receivedHeaders.push(typeof value === 'string' ? value : JSON.stringify(value));
        }
      }
      if (typeof value === 'string') {
        headerMap[lowerKey] = value;
      } else if (Array.isArray(value)) {
        headerMap[lowerKey] = value.map(v => (typeof v === 'string' ? v : JSON.stringify(v)));
      } else if (value && typeof value === 'object' && 'text' in value) {
        headerMap[lowerKey] = (value as any).text;
      } else if (value) {
        headerMap[lowerKey] = JSON.stringify(value);
      }
    }
  }

  const returnPath = String(headerMap['return-path'] || '').replace(/[<>]/g, '').trim() || fromAddress;

  // Extract Raw Headers string
  const rawHeaders = parsed.headerLines
    ? parsed.headerLines.map(line => `${line.key}: ${line.line}`).join('\n')
    : Object.entries(headerMap)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('; ') : v}`)
        .join('\n');

  // Attachments
  const attachments = (parsed.attachments || []).map(att => {
    const checksum = att.checksum || crypto.createHash('sha256').update(att.content).digest('hex');
    return {
      filename: att.filename || 'unnamed_attachment',
      contentType: att.contentType || 'application/octet-stream',
      size: att.size || att.content.length,
      checksum,
    };
  });

  return {
    messageId: parsed.messageId || `<${Date.now()}@mailtrace.local>`,
    subject: parsed.subject || '(No Subject)',
    fromAddress,
    fromName,
    toAddresses,
    ccAddresses,
    replyTo,
    returnPath,
    date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
    bodyText: parsed.text || '',
    bodyHtmlSanitized: sanitizeHtml(parsed.html || ''),
    rawHeaders,
    headerMap,
    receivedHeaders,
    attachments,
    rawSha256,
  };
}

export function parseRawEmailFallback(rawText: string, precomputedSha256?: string): ParsedEmailData {
  const rawSha256 = precomputedSha256 || crypto.createHash('sha256').update(rawText).digest('hex');
  const [headerSection, ...bodyParts] = rawText.split(/\r?\n\r?\n/);
  const bodyText = bodyParts.join('\n\n');

  const headerLines = headerSection.split(/\r?\n/);
  const headerMap: Record<string, string> = {};
  const receivedHeaders: string[] = [];

  let currentKey = '';
  for (const line of headerLines) {
    if (/^\s+[^\s]/.test(line) && currentKey) {
      headerMap[currentKey] += ' ' + line.trim();
    } else {
      const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (match) {
        currentKey = match[1].toLowerCase();
        headerMap[currentKey] = match[2].trim();
        if (currentKey === 'received') {
          receivedHeaders.push(match[2].trim());
        }
      }
    }
  }

  const fromRaw = headerMap['from'] || '';
  const fromMatch = fromRaw.match(/(?:"?([^"]*)"?\s)?(?:<)?([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})>/);
  const fromName = fromMatch ? fromMatch[1] || '' : '';
  const fromAddress = fromMatch ? fromMatch[2] : fromRaw.replace(/[<>]/g, '').trim();

  const toRaw = headerMap['to'] || '';
  const toAddresses = toRaw
    ? toRaw.split(',').map(s => s.replace(/.*<([^>]+)>.*/, '$1').trim()).filter(Boolean)
    : [];

  const replyToRaw = headerMap['reply-to'] || fromAddress;
  const replyTo = replyToRaw.replace(/.*<([^>]+)>.*/, '$1').trim();

  const returnPathRaw = headerMap['return-path'] || fromAddress;
  const returnPath = returnPathRaw.replace(/[<>]/g, '').trim();

  return {
    messageId: headerMap['message-id'] || `<${Date.now()}@mailtrace.local>`,
    subject: headerMap['subject'] || '(No Subject)',
    fromAddress,
    fromName,
    toAddresses,
    ccAddresses: [],
    replyTo,
    returnPath,
    date: headerMap['date'] || new Date().toISOString(),
    bodyText,
    bodyHtmlSanitized: sanitizeHtml(bodyText),
    rawHeaders: headerSection,
    headerMap,
    receivedHeaders,
    attachments: [],
    rawSha256,
  };
}
