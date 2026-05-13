// function to check Availability of car for a given Data

import Booking from "../models/Booking.js";
import Car from "../models/Cars.js";

const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    cars,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
  });

  return booking.length === 0;
};

//API to check Availability of Cars for the given Date and Location

export const checkAvailabilityCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    //fetch all available cars for the given location

    const cars = await Car.find({ location, isAvaliable: true });

    if (!cars) {
      return res.status(400).json({ success: false, message: "Car is not available" });
    }

    // check car availability for the given date range using promise
    const availableCarsPromises = cars.map(async (car) => {
      const isAvaliable = await checkAvailability(car._id, pickupDate, returnDate);

      return { ...car._doc, isAvaliable: isAvaliable };
    });

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter((car) => car.isAvaliable === true);

    res.status(200).json({ success: true, availableCars });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//API to create booking

export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { car, pickupDate, returnDate } = req.body;
    const isAvaliable = await checkAvailability(car, pickupDate, returnDate);

    if (!isAvaliable) {
      return res.status(400).json({ success: false, message: "Car is not available" });
    }

    const carData = await Car.findById(car);
    //Calculate price based on pivkupDate and returnDate
    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const noOfDay = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));

    const price = carData.pricePerDay * noOfDay;

    await Booking.create({ car, pwner: carData.owner, user: _id, pickupDate, returnDate, price });

    res.status(200).json({ success: true, message: "Booking Created" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// api to list user Booking

export const getUserBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id }).populate("car").sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//API to get Owner Bookings

export const getOwnerBooking = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(400).json({ success: false, message: "Unauthorized" });
    }

    const bookings = await BoOking.find({ owner: req.user._id })
      .populate("car user")
      .select("-user.password")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//API to change bookings status

export const changeBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId);

    if (booking.owner.toString() !== _id.toString()) {
      return res.status(400).jon({ success: false, message: "Unauthorized" });
    }

    booking.status = status;
    await Booking.save();

    res.status(200).json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
