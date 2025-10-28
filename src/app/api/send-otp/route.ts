import { NextResponse } from "next/server";
import { Resend } from "resend";

// ✅ Server-side only: .env.local me RESEND_API_KEY="your_api_key"
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔹 Send OTP via Resend
    await resend.emails.send({
      from: "Talksy <onboarding@yourdomain.com>", // ✅ Replace with your verified sender
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family:Arial;text-align:center">
          <h2>🔐 Your OTP Code</h2>
          <p style="font-size:22px;font-weight:bold">${otp}</p>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    // ✅ Return OTP to frontend (optional, you can remove in production)
    return NextResponse.json({ success: true, otp });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
