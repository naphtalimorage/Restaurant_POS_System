const createHttpError = require("http-errors");
const { createUser, validateEmail, validatePhone } = require("../models/userModel");
const { supabase } = require("../config/supabase");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const register = async (req, res, next) => {
    try {
        const { name, phone, email, password, role } = req.body;

        if(!name || !phone || !email || !password || !role){
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
            
        if(existingUser){
            const error = createHttpError(400, "User already exists!");
            return next(error);
        }

        // Create new user using the model function
        const userData = { name, phone, email, password, role };
        const newUser = await createUser(userData);

        // Remove password from response
        delete newUser.password;

        res.status(201).json({
            success: true, 
            message: "New user created!", 
            data: newUser
        });

    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        // Find user by email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
            
        if(userError || !user){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        // Generate JWT token
        const accessToken = jwt.sign({id: user.id}, config.accessTokenSecret, {
            expiresIn : '1d'
        });

        // Set cookie
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 *24 * 30,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });

        // Remove password from response
        delete user.password;

        res.status(200).json({
            success: true, 
            message: "User login successfully!", 
            data: user
        });

    } catch (error) {
        next(error);
    }
}

const getUserData = async (req, res, next) => {
    try {
        // Get user data by ID
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, phone, role, created_at, updated_at')
            .eq('id', req.user.id)
            .single();
            
        if(error || !user){
            const httpError = createHttpError(404, "User not found");
            return next(httpError);
        }
        
        res.status(200).json({success: true, data: user});

    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.status(200).json({success: true, message: "User logout successfully!"});
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login, getUserData, logout }