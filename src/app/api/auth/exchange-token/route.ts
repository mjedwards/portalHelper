/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/utils/api/authUtils.client";

export async function POST(req: NextRequest) {
	try {
		const { code } = await req.json();

		if (!code) {
			return NextResponse.json(
				{ error: "No authorization code provided" },
				{ status: 400 }
			);
		}

		const tokenData = await exchangeCodeForTokens(code);

		// Return the tokens to the client
		return NextResponse.json({
			accessToken: tokenData.access_token,
			refreshToken: tokenData.refresh_token,
			expiresIn: tokenData.expires_in,
		});
	} catch (err: any) {
		console.error("Token exchange error:", err);
		return NextResponse.json(
			{ error: err.message || "Failed to exchange code for token" },
			{ status: 500 }
		);
	}
}
