import React from 'react';
import { Sale, Product, Customer, StoreSettings, PaymentType, Employee } from '../types.ts';
import QRCode from './QRCode.tsx';

interface PrintableReceiptProps {
  sale: Sale | null;
  products: Product[];
  customer: Customer | null;
  settings: StoreSettings | null;
  seller?: Employee | null;
}

const paymentTypeLabels: { [key in PaymentType]: string } = {
    [PaymentType.CASH]: "Naqd",
    [PaymentType.CARD]: "Plastik karta",
    [PaymentType.TRANSFER]: "O'tkazma",
    [PaymentType.DEBT]: "Nasiya"
};

const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(
    ({ sale, products, customer, settings, seller }, ref) => {
    if (!sale || !settings) return null;

    const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Noma\'lum mahsulot';

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('uz-UZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    // Calculate totals for summary
    const subtotal = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discount = Number(sale.discount) || 0;
    const total = Number(sale.total) || 0;

    // Format store name with location information
    const getStoreDisplayName = () => {
      if (settings.location) {
        return `${settings.name} (${settings.location} lokatsiya)`;
      }
      return settings.name;
    };

    // Format address with "Dehqon bozor yoni"
    const getFormattedAddress = () => {
      if (settings.address) {
        return `Dehqon bozor yoni, ${settings.address}`;
      }
      return "Dehqon bozor yoni";
    };

    return (
      <div id="printable-receipt" ref={ref} className="p-4 bg-white text-black font-sans text-sm w-[288px]">
        {/* Header with enhanced styling */}
        <div className="text-center mb-3">
          {/* Benazir text */}
          <div className="mb-2 flex items-center justify-center">
            <div className="text-xs text-gray-600 font-medium">Benazir</div>
          </div>
          
          {settings.receiptShowStoreName && (
            <h2 className="font-bold text-xl mb-2 uppercase tracking-wide">{getStoreDisplayName()}</h2>
          )}
          {settings.receiptShowAddress && (
            <p className="text-sm mb-1">{getFormattedAddress()}</p>
          )}
          {settings.receiptShowPhone && settings.phone && (
            <p className="text-sm mb-1">Tel: {settings.phone}</p>
          )}
          {settings.receiptHeader && (
            <div className="border-t border-dashed border-gray-400 my-2 pt-2">
              <p className="text-sm italic">{settings.receiptHeader}</p>
            </div>
          )}
        </div>

        {/* Receipt Details with better organization */}
        <div className="mb-3 bg-gray-100 p-2 rounded-lg border border-gray-200">
          {settings.receiptShowChekId && (
            <p className="text-sm mb-1 flex justify-between">
              <span className="font-semibold">Chek #:</span>
              <span className="font-mono">#{sale.id.slice(-6)}</span>
            </p>
          )}
          {settings.receiptShowDate && (
            <p className="text-sm mb-1 flex justify-between">
              <span className="font-semibold">Sana:</span>
              <span>{formatDate(sale.date)}</span>
            </p>
          )}
          {settings.receiptShowSeller && seller && (
            <p className="text-sm mb-1 flex justify-between">
              <span className="font-semibold">Sotuvchi:</span>
              <span>{seller.name}</span>
            </p>
          )}
          {/* Customer information - always show either customer name or "Umumiy" */}
          <p className="text-sm flex justify-between">
            <span className="font-semibold">Mijoz:</span>
            <span>{customer ? customer.name : 'Umumiy mijoz'}</span>
          </p>
        </div>

        {/* Products Section with improved table - original layout with proper spacing */}
        <div className="mb-3">
          <div className="border-t border-dashed border-gray-400 pt-2">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dashed border-gray-300">
                  <th className="text-left pb-1 text-sm font-bold text-gray-700">MAHSULOT</th>
                  <th className="text-right pb-1 text-sm font-bold text-gray-700">MIQDOR</th>
                  <th className="text-right pb-1 text-sm font-bold text-gray-700">NARX</th>
                  <th className="text-right pb-1 text-sm font-bold text-gray-700">SUMMA</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={item.product.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="text-left py-2 text-sm w-1/2 align-top">
                      <div className="font-medium">{getProductName(item.product.id)}</div>
                    </td>
                    <td className="text-right py-2 text-sm align-top">{item.quantity}</td>
                    <td className="text-right py-2 text-sm align-top">{item.price.toLocaleString()}</td>
                    <td className="text-right py-2 text-sm align-top font-medium">
                      {(item.quantity * item.price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section with better formatting */}
        <div className="mb-3 border-t border-dashed border-gray-400 pt-2">
          <div className="flex justify-between mb-1 text-base">
            <span>Jami:</span>
            <span className="font-medium">{subtotal.toLocaleString()} {settings.currency}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between mb-1 text-red-600 text-base">
              <span>Chegirma:</span>
              <span className="font-medium">-{discount.toLocaleString()} {settings.currency}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t border-dashed border-gray-400 pt-1 mt-1">
            <span>To'lash uchun:</span>
            <span className="text-xl">{total.toLocaleString()} {settings.currency}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-3 border-t border-dashed border-gray-400 pt-2">
          <p className="font-bold mb-2 text-center text-lg">TO'LOVLAR</p>
          {sale.payments.map((p, index) => (
            <div key={index} className="flex justify-between mb-1 bg-gray-50 p-1 rounded">
              <span className="text-sm">{paymentTypeLabels[p.type]}:</span>
              <span className="font-medium text-base">{p.amount.toLocaleString()} {settings.currency}</span>
            </div>
          ))}
        </div>

        {/* Footer with QR Code */}
        <div className="text-center border-t border-dashed border-gray-400 pt-3">
          {settings.receiptFooter && (
            <p className="text-sm mb-3 italic">{settings.receiptFooter}</p>
          )}
          {settings.receiptShowQR && (
            <div className="mb-3">
              <QRCode
                saleId={sale.id}
                storeId={settings.id}
                totalAmount={Number(sale.total)}
                date={sale.date}
              />
            </div>
          )}
          <div className="text-sm">
            <p className="font-semibold">Haridingiz uchun rahmat!</p>
            <p className="mt-1 italic">Yana kutib qolamiz</p>
          </div>
        </div>
      </div>
    );
  }
);

export default PrintableReceipt;