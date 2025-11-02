import { NextResponse } from "next/server";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // ===== Static OTP for testing =====
    const otp = "123456"; // Fixed OTP for local/testing

    // ===== Optional: Log OTP instead of sending real email =====
    console.log(`OTP for ${email}: ${otp}`);

    // ===== If you want real email later, uncomment below =====
    /*
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await resend.emails.send({
      from: "Talksy <onboarding@yourdomain.com>",
      to: email,
      subject: "Your OTP Code",
      html: `<h2>Your OTP: ${otp}</h2>`,
    });
    */

    // Return OTP in response for testing purpose
    return NextResponse.json({ success: true, otp });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}