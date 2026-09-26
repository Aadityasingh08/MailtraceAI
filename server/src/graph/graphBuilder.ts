import { ExtractedIOC } from '../intelligence/iocExtractor';
import { IPGeoResult } from '../intelligence/reputationService';

export interface GraphNode {
  id: string;
  type: 'EMAIL' | 'SENDER' | 'DOMAIN' | 'IP' | 'URL' | 'HASH' | 'ASN' | 'COUNTRY' | 'ORGANIZATION';
  label: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'SENT_FROM' | 'REPLIED_TO' | 'HOSTED_ON' | 'RESOLVES_TO' | 'CONTAINS' | 'LINKS_TO' | 'LOCATED_IN' | 'ATTACHED_TO' | 'RELATED_TO';
  label: string;
}

export interface InvestigationGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildInvestigationGraph(
  investigationId: string,
  emailSubject: string,
  fromAddress: string,
  replyTo: string,
  iocs: ExtractedIOC[],
  ipGeoMap: Record<string, IPGeoResult> = {},
  attachments: Array<{ filename: string; checksum?: string }> = []
): InvestigationGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Set<string>();

  const addNode = (node: GraphNode) => {
    if (!nodeMap.has(node.id)) {
      nodeMap.add(node.id);
      nodes.push(node);
    }
  };

  const addEdge = (source: string, target: string, type: GraphEdge['type'], label: string) => {
    const id = `edge_${source}_${type}_${target}`;
    if (!edges.some(e => e.id === id)) {
      edges.push({ id, source, target, type, label });
    }
  };

  // Root Email Node
  const emailNodeId = `email_${investigationId}`;
  addNode({
    id: emailNodeId,
    type: 'EMAIL',
    label: emailSubject.length > 28 ? emailSubject.substring(0, 28) + '...' : emailSubject,
    riskLevel: 'MEDIUM',
    metadata: { subject: emailSubject, investigationId },
  });

  // Sender Node
  const senderId = `sender_${fromAddress.toLowerCase()}`;
  addNode({
    id: senderId,
    type: 'SENDER',
    label: fromAddress,
    riskLevel: 'LOW',
    metadata: { address: fromAddress },
  });
  addEdge(emailNodeId, senderId, 'SENT_FROM', 'Sent From');

  // Sender Domain Node
  if (fromAddress.includes('@')) {
    const sDomain = fromAddress.split('@')[1].toLowerCase();
    const domainNodeId = `domain_${sDomain}`;
    addNode({
      id: domainNodeId,
      type: 'DOMAIN',
      label: sDomain,
      riskLevel: 'LOW',
      metadata: { domain: sDomain },
    });
    addEdge(senderId, domainNodeId, 'HOSTED_ON', 'Domain Hosted');
  }

  // Reply-To Node if distinct
  if (replyTo && replyTo !== fromAddress) {
    const replyToId = `replyto_${replyTo.toLowerCase()}`;
    addNode({
      id: replyToId,
      type: 'SENDER',
      label: replyTo,
      riskLevel: 'HIGH',
      metadata: { address: replyTo },
    });
    addEdge(emailNodeId, replyToId, 'REPLIED_TO', 'Replies Diverted To');

    if (replyTo.includes('@')) {
      const rDomain = replyTo.split('@')[1].toLowerCase();
      const rDomainId = `domain_${rDomain}`;
      addNode({
        id: rDomainId,
        type: 'DOMAIN',
        label: rDomain,
        riskLevel: 'HIGH',
        metadata: { domain: rDomain },
      });
      addEdge(replyToId, rDomainId, 'HOSTED_ON', 'Hosted On');
    }
  }

  // Attachments Nodes
  attachments.forEach(att => {
    const attId = `att_${att.checksum || att.filename}`;
    addNode({
      id: attId,
      type: 'HASH',
      label: att.filename,
      riskLevel: /\.(exe|scr|bat|ps1|iso|vbs)$/i.test(att.filename) ? 'CRITICAL' : 'MEDIUM',
      metadata: { filename: att.filename, checksum: att.checksum },
    });
    addEdge(emailNodeId, attId, 'ATTACHED_TO', 'Attached File');
  });

  // Process extracted IOCs
  iocs.forEach(ioc => {
    if (ioc.type === 'IPV4' || ioc.type === 'IPV6') {
      const ipNodeId = `ip_${ioc.indicator}`;
      addNode({
        id: ipNodeId,
        type: 'IP',
        label: ioc.indicator,
        riskLevel: ioc.riskLevel,
        metadata: { ip: ioc.indicator, source: ioc.source },
      });
      addEdge(emailNodeId, ipNodeId, 'RELATED_TO', 'Relayed IP');

      // IP Geo enrichment nodes
      const geo = ipGeoMap[ioc.indicator];
      if (geo && geo.country && geo.country !== 'Internal Network') {
        const countryId = `country_${geo.countryCode}`;
        addNode({
          id: countryId,
          type: 'COUNTRY',
          label: geo.country,
          riskLevel: geo.threatScore > 50 ? 'HIGH' : 'LOW',
          metadata: { country: geo.country, code: geo.countryCode },
        });
        addEdge(ipNodeId, countryId, 'LOCATED_IN', 'Geo Point');

        if (geo.asn && geo.asn !== 'AS0') {
          const asnId = `asn_${geo.asn}`;
          addNode({
            id: asnId,
            type: 'ASN',
            label: geo.asn,
            riskLevel: geo.isDatacenter ? 'MEDIUM' : 'LOW',
            metadata: { asn: geo.asn, isp: geo.isp, org: geo.org },
          });
          addEdge(ipNodeId, asnId, 'RELATED_TO', 'BGP Transit');
        }
      }
    } else if (ioc.type === 'URL') {
      const urlNodeId = `url_${ioc.indicator.substring(0, 32)}`;
      addNode({
        id: urlNodeId,
        type: 'URL',
        label: ioc.indicator.length > 32 ? ioc.indicator.substring(0, 32) + '...' : ioc.indicator,
        riskLevel: ioc.riskLevel,
        metadata: { url: ioc.indicator, risk: ioc.riskLevel },
      });
      addEdge(emailNodeId, urlNodeId, 'LINKS_TO', 'Hyperlink');

      // Extract domain from URL
      try {
        const urlHost = ioc.indicator.replace(/^[a-z]+:\/\//i, '').split('/')[0].split(':')[0].toLowerCase();
        if (urlHost && urlHost.includes('.')) {
          const uDomainId = `domain_${urlHost}`;
          addNode({
            id: uDomainId,
            type: 'DOMAIN',
            label: urlHost,
            riskLevel: ioc.riskLevel,
            metadata: { domain: urlHost },
          });
          addEdge(urlNodeId, uDomainId, 'RESOLVES_TO', 'Resolves To');
        }
      } catch {
        // continue
      }
    } else if (ioc.type === 'HASH_SHA256' || ioc.type === 'HASH_MD5') {
      const hashId = `hash_${ioc.indicator.substring(0, 16)}`;
      addNode({
        id: hashId,
        type: 'HASH',
        label: `${ioc.type}: ${ioc.indicator.substring(0, 12)}...`,
        riskLevel: ioc.riskLevel,
        metadata: { hash: ioc.indicator, type: ioc.type },
      });
      addEdge(emailNodeId, hashId, 'CONTAINS', 'Hash Signature');
    }
  });

  return { nodes, edges };
}
