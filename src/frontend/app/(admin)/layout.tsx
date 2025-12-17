import { getCurrentUser } from "@/lib/fast-api/user";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode}) {
    const user = await getCurrentUser();
    if(!user || user.role !== "ADMIN") {
        redirect("/unauthorized");
    }

    return <>{children}</>
}