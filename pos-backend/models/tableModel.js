const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Table model for Supabase
 * 
 * Table structure in Supabase:
 * - id: uuid (primary key)
 * - table_no: integer (not null, unique)
 * - status: text (default: 'Available')
 * - seats: integer (not null)
 * - current_order_id: uuid (foreign key to orders.id)
 * - created_at: timestamptz (default: now())
 * - updated_at: timestamptz (default: now())
 */

// Create a new table
const createTable = async (tableData) => {
  // Check if table number already exists
  const { data: existingTable } = await supabase
    .from('tables')
    .select('*')
    .eq('table_no', tableData.tableNo)
    .single();
    
  if (existingTable) {
    throw new Error('Table already exists!');
  }
  
  // Generate UUID for the table
  const tableId = uuidv4();
  
  // Prepare table data
  const tableToInsert = {
    id: tableId,
    table_no: tableData.tableNo,
    status: tableData.status || 'Available',
    seats: tableData.seats,
    current_order_id: tableData.currentOrder || null,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  // Insert table into Supabase
  const { data, error } = await supabase
    .from('tables')
    .insert(tableToInsert)
    .select();
    
  if (error) throw error;
  
  return data[0];
};

// Get all tables with their current orders
const getAllTables = async () => {
  const { data, error } = await supabase
    .from('tables')
    .select(`
      *,
      orders:current_order_id (
        id,
        customer_details
      )
    `)
    .order('table_no');
    
  if (error) throw error;
  
  return data;
};

// Update table status and current order
const updateTable = async (id, updateData) => {
  const updates = {
    updated_at: new Date()
  };
  
  if (updateData.status) {
    updates.status = updateData.status;
  }
  
  if (updateData.currentOrder !== undefined) {
    updates.current_order_id = updateData.currentOrder;
  }
  
  const { data, error } = await supabase
    .from('tables')
    .update(updates)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  
  return data[0];
};

// Find table by table number
const findTableByNumber = async (tableNo) => {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('table_no', tableNo)
    .single();
    
  if (error) throw error;
  
  return data;
};

module.exports = {
  createTable,
  getAllTables,
  updateTable,
  findTableByNumber
};