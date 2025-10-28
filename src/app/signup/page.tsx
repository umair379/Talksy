"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import useAuthRedirect from "@/hooks/useAuthRedirect";

export default function SignupPage() {
  useAuthRedirect("/"); // agar already logged in hai to home

  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const validatePassword = (pw: string) => {
    const regex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{10,}$/;
    return regex.test(pw);
  };

  const sendOtp = async () => {
    if (!email) return alert("Enter email first");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.otp) {
        setSentOtp(data.otp);
        setOtpSent(true);
        alert("OTP sent to your email!");
      } else {
        alert("Failed to send OTP");
      }
    } catch {
      alert("Failed to send OTP");
    }
  };

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !username || !password)
      return alert("Please fill all fields");
    if (password !== rePassword) return alert("Passwords do not match");
    if (!validatePassword(password))
      return alert(
        "Password must be min 10 chars, start with capital, contain 1 number & 1 special char!"
      );
    if (!otpSent) return alert("Please send OTP first");
    if (otp !== sentOtp) return alert("Invalid OTP");

    // check if username already exists
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    if (!snap.empty) return alert("Username already taken!");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, {
        displayName: `${firstName} ${lastName}`,
      });

      // save additional info to Firestore
      await addDoc(collection(db, "users"), {
        uid: userCred.user.uid,
        firstName,
        lastName,
        username,
        email,
      });

      alert("Account created successfully!");
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Something went wrong!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[85vh]">
      <h2 className="text-2xl font-bold mb-4">Signup</h2>

      <input
        type="text"
        placeholder="First Name"
        onChange={(e) => setFirstName(e.target.value)}
        className="border p-2 mb-2 w-64 rounded"
      />
      <input
        type="text"
        placeholder="Last Name"
        onChange={(e) => setLastName(e.target.value)}
        className="border p-2 mb-2 w-64 rounded"
      />
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 mb-2 w-64 rounded"
      />
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-2 w-64 rounded"
      />

      <button
        onClick={sendOtp}
        className="bg-blue-500 text-white px-4 py-1 rounded mb-2"
      >
        {otpSent ? "Resend OTP" : "Send OTP"}
      </button>

      {otpSent && (
        <input
          type="text"
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
          className="border p-2 mb-2 w-64 rounded"
        />
      )}

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-2 w-64 rounded"
      />
      <input
        type="password"
        placeholder="Re-enter Password"
        onChange={(e) => setRePassword(e.target.value)}
        className="border p-2 mb-2 w-64 rounded"
      />

      <button
        onClick={handleSignup}
        className="bg-green-500 text-white px-4 py-2 rounded w-64 mb-3"
      >
        Sign up
      </button>

      <button
        onClick={() => router.push("/login")}
        className="text-blue-600 underline"
      >
        Already have an account? Login
      </button>
    </div>
  );
}
