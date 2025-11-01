import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    console.log("📩 OTP request received for:", email);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const response = await resend.emails.send({
      from: "Talksy <onboarding@resend.dev>",
      to: email,
      subject: "Your OTP Code",
      html: `<h2>Your OTP: ${otp}</h2>`,
    });

    console.log("✅ Resend API response:", response);

    return NextResponse.json({ success: true, otp });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
