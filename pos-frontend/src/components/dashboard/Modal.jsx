import { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation } from "@tanstack/react-query";
import { addTable } from "../../https";
import { enqueueSnackbar } from "notistack";
import PropTypes from 'prop-types';

const Modal = ({ modalType, setIsModalOpen }) => {
  // Table form state
  const [tableData, setTableData] = useState({
    tableNo: "",
    seats: "",
  });

  // Category form state
  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
  });

  // Dish form state
  const [dishData, setDishData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });

  const handleTableInputChange = (e) => {
    const { name, value } = e.target;
    setTableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDishInputChange = (e) => {
    const { name, value } = e.target;
    setDishData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableSubmit = (e) => {
    e.preventDefault();
    tableMutation.mutate(tableData);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    // Mock successful submission for now
    enqueueSnackbar("Category added successfully!", { variant: "success" });
    setIsModalOpen();
  };

  const handleDishSubmit = (e) => {
    e.preventDefault();
    // Mock successful submission for now
    enqueueSnackbar("Dish added successfully!", { variant: "success" });
    setIsModalOpen();
  };

  const handleCloseModal = () => {
    setIsModalOpen();
  };

  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),
    onSuccess: (res) => {
      setIsModalOpen();
      const { data } = res;
      enqueueSnackbar(data.message, { variant: "success" });
    },
    onError: (error) => {
      const { data } = error.response;
      enqueueSnackbar(data.message, { variant: "error" });
    }
  });

  // Determine modal title based on modalType
  const getModalTitle = () => {
    switch (modalType) {
      case "table":
        return "Add Table";
      case "category":
        return "Add Category";
      case "dishes":
        return "Add Dish";
      default:
        return "Add Item";
    }
  };

  // Render the appropriate form based on modalType
  const renderForm = () => {
    switch (modalType) {
      case "table":
        return (
          <form onSubmit={handleTableSubmit} className="space-y-4 mt-10">
            <div>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                Table Number
              </label>
              <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                <input
                  type="number"
                  name="tableNo"
                  value={tableData.tableNo}
                  onChange={handleTableInputChange}
                  className="bg-transparent flex-1 text-white focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                Number of Seats
              </label>
              <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                <input
                  type="number"
                  name="seats"
                  value={tableData.seats}
                  onChange={handleTableInputChange}
                  className="bg-transparent flex-1 text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg mt-10 mb-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
            >
              Add Table
            </button>
          </form>
        );
      case "category":
        return (
          <form onSubmit={handleCategorySubmit} className="space-y-4 mt-10">
            <div>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                Category Name
              </label>
              <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                <input
                  type="text"
                  name="name"
                  value={categoryData.name}
                  onChange={handleCategoryInputChange}
                  className="bg-transparent flex-1 text-white focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                Description
              </label>
              <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                <textarea
                  name="description"
                  value={categoryData.description}
                  onChange={handleCategoryInputChange}
                  className="bg-transparent flex-1 text-white focus:outline-none"
                  rows="3"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg mt-10 mb-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
            >
              Add Category
            </button>
          </form>
        );
      case "dishes":
        return (
          <form onSubmit={handleDishSubmit} className="space-y-4 mt-10">
            <div>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                Dish Name
              </label>
              <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                <input
                  type="text"
                  name="name"
                  value={dishData.name}
                  onChange={handleDishInputChange}
                  className="bg-transparent flex-1 text-white focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                Price
              </label>
              <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                <input
                  type="number"
                  name="price"
                  value={dishData.price}
                  onChange={handleDishInputChange}
                  className="bg-transparent flex-1 text-white focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                Category
              </label>
              <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                <select
                  name="category"
                  value={dishData.category}
                  onChange={handleDishInputChange}
                  className="bg-transparent flex-1 text-white focus:outline-none"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Starters">Starters</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                Description
              </label>
              <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                <textarea
                  name="description"
                  value={dishData.description}
                  onChange={handleDishInputChange}
                  className="bg-transparent flex-1 text-white focus:outline-none"
                  rows="3"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg mt-10 mb-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
            >
              Add Dish
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#262626] p-6 rounded-lg shadow-lg w-96"
      >
        {/* Modal Header */}
        <div className="flex justify-between item-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">{getModalTitle()}</h2>
          <button
            onClick={handleCloseModal}
            className="text-[#f5f5f5] hover:text-red-500"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Modal Body */}
        {renderForm()}
      </motion.div>
    </div>
  );
};

Modal.propTypes = {
  modalType: PropTypes.string.isRequired,
  setIsModalOpen: PropTypes.func.isRequired
};

export default Modal;
