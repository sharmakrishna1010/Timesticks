
import axios from "axios";

export default async function sendMail(subject, htmlContent, toUser) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.FROM_USER },
        to: [{ email: toUser }],
        subject,
        htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Mail sent successfully");
    return true;

  } catch (error) {
    console.log("SEND MAIL ERROR:", error.response?.data || error.message);
    return false;
  }
}
