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

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-[80vh] text-gray-400">
        Loading...
      </div>
    );

  return (
    <div className="p-6 max-w-md mx-auto bg-gray-900 text-gray-100 rounded-lg shadow-lg">
      {user.imageUrl ? (
        <div className="flex justify-center">
          <Image
            src={user.imageUrl}
            alt={`${user.name || "User"} profile`}
            width={120}
            height={120}
            className="rounded-full border-2 border-purple-500"
          />
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl">
            {user.name ? user.name.charAt(0) : "U"}
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mt-4 text-purple-400 text-center">
        {user.name || "No Name"}
      </h1>

      {user.about && (
        <p className="mt-2 text-gray-300 text-center">{user.about}</p>
      )}

      {user.number && (
        <p className="mt-2 text-gray-400 text-center">📞 {user.number}</p>
      )}
    </div>
  );
}