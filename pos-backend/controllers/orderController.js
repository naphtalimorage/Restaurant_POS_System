const createHttpError = require("http-errors");
const { createOrder, getOrderById, getAllOrders, updateOrderStatus } = require("../models/orderModel");
const { validate: isUUID } = require('uuid');

const addOrder = async (req, res, next) => {
  try {
    // Create order using the model function
    const order = await createOrder(req.body);
    
    res.status(201).json({ 
      success: true, 
      message: "Order created!", 
      data: order 
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!isUUID(id)) {
      const error = createHttpError(404, "Invalid id format!");
      return next(error);
    }

    try {
      // Get order by ID using the model function
      const order = await getOrderById(id);
      
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      // If order not found or other error
      const httpError = createHttpError(404, "Order not found!");
      return next(httpError);
    }
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    // Get all orders using the model function
    const orders = await getAllOrders();
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    // Validate UUID format
    if (!isUUID(id)) {
      const error = createHttpError(404, "Invalid id format!");
      return next(error);
    }

    try {
      // Update order status using the model function
      const order = await updateOrderStatus(id, orderStatus);
      
      res.status(200).json({ 
        success: true, 
        message: "Order updated", 
        data: order 
      });
    } catch (error) {
      // If order not found or other error
      const httpError = createHttpError(404, "Order not found!");
      return next(httpError);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrder, getOrder, getOrders, updateOrder };
