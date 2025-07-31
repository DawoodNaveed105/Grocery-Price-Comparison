import { generateToken } from "../../Lib/generateToken.js";
import User from "../../Models/userModel.js";
import bcrypt from "bcryptjs";
import axios from "axios";
import passport from "passport";

const CLIENT_ID = '1017338499210-apshja6d9rhdjeoqrlf4ki7c14rl1iv5.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback';


export const signUpController = async (req, res) => {
  try {
    const { username, fullname, password, email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email address",
      });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "Username already taken",
      });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        error: "Email already taken",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password should be at least 6 characters",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      fullname,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(200).json({
        _id: newUser._id,
        username: newUser.username,
        fullname: newUser.fullname,
        email: newUser.email,
      });
    } else {
      res.status(400).json({
        error: "Invalid User Data",
      });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
    });
    console.log(process.env.GOOGLE_CLIENT_ID);
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
export const logoutController = async (req, res) => {
  try {
    res.cookie("jwt","", { maxAge: 0 });
    res.status(200).json({
      message: "Logout Successful",
    });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getUsers = async(req, res) => { 
    try {
        const userList = await User.find()
        if(!userList){
            return res.status(404).json({
                error: "Users not found"
            })
        }
        res.status(200).json(userList)
    } catch (error) {
        console.log("Error in getUser Controller", error)
        res.status(500).json({error: "Internal server Error"})
    }
}
export const getMe = async(req, res) => {
    try {
        const user = req.user
        const newUser = await User.findById({_id: user._id})
        if(!newUser){
            return res.status(404).json({error: "User not found"})
        }
        res.status(200).json(newUser)
    } catch (error) {
        console.log("Error in getme Controller", error)
        res.status(500).json({error: "Internal server error"})
    }
}
export const changePassword = async(req, res) => {
    try {
     const{ email, currentPassword, newPassword} = req.body;
    let user = await User.findOne({email})
    if(!user){
        return res.status(400).json({error: "User Not Found"})
    }
    if((!currentPassword && newPassword) || (currentPassword && !newPassword)){
        return res.status(400).json({error: "Please Provide both new and current password"})
    }
    if(currentPassword && newPassword){
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if(!isMatch){
            return res.status(400).json({error: "Current Password is Incorrect"})
        }
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)
    }
    user = await user.save()
    user.password = null
    res.status(200).json(user)
    } catch (error) {
        console.log("Error in ChangePassowrd Controller", error)
        res.status(500).json({error: "Internal server error"})
    }   
}
export const delUser = async(req, res) => {
    try {
        const {id: userId} = req.params
        const user = await User.findByIdAndDelete(userId)
        if(!user){
            return res.status(404).json({error: "User Not Found"})
        }
        res.status(200).json({message: "User deleted successfully"})
    } catch (error) {
        console.log("Error in delUser Controller", error)
        res.status(500).json({error: "Internal server error"})
    }   
}
export const googleAuthController = (req, res) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res);
};
export const googleAuthCallbackController = (req, res) => {
  passport.authenticate("google", { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(400).json({ error: "Google authentication failed" });
    }
    generateToken(user._id, res);
    console.log("User authenticated with Google successfully", user);
    res.redirect("http://localhost:3000");
  })(req, res);
};
export const googleLogout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.cookie("jwt","", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  });
};    