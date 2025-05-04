import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    
    const coupon = await Coupon.findOne({ userId: user._id, isActive: true });

    return res.status(200).json(coupon || null);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const user = req.user;
    const { code } = req.body;
    const currentDate = new Date();

    const coupon = await Coupon.findOne({
      code: code,
      userId: user._id,
      isActive: true,
      expirationDate: { $gt: currentDate },
    });

    if (!coupon) {
      // coupon.isActive = false;
      // await coupon.save();
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    return res.status(200).json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
