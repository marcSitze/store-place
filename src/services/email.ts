import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function sendOrderConfirmationEmail(email: string, orderNumber: string, total: number) {
  try {
    const data = await resend.emails.send({
      from: 'Store <onboarding@resend.dev>',
      to: [email],
      subject: `Order Confirmation #${orderNumber}`,
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>Your order number is <strong>${orderNumber}</strong>.</p>
        <p>Total amount paid: <strong>$${total.toFixed(2)}</strong>.</p>
        <p>We will notify you when your items are shipped.</p>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendOrderStatusUpdateEmail(email: string, orderNumber: string, status: string, trackingNumber?: string) {
  try {
    const trackingHtml = trackingNumber ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>` : '';
    const data = await resend.emails.send({
      from: 'Store <onboarding@resend.dev>',
      to: [email],
      subject: `Order Status Update: #${orderNumber} is now ${status}`,
      html: `
        <h1>Order Status Update</h1>
        <p>Your order <strong>${orderNumber}</strong> has been updated to: <strong>${status}</strong>.</p>
        ${trackingHtml}
        <p>Thank you for shopping with us!</p>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return { success: false, error };
  }
}
