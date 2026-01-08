import Sidebar from "@/components/SideBar";
import { getCurrentUser } from "@/lib/fast-api/user";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function ManagerLayout({ children }: { children: ReactNode }) {
    const user = await getCurrentUser();
    const role = user?.role.toString().toLowerCase();
    if (!user || (role !== "admin" && role !== "manager")) {
        redirect("/unauthorized");
    }

    return (
        <div className="w-full max-w-screen-2xl mx-auto flex gap-6 font-sans min-h-screen bg-gray-50">
            <Sidebar role={role} />
            <main className="flex-1">{children}</main>
        </div>
    )
}