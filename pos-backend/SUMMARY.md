# Paystack Integration Update Summary

## Issue Description

Set correct URLs:
- Callback URL = frontend confirmation page
- Webhook URL = backend endpoint to handle payment events

## Changes Made

### 1. Created Frontend Confirmation Page

Created a new component `PaymentConfirmation.jsx` that:
- Receives the payment reference from Paystack via URL query parameters
- Verifies the payment with the backend
- Creates the order if payment is successful
- Shows a success message and allows viewing the receipt

### 2. Added Frontend Route for Payment Confirmation

Added a new route in `App.jsx`:
```jsx
<Route
  path="/payment/confirmation"
  element={<PaymentConfirmation />}
/>
```

### 3. Updated Backend Callback URL

Modified the `createOrder` function in `controllers/paymentController.js` to use the frontend confirmation page as the callback URL:

```javascript
const options = {
  amount: amount * 100,
  currency: "KES",
  reference: reference,
  callback_url: `http://localhost:5173/payment/confirmation`,
};
```

### 4. Updated Frontend Payment Flow

Modified `Bill.jsx` to:
- Remove the `window.handlePaystackCallback` function
- Update the comments to reflect the new payment flow
- Remove unused imports and functions

### 5. Created Documentation for Webhook Setup

Created `PAYSTACK_SETUP.md` with detailed instructions for:
- Setting up environment variables
- Configuring the callback URL
- Setting up the webhook URL in the Paystack dashboard
- Testing the integration
- Troubleshooting common issues

## Webhook URL Configuration

The webhook URL should be configured in the Paystack dashboard to point to:
```
https://your-backend-domain.com/api/payment/webhook-verification
```

For local development, a tool like ngrok is needed to expose the local server to the internet:
```
https://your-ngrok-url.ngrok.io/api/payment/webhook-verification
```

## Testing

To test the implementation:
1. Start the frontend and backend servers
2. Navigate to the menu and add items to the cart
3. Select "Online" as the payment method and place the order
4. Complete the payment on the Paystack checkout page
5. You should be redirected to the payment confirmation page
6. The order should be created and the table status updated

## Next Steps

1. In a production environment, update the callback URL to use the actual domain instead of localhost
2. Set up proper error handling for cases where the payment verification fails
3. Implement logging for payment events to help with debugging
4. Consider adding email notifications for successful payments