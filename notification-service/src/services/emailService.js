const nodemailer = require("nodemailer");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");
const path = require("path");
const logger = require("../config/logger");
// Create reusable transporter object using SMTP
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        logger.error(" SMTP configuration error:", error);
        logger.error(" Error details:", {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER ? "set" : "not set",
            pass: process.env.EMAIL_PASS ? "set" : "not set",
        });
    } else {
        logger.info(" SMTP server is ready to send emails");
        logger.info(" Using SMTP server:", process.env.EMAIL_HOST);
        logger.info(" Using SMTP port:", process.env.EMAIL_PORT);
    }
});

// Generate service token for internal service calls
const generateServiceToken = () => {
    return jwt.sign(
        {
            service: "notification-service",
            type: "service",
        },
        process.env.SERVICE_SECRET,
        { expiresIn: "1h" }
    );
};

/**
 * Send an email using a template
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.template - Template name
 * @param {Object} options.data - Template data
 * @returns {Promise} - Nodemailer send result
 */
const sendEmail = async ({ to, subject, template, data }) => {
    try {
        logger.info(" Preparing to send email to:", to);
        logger.info(" Using SMTP server:", process.env.EMAIL_HOST);

        // Get template content
        const { html, text } = await getTemplateContent(template, data);

        const info = await transporter.sendMail({
            from:
                process.env.EMAIL_FROM ||
                '"E-commerce Notifications" <notifications@ecommerce.com>',
            to,
            subject,
            text,
            html,
        });

        logger.info(" Email sent successfully");
        logger.info(" Message ID:", info.messageId);
        logger.info(" Preview URL:", nodemailer.getTestMessageUrl(info));

        return info;
    } catch (error) {
        logger.error(" Error sending email:", error);
        throw error;
    }
};

/**
 * Send a notification email and update notification status
 * @param {Object} notification - Notification object
 * @param {String} userEmail - User's email address
 */
const sendNotificationEmail = async (notification, userEmail) => {
    try {
        logger.info(" Sending notification email to:", userEmail);
        const { title, type, template, data } = notification;
        logger.info(" Notification Data:", notification.data);
        const emailContent = {
            to: userEmail,
            subject: `[${type.toUpperCase()}] ${title}`,
            template,
            data: {
                ...data,
                title,
                type,
            },
        };

        await sendEmail(emailContent);

        return true;
    } catch (error) {
        logger.error(" Error sending notification email:", error);
        logger.error(" Error stack:", error.stack);

        // Update notification status with error
        if (notification._id) {
            await Notification.findByIdAndUpdate(notification._id, {
                emailStatus: "failed",
                emailError: error.message,
            });
        }

        throw error;
    }
};

/*
 * Email Service
 *
 * Email templates are stored in src/emailTemplates/ as individual files (e.g., orderCreated.js, orderUpdated.js, etc.).
 * Each template file must export a function: (data, user) => { html: string, text: string }
 * The getTemplateContent function dynamically loads the template by name and passes event data and user info.
 * If a template is missing, a default fallback template is used and a warning is logged.
 */
/**
 * Get template content
 * @param {String} templateName - Name of the template
 * @param {Object} data - Template data
 * @returns {Object} - Template content with html and text
 */
const getTemplateContent = async (templateName, data, user) => {
    try {
        const templatePath = path.join(
            __dirname,
            "../emailTemplates",
            `${templateName}.js`
        );
        const templateFn = require(templatePath);
        return templateFn(data, user);
    } catch (err) {
        logger.warn(
            `[emailService] Template '${templateName}' not found. Using fallback template.`
        );
        return {
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><p style="color: #333; font-size: 1.1em;">Hi ${
                user?.username || "Customer"
            },</p><h2 style="color: #333;">${
                data.title || "Notification"
            }</h2><p style="color: #666; line-height: 1.6;">${
                data.message || ""
            }</p><p style="color: #999; font-size: 12px; margin-top: 20px;">This is an automated message, please do not reply.</p></div>`,
            text: `Hi ${user?.username || "Customer"},\n${
                data.title || "Notification"
            }\n${
                data.message || ""
            }\nThis is an automated message, please do not reply.`,
        };
    }
};

module.exports = {
    sendEmail,
    sendNotificationEmail,
    getTemplateContent,
};
