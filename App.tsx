import React, { useState, useEffect, useCallback } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { InvoiceData, INITIAL_DATA } from './types';
import { Download, Share2, RefreshCw } from './components/Icons';
import { generatePDF } from './services/pdfService';

const App: React.FC = () => {
  const [data, setData] = useState<InvoiceData>(INITIAL_DATA);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Logo keyword mapping
  const LOGO_KEYWORDS = {
    'creo': '/creo-logo.png',
    'little': '/Little Things Cute.png',
    'artangle90': '/artangle90.png',
    'storeeva': '/storeeva.jpg'
  };

  const LOGO_TO_KEYWORD: { [key: string]: string } = {
    '/creo-logo.png': 'creo',
    '/Little Things Cute.png': 'little',
    '/artangle90.png': 'artangle90',
    '/storeeva.jpg': 'storeeva'
  };

  // Helper to encode data to URL parameters
  const encodeToURL = useCallback((invoiceData: InvoiceData) => {
    const params = new URLSearchParams();
    
    // Logo - use keyword if available, otherwise full URL
    const logoKeyword = LOGO_TO_KEYWORD[invoiceData.logoUrl];
    params.set('logo', logoKeyword || invoiceData.logoUrl);
    
    params.set('title', invoiceData.title);
    params.set('date', invoiceData.date);
    params.set('invoiceNo', invoiceData.invoiceNo);
    params.set('gstMode', invoiceData.gstMode);
    
    // Billed To
    params.set('btName', invoiceData.billedTo.name);
    params.set('btAddr', invoiceData.billedTo.address);
    params.set('btGst', invoiceData.billedTo.gst);
    
    // From
    params.set('fName', invoiceData.from.name);
    params.set('fAddr', invoiceData.from.address);
    params.set('fGst', invoiceData.from.gst);
    
    // Items - encode as JSON array
    params.set('items', JSON.stringify(invoiceData.items));
    
    // Bank Details
    params.set('bAccName', invoiceData.bankDetails.accountName);
    params.set('bBank', invoiceData.bankDetails.bankName);
    params.set('bAccNo', invoiceData.bankDetails.accountNo);
    params.set('bIfsc', invoiceData.bankDetails.ifsc);
    params.set('bAccType', invoiceData.bankDetails.accountType);
    
    params.set('udyam', invoiceData.udyam);
    params.set('payment', invoiceData.paymentMethod);
    
    // New fields
    params.set('type', invoiceData.invoiceType);
    params.set('visibility', JSON.stringify(invoiceData.visibility));

    return params.toString();
  }, []);

  // Helper to decode URL parameters to data
  const decodeFromURL = useCallback((params: URLSearchParams): InvoiceData | null => {
    try {
      // Check if we have the minimum required params
      if (!params.has('invoiceNo')) return null;
      
      // Decode logo - check if it's a keyword first
      const logoParam = params.get('logo') || '';
      const logoUrl = LOGO_KEYWORDS[logoParam as keyof typeof LOGO_KEYWORDS] || logoParam || INITIAL_DATA.logoUrl;
      
      // Decode items
      let items = INITIAL_DATA.items;
      const itemsParam = params.get('items');
      if (itemsParam) {
        try {
          const parsed = JSON.parse(itemsParam);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed;
          }
        } catch (e) {
          console.error('Failed to parse items', e);
        }
      }

      // Decode visibility
      let visibility = INITIAL_DATA.visibility;
      const visParam = params.get('visibility');
      if (visParam) {
        try {
          const parsed = JSON.parse(visParam);
          visibility = { ...INITIAL_DATA.visibility, ...parsed };
        } catch (e) {
          console.error('Failed to parse visibility', e);
        }
      }
      
      return {
        logoUrl,
        title: params.get('title') || INITIAL_DATA.title,
        date: params.get('date') || INITIAL_DATA.date,
        invoiceNo: params.get('invoiceNo') || INITIAL_DATA.invoiceNo,
        gstMode: (params.get('gstMode') as 'exclusive' | 'inclusive') || INITIAL_DATA.gstMode,
        billedTo: {
          name: params.get('btName') || INITIAL_DATA.billedTo.name,
          address: params.get('btAddr') || INITIAL_DATA.billedTo.address,
          gst: params.get('btGst') || INITIAL_DATA.billedTo.gst
        },
        from: {
          name: params.get('fName') || INITIAL_DATA.from.name,
          address: params.get('fAddr') || INITIAL_DATA.from.address,
          gst: params.get('fGst') || INITIAL_DATA.from.gst
        },
        items,
        bankDetails: {
          accountName: params.get('bAccName') || INITIAL_DATA.bankDetails.accountName,
          bankName: params.get('bBank') || INITIAL_DATA.bankDetails.bankName,
          accountNo: params.get('bAccNo') || INITIAL_DATA.bankDetails.accountNo,
          ifsc: params.get('bIfsc') || INITIAL_DATA.bankDetails.ifsc,
          accountType: params.get('bAccType') || INITIAL_DATA.bankDetails.accountType
        },
        udyam: params.get('udyam') || INITIAL_DATA.udyam,
        paymentMethod: params.get('payment') || INITIAL_DATA.paymentMethod,
        invoiceType: (params.get('type') as 'PROFORMA' | 'TAX') || INITIAL_DATA.invoiceType,
        visibility
      };
    } catch (e) {
      console.error('Failed to decode invoice data from URL', e);
      return null;
    }
  }, []);

  // 1. Load data from URL on startup (only once)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const decoded = decodeFromURL(params);
    if (decoded) {
      setData(decoded);
    }
    setIsInitialLoad(false);
  }, [decodeFromURL]);

  // 2. Update URL whenever data changes (but skip initial load to prevent overwrite)
  useEffect(() => {
    if (!isInitialLoad) {
      const encoded = encodeToURL(data);
      const newUrl = `${window.location.pathname}?${encoded}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [data, encodeToURL, isInitialLoad]);

  // 3. Generate Share Link
  const handleShare = useCallback(() => {
    const encoded = encodeToURL(data);
    const url = `${window.location.origin}${window.location.pathname}?${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess('Link copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  }, [data, encodeToURL]);

  const handleDownload = () => {
    generatePDF('invoice-preview', `Invoice_${data.invoiceNo.replace(/\//g, '-')}`);
  };

  const resetData = () => {
    if(window.confirm("Are you sure you want to reset all fields to default?")) {
        setData(INITIAL_DATA);
        // Clear URL
        window.history.pushState({}, '', window.location.pathname);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-30 shrink-0">
        <div className="flex items-center space-x-3">
            <img 
              src="/creo-logo.png" 
              alt="Creo Elements" 
              className="h-10 object-contain"
            />
            <h1 className="font-bold text-gray-800 text-lg md:text-xl hidden md:block">Invoice Generator</h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={resetData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            title="Reset to Defaults"
          >
            <RefreshCw size={18} />
          </button>

          <button 
            onClick={handleShare}
            className="flex items-center space-x-1 md:space-x-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
          >
            <Share2 size={16} />
            <span>{copySuccess || 'Share'}</span>
          </button>

          <button 
            onClick={handleDownload}
            className="flex items-center space-x-1 md:space-x-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium shadow-sm"
          >
            <Download size={16} />
            <span className="hidden md:inline">Download PDF</span>
            <span className="inline md:hidden">PDF</span>
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Side: Form Editor */}
        <div className={`
          w-full md:w-[400px] lg:w-[450px] bg-white h-full overflow-y-auto border-r border-gray-200
          ${isMobilePreviewOpen ? 'hidden md:block' : 'block'}
        `}>
          <InvoiceForm data={data} onChange={setData} />
        </div>

        {/* Right Side: Preview */}
        <div className={`
          flex-1 bg-gray-100 h-full overflow-auto flex items-start justify-center pt-8 pb-20
          ${!isMobilePreviewOpen ? 'hidden md:flex' : 'flex fixed inset-0 z-20 md:static'}
        `}>
             <InvoicePreview data={data} id="invoice-preview" />
             
             {/* Mobile Close Preview Button */}
             {isMobilePreviewOpen && (
                 <button 
                    onClick={() => setIsMobilePreviewOpen(false)}
                    className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg z-50 md:hidden"
                 >
                    Back to Edit
                 </button>
             )}
        </div>

      </div>

      {/* Mobile Preview Toggle (Floating Action) */}
      {!isMobilePreviewOpen && (
        <div className="fixed bottom-6 right-6 md:hidden z-40">
           <button 
            onClick={() => setIsMobilePreviewOpen(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-full shadow-xl font-medium flex items-center space-x-2"
           >
             <span>View Preview</span>
           </button>
        </div>
      )}
    </div>
  );
};

export default App;