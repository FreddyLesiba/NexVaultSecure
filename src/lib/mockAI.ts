export interface ExtractionResult {
  vendor: string;
  date: string;
  amount: number;
  vat: number;
  invoiceNumber: string;
  type: 'Invoice' | 'Credit Note';
}

const vendors = ['Amazon Web Services', 'Google Cloud', 'Microsoft Corp', 'Adobe Systems', 'Slack Technologies', 'Zoom Communications', 'Atlassian'];

export const simulateAIExtraction = async (file: File): Promise<ExtractionResult> => {
  return new Promise((resolve) => {
    // Simulate API delay
    const delay = Math.floor(Math.random() * 1500) + 1500;
    
    setTimeout(() => {
      const isCreditNote = file.name.toLowerCase().includes('credit');
      const baseAmount = Math.floor(Math.random() * 5000) + 50;
      
      resolve({
        vendor: vendors[Math.floor(Math.random() * vendors.length)],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0],
        amount: baseAmount,
        vat: parseFloat((baseAmount * 0.2).toFixed(2)),
        invoiceNumber: `INV-${Math.floor(Math.random() * 90000) + 10000}`,
        type: isCreditNote ? 'Credit Note' : 'Invoice',
      });
    }, delay);
  });
};
