
// NOTE: Ensure your Google Apps Script is deployed as a Web App with:
// Execute as: "Me"
// Who has access: "Anyone"
const scriptUrl = 'https://script.google.com/macros/s/AKfycbzw73C-NQzPpF0mFAz4heqHvUHyXp7lzdqfN1hsRGsk-JdOfnk6NYvKdbt_zJ62v9kvxQ/exec'; 

export const submitToGoogleSheet = async (sheetName: string, data: Record<string, any>) => {
  const now = new Date();
  const timestamp = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

  const formData = new URLSearchParams();
  formData.append('sheetName', sheetName);
  formData.append('Timestamp', timestamp);

  Object.keys(data).forEach(key => {
    const value = data[key] === undefined || data[key] === null ? '' : String(data[key]);
    formData.append(key, value);
  });

  try {
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    return true;
  } catch (error) {
    console.error('Error submitting to Google Sheet:', error);
    return false;
  }
};

export const sendOrderEmail = async (orderData: any) => {
    const formData = new URLSearchParams();
    formData.append('action', 'send_email');
    formData.append('recipient', orderData.email);
    formData.append('subject', `Order Confirmation #${orderData.orderId}`);
    
    // Construct HTML Body
    const htmlBody = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #022c22; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">JAADU KI KAAT</h1>
          <p style="color: #86efac; margin: 8px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Spiritual Sanctuary</p>
        </div>
        
        <div style="padding: 30px; color: #334155;">
          <h2 style="color: #022c22; margin-top: 0;">Payment Receipt</h2>
          <p>As-salamu alaykum <strong>${orderData.fullName}</strong>,</p>
          <p>Your payment has been successfully processed. We have received your order for spiritual essentials.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #f1f5f9;">
            <h3 style="margin-top: 0; color: #022c22; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Order Details</h3>
            
            <p style="margin: 10px 0; font-size: 14px;">
              <strong style="color: #64748b; display: inline-block; width: 120px;">Order ID:</strong>
              <span style="font-family: monospace; font-size: 15px;">${orderData.orderId}</span>
            </p>
            
            <p style="margin: 10px 0; font-size: 14px;">
              <strong style="color: #64748b; display: inline-block; width: 120px;">Items:</strong>
              <span>${orderData.details}</span>
            </p>
            
            <p style="margin: 10px 0; font-size: 14px;">
              <strong style="color: #64748b; display: inline-block; width: 120px;">Total Amount:</strong>
              <span style="color: #022c22; font-weight: bold;">${orderData.total}</span>
            </p>
            
             <p style="margin: 10px 0; font-size: 14px;">
              <strong style="color: #64748b; display: inline-block; width: 120px;">Payment:</strong>
              <span>${orderData.paymentMethod}</span>
            </p>
          </div>
          
          <p style="line-height: 1.6;">Our team is preparing your items with care and specific duas for your protection. You will be notified once shipping begins.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            <p>May this bring you Shifa and peace.</p>
            <p>&copy; ${new Date().getFullYear()} Jaadu ki kaat. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
    
    formData.append('htmlBody', htmlBody);

    try {
        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });
        console.log("Email request sent to Google Script");
        return true;
    } catch (error) {
        console.error("Error sending email via Google Script:", error);
        return false;
    }
};
