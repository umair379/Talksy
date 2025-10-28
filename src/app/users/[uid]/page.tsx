"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";

interface UserProfile {
  uid?: string;
  name?: string;
  email?: string;
  about?: string;
  photoURL?: string;
  phone?: string;
  friends?: string[];
}

export default function ViewUserPage() {
  const params = useParams();
  const uid = Array.isArray(params?.uid) ? params.uid[0] : params?.uid || "";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [me, setMe] = useState<FirebaseUser | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [pending, setPending] = useState(false);

  // current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setMe);
    return () => unsub();
  }, []);

  // get profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid) return;
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) setProfile(snap.data() as UserProfile);
    };
    fetchProfile();
  }, [uid]);

  // check friendship
  useEffect(() => {
    if (!me || !profile) return;
    setIsFriend(Array.isArray(profile.friends) && profile.friends.includes(me.uid));
  }, [me, profile]);

  // check pending request
  useEffect(() => {
    const checkPending = async () => {
      if (!me || !uid) return;
      const q = query(
        collection(db, "friendRequests"),
        where("from", "==", me.uid),
        where("to", "==", uid),
        where("status", "==", "pending")
      );
      const snap = await getDocs(q);
      setPending(!snap.empty);
    };
    checkPending();
  }, [me, uid]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      {!profile ? (
        <p>Loading...</p>
      ) : (
        <>
          {profile.photoURL && (
            <Image
  src={profile.photoURL}
  alt="Profile"
  width={100}
  height={100}
  className="rounded-full"
/>
          )}
          <h2 className="text-xl font-semibold text-center">
            {profile.name || profile.email}
          </h2>
          <p className="text-sm text-gray-600 text-center">{profile.about}</p>
          <p className="mt-2 text-sm text-center">
            📞 {profile.phone || "Not provided"}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            {isFriend ? (
              <Link
                href={`/chat/${uid}`}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Message
              </Link>
            ) : pending ? (
              <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Request Sent
              </button>
            ) : (
              <Link
                href={`/users/send-request/${uid}`}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Send Request
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
