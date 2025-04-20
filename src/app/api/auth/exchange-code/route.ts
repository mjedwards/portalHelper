import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/utils/apiClient";
import { cookies } from "next/headers";


export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({error: 'No authorization code provided'}, {status: 400});
        }

        const tokenData = await exchangeCodeForTokens(code);

        const cookieStore = await cookies();

        cookieStore.set('ghl_access_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: tokenData.expires_in,
            path: '/',
        });

        cookieStore.set('ghl_refresh_token', tokenData.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        return NextResponse.json({success: true});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Token exchange error:', err);
        return NextResponse.json({error: err.message || 'Failed to exchange code for token'}, {status: 500});
    }
}