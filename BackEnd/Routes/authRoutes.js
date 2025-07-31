import express from "express"
import { changePassword, delUser, getMe, getUsers, googleAuthCallbackController, googleAuthController, googleLogout, loginController, logoutController, signUpController } from "../Controllers/authControllers/authComtrollers.js"
import { protectedRoute } from "../MiddleWare/protectedRoute.js"

export const authRoutes = express.Router()

authRoutes.route("/signup").post(signUpController)
authRoutes.route("/users").get(getUsers)
authRoutes.route("/login").post(loginController)
authRoutes.route("/logout").post(logoutController)
authRoutes.route("/getme").get(protectedRoute, getMe)
authRoutes.route("/change").post(changePassword)
authRoutes.route("/del/:id").delete(delUser)
authRoutes.route("/google").get(googleAuthController);
authRoutes.route("/google/callback").get(googleAuthCallbackController);
authRoutes.route("/google/logout").post(googleLogout);

