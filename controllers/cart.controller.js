import Product from "../models/product.model.js";
import retrieveUserItems from "../utils/retrieveUserItems.js";
import updateFeaturedProductsCache from "../utils/updateFeaturedProducts.js";

export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;

    const cartItems = await retrieveUserItems(user);

    return res.status(200).json(cartItems);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  if (Object.keys(req.body).length < 1) {
    return res.status(400).json({ message: "No product id provided" });
  }

  const { productId } = req.body;

  try {
    const user = req.user;
    const product = await Product.findById(productId);

    if (product.countInStock === 0) {
      return res.status(400).json({ message: "Product out of stock" });
    }

    product.countInStock -= 1;
    await product.save();

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();
    // Update the cache in Redis
    await updateFeaturedProductsCache();

    return res
      .status(200)
      .json({
        message: "Product added to cart",
        cartItems: user.cartItems,
        countInStock: product.countInStock,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    const product = await Product.findById(productId);

    const productInCart = user.cartItems.find((item) => item.id === productId);

    if (productInCart) {
      product.countInStock += productInCart.quantity;
      await product.save();
    }

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();

    return res.status(200).json({
      message: "Product removed from cart",
      cartItems: user.cartItems,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    const product = await Product.findById(productId);

    if (product.countInStock === 0 && quantity > existingItem.quantity) {
      return res.status(400).json({ message: "Product out of stock" });
    }

    if (!existingItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity <= 0) {
      product.countInStock += existingItem.quantity;
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    } else {
      let quantityDiff = quantity - existingItem.quantity;
      product.countInStock -= quantityDiff;
      existingItem.quantity = quantity;
    }
    await product.save();
    await user.save();
    // Update the cache in Redis
    await updateFeaturedProductsCache();

    return res.status(200).json({
      message: "Cart updated successfully",
      cartItems: user.cartItems,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
