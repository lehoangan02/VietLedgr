"use client";

import React from "react";

export default function InvoicePrint({
   customerName,
   cartItems,
   subtotal,
   formatter,
   qrUrl
}: {
   customerName: string;
   cartItems: any[];
   subtotal: number;
   formatter: Intl.NumberFormat;
   qrUrl: string | null;
}) {
   return (
      <div id="invoice" className="hidden print:block p-4 text-sm text-black">
         <h2 className="text-center font-bold text-lg">HÓA ĐƠN BÁN LẺ</h2>
         <p>Ngày: {new Date().toLocaleDateString("vi-VN")}</p>
         <p>Khách hàng: {customerName}</p>

         <table className="w-full mt-4 border border-black">
            <thead>
               <tr className="border border-black">
                  <th className="border border-black p-2">Hàng Hóa</th>
                  <th className="border border-black p-2">SL</th>
                  <th className="border border-black p-2">Đ.Giá</th>
                  <th className="border border-black p-2">T.Tiền</th>
               </tr>
            </thead>

            <tbody>
               {cartItems.map((item) => {
                  const n = Number(String(item.product.price).replace(/[^0-9.-]/g, ""));
                  return (
                     <tr key={item.product.sku} className="border border-black">
                        <td className="border border-black p-2">
                           {item.product.name}
                        </td>
                        <td className="border border-black p-2 text-center">
                           {item.qty}
                        </td>
                        <td className="border border-black p-2">
                           {formatter.format(n)}
                        </td>
                        <td className="border border-black p-2">
                           {formatter.format(n * item.qty)}
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>

         <div className="mt-4">
            <p>Tổng Cộng: {formatter.format(subtotal)}</p>
            <p>Ship: $ 50</p>
            <p className="font-bold text-lg">
               Tổng Đơn: {formatter.format(subtotal + 50)}
            </p>
         </div>

         <div className="text-center mt-6">
            <img src={qrUrl || ""} className="mx-auto w-32" />
            <p className="text-xs mt-2">Quét mã để thanh toán</p>
         </div>

         <p className="mt-4 text-center text-red-600 text-lg">
            QUÝ ANH CHỊ VUI LÒNG PHẢN HỒI & THANH TOÁN KHI NHẬN ĐƯỢC ĐƠN HÀNG
         </p>
      </div>
   );
}
