export interface DemoSampleEmail {
  id: string;
  name: string;
  category: 'BENIGN' | 'PHISHING' | 'BUSINESS EMAIL COMPROMISE';
  description: string;
  emlRaw: string;
}

export const DEMO_SAMPLE_EMAILS: DemoSampleEmail[] = [
  {
    id: 'demo-benign-meeting',
    name: 'Benign: Corporate Calendar Invitation',
    category: 'BENIGN',
    description: 'Legitimate corporate calendar notification passing cryptographic SPF/DKIM validation with no deceptive markers.',
    emlRaw: `Received: by mail-sor-f41.google.com with SMTP id b123sor456;
        Fri, 26 Sep 2025 09:15:30 -0700 (PDT)
Received: from mail-relay.google.com (mail-relay.google.com. [209.85.220.41])
        by mx.google.com with ESMTPS id c456si789
        for <analyst@soc-enterprise.com>;
        Fri, 26 Sep 2025 09:15:28 -0700 (PDT)
Received-SPF: pass (google.com: domain of 3jX_w_calendar-notification@google.com designates 209.85.220.41 as permitted sender) client-ip=209.85.220.41;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@google.com header.s=20230601 header.b=AbCdEf;
       spf=pass (google.com: domain of 3jX_w_calendar-notification@google.com designates 209.85.220.41 as permitted sender) smtp.mailfrom=3jX_w_calendar-notification@google.com;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=google.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=google.com; s=20230601; t=1727367330;
        h=to:from:subject:date:message-id:reply-to:mime-version:content-type;
        bh=8mG+5vL/KjHw6bQW=;
        b=mP2XyZ123456789==
Message-ID: <cal-inv-987654321@calendar.google.com>
Date: Fri, 26 Sep 2025 09:15:28 -0700
From: "Google Calendar" <calendar-notification@google.com>
Reply-To: "SOC Team Lead" <soc-lead@soc-enterprise.com>
To: <analyst@soc-enterprise.com>
Subject: Invitation: SOC Weekly Threat Intelligence Briefing @ Fri Oct 3, 2025 10am - 11am (EDT)
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

SOC Weekly Threat Intelligence Briefing

When: Friday Oct 3, 2025 · 10am – 11am (Eastern Time - New York)
Where: SOC Conference Room Alpha / Google Meet (https://meet.google.com/abc-defg-hij)
Organizer: soc-lead@soc-enterprise.com

Agenda:
1. Review recent triage queue metrics and high-severity incidents.
2. Discussion on active credential phishing campaigns targeting cloud services.
3. Demonstration of the MailTrace AI forensic intelligence platform.
4. Open analyst round table.

Please update your RSVP status in Google Calendar.
`
  },
  {
    id: 'demo-phishing-m365',
    name: 'Phishing: Microsoft 365 Credential Deactivation Notice',
    category: 'PHISHING',
    description: 'High-risk credential harvesting campaign leveraging display-name masquerading, lookalike domain typo-squatting, and urgent suspension threats.',
    emlRaw: `Received: from mail-gateway.defense.net (mail-gateway.defense.net [10.20.4.15])
        by soc-inbound.enterprise.local with ESMTP id m365-inbound-9921
        for <ciso@soc-enterprise.com>; Fri, 26 Sep 2025 09:30:15 -0400
Received: from mail-node-4.bulletproof.example (unknown [194.26.29.112])
        by mail-gateway.defense.net with ESMTP id rel-8874;
        Fri, 26 Sep 2025 09:30:08 -0400
Received-SPF: fail (enterprise.com: domain of security@micros0ft-security-auth.net does not designate 194.26.29.112 as permitted sender) client-ip=194.26.29.112;
Authentication-Results: mail-gateway.defense.net;
       spf=fail (sender IP 194.26.29.112 not authorized for micros0ft-security-auth.net);
       dkim=fail (no valid cryptographic signature);
       dmarc=fail (p=quarantine)
Return-Path: <bounce-daemon@micros0ft-security-auth.net>
Message-ID: <20250926093008.relay.194.26.29.112@generic-mta.local>
Date: Fri, 26 Sep 2025 09:30:08 -0400
From: "Microsoft 365 Security Team" <security@micros0ft-security-auth.net>
Reply-To: <verify-session@session-renew-micros0ft.net>
To: <ciso@soc-enterprise.com>
Subject: URGENT: Microsoft 365 Account Deactivation Notice - Action Required Within 24 Hours
User-Agent: MassMail-Script/3.4 (PHP 8.2)
X-Originating-IP: [194.26.29.112]
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

Microsoft Security Operations Center
Reference ID: MS-SEC-89102-ALERT

FINAL NOTICE: Your enterprise Microsoft 365 mailbox session and password will expire within 24 hours.

Our automated directory compliance monitors detected suspicious sign-in attempts from an unrecognized geographical location. To prevent immediate suspension and revocation of all corporate cloud access, you must authenticate and verify your account credentials immediately.

Immediate action required:
Verify your Microsoft credentials and update password:
https://login.micros0ft-security-auth.net/oauth2/authorize?token=3901a882f091bc7

Failure to confirm your session within 24 hours will result in permanent account deactivation and quarantine of pending inbound communications.

Sincerely,
Microsoft Cloud Security Operations
`
  },
  {
    id: 'demo-bec-wire-transfer',
    name: 'BEC: Executive Acquisition Wire Settlement',
    category: 'BUSINESS EMAIL COMPROMISE',
    description: 'Targeted Business Email Compromise using executive display-name impersonation, Reply-To diversion to external lookalike TLD, and urgent confidential wire transfer coercion.',
    emlRaw: `Received: from relay-hop-2.corporate-inbound.com (relay-hop-2.corporate-inbound.com [172.16.50.2])
        by mail-host.soc-enterprise.local with ESMTP id bec-inbound-7741;
        Fri, 26 Sep 2025 09:42:10 -0400
Received: from offshore-vps.network-transit.org (offshore-vps.network-transit.org [91.240.118.172])
        by relay-hop-2.corporate-inbound.com with ESMTP id hop-1102;
        Fri, 26 Sep 2025 09:41:45 -0400
Received-SPF: softfail (soc-enterprise.com: transitioning domain of ceo.executive.office@soc-enterprise.com does not designate 91.240.118.172 as permitted sender) client-ip=91.240.118.172;
Authentication-Results: relay-hop-2.corporate-inbound.com;
       spf=softfail;
       dkim=fail (body hash mismatch);
       dmarc=fail (p=none)
Return-Path: <exec-inbox@settlement-wire-acme.xyz>
Message-ID: <20250926094145.vps.91.240.118.172@offshore-vps.local>
Date: Fri, 26 Sep 2025 09:41:45 -0400
From: "Robert Sterling, Chief Executive Officer" <ceo.executive.office@soc-enterprise.com>
Reply-To: <exec-finance-board@settlement-wire-acme.xyz>
To: <controller@soc-enterprise.com>
Subject: CONFIDENTIAL: Time-Sensitive Project Titan Wire Transfer Settlement Instructions
X-Originating-IP: [91.240.118.172]
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

Hi David,

I am currently in an executive board meeting regarding our confidential acquisition of Project Titan and cannot take incoming phone calls at this moment.

Our external legal counsel and escrow agents have finalized the closing documentation. Due to an international banking compliance cutoff at 11:30 AM today, we need to process an immediate wire settlement of $485,000.00 directly to our outside escrow partner.

The revised banking details and SWIFT transfer instructions have been routed through our secure escrow channel:
https://settlement-wire-acme.xyz/escrow/transfer-instructions.pdf

Please initiate this transfer immediately upon receipt of this email and reply directly to this thread once the wire confirmation reference has been generated by the bank.

Do not discuss this transaction with anyone else on the floor as we remain under a strict SEC non-disclosure agreement until the public press release tomorrow morning.

Regards,

Robert Sterling
Chief Executive Officer
`
  }
];
