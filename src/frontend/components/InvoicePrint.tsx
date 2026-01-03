"use client";

import React from "react";

export default function InvoicePrint({
   customerName,
   cartItems,
   subtotal,
   formatter,
   qrUrl,
}: {
   customerName: string;
   cartItems: any[];
   subtotal: number;
   formatter: Intl.NumberFormat;
   qrUrl: string | null;
}) {
   return (
      <div
         id="invoice"
         className="hidden print:block text-black text-sm"
      >
         {/* Page wrapper */}
         <div className="mx-auto max-w-[700px] px-10 py-8">
            {/* Header */}
            <div className="text-center mb-6">
               <h1 className="text-2xl font-bold tracking-wide">
                  RETAIL INVOICE
               </h1>
               <div className="mt-2 text-sm">
                  <p>Date: {new Date().toLocaleDateString("en-GB")}</p>
                  <p>
                     Customer: <span className="font-medium">{customerName}</span>
                  </p>
               </div>
            </div>

            {/* Table */}
            <table className="w-full border border-black border-collapse">
               <thead>
                  <tr className="bg-gray-100">
                     <th className="border border-black px-3 py-2 text-left">
                        Product
                     </th>
                     <th className="border border-black px-3 py-2 text-center w-16">
                        Qty
                     </th>
                     <th className="border border-black px-3 py-2 text-right w-32">
                        Unit Price
                     </th>
                     <th className="border border-black px-3 py-2 text-right w-32">
                        Total
                     </th>
                  </tr>
               </thead>

               <tbody>
                  {cartItems.map((item) => {
                     const price = Number(
                        String(item.product.price).replace(/[^0-9.-]/g, "")
                     );

                     return (
                        <tr key={item.product.sku}>
                           <td className="border border-black px-3 py-2">
                              {item.product.name}
                           </td>
                           <td className="border border-black px-3 py-2 text-center">
                              {item.qty}
                           </td>
                           <td className="border border-black px-3 py-2 text-right">
                              {formatter.format(price)}
                           </td>
                           <td className="border border-black px-3 py-2 text-right">
                              {formatter.format(price * item.qty)}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
               <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between">
                     <span>Subtotal:</span>
                     <span>{formatter.format(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                     <span>Shipping:</span>
                     <span>$50.00</span>
                  </div>

                  <div className="flex justify-between border-t border-black pt-2 font-bold text-base">
                     <span>Grand Total:</span>
                     <span>{formatter.format(subtotal + 50)}</span>
                  </div>
               </div>
            </div>

            {/* QR */}
            {qrUrl && (
               <div className="mt-8 text-center">
                  <img
                     src={qrUrl}
                     alt="QR Payment"
                     className="mx-auto w-32 h-32"
                  />
                  <p className="mt-2 text-xs text-gray-700">
                     Scan QR code to pay
                  </p>
               </div>
            )}

            {/* Footer notice */}
            <div className="mt-8 text-center">
               <p className="text-red-600 font-semibold text-base">
                  PLEASE RESPOND & PAY UPON RECEIPT OF THE ORDER
               </p>
            </div>
         </div>
      </div>
   );
}
