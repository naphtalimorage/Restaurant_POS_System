# MongoDB to Supabase Migration Guide

This document provides information about the migration from MongoDB to Supabase in the Restaurant POS System.

## Overview

The Restaurant POS System has been migrated from MongoDB to Supabase with PostgreSQL. This migration involved:

1. Replacing Mongoose models with Supabase client functions
2. Converting MongoDB schemas to PostgreSQL table structures
3. Updating controllers to use Supabase queries instead of MongoDB queries
4. Maintaining existing functionality while changing the database backend

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Note your Supabase URL and anon key (public API key)

### 2. Set Up Environment Variables

Create or update your `.env` file with the following variables:

```
PORT=3000
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Database Tables

1. In your Supabase project, go to the SQL Editor
2. Copy and paste the contents of `supabase-schema.sql` into the SQL Editor
3. Run the SQL script to create all necessary tables and relationships

### 4. Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

## Database Schema

The PostgreSQL database schema consists of the following tables:

### Users Table
- `id`: UUID (primary key)
- `name`: Text (not null)
- `email`: Text (not null, unique)
- `phone`: Text (not null)
- `password`: Text (not null)
- `role`: Text (not null)
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

### Tables Table
- `id`: UUID (primary key)
- `table_no`: Integer (not null, unique)
- `status`: Text (default: 'Available')
- `seats`: Integer (not null)
- `current_order_id`: UUID (foreign key to orders.id)
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

### Orders Table
- `id`: UUID (primary key)
- `customer_details`: JSONB (not null) - contains name, phone, guests
- `order_status`: Text (not null)
- `order_date`: Timestamp with timezone
- `bills`: JSONB (not null) - contains total, tax, totalWithTax
- `items`: JSONB array
- `table_id`: UUID (foreign key to tables.id)
- `payment_method`: Text
- `payment_data`: JSONB - contains paystack_reference, paystack_transaction_id
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

### Payments Table
- `id`: UUID (primary key)
- `payment_id`: Text (not null, unique) - Paystack transaction ID
- `order_id`: Text (not null) - Paystack reference
- `amount`: Numeric (not null)
- `currency`: Text (not null)
- `status`: Text (not null)
- `method`: Text (not null)
- `email`: Text
- `contact`: Text
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

## Key Changes

### Model Changes

MongoDB models with Mongoose schemas have been replaced with JavaScript modules that export functions for interacting with Supabase. For example:

**Before (MongoDB):**
```javascript
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true }
});

module.exports = mongoose.model("User", userSchema);
```

**After (Supabase):**
```javascript
const createUser = async (userData) => {
  // Validation logic
  
  // Insert into Supabase
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select();
    
  if (error) throw error;
  return data[0];
};

module.exports = { createUser };
```

### Query Changes

MongoDB queries have been replaced with Supabase queries:

**Before (MongoDB):**
```javascript
const user = await User.findOne({ email });
const orders = await Order.find().populate("table");
await newUser.save();
```

**After (Supabase):**
```javascript
const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
const { data: orders } = await supabase.from('orders').select('*, tables:table_id(*)');
const { data } = await supabase.from('users').insert(newUser).select();
```

### ID Handling

MongoDB's ObjectId has been replaced with UUID:

**Before (MongoDB):**
```javascript
if (!mongoose.Types.ObjectId.isValid(id)) {
  // Handle invalid ID
}
```

**After (Supabase):**
```javascript
const { validate: isUUID } = require('uuid');

if (!isUUID(id)) {
  // Handle invalid ID
}
```

## Example Usage

### Creating a User

```javascript
const { createUser } = require('../models/userModel');

// In your controller
const userData = { 
  name: 'John Doe', 
  email: 'john@example.com',
  phone: '1234567890',
  password: 'hashedPassword',
  role: 'admin'
};

const newUser = await createUser(userData);
```

### Getting Orders with Related Tables

```javascript
const { getAllOrders } = require('../models/orderModel');

// In your controller
const orders = await getAllOrders();
// orders will include the related table data
```

## Troubleshooting

- **Connection Issues**: Ensure your Supabase URL and anon key are correct in the .env file
- **Query Errors**: Check the Supabase dashboard for query errors in the SQL editor
- **Missing Tables**: Verify that you've run the supabase-schema.sql script successfully

## Payment Gateway Migration: Razorpay to Paystack

The payment gateway has been migrated from Razorpay to Paystack to better support Kenyan businesses. This migration involved:

1. Replacing the Razorpay SDK with Paystack SDK
2. Updating environment variables
3. Modifying the payment controller to use Paystack's API
4. Updating the frontend to integrate with Paystack's checkout system

### Key Changes

#### Environment Variables

**Before (Razorpay):**
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

**After (Paystack):**
```
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
```

#### Payment Flow

**Before (Razorpay):**
1. Create an order with Razorpay
2. Open Razorpay checkout in a popup
3. Verify payment signature after completion
4. Store Razorpay order_id and payment_id

**After (Paystack):**
1. Initialize a transaction with Paystack
2. Redirect to Paystack's hosted payment page
3. Verify transaction using the reference
4. Store Paystack reference and transaction_id

#### Currency

The currency has been changed from INR (Indian Rupee) to KES (Kenyan Shilling) to support Kenyan businesses.

### Setup Instructions

1. Sign up for a Paystack account at [Paystack](https://paystack.com/)
2. Get your API keys from the Paystack dashboard
3. Update your environment variables with the Paystack keys
4. Test the payment flow to ensure it works correctly

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Paystack Documentation](https://paystack.com/docs/api/)
- [Paystack API Reference](https://paystack.com/docs/api/)