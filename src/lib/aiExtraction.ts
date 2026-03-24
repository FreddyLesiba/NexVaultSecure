export interface ExtractionResult {
  vendor: string;
  date: string;
  amount: number;
  vat: number;
  invoiceNumber: string;
  type: 'Invoice' | 'Credit Note';
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
};

async function getBestModel(apiKey: string): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!res.ok) throw new Error("Failed to query allowed models. Check your API key.");
  const data = await res.json();
  
  const validModels = (data.models || []).filter((m: any) => 
    m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('gemini')
  );

  const best = 
    validModels.find((m: any) => m.name.includes('1.5-flash')) ||
    validModels.find((m: any) => m.name.includes('1.5-pro')) ||
    validModels.find((m: any) => m.name.includes('vision')) ||
    validModels[0];

  if (!best) throw new Error("No compatible Gemini model mapped to this API key.");
  return best.name; // usually format "models/gemini-1.5-flash"
}

export const runGeminiExtraction = async (file: File, apiKey: string): Promise<ExtractionResult> => {
  
  if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
    throw new Error('Unsupported file type. Please upload a PDF or Image.');
  }

  const base64Data = await fileToBase64(file);

  const payload = {
    contents: [{
      parts: [
        { text: "Analyze the provided document. If it is NOT clearly an Invoice or a Credit Note, return EXACTLY this JSON: {\"error\": \"Invalid document type. Only invoices and credit notes are allowed.\"} and nothing else. If it IS an Invoice or Credit Note, extract the details and return ONLY a pure JSON object matching this structure identically without markdown: {\"vendor\": \"String Name\", \"date\": \"YYYY-MM-DD\", \"amount\": 0.00, \"vat\": 0.00, \"invoiceNumber\": \"String\", \"type\": \"Invoice\" or \"Credit Note\"}" },
        {
          inline_data: {
            mime_type: file.type,
            data: base64Data
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1
    }
  };

  const modelResourceName = await getBestModel(apiKey);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelResourceName}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to call Gemini API');
  }

  const data = await response.json();
  let rawText = data.candidates[0].content.parts[0].text;
  
  // Clean up markdown block format from Gemini if it stubbornly outputs it
  if (rawText.startsWith('```json')) {
    rawText = rawText.substring(7);
  }
  if (rawText.startsWith('```')) {
    rawText = rawText.substring(3);
  }
  if (rawText.endsWith('```')) {
    rawText = rawText.substring(0, rawText.length - 3);
  }

  const parsedData = JSON.parse(rawText.trim());
  if (parsedData.error) {
    throw new Error(parsedData.error);
  }
  return parsedData as ExtractionResult;
};
