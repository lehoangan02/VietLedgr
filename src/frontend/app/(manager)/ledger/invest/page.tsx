'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  QrCode, 
  Info 
} from 'lucide-react';

export default function InvestPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Hardcoded current balance for context
  const businessBalance = 500000000;

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      alert(`Investment request of ${Number(amount).toLocaleString()} VND submitted successfully.`);
      setIsProcessing(false);
      router.push('/expenses'); // Redirect back to financial overview
    }, 1500);
  };

  return (
    <main className="flex-1 p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition mb-6 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Ledger</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Investment Details */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Add Investment</h1>
                  <p className="text-gray-500 text-sm">Inject capital into business operations</p>
                </div>
              </div>

              <form onSubmit={handleInvest} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Investment Amount (VND)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 50,000,000"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xl font-bold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      VND
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
                  <Info className="text-blue-600 shrink-0" size={20} />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    This investment will be recorded as <strong>Owner&apos;s Equity</strong> and will increase the <strong>Business Account</strong> liquidity immediately after confirmation.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !amount}
                  className="w-full bg-gray-900 text-white rounded-2xl py-4 font-bold hover:bg-gray-800 transition shadow-xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Confirming...' : 'Confirm Investment'}
                </button>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-between px-4">
              <div className="flex items-center gap-2 text-gray-400">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Secure Ledger</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Wallet size={16} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Direct Deposit</span>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code & Summary */}
          <div className="space-y-6">
            <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl text-white flex flex-col items-center text-center">
              <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                Scan to Transfer
              </span>
              
              <div className="bg-white p-4 rounded-3xl mb-6 shadow-inner">
                {/* QR Code Loading from public/qrcode.jpg */}
                <div className="relative w-48 h-48">
                  <Image 
                    src="/qrcode.jpg" 
                    alt="Investment QR Code" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold">VietLedger Business Node</h3>
                <p className="text-gray-400 text-xs">Account: 1903 XXXX XXXX 012</p>
              </div>

              <div className="w-full h-px bg-white/10 my-6" />

              <div className="w-full flex justify-between items-center text-sm">
                <span className="text-gray-400">Current Balance</span>
                <span className="font-mono">{businessBalance.toLocaleString()} VND</span>
              </div>
              <div className="w-full flex justify-between items-center text-sm mt-2">
                <span className="text-gray-400">New Balance</span>
                <span className="text-green-400 font-bold font-mono">
                  {(businessBalance + (Number(amount) || 0)).toLocaleString()} VND
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="h-10 w-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                <QrCode size={20} />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Once the transfer is complete, our system will automatically update the ledger entries.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}