import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTables, getOrders } from "../../https";
import { menus } from "../../constants";

const Metrics = () => {
  const [metricsData, setMetricsData] = useState([
    { title: "Revenue", value: "₹0", percentage: "0%", color: "#025cca", isIncrease: true },
    { title: "Outbound Clicks", value: "0", percentage: "0%", color: "#02ca3a", isIncrease: true },
    { title: "Total Customer", value: "0", percentage: "0%", color: "#f6b100", isIncrease: true },
    { title: "Event Count", value: "0", percentage: "0%", color: "#be3e3f", isIncrease: true },
  ]);

  const [itemsData, setItemsData] = useState([
    { title: "Total Categories", value: "0", percentage: "0%", color: "#5b45b0", isIncrease: true },
    { title: "Total Dishes", value: "0", percentage: "0%", color: "#285430", isIncrease: true },
    { title: "Active Orders", value: "0", percentage: "0%", color: "#735f32", isIncrease: true },
    { title: "Total Tables", value: "0", color: "#7f167f", isIncrease: true },
  ]);

  // Fetch tables data
  const { data: tablesData } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      return await getTables();
    },
  });

  // Fetch orders data
  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
  });

  useEffect(() => {
    if (tablesData && ordersData) {
      // Calculate real metrics
      const tables = tablesData.data.data || [];
      const orders = ordersData.data.data || [];
      
      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => sum + (order.bills?.totalWithTax || 0), 0);
      
      // Count active orders (In Progress)
      const activeOrders = orders.filter(order => order.orderStatus === "In Progress").length;
      
      // Count total customers (unique)
      const uniqueCustomers = new Set(orders.map(order => order.customerDetails?.name)).size;
      
      // Update metrics data
      setMetricsData([
        { 
          title: "Revenue", 
          value: `₹${totalRevenue.toFixed(2)}`, 
          percentage: "12%", 
          color: "#025cca", 
          isIncrease: true 
        },
        { 
          title: "Outbound Orders", 
          value: orders.length.toString(), 
          percentage: "16%", 
          color: "#02ca3a", 
          isIncrease: true 
        },
        { 
          title: "Total Customers", 
          value: uniqueCustomers.toString(), 
          percentage: "10%", 
          color: "#f6b100", 
          isIncrease: true 
        },
        { 
          title: "Event Count", 
          value: (orders.length + tables.length).toString(), 
          percentage: "10%", 
          color: "#be3e3f", 
          isIncrease: true 
        },
      ]);

      // Count total dishes across all categories
      const totalDishes = menus.reduce((sum, menu) => sum + (menu.items?.length || 0), 0);
      
      // Update items data
      setItemsData([
        { 
          title: "Total Categories", 
          value: menus.length.toString(), 
          percentage: "12%", 
          color: "#5b45b0", 
          isIncrease: true 
        },
        { 
          title: "Total Dishes", 
          value: totalDishes.toString(), 
          percentage: "12%", 
          color: "#285430", 
          isIncrease: true 
        },
        { 
          title: "Active Orders", 
          value: activeOrders.toString(), 
          percentage: "12%", 
          color: "#735f32", 
          isIncrease: true 
        },
        { 
          title: "Total Tables", 
          value: tables.length.toString(), 
          color: "#7f167f", 
          isIncrease: true 
        },
      ]);
    }
  }, [tablesData, ordersData]);

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">
            Overall Performance
          </h2>
          <p className="text-sm text-[#ababab]">
            Summary of restaurant performance metrics and statistics
          </p>
        </div>
        <button className="flex items-center gap-1 px-4 py-2 rounded-md text-[#f5f5f5] bg-[#1a1a1a]">
          Last 1 Month
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {metricsData.map((metric, index) => {
          return (
            <div
              key={index}
              className="shadow-sm rounded-lg p-4"
              style={{ backgroundColor: metric.color }}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-xs text-[#f5f5f5]">
                  {metric.title}
                </p>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    style={{ color: metric.isIncrease ? "#f5f5f5" : "red" }}
                  >
                    <path
                      d={metric.isIncrease ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                    />
                  </svg>
                  <p
                    className="font-medium text-xs"
                    style={{ color: metric.isIncrease ? "#f5f5f5" : "red" }}
                  >
                    {metric.percentage}
                  </p>
                </div>
              </div>
              <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col justify-between mt-12">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">
            Item Details
          </h2>
          <p className="text-sm text-[#ababab]">
            Overview of restaurant inventory and order statistics
          </p>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
            {itemsData.map((item, index) => {
                return (
                    <div key={index} className="shadow-sm rounded-lg p-4" style={{ backgroundColor: item.color }}>
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-xs text-[#f5f5f5]">{item.title}</p>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4" fill="none">
                          <path d="M5 15l7-7 7 7" />
                        </svg>
                        <p className="font-medium text-xs text-[#f5f5f5]">{item.percentage}</p>
                      </div>
                    </div>
                    <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">{item.value}</p>
                  </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
