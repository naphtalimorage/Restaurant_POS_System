import React from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";

const OrderCard = ({ order }) => {
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
    <div className="w-full bg-[#262626] p-3 md:p-4 rounded-lg mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
        <button className="bg-[#f6b100] p-2 md:p-3 text-lg md:text-xl font-bold rounded-lg">
          {getAvatarName(customerName)}
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 sm:gap-0">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-base md:text-lg font-semibold tracking-wide">
              {customerName}
            </h1>
            <p className="text-[#ababab] text-xs md:text-sm">#{orderId} / Dine in</p>
            <p className="text-[#ababab] text-xs md:text-sm">Table <FaLongArrowAltRight className="text-[#ababab] ml-1 md:ml-2 inline" /> {tableNo}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1 sm:gap-2 mt-2 sm:mt-0">
            {orderStatus === "Ready" ? (
              <>
                <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg text-xs md:text-sm">
                  <FaCheckDouble className="inline mr-1 md:mr-2" /> {orderStatus}
                </p>
                <p className="text-[#ababab] text-xs md:text-sm">
                  <FaCircle className="inline mr-1 md:mr-2 text-green-600" /> Ready to
                  serve
                </p>
              </>
            ) : (
              <>
                <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg text-xs md:text-sm">
                  <FaCircle className="inline mr-1 md:mr-2" /> {orderStatus}
                </p>
                <p className="text-[#ababab] text-xs md:text-sm">
                  <FaCircle className="inline mr-1 md:mr-2 text-yellow-600" /> Preparing your order
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 md:mt-4 text-[#ababab] text-xs md:text-sm">
        <p className="truncate max-w-full sm:max-w-[50%]">{formatDateAndTime(orderDate)}</p>
        <p className="mt-1 sm:mt-0">{itemsCount} Items</p>
      </div>
      <hr className="w-full mt-3 md:mt-4 border-t-1 border-gray-500" />
      <div className="flex items-center justify-between mt-3 md:mt-4">
        <h1 className="text-[#f5f5f5] text-base md:text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-base md:text-lg font-semibold">₹{totalAmount}</p>
      </div>
    </div>
  );
};

export default OrderCard;
