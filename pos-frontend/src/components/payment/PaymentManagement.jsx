import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getPayments } from "../../https/index";
import { formatDateAndTime } from "../../utils";

const PaymentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: resData, isError, isLoading, error } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      try {
        return await getPayments();
      } catch (error) {
        // Handle 404 errors specifically
        if (error.response && error.response.status === 404) {
          console.error("Payment API endpoint not found. Make sure the backend server is running.");
          return { data: { data: [] } }; // Return empty data structure to prevent errors
        }
        throw error; // Re-throw other errors to be handled by React Query
      }
    },
    placeholderData: keepPreviousData,
    retry: false, // Don't retry on 404 errors
  });

  // Show a more specific error message based on the error type
  if (isError) {
    const errorMessage = error?.response?.status === 404
      ? "Payment API endpoint not found. Make sure the backend server is running."
      : "Something went wrong while fetching payments!";
    
    enqueueSnackbar(errorMessage, { variant: "error" });
  }

  // Filter payments based on search term and status filter
  const filteredPayments = resData?.data?.data?.filter(payment => {
    const matchesSearch = 
      searchTerm === "" || 
      (payment.payment_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.order_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (payment.status || '').toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
        Payment Management
      </h2>

      {/* Search and Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by payment ID, order ID, or email"
            className="w-full bg-[#1a1a1a] text-[#f5f5f5] border border-gray-600 p-2 rounded-lg focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="bg-[#1a1a1a] text-[#f5f5f5] border border-gray-600 p-2 rounded-lg focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {filteredPayments.length === 0 ? (
            <div className="text-center text-[#ababab] py-8">
              No payments found matching your criteria.
            </div>
          ) : (
            <table className="w-full text-left text-[#f5f5f5]">
              <thead className="bg-[#333] text-[#ababab]">
                <tr>
                  <th className="p-3">Payment ID</th>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <tr
                    key={payment.id || payment.payment_id || index}
                    className="border-b border-gray-600 hover:bg-[#333]"
                  >
                    <td className="p-4">{payment.payment_id || 'N/A'}</td>
                    <td className="p-4">{payment.order_id || 'N/A'}</td>
                    <td className="p-4">₹{payment.amount || 0}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs ${
                          (payment.status || '') === "success"
                            ? "bg-green-900 text-green-300"
                            : (payment.status || '') === "pending"
                            ? "bg-yellow-900 text-yellow-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {payment.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4">{payment.method || 'N/A'}</td>
                    <td className="p-4">{payment.email || "N/A"}</td>
                    <td className="p-4">{payment.created_at ? formatDateAndTime(payment.created_at) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;