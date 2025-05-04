import Order from "../models/order.model.js";

export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find().populate("user", { name: 1, phone: 1 }).sort({ createdAt: -1 });;
      res.status(200).json({ message: "Orders retrieved successfully", orders });
    } catch (error) {
      res.status(500).json({ message: "server error", error: error.message });
    }
  };
  
  export const getOrderById = async (req, res) => {
    try {
      const { id: orderId } = req.params;
      const order = await Order.findById(orderId)
        .populate("user", { name: 1, email: 1, phone: 1, address: 1 })
        .populate("products.product", { name: 1, image: 1, price: 1 });
      res.status(200).json({ message: "Orders retrieved successfully", order });
    } catch (error) {
      res.status(500).json({ message: "server error", error: error.message });
    }
  };
  
  