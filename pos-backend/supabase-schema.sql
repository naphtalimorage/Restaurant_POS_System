-- Supabase SQL Schema for Restaurant POS System
-- This script creates the necessary tables in Supabase to replace MongoDB

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tables table
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_no INTEGER NOT NULL UNIQUE,
  status TEXT DEFAULT 'Available',
  seats INTEGER NOT NULL,
  current_order_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_details JSONB NOT NULL,
  order_status TEXT NOT NULL,
  order_date TIMESTAMPTZ DEFAULT NOW(),
  bills JSONB NOT NULL,
  items JSONB[],
  table_id UUID REFERENCES tables(id),
  payment_method TEXT,
  payment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint from tables to orders
ALTER TABLE tables 
  ADD CONSTRAINT fk_current_order 
  FOREIGN KEY (current_order_id) 
  REFERENCES orders(id) 
  ON DELETE SET NULL;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  method TEXT NOT NULL,
  email TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create health_check table for connection testing
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  status TEXT DEFAULT 'ok',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a record into health_check
INSERT INTO health_check (status) VALUES ('ok');

-- Create Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;

-- Create policies for anon access (for development purposes)
-- In production, you would want to restrict access based on user roles
CREATE POLICY "Allow full access to all users" ON users FOR ALL USING (true);
CREATE POLICY "Allow full access to all tables" ON tables FOR ALL USING (true);
CREATE POLICY "Allow full access to all orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow full access to all payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow full access to health_check" ON health_check FOR ALL USING (true);