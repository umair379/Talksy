"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

interface UserProfile {
  name?: string;
  about?: string;
  number?: string;
  imageUrl?: string;
}

export default function UserProfile({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const docSnap = await getDoc(doc(db, "users", params.id));
      if (docSnap.exists()) setUser(docSnap.data() as UserProfile);
    };
    getUser();
  }, [params.id]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {user.imageUrl && (
        <Image
  src={user.imageUrl}
  alt="Profile"
  width={100}
  height={100}
  className="rounded-full"
/>
      )}
      <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
      <p>{user.about}</p>
      <p className="text-gray-600">📞 {user.number}</p>
    </div>
  );
}
