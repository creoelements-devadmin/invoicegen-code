export interface InvoiceItem {
  id: string;
  description: string;
  value: number;
  hsn: string;
  gstRate: number;
}

export interface BankDetails {
  accountName: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  accountType: string;
}

export interface InvoiceData {
  logoUrl: string;
  title: string;
  date: string;
  invoiceNo: string;
  gstMode: 'exclusive' | 'inclusive';
  billedTo: {
    name: string;
    address: string; // Multi-line address
    gst: string;
  };
  from: {
    name: string;
    address: string; // Multi-line address
    gst: string;
  };
  items: InvoiceItem[];
  bankDetails: BankDetails;
  udyam: string;
  paymentMethod: string;
  invoiceType: 'PROFORMA' | 'TAX';
  visibility: {
    logo: boolean;
    title: boolean;
    date: boolean;
    invoiceNo: boolean;
    billedTo: boolean;
    from: boolean;
    bankDetails: boolean;
    udyam: boolean;
    paymentMethod: boolean;
  };
}

export const INITIAL_DATA: InvoiceData = {
  logoUrl: "/invoicegen/creo-logo.png",
  title: "PROFORMA INVOICE",
  date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  invoiceNo: "CE/00/25-26",
  gstMode: 'exclusive',
  billedTo: {
    name: "Trupsel",
    address: "93. D.Dalamal Park,\nCuffe Parade,\nMumbai 400005",
    gst: "27AKIPB8270H1Z3"
  },
  from: {
    name: "CREO Elements LLP",
    address: "Office no 10, Mulchand Mansion,\nOld Hanuman Lane, Princess\nStreet, Mumbai - 400002",
    gst: "27AARFC8016B1ZJ"
  },
  items: [
    {
      id: '1',
      description: "Website maintenance charges",
      value: 10000,
      hsn: "998315",
      gstRate: 18
    }
  ],
  bankDetails: {
    accountName: "CREO ELEMENTS LLP",
    bankName: "HDFC Bank Ltd.",
    accountNo: "50200071934304",
    ifsc: "HDFC0000080",
    accountType: "Current Account"
  },
  udyam: "UDYAM-MH-19-0215995",
  paymentMethod: "100% advance",
  invoiceType: 'PROFORMA',
  visibility: {
    logo: true,
    title: true,
    date: true,
    invoiceNo: true,
    billedTo: true,
    from: true,
    bankDetails: true,
    udyam: true,
    paymentMethod: true
  }
};