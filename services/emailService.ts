
import emailjs from '@emailjs/browser';

// NOTE: To make this functional, you need to sign up at https://www.emailjs.com/
// and replace these placeholders with your actual Service ID, Template ID, and Public Key.
const SERVICE_ID = 'service_jaadu_orders'; 
const TEMPLATE_ID = 'template_order_receipt';
const PUBLIC_KEY = 'user_your_public_key'; 

interface OrderEmailParams {
  fullName: string;
  email: string;
  details: string;
  total: string;
  paymentMethod: string;
  cardBrand?: string;
  last4?: string;
  orderId: string;
}

export const sendOrderConfirmation = async (order: OrderEmailParams): Promise<boolean> => {
  try {
    // If keys are not configured, we log to console to simulate sending
    if (PUBLIC_KEY === 'user_your_public_key') {
        console.log(' [EmailJS] Keys not set. Simulating email send to:', order.email);
        console.log(' [EmailJS] Email Content:', order);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        return true;
    }

    const templateParams = {
        to_name: order.fullName,
        to_email: order.email,
        order_id: order.orderId,
        order_details: order.details,
        total_amount: order.total,
        payment_method: order.paymentMethod,
        card_info: order.cardBrand && order.cardBrand !== 'unknown' ? `${order.cardBrand} ending in ****${order.last4}` : order.paymentMethod,
        date: new Date().toLocaleDateString()
    };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return true;
  } catch (error) {
    console.error(' [EmailJS] Failed to send email:', error);
    // We return true anyway so the user flow isn't interrupted by email service errors
    // In production, you might want to log this to an error tracking service
    return true; 
  }
};
