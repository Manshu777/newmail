const express = require('express');
const router = express.Router();
const {signupUser,loginUser,getUser,deleteUser,getUserbyid,getVerifyToken} = require('../controllers/Authcontroller');
const multer = require('multer');
const path = require('path');
// const {addProperty,deleteProperty,updateProperty,getProperty,getProductById} = require('../controllers/PropertyController');
const {addProduct,deleteProduct,updateProduct,getProductById,getProduct} = require('../controllers/PropertyController');

// const {getProduct} = require('../controllers/Propertycrud')
const {getSlider,deleteSlider,updateSlider,addSlider} = require('../controllers/Sliderimg')

const {addTocart,getcartItem,deleteCart} = require('../controllers/Addtocart')
const {addBlog,deleteBlog,getBlog,getBlogById,updateBolg} = require('../controllers/Blogcrud');
const {AdminLogin} = require('../controllers/AdminLogin');

const {getUserByVerificationToken,updateUserVerificationStatus} = require('../connection')

const {contacUser} = require('../controllers/Contact')

const {NewsLetter} = require('../controllers/Newsletter');

router.get('/', getUser);
router.get('/:id', getUserbyid);

router.get('/get/slider', getSlider);

router.post('/addcart',addTocart );
router.get('/cart/:id',getcartItem );
router.delete('/cart/delete/:userId/:productId',deleteCart );


router.get('/getproperty/get', getProduct);
router.get('/propertybyid/:id', getProductById);


router.get('/blog/get', getBlog);
router.get('/blogbyid/:id', getBlogById);

router.get('/verify', async (req, res) => {
  const { token } = req.query;

  try {
    const user = await getUserByVerificationToken(token);
    if (!user) {
      return res.status(404).send('User not found');
    }

    
    await updateUserVerificationStatus(user.id, true);

    res.status(200).send('Email verified successfully');
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).send('Internal Server Error');
  }
});




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif' || 
    file.mimetype === 'image/webp'

  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF WEBP files are allowed.'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 
  },
  fileFilter: fileFilter
});
     

router.post('/signup', upload.single('userImage'), signupUser);


router.post('/property/add', upload.single('propertyImg'), addProduct);
router.delete('/property/delete/:id', deleteProduct);
router.put('/property/update/:id', upload.single('propertyImg'), updateProduct);




router.post('/blog/add', upload.single('blogImg'), addBlog);
router.delete('/blog/delete/:id', deleteBlog);
router.put('/blog/update/:id', upload.single('blogImg'), updateBolg);


router.post('/contact', contacUser);

router.post('/newsletter', NewsLetter);


router.post('/slider/add', upload.single('sliderimg'), addSlider);
router.delete('/slider/delete/:id', deleteSlider);
router.put('/slider/update/:id', upload.single('sliderimg'), updateSlider);



router.post('/login', loginUser);
router.delete('/delete/:id', deleteUser);


router.post('/adminlogin', AdminLogin);


module.exports = router;
