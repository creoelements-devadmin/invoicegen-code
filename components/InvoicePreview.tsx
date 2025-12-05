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

  // Default to CGST_SGST if not specified
  const gstType = data.gstType || 'CGST_SGST';

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
    <div className="w-full flex justify-center bg-white p-4 md:p-8 overflow-x-auto">
      {/* A4 Container */}
      <div 
        id={id}
        className="bg-white relative shadow-2xl mx-auto flex-shrink-0"
        style={{ width: '210mm', height: '297mm', padding: '0', overflow: 'hidden', fontFamily: 'Helvetica, Arial, sans-serif' }}
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
                    <div className="text-xl font-bold text-black border-2 border-dashed border-black p-3 rounded">No Logo</div>
                 )}
              </div>
              )}

              {data.visibility.title && (
                <h1 className="text-2xl font-bold text-black mt-4 uppercase tracking-wide">{data.title}</h1>
              )}
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="text-xs">
                {data.visibility.date && (
                  <p><span className="font-bold text-black">Date:</span> <span className="text-black ml-2">{data.date}</span></p>
                )}
              </div>
              <div className="text-xs text-right">
                {data.visibility.invoiceNo && data.invoiceType !== 'PROFORMA' && (
                  <p><span className="font-bold text-black">Invoice no:</span> <span className="text-black ml-2">{data.invoiceNo}</span></p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-start mb-8">
              <div className="w-[45%]">
                {data.visibility.billedTo && (
                  <>
                    <h3 className="font-bold text-black mb-2 text-xs">Billed to:</h3>
                    <p className="font-medium text-black text-xs">{data.billedTo.name}</p>
                    <p className="text-black whitespace-pre-line text-xs leading-relaxed">{data.billedTo.address}</p>
                    <p className="text-black text-xs mt-1">GST - {data.billedTo.gst}</p>
                  </>
                )}
              </div>

              <div className="w-[45%]">
                {data.visibility.from && (
                  <>
                    <h3 className="font-bold text-black mb-2 text-xs">From:</h3>
                    <p className="font-medium text-black text-xs">{data.from.name}</p>
                    <p className="text-black whitespace-pre-line text-xs leading-relaxed">{data.from.address}</p>
                    <p className="text-black text-xs mt-1">GST - {data.from.gst}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="flex-grow px-12">
            <table className="w-full mb-8 border-collapse">
                <thead>
                    <tr className="bg-[#e6fffa] border-b border-black">
                        <th className="font-bold text-black text-xs py-2 px-2 text-left" style={{ width: '28%' }}>Product</th>
                        <th className="font-bold text-black text-xs py-2 px-2 text-center" style={{ width: '11%' }}>Value</th>
                        <th className="font-bold text-black text-xs py-2 px-2 text-center" style={{ width: '9%' }}>HSN</th>
                        <th className="font-bold text-black text-xs py-2 px-2 text-center" style={{ width: '7%' }}>GST%</th>
                        <th className="font-bold text-black text-xs py-2 px-2 text-center" style={{ width: '9%' }}>CGST</th>
                        <th className="font-bold text-black text-xs py-2 px-2 text-center" style={{ width: '9%' }}>SGST</th>
                        <th className="font-bold text-black text-xs py-2 px-2 text-center" style={{ width: '9%' }}>IGST</th>
                        <th className="font-bold text-black text-xs py-2 px-2 text-center" style={{ width: '18%' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
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
                        
                        const halfAmt = gstAmt / 2;
                        
                        return (
                            <tr key={item.id} className="border-b border-black">
                                 <td className="text-black text-xs font-medium py-2 px-2 text-left">{item.description}</td>
                                 <td className="text-black text-xs py-2 px-2 text-center">{formatCurrency(baseValue)}</td>
                                 <td className="text-black text-xs py-2 px-2 text-center">{item.hsn}</td>
                                 <td className="text-black text-xs py-2 px-2 text-center">{item.gstRate}%</td>
                                 <td className="text-black text-xs py-2 px-2 text-center">
                                    {gstType === 'CGST_SGST' ? formatCurrency(halfAmt) : '-'}
                                 </td>
                                 <td className="text-black text-xs py-2 px-2 text-center">
                                    {gstType === 'CGST_SGST' ? formatCurrency(halfAmt) : '-'}
                                 </td>
                                 <td className="text-black text-xs py-2 px-2 text-center">
                                    {gstType === 'IGST' ? formatCurrency(gstAmt) : '-'}
                                 </td>
                                 <td className="text-black text-xs font-semibold py-2 px-2 text-center">{formatCurrency(total)}</td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-black">
                        <td className="text-black font-bold text-xs py-2 px-2 text-left">Total</td>
                        <td className="text-black font-bold text-xs py-2 px-2 text-center">{formatCurrency(subtotal)}</td>
                        <td className="text-black font-bold text-xs py-2 px-2 text-center"></td>
                        <td className="text-black font-bold text-xs py-2 px-2 text-center"></td>
                        <td className="text-black font-bold text-xs py-2 px-2 text-center">
                          {gstType === 'CGST_SGST' ? formatCurrency(totalCGST) : '-'}
                        </td>
                        <td className="text-black font-bold text-xs py-2 px-2 text-center">
                          {gstType === 'CGST_SGST' ? formatCurrency(totalSGST) : '-'}
                        </td>
                        <td className="text-black font-bold text-xs py-2 px-2 text-center">
                          {gstType === 'IGST' ? formatCurrency(totalTax) : '-'}
                        </td>
                        <td className="text-black font-bold text-xs py-2 px-2 text-center">{formatCurrency(totalAmount)}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Bank Details & Footer Info */}
            <div className="mt-8 mb-12">
                {data.visibility.paymentMethod && (
                  <p className="font-bold text-black mb-3 text-xs">Payment method: <span className="font-normal">{data.paymentMethod}</span></p>
                )}
                
                {data.visibility.bankDetails && (
                  <div className="text-xs text-black space-y-1 leading-snug">
                      <p>Account name - <span className="font-medium">{data.bankDetails.accountName}</span></p>
                      <p>Bank - <span className="font-medium">{data.bankDetails.bankName}</span></p>
                      <p>A/c no. - <span className="font-medium">{data.bankDetails.accountNo}</span></p>
                      <p>IFSC - <span className="font-medium">{data.bankDetails.ifsc}</span></p>
                      <p>A/c type - <span className="font-medium">{data.bankDetails.accountType}</span></p>
                  </div>
                )}

                {data.visibility.udyam && (
                  <div className="mt-6 text-xs text-black font-semibold tracking-wide">
                      {data.udyam}
                  </div>
                )}
            </div>
          </div>

          {/* Footer Text & Curve */}
          <div className="mt-auto relative">
             <div className="px-12 mb-20 relative z-20">
                <p className="text-[10px] text-black max-w-[80%] leading-tight">
                    We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
                </p>
                <p className="text-[10px] text-black mt-1">
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
                        fill="#3eb8a2" 
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