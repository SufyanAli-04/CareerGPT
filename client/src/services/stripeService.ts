import api from './api';

export const stripeService = {
  createCheckoutSession: (plan: string) => 
    api.post('/stripe/create-checkout-session', { plan }),

  verifyCheckoutSession: (sessionId: string) => 
    api.post('/stripe/verify-session', { sessionId }),
};
