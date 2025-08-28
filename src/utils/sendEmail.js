const nodemailer = require("nodemailer");

<<<<<<< HEAD
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log("📧 Email đã gửi tới:", to);
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error.message);
  }
};

module.exports = sendEmail;
=======
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpMail = async ({ email, code, purpose }) => {
  const subject =
    purpose === "register" ? "Xác thực tài khoản - HCMUTE" : "Quên mật khẩu - HCMUTE";

  const html =
    purpose === "register"
      ? `<p>Chào bạn,</p><p>Mã OTP để xác thực tài khoản là: <b>${code}</b></p><p>Mã sẽ hết hạn sau 5 phút.</p>`
      : `<p>Chào bạn,</p><p>Mã OTP đặt lại mật khẩu là: <b>${code}</b></p><p>Mã sẽ hết hạn sau 5 phút.</p>`;

  await transporter.sendMail({
    from: `"HCMUTE Consulting" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

module.exports = { sendOtpMail };
>>>>>>> main
