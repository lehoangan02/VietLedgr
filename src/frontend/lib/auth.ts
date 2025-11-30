import { getCurrentUserAPI } from "./fast-api/user";

export type Role = "cashier" | "manager" | "admin";

export type CurrentUser = {
    id: string;
    user: string;
    role: Role;
} | null;

export async function getCurrentUser(): Promise<CurrentUser> {
    const res = await getCurrentUserAPI();

    if(!res.ok) return null;

    const data = await res.json();
    if(!data?.id) return null;

    return data as CurrentUser;
}