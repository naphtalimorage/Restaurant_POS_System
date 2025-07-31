import  { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import { enqueueSnackbar } from "notistack";

const Tables = () => {
  const [status, setStatus] = useState("all");

    useEffect(() => {
      document.title = "POS | Tables"
    }, [])

  const { data: resData, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      return await getTables();
    },
    placeholderData: keepPreviousData,
  });

  if(isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" })
  }

  console.log(resData);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-10 py-4 space-y-4 md:space-y-0">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-xl md:text-2xl font-bold tracking-wider">
            Tables
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-start md:justify-around gap-2 md:gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-sm md:text-lg ${
              status === "all" && "bg-[#383838]"
            } rounded-lg px-3 py-1 md:px-5 md:py-2 font-semibold whitespace-nowrap`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`text-[#ababab] text-sm md:text-lg ${
              status === "booked" && "bg-[#383838]"
            } rounded-lg px-3 py-1 md:px-5 md:py-2 font-semibold whitespace-nowrap`}
          >
            Booked
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 px-4 md:px-8 lg:px-16 py-4 h-[calc(100vh-12rem)] overflow-y-scroll scrollbar-hide">
        {resData?.data?.data
          ?.filter(table => status === "all" || (status === "booked" && table.status === "Booked"))
          .map((table) => {
            return (
              <TableCard
                key={table._id}
                id={table._id}
                name={table.tableNo}
                status={table.status}
                initials={table?.currentOrder?.customerDetails?.name}
                seats={table.seats}
              />
            );
          })}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;
