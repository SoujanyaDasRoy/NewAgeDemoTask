/**
 * Real Slack Integration Utility
 * Sends formatted Slack Block-Kit messages to a configured Incoming Webhook.
 * 
 * To enable real Slack alerts:
 * 1. Create a free Slack Incoming Webhook (https://api.slack.com/messaging/webhooks)
 * 2. Add SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..." to your .env file
 */

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

export async function sendSlackNotification(payload: SlackMessagePayload) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com")) {
    // No real webhook configured; skipped silently
    return { sent: false, reason: "No SLACK_WEBHOOK_URL configured" };
  }

  try {
    const portalBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const blocks = [
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
            text: `*For Employee:*\n${payload.beneficiaryName}`,
          },
          {
            type: "mrkdwn",
            text: `*Type:*\n${payload.isException ? "⚠️ *Exception Request*" : "Standard"}`,
          },
          {
            type: "mrkdwn",
            text: `*Approver:*\n${payload.approverName}`,
          },
          {
            type: "mrkdwn",
            text: `*Provisioning:*\n${payload.automation ? "⚡ Automated" : "🛠️ Manual"}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Business Justification:*\n>${payload.justification.replace(/\n/g, "\n>")}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Review & Decide in Portal",
              emoji: true,
            },
            style: "primary",
            url: `${portalBaseUrl}/?approval=${payload.requestId}`,
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `New Age Access Management Portal • Status: *${payload.status || "Pending Approval"}*`,
          },
        ],
      },
    ];

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });

    if (res.ok) {
      console.log(`[Slack] Live message posted to Slack for ${payload.requestId}`);
      return { sent: true };
    } else {
      const errText = await res.text();
      console.error("[Slack] Webhook failed:", errText);
      return { sent: false, error: errText };
    }
  } catch (error: any) {
    console.error("[Slack] Error posting to webhook:", error);
    return { sent: false, error: error.message };
  }
}
