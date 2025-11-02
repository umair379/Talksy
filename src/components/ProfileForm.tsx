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
  const [previewUrl, setPreviewUrl] = useState(""); // ✅ Preview URL
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
          setPreviewUrl(data.imageUrl || ""); // preview initial
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }

      setInitialLoading(false);
    };

    fetchProfile();
  }, []);

  // update preview when user selects a new image
  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);

      // cleanup
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(imageUrl); // if no new image, show saved one
    }
  }, [image, imageUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user: FirebaseUser | null = auth.currentUser;
      if (!user) throw new Error("Please login first!");

      let finalImageUrl = imageUrl;

      // Upload new image if selected
      if (image) {
        const imageRef = ref(storage, `profiles/${user.uid}`);
        await uploadBytes(imageRef, image);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      // Update Firestore
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
      setImageUrl(finalImageUrl);
      setImage(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error saving profile");
    }

    setLoading(false);
  };

  const handleRemovePicture = async () => {
    try {
      const user: FirebaseUser | null = auth.currentUser;
      if (!user) throw new Error("Please login first!");

      if (imageUrl) {
        const imageRef = ref(storage, `profiles/${user.uid}`);
        await deleteObject(imageRef);
      }

      await setDoc(doc(db, "users", user.uid), { imageUrl: "" }, { merge: true });
      setImage(null);
      setImageUrl("");
      setPreviewUrl("");
      alert("Profile picture removed!");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error removing picture");
    }
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

      {/* DP Section */}
      <div className="flex flex-col items-center gap-2">
        {previewUrl ? (
          <>
            <div className="w-28 h-28 relative">
              <Image
                src={previewUrl}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <label className="bg-purple-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-purple-700">
                Change Picture
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>
              <button
                type="button"
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                onClick={handleRemovePicture}
              >
                Remove Picture
              </button>
            </div>
          </>
        ) : (
          <label className="bg-purple-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-purple-700">
            Import Picture
            <input
              type="file"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>
        )}
      </div>

      {/* Text Inputs */}
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