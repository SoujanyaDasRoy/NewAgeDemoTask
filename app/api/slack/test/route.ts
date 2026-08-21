import { NextRequest, NextResponse } from "next/server";
import { buildSlackAccessRequestBlocks, SlackMessagePayload } from "@/lib/slack";

/**
 * Diagnostic Slack Test Endpoint (GET & POST)
 * Tests delivery of live interactive Block-Kit cards to the configured Slack Webhook URL.
 * Returns detailed diagnostic JSON with HTTP response codes, response bodies, and configuration statuses.
 */
async function handleSlackTest(req: NextRequest) {
  const startTime = Date.now();
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  // Mask webhook URL for safe diagnostic logs
  const maskedWebhookUrl = webhookUrl
    ? webhookUrl.replace(/services\/([^/]+)\/([^/]+)\/(.+)$/, "services/$1/*****/$3")
    : null;

  // Parse custom payload if provided, or fallback to standard sample test card
  let customOverrides: Partial<SlackMessagePayload> = {};
  if (req.method === "POST") {
    try {
      const body = await req.json();
      customOverrides = body || {};
    } catch {
      // Ignore JSON parse errors for empty POST body
    }
  } else {
    const searchParams = req.nextUrl.searchParams;
    const reqId = searchParams.get("requestId");
    const label = searchParams.get("accessLabel");
    if (reqId) customOverrides.requestId = reqId;
    if (label) customOverrides.accessLabel = label;
  }

  const samplePayload: SlackMessagePayload = {
    requestId: customOverrides.requestId || "NAR-TEST-10499",
    accessLabel: customOverrides.accessLabel || "Snowflake – Production Data Analyst",
    requesterName: customOverrides.requesterName || "Alex Rivera",
    beneficiaryName: customOverrides.beneficiaryName || "Alex Rivera",
    isException: customOverrides.isException ?? false,
    urgency: customOverrides.urgency || "STANDARD",
    justification:
      customOverrides.justification ||
      "Executing end-to-end Slack Block-Kit webhook verification and interactive approval test.",
    approverName: customOverrides.approverName || "Rahul Sharma",
    automation: customOverrides.automation ?? true,
    status: customOverrides.status || "Pending Approval",
  };

  const portalBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.PORTAL_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newage-access-portal.vercel.app");

  const blocks = buildSlackAccessRequestBlocks(samplePayload, portalBaseUrl);

  if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com")) {
    return NextResponse.json(
      {
        success: false,
        status: "NOT_CONFIGURED",
        message:
          "SLACK_WEBHOOK_URL environment variable is not configured or does not start with https://hooks.slack.com.",
        environment: {
          webhookConfigured: false,
          signingSecretConfigured: Boolean(signingSecret),
          portalBaseUrl,
        },
        payloadGenerated: {
          text: `Access Request: ${samplePayload.accessLabel} (${samplePayload.requestId})`,
          blocks,
        },
        instructions: [
          "1. In your Slack Workspace, create an Incoming Webhook (or install a Slack App).",
          "2. Add SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... to your .env file.",
          "3. Re-run this endpoint to dispatch real Block-Kit test cards to your channel.",
        ],
      },
      { status: 200 }
    );
  }

  try {
    const slackRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: `[TEST] Access Request: ${samplePayload.accessLabel} (${samplePayload.requestId})`,
        blocks,
      }),
    });

    const latencyMs = Date.now() - startTime;
    const responseText = await slackRes.text();

    return NextResponse.json({
      success: slackRes.ok,
      httpStatus: slackRes.status,
      httpStatusText: slackRes.statusText,
      slackResponse: responseText,
      latencyMs: `${latencyMs}ms`,
      environment: {
        webhookConfigured: true,
        webhookUrl: maskedWebhookUrl,
        signingSecretConfigured: Boolean(signingSecret),
        portalBaseUrl,
      },
      dispatchedPayload: {
        samplePayload,
        blockCount: blocks.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to dispatch request to Slack webhook URL",
        latencyMs: `${latencyMs}ms`,
        environment: {
          webhookConfigured: true,
          webhookUrl: maskedWebhookUrl,
          signingSecretConfigured: Boolean(signingSecret),
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleSlackTest(req);
}

export async function POST(req: NextRequest) {
  return handleSlackTest(req);
}
