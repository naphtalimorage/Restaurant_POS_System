# Restaurant POS System

A comprehensive Point of Sale (POS) system for restaurants, built with modern web technologies. This system helps restaurant staff manage orders, tables, payments, and user authentication efficiently.

## Features

- **User Authentication**
  - Secure login and registration using Supabase authentication
  - Role-based access control (Admin, Cashier, Waiter)

- **Order Management**
  - Create and manage orders
  - Track order status
  - Associate orders with tables

- **Table Management**
  - Add and manage restaurant tables
  - View table status (occupied, available)
  - Associate tables with orders

- **Payment Processing**
  - Process payments using Paystack
  - Verify payment status
  - Generate receipts

## Tech Stack

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- React Query for data fetching
- Tailwind CSS for styling
- React Router for navigation
- Notistack for notifications
- Supabase for authentication and data storage

### Backend
- Node.js with Express
- Supabase for database and authentication
- JWT for token-based authentication
- bcrypt for password hashing

## Project Structure

The project is divided into two main parts:

- **pos-frontend**: Contains the React frontend application
- **pos-backend**: Contains the Node.js backend API

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd pos-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ACCESS_TOKEN_SECRET=your_jwt_secret
   ```

4. Run the database schema:
   ```
   npm run db:setup
   ```

5. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd pos-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Authentication

1. **Sign Up**: New users can register with their name, email, phone, password, and role.
2. **Sign In**: Existing users can log in with their email and password.

### Order Management

1. **Create Order**: Select a table, add items, and create a new order.
2. **View Orders**: See all orders and their status.
3. **Update Order Status**: Change order status (e.g., pending, completed).

### Table Management

1. **Add Table**: Add a new table with a name and capacity.
2. **View Tables**: See all tables and their status.
3. **Update Table Status**: Change table status (e.g., available, occupied).

### Payment Processing

1. **Process Payment**: Select an order and process payment.
2. **Verify Payment**: Verify payment status.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for authentication and database services
- [Paystack](https://paystack.com/) for payment processing
- All contributors who have helped with the development of this project