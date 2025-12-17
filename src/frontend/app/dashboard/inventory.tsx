import React, { useState, useMemo, FormEvent, ChangeEvent } from 'react';

// --- Icon Components (using inline SVG for single-file compatibility) ---

interface IconProps {
  className: string;
}

const SearchIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const PlusIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// --- Data Types and Mock Data ---
interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', quantity: 15 },
  { id: 2, name: 'Wireless Mouse', category: 'Electronics', quantity: 120 },
  { id: 3, name: 'Classic T-Shirt', category: 'Apparel', quantity: 300 },
  { id: 4, name: 'Leather Wallet', category: 'Accessories', quantity: 75 },
  { id: 5, name: 'Coffee Mug', category: 'Homeware', quantity: 200 },
  { id: 6, name: 'Running Shoes', category: 'Apparel', quantity: 50 },
  { id: 7, name: 'Smartphone TX', category: 'Electronics', quantity: 40 },
];

// --- Main App Component ---
export default function Inventory() {
  // --- State ---
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  // State for the "Add Item" form
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>(''); // Keep as string for input field
  const [error, setError] = useState<string>('');

  // --- Derived State & Logic ---

  // Get unique categories for the filter dropdown
    const categories: string[] = useMemo(() => {
        const allCategories = inventory.map(item => item.category);
        return ['All', ...new Set(allCategories)];
    }, [inventory]);

  // Filter the inventory based on search and category
  const filteredInventory: InventoryItem[] = useMemo(() => {
    return inventory
      .filter(item => {
        // Category filter
        return filterCategory === 'All' || item.category === filterCategory;
      })
      .filter(item => {
        // Search term filter (case-insensitive)
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [inventory, searchTerm, filterCategory]);

  // --- Event Handlers ---
  const handleAddItem = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newItemName || !newItemCategory || !newItemQuantity) {
      setError('All fields are required.');
      return;
    }
    
    const newId = Math.max(...inventory.map(item => item.id), 0) + 1;
    const newItem: InventoryItem = {
      id: newId,
      name: newItemName,
      category: newItemCategory,
      quantity: parseInt(newItemQuantity, 10),
    };

    setInventory(prevInventory => [newItem, ...prevInventory]);

    // Reset form
    setNewItemName('');
    setNewItemCategory('');
    setNewItemQuantity('');
    setError('');
  };

  // --- JSX ---
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Inventory Management
        </h1>

        {/* --- Region 1: Search & Filter --- */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Search Bar */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Items
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  placeholder="Search by item name..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Filter Dropdown */}
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FilterIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="filter"
                  value={filterCategory}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
                  className="block w-full appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* --- Region 2: Add Item Feature --- */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Item</h2>
          <form onSubmit={handleAddItem}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Item Name */}
              <div className="md:col-span-2">
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  id="itemName"
                  value={newItemName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItemName(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Wireless Keyboard"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  id="itemCategory"
                  value={newItemCategory}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItemCategory(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Electronics"
                />
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  id="itemQuantity"
                  value={newItemQuantity}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItemQuantity(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 50"
                  min="0"
                />
              </div>
            </div>
            
            {/* Error Message & Submit Button */}
            <div className="flex items-center justify-between mt-4">
              <div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2 -ml-1" />
                Add Item
              </button>
            </div>
          </form>
        </div>

        {/* --- Region 3: Items List (Satisfies Search) --- */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Inventory List</h2>
          </div>
          
          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Item Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    {/* No Results Row */}
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-12 text-center text-sm text-gray-500"
                      >
                        No items found matching your criteria.
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}