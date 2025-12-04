import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    // All images are local (starting with /)
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

  // Clone the element to avoid modifying the original
  const clone = input.cloneNode(true) as HTMLElement;
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  document.body.appendChild(clone);

  try {
    // Convert all images to base64 before capturing
    const images = clone.querySelectorAll('img');
    const conversions = Array.from(images).map(async (img) => {
      if (img.src && !img.src.startsWith('data:')) {
        try {
          const base64 = await getBase64Image(img.src);
          img.src = base64;
        } catch (e) {
          console.warn(`Failed to convert image to base64: ${img.src}`, e);
          // Leave the image as is if conversion fails
        }
      }
    });

    // Wait for all conversions
    await Promise.all(conversions);
    
    // Wait a bit for images to render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Increase scale for better quality
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: false,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Single page only - fit to A4
    const finalHeight = Math.min(imgHeight, pageHeight);
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, finalHeight);

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  } finally {
    // Clean up the clone
    document.body.removeChild(clone);
  }
};