import cloudinary from "../lib/cloudinary.js";
import Category from "../models/category.model.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});

    return res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCategoryList = async (req, res) => {
  try {
    const categories = await Category.find({});
    let categoryList = [];
    categories.map((category) => {
      categoryList.push(category.frontendHref);
    });
    return res.status(200).json(categoryList);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createCategory = async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const { name, image, frontendHref } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "categories",
      });
    }

    const category = await Category.create({
      name,
      frontendHref,
      image: cloudinaryResponse ? cloudinaryResponse?.secure_url : "",
    });

    return res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  if (
    Object.keys(req.body).length === 0 ||
    Object.keys(req.params).length === 0
  ) {
    return res.status(400).json({ message: "No category id provided" });
  }

  try {
    const { name, image, frontendHref } = req.body;

    const categoryToUpdate = await Category.findById(req.params.id);

    if (!categoryToUpdate) {
      return res.status(404).json({ message: "No category found" });
    }

    let cloudinaryResponse = null;

    if (image) {
      // Delete the old image from Cloudinary if it exists
      const publicId = categoryToUpdate.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`categories/${publicId}`);
      } catch (error) {
        return res.status(500).json({
          message: "Error deleting image from cloudinary",
          error: error,
        });
      }

      // Upload the new image to Cloudinary
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "categories",
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        frontendHref,
        image: cloudinaryResponse
          ? cloudinaryResponse.secure_url
          : categoryToUpdate.image,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  if (Object.keys(req.params).length === 0) {
    return res.status(400).json({ message: "No category id provide" });
  }

  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "No category found" });
    }

    return res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
