import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import {
  addOrder,
  createOrderPaystack,
  updateTable,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";

const Bill = () => {
  const dispatch = useDispatch();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState();
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState();

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", {
        variant: "warning",
      });

      return;
    }

    if (paymentMethod === "Online") {
      try {
        // Create order with Paystack
        const reqData = {
          amount: totalPriceWithTax.toFixed(2),
          // You can add customer information here if needed
          email: "customer@example.com", // In a real app, you'd use the customer's email
          metadata: {
            custom_fields: [
              {
                display_name: "Customer Name",
                variable_name: "customer_name",
                value: customerData.customerName || "Guest"
              }
            ]
          }
        };

        const { data } = await createOrderPaystack(reqData);

        if (!data.success) {
          enqueueSnackbar("Failed to initialize payment", {
            variant: "error",
          });
          return;
        }

        // Paystack provides a direct URL to their payment page
        // We'll redirect the user to this URL
        const order = data.order;
        
        // Log the public key for debugging
        console.log("Using Paystack public key:", import.meta.env.VITE_PAYSTACK_PUBLIC_KEY);
        
        // Store order information for verification after payment
        sessionStorage.setItem('paystack_reference', order.reference);
        
        // Open Paystack payment page in a new window or redirect
        window.location.href = order.authorization_url;
        
        // The verification will happen when the user is redirected back
        // We'll handle this in the PaymentConfirmation component
        
        // The flow is:
        // 1. Redirecting to Paystack payment page
        // 2. Paystack redirects back to our callback URL (/payment/confirmation)
        // 3. PaymentConfirmation component verifies the payment using the reference
        // 4. Then creates the order
      } catch (error) {
        console.log(error);
        enqueueSnackbar("Payment Failed!", {
          variant: "error",
        });
      }
    } else {
      // Place the order
      const orderData = {
        customerDetails: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
          guests: customerData.guests,
        },
        orderStatus: "In Progress",
        bills: {
          total: total,
          tax: tax,
          totalWithTax: totalPriceWithTax,
        },
        items: cartData,
        table: customerData.table.tableId,
        paymentMethod: paymentMethod,
      };
      orderMutation.mutate(orderData);
    }
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      console.log(data);

      setOrderInfo(data);

      // Update Table
      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };

      setTimeout(() => {
        tableUpdateMutation.mutate(tableData);
      }, 1500);

      enqueueSnackbar("Order Placed!", {
        variant: "success",
      });
      setShowInvoice(true);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: (resData) => {
      console.log(resData);
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Items({cartData.lenght})
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          ₹{total.toFixed(2)}
        </h1>
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">Tax(5.25%)</p>
        <h1 className="text-[#f5f5f5] text-md font-bold">₹{tax.toFixed(2)}</h1>
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Total With Tax
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          ₹{totalPriceWithTax.toFixed(2)}
        </h1>
      </div>
      <div className="flex items-center gap-3 px-5 mt-4">
        <button
          onClick={() => setPaymentMethod("Cash")}
          className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] font-semibold ${
            paymentMethod === "Cash" ? "bg-[#383737]" : ""
          }`}
        >
          Cash
        </button>
        <button
          onClick={() => setPaymentMethod("Online")}
          className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] font-semibold ${
            paymentMethod === "Online" ? "bg-[#383737]" : ""
          }`}
        >
          Online
        </button>
      </div>

      <div className="flex items-center gap-3 px-5 mt-4">
        <button className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-lg">
          Print Receipt
        </button>
        <button
          onClick={handlePlaceOrder}
          className="bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f] font-semibold text-lg"
        >
          Place Order
        </button>
      </div>

      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;
