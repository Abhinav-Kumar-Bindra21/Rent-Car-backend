import { URLEndpoints } from "@imagekit/nodejs/resources/accounts/url-endpoints.mjs";
import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import Car from "../models/Cars.js";
import fs from "fs";

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
      fileName: imageFile.originalName,
      folder: "/cars",
    });

    // optimization through imagekit URL transformation
    var optimizedImageURL = imagekit.baseURL({
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
    res.json({ success: false, message: error.message });
  }
};
