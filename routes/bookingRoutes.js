import express from "express";
import {
  changeBookingStatus,
  checkAvailabilityCar,
  createBooking,
  getOwnerBooking,
  getUserBooking,
} from "../controllers/bookingContoller.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityCar);
bookingRouter.post("/create", protect, createBooking);
bookingRouter.get("/user", protect, getUserBooking);
bookingRouter.get("/owner", protect, getOwnerBooking);
bookingRouter.post("/change-status", protect, changeBookingStatus);

export default bookingRouter;
