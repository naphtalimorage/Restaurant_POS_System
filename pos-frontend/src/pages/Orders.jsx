import  { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack"

const Orders = () => {

  const [status, setStatus] = useState("all");

    useEffect(() => {
      document.title = "POS | Orders"
    }, [])

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData
  })

  if(isError) {
    enqueueSnackbar("Something went wrong!", {variant: "error"})
  }

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-10 py-4 space-y-4 md:space-y-0">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-xl md:text-2xl font-bold tracking-wider">
            Orders
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-start md:justify-around gap-2 md:gap-4 overflow-x-auto">
          <button onClick={() => setStatus("all")} className={`text-[#ababab] text-sm md:text-lg ${status === "all" && "bg-[#383838]"}  rounded-lg px-3 py-1 md:px-5 md:py-2 font-semibold whitespace-nowrap`}>
            All
          </button>
          <button onClick={() => setStatus("progress")} className={`text-[#ababab] text-sm md:text-lg ${status === "progress" && "bg-[#383838]"}  rounded-lg px-3 py-1 md:px-5 md:py-2 font-semibold whitespace-nowrap`}>
            In Progress
          </button>
          <button onClick={() => setStatus("ready")} className={`text-[#ababab] text-sm md:text-lg ${status === "ready" && "bg-[#383838]"}  rounded-lg px-3 py-1 md:px-5 md:py-2 font-semibold whitespace-nowrap`}>
            Ready
          </button>
          <button onClick={() => setStatus("completed")} className={`text-[#ababab] text-sm md:text-lg ${status === "completed" && "bg-[#383838]"}  rounded-lg px-3 py-1 md:px-5 md:py-2 font-semibold whitespace-nowrap`}>
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 md:px-8 lg:px-16 py-4 overflow-y-scroll scrollbar-hide">
        {
          resData?.data.data.length > 0 ? (
            resData.data.data.map((order) => {
              return (
                <ErrorBoundary key={order._id}>
                  <OrderCard key={order._id} order={order} />
                </ErrorBoundary>
              )
            })
          ) : <p className="col-span-3 text-gray-500">No orders available</p>
        }
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;
