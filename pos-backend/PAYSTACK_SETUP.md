# Paystack Integration Setup Guide

This document provides instructions for setting up Paystack integration with the Restaurant POS System.

## Prerequisites

1. A Paystack account (sign up at [Paystack](https://paystack.com/))
2. API keys from your Paystack dashboard
3. The Restaurant POS System backend and frontend running

## Environment Variables

Ensure the following environment variables are set in your `.env` file:

```
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
```

## Callback URL

The callback URL is the frontend page where users are redirected after completing a payment. In our application, this is set to:

```
http://localhost:5173/payment/confirmation
```

In production, you should update this to your actual domain:

```
https://your-domain.com/payment/confirmation
```

This URL is configured in the `createOrder` function in `controllers/paymentController.js`.

## Webhook URL

The webhook URL is the backend endpoint that receives event notifications from Paystack. Follow these steps to set it up:

1. Log in to your [Paystack Dashboard](https://dashboard.paystack.com/)
2. Go to Settings > API Keys & Webhooks
3. In the Webhooks section, click "Add Webhook"
4. Enter your webhook URL:
   - For local development: `https://your-ngrok-url.ngrok.io/api/payment/webhook-verification`
   - For production: `https://your-backend-domain.com/api/payment/webhook-verification`
5. Save the webhook secret provided by Paystack
6. Update your `.env` file with the webhook secret:
   ```
   PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
   ```

> **Note**: For local development, you'll need to use a tool like [ngrok](https://ngrok.com/) to expose your local server to the internet so Paystack can send webhook events to it.

## Testing the Integration

To test the Paystack integration:

1. Make sure both frontend and backend are running
2. Navigate to the menu page and add items to your cart
3. Proceed to checkout and select "Online" as the payment method
4. Click "Place Order" to initiate the Paystack payment
5. Complete the payment on the Paystack checkout page
6. You should be redirected to the payment confirmation page
7. The order should be created and the table status updated

## Webhook Events

The webhook endpoint (`/api/payment/webhook-verification`) handles the following Paystack events:

- `charge.success`: When a payment is successfully completed

When this event is received, the application:
1. Verifies the webhook signature
2. Processes the payment data
3. Creates a payment record in the database

## Troubleshooting

If you encounter issues with the Paystack integration:

1. Check that your API keys are correct
2. Verify that your webhook URL is accessible from the internet
3. Ensure the webhook secret is correctly set in your `.env` file
4. Check the server logs for any errors
5. Test with Paystack's test cards (available in the Paystack documentation)

## Additional Resources

- [Paystack API Documentation](https://paystack.com/docs/api/)
- [Paystack Webhook Guide](https://paystack.com/docs/payments/webhooks/)
- [Paystack Test Cards](https://paystack.com/docs/payments/test-payments/)