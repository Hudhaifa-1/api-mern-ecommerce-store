import Product from "../models/product.model.js";

async function retrieveUserItems(user) {
  
    // retrieve products ( that found in the user cart) from the products table with it is all fields
    const products = await Product.find({ _id: { $in: user.cartItems } });

  
    // add quantity to each product in the collection ( because the quantity is not stored in the product table)
    const cartItemsData = products.map((product) => {
      const cartItem = user.cartItems.find((item) => item.id === product.id);
      return { ...product.toJSON(), quantity: cartItem.quantity };
    });

  
    return cartItemsData;
  }

  export default retrieveUserItems;