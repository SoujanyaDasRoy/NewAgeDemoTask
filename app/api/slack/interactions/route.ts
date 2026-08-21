import { NextRequest, NextResponse } from "next/server";
import { verifySlackSignature } from "@/lib/slack";
import { approveRequest, rejectRequest } from "@/lib/actions/requests";

/**
 * Slack Interactivity Webhook Endpoint
 * Receives button clicks (Approve / Reject) from interactive Slack Block-Kit cards.
 * Verifies cryptographic signatures, updates database state in Neon Postgres atomically,
 * and returns updated Block-Kit confirmation blocks to replace the interactive card.
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-slack-signature") || "";
    const timestamp = req.headers.get("x-slack-request-timestamp") || "";
    const rawBody = await req.text();

    // Verify cryptographic signature if secret configured
    const signingSecret = process.env.SLACK_SIGNING_SECRET;
    if (signingSecret) {
      const isValid = verifySlackSignature(signature, timestamp, rawBody, signingSecret);
      if (!isValid) {
        console.warn("[Slack Interactivity] Unauthorized: Invalid or expired HMAC signature.");
        return NextResponse.json({ error: "Invalid Slack signature" }, { status: 401 });
      }
    }

    // Parse Slack URL-encoded payload
    let payloadData: any;
    try {
      if (rawBody.startsWith("payload=")) {
        const decoded = decodeURIComponent(rawBody.slice(8).replace(/\+/g, " "));
        payloadData = JSON.parse(decoded);
      } else {
        const params = new URLSearchParams(rawBody);
        const payloadParam = params.get("payload");
        if (payloadParam) {
          payloadData = JSON.parse(payloadParam);
        } else {
          payloadData = JSON.parse(rawBody);
        }
      }
    } catch (parseError: any) {
      console.error("[Slack Interactivity] Payload parse failure:", parseError);
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    if (!payloadData || !payloadData.actions || payloadData.actions.length === 0) {
      return NextResponse.json({ message: "No actions found in payload" }, { status: 200 });
    }

    const action = payloadData.actions[0];
    const actionId: string = action.action_id || "";
    const requestId: string = action.value || "";
    const user = payloadData.user || {};
    const actorName = user.name || user.username || user.id || "Slack User";
    const timestampFormatted = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    let isApproved = false;
    let actionSuccess = false;
    let confirmationText = "";

    if (actionId === "slack_approve_request" || actionId.startsWith("approve")) {
      isApproved = true;
      const res = await approveRequest(requestId, `@${actorName}`);
      actionSuccess = res.success;
      confirmationText = `✅ Approved by @${actorName} at ${timestampFormatted}`;
    } else if (actionId === "slack_reject_request" || actionId.startsWith("reject")) {
      isApproved = false;
      const res = await rejectRequest(requestId, "Rejected via Slack button", `@${actorName}`);
      actionSuccess = res.success;
      confirmationText = `❌ Rejected by @${actorName}`;
    } else {
      return NextResponse.json({ message: `Unrecognized action: ${actionId}` }, { status: 200 });
    }

    console.log(`[Slack Interactivity] Processed ${actionId} for request ${requestId} by @${actorName}. Success: ${actionSuccess}`);

    // Construct updated blocks replacing the action buttons
    let updatedBlocks: any[] = [];
    if (payloadData.message && Array.isArray(payloadData.message.blocks)) {
      updatedBlocks = payloadData.message.blocks.map((block: any) => {
        if (block.type === "actions") {
          return {
            type: "section",
            text: {
              type: "mrkdwn",
              text: confirmationText,
            },
          };
        }
        if (block.type === "context" && block.elements?.[0]?.text?.includes("Status:")) {
          return {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `New Age Access Portal • Status: *${isApproved ? "Approved" : "Rejected"}* • Processed by @${actorName}`,
              },
            ],
          };
        }
        return block;
      });
    }

    // Fallback blocks if original message blocks were not retained
    if (updatedBlocks.length === 0) {
      updatedBlocks = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: isApproved ? "✅ Access Request Approved" : "❌ Access Request Rejected",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Request ID:* \`${requestId}\`\n${confirmationText}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `New Age Access Portal • Status: *${isApproved ? "Approved" : "Rejected"}*`,
            },
          ],
        },
      ];
    }

    const responsePayload = {
      replace_original: true,
      response_type: "in_channel",
      text: confirmationText,
      blocks: updatedBlocks,
    };

    // If Slack provided a response_url, update asynchronously as well
    if (payloadData.response_url) {
      fetch(payloadData.response_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responsePayload),
      }).catch((e) => console.error("[Slack Interactivity] Async response_url post failed:", e));
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    console.error("[Slack Interactivity] Handler execution error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
