import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL;

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const body = new URLSearchParams();
    for(const [key, value] of formData.entries()) {
        if(typeof value === "string") {
            body.append(key, value);
        }
    }
    const res = await fetch(`${FASTAPI_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
    });
    if(!res.ok) {
        return NextResponse.json({status: 422});
    }
    const data = await res.json() as {
        access_token: string;
        token_type: string;
    };
    const cookieStore = await cookies();
    cookieStore.set("access_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 24 * 8,
        sameSite: 'lax',
        path: '/',
    });
    return NextResponse.json({status: 200, message: 'Login successful' });
}   
