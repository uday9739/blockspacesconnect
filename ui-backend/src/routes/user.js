/* eslint-disable linebreak-style */
import express from "express";
// eslint-disable-next-line new-cap
const router = express.Router();
import userController from "../controllers/user.controller.js";
import authenticateUser from "../middleware/authenticateUser.js";

// Get details for current logged in user
router.get("/current", authenticateUser, userController.getCurrent);

// Register a new User
router.post("/register", userController.register);

// Get User Details by Id - My Profile
// router.get('/getUserDetails/:id', userController.getUserDetails);

// Update User Details by Id - My Profile
// router.put('/updateUserDetails/:id', userController.updateUserDetails);

// Login - Authenticate User
router.post("/login", userController.logIn);

// Logout - Invalidate authentication cookie(s)
router.get("/logout", userController.logout);

// Get API Key Details by Id
// router.get('/getAPIKeyDetails/:clientId', userController.getAPIKeyDetails);

// Generate API Key
// router.post('/generateNewAPIKey', userController.generateNewAPIKey);

// Delete an API Key
// router.delete("/deleteAPIKey/:id", userController.deleteAPIKey);

// Auth user through API
// router.post('/authAPIuser', userController.authAPIuser);

export default router;
