import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      min: 0,
      required: [true, "Product price is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    countInStock: {
      type: Number,
      default: 0,
      min: 0,
      required: true
    },
    category: {
        type: String,
        required: [true, "Product category is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
