import { cookies } from "next/headers";

export type Role = "CASHIER" | "MANAGER" | "ADMIN";

export type CurrentUser = {
    id: string;
    username: string;
    role: Role;
} | null;

const FASTAPI_URL = process.env.FASTAPI_URL!; 

export async function getCurrentUser(): Promise<CurrentUser> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) return null;

    const res = await fetch(`${FASTAPI_URL}/api/user/me`, {
        method: "GET",
        headers: {
        Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
        user_id: string;
        username: string;
        type: Role; 
    };

    return {
        id: data.user_id,
        username: data.username,
        role: data.type,
    };
}
