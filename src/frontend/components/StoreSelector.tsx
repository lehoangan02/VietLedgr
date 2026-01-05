"use client";
import React, { useEffect, useState } from "react";

type Store = { id: string; name: string };

export default function StoreSelector({ selected, onChange }: { selected?: string; onChange: (id: string) => void }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStores(data);
          if (!selected && data.length > 0) {
            const s = data[0];
            onChange(s.id || s.store_id || s.id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-semibold text-gray-500">Store</label>
      <select
        className="p-2 bg-white border rounded-lg text-sm"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        {stores.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
