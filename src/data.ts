import { Ticket, KnowledgeArticle } from "./types";

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "SP-4029",
    title: "Webhook payloads failing with 504 Gateway Timeout",
    customer: "Devon Ramirez",
    customerEmail: "d.ramirez@acme-core.io",
    status: "open",
    priority: "high",
    category: "API Integration",
    createdAt: "2026-07-15T09:30:00Z",
    description: "Our webhook consumer endpoint (https://api.acme-core.io/webhooks/v2) is receiving webhook payloads from your server, but we are intermittently seeing 504 Gateway Timeout errors returned in your delivery logs. We have scaled our endpoints and checked our load balancer, and it seems the delay is on the dispatch side or during handshakes. This is disrupting our user synchronization.",
    messages: [
      {
        id: "msg-1",
        sender: "customer",
        text: "Hi support, we are experiencing critical issues with our webhook receivers. Your dashboard shows 504 Gateway Timeout errors for about 35% of the outgoing payloads.",
        timestamp: "2026-07-15T09:30:00Z"
      },
      {
        id: "msg-2",
        sender: "agent",
        text: "Hello Devon! I'm sorry to hear your webhooks are timing out. Let me check our webhook dispatch queues. Could you confirm if your server has an active rate limiter that might be delaying the acknowledgments?",
        timestamp: "2026-07-15T10:05:00Z"
      },
      {
        id: "msg-3",
        sender: "customer",
        text: "We checked our rate limiter and increased the concurrency limit to 500 requests per second. The timeouts are still occurring. It looks like the connections are being established but then hanging for exactly 10 seconds before terminating with a 504. Do you have a maximum connection timeout on your outbound webhooks?",
        timestamp: "2026-07-15T10:45:00Z"
      }
    ]
  },
  {
    id: "SP-3914",
    title: "Duplicate billing charges on Annual Enterprise Subscription",
    customer: "Helena Vance",
    customerEmail: "finance@vance-media.com",
    status: "pending",
    priority: "urgent",
    category: "Billing",
    createdAt: "2026-07-14T14:15:00Z",
    description: "We recently renewed our annual Enterprise subscription (Invoice #INV-2026-889) for $12,000. However, our corporate credit card was charged twice on July 14th. We see two identical pending transactions of $12,000 on our statement. Please reverse the duplicate charge immediately as this is affecting our weekly budget allocations.",
    messages: [
      {
        id: "msg-201",
        sender: "customer",
        text: "Our card has been double-charged for our renewal. We see two transactions of $12,000 each. This is urgent. Please process a refund for the duplicate transaction.",
        timestamp: "2026-07-14T14:15:00Z"
      },
      {
        id: "msg-202",
        sender: "agent",
        text: "Hello Helena, thank you for reaching out. I completely understand how urgent this is. I am looking up invoice #INV-2026-889 in our Stripe billing portal. I do see a duplicate transaction token that might have triggered twice due to a payment gateway retry. I am escalating this to our finance supervisors to initiate the reversal.",
        timestamp: "2026-07-14T15:02:00Z"
      },
      {
        id: "msg-203",
        sender: "customer",
        text: "Thank you for the quick initial response. Please keep me updated on the transaction reversal status. We need the refund receipt to clear this with our accounting auditor.",
        timestamp: "2026-07-14T16:20:00Z"
      }
    ]
  },
  {
    id: "SP-3801",
    title: "SAML SSO login loop on Azure AD integration",
    customer: "Marcus Vance",
    customerEmail: "marcus@vance-media.com",
    status: "open",
    priority: "medium",
    category: "Account Security",
    createdAt: "2026-07-13T08:00:00Z",
    description: "Our team members are stuck in an infinite redirect loop when trying to log in via SAML SSO using Azure AD (Entra ID). They successfully authenticate on Microsoft's portal, are redirected to our portal's login callback url, but instead of logging them in, the app redirects them back to Microsoft's login screen. This started happening after the certificate rotation yesterday.",
    messages: [
      {
        id: "msg-301",
        sender: "customer",
        text: "No one can log in through Azure AD today. The login screen loops indefinitely.",
        timestamp: "2026-07-13T08:00:00Z"
      },
      {
        id: "msg-302",
        sender: "agent",
        text: "Hi Marcus, sorry for the disruption. Since you mentioned certificate rotation yesterday, let's verify if the new public certificate XML has been uploaded to your SupportPilot workspace dashboard, and that the SHA-256 fingerprint matches Microsoft's output.",
        timestamp: "2026-07-13T08:45:00Z"
      }
    ]
  },
  {
    id: "SP-3500",
    title: "Request for higher rate limits on search endpoints",
    customer: "Yuki Tanaka",
    customerEmail: "y.tanaka@hyper-tech.jp",
    status: "resolved",
    priority: "low",
    category: "General Product",
    createdAt: "2026-07-10T11:20:00Z",
    description: "We are currently building an AI-powered search filter on top of your standard catalog search API. The default rate limit of 60 requests per minute is causing HTTP 429 errors during our peak load tests. We would like to request an increase to 300 requests per minute for our production API key.",
    messages: [
      {
        id: "msg-401",
        sender: "customer",
        text: "We are hitting rate limits on the search endpoint. Can we get our limit bumped to 300 RPM for key ending in ...8f2c?",
        timestamp: "2026-07-10T11:20:00Z"
      },
      {
        id: "msg-402",
        sender: "agent",
        text: "Hello Yuki! I've reviewed your account utilization. Since you are on our Pro tier, we can certainly accommodate this request. I have updated your production key's rate limit to 300 requests per minute. Could you please run a test and let us know if you still see any 429s?",
        timestamp: "2026-07-10T13:30:00Z"
      },
      {
        id: "msg-403",
        sender: "customer",
        text: "Excellent! The test succeeded and we are no longer seeing any HTTP 429 rate limit errors. Thank you so much for the quick adjustment!",
        timestamp: "2026-07-11T02:15:00Z"
      },
      {
        id: "msg-404",
        sender: "agent",
        text: "You are very welcome, Yuki! I will go ahead and mark this ticket as resolved. Feel free to open a new one if you need anything else.",
        timestamp: "2026-07-11T04:00:00Z"
      }
    ]
  }
];

export const INITIAL_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "KB-102",
    title: "Configuring SAML SSO with Microsoft Entra ID (Azure AD)",
    category: "Account Security",
    summary: "Step-by-step guide on establishing single sign-on (SSO) integration between Microsoft Entra ID and SupportPilot AI.",
    views: 342,
    helpfulCount: 28,
    tags: ["SSO", "SAML", "Azure AD", "Authentication"],
    lastUpdated: "2026-06-20",
    type: "troubleshoot",
    content: `# Configuring SAML SSO with Microsoft Entra ID

Learn how to integrate your Microsoft Entra ID (formerly Azure Active Directory) tenant with SupportPilot to enable secure Enterprise Single Sign-On (SSO).

## Prerequisites
- Administrative access to Microsoft Azure Portal
- SupportPilot AI Administrator permissions

## Step 1: Create Enterprise Application in Azure
1. Navigate to **Microsoft Entra ID** > **Enterprise Applications** > **New Application**.
2. Select **Create your own application**. Name it \`SupportPilot SSO\` and choose **Integrate any other application you don't find in the gallery (Non-gallery)**.
3. Once created, go to **Single sign-on** and select **SAML**.

## Step 2: Configure SAML Settings in Azure
Use the following coordinates from your SupportPilot Settings dashboard:
- **Identifier (Entity ID)**: \`https://api.supportpilot.ai/sso/saml/metadata\`
- **Reply URL (Assertion Consumer Service URL)**: \`https://api.supportpilot.ai/sso/saml/acs\`

## Step 3: Configure SAML in SupportPilot
1. Download the **Federation Metadata XML** from Azure SAML Certificates section.
2. Open **SupportPilot Settings** > **SSO Configuration**.
3. Toggle SAML to **Enabled** and paste the contents of your XML metadata file.
4. Set mapping attributes:
   - \`Email\` -> \`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress\`
   - \`Name\` -> \`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name\`

## Troubleshooting Certificate Rotations
If your users encounter a login loop, ensure the SAML certificate has not expired in your Azure App registrations, and that the certificate fingerprint matches the SHA-256 string uploaded in SupportPilot.`
  },
  {
    id: "KB-215",
    title: "Resolving Outbound Webhook Delivery Failures",
    category: "API Integration",
    summary: "Troubleshoot webhook delivery delays, 504 gateway timeouts, retry schedules, and firewalls.",
    views: 189,
    helpfulCount: 15,
    tags: ["Webhooks", "API", "Timeouts", "Web Security"],
    lastUpdated: "2026-07-02",
    type: "troubleshoot",
    content: `# Resolving Outbound Webhook Delivery Failures

This guide assists developers in debugging unsuccessful webhook delivery payloads and HTTP error status logs returned from outbound webhooks.

## Understanding Retries
SupportPilot attempts to deliver webhook events instantly. If your consumer server responds with any status outside the \`2xx\` range (or times out), we trigger our exponential retry loop:
- **1st Retry**: 5 minutes after failure
- **2nd Retry**: 15 minutes after failure
- **3rd Retry**: 1 hour after failure
- **Final Retry**: 24 hours after failure (if all fail, the event is marked as \`failed\` and disabled after 100 consecutive failures).

## Common Error: 504 Gateway Timeout
An outbound connection times out if your server does not respond within **10.0 seconds**. To resolve timeouts:
1. **Asynchronous Handling**: Immediately return an HTTP \`202 Accepted\` or \`200 OK\` on receiving the webhook, and push the actual processing logic into a background worker queue (e.g., Celery, BullMQ, Sidekiq).
2. **CDN & Firewalls**: Verify your Cloudflare, AWS CloudFront, or enterprise firewall is not stalling requests or blockading SupportPilot IPs.

## IP Whitelisting
To permit SupportPilot webhook traffic through your network perimeter, add the following static IPs to your inbound firewall rules:
- \`34.120.45.190\`
- \`35.198.112.5\`
`
  },
  {
    id: "KB-304",
    title: "Refunding Invoice Charges & Stripe Management",
    category: "Billing",
    summary: "How to handle double billing, annual renewal reversals, and locating payment transaction tokens.",
    views: 95,
    helpfulCount: 11,
    tags: ["Billing", "Stripe", "Refunds", "Invoices"],
    lastUpdated: "2026-05-14",
    type: "faq",
    content: `# Refunding Invoice Charges & Stripe Management

Guide for support agents and billing managers on analyzing payment gateway charges, issuing partial/full refunds, and handling duplicate transaction tokens.

## How Duplicate Charges Occur
Duplicate charges are typically the result of:
1. **Network Retries**: A client-side browser double-submitting a checkout form before the initial token resolves.
2. **Stripe Idempotency Faults**: Running automated recurring billing scripts without generating unique, transaction-specific idempotency keys.

## Locating Stripe Charge IDs
1. Search the customer email or invoice number in the **Billing Portal** or SupportPilot billing console.
2. Identify the transaction with status \`Success\`. If you find two identical amounts within 5 minutes of each other, look for:
   - \`ch_XXXXXXXXXXXXXXXXXXXX\` or \`py_XXXXXXXXXXXXXXXXXXXX\`
   - Verify they have different Stripe token IDs.

## Issuing a Refund
1. Click **Refund** on the selected charge.
2. Choose **Reason**: "Duplicate" or "Customer Request".
3. Stripe processes refunds within 5-10 business days depending on the customer's financial institution.`
  },
  {
    id: "KB-401",
    title: "FAQ: Invoicing Timelines, Payment Methods & Autopay Terms",
    category: "Billing",
    summary: "Essential answers regarding enterprise payment conditions, supported credit instruments, and auto-renewal options.",
    views: 112,
    helpfulCount: 9,
    tags: ["Invoices", "FAQ", "Wire Transfer", "Autopay"],
    lastUpdated: "2026-07-08",
    type: "faq",
    content: `# Invoicing Timelines, Payment Methods & Autopay FAQ

Find answers to standard customer billing cycles, enterprise payment support, and self-serve settings.

## 1. Which payment methods do you support?
We support all major international credit cards (Visa, Mastercard, American Express, Discover), as well as **ACH Direct Debit** for US customers and **SEPA** for European customers. For Enterprise accounts above $5,000/year, we support manual invoicing with standard **Net-30 payment terms** payable via bank wire transfer or credit card.

## 2. When are invoices generated?
- **Monthly subscriptions** are billed automatically at the beginning of each billing cycle (on your subscription anniversary day).
- **Annual subscriptions** generate a renewal invoice exactly 30 days prior to expiration.
- **Metered usage fees** (such as excess API requests or seat expansions) are calculated on the 1st of the following month and billed on your standard billing date.

## 3. How do I enable or disable Autopay?
By default, all credit card and ACH direct debit accounts have Autopay enabled. You can toggle this setting in **Settings** > **Billing Profile** > **Payment Settings** > **Enable Autopay**.`
  },
  {
    id: "KB-402",
    title: "FAQ: Multi-Factor Authentication (MFA) & Password Lockouts",
    category: "Account Security",
    summary: "Standard resolution guidelines for resetting active TOTP authenticator tokens and clearing user lockouts.",
    views: 154,
    helpfulCount: 22,
    tags: ["MFA", "TOTP", "Lockout", "FAQ", "Security"],
    lastUpdated: "2026-07-10",
    type: "faq",
    content: `# FAQ: Multi-Factor Authentication & Account Lockouts

Answers to standard troubleshooting scenarios for user accounts and identity security policies.

## 1. What happens if a user loses their MFA authenticator?
If a user loses access to their physical authenticator device (e.g. Google Authenticator or Duo), they can use one of the 8-digit **emergency backup codes** generated during initial setup. Each code is single-use.

## 2. How does an administrator reset MFA for a user?
If the user also lost their backup codes, an account administrator can disable MFA manually:
1. Navigate to **Identity Directory** > **Users**.
2. Select the locked-out user.
3. Under **Security Profile**, click **Reset MFA Token**.
4. The user will be requested to set up MFA fresh on their next login attempt.

## 3. Why is an account locked out?
Accounts are locked for exactly **30 minutes** after 5 consecutive failed password attempts. This is a hard security constraint to prevent brute-force attacks.`
  },
  {
    id: "KB-501",
    title: "Troubleshooting Guide: Fixing CORS Blocks on Local Host Connectors",
    category: "Technical Support",
    summary: "Resolve standard cross-origin resource sharing errors when calling our SDK or REST endpoint from a local environment.",
    views: 290,
    helpfulCount: 37,
    tags: ["CORS", "Localhost", "SDK", "Debug", "Headers"],
    lastUpdated: "2026-07-12",
    type: "troubleshoot",
    content: `# Troubleshooting: Localhost CORS Blocked Exceptions

If your developer environment returns errors like \`Access to fetch at ... from origin 'http://localhost:3000' has been blocked by CORS policy\`, use this diagnostic checklist.

## Quick Diagnostic Checklist
1. **Developer Token Origins**: SupportPilot restricts browser-side API access unless the calling Origin is explicitly added to your approved list.
2. **Access Control Headers**: Your backend must permit standard methods (\`GET\`, \`POST\`, \`OPTIONS\`).

## Step-by-Step Resolution
1. **Configure Approved Origins**:
   - Go to **SupportPilot Console** > **Developer Center** > **API Keys**.
   - Locate your active development API Key.
   - Click **Settings** > **Allowed Origins**.
   - Add \`http://localhost:3000\` (or your local container URL) and save. It takes up to 60 seconds to propagate to our edge CDN.
2. **Use Backend Proxies (Recommended)**:
   Avoid making client-side requests from the browser directly. Proxy requests through your server to secure your secret keys:
   \`\`\`javascript
   // Node.js Express Example
   app.post('/api/support-proxy', async (req, res) => {
     const response = await fetch('https://api.supportpilot.ai/v1/chat', {
       method: 'POST',
       headers: { 
         'Authorization': \`Bearer \${process.env.SUPPORTPILOT_SECRET_KEY}\`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify(req.body)
     });
     const data = await response.json();
     res.json(data);
   });
   \`\`\``
  },
  {
    id: "KB-601",
    title: "Product Documentation: REST API Rate Limits & Concurrency Management",
    category: "General Product",
    summary: "Technical guide on global HTTP 429 limits, sliding window rules, and response headers.",
    views: 204,
    helpfulCount: 18,
    tags: ["REST API", "Rate Limit", "HTTP 429", "Docs"],
    lastUpdated: "2026-07-14",
    type: "doc",
    content: `# REST API Rate Limits & Concurrency Rules

This product sheet details how SupportPilot monitors, throttles, and communicates API traffic rates on all standard endpoints.

## Tier-Based Limits
Global rate limits are calculated on a **rolling 60-second window** based on your subscription:
- **Developer / Sandbox**: 60 requests per minute (RPM)
- **Growth Tier**: 300 requests per minute (RPM)
- **Enterprise / Custom**: Up to 2,000 requests per minute (RPM)

## Throttling Headers
Every API response includes these standard HTTP compliance headers:
- \`X-RateLimit-Limit\`: The maximum number of requests allowed in the active period.
- \`X-RateLimit-Remaining\`: The number of remaining requests allowed within the current window.
- \`X-RateLimit-Reset\`: UTC epoch timestamp indicating when the current window resets.

## Handling HTTP 429 Errors
If you exceed your quota, the server responds with **HTTP 429 Too Many Requests** and a \`Retry-After\` header indicating how many seconds to wait. We highly recommend using exponential backoff with jitter on your retry clients.`
  },
  {
    id: "KB-602",
    title: "Product Documentation: Webhook Event Schemas & Security Signatures",
    category: "General Product",
    summary: "Structure of outgoing JSON webhook payloads and verifying signatures using secret tokens.",
    views: 145,
    helpfulCount: 13,
    tags: ["Webhooks", "JSON Schema", "HMAC", "Docs", "Security"],
    lastUpdated: "2026-07-15",
    type: "doc",
    content: `# Webhook Event Schemas & Security Signatures

This document describes the structural JSON blueprint of outbound SupportPilot webhook dispatch events and how to verify cryptographic integrity signatures.

## Standard JSON Payload Outline
Every outgoing webhook uses the following standard envelope structure:
\`\`\`json
{
  "event_id": "evt_9a48f21bc7890def",
  "event_type": "ticket.created",
  "created_at": "2026-07-15T09:30:00Z",
  "data": {
    "ticket_id": "SP-4029",
    "title": "Webhook payloads failing with 504 Gateway Timeout",
    "customer": "Devon Ramirez",
    "status": "open",
    "priority": "high"
  }
}
\`\`\`

## Verifying Signatures (HMAC-SHA256)
To secure your webhook endpoint and guarantee payloads originate from SupportPilot, verify the signature in the \`X-SupportPilot-Signature\` request header:
1. Extract the raw request payload body bytes.
2. Grab your unique **Webhook Secret Key** from your console.
3. Compute an HMAC hash using SHA-256 and hex encode the result.
4. Compare your hash with the header value. They must match exactly.`
  }
];

export const PRESET_CATEGORIES = [
  "Billing",
  "Technical Support",
  "API Integration",
  "Account Security",
  "General Product"
];
