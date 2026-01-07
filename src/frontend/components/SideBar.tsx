"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { postLogout } from "@/lib/fast-api/auth";
import Image from "next/image";

export default function Sidebar(role: { role: string | undefined }) {
  const router = useRouter();
  const pathname = usePathname();

  const sections = [
    { title: "Main", items: ["Dashboard Report", "Manage Invite Code"] },
    { title: "Inventory", items: ["Products"] },
    {
      title: "Purchases",
      items: ["Purchase Orders", "Purchase Returns"],
    },
    { title: "Sales", items: ["Sales Management"] },
    {
      title: "Ledger",
      items: ["General Ledger", "Expenses", "Invest", "Draw Money"],
    },
    { title: "Locations", items: ["Stores", "Warehouses"] },
    { title: "Partners", items: ["Brands", "Suppliers"] },
    { title: "AI", items: ["Generate Report"] },
    { title: "Settings", items: ["Advanced"] },
  ];
  console.log("User role in Sidebar:", role);

  // Managers do NOT see "Partners" or "AI"
  const managerOrder = ["Main", "Inventory", "Purchases", "Sales", "Ledger", "Locations", "Settings"];

  const allowedSections: Record<string, string[]> = {
    admin: sections.map((s) => s.title), // all sections for admin
    manager: managerOrder
  };
  // For manager, filter Locations items to only "Warehouses"
  let filteredSections = sections.filter(
    (s) => allowedSections[role.role ?? "manager"].includes(s.title)
  );
  if (role.role === "manager") {
    filteredSections = filteredSections.map((section) => {
      if (section.title === "Locations") {
        return { ...section, items: ["Warehouses"] };
      }
      return section;
    });
  }

  const orderedSections =
    role.role === "manager"
      ? managerOrder
        .map((title) => filteredSections.find((s) => s.title === title))
        .filter(Boolean)
      : filteredSections;

  const routeMap: Record<string, string> = {
    'Dashboard Report': '/dashboard',
    'Manage Invite Code': '/invite-code',
    'Products': '/products',
    'Sales Management': '/sales',
    'Stores': '/stores',
    'Warehouses': '/warehouses',
    'Customers Support': '/customers-support',
    'Suppliers': '/suppliers',
    'Advanced': '/settings',
    'General Ledger': '/ledger',
    'Invest': '/ledger/invest',
    'Expenses': '/ledger/expenses',
    'Purchase Returns': '/purchases/returns',
    'Purchase Orders': '/purchases/orders',
    'Draw Money': '/ledger/draw-money',
    'Generate Report': '/ai',
  }

  // Find the section that contains the current route
  function getSectionWithActiveRoute() {
    for (const s of sections) {
      for (const it of s.items) {
        const route = routeMap[it];
        if (route && pathname.startsWith(route)) {
          return s.title;
        }
      }
    }
    // Default to Inventory if nothing matches
    return "Inventory";
  }

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.title, false])),
  );

  // Open the section with the active route on mount or when pathname changes
  useEffect(() => {
    const activeSection = getSectionWithActiveRoute();
    setOpen((prev) =>
      Object.fromEntries(
        sections.map((s) => [s.title, s.title === activeSection]),
      ),
    );
  }, [pathname]);

  function toggle(title: string) {
    setOpen((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }

  async function handleLogout() {
    try {
      await postLogout();
    } catch (e: unknown) {
      console.log(e);
    } finally {
      router.push("/login");
    }
  }
  return (
    <aside className="w-64 pr-6">
      <div className="sticky top-6">
        <div className="flex items-center gap-2 mb-6">
          <img
            src="/favicon.png"
            alt="VietLedgr"
            className="w-7 h-7"
          />
          <span className="text-2xl font-semibold">VietLedgr</span>
        </div>

        {orderedSections.map((s: any) => {
          const isOpen = !!open[s.title];
          return (
            <div key={s.title} className="mb-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(s.title);
                }}
                className="w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-orange-50 focus:outline-none"
                aria-expanded={isOpen}
                aria-controls={`section-${s.title}`}
              >
                <div className="flex items-center gap-2">
                  <div className="text-xs uppercase text-gray-400">
                    {s.title}
                  </div>
                </div>
                <div className="text-gray-400">
                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </div>
              </button>

              <div
                id={`section-${s.title}`}
                className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 mt-2" : "max-h-0"}`}
              >
                <ul className="space-y-1 pl-2">
                  {s.items.length === 0 && (
                    <li className="text-sm text-gray-400 px-3 py-2">
                      No items
                    </li>
                  )}
                  {s.items.map((it: any) => {
                    const route = routeMap[it];
                    const isActive = route && pathname.startsWith(route);
                    return (
                      <li
                        key={it}
                        onClick={() => route && router.push(route)}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && route) {
                            router.push(route);
                          }
                        }}
                        role={route ? "button" : undefined}
                        tabIndex={route ? 0 : undefined}
                        className={`flex items-center text-sm px-3 py-2 rounded-md hover:bg-orange-50 ${isActive
                          ? "bg-orange-50 font-medium text-orange-600"
                          : "text-gray-700"
                          } cursor-pointer`}
                      >
                        <span className="flex-1">{it}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
        <div className="mt-8 border-t pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
