import { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation, useQuery } from "@tanstack/react-query";
import { logout, getTables, getOrders, getPayments } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { menus } from "../../constants";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Fetch data for search
  const { data: tablesData, isLoading: isTablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      return await getTables();
    },
    enabled: userData.isAuth,
  });

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    enabled: userData.isAuth,
  });

  const { data: paymentsData, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      return await getPayments();
    },
    enabled: userData.isAuth && userData.role === "Admin",
  });
  
  // Determine if any data is loading
  const isLoading = isTablesLoading || isOrdersLoading || (userData.role === "Admin" && isPaymentsLoading);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const results = [];

    // Search tables
    if (tablesData?.data?.data) {
      const tableResults = tablesData.data.data
        .filter(table => 
          (table.tableNo?.toString() || '').toLowerCase().includes(searchTermLower) ||
          (table.status || '').toLowerCase().includes(searchTermLower)
        )
        .map(table => ({
          id: table.id || '',
          name: `Table ${table.tableNo || 'Unknown'}`,
          type: "table",
          status: table.status || '',
          route: "/tables"
        }));
      results.push(...tableResults);
    }

    // Search orders
    if (ordersData?.data?.data) {
      const orderResults = ordersData.data.data
        .filter(order => 
          (order.id || '').toLowerCase().includes(searchTermLower) ||
          (order.customerDetails?.name || '').toLowerCase().includes(searchTermLower) ||
          (order.orderStatus || '').toLowerCase().includes(searchTermLower)
        )
        .map(order => ({
          id: order.id || '',
          name: `Order: ${order.customerDetails?.name || 'Unknown'}`,
          type: "order",
          status: order.orderStatus || '',
          route: "/orders"
        }));
      results.push(...orderResults);
    }

    // Search menu items
    const menuResults = [];
    menus.forEach(menu => {
      if (menu.items) {
        const itemResults = menu.items
          .filter(item => 
            (item.name || '').toLowerCase().includes(searchTermLower) ||
            (item.category || '').toLowerCase().includes(searchTermLower)
          )
          .map(item => ({
            id: item.id || '',
            name: item.name || 'Unknown Item',
            type: "menu",
            category: menu.name || 'Uncategorized',
            price: item.price || 0,
            route: "/menu"
          }));
        menuResults.push(...itemResults);
      }
    });
    results.push(...menuResults);

    // Search payments (admin only)
    if (userData.role === "Admin" && paymentsData?.data?.data) {
      const paymentResults = paymentsData.data.data
        .filter(payment => 
          (payment.payment_id || '').toLowerCase().includes(searchTermLower) ||
          (payment.order_id || '').toLowerCase().includes(searchTermLower) ||
          (payment.status || '').toLowerCase().includes(searchTermLower) ||
          (payment.email || '').toLowerCase().includes(searchTermLower)
        )
        .map(payment => ({
          id: payment.id || '',
          name: `Payment: ${payment.payment_id || 'Unknown'}`,
          type: "payment",
          status: payment.status || '',
          amount: payment.amount || 0,
          route: "/dashboard"
        }));
      results.push(...paymentResults);
    }

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
    setShowResults(results.length > 0);
  }, [searchTerm, tablesData, ordersData, paymentsData, userData.role]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleResultClick = (result) => {
    setShowResults(false);
    navigate(result.route);
  };

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: (data) => {
      console.log(data);
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a]">
      {/* LOGO */}
      <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
        <img src={logo} className="h-8 w-8" alt="restro logo" />
        <h1 className="text-lg font-semibold text-[#f5f5f5] tracking-wide">
          Restro
        </h1>
      </div>

      {/* SEARCH */}
      <div ref={searchRef} className="relative flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-5 py-2 w-[500px]">
        <FaSearch className="text-[#f5f5f5]" />
        <input
          type="text"
          placeholder="Search tables, orders, menu items..."
          className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        
        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#262626] rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
            <div className="p-2">
              {isLoading ? (
                /* Loading indicator */
                <div className="px-3 py-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-400 mb-2"></div>
                  <p className="text-[#ababab]">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                /* Group results by type */
                ['table', 'order', 'menu', 'payment'].map(type => {
                  const typeResults = searchResults.filter(result => result.type === type);
                  if (typeResults.length === 0) return null;
                  
                  return (
                    <div key={type} className="mb-3">
                      <h3 className="text-[#ababab] text-xs uppercase font-semibold px-3 py-1">
                        {type === 'table' ? 'Tables' : 
                         type === 'order' ? 'Orders' : 
                         type === 'menu' ? 'Menu Items' : 'Payments'}
                      </h3>
                      {typeResults.map(result => (
                        <div 
                          key={`${result.type}-${result.id}`}
                          className="px-3 py-2 hover:bg-[#333] cursor-pointer rounded-md"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[#f5f5f5] font-medium">{result.name}</span>
                            {result.status && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                result.status === 'Booked' || result.status === 'Ready' || result.status === 'success' 
                                  ? 'bg-green-900 text-green-300' 
                                  : 'bg-yellow-900 text-yellow-300'
                              }`}>
                                {result.status}
                              </span>
                            )}
                          </div>
                          {result.type === 'menu' && (
                            <div className="flex justify-between text-xs text-[#ababab] mt-1">
                              <span>{result.category}</span>
                              <span>₹{result.price}</span>
                            </div>
                          )}
                          {result.type === 'payment' && (
                            <div className="text-xs text-[#ababab] mt-1">
                              <span>₹{result.amount}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                /* No results message */
                <div className="px-3 py-4 text-center">
                  <p className="text-[#ababab]">No results found for &quot;{searchTerm}&quot;</p>
                  <p className="text-xs text-[#ababab] mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* LOGGED USER DETAILS */}
      <div className="flex items-center gap-4">
        {userData.role === "Admin" && (
          <div onClick={() => navigate("/dashboard")} className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer">
            <MdDashboard className="text-[#f5f5f5] text-2xl" />
          </div>
        )}
        <div className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer">
          <FaBell className="text-[#f5f5f5] text-2xl" />
        </div>
        <div className="flex items-center gap-3 cursor-pointer">
          <FaUserCircle className="text-[#f5f5f5] text-4xl" />
          <div className="flex flex-col items-start">
            <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
              {userData.name || "TEST USER"}
            </h1>
            <p className="text-xs text-[#ababab] font-medium">
              {userData.role || "Role"}
            </p>
          </div>
          <IoLogOut
            onClick={handleLogout}
            className="text-[#f5f5f5] ml-2"
            size={40}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
