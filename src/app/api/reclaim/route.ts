import { NextRequest, NextResponse } from "next/server";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";

export async function GET(request: NextRequest) {
  try {
    const appId = process.env.RECLAIM_APP_ID;
    const appSecret = process.env.RECLAIM_APP_SECRET;
    const providerId = process.env.RECLAIM_PROVIDER_ID;

    if (!appId || !appSecret || !providerId) {
      return NextResponse.json(
        { success: false, error: "Reclaim Protocol is not configured" },
        { status: 500 }
      );
    }

    // Initialize the proof request on the server (keeps APP_SECRET secure)
    const reclaimProofRequest = await ReclaimProofRequest.init(
      appId,
      appSecret,
      providerId
    );

    // Optionally set context from query params (e.g. user/session id)
    const userId = request.nextUrl.searchParams.get("userId");
    const message = request.nextUrl.searchParams.get("message");
    if (userId) {
      reclaimProofRequest.setContext(userId, message ?? "");
    }

    // Convert to JSON string that is safe to send to the frontend
    const proofRequestObject = reclaimProofRequest.toJsonString();

    return NextResponse.json({
      success: true,
      proofRequest: proofRequestObject,
    });
  } catch (err) {
    console.error("Reclaim init error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to initialize proof request",
      },
      { status: 500 }
    );
  }
}
