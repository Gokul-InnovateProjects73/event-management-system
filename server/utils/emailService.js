const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create a reusable transporter using default SMTP transport or Ethereal for testing
const getTransporter = async () => {
    // Determine if we have real credentials
    const isConfigured = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

    if (isConfigured) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Fallback to ethereal for local dev testing
        const testAccount = await nodemailer.createTestAccount();
        console.log('No SMTP config found. Using generated Ethereal test account:', testAccount.user);

        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
};

/**
 * Send an email confirmation to a student after they register for an event.
 * @param {Object} data
 * @param {string} data.toMail - Recipient email
 * @param {string} data.studentName - Name of the registered student
 * @param {Object} data.event - Event Mongoose Document
 * @param {string} data.checkInToken - Unique token for event entry
 * @param {Object} data.ticketDetails - Details about their RSVP submission
 */
const sendRegistrationConfirmation = async ({ toMail, studentName, event, checkInToken, ticketDetails }) => {
    try {
        const transporter = await getTransporter();

        const mailOptions = {
            from: `"Event Management System" <${process.env.SMTP_USER || 'noreply@ems-system.local'}>`,
            to: toMail,
            subject: `Registration Confirmed: ${event.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-w-lg mx-auto p-4 border rounded-lg shadow-sm border-gray-200">
                    <h2 style="color: #6366f1;">Registration Confirmed! 🎉</h2>
                    <p>Hi <strong>${studentName}</strong>,</p>
                    <p>You have successfully registered for <strong>${event.title}</strong>.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #374151;">Event Details</h3>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()} at ${new Date(event.date).toLocaleTimeString()}</p>
                        <p style="margin: 5px 0;"><strong>Location:</strong> ${event.location}</p>
                        ${event.virtualLink ? `<p style="margin: 5px 0;"><strong>Virtual Link:</strong> <a href="${event.virtualLink}">${event.virtualLink}</a></p>` : ''}
                    </div>

                    <div style="background-color: #ede9fe; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h3 style="margin-top: 0; color: #4c1d95;">Your Check-in Token</h3>
                        <div style="background: white; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 1.25rem; letter-spacing: 2px; color: #4c1d95; font-weight: bold; margin: 10px 0;">
                            ${checkInToken}
                        </div>
                        <p style="font-size: 0.875rem; color: #5b21b6; margin-bottom: 0;">Please present this token at the event entrance.</p>
                    </div>

                    ${ticketDetails?.ticketType ? `
                        <p><strong>Ticket Type:</strong> ${ticketDetails.ticketType}</p>
                    ` : ''}

                    <p style="color: #6b7280; font-size: 0.875rem; margin-top: 30px;">
                        If you need to update your RSVP or have any questions, please log back into the system or contact the organizer at ${event.organizer?.email || 'the event page'}.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Confirmation Email Sent! Message ID: %s", info.messageId);

        // If using ethereal, log the preview URL
        if (info.messageId && !process.env.SMTP_USER) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending registration confirmation email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendRegistrationConfirmation
};
