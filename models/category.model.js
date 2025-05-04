import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name required"],
    },
    frontendHref: {
      type: String,
      required: [true, "Frontend href required"],
    },
    image: {
      type: String,
      required: [true, "Category image required"],
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
