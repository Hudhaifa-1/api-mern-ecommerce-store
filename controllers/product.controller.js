import Product from "../models/product.model.js";
import redis from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import updateFeaturedProductsCache from "../utils/updateFeaturedProducts.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // find all products

    return res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    // Check if featured products are in cache (Redis)
    const cashedFeaturedProducts = await redis.get("featured_products");

    if (cashedFeaturedProducts) {
      return res.status(200).json(JSON.parse(cashedFeaturedProducts));
    }

    // If not in cache, fetch from database (MongoDB)
    const featuredProducts = await Product.find({ isFeatured: true }).lean(); // lean() returns a plain JavaScript object instead of a Mongoose document

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    // Store the featured products in cache (Redis)
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    return res.status(200).json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 3 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
          countInStock: { $ifNull: ["$countInStock", 0] }
        },
      },
    ]);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
};

export const getProductsByCategory = async (req, res) => {
  if (!req.params) {
    return res.status(400).json({ message: "No category provided" });
  }

  const { category } = req.params;

  try {
    const products = await Product.find({ category });

    res.status(200).json({products});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, countInStock } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse ? cloudinaryResponse.secure_url : "",
      category,
      countInStock
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.errors });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (req.body != undefined && Object.keys(req.body).length > 0) {
      const { name, description, price, image, category, countInStock } = req.body;
      const productToUpdate = await Product.findById(req.params.id);

      let cloudinaryResponse = null;

      if (image) {
        // Delete the old image from Cloudinary if it exists
        const publicId = productToUpdate.image.split("/").pop().split(".")[0];
        try {
          await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (error) {
          return res.status(500).json({
            message: "Error deleting image from cloudinary",
            error: error,
          });
        }

        // Upload the new image to Cloudinary
        cloudinaryResponse = await cloudinary.uploader.upload(image, {
          folder: "products",
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          name,
          description,
          price,
          image: cloudinaryResponse
            ? cloudinaryResponse.secure_url
            : productToUpdate.image,
          category,
          countInStock
        },
        { new: true } // Return the updated product
      );

      res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } else {
      return res.status(400).json({ message: "No data to update" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.errors });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productToDelete = await Product.findById(req.params.id);

    if (!productToDelete) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (productToDelete.image) {
      const publicId = productToDelete.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        return res.status(500).json({
          message: "Error deleting image from cloudinary",
          error: error,
        });
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if(!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const toggleFeaturedProduct = async (req, res) => {
  if (!req.params) {
    return res.status(400).json({ message: "No product id provided" });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();

    // Update the cache in Redis
    await updateFeaturedProductsCache();
    let isFeatured = updatedProduct.isFeatured ? "Featured" : "Unfeatured";

    return res.status(200).json({message: `Product ${isFeatured} successfully`, updatedProduct});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
};
