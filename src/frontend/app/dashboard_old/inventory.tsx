import React, { useState, useMemo, useEffect, FormEvent, ChangeEvent } from 'react';

// --- Icon Components ---
interface IconProps { className: string; }

const SearchIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const FilterIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

const PlusIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

// --- Data Types matching your Backend ---
interface InventoryItem {
  product_id: string;
  name: string;
  retail_category: string;
  sku: string;
  description?: string;
  image_base64?: string;
}

export default function Inventory() {
  // --- State ---
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<string>('');
  const [newItemSku, setNewItemSku] = useState<string>(''); 
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // --- Data Fetching ---
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/products/');
      const data = await res.json();
      // Handle both array and paginated response structures
      setInventory(Array.isArray(data) ? data : (data.items ?? []));
    } catch (err) {
      setError('Could not connect to the server.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Derived State ---
  const categories: string[] = useMemo(() => {
    const allCats = inventory.map(item => item.retail_category).filter(Boolean);
    return ['All', ...new Set(allCats)];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => filterCategory === 'All' || item.retail_category === filterCategory)
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [inventory, searchTerm, filterCategory]);

  // --- Handlers ---
  const handleAddItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newItemName || !newItemCategory || !newItemSku) {
      setError('Name, Category, and SKU are required.');
      return;
    }

    setLoading(true);
    const payload = {
      name: newItemName,
      retail_category: newItemCategory,
      sku: newItemSku,
      description: `${newItemName} description`,
      store_id: "1cd61ba6-4943-4cf3-97de-d9e8716b3ebf" // Matching your example UUID
    };

    try {
      const res = await fetch('http://localhost:8000/api/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const addedProduct = await res.json();
        setInventory(prev => [addedProduct, ...prev]);
        setNewItemName('');
        setNewItemCategory('');
        setNewItemSku('');
        setError('');
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Failed to create product.');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory Management</h1>

        {/* Search & Filter */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Items</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><FilterIcon className="h-5 w-5 text-gray-400" /></div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Product</h2>
          <form onSubmit={handleAddItem}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input type="text" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="e.g. FOOD" className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input type="text" value={newItemSku} onChange={(e) => setNewItemSku(e.target.value)} placeholder="e.g. RICE_5KG" className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
              >
                <PlusIcon className="h-5 w-5 mr-2 -ml-1" />
                {loading ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {item.image_base64 ? (
                        <img 
                          src={`data:image/png;base64,${item.image_base64}`} 
                          alt={item.name} 
                          className="h-10 w-10 rounded-md object-cover" 
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.retail_category}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">{item.sku}</td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No items found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}