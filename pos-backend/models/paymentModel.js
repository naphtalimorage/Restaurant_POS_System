const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Payment model for Supabase
 * 
 * Table structure in Supabase:
 * - id: uuid (primary key)
 * - payment_id: text (not null) - Razorpay payment ID
 * - order_id: text (not null) - Razorpay order ID
 * - amount: numeric (not null)
 * - currency: text (not null)
 * - status: text (not null)
 * - method: text (not null)
 * - email: text
 * - contact: text
 * - created_at: timestamptz (default: now())
 * - updated_at: timestamptz (default: now())
 */

// Create a new payment
const createPayment = async (paymentData) => {
  // Generate UUID for the payment
  const id = uuidv4();
  
  // Prepare payment data
  const paymentToInsert = {
    id,
    payment_id: paymentData.paymentId,
    order_id: paymentData.orderId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    status: paymentData.status,
    method: paymentData.method,
    email: paymentData.email,
    contact: paymentData.contact,
    created_at: paymentData.createdAt || new Date(),
    updated_at: new Date()
  };
  
  // Insert payment into Supabase
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentToInsert)
    .select();
    
  if (error) throw error;
  
  return data[0];
};

// Get payment by Razorpay payment ID
const getPaymentByPaymentId = async (paymentId) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_id', paymentId)
    .single();
    
  if (error) throw error;
  
  return data;
};

// Get payments by Razorpay order ID
const getPaymentsByOrderId = async (orderId) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId);
    
  if (error) throw error;
  
  return data;
};

// Update payment status
const updatePaymentStatus = async (paymentId, status) => {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status,
      updated_at: new Date()
    })
    .eq('payment_id', paymentId)
    .select();
    
  if (error) throw error;
  
  return data[0];
};

// Get all payments
const getAllPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data;
};

module.exports = {
  createPayment,
  getPaymentByPaymentId,
  getPaymentsByOrderId,
  updatePaymentStatus,
  getAllPayments
};