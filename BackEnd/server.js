import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import { dbConnection } from "./Config/config.js"
import { authRoutes } from "./Routes/authRoutes.js"
import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import User from "./Models/userModel.js"
import { generateToken } from "./Lib/generateToken.js"
// import './MiddleWare/passport.js'
const app = express()

dotenv.config()
const port = 3000 || process.env.PORT

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async function(accessToken, refreshToken, profile, cb) {
  try {
    console.log("Google profile received:", profile);
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      // Try to find by email if username is duplicate
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        // Link Google ID to existing user
        user.googleId = profile.id;
        await user.save();
      } else {
        // Create a new user with a unique username
        let username = profile.displayName; // Start with the Google display name
        // Ensure username is unique in the database
        let count = 1;
        // If a user with this username exists, append a number and check again
        while (await User.findOne({ username })) {
          username = `${profile.displayName}${count++}`; // e.g., "John Doe1", "John Doe2", etc.
        }
        user = new User({
          googleId: profile.id,
          username,
          email: profile.emails[0].value
        });
        await user.save();
      }
    }
    return cb(null, user);
  } catch (error) {
    return cb(error, null);
  }
}
))

app.use(cookieParser())
app.use(express.urlencoded({limit: "50mb"}))
app.use("/api/auth", authRoutes)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  dbConnection()
})
