import crypto from "crypto";
import { verifySlackSignature, buildSlackAccessRequestBlocks } from "../lib/slack";

async function runTests() {
  console.log("=========================================");
  console.log("🧪 Testing Slack Integration Utilities");
  console.log("=========================================\n");

  // Test 1: Block Kit Generation
  console.log("1. Testing Block Kit Builder...");
  const blocks = buildSlackAccessRequestBlocks({
    requestId: "NAR-10499",
    accessLabel: "Snowflake – Production Data Analyst",
    requesterName: "Alex Rivera",
    beneficiaryName: "Alex Rivera",
    isException: false,
    justification: "Diagnosing quarterly pipeline metrics.",
    approverName: "Rahul Sharma",
    automation: true,
    status: "Pending Approval",
  });

  if (blocks.length === 5) {
    console.log("  ✅ Block count verified: 5 blocks generated");
  } else {
    console.error(`  ❌ Unexpected block count: ${blocks.length}`);
    process.exit(1);
  }

  const actionsBlock: any = blocks.find((b) => b.type === "actions");
  if (actionsBlock && actionsBlock.elements.length === 3) {
    console.log("  ✅ Action elements verified: Approve, Reject, Review in Portal");
  } else {
    console.error("  ❌ Action buttons not found or incorrect element count");
    process.exit(1);
  }

  // Test 2: Cryptographic Signature Verification (HMAC-SHA256)
  console.log("\n2. Testing Cryptographic Signature Verification (HMAC-SHA256)...");
  const secret = "test_signing_secret_9948123";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const rawBody = "payload=" + encodeURIComponent(JSON.stringify({ test: "data" }));

  // Generate valid signature
  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const validSignature = "v0=" + crypto.createHmac("sha256", secret).update(sigBaseString, "utf8").digest("hex");

  const isValid = verifySlackSignature(validSignature, timestamp, rawBody, secret);
  if (isValid) {
    console.log("  ✅ Valid HMAC-SHA256 signature accepted correctly");
  } else {
    console.error("  ❌ Valid HMAC signature was rejected");
    process.exit(1);
  }

  // Test 3: Tampered signature rejection
  const tamperedSig = validSignature.substring(0, validSignature.length - 4) + "0000";
  const isTamperedRejected = !verifySlackSignature(tamperedSig, timestamp, rawBody, secret);
  if (isTamperedRejected) {
    console.log("  ✅ Tampered HMAC signature rejected correctly");
  } else {
    console.error("  ❌ Tampered HMAC signature was improperly accepted");
    process.exit(1);
  }

  // Test 4: Replay attack (stale timestamp rejection)
  const staleTimestamp = (Math.floor(Date.now() / 1000) - 400).toString(); // 400s > 300s
  const staleSigBase = `v0:${staleTimestamp}:${rawBody}`;
  const staleSig = "v0=" + crypto.createHmac("sha256", secret).update(staleSigBase, "utf8").digest("hex");
  const isReplayRejected = !verifySlackSignature(staleSig, staleTimestamp, rawBody, secret);
  if (isReplayRejected) {
    console.log("  ✅ Expired request timestamp (>300s) rejected for replay protection");
  } else {
    console.error("  ❌ Expired timestamp was improperly accepted");
    process.exit(1);
  }

  console.log("\n=========================================");
  console.log("🎉 All Slack Integration tests passed successfully!");
  console.log("=========================================\n");
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
