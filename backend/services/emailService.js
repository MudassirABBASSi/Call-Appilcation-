const nodemailer = require('nodemailer');

/**
 * Create reusable transporter
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS
    }
  });
};

/**
 * Generic email sending function
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of email
 * @returns {Promise<Object>} - Success/failure response
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Alburhan Classroom" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetLink - Password reset link with token
 * @param {string} userName - User's name
 */
const sendPasswordResetEmail = async (to, resetLink, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Alburhan Classroom" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Password Reset Request - Alburhan Classroom',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              
              <p>We received a request to reset your password for your Alburhan Classroom account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: #fff; padding: 10px; border: 1px solid #ddd; word-break: break-all;">
                ${resetLink}
              </p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in <strong>1 hour</strong></li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will remain unchanged until you create a new one</li>
                </ul>
              </div>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br><strong>Alburhan Classroom Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Alburhan Classroom. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send reset email');
  }
};

/**
 * Send password reset confirmation email
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 */
const sendPasswordResetConfirmation = async (to, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Alburhan Classroom" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Password Successfully Reset - Alburhan Classroom',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              
              <div class="success">
                Your password has been successfully reset.
              </div>
              
              <p>You can now log in to your Alburhan Classroom account using your new password.</p>
              
              <p><strong>If you didn't make this change:</strong></p>
              <ul>
                <li>Please contact our support team immediately</li>
                <li>Someone may have unauthorized access to your account</li>
              </ul>
              
              <p>Best regards,<br><strong>Alburhan Classroom Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Alburhan Classroom. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw error - this is non-critical
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP (One-Time Password) email for 2FA
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP to send
 * @param {string} userName - User's name (optional)
 */
const sendOtpEmail = async (to, otp, userName = 'User') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Alburhan Classroom" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Your Login Code - Alburhan Classroom',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #f5576c; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0; }
            .otp-code { font-size: 48px; font-weight: bold; color: #f5576c; letter-spacing: 10px; font-family: 'Courier New', monospace; }
            .otp-info { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
            .warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Login Verification Code</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              
              <p>We received a login request from your Alburhan Classroom account. Use the code below to verify your login:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="otp-info">
                <strong>⏱️ Important Information:</strong>
                <ul style="margin: 10px 0;">
                  <li>This code is valid for <strong>10 minutes</strong> only</li>
                  <li>Do not share this code with anyone</li>
                  <li>Enter this code on the verification screen</li>
                </ul>
              </div>
              
              <div class="warning">
                <strong>⚠️ Didn't request this login?</strong><br>
                If you didn't attempt to log in to your account, please:
                <ul>
                  <li>Ignore this email - the code will expire automatically</li>
                  <li>Consider changing your password if you notice suspicious activity</li>
                  <li>Contact our support team if you have concerns about your account security</li>
                </ul>
              </div>
              
              <p>Best regards,<br><strong>Alburhan Classroom Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Alburhan Classroom. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  sendOtpEmail
};
