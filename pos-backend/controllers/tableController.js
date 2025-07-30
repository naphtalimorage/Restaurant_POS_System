const { createTable, getAllTables, updateTable: updateTableModel, findTableByNumber } = require("../models/tableModel");
const createHttpError = require("http-errors");
const { validate: isUUID } = require('uuid');

const addTable = async (req, res, next) => {
  try {
    const { tableNo, seats } = req.body;
    
    if (!tableNo) {
      const error = createHttpError(400, "Please provide table No!");
      return next(error);
    }
    
    try {
      // Create table using the model function
      const newTable = await createTable({ tableNo, seats });
      
      res.status(201).json({ 
        success: true, 
        message: "Table added!", 
        data: newTable 
      });
    } catch (error) {
      // If table already exists or other error
      if (error.message === 'Table already exists!') {
        const httpError = createHttpError(400, "Table already exists!");
        return next(httpError);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

const getTables = async (req, res, next) => {
  try {
    // Get all tables using the model function
    const tables = await getAllTables();
    
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const { status, orderId } = req.body;
    const { id } = req.params;

    // Validate UUID format
    if (!isUUID(id)) {
      const error = createHttpError(404, "Invalid id format!");
      return next(error);
    }

    try {
      // Update table using the model function
      const table = await updateTableModel(id, { 
        status, 
        currentOrder: orderId 
      });
      
      res.status(200).json({
        success: true, 
        message: "Table updated!", 
        data: table
      });
    } catch (error) {
      // If table not found or other error
      const httpError = createHttpError(404, "Table not found!");
      return next(httpError);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { addTable, getTables, updateTable };
