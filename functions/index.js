// This file is the entry point for your Firebase Cloud Functions.
// It requires deployment to a secure server environment (Firebase or similar).

const functions = require('firebase-functions/v1');
const admin = require('firebase-admin'); // REQUIRED for most triggers and database access
const nodemailer = require('nodemailer');

// --- 0. Initialize Firebase Admin SDK ---
// This enables Firestore triggers and database access within the function environment.
// It automatically uses the project configuration when deployed via Firebase CLI.
admin.initializeApp();

// --- 1. Nodemailer Configuration ---
// IMPORTANT: Replace these placeholders with your actual SMTP credentials (e.g., SendGrid, Gmail app password).
const transporter = nodemailer.createTransport({
    // Example using a common service provider like Gmail
    service: 'Gmail', 
    auth: {
        user: 'ydeseniorfund@gmail.com', 
        pass: 'nyhn gdnt smxq ldsl'
    }
});

/**
 * Generates an HTML email body with basic professional styling (inline CSS) for the CLIENT.
 * @param {object} quoteData - The data submitted by the user.
 * @returns {string} The fully styled HTML email body.
 */
function createStyledEmail(quoteData) {
    const features = [];
    if (quoteData['feature-ecommerce'] === 'on') features.push('E-commerce / Payments');
    if (quoteData['feature-admin'] === 'on') features.push('Custom Admin/CMS');
    if (quoteData['feature-support'] === 'on') features.push('Live Chat/Support');
    
    const featuresList = features.length > 0 ? features.join('<br>') : 'Standard Informational Site';
    const accentColor = '#00d2ff';
    const primaryColor = '#1a1a2e';

    return `
<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; background-color: ${primaryColor}; color: #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
    
    <!-- Header/Logo Section (Accent Color) -->
    <div style="background-color: ${accentColor}; padding: 20px; text-align: center;">
        <h1 style="color: ${primaryColor}; margin: 0; font-size: 28px; font-weight: 800;">
            Setton Source<span style="color: ${primaryColor};">.</span>
        </h1>
    </div>

    <!-- Body Content -->
    <div style="padding: 30px;">
        <h2 style="color: ${accentColor}; font-size: 24px; margin-bottom: 20px;">
            Quote Confirmation — We Got Your Request!
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Hi ${quoteData.name || 'valued client'},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Thank you for using the Setton Source instant quote calculator. Your request has been successfully recorded, and we're excited to start planning your digital foundation.
        </p>

        <!-- Summary Card (Deep Navy) -->
        <div style="border-left: 4px solid ${accentColor}; background-color: #2a2a44; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 10px;">
                Estimated Project Cost
            </p>
            <p style="font-size: 36px; font-weight: 800; color: ${accentColor}; margin: 0;">
                ${quoteData.formattedEstimate}
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 5px;">
                *This is an estimate. Final pricing will be confirmed in our follow-up call.
            </p>
        </div>

        <!-- Details Table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; font-size: 14px; color: #ccc;">
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #3a3a5e;"><strong>Project Name:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #3a3a5e; text-align: right;">${quoteData.projectName || 'N/A'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #3a3a5e;"><strong>Number of Pages:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #3a3a5e; text-align: right;">${quoteData.pages}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #3a3a5e;"><strong>Backend / Database:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #3a3a5e; text-align: right; color: ${quoteData.backend === 'yes' ? '#ffeb3b' : '#e4e4e7'};">${quoteData.backend === 'yes' ? 'REQUIRED' : 'No'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #3a3a5e;"><strong>Key Features:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #3a3a5e; text-align: right;">${featuresList.replace(/<br>/g, ', ')}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>We will contact you at:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${quoteData.phone}</td>
            </tr>
        </table>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
            We will be in touch shortly to discuss the scope in detail!
        </p>

        <a href="https://settonsource.com/schedule" target="_blank" style="display: block; width: 80%; max-width: 300px; margin: 0 auto; padding: 12px 20px; background-color: ${accentColor}; color: ${primaryColor}; text-decoration: none; font-weight: 700; border-radius: 25px; text-align: center; box-shadow: 0 4px 8px rgba(0, 210, 255, 0.4);">
            Book a Follow-up Call
        </a>
    </div>

    <!-- Footer -->
    <div style="padding: 20px 30px; background-color: #11111f; text-align: center; color: #777;">
        <p style="margin: 0; font-size: 12px;">&copy; 2025 Setton Source. Built with precision and passion.</p>
    </div>
</div>
    `;
}

/**
 * Generates an HTML email body for internal agency notification.
 * @param {object} quoteData - The data submitted by the user.
 * @returns {string} The fully styled HTML email body.
 */
function createInternalNotificationEmail(quoteData) {
    const features = [];
    if (quoteData['feature-ecommerce'] === 'on') features.push('E-commerce / Payments');
    if (quoteData['feature-admin'] === 'on') features.push('Custom Admin/CMS');
    if (quoteData['feature-support'] === 'on') features.push('Live Chat/Support');
    
    const featuresList = features.length > 0 ? features.join(', ') : 'Standard Informational Site';
    const logoCost = quoteData.logoStatus === 'no' ? '($100 added)' : '';
    const accentColor = '#00d2ff';
    const primaryColor = '#1a1a2e';

    return `
<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; background-color: #f7f7f7; color: ${primaryColor}; border: 1px solid #ddd; border-radius: 8px;">
    
    <!-- Header -->
    <div style="background-color: ${primaryColor}; padding: 15px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        <h1 style="color: ${accentColor}; margin: 0; font-size: 20px;">
            🚨 NEW LEAD SUBMITTED (Setton Source) 🚨
        </h1>
    </div>

    <!-- Body Content -->
    <div style="padding: 20px;">
        <p style="font-size: 16px; font-weight: 700; color: ${primaryColor}; margin-bottom: 20px;">
            A new project quote request has been submitted. Follow up immediately.
        </p>

        <!-- Summary -->
        <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid ${accentColor};">
            <p style="font-size: 14px; color: #555; margin-bottom: 5px;">ESTIMATE:</p>
            <p style="font-size: 30px; font-weight: 800; color: ${primaryColor}; margin: 0;">
                ${quoteData.formattedEstimate}
            </p>
        </div>

        <!-- Contact Details -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; font-size: 14px; color: #333; border-collapse: collapse;">
            <tr><td colspan="2" style="font-size: 16px; font-weight: 700; padding-bottom: 8px; border-bottom: 1px solid #eee;">Client Contact</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Name:</strong></td><td style="padding: 6px 0; text-align: right;">${quoteData.name}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Email:</strong></td><td style="padding: 6px 0; text-align: right;"><a href="mailto:${quoteData.email}" style="color: ${accentColor};">${quoteData.email}</a></td></tr>
            <tr><td style="padding: 6px 0;"><strong>Phone:</strong></td><td style="padding: 6px 0; text-align: right;">${quoteData.phone}</td></tr>
        </table>

        <!-- Project Details -->
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #333; border-collapse: collapse;">
            <tr><td colspan="2" style="font-size: 16px; font-weight: 700; padding-bottom: 8px; border-bottom: 1px solid #eee;">Project Scope</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Project Name:</strong></td><td style="padding: 6px 0; text-align: right;">${quoteData.projectName || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Pages:</strong></td><td style="padding: 6px 0; text-align: right;">${quoteData.pages}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Backend:</strong></td><td style="padding: 6px 0; text-align: right; color: ${quoteData.backend === 'yes' ? '#d97706' : '#333'};"><strong>${quoteData.backend === 'yes' ? 'YES (REQUIRED)' : 'No'}</strong></td></tr>
            <tr><td style="padding: 6px 0;"><strong>Features:</strong></td><td style="padding: 6px 0; text-align: right;">${featuresList}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Logo:</strong></td><td style="padding: 6px 0; text-align: right;">${quoteData.logoStatus === 'no' ? `Needed ${logoCost}` : 'Ready'}</td></tr>
        </table>
    </div>

    <!-- Footer -->
    <div style="padding: 15px; background-color: ${primaryColor}; text-align: center; color: #aaa; font-size: 11px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
        View request details in your Admin Dashboard in the Canvas app.
    </div>
</div>
    `;
}

/**
 * Generates an HTML email body for a custom follow-up response from the agency.
 * @param {string} name - The client's name.
 * @param {string} message - The custom response message from the admin.
 * @returns {string} The fully styled HTML email body.
 */
function createFollowUpEmail(name, message) {
    const primaryColor = '#1a1a2e';
    const accentColor = '#00d2ff';

    return `
<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; background-color: #f7f7f7; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background-color: ${accentColor}; padding: 15px; text-align: center;">
        <h1 style="color: ${primaryColor}; margin: 0; font-size: 24px; font-weight: 800;">
            Response from Setton Source
        </h1>
    </div>

    <!-- Body Content -->
    <div style="padding: 20px;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi ${name},
        </p>
        
        <!-- Agency Response -->
        <div style="background-color: #ffffff; padding: 15px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 20px; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #555;">
            We appreciate your interest in Setton Source. We look forward to working with you!
        </p>

        <a href="https://settonsource.com/schedule" target="_blank" style="display: block; width: 80%; max-width: 300px; margin: 25px auto 0; padding: 10px 20px; background-color: ${primaryColor}; color: #fff; text-decoration: none; font-weight: 700; border-radius: 20px; text-align: center;">
            Visit Our Website
        </a>
    </div>

    <!-- Footer -->
    <div style="padding: 10px; background-color: #11111f; text-align: center; color: #aaa; font-size: 10px;">
        &copy; 2025 Setton Source.
    </div>
</div>
    `;
}


// --- 2. Real-time Firestore Trigger (Sends confirmation to client + internal notification to agency) ---

/**
 * This function triggers automatically whenever a new document is written 
 * to the quotes collection in the Firebase Firestore database.
 * Path: /artifacts/{appId}/public/data/quotes/{quoteId}
 */
exports.sendQuoteConfirmation = functions.firestore
    .document('artifacts/{appId}/public/data/quotes/{quoteId}')
    .onCreate(async (snap, context) => {
        const quoteData = snap.data();
        
        // Skip processing if email is missing (should be validated client-side, but good server practice)
        if (!quoteData.email) {
            console.warn('Skipping email send: Quote data missing email address.');
            return null;
        }

        // 1. Send Confirmation Email to Client
        const mailOptionsClient = {
            from: 'Setton Source <your_agency_email@gmail.com>', // MUST MATCH Nodemailer AUTH USER
            to: quoteData.email,
            subject: `✅ Your Instant Quote is Ready: ${quoteData.formattedEstimate}`,
            html: createStyledEmail(quoteData)
        };

        // 2. Send Internal Notification Email to Agency
        const mailOptionsInternal = {
            from: 'Setton Source Automated Bot <your_agency_email@gmail.com>', // MUST MATCH Nodemailer AUTH USER
            to: 'your_agency_email@gmail.com', // ⬅️ Sent to the agency email for notification
            subject: `🚨 NEW LEAD: ${quoteData.name} | ${quoteData.formattedEstimate}`,
            html: createInternalNotificationEmail(quoteData)
        };

        try {
            await transporter.sendMail(mailOptionsClient);
            console.log(`Confirmation email successfully sent to client: ${quoteData.email}`);
        } catch (error) {
            console.error('Error sending client confirmation email:', error);
        }
        
        try {
            await transporter.sendMail(mailOptionsInternal);
            console.log('Internal notification email successfully sent to agency.');
        } catch (error) {
            console.error('Error sending internal notification email:', error);
        }

        return null;
    });


// --- 3. Callable HTTP Function (Allows Admin Panel to send custom responses) ---

/**
 * Callable function to send a follow-up response email from the Admin Panel.
 * This is triggered by a button click on the frontend (admin.html).
 * @param {object} data - Contains email, name, and the custom message.
 */
exports.sendFollowUpEmail = functions.https.onCall(async (data, context) => {
    
    // NOTE: For security, you should implement authentication checks here,
    // like ensuring context.auth.uid matches a known admin ID.
    
    const { email, name, message } = data;

    if (!email || !message) {
        throw new functions.https.HttpsError('invalid-argument', 'Client email and response message are required.');
    }

    const mailOptions = {
        from: 'Setton Source Team <your_agency_email@gmail.com>', // MUST MATCH Nodemailer AUTH USER
        to: email,
        subject: `Follow-up on your project quote from Setton Source`,
        html: createFollowUpEmail(name, message)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Follow-up email successfully sent to: ${email}`);
        return { success: true, message: `Follow-up email sent to ${email}` };
    } catch (error) {
        console.error('Error sending follow-up email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send follow-up email via Nodemailer.');
    }
});
