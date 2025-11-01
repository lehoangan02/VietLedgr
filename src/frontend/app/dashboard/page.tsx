export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 text-white">
        <h2 className="mb-4 text-xl font-bold">Sidebar</h2>
        <ul className="space-y-2">
          <li>
            <button className="w-full rounded bg-gray-700 p-2 text-left hover:bg-gray-600">
              Button 1
            </button>
          </li>
          <li>
            <button className="w-full rounded bg-gray-700 p-2 text-left hover:bg-gray-600">
              Button 2
            </button>
          </li>
          <li>
            <button className="w-full rounded bg-gray-700 p-2 text-left hover:bg-gray-600">
              Button 3
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <h1 className="text-3xl font-bold">Main Content</h1>
        <p className="mt-4">This is the main content area.</p>
      </main>

    </div>
  );
}