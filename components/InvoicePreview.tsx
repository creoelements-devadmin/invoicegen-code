import React from 'react';
import { InvoiceData } from '../types';

interface Props {
  data: InvoiceData;
  id: string;
}

const InvoicePreview: React.FC<Props> = ({ data, id }) => {
  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('₹', ''); 
  };

  // Calculations based on GST mode
  let subtotal = 0;
  let totalTax = 0;
  let totalAmount = 0;

  if (data.gstMode === 'exclusive') {
    // Exclusive: Amount is before GST, add GST on top
    subtotal = data.items.reduce((acc, item) => acc + item.value, 0);
    totalTax = data.items.reduce((acc, item) => acc + (item.value * (item.gstRate / 100)), 0);
    totalAmount = subtotal + totalTax;
  } else {
    // Inclusive: Amount includes GST, calculate in reverse
    totalAmount = data.items.reduce((acc, item) => acc + item.value, 0);
    // For inclusive GST: base = total / (1 + gstRate/100)
    subtotal = data.items.reduce((acc, item) => {
      const base = item.value / (1 + item.gstRate / 100);
      return acc + base;
    }, 0);
    totalTax = totalAmount - subtotal;
  }
  
  // Calculate aggregate CGST/SGST for the total row
  // Assuming split is 50/50 for all items
  const totalCGST = totalTax / 2;
  const totalSGST = totalTax / 2;

  return (
    <div className="w-full flex justify-center bg-gray-200 p-4 md:p-8 overflow-x-auto">
      {/* A4 Container */}
      <div 
        id={id}
        className="bg-white relative shadow-2xl mx-auto flex-shrink-0"
        style={{ width: '210mm', height: '297mm', padding: '0', overflow: 'hidden' }}
      >
        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col h-full" style={{ height: '297mm' }}>
          
          {/* Header Section */}
          <div className="px-12 pt-10 pb-4">
            <div className="flex flex-col items-start mb-6">
              {/* Logo */}
              {data.visibility.logo && (
              <div className="mb-4 h-20 flex items-center">
                 {data.logoUrl ? (
                    <img 
                      src={data.logoUrl} 
                      alt="Company Logo" 
                      className="h-full object-contain max-w-[250px]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.logo-error')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'logo-error text-sm text-red-500 border border-red-300 p-2 rounded';
                          errorDiv.textContent = 'Logo failed to load';
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                 ) : (
                    <div className="text-2xl font-bold text-gray-300 border-2 border-dashed border-gray-300 p-4 rounded">No Logo</div>
                 )}
              </div>
              )}

              {data.visibility.title && (
                <h1 className="text-4xl font-bold text-gray-900 mt-4 uppercase tracking-wide">{data.title}</h1>
              )}
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="text-sm">
                {data.visibility.date && (
                  <p><span className="font-bold text-gray-900">Date:</span> <span className="text-gray-700 ml-2">{data.date}</span></p>
                )}
              </div>
              <div className="text-sm text-right">
                {data.visibility.invoiceNo && data.invoiceType !== 'PROFORMA' && (
                  <p><span className="font-bold text-gray-900">Invoice no:</span> <span className="text-gray-700 ml-2">{data.invoiceNo}</span></p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-start mb-8">
              <div className="w-[45%]">
                {data.visibility.billedTo && (
                  <>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">Billed to:</h3>
                    <p className="font-medium text-gray-800 text-sm">{data.billedTo.name}</p>
                    <p className="text-gray-600 whitespace-pre-line text-sm leading-relaxed">{data.billedTo.address}</p>
                    <p className="text-gray-600 text-sm mt-1">GST - {data.billedTo.gst}</p>
                  </>
                )}
              </div>

              <div className="w-[45%]">
                {data.visibility.from && (
                  <>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">From:</h3>
                    <p className="font-medium text-gray-800 text-sm">{data.from.name}</p>
                    <p className="text-gray-600 whitespace-pre-line text-sm leading-relaxed">{data.from.address}</p>
                    <p className="text-gray-600 text-sm mt-1">GST - {data.from.gst}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="flex-grow px-12">
            <div className="w-full mb-8">
                {/* Header */}
                <div className="flex bg-[#e6fffa] py-2 px-2 border-b border-gray-200 items-end">
                    <div className="w-[34%] font-bold text-gray-900 text-sm pb-1">Product</div>
                    <div className="w-[14%] font-bold text-gray-900 text-right text-sm pb-1">Value</div>
                    <div className="w-[10%] font-bold text-gray-900 text-center text-sm pb-1">HSN</div>
                    
                    {/* Split GST Headers */}
                    <div className="w-[11%] font-bold text-gray-900 text-right text-sm leading-tight pb-1">CGST</div>
                    <div className="w-[11%] font-bold text-gray-900 text-right text-sm leading-tight pb-1">SGST</div>
                    
                    <div className="w-[20%] font-bold text-gray-900 text-right text-sm pb-1">Amount</div>
                </div>

                {/* Rows */}
                {data.items.map((item) => {
                    let baseValue, gstAmt, total;
                    
                    if (data.gstMode === 'exclusive') {
                      // Exclusive: item.value is base, add GST
                      baseValue = item.value;
                      gstAmt = item.value * (item.gstRate / 100);
                      total = item.value + gstAmt;
                    } else {
                      // Inclusive: item.value is total, calculate base and GST
                      total = item.value;
                      baseValue = item.value / (1 + item.gstRate / 100);
                      gstAmt = total - baseValue;
                    }
                    
                    const halfRate = item.gstRate / 2;
                    const halfAmt = gstAmt / 2;
                    
                    return (
                        <div key={item.id} className="flex py-3 px-2 border-b border-gray-100 items-start">
                             <div className="w-[34%] text-gray-800 text-sm font-medium pr-2">{item.description}</div>
                             <div className="w-[14%] text-gray-700 text-right text-sm pt-0.5">{formatCurrency(baseValue)}</div>
                             <div className="w-[10%] text-gray-700 text-center text-sm pt-0.5">{item.hsn}</div>
                             
                             {/* CGST Cell */}
                             <div className="w-[11%] text-gray-700 text-right text-sm pt-0.5 flex flex-col items-end">
                                <span className="text-[11px] text-gray-500">{halfRate}%</span>
                                <span>{formatCurrency(halfAmt)}</span>
                             </div>

                             {/* SGST Cell */}
                             <div className="w-[11%] text-gray-700 text-right text-sm pt-0.5 flex flex-col items-end">
                                <span className="text-[11px] text-gray-500">{halfRate}%</span>
                                <span>{formatCurrency(halfAmt)}</span>
                             </div>

                             <div className="w-[20%] text-gray-800 text-right text-sm font-semibold pt-0.5">{formatCurrency(total)}</div>
                        </div>
                    );
                })}

                {/* Total Row */}
                <div className="flex py-3 px-2 border-t-2 border-gray-200 mt-2">
                    <div className="w-[34%] text-gray-900 font-bold text-sm">Total</div>
                    <div className="w-[14%] text-gray-900 font-bold text-right text-sm">{formatCurrency(subtotal)}</div>
                    <div className="w-[10%]"></div>
                    <div className="w-[11%] text-gray-900 font-bold text-right text-sm">{formatCurrency(totalCGST)}</div>
                    <div className="w-[11%] text-gray-900 font-bold text-right text-sm">{formatCurrency(totalSGST)}</div>
                    <div className="w-[20%] text-gray-900 font-bold text-right text-sm">{formatCurrency(totalAmount)}</div>
                </div>
            </div>

            {/* Bank Details & Footer Info */}
            <div className="mt-8 mb-12">
                {data.visibility.paymentMethod && (
                  <p className="font-bold text-gray-900 mb-3 text-sm">Payment method: <span className="font-normal">{data.paymentMethod}</span></p>
                )}
                
                {data.visibility.bankDetails && (
                  <div className="text-sm text-gray-700 space-y-1.5 leading-snug">
                      <p>Account name - <span className="font-medium">{data.bankDetails.accountName}</span></p>
                      <p>Bank - <span className="font-medium">{data.bankDetails.bankName}</span></p>
                      <p>A/c no. - <span className="font-medium">{data.bankDetails.accountNo}</span></p>
                      <p>IFSC - <span className="font-medium">{data.bankDetails.ifsc}</span></p>
                      <p>A/c type - <span className="font-medium">{data.bankDetails.accountType}</span></p>
                  </div>
                )}

                {data.visibility.udyam && (
                  <div className="mt-6 text-sm text-gray-800 font-semibold tracking-wide">
                      {data.udyam}
                  </div>
                )}
            </div>
          </div>

          {/* Footer Text & Curve */}
          <div className="mt-auto relative">
             <div className="px-12 mb-20 relative z-20">
                <p className="text-[10px] text-gray-500 max-w-[80%] leading-tight">
                    We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                    This is a computer generated invoice, no signature required.
                </p>
             </div>

             {/* SVG Curve Background */}
             <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                <svg
                    className="relative block w-full h-[140px]"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0,40 C350,110 750,-10 1200,50 L1200,120 L0,120 Z"
                        fill="#38b2ac" 
                        opacity="0.9"
                    />
                </svg>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;