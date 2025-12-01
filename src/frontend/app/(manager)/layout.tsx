import { getCurrentUser } from "@/lib/fast-api/user";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function ManagerLayout({ children }: { children: ReactNode}) {
    const user = await getCurrentUser();
    if(!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
        redirect("/unauthorized");
    }

    return <>{children}</>
}