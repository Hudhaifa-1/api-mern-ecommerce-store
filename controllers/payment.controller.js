import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import retrieveUserItems from "../utils/retrieveUserItems.js";

export const prepareOrderForPayment = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const user = req.user;
    const currentDate = new Date();

    let products = await retrieveUserItems(user);

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No items in the cart" });
    }

    let totalAmount = 0;

    // Calculate the total amount of the products in the cart
    products.forEach((product) => {
      const amount = product.price * product.quantity;
      totalAmount += amount;
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: user._id,
        isActive: true,
        expirationDate: { $gt: currentDate },
      });

      if (coupon) {
        totalAmount -= Math.round(
          totalAmount * (coupon.discountPercentage / 100)
        );
        coupon.isActive = false; // Mark the coupon as used
        await coupon.save();
      }
    }

    // Here we should create a checkout with ZainCash or any other payment gateway
    // Or even if there is no payment gateway that supports Iraq,
    // I will just create the order and i should mark the payment mode as "Cash on delivery"

    // If the user total amount is greater than or equal to 200,000 IQD, create new coupon for the next purchase
    if (totalAmount >= 200000) {
      await createNewCoupon(user._id);
    }

    const order = await createOrder(user._id, products, totalAmount);
    user.cartItems = []; // Clear the cart after creating the order
    await user.save();

    res.status(200).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

async function createNewCoupon(userId) {
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId: userId,
  });

  await newCoupon.save();

  return newCoupon;
}

async function createOrder(userId, products, totalAmount) {
  try {
    const order = new Order({
      user: userId,
      products: products.map((product) => ({
        product: product._id,
        quantity: product.quantity,
        price: product.price,
      })),
      totalAmount: Number(totalAmount.toFixed(2)),
    });

    await order.save();

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order");
  }
}
