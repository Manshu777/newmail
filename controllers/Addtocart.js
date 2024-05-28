const {connectMySqlDb} = require('../connection.js')


const addTocart = async (req, res) => {
   
   try {
    const db = await connectMySqlDb();
  
    
   
  
    await db.query(`
    CREATE TABLE IF NOT EXISTS carts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT  NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
    `);
  
    await db.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cart_id INT  NULL,
      product_id INT  NULL,
      quantity INT  NULL,
      FOREIGN KEY (cart_id) REFERENCES carts(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
    `);
  
    // Assume you have user ID and product ID and quantity from the request body
    const { userId, productId, quantity } = req.body;
    
    // Fetch the cart for the user or create one if it doesn't exist
    let [cartRows] = await db.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    let cart;
    
    if (cartRows.length === 0) {
      // Create a new cart for the user
      const [result] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      const cartId = result.insertId;
      [cartRows] = await db.query('SELECT * FROM carts WHERE id = ?', [cartId]);
    }
    
    cart = cartRows[0];
  
    // Check if the product is already in the cart
    const [cartItemRows] = await db.query('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [cart.id, productId]);
    
    if (cartItemRows.length === 0) {
      // Add the product to the cart
      await db.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cart.id, productId, quantity]);
    } else {
      // Update the quantity of the existing product in the cart
      const cartItem = cartItemRows[0];
      const newQuantity = cartItem.quantity + quantity;
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, cartItem.id]);
    }
  
    res.status(200).send('Product added to cart');
  } catch (error) {
    console.error('Error in add to cart:', error);
    res.status(500).send('Internal Server Error');
  }
  
  };


  const deleteCart = async (req,res) =>{
    try {
        const db = await connectMySqlDb();
    
        // Assume you have user ID and product ID from the request body
        // const { userId, productId } = req.body;

        const productId = req.params.productId;

        const userId = req.params.userId;
    
        // Fetch the cart for the user
        let [cartRows] = await db.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
        
        if (cartRows.length === 0) {
          return res.status(404).send('Cart not found');
        }
        
        const cart = cartRows[0];
    
        // Check if the product is in the cart
        const [cartItemRows] = await db.query('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [cart.id, productId]);
        
        if (cartItemRows.length === 0) {
          return res.status(404).send('Product not found in cart');
        }
    
        // Remove the product from the cart
        await db.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cart.id, productId]);
    
        res.status(200).send('Product removed from cart');
      } catch (error) {
        console.error('Error in delete from cart:', error);
        res.status(500).send('Internal Server Error');
      }
  }


  const getcartItem = async (req, res) => { 
    try {
        const db = await connectMySqlDb();

      
        const  userId  = req.params.id;
        console.log(userId)

        const [rows] = await db.query(`
        SELECT 
        ci.id, 
        ci.cart_id, 
        ci.product_id, 
        p.title AS productName, 
        p.id AS pr_id, 
        p.price, 
        p.images, 
        ci.quantity
    FROM 
        cart_items ci
    JOIN 
        products p ON ci.product_id = p.id
    JOIN 
        carts c ON ci.cart_id = c.id
    WHERE 
        c.user_id = ?
        `, [userId]);
        console.log(rows)
        res.status(200).json(rows);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).send('Internal Server Error');
      }

  }

  
  module.exports = {
    addTocart,
    getcartItem,
    deleteCart
  }


