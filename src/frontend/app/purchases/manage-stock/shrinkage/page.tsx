'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/SideBar'
import { ArrowLeft, Trash2, AlertTriangle, Loader2 } from 'lucide-react'

export default function ShrinkagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('id')

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reduction, setReduction] = useState<number>(1)
  const [reason, setReason] = useState('Damage')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

  useEffect(() => {
    if (!productId) return
    fetch(`${FASTAPI_URL}/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
  }, [productId])

  const handleShrinkage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || reduction <= 0) return

    setIsSubmitting(true)
    try {
      // API logic to reduce stock and log loss in ledger
      // Replace with your actual PATCH/POST endpoint
      alert(`Recorded ${reduction} units lost due to ${reason}`)
      router.push('/products/manage-stock')
    } catch (err) {
      alert("Failed to update stock")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-orange-500" />
    </div>
  )

  return (
    <div className="w-full max-w-screen-2xl mx-auto flex gap-6 p-6 min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Management</span>
        </button>

        <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <Trash2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Record Inventory Shrinkage</h1>
              <p className="text-sm text-red-600">Reduce stock level due to loss or damage</p>
            </div>
          </div>

          <form onSubmit={handleShrinkage} className="p-8 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase">Product</p>
                <p className="font-semibold text-gray-800">{product.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase">Current On-Hand</p>
                <p className="font-mono font-bold text-gray-900">{product.qty} {product.unit}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quantity Lost</label>
                <input
                  type="number"
                  min="1"
                  max={product.qty}
                  value={reduction}
                  onChange={(e) => setReduction(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Reason for Loss</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all bg-white"
                >
                  <option value="Damage">Damaged / Broken</option>
                  <option value="Expiry">Expired</option>
                  <option value="Theft">Theft / Missing</option>
                  <option value="Admin Error">Administrative Error</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
              <AlertTriangle className="text-amber-600 shrink-0" size={20} />
              <p className="text-xs text-amber-700 leading-relaxed">
                This action is permanent. Adjusting shrinkage will update the <strong>General Ledger</strong> as an inventory loss expense and cannot be undone without a manual reversal.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || reduction <= 0}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 disabled:opacity-50 transition"
              >
                {isSubmitting ? 'Updating...' : 'Confirm Stock Reduction'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}