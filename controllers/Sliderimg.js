const { connectMySqlDb } = require('../connection');

const getSlider = async (req, res) => {

    try {
        const db = await connectMySqlDb();


        const [rows] = await db.query('SELECT * FROM slider');
          console.log(rows)
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error getting slider:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getSliderById = async (req, res) => {
    try {
        const db = await connectMySqlDb();
        const propertyId = req.params.id;

        const [rows] = await db.query('SELECT * FROM slider WHERE id = ?', [propertyId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'slider not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error getting property by ID:', error);
        res.status(500).send('Internal Server Error');
    }
};




const addSlider = async (req, res) => {
    try {
        
     
        const db = await connectMySqlDb();
        const propertyImg = req.file ? req.file.filename : null;

        const [tables] = await db.query('SHOW TABLES LIKE "slider"');
        if (tables.length === 0) {
       
            await db.query(`
                CREATE TABLE slider (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    images TEXT
                )
            `);
        }


        await db.query('INSERT INTO slider (images) VALUES (?)', [propertyImg]);

        res.status(201).send('Property added successfully');
    } catch (error) {
        console.error('Error adding property:', error);
        res.status(500).send('Internal Server Error');
    }
};

const deleteSlider = async (req, res) => {
    try {
        const propertyId = req.params.id;

        const db = await connectMySqlDb();
     
        const [result] = await db.query('DELETE FROM slider WHERE id = ?', [propertyId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Property not found');
        }

        res.status(200).send('Property deleted successfully');
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).send('Internal Server Error');
    }
};

const updateSlider = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const { old_img } = req.body;
        
       let productImage = req.file ? req.file.filename : null;
   let images = "";


   if (productImage != null) {
     images = productImage;
   } else {
     images = old_img;
   }
        const db = await connectMySqlDb(); 

        const [result] = await db.query('UPDATE slider SET  images = ? WHERE id = ?', [images, propertyId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Property not found');
        }

        res.status(200).send('Property updated successfully');
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    addSlider,
    deleteSlider,
    updateSlider,
    getSlider,
    getSliderById
};
