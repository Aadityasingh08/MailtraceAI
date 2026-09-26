import { isPrivateIP } from './iocExtractor';

export interface ReceivedHop {
  hopIndex: number;
  fromHost: string;
  byHost: string;
  ip: string | null;
  timestamp: string | null;
  protocol: string | null;
  delaySeconds: number;
  isSuspicious: boolean;
  suspicionReason: string | null;
  isPrivate: boolean;
}

export function parseReceivedHeaders(rawReceivedHeaders: string[]): ReceivedHop[] {
  const hops: ReceivedHop[] = [];
  if (!rawReceivedHeaders || rawReceivedHeaders.length === 0) {
    return hops;
  }

  // Reverse them so index 1 is the earliest sender hop and the last index is the final recipient gateway
  const chronological = [...rawReceivedHeaders].reverse();

  let previousTimestamp: Date | null = null;

  chronological.forEach((headerText, index) => {
    const hopIndex = index + 1;
    const cleanHeader = headerText.replace(/\r?\n\s+/g, ' ');

    // Extract "from <host>"
    const fromMatch = cleanHeader.match(/from\s+([^\s;]+)/i);
    const fromHost = fromMatch ? fromMatch[1].replace(/[()[\]]/g, '') : 'Unknown Host';

    // Extract "by <host>"
    const byMatch = cleanHeader.match(/by\s+([^\s;]+)/i);
    const byHost = byMatch ? byMatch[1].replace(/[()[\]]/g, '') : 'Unknown Host';

    // Extract IP address from [x.x.x.x] or (x.x.x.x)
    const ipMatch = cleanHeader.match(/(?:\[|\()(\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b)(?:\]|\))/);
    const ip = ipMatch ? ipMatch[1] : null;

    // Extract Protocol (with ESMTP, with ESMTPS, etc.)
    const protoMatch = cleanHeader.match(/with\s+([A-Za-z0-9_-]+)/i);
    const protocol = protoMatch ? protoMatch[1].toUpperCase() : null;

    // Extract Date string (after semicolon)
    const dateMatch = cleanHeader.match(/;\s*([A-Za-z0-9,:\s+-]+)$/);
    let hopDate: Date | null = null;
    let hopTimestampStr: string | null = null;

    if (dateMatch) {
      try {
        hopDate = new Date(dateMatch[1].trim());
        if (!isNaN(hopDate.getTime())) {
          hopTimestampStr = hopDate.toISOString();
        }
      } catch {
        hopDate = null;
      }
    }

    let delaySeconds = 0;
    if (hopDate && previousTimestamp && !isNaN(hopDate.getTime()) && !isNaN(previousTimestamp.getTime())) {
      const diffMs = hopDate.getTime() - previousTimestamp.getTime();
      delaySeconds = Math.max(0, Math.round(diffMs / 1000));
    }
    if (hopDate) {
      previousTimestamp = hopDate;
    }

    const isPrivate = ip ? isPrivateIP(ip) : false;
    let isSuspicious = false;
    let suspicionReason: string | null = null;

    // Check for suspicious hops
    if (ip && !isPrivate) {
      const lowerFrom = fromHost.toLowerCase();
      if (
        lowerFrom.includes('dynamic') ||
        lowerFrom.includes('broadband') ||
        lowerFrom.includes('dialup') ||
        lowerFrom.includes('dhcp') ||
        lowerFrom.includes('res') ||
        lowerFrom.includes('pool')
      ) {
        isSuspicious = true;
        suspicionReason = 'Residential or dynamic consumer IP attempting direct SMTP relay';
      } else if (delaySeconds > 3600) {
        isSuspicious = true;
        suspicionReason = `Abnormal transmission latency (${Math.round(delaySeconds / 60)} minutes relay delay)`;
      }
    }

    // Originating hop without TLS or encryption
    if (hopIndex === 1 && protocol && !protocol.includes('S') && !protocol.includes('TLS')) {
      if (!isSuspicious) {
        suspicionReason = 'Unencrypted transport on initial email submission hop';
      }
    }

    hops.push({
      hopIndex,
      fromHost,
      byHost,
      ip,
      timestamp: hopTimestampStr,
      protocol,
      delaySeconds,
      isSuspicious,
      suspicionReason,
      isPrivate,
    });
  });

  return hops;
}
