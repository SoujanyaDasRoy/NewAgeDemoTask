/**
 * Slack Integration Utility
 * Real 2-way Slack Integration for New Age Access Portal.
 * Handles Block-Kit message construction, incoming webhook dispatch,
 * and cryptographic HMAC-SHA256 request signature verification.
 */

import crypto from "crypto";

export interface SlackMessagePayload {
  requestId: string;
  accessLabel: string;
  requesterName: string;
  beneficiaryName: string;
  isException?: boolean;
  urgency?: string;
  justification: string;
  approverName: string;
  automation?: boolean;
  status?: string;
}

/**
 * Builds the interactive Slack Block-Kit payload for an access request.
 */
export function buildSlackAccessRequestBlocks(payload: SlackMessagePayload, portalBaseUrl?: string) {
  const baseUrl = portalBaseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const formattedTimestamp = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `🔔 New Access Request: ${payload.accessLabel}`,
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Request ID:*\n\`${payload.requestId}\``,
        },
        {
          type: "mrkdwn",
          text: `*Requester:*\n${payload.requesterName}`,
        },
        {
          type: "mrkdwn",
          text: `*Beneficiary:*\n${payload.beneficiaryName}`,
        },
        {
          type: "mrkdwn",
          text: `*Type:*\n${payload.isException ? `⚠️ *Exception (${payload.urgency || "Standard"})*` : "Standard"}`,
        },
        {
          type: "mrkdwn",
          text: `*Approver:*\n${payload.approverName}`,
        },
        {
          type: "mrkdwn",
          text: `*Provisioning Mode:*\n${payload.automation ? "⚡ Automated" : "🛠️ Manual"}`,
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Business Justification:*\n>${(payload.justification || "No justification provided").replace(/\n/g, "\n>")}`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "✓ Approve Access",
            emoji: true,
          },
          style: "primary",
          action_id: "slack_approve_request",
          value: payload.requestId,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "✕ Reject",
            emoji: true,
          },
          style: "danger",
          action_id: "slack_reject_request",
          value: payload.requestId,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Review in Portal",
            emoji: true,
          },
          url: `${baseUrl}/?approval=${payload.requestId}`,
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `New Age Access Portal • Status: *${payload.status || "Pending Approval"}* • ${formattedTimestamp} UTC`,
        },
      ],
    },
  ];
}

/**
 * Sends a formatted interactive Slack Block-Kit message to the configured Incoming Webhook.
 */
export async function sendSlackNotification(payload: SlackMessagePayload) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com")) {
    return { sent: false, reason: "No SLACK_WEBHOOK_URL configured or invalid URL" };
  }

  try {
    const portalBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const blocks = buildSlackAccessRequestBlocks(payload, portalBaseUrl);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `Access Request: ${payload.accessLabel} (${payload.requestId})`,
        blocks,
      }),
    });

    if (res.ok) {
      console.log(`[Slack] Live message posted to Slack for ${payload.requestId}`);
      return { sent: true, status: res.status };
    } else {
      const errText = await res.text();
      console.error("[Slack] Webhook failed:", errText);
      return { sent: false, status: res.status, error: errText };
    }
  } catch (error: any) {
    console.error("[Slack] Error posting to webhook:", error);
    return { sent: false, error: error.message };
  }
}

/**
 * Cryptographically verifies Slack request signature using HMAC-SHA256.
 * Implements anti-replay protection with a 5-minute tolerance window.
 *
 * @param signature - The X-Slack-Signature header (e.g. "v0=a2114d57b48e...")
 * @param timestamp - The X-Slack-Request-Timestamp header (e.g. "1531420618")
 * @param rawBody - The unparsed raw request body string
 * @param signingSecret - Slack Signing Secret from App settings
 * @returns boolean - True if the signature is authentic and fresh
 */
export function verifySlackSignature(
  signature: string,
  timestamp: string,
  rawBody: string,
  signingSecret: string
): boolean {
  if (!signature || !timestamp || !rawBody || !signingSecret) {
    return false;
  }

  // Prevent replay attacks (reject timestamps older than 5 minutes / 300 seconds)
  const currentTime = Math.floor(Date.now() / 1000);
  const reqTime = parseInt(timestamp, 10);
  if (isNaN(reqTime)) {
    return false;
  }

  const timeDiff = Math.abs(currentTime - reqTime);
  if (timeDiff > 300) {
    console.warn(`[Slack] Timestamp drift exceeded 300s: ${timeDiff}s`);
    return false;
  }

  // Compute HMAC-SHA256 signature
  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto.createHmac("sha256", signingSecret);
  hmac.update(sigBaseString, "utf8");
  const calculatedSignature = `v0=${hmac.digest("hex")}`;

  try {
    const sigBuffer = Buffer.from(signature, "utf8");
    const calcBuffer = Buffer.from(calculatedSignature, "utf8");

    if (sigBuffer.length !== calcBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, calcBuffer);
  } catch {
    return false;
  }
}
