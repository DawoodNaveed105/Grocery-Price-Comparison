import jwt from "jsonwebtoken"

export const generateToken = (userId, res) => { 
    const token = jwt.sign({userId}, process.env.JWTSECRETKEY, {
        expiresIn: "3h"
    })
    res.cookie("jwt", token, {
        maxAge: 3 * 60 * 60 * 10000,
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
		sameSite: "strict", // CSRF attacks cross-site request forgery attacks
		secure: process.env.NODE_ENV !== "development",
    })
}