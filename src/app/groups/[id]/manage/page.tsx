"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";

interface Group {
  name: string;
  admin: string;
  members: string[];
}

export default function ManageGroupPage() {
  const { id } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [newMemberUid, setNewMemberUid] = useState("");

  // Ensure current user is logged in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else router.push("/login");
    });
    return () => unsub();
  }, [router]);

  // Convert id to string safely
  const groupId = Array.isArray(id) ? id[0] : id;

  // Fetch group data
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) setGroup(groupSnap.data() as Group);
    };
    fetchGroup();
  }, [groupId]);

  const handleAddMember = async () => {
    if (!groupId) return;
    if (!newMemberUid.trim()) return alert("Enter a valid UID!");
    if (group?.members.includes(newMemberUid)) return alert("Member already in group!");

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayUnion(newMemberUid) });

    alert("Member added!");
    setNewMemberUid("");
  };

  const handleRemove = async (uid: string) => {
    if (!groupId) return;
    if (group?.admin !== currentUser?.uid) return alert("Only admin can remove members!");

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayRemove(uid) });

    alert("Member removed!");
  };

  const handleLeave = async () => {
    if (!groupId || !currentUser?.uid) return;
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayRemove(currentUser.uid) });

    alert("You left the group.");
    router.push("/groups");
  };

  if (!group) return <p className="text-center mt-10 text-gray-600">Loading group...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-3 text-blue-600">Manage Group: {group.name}</h1>
      <p className="text-sm text-gray-600 mb-4">Admin UID: {group.admin}</p>

      {currentUser?.uid === group.admin && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Add Member by UID:</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMemberUid}
              onChange={(e) => setNewMemberUid(e.target.value)}
              placeholder="Enter UID"
              className="border px-3 py-2 rounded w-full"
            />
            <button
              onClick={handleAddMember}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-2">Group Members:</h2>
      <ul className="space-y-2">
        {group.members.map((member) => (
          <li key={member} className="flex justify-between items-center border p-2 rounded">
            <span>{member}</span>
            {group.admin === currentUser?.uid && member !== group.admin && (
              <button
                onClick={() => handleRemove(member)}
                className="bg-red-500 text-white px-2 py-1 rounded text-sm"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 text-center">
        <button onClick={handleLeave} className="bg-gray-500 text-white px-4 py-2 rounded">
          Leave Group
        </button>
      </div>

      <div className="mt-4 text-center">
        <a href={`/groups/${groupId}`} className="text-blue-600 underline">Go Back to Chat</a>
      </div>
    </div>
  );
}
