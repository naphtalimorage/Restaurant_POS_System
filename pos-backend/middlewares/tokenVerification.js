const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { supabase } = require("../config/supabase");

const isVerifiedUser = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;
        
        if(!accessToken){
            const error = createHttpError(401, "Please provide token!");
            return next(error);
        }

        // Verify and decode the token
        const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);

        // Get user from Supabase using the id from the token
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, phone, role, created_at, updated_at')
            .eq('id', decodeToken.id)
            .single();

        if(error || !user){
            const httpError = createHttpError(401, "User does not exist!");
            return next(httpError);
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        const err = createHttpError(401, "Invalid Token!");
        next(err);
    }
}

module.exports = { isVerifiedUser };