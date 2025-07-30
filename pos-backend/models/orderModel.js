const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Order model for Supabase
 * 
 * Table structure in Supabase:
 * - id: uuid (primary key)
 * - customer_details: jsonb (not null) - contains name, phone, guests
 * - order_status: text (not null)
 * - order_date: timestamptz (default: now())
 * - bills: jsonb (not null) - contains total, tax, totalWithTax
 * - items: jsonb[] (array of items)
 * - table_id: uuid (foreign key to tables.id)
 * - payment_method: text
 * - payment_data: jsonb - contains razorpay_order_id, razorpay_payment_id
 * - created_at: timestamptz (default: now())
 * - updated_at: timestamptz (default: now())
 */

// Create a new order
const createOrder = async (orderData) => {
  // Generate UUID for the order
  const orderId = uuidv4();
  
  // Prepare order data
  const orderToInsert = {
    id: orderId,
    customer_details: orderData.customerDetails,
    order_status: orderData.orderStatus,
    order_date: orderData.orderDate || new Date(),
    bills: orderData.bills,
    items: orderData.items,
    table_id: orderData.table, // This should be a UUID of the table
    payment_method: orderData.paymentMethod,
    payment_data: orderData.paymentData,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  // Insert order into Supabase
  const { data, error } = await supabase
    .from('orders')
    .insert(orderToInsert)
    .select();
    
  if (error) throw error;
  
  return data[0];
};

// Get order by ID
const getOrderById = async (id) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      tables:table_id (*)
    `)
    .eq('id', id)
    .single();
    
  if (error) throw error;
  
  return data;
};

// Get all orders
const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      tables:table_id (*)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data;
};

// Update order status
const updateOrderStatus = async (id, orderStatus) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      order_status: orderStatus,
      updated_at: new Date()
    })
    .eq('id', id)
    .select();
    
  if (error) throw error;
  
  return data[0];
};

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};