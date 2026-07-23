export interface PaymentIntentResponse {
  clientSecret: string;
  transactionId: string;
  amount: number;
  currency: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  status: 'PAID' | 'FAILED' | 'PENDING';
  transactionId: string;
  errorMessage?: string;
}

export interface PaymentService {
  name: string;
  createPaymentIntent(amount: number, currency: string, orderId: string): Promise<PaymentIntentResponse>;
  verifyPayment(transactionId: string): Promise<PaymentVerifyResponse>;
  refundPayment(transactionId: string, amount: number): Promise<boolean>;
}

export class MockPaymentService implements PaymentService {
  name = "MockPayment";

  async createPaymentIntent(amount: number, currency: string, orderId: string): Promise<PaymentIntentResponse> {
    const transactionId = `txn_${Math.random().toString(36).substring(2, 11)}`;
    const clientSecret = `sec_${Math.random().toString(36).substring(2, 15)}`;
    return {
      clientSecret,
      transactionId,
      amount,
      currency,
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerifyResponse> {
    return {
      success: true,
      status: 'PAID',
      transactionId,
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    return true;
  }
}

export const activePaymentService: PaymentService = new MockPaymentService();
