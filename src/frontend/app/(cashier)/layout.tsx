import { getCurrentUser } from "@/lib/fast-api/user";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function CashiserLayout({ children }: { children: ReactNode}) {
    const user = await getCurrentUser();
    if(!user) {
        redirect("/unauthorized");
    }

    return <>{children}</>
}