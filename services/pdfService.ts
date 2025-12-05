// Cache for converted images to avoid re-fetching
const imageCache = new Map<string, string>();

// Helper to convert image URL to base64
const getBase64Image = async (url: string): Promise<string> => {
  // If it's already a data URL, return it
  if (url.startsWith('data:')) {
    return url;
  }

  // Check cache first
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    imageCache.set(url, base64);
    return base64;
  } catch (error) {
    console.warn(`Failed to fetch image: ${url}`, error);
    throw error;
  }
};

export const generatePDF = async (elementId: string, fileName: string) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Clone the element
    const clone = input.cloneNode(true) as HTMLElement;
    
    // Extract invoice details for the title
    const invoiceNoElement = clone.querySelector('.text-sm');
    const invoiceNo = invoiceNoElement?.textContent?.replace('Invoice no:', '').trim() || '';
    const dateElement = clone.querySelectorAll('.text-sm')[1];
    const date = dateElement?.textContent?.replace('Date:', '').trim() || '';
    
    // Create a clean title for the PDF
    const pdfTitle = invoiceNo && date ? `Invoice-${invoiceNo.replace(/\s+/g, '-')}-${date.replace(/\//g, '-')}` : fileName;
    
    // Store original title
    const originalTitle = document.title;
    
    // Change main document title temporarily
    document.title = pdfTitle;
    
    // Convert all images to base64
    const images = clone.querySelectorAll('img');
    const conversions = Array.from(images).map(async (img) => {
      if (img.src && !img.src.startsWith('data:')) {
        try {
          const base64 = await getBase64Image(img.src);
          img.src = base64;
        } catch (e) {
          console.warn(`Failed to convert image to base64: ${img.src}`, e);
        }
      }
    });

    await Promise.all(conversions);

    // Get all stylesheets from the current document
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          console.warn('Could not access stylesheet', e);
          return '';
        }
      })
      .join('\n');

    // Create an invisible iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Could not access iframe document');
    }

    // Write the content to the iframe
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${pdfTitle}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4 portrait;
              margin: 0;
            }
            
            html {
              width: 210mm;
              height: 297mm;
            }
            
            body {
              margin: 0;
              padding: 0;
              width: 210mm;
              height: 297mm;
              max-width: 210mm;
              max-height: 297mm;
              overflow: hidden;
            }
            
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
                max-width: 210mm;
                max-height: 297mm;
                margin: 0;
                padding: 0;
                overflow: hidden;
              }
              
              @page {
                size: A4 portrait;
                margin: 0;
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
            
            @media screen {
              body {
                width: 210mm;
                height: 297mm;
              }
            }
            
            ${styles}
          </style>
        </head>
        <body>
          ${clone.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Focus on iframe and trigger print
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    
    // Clean up and restore original title after a delay
    setTimeout(() => {
      document.title = originalTitle;
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};