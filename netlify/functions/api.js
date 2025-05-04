import express from "express";
import dotenv from "dotenv";
import serverless from "serverless-http";
import cors from "cors";

import authRoutes from "../../routes/auth.route.js";
import productRoutes from "../../routes/product.route.js";
import categoryRoutes from "../../routes/category.route.js";
import cartRoutes from "../../routes/cart.route.js";
import couponRoutes from "../../routes/coupon.route.js";
import paymentRoutes from "../../routes/payment.route.js";
import orderRoutes from "../../routes/order.route.js";
import analyticsRoutes from "../../routes/analytics.route.js";
import { connectDB } from "../../lib/db.js";
import cookieParser from "cookie-parser";
import "../../lib/couponCleaner.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://mern-ecommerce-store-website.vercel.app",
  "http://localhost:5173",
];

// Configure CORS with specific options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors({corsOptions, credentials: true}));

app.options("*", cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://mern-ecommerce-store-website.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.options("*", (req, res) => {
  res.sendStatus(200);
});

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

connectDB();

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
