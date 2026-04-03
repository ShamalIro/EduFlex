import client from './client';

export const createPaymentIntent = async (courseId, courseTitle, amount) => {
  const response = await client.post('/payments/create-intent', {
    course_id: courseId,
    course_title: courseTitle,
    amount: amount,
    currency: 'usd'
  });
  return response.data;
};

export const confirmPayment = async (paymentIntentId) => {
  const response = await client.post('/payments/confirm', {
    payment_intent_id: paymentIntentId
  });
  return response.data;
};

export const getPaymentHistory = async () => {
  const response = await client.get('/payments/history');
  return response.data;
};

export const getPaymentStatus = async (courseId) => {
  const response = await client.get(`/payments/course/${courseId}/status`);
  return response.data;
};