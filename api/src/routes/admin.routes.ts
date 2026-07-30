import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import {
  getStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createRewardItem,
  updateRewardItem,
  deleteRewardItem,
  getAllRewards,
  getAllAttendance,
  createLaptop,
  updateLaptop,
  deleteLaptop,
  getAllLaptops,
  getAllBookings,
  getAllMatchRequests,
  getAllClaims,
  exportUsersCSV,
} from "../controllers/admin.controller";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/stats", getStats);
router.get("/users/export-csv", exportUsersCSV);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/rewards", getAllRewards);
router.post("/rewards", createRewardItem);
router.put("/rewards/:id", updateRewardItem);
router.delete("/rewards/:id", deleteRewardItem);
router.get("/claims", getAllClaims);

router.get("/attendance", getAllAttendance);

router.get("/laptops", getAllLaptops);
router.post("/laptops", createLaptop);
router.put("/laptops/:id", updateLaptop);
router.delete("/laptops/:id", deleteLaptop);
router.get("/bookings", getAllBookings);

router.get("/match-requests", getAllMatchRequests);

export default router;
