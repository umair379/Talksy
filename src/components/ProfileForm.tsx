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
      });

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
      <div className="flex items-center justify-center h-[80vh] text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 max-w-md mx-auto p-5 border rounded-xl bg-white shadow-md"
    >
      <h2 className="text-2xl font-bold text-center mb-2">Your Profile</h2>

      {imageUrl && (
        <Image
  src={imageUrl}
  alt="Profile"
  width={100}
  height={100}
  className="rounded-full"
/>
      )}

      <input
        type="text"
        placeholder="Name"
        className="p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="About"
        className="p-2 border rounded"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
      />
      <input
        type="text"
        placeholder="Number"
        className="p-2 border rounded"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />
      <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />

      <button
        type="submit"
        disabled={loading}
        className={`${
          loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        } text-white p-2 rounded mt-2`}
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
