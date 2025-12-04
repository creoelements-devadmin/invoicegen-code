import React, { useState } from 'react';
import { InvoiceData, InvoiceItem } from '../types';
import { Plus, Trash2 } from './Icons';

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

const LOGO_OPTIONS = [
  { label: 'Creo Elements', url: 'creo-logo.png' },
  { label: 'Little Things', url: 'Little Things Cute.png' },
  { label: 'ArtAngle90', url: 'artangle90.png' },
  { label: 'StoreEva', url: 'storeeva.jpg' },
];

const InvoiceForm: React.FC<Props> = ({ data, onChange }) => {
  
  const handleInputChange = (section: keyof InvoiceData, field: string, value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange({ ...data, [section]: { ...(data[section] as any), [field]: value } });
  };

  const handleRootChange = (field: keyof InvoiceData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleTypeChange = (type: 'PROFORMA' | 'TAX') => {
    onChange({
      ...data,
      invoiceType: type,
      title: type === 'PROFORMA' ? 'PROFORMA INVOICE' : 'TAX INVOICE',
      visibility: {
        ...data.visibility,
        invoiceNo: type === 'TAX'
      }
    });
  };

  const handleVisibilityChange = (field: keyof typeof data.visibility) => {
    onChange({
      ...data,
      visibility: {
        ...data.visibility,
        [field]: !data.visibility[field]
      }
    });
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const newItems = data.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "New Service",
      value: 0,
      hsn: "",
      gstRate: 18
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(i => i.id !== id) });
  };

  const handleBankChange = (field: string, value: string) => {
    onChange({ ...data, bankDetails: { ...data.bankDetails, [field as any]: value } });
  };

  const handleLogoSelect = (url: string) => {
    setCustomLogoMode(false);
    handleRootChange('logoUrl', url);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 border-r border-gray-200 shadow-xl scrollbar-thin scrollbar-thumb-gray-300">
      <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 shadow-sm flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Invoice Editor</h2>
      </div>
      
      <div className="p-6 space-y-8">
        
        {/* Branding Section */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Branding & Header</h3>
           
           <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTypeChange('PROFORMA')}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${data.invoiceType === 'PROFORMA' ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  PROFORMA INVOICE
                </button>
                <button
                  onClick={() => handleTypeChange('TAX')}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${data.invoiceType === 'TAX' ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  TAX INVOICE
                </button>
              </div>
           </div>

           <div className="mb-4">
             <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Select Logo</label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={data.visibility.logo} 
                    onChange={() => handleVisibilityChange('logo')}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs text-gray-500">Show Logo</span>
                </label>
             </div>
             <div className="flex flex-wrap gap-2">
               {LOGO_OPTIONS.map((opt) => (
                 <button
                   key={opt.url}
                   onClick={() => handleRootChange('logoUrl', opt.url)}
                   className={`px-3 py-2 text-xs rounded-lg border transition-all ${data.logoUrl === opt.url ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                 >
                   {opt.label}
                 </button>
               ))}
             </div>
           </div>

           <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Invoice Title</label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={data.visibility.title} 
                    onChange={() => handleVisibilityChange('title')}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs text-gray-500">Show Title</span>
                </label>
              </div>
              <input 
                type="text" 
                value={data.title} 
                onChange={(e) => handleRootChange('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
              />
           </div>

           <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Calculation Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRootChange('gstMode', 'exclusive')}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${data.gstMode === 'exclusive' ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  Exclusive of GST
                </button>
                <button
                  onClick={() => handleRootChange('gstMode', 'inclusive')}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${data.gstMode === 'inclusive' ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  Inclusive of GST
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                {data.gstMode === 'exclusive' 
                  ? 'Amount entered is before GST. GST will be added on top.' 
                  : 'Amount entered includes GST. GST will be calculated in reverse.'}
              </p>
           </div>
        </section>

        {/* Info Grid */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Basic Details</h3>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Date</label>
                    <input 
                        type="checkbox" 
                        checked={data.visibility.date} 
                        onChange={() => handleVisibilityChange('date')}
                        className="rounded text-teal-600 focus:ring-teal-500"
                    />
                </div>
                <input 
                type="text" 
                value={data.date} 
                onChange={(e) => handleRootChange('date', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm transition-colors"
                />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Invoice No</label>
                    <input 
                        type="checkbox" 
                        checked={data.visibility.invoiceNo} 
                        onChange={() => handleVisibilityChange('invoiceNo')}
                        className="rounded text-teal-600 focus:ring-teal-500"
                        disabled={data.invoiceType === 'PROFORMA'}
                    />
                </div>
                <input 
                type="text" 
                value={data.invoiceNo} 
                onChange={(e) => handleRootChange('invoiceNo', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm transition-colors"
                disabled={data.invoiceType === 'PROFORMA'}
                />
            </div>
            </div>
        </section>

        {/* Parties */}
        <div className="grid grid-cols-1 gap-6">
            <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md group">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Billed To (Client)</h3>
                    <input 
                        type="checkbox" 
                        checked={data.visibility.billedTo} 
                        onChange={() => handleVisibilityChange('billedTo')}
                        className="rounded text-teal-600 focus:ring-teal-500"
                    />
                </div>
                <div className="space-y-3">
                    <input 
                    placeholder="Client Name"
                    value={data.billedTo.name}
                    onChange={(e) => handleInputChange('billedTo', 'name', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
                    />
                    <textarea 
                    placeholder="Client Address"
                    rows={3}
                    value={data.billedTo.address}
                    onChange={(e) => handleInputChange('billedTo', 'address', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none resize-none"
                    />
                    <input 
                    placeholder="Client GST Number"
                    value={data.billedTo.gst}
                    onChange={(e) => handleInputChange('billedTo', 'gst', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
                    />
                </div>
            </section>

            <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md group">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider">From (You)</h3>
                    <input 
                        type="checkbox" 
                        checked={data.visibility.from} 
                        onChange={() => handleVisibilityChange('from')}
                        className="rounded text-teal-600 focus:ring-teal-500"
                    />
                </div>
                <div className="space-y-3">
                    <input 
                    placeholder="Your Company Name"
                    value={data.from.name}
                    onChange={(e) => handleInputChange('from', 'name', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
                    />
                    <textarea 
                    placeholder="Your Address"
                    rows={3}
                    value={data.from.address}
                    onChange={(e) => handleInputChange('from', 'address', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none resize-none"
                    />
                    <input 
                    placeholder="Your GST Number"
                    value={data.from.gst}
                    onChange={(e) => handleInputChange('from', 'gst', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
                    />
                    <div className="flex items-center gap-2 mt-2">
                        <input 
                        placeholder="UDYAM Number"
                        value={data.udyam}
                        onChange={(e) => handleRootChange('udyam', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
                        />
                        <input 
                            type="checkbox" 
                            checked={data.visibility.udyam} 
                            onChange={() => handleVisibilityChange('udyam')}
                            className="rounded text-teal-600 focus:ring-teal-500"
                            title="Show UDYAM"
                        />
                    </div>
                </div>
            </section>
        </div>

        {/* Items */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Products & Services</h3>
            <button onClick={addItem} className="flex items-center text-xs font-bold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition">
              <Plus size={14} className="mr-1" /> ADD ITEM
            </button>
          </div>
          <div className="space-y-4">
            {data.items.map((item, index) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                    <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition p-1 hover:bg-red-50 rounded"
                    title="Remove Item"
                    >
                    <Trash2 size={16} />
                    </button>
                </div>

                <div className="space-y-3">
                  <input 
                    placeholder="Item Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                  />
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Value (₹)</label>
                      <input 
                        type="text"
                        inputMode="decimal"
                        value={item.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            handleItemChange(item.id, 'value', val === '' ? 0 : parseFloat(val) || 0);
                          }
                        }}
                        className="w-full text-sm font-semibold text-gray-700 outline-none"
                      />
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">HSN Code</label>
                      <input 
                        value={item.hsn}
                        onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                        className="w-full text-sm font-semibold text-gray-700 outline-none"
                      />
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">GST Rate (%)</label>
                      <input 
                        type="number"
                        value={item.gstRate}
                        onChange={(e) => handleItemChange(item.id, 'gstRate', parseFloat(e.target.value) || 0)}
                        className="w-full text-sm font-semibold text-gray-700 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {data.items.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                    No items added yet.
                </div>
            )}
          </div>
        </section>

        {/* Bank Details */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Information</h3>
            <input 
                type="checkbox" 
                checked={data.visibility.bankDetails} 
                onChange={() => handleVisibilityChange('bankDetails')}
                className="rounded text-teal-600 focus:ring-teal-500"
            />
          </div>
          <div className="space-y-3">
            <input 
              placeholder="Account Name"
              value={data.bankDetails.accountName}
              onChange={(e) => handleBankChange('accountName', e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
            />
            <input 
              placeholder="Bank Name"
              value={data.bankDetails.bankName}
              onChange={(e) => handleBankChange('bankName', e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
                <input 
                  placeholder="Account No"
                  value={data.bankDetails.accountNo}
                  onChange={(e) => handleBankChange('accountNo', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
                />
                <input 
                  placeholder="IFSC Code"
                  value={data.bankDetails.ifsc}
                  onChange={(e) => handleBankChange('ifsc', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
                />
            </div>
            <input 
              placeholder="Account Type"
              value={data.bankDetails.accountType}
              onChange={(e) => handleBankChange('accountType', e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
            />
            <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Payment Method / Note</label>
                    <input 
                        type="checkbox" 
                        checked={data.visibility.paymentMethod} 
                        onChange={() => handleVisibilityChange('paymentMethod')}
                        className="rounded text-teal-600 focus:ring-teal-500"
                    />
                </div>
                <input 
                placeholder="e.g. 100% advance"
                value={data.paymentMethod}
                onChange={(e) => handleRootChange('paymentMethod', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none"
                />
            </div>
          </div>
        </section>

      </div>
      <div className="h-20"></div> {/* Spacer for scrolling */}
    </div>
  );
};

export default InvoiceForm;