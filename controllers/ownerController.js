import User from "../models/User.js";

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
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
