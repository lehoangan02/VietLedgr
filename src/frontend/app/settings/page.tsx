"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Moon, Sun, Monitor, CheckCircle2 } from "lucide-react";
import Sidebar from "@/components/SideBar";

type ThemeOption = "light" | "dark" | "system";

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemeOption>("light");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const applyThemeClass = useCallback((mode: ThemeOption) => {
    if (typeof window === "undefined") return;

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = mode === "dark" || (mode === "system" && prefersDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const handleSelectTheme = (value: ThemeOption) => {
    setTheme(value);
    applyThemeClass(value);
  };

  // Sync with local storage or system on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as ThemeOption) || "light";
    setTheme(savedTheme);
    applyThemeClass(savedTheme);
  }, [applyThemeClass]);

  // Keep "system" theme in sync with OS preference changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyThemeClass("system");

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme, applyThemeClass]);

  const handleSaveTheme = () => {
    setSaving(true);
    
    // Simulate API/LocalStorage delay
    setTimeout(() => {
      localStorage.setItem("theme", theme);
      setSaving(false);
      setLastSaved(new Date().toLocaleTimeString());
      applyThemeClass(theme);
    }, 600);
  };

  const themeCards: { id: ThemeOption; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      id: "light", 
      label: "Light Mode", 
      icon: <Sun size={20} />, 
      description: "Clean and bright interface, best for daytime use." 
    },
    { 
      id: "dark", 
      label: "Dark Mode", 
      icon: <Moon size={20} />, 
      description: "Easy on the eyes, perfect for low-light environments." 
    },
    { 
      id: "system", 
      label: "System", 
      icon: <Monitor size={20} />, 
      description: "Automatically match your device's display settings." 
    },
  ];

  return (
    <div className="w-full max-w-screen-2xl mx-auto flex gap-6 min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Settings</h1>
              <div className="text-sm text-gray-500">
                Personalize your dashboard experience
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content: Theme Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-medium mb-4">Appearance</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Select how the interface looks to you. This change will be applied across all dashboard tabs.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themeCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleSelectTheme(card.id)}
                      className={`relative flex flex-col items-center p-5 rounded-xl border-2 transition-all text-left ${
                        theme === card.id
                          ? "border-orange-400 bg-orange-50/50"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      {theme === card.id && (
                        <div className="absolute top-2 right-2 text-orange-500">
                          <CheckCircle2 size={18} fill="currentColor" className="text-white" />
                        </div>
                      )}
                      <div className={`mb-3 p-3 rounded-full ${theme === card.id ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {card.icon}
                      </div>
                      <span className="font-semibold text-sm mb-1">{card.label}</span>
                      <span className="text-[11px] text-gray-400 text-center leading-relaxed">
                        {card.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative Empty Section for UI consistency */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 opacity-60">
                <h3 className="text-lg font-medium mb-2 text-gray-400 italic">Advanced Settings</h3>
                <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>

            {/* Save Sidebar */}
            <aside className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 h-fit sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Update Configuration</h2>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Active Selection</div>
                  <div className="flex items-center gap-2 capitalize text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    {theme} Mode
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleSaveTheme}
                    disabled={saving}
                    className="w-full bg-orange-400 text-white py-2.5 rounded-md text-sm font-medium hover:bg-orange-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? "Saving Preferences..." : "Save Theme Settings"}
                  </button>
                  
                  {lastSaved && (
                    <p className="text-[11px] text-center text-green-600 font-medium">
                      Last updated at {lastSaved}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400">
                    Choosing "System" will automatically update your theme when your OS schedule changes.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}