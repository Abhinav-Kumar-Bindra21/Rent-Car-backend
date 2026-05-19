import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "./generateToken.js";
import Car from "../models/Cars.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: "All fields must be field" });
    }

    const userExits = await User.findOne({ email });

    if (userExits) {
      return res.status(400).json({ success: false, message: "User already exits!!" });
    }

    const hashedPasword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPasword,
    });

    const token = generateToken(user._id.toString());

    res.status(200).json({ success: true, message: "User register successfully", token });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to register user, Try again", error: error.message });
  }
};

//Login user

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields must be field" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found " });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, mesage: "Invaild Credentials" });
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({ success: true, message: "User login successfully", token });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to login user, Try again", error: error.message });
  }
};

// Get User data using Token (JWT)

export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all cars for the Frontend

export const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ isAvailable: true });
    res.status(200).json({ success: true, cars });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
