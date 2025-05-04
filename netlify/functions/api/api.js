import express from "express";
import dotenv from "dotenv";
import serverless from "serverless-http";

import authRoutes from "../../../routes/auth.route.js";
import productRoutes from "../../../routes/product.route.js";
import categoryRoutes from "../../../routes/category.route.js";
import cartRoutes from "../../../routes/cart.route.js";
import couponRoutes from "../../../routes/coupon.route.js";
import paymentRoutes from "../../../routes/payment.route.js";
import orderRoutes from "../../../routes/order.route.js";
import analyticsRoutes from "../../../routes/analytics.route.js";
import { connectDB } from "../../../lib/db.js";
import cookieParser from "cookie-parser";
import "../../../lib/couponCleaner.js";

dotenv.config();

const app = express();

// Database connection handler
// let dbConnection;
// const connectDBOnce = async () => {
//   console.log("Connecting to MongoDB 0...");
//   if (!dbConnection) {
//     dbConnection = await connectDB();
//   }
//   return dbConnection;
// };

app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request
app.use(cookieParser()); // allows you to parse cookies

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

// Database connection middleware
// app.use(async (req, res, next) => {
//   console.log("Connecting to MongoDB -1...");

//     await connectDBOnce();
   connectDB();
//   next();
// });

// Error handling middleware (add this if missing)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const handler2 = serverless(app, {
  request: (req) => {
    // If body is a Buffer or string, parse it manually
    if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString());
      } catch (err) {
        console.error("Body parse failed:", err.message);
      }
    } else if (typeof req.body === "string") {
      try {
        req.body = JSON.parse(req.body);
      } catch (err) {
        console.error("Body parse failed:", err.message);
      }
    }
  },
});


// export default serverless(app);
export const handler = handler2;
