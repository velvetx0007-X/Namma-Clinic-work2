const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'zuhvix.tech@gmail.com',
        pass: 'qhbscdngfvnapnqd'
    }
});

const mailOptions = {
    from: '"Namma Clinic" <zuhvix.tech@gmail.com>',
    to: 'zuhvix.tech@gmail.com', // testing to self
    subject: 'SMTP Test - Namma Clinic',
    text: 'If you are reading this, the SMTP configuration is working correctly.'
};

console.log('Testing SMTP connection...');
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection Error:', error);
    } else {
        console.log('✅ SMTP Server is ready to take our messages');
        
        console.log('Sending test email...');
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Error sending email:', error);
            } else {
                console.log('✅ Email sent: ' + info.response);
            }
            process.exit();
        });
    }
});
