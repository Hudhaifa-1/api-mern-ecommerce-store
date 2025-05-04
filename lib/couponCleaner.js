import cron from "node-cron";
import Coupon from "../models/coupon.model.js";

cron.schedule("0 0 * * *", async () => {
  try {
    const result = await Coupon.deleteMany({
      isActive: false,
      expirationDate: { $lte: new Date() },
    });
    console.log(`Deleted ${result.deletedCount} expired coupons`);
  } catch (err) {
    console.error("Error deleting expired coupons:", err);
  }
});
