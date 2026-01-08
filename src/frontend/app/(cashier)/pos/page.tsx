"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import InvoicePrint from "@/components/InvoicePrint";
import { postTransactionOrder } from "@/lib/fast-api/transactions";
import { postLogout } from "@/lib/fast-api/auth";
import { useRouter } from "next/navigation";

type Product = {
  sku: string;
  name: string;
  img?: string;
  category: string;
  brand: string;
  unit: string;
  priceNum: number;
  qty: number;
  orders: number;
  expectedOutDays: number;
  warehouse_id: string;
  createdBy?: { name: string; avatar?: string };
};

interface ProductInfo {
  product_id: string;
  name: string;
  retail_category: string;
  brand?: string;
  unit?: string;
  image_base64?: string;
}

interface BatchItem {
  batch_id: string;
  product_id: string;
  warehouse_id: string;
  stock: number;
  cost: number;
  sale_price: number;
  import_date: string;
  expire_date: string;
  supplier_name: string;
  created_at: string;
  updated_at: string;
}

interface Warehouse {
  warehouse_id: string;
  name: string;
  location: string;
}

interface Store {
  id: string;
  name: string;
}

type CartItem = {
  product: Product;
  qty: number;
};

function daysUntil(dateStr?: string) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 0;
  const today = new Date();
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = data?.detail || `Request failed: ${res.status}`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

export default function PosPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const cartItems = useMemo(() => Object.values(cart), [cart]);

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [productsInfo, setProductsInfo] = useState<ProductInfo[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    null,
  );

  const [store, setStore] = useState<Store | null>(null);

  const refreshBatches = useCallback(async () => {
    try {
      const batchesData = await fetchJson<
        BatchItem[] | { items?: BatchItem[] }
      >("/api/batches");
      const batchItems = Array.isArray(batchesData)
        ? batchesData
        : (batchesData.items ?? []);
      setBatches(batchItems);
    } catch (e: any) {
      if (e?.status === 401) router.push("/login");
      throw e;
    }
  }, [router]);

  const loadInit = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [storesData, warehousesData, productsData] = await Promise.all([
        fetchJson<Store[] | Store>("/api/stores?mine=true"),
        fetchJson<Warehouse[] | { items?: Warehouse[] }>("/api/warehouses"),
        fetchJson<ProductInfo[] | { items?: ProductInfo[] }>("/api/products"),
      ]);

      const storesList = Array.isArray(storesData) ? storesData : [storesData];
      setStore(storesList[0] ?? null);

      const whItems = Array.isArray(warehousesData)
        ? warehousesData
        : (warehousesData.items ?? []);
      setWarehouses(whItems);
      setSelectedWarehouse((prev) => prev ?? whItems[0]?.warehouse_id ?? null);

      const prodItems = Array.isArray(productsData)
        ? productsData
        : (productsData.items ?? []);
      setProductsInfo(prodItems);

      await refreshBatches();
    } catch (e: any) {
      if (e?.status === 401) router.push("/login");
      setError(e?.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [refreshBatches, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadInit();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadInit]);

  const productMap = useMemo(() => {
    const map: Record<string, ProductInfo> = {};
    for (const p of productsInfo) map[p.product_id] = p;
    return map;
  }, [productsInfo]);

  const products: Product[] = useMemo(() => {
    return batches.map((batch) => {
      const info = productMap[batch.product_id];
      const priceNum = Number(batch.sale_price) || 0;

      return {
        sku: batch.batch_id,
        name: info?.name || batch.supplier_name || "",
        img: info?.image_base64,
        category: info?.retail_category || "",
        brand: info?.brand || "",
        unit: info?.unit || "",
        priceNum,
        qty: batch.stock ?? 0,
        orders: 0,
        expectedOutDays: daysUntil(batch.expire_date),
        warehouse_id: batch.warehouse_id,
        createdBy: batch.supplier_name
          ? { name: batch.supplier_name }
          : undefined,
      };
    });
  }, [batches, productMap]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchWarehouse =
        !selectedWarehouse || p.warehouse_id === selectedWarehouse;
      const matchCategory = !category || p.category === category;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      return matchWarehouse && matchCategory && matchQuery;
    });
  }, [products, selectedWarehouse, category, query]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    [],
  );

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + it.product.priceNum * it.qty, 0);
  }, [cartItems]);

  const addToCart = useCallback((prod: Product) => {
    setCart((prev) => {
      const existing = prev[prod.sku];
      const nextQty = existing ? existing.qty + 1 : 1;
      return { ...prev, [prod.sku]: { product: prod, qty: nextQty } };
    });
  }, []);

  const removeFromCart = useCallback((sku: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[sku];
      return copy;
    });
  }, []);

  const changeQty = useCallback((sku: string, qty: number) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (!copy[sku]) return prev;
      if (qty <= 0) delete copy[sku];
      else copy[sku].qty = qty;
      return copy;
    });
  }, []);

  const handleSetPayment = useCallback((method: string) => {
    setPaymentMethod((prev) => (prev === method ? null : method));
    setQrUrl(null);
  }, []);

  const generateQR = useCallback((total: number, print?: boolean) => {
    const bankBin = "970418";
    const accountNumber = "5660567183";
    const description = encodeURIComponent("Payment");
    const url = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-qr_only.png?amount=${Math.round(
      total,
    )}&addInfo=${description}`;
    setQrUrl(url);
    if (!print) setPaymentMethod("qr");
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await postLogout();
    } finally {
      router.push("/login");
    }
  }, [router]);

  const handleVoid = useCallback(() => {
    setCart({});
    setPaymentMethod(null);
    setQrUrl(null);
    toast.error("Order has been removed!", { position: "top-right" });
  }, []);

  const handlePayment = useCallback(async () => {
    if (cartItems.length === 0) {
      toast.warning("Cart is empty!", { position: "top-right" });
      return;
    }

    try {
      const storeIdToUse = store?.id;
      if (!storeIdToUse) {
        toast.error("No store available for this user");
        return;
      }

      const items = cartItems.map((it) => ({
        batch_id: it.product.sku,
        quantity: it.qty,
        price_at_sale: it.product.priceNum,
      }));

      await postTransactionOrder(storeIdToUse, items);

      const purchased = new Map<string, number>();
      for (const it of cartItems) {
        purchased.set(
          it.product.sku,
          (purchased.get(it.product.sku) ?? 0) + it.qty,
        );
      }
      setBatches((prev) =>
        prev.map((b) => {
          const dec = purchased.get(b.batch_id);
          if (!dec) return b;
          return { ...b, stock: Math.max(0, (b.stock ?? 0) - dec) };
        }),
      );

      toast.success("Payment successful!", { position: "top-right" });
      setCart({});
      setPaymentMethod(null);
      setQrUrl(null);

      await refreshBatches();
    } catch (err: any) {
      toast.error("Payment failed: " + (err?.message || "Unknown error"), {
        position: "top-right",
      });
    }
  }, [cartItems, store, refreshBatches]);

  const handlePrint = () => window.print();

  if (error) return <div className="text-red-500">{error}</div>;
  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />
      <div className="w-full max-w-7xl mx-auto flex gap-6">
        <div className="flex-1 grid grid-cols-12 gap-6">
          <section className="col-span-8">
            <div className="mb-4 mt-4 flex items-center gap-4">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-1.85z"
                    />
                  </svg>
                </span>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search product code or name..."
                  className="border rounded px-4 py-2 pl-10 w-full"
                />
              </div>

              <div>
                <select
                  className="border rounded px-3 py-2 w-56"
                  value={selectedWarehouse ?? ""}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                >
                  {warehouses.map((wh) => (
                    <option key={wh.warehouse_id} value={wh.warehouse_id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => setCategory(null)}
                className={`px-3 py-2 rounded ${category === null
                  ? "bg-orange-500 text-white"
                  : "bg-white border"
                  }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory((prev) => (prev === c ? null : c))}
                  className={`px-3 py-2 rounded ${category === c
                    ? "bg-orange-500 text-white"
                    : "bg-white border"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.sku}
                  className="bg-white border rounded-lg p-3 hover:shadow cursor-pointer"
                  onClick={() => addToCart(p)}
                >
                  <div className="h-36 flex items-center justify-center">
                    {p.img && p.img.trim() !== "" && (
                      <img
                        src={
                          p.img.startsWith('data:image') ? p.img : `data:image/png;base64,${p.img}`
                        }
                        alt={p.name}
                        className="max-h-32 object-contain"
                      />
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-800">
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-400">{p.sku}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-pink-600 font-semibold">
                        {p.qty} Remaining Items
                      </div>
                      <div className="text-sm text-green-600 font-semibold">
                        {formatter.format(p.priceNum)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="col-span-4">
            <div className="bg-white border rounded-lg shadow p-4 mt-4 flex flex-col h-screen">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    Order List - {store ? store.name : ""}
                  </h3>
                  <div className="text-xs text-gray-400 mb-3">Id : #0</div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md border text-sm font-medium bg-red-400 hover:bg-red-500"
                >
                  Logout
                </button>
              </div>

              <div className="flex-1 min-h-0 mb-3 mt-3">
                <div className="space-y-2 overflow-auto pr-2 h-full">
                  {cartItems.length === 0 && (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      No Products Selected
                    </div>
                  )}

                  {cartItems.map((it) => (
                    <div
                      key={it.product.sku}
                      className="flex items-center gap-3 border-b pb-2"
                    >
                      <img
                        src={
                          it.product.img
                            ? it.product.img.startsWith("http")
                              ? it.product.img
                              : `data:image/png;base64,${it.product.img}`
                            : ""
                        }
                        alt={it.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {it.product.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {it.product.sku}
                        </div>
                        <div className="text-sm text-green-600">
                          {formatter.format(it.product.priceNum)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={(e) =>
                            changeQty(
                              it.product.sku,
                              Math.max(1, Number(e.target.value || 1)),
                            )
                          }
                          className="w-16 border rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => removeFromCart(it.product.sku)}
                          className="text-red-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-700 border-t pt-4 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatter.format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatter.format(0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Grand Total</span>
                    <span>{formatter.format(subtotal)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-700">
                    Payment Method
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleSetPayment("cash")}
                      className={`px-3 py-2 border-2 border-gray-200 rounded-md text-sm font-medium ${paymentMethod === "cash"
                        ? "bg-orange-500 text-white border-orange-500"
                        : "text-gray-700 hover:border-blue-400 hover:text-blue-600"
                        }`}
                    >
                      Cash
                    </button>

                    <button
                      onClick={() => handleSetPayment("debit")}
                      className={`px-3 py-2 border-2 border-gray-200 rounded-md text-sm font-medium ${paymentMethod === "debit"
                        ? "bg-orange-500 text-white border-orange-500"
                        : "text-gray-700 hover:border-blue-400 hover:text-blue-600"
                        }`}
                    >
                      Debit Card
                    </button>

                    <button
                      onClick={() => {
                        handleSetPayment("qr");
                        generateQR(subtotal, false);
                      }}
                      className={`px-3 py-2 border-2 border-gray-200 rounded-md text-sm font-medium ${paymentMethod === "qr"
                        ? "bg-orange-500 text-white border-orange-500"
                        : "text-gray-700 hover:border-blue-400 hover:text-blue-600"
                        }`}
                    >
                      Scan QR
                    </button>
                  </div>

                  {qrUrl && (
                    <div className="mt-2 flex justify-center">
                      <img
                        src={qrUrl}
                        alt="VietQR"
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-gray-800 text-white font-semibold text-center py-2 rounded">
                  Grand Total : {formatter.format(subtotal)}
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium"
                    onClick={() => {
                      handlePrint();
                      generateQR(subtotal, true);
                    }}
                  >
                    Print
                  </button>
                  <button
                    onClick={handleVoid}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-medium"
                  >
                    Void
                  </button>
                  <button
                    onClick={handlePayment}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium"
                  >
                    Payment
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <InvoicePrint
            customerName="Walk-in"
            cartItems={cartItems}
            subtotal={subtotal}
            formatter={formatter}
            qrUrl={qrUrl}
          />
        </div>
      </div>
    </>
  );
}
