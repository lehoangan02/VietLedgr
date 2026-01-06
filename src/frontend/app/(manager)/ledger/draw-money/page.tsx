'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingDown, 
  ShieldCheck, 
  QrCode, 
  Info 
} from 'lucide-react';

export default function DrawMoneyPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Hardcoded current balance for context
  const businessBalance = 500000000;

  const handleDraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    if (amount > businessBalance) {
      alert("Insufficient funds in the business account.");
      return;
    }
    
    setIsProcessing(true);
    // Simulate API call to record drawing
    setTimeout(() => {
      alert(`Withdrawal request of ${Number(amount).toLocaleString()} VND processed.`);
      setIsProcessing(false);
      router.push('/ledger/expenses'); 
    }, 1500);
  };

  return (
    <main className="flex-1 p-8 bg-gray-50/50 min-h-screen font-sans">
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
          
          {/* Left Column: Drawing Details */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                  <TrendingDown size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Draw Money</h1>
                  <p className="text-gray-500 text-sm">Withdraw capital from business account</p>
                </div>
              </div>

              <form onSubmit={handleDraw} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Withdrawal Amount (VND)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 10,000,000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-xl font-bold focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      VND
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
                  <Info className="text-blue-600 shrink-0" size={20} />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    This transaction will be recorded as <strong>Owner&apos;s Drawing</strong>. It reduces equity and decreases business liquidity.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !amount || (Number(amount) > businessBalance)}
                  className="w-full bg-gray-900 text-white rounded-2xl py-4 font-bold hover:bg-gray-800 transition shadow-xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-between px-4">
              <div className="flex items-center gap-2 text-gray-400">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Verified Request</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Wallet size={16} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Audit Trail Active</span>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code & Summary */}
          <div className="space-y-6">
            <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl text-white flex flex-col items-center text-center">
              <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                Withdrawal Receipt
              </span>
              
              <div className="bg-white p-4 rounded-3xl mb-6 shadow-inner">
                {/* QR Code Loading from public/qrcode.jpg */}
                <div className="relative w-48 h-48">
                  <Image 
                    src="/qrcode.jpg" 
                    alt="Withdrawal Verification" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold">VietLedger Liquidity Node</h3>
                <p className="text-gray-400 text-xs">Internal Drawing Reference: DL-{new Date().getTime().toString().slice(-6)}</p>
              </div>

              <div className="w-full h-px bg-white/10 my-6" />

              <div className="w-full flex justify-between items-center text-sm">
                <span className="text-gray-400">Opening Balance</span>
                <span className="font-mono">{businessBalance.toLocaleString()} VND</span>
              </div>
              <div className="w-full flex justify-between items-center text-sm mt-2">
                <span className="text-gray-400">Projected Balance</span>
                <span className={`${Number(amount) > businessBalance ? 'text-red-400' : 'text-orange-400'} font-bold font-mono`}>
                  {(businessBalance - (Number(amount) || 0)).toLocaleString()} VND
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                <QrCode size={20} />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Scanning this QR verifies the internal authorization for this withdrawal request.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}