const { connectMySqlDb } = require('../connection.js');
const nodemailer = require('nodemailer');

const sendConfirmationEmail = async (email) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'manshusmartboy@gmail.com', 
          pass: 'ssqamznwswsvmzmm' 
        }
    });

    console.log('user Email: ' + email)

    const mailOptions = {
        to: email,
        subject: 'Newsletter',
        html: `Thank you for subscribing to our newsletters!!`
    };

    await transporter.sendMail(mailOptions);
};

const NewsLetter = async (req, res) => {
    const { email } = req.body;

    console.log(req.body);

    try {
        const db = await connectMySqlDb();
        const [tables] = await db.query('SHOW TABLES LIKE "newsletter"');
        if (tables.length === 0) {
            await db.query(`
                CREATE TABLE newsletter (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL
                )
            `);
        }

        await db.query('INSERT INTO newsletter (email) VALUES (?)', [email]);

        // Fetch all users from the user table
        const [users] = await db.query('SELECT email FROM users');
         
        console.log(users)
        // Send email to each user
        for (const user of users) {
            await sendConfirmationEmail(user.email);
        }

        res.status(200).send('Form filled up and emails sent to all users');
    } catch (error) {
        console.log(error);
        return res.status(500).send('Error saving user to database or sending emails');
    }
};

module.exports = {
    NewsLetter
};
