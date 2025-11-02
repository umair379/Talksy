"use client";

import { useEffect, useState, useRef } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { User as FirebaseUser } from "firebase/auth";
import Image from "next/image";
import { FaUser } from "react-icons/fa"; // person icon

export default function ProfileForm() {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [number, setNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

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
          setPreviewUrl(data.imageUrl || "");
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

      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(imageUrl);
    }
  }, [image, imageUrl]);

  // automatic save function
  const autoSaveProfile = async (newImage: File | null = null) => {
    setSaving(true);
    try {
      const user: FirebaseUser | null = auth.currentUser;
      if (!user) throw new Error("Please login first!");

      let finalImageUrl = imageUrl;

      if (newImage) {
        const imageRef = ref(storage, `profiles/${user.uid}`);
        await uploadBytes(imageRef, newImage);
        finalImageUrl = await getDownloadURL(imageRef);
        setImageUrl(finalImageUrl);
        setImage(null);
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
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  // debounce auto-save for text fields
  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      autoSaveProfile();
    }, 1000);
  };

  // handle image change
  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) autoSaveProfile(file);
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
    } catch (err) {
      console.error(err);
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
    <div className="flex flex-col gap-4 max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 border border-gray-700 rounded-xl bg-gray-900 shadow-2xl">
      <h2 className="text-2xl font-bold text-center mb-2 text-purple-400">
        Your Profile
      </h2>

      {/* DP Section */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-28 h-28 relative rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-gray-400 text-3xl">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <FaUser />
          )}
        </div>

        {previewUrl ? (
          <div className="flex gap-2 mt-2">
            <label className="bg-purple-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-purple-700">
              Change Picture
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
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
        ) : (
          <label className="bg-purple-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-purple-700 mt-2">
            Import Picture
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
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
        onChange={(e) => handleChange(setName, e.target.value)}
      />
      <input
        type="text"
        placeholder="About"
        className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
        value={about}
        onChange={(e) => handleChange(setAbout, e.target.value)}
      />
      <input
        type="text"
        placeholder="Number"
        className="p-3 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
        value={number}
        onChange={(e) => handleChange(setNumber, e.target.value)}
      />

      {saving && <p className="text-center text-gray-400">Saving...</p>}
    </div>
  );
}