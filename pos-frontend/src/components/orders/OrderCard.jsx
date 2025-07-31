import React from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";

const OrderCard = ({ key, order }) => {
  // Early return if order is undefined
  if (!order) {
    return null;
  }
  
  // Check if properties exist, if not use default values
  const customerName = order?.customerDetails?.name || "Guest";
  const orderDate = order?.orderDate || new Date();
  const tableNo = order?.table?.tableNo || "N/A";
  const orderStatus = order?.orderStatus || "Processing";
  const itemsCount = order?.items?.length || 0;
  const totalAmount = order?.bills?.totalWithTax ? order.bills.totalWithTax.toFixed(2) : "0.00";
  
  // Format order ID safely
  const orderId = orderDate instanceof Date ? Math.floor(new Date(orderDate).getTime()) : "";
  
  return (
    <div key={key} className="w-[500px] bg-[#262626] p-4 rounded-lg mb-4">
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {getAvatarName(customerName)}
        </button>
        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
              {customerName}
            </h1>
            <p className="text-[#ababab] text-sm">#{orderId} / Dine in</p>
            <p className="text-[#ababab] text-sm">Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {tableNo}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {orderStatus === "Ready" ? (
              <>
                <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg">
                  <FaCheckDouble className="inline mr-2" /> {orderStatus}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-green-600" /> Ready to
                  serve
                </p>
              </>
            ) : (
              <>
                <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg">
                  <FaCircle className="inline mr-2" /> {orderStatus}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-yellow-600" /> Preparing your order
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[#ababab]">
        <p>{formatDateAndTime(orderDate)}</p>
        <p>{itemsCount} Items</p>
      </div>
      <hr className="w-full mt-4 border-t-1 border-gray-500" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">₹{totalAmount}</p>
      </div>
    </div>
  );
};

export default OrderCard;
