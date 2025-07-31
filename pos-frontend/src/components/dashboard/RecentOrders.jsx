import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../../https/index";
import { formatDateAndTime } from "../../utils";

const RecentOrders = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const handleStatusChange = ({orderId, orderStatus}) => {
    orderStatusUpdateMutation.mutate({orderId, orderStatus});
  };

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({orderId, orderStatus}) => updateOrderStatus({orderId, orderStatus}),
    onSuccess: () => {
      enqueueSnackbar("Order status updated successfully!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]); // Refresh order list
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status!", { variant: "error" });
    }
  })

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }
  
  // Filter orders based on search term and status filter
  const filteredOrders = resData?.data?.data?.filter(order => {
    const matchesSearch = 
      searchTerm === "" || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table.tableNo.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === "all" || 
      order.orderStatus.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };
  
  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
        Order Management
      </h2>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by order ID, customer name, or table number"
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
            <option value="in progress">In Progress</option>
            <option value="ready">Ready</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            {currentOrders.length === 0 ? (
              <div className="text-center text-[#ababab] py-8">
                No orders found matching your criteria.
              </div>
            ) : (
              <table className="w-full text-left text-[#f5f5f5]">
                <thead className="bg-[#333] text-[#ababab]">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Table No</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-gray-600 hover:bg-[#333]"
                    >
                      <td className="p-4">#{Math.floor(new Date(order.orderDate).getTime())}</td>
                      <td className="p-4">{order.customerDetails.name}</td>
                      <td className="p-4">
                        <select
                          className={`bg-[#1a1a1a] text-[#f5f5f5] border border-gray-500 p-2 rounded-lg focus:outline-none ${
                            order.orderStatus === "Ready"
                              ? "text-green-500"
                              : "text-yellow-500"
                          }`}
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange({orderId: order._id, orderStatus: e.target.value})}
                        >
                          <option className="text-yellow-500" value="In Progress">
                            In Progress
                          </option>
                          <option className="text-green-500" value="Ready">
                            Ready
                          </option>
                        </select>
                      </td>
                      <td className="p-4">{formatDateAndTime(order.orderDate)}</td>
                      <td className="p-4">{order.items.length} Items</td>
                      <td className="p-4">Table - {order.table.tableNo}</td>
                      <td className="p-4">₹{order.bills.totalWithTax}</td>
                      <td className="p-4">{order.paymentMethod}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === 1
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-[#1a1a1a] text-[#f5f5f5] hover:bg-[#333]"
                  }`}
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-[#333] text-[#f5f5f5] rounded-lg">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === totalPages
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-[#1a1a1a] text-[#f5f5f5] hover:bg-[#333]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#262626] p-6 rounded-lg shadow-lg w-3/4 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#f5f5f5] text-xl font-semibold">Order Details</h2>
              <button
                onClick={handleCloseDetails}
                className="text-[#f5f5f5] hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-[#ababab] text-sm mb-2">Customer Information</h3>
                <div className="bg-[#1f1f1f] p-4 rounded-lg">
                  <p className="text-[#f5f5f5]"><span className="text-[#ababab]">Name:</span> {selectedOrder.customerDetails.name}</p>
                  <p className="text-[#f5f5f5]"><span className="text-[#ababab]">Phone:</span> {selectedOrder.customerDetails.phone || 'N/A'}</p>
                  <p className="text-[#f5f5f5]"><span className="text-[#ababab]">Guests:</span> {selectedOrder.customerDetails.guests}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-[#ababab] text-sm mb-2">Order Information</h3>
                <div className="bg-[#1f1f1f] p-4 rounded-lg">
                  <p className="text-[#f5f5f5]"><span className="text-[#ababab]">Order ID:</span> #{Math.floor(new Date(selectedOrder.orderDate).getTime())}</p>
                  <p className="text-[#f5f5f5]"><span className="text-[#ababab]">Date:</span> {formatDateAndTime(selectedOrder.orderDate)}</p>
                  <p className="text-[#f5f5f5]"><span className="text-[#ababab]">Status:</span> {selectedOrder.orderStatus}</p>
                  <p className="text-[#f5f5f5]"><span className="text-[#ababab]">Table:</span> {selectedOrder.table.tableNo}</p>
                  <p className="text-[#f5f5f5]"><span className="text-[#ababab]">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-[#ababab] text-sm mb-2">Order Items</h3>
            <div className="bg-[#1f1f1f] p-4 rounded-lg mb-6">
              <table className="w-full text-left text-[#f5f5f5]">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={`${item.name}-${index}`} className="border-b border-gray-700">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">₹{item.price}</td>
                      <td className="p-2">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-700">
                  <tr>
                    <td colSpan="3" className="p-2 text-right font-semibold">Subtotal:</td>
                    <td className="p-2">₹{selectedOrder.bills.total}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="p-2 text-right font-semibold">Tax:</td>
                    <td className="p-2">₹{selectedOrder.bills.tax}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="p-2 text-right font-semibold">Total:</td>
                    <td className="p-2 font-bold">₹{selectedOrder.bills.totalWithTax}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleCloseDetails}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
