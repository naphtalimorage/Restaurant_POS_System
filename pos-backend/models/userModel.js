const { supabase } = require('../config/supabase');
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');

/**
 * User model for Supabase
 * 
 * Table structure in Supabase:
 * - id: uuid (primary key)
 * - name: text (not null)
 * - email: text (not null, unique)
 * - phone: text (not null)
 * - password: text (not null)
 * - role: text (not null)
 * - created_at: timestamptz (default: now())
 * - updated_at: timestamptz (default: now())
 */

// Validation functions
const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

const validatePhone = (phone) => {
  return /\d{10}/.test(phone);
};

// Create a new user
const createUser = async (userData) => {
  // Validate email
  if (!validateEmail(userData.email)) {
    throw new Error("Email must be in valid format!");
  }
  
  // Validate phone
  if (!validatePhone(userData.phone)) {
    throw new Error("Phone number must be a 10-digit number!");
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  // Generate UUID for the user
  const userId = uuidv4();
  
  // Prepare user data with hashed password
  const userToInsert = {
    id: userId,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: hashedPassword,
    role: userData.role,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  // Insert user into Supabase
  const { data, error } = await supabase
    .from('users')
    .insert(userToInsert)
    .select();
    
  if (error) throw error;
  
  return data[0];
};

module.exports = {
  createUser,
  validateEmail,
  validatePhone
};