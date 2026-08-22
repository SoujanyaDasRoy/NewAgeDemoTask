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
  requiredUntil?: string | null;
  department?: string;
  accessId?: string | null;
  category?: string;
}

/**
 * Builds the rich interactive Slack Block-Kit payload for an access request.
 */
export function buildSlackAccessRequestBlocks(payload: SlackMessagePayload, portalBaseUrl?: string) {
  let rawBaseUrl =
    portalBaseUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.PORTAL_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://new-age-demo.vercel.app";

  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const now = new Date();
  const unixSec = Math.floor(now.getTime() / 1000);

  // Fallback formatted timestamp in IST
  const fallbackFormatted = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const isSelf = (payload.requesterName || "").toLowerCase() === (payload.beneficiaryName || "").toLowerCase();
  const beneficiaryDisplay = isSelf
    ? `${payload.beneficiaryName} *(Self)*`
    : `${payload.beneficiaryName} *(On-Behalf)*`;
  const policyDisplay = payload.isException
    ? `🏢 *Cross-Department (${payload.urgency || "Standard"})*`
    : `✓ *Pre-Approved Policy*`;
  const provisioningDisplay = payload.automation
    ? `⚡ *Automated SCIM (Instant)*`
    : `🛠️ *Manual IT Account Setup*`;
  const durationDisplay = payload.requiredUntil
    ? `⏳ *Until ${payload.requiredUntil}*`
    : `♾️ *Standard / 90 Days*`;
  const governanceDisplay = payload.accessId
    ? `🔑 \`${payload.accessId}\``
    : `🔍 *Governance ID Pending*`;

  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `🛡️ New Access Request: ${payload.accessLabel}`,
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
          text: `*Requester:*\n${payload.requesterName}${payload.department ? ` (${payload.department})` : ""}`,
        },
        {
          type: "mrkdwn",
          text: `*Beneficiary:*\n${beneficiaryDisplay}`,
        },
        {
          type: "mrkdwn",
          text: `*Policy Routing:*\n${policyDisplay}`,
        },
        {
          type: "mrkdwn",
          text: `*Assigned Approver:*\n👔 ${payload.approverName}`,
        },
        {
          type: "mrkdwn",
          text: `*Fulfillment Mode:*\n${provisioningDisplay}`,
        },
        {
          type: "mrkdwn",
          text: `*Access Duration:*\n${durationDisplay}`,
        },
        {
          type: "mrkdwn",
          text: `*SOC-2 Access ID:*\n${governanceDisplay}`,
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*📝 Business Justification & Purpose:*\n>${(payload.justification || "No justification provided").replace(/\n/g, "\n>")}`,
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
            text: "Review in Portal ↗",
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
          text: `🛡️ *New Age Governance Engine* • Status: *${payload.status || "Pending Approval"}* • Submitted: <!date^${unixSec}^{date_short_pretty} at {time}|${fallbackFormatted}>`,
        },
      ],
    },
  ];
}

/**
 * Sends a formatted interactive Slack Block-Kit message to the configured Incoming Webhook or Bot Token.
 */
export async function sendSlackNotification(payload: SlackMessagePayload) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const botToken = process.env.SLACK_BOT_TOKEN || process.env.SLACK_ACCESS_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID || "general";

  const blocks = buildSlackAccessRequestBlocks(payload);

  // Method 1: Webhook URL
  if (webhookUrl && webhookUrl.startsWith("https://hooks.slack.com")) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Access Request: ${payload.accessLabel} (${payload.requestId})`,
          blocks,
        }),
      });

      if (res.ok) {
        console.log(`[Slack] Live message posted to Slack Webhook for ${payload.requestId}`);
        return { sent: true, method: "webhook", status: res.status };
      } else {
        const errText = await res.text();
        console.error("[Slack] Webhook failed:", errText);
        return { sent: false, method: "webhook", status: res.status, error: errText };
      }
    } catch (error: any) {
      console.error("[Slack] Error posting to webhook:", error);
      return { sent: false, error: error.message };
    }
  }

  // Method 2: Slack Web API (Bot/User Token)
  if (botToken) {
    try {
      const res = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: channelId,
          text: `Access Request: ${payload.accessLabel} (${payload.requestId})`,
          blocks,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        console.log(`[Slack] Live message posted to Slack channel ${channelId} for ${payload.requestId}`);
        return { sent: true, method: "api", channel: channelId };
      } else {
        console.error("[Slack] chat.postMessage failed:", data.error);
        return { sent: false, method: "api", error: data.error };
      }
    } catch (error: any) {
      console.error("[Slack] Error posting via Slack API:", error);
      return { sent: false, error: error.message };
    }
  }

  return { sent: false, reason: "Neither SLACK_WEBHOOK_URL nor SLACK_BOT_TOKEN is configured" };
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
