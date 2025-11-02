"use client";

import { useEffect, useState } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User as FirebaseUser } from "firebase/auth";
import Image from "next/image";

export default function ProfileForm() {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [number, setNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // fetch user data
  useEffect(() => {
    const fetchProfile = async () => {
      const user: FirebaseUser | null = auth.currentUser;
      if (!user) return setInitialLoading(false);

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || "");
          setAbout(data.about || "");
          setNumber(data.number || "");
          setImageUrl(data.imageUrl || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }

      setInitialLoading(false);
    };

    fetchProfile();
  }, []);

  // save/update profile
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user: FirebaseUser | null = auth.currentUser;
      if (!user) return alert("Please login first!");

      let finalImageUrl = imageUrl;

      if (image) {
        const imageRef = ref(storage, `profiles/${user.uid}`);
        await uploadBytes(imageRef, image);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        about,
        number,
        imageUrl: finalImageUrl,
      }, { merge: true }); // merge: true added for consistency

      alert("Profile saved successfully!");
      setImage(null);
      setImageUrl(finalImageUrl);
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    }

    setLoading(false);
  };

  if (initialLoading) {
    return (
      // 🎨 Theme Change: Darker loading screen, light text
      <div className="flex items-center justify-center h-[80vh] text-purple-400">
        Loading profile...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      // 🎨 Theme Change: Dark form background, light borders
      // 📱 Responsiveness: max-w-sm for small screens, p-4 for padding
      className="flex flex-col gap-4 max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 border border-gray-700 rounded-xl bg-gray-900 shadow-2xl"
    >
      {/* 🎨 Theme Change: Purple heading */}
      <h2 className="text-2xl font-bold text-center mb-2 text-purple-400">Your Profile</h2>

      {imageUrl && (
        <div className="flex justify-center">
          <Image
            src={imageUrl}
            alt="Profile"
            width={100}
            height={100}
            className="rounded-full object-cover w-24 h-24"
          />
        </div>
      )}

      <input
        type="text"
        placeholder="Name"
        // 🎨 Theme Change: Darker input fields
        className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="About"
        // 🎨 Theme Change: Darker input fields
        className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
      />
      <input
        type="text"
        placeholder="Number"
        // 🎨 Theme Change: Darker input fields
        className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />
      <input 
        type="file" 
        onChange={(e) => setImage(e.target.files?.[0] || null)} 
        // 🎨 Theme Change: Better file input styling for dark mode
        className="text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
      />

      <button
        type="submit"
        disabled={loading}
        // 🎨 Theme Change: Purple button
        className={`${
          loading ? "bg-gray-600 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
        } text-white p-3 rounded-xl font-semibold transition mt-2`}
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
