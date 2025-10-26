/**
 * Generate a random OTP code
 * @param {number} length - Length of the OTP code
 * @returns {string} - The generated OTP code
 */
const generateOtp = (length) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return otp;
};

module.exports = { generateOtp };

