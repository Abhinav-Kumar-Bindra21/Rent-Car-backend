import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import Car from "../models/Cars.js";
import fs from "fs";
import Booking from "../models/Booking.js";

// API to change role
export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { role: "owner" });
    res.status(200).json({ success: true, message: "Now you can list cars" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Api to list Car

export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;

    let car = JSON.parse(req.body.carData);

    const imageFile = req.file;

    //Upload image to imagekit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/cars",
    });

    // optimization through imagekit URL transformation
    var optimizedImageURL = imagekit.url({
      path: response.filePath,

      transformation: [
        {
          width: "1280", // Width resizing
        },

        { quality: "auto" }, // Auto Compression
        { format: "webp" }, // convert to modern format
      ],
    });

    const image = optimizedImageURL;
    await Car.create({ ...car, owner: _id, image });

    res.status(200).json({ success: true, message: "Car Added" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// API to list owner Cars

export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id });
    res.status(200).json({ success: true, message: "Owner cars", cars });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// API to toggle car availability

export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    //checking is car belongs to the car
    if (car.owner.toString() !== _id.toString()) {
      return res.status(400).json({ success: false, message: "Unauthorized" });
    }

    car.isAvaliable = !car.isAvaliable;
    await car.save();

    res.status(200).json({ success: true, message: "Availability Toggled" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//API to delete car
export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    //checking is car belongs to the car
    if (car.owner.toString() !== _id.toString()) {
      return res.status(400).json({ success: false, message: "Unauthorized" });
    }

    car.owner = null;
    car.isAvaliable = false;

    await car.save();

    res.status(200).json({ success: true, message: "Car is deleted !!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//API to get dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.body;

    if (role !== "owner") {
      return res.status(400).json({ success: false, message: "Unauthorized" });
    }

    const cars = await Car.find({ owner: _id });
    const bookings = await Booking.find({ owner: _id }).populate("car").sort({ createdAt: -1 });

    const pendingBookings = await Booking.find({ owner: _id, status: "pending" });
    const completedBookings = await Booking.find({ owner: _id, status: "confirmed" });

    // Calculate monthlyRevenue from boookings where status is confirmed

    const monthlyRevenue = bookings
      .slice()
      .filter((booking) => booking.status === "confirmed")
      .reduce((acc, booking) => acc + booking.price, 0);

    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
    };

    res.status(200).json({ success: true, dashboardData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//API to update user image

export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.body;

    const imageFile = req.file;

    //Upload image to imagekit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/users",
    });

    // optimization through imagekit URL transformation
    var optimizedImageURL = imagekit.url({
      path: response.filePath,

      transformation: [
        {
          width: "400", // Width resizing
        },

        { quality: "auto" }, // Auto Compression
        { format: "webp" }, // convert to modern format
      ],
    });

    const image = optimizedImageURL;

    await User.findByIdAndDelete(_id, { image });
    res.status(200).json({ success: true, message: "Image updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
