'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface FormData {
  name: string;
  retail_category: string;
  brand: string;
  unit: string;
}

export default function EditProductPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('id');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    retail_category: '',
    brand: '',
    unit: '',
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch Product Data
  useEffect(() => {
    if (!productId) {
      setError('No product ID specified.');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/products/${productId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to fetch product');
        }
        const data = await res.json();

        setFormData({
          name: data.name || '',
          retail_category: data.retail_category || '',
          brand: data.brand || '',
          unit: data.unit || '',
        });
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:8000/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to save product');
      }

      router.push('/products');
    } catch (err: any) {
      console.error('Save error:', err);
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400 font-medium">
        Fetching product details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50/50 overflow-y-auto">
      <div className="max-w-2xl mx-auto pb-20">
        <Header pageName="Edit Product" description={`Updating ID: ${productId}`} />

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
            <input
              type="text"
              value={formData.retail_category}
              onChange={(e) => setFormData({ ...formData, retail_category: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-50">
            <button
              type="submit"
              disabled={isSaving}
              className={`flex-1 text-white py-4 rounded-xl font-bold transition shadow-lg active:scale-95 ${
                isSaving ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/products')}
              className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-xl font-bold hover:bg-gray-200 transition active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
