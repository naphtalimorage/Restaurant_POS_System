import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyPaymentPaystack } from '../../https/index';
import { enqueueSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { getTotalPrice } from '../../redux/slices/cartSlice';
import { addOrder, updateTable } from '../../https/index';
import { useMutation } from '@tanstack/react-query';
import { removeAllItems } from '../../redux/slices/cartSlice';
import { removeCustomer } from '../../redux/slices/customerSlice';
import Invoice from '../invoice/Invoice';

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  
  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

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
      enqueueSnackbar("Failed to place order", {
        variant: "error",
      });
      navigate('/menu');
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

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const reference = searchParams.get('reference');
        
        if (!reference) {
          enqueueSnackbar("No payment reference found", {
            variant: "error",
          });
          setIsVerifying(false);
          navigate('/menu');
          return;
        }
        
        // Verify the payment
        const verification = await verifyPaymentPaystack({ reference });
        
        if (verification.data.success) {
          enqueueSnackbar(verification.data.message, { variant: "success" });
          
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
            paymentMethod: "Online",
            paymentData: {
              paystack_reference: verification.data.data.reference,
              paystack_transaction_id: verification.data.data.transaction_id,
            },
          };
          
          orderMutation.mutate(orderData);
        } else {
          enqueueSnackbar("Payment verification failed", {
            variant: "error",
          });
          navigate('/menu');
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Payment verification failed", {
          variant: "error",
        });
        navigate('/menu');
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyPayment();
  }, []);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
        <p className="text-gray-400">Please wait while we confirm your payment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {!showInvoice ? (
        <>
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-400 text-center mb-6">
            Your payment has been processed successfully. Your order is now being prepared.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowInvoice(true)}
              className="px-6 py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View Receipt
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Back to Menu
            </button>
          </div>
        </>
      ) : (
        orderInfo && <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </div>
  );
};

export default PaymentConfirmation;