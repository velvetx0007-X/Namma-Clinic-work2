const nodemailer = require('nodemailer');

/**
 * Handle contact form submissions
 * Sends an email to zuhvix.tech@gmail.com with the form details
 */
const sendContactEmail = async (req, res) => {
    const { fullName, clinicName, email, phoneNumber, message } = req.body;

    // Basic validation
    if (!fullName || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please provide full name, email, and message.' 
        });
    }

    try {
        // Create transporter using existing env variables
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'zuhvix.tech@gmail.com',
                pass: process.env.EMAIL_PASS || 'qhbscdngfvnapnqd'
            }
        });

        // Email content
        const mailOptions = {
            from: `"Namma Clinic Contact" <${process.env.EMAIL_USER || 'zuhvix.tech@gmail.com'}>`,
            to: 'zuhvix.tech@gmail.com',
            replyTo: email,
            subject: `New Clinic Inquiry: ${clinicName || 'Personal'} from ${fullName}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #1E88E5; border-bottom: 2px solid #1E88E5; padding-bottom: 10px;">New Namma Clinic Inquiry</h2>
                    <p>You have received a new message from the landing page contact form.</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 150px;">Full Name</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${fullName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Clinic Name</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${clinicName || 'Not specified'}</td>
                        </tr>
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email Address</td>
                            <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone Number</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${phoneNumber || 'Not provided'}</td>
                        </tr>
                    </table>
                    
                    <h3 style="margin-top: 30px; color: #1E88E5;">Message Content:</h3>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #1E88E5; white-space: pre-wrap;">
                        ${message}
                    </div>
                    
                    <p style="margin-top: 40px; font-size: 12px; color: #777;">
                        Submitted on: ${new Date().toLocaleString()}<br>
                        This email was generated from the Namma Clinic Landing Page.
                    </p>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            success: true, 
            message: 'Your message has been sent successfully. We will get back to you soon!' 
        });
    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message. Please try again later.' 
        });
    }
};

module.exports = { sendContactEmail };
