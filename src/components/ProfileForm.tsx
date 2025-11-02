"use client";

import { useEffect, useState } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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

  // remove DP
  const handleRemoveImage = async () => {
    const user: FirebaseUser | null = auth.currentUser;
    if (!user) return;

    if (!imageUrl) return;

    try {
      const imageRef = ref(storage, `profiles/${user.uid}`);
      await deleteObject(imageRef);
      setImageUrl("");
      await setDoc(doc(db, "users", user.uid), { imageUrl: "" }, { merge: true });
    } catch (err) {
      console.error(err);
      alert("Failed to remove image");
    }
  };

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

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name,
          about,
          number,
          imageUrl: finalImageUrl,
        },
        { merge: true }
      );

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
      <div className="flex items-center justify-center h-[80vh] text-purple-400">
        Loading profile...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 border border-gray-700 rounded-xl bg-gray-900 shadow-2xl"
    >
      <h2 className="text-2xl font-bold text-center mb-2 text-purple-400">Your Profile</h2>

      {/* DP Display */}
      <div className="flex flex-col items-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Profile"
            width={120}
            height={120}
            className="rounded-full object-cover border-2 border-purple-500"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl">
            {name ? name.charAt(0) : "U"}
          </div>
        )}

        {/* Change / Remove Buttons */}
        <div className="flex gap-2 mt-2">
          <label className="bg-purple-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-purple-700 text-sm">
            Change
            <input
              type="file"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>
          {imageUrl && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Inputs */}
      <input
        type="text"
        placeholder="Name"
        className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="About"
        className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
      />
      <input
        type="text"
        placeholder="Number"
        className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className={`${
          loading ? "bg-gray-600 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
        } text-white p-3 rounded-xl font-semibold transition mt-2`}
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}