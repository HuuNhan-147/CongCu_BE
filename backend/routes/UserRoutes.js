import express from "express";
import {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  updateUserByAdmin,
  getAllUsers,
  forgotPassword,
  getUserOrders,
  resetPassword,
  updatePassword,
  getUserById,
  searchUsers,
} from "../controller/UserController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/update-password", protect, updatePassword);
router.get("/order", protect, getUserOrders);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/", protect, admin, getAllUsers);
router.delete("/:id", protect, admin, deleteUser);
router.put("/:id", protect, admin, updateUserByAdmin);
router.get("/search", protect, admin, searchUsers);
router.get("/:id", protect, admin, getUserById);

export default router;

