import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL;

export async function getCurrentUserAPI() {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('access_token')?.value;

    if(!accessToken) {
        return NextResponse.json(
            {id: null, username: null, role: null},
            { status: 401 },
        );
    }

    const res = await fetch(`${FASTAPI_URL}/user/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if(!res.ok) {
        return NextResponse.json(
            { id: null, username: null, role: null },
            { status: res.status },
        );
    }

    const data = await res.json() as {
        user_id: string;
        username: string;
        type: string;
    };

    return NextResponse.json({
        id: data.user_id,
        username: data.username,
        role: data.type,
    });
}