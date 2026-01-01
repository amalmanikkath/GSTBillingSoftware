/**
 * Skeleton for WhatsApp Business API Integration via Meta
 */
export async function sendInvoiceViaWhatsapp(invoiceId: string, phoneNumber: string) {
  console.log(`Sending invoice ${invoiceId} to ${phoneNumber}...`);
  
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.warn("WhatsApp credentials not configured");
    return { success: false, error: "Configuration missing" };
  }

  try {
    // 1. Generate PDF (In a real app, you'd generate the PDF and upload to S3/WhatsApp Media API)
    // const pdfUrl = await generateInvoicePdf(invoiceId);

    // 2. Call Meta WhatsApp API
    const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "template",
        template: {
          name: "invoice_notification",
          language: { code: "en_US" },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "document",
                  document: {
                    link: "https://example.com/invoice.pdf", // pdfUrl
                    filename: `Invoice_${invoiceId}.pdf`
                  }
                }
              ]
            }
          ]
        }
      })
    });

    const result = await response.json();
    return { success: response.ok, result };
  } catch (error) {
    console.error("WhatsApp Send Error:", error);
    return { success: false, error };
  }
}
