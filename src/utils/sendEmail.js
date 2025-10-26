const nodemailer = require('nodemailer');

/**
 * Send OTP email to user
 * @param {Object} params - Email parameters
 * @param {string} params.email - Recipient email
 * @param {string} params.code - OTP code
 * @param {string} params.purpose - Purpose of OTP (register/reset)
 */
const sendOtpMail = async ({ email, code, purpose }) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Determine email content based on purpose
  let subject, text, html;
  
  if (purpose === 'register') {
    subject = 'Mã OTP xác thực đăng ký - HCMUTE Consultant';
    text = `Mã OTP của bạn là: ${code}. Mã này có hiệu lực trong ${process.env.OTP_EXPIRES_MIN || 5} phút.`;
    html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Xác thực đăng ký tài khoản</h2>
        <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
        <p>Mã này có hiệu lực trong <strong>${process.env.OTP_EXPIRES_MIN || 5} phút</strong>.</p>
        <p style="color: #666; font-size: 12px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      </div>
    `;
  } else if (purpose === 'reset') {
    subject = 'Mã OTP đặt lại mật khẩu - HCMUTE Consultant';
    text = `Mã OTP của bạn là: ${code}. Mã này có hiệu lực trong ${process.env.OTP_EXPIRES_MIN || 5} phút.`;
    html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Đặt lại mật khẩu</h2>
        <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
        <p>Mã này có hiệu lực trong <strong>${process.env.OTP_EXPIRES_MIN || 5} phút</strong>.</p>
        <p style="color: #666; font-size: 12px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      </div>
    `;
  }

  // Send email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
      html,
    });
    console.log(`✅ OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw { status: 500, message: 'Không thể gửi email' };
  }
};

module.exports = { sendOtpMail };

