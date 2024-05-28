const { connectMySqlDb } = require('../connection');

const getProduct = async (req, res) => {
    try {
        const db = await connectMySqlDb();


        const [rows] = await db.query('SELECT * FROM products');
          console.log(rows)
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getProductById = async (req, res) => {
    try {
        const db = await connectMySqlDb();
        const propertyId = req.params.id;

        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [propertyId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error getting property by ID:', error);
        res.status(500).send('Internal Server Error');
    }
};




const addProduct = async (req, res) => {
    try {
        const { title, description, features,price  } = req.body;
        console.log(req.file)
        const db = await connectMySqlDb();
        const propertyImg = req.file ? req.file.filename : null;

        const [tables] = await db.query('SHOW TABLES LIKE "products"');
        if (tables.length === 0) {
       
            await db.query(`
                CREATE TABLE products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    price VARCHAR(255) NOT NULL,
                    features TEXT,
                    images TEXT
                )
            `);
        }


        await db.query('INSERT INTO products (title, description, price, features, images) VALUES (?, ?, ?,?, ?)', [title, description,price, features, propertyImg]);

        res.status(201).send('Property added successfully');
    } catch (error) {
        console.error('Error adding property:', error);
        res.status(500).send('Internal Server Error');
    }
};

const deleteProduct = async (req, res) => {
    try {
        const propertyId = req.params.id;

        const db = await connectMySqlDb();
     
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [propertyId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Property not found');
        }

        res.status(200).send('Property deleted successfully');
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).send('Internal Server Error');
    }
};

const updateProduct = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const { title, description, features,old_img } = req.body;
        
       let productImage = req.file ? req.file.filename : null;
   let images = "";


   if (productImage != null) {
     images = productImage;
   } else {
     images = old_img;
   }
        const db = await connectMySqlDb(); 

        const [result] = await db.query('UPDATE products SET title = ?, description = ?, features = ?, price = ? , images = ? WHERE id = ?', [title, description, features, price, images, propertyId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('products not found');
        }

        res.status(200).send('products updated successfully');
    } catch (error) {
        console.error('Error updating products:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    addProduct,
    deleteProduct,
    updateProduct,
    getProduct,
    getProductById
};
