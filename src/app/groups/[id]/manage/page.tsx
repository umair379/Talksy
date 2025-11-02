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
    
    // Update local state for immediate UI change
    setGroup(prev => prev ? {...prev, members: [...prev.members, newMemberUid]} : null);


    alert("Member added!");
    setNewMemberUid("");
  };

  const handleRemove = async (uid: string) => {
    if (!groupId) return;
    if (group?.admin !== currentUser?.uid) return alert("Only admin can remove members!");

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayRemove(uid) });
    
    // Update local state for immediate UI change
    setGroup(prev => prev ? {...prev, members: prev.members.filter(m => m !== uid)} : null);

    alert("Member removed!");
  };

  const handleLeave = async () => {
    if (!groupId || !currentUser?.uid) return;
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayRemove(currentUser.uid) });

    alert("You left the group.");
    router.push("/groups");
  };

  if (!group) return <p className="text-center mt-10 text-gray-400">Loading group...</p>;

  return (
    // 🎨 Theme Change: Dark background, light border, Responsive padding
    // 📱 Responsiveness: max-w-2xl centered
    <div className="max-w-2xl mx-auto mt-10 p-4 sm:p-6 bg-gray-900 shadow-2xl rounded-xl border border-gray-700">
      
      {/* 🎨 Theme Change: Purple Heading */}
      <h1 className="text-2xl font-bold mb-3 text-purple-400">Manage Group: {group.name}</h1>
      <p className="text-sm text-gray-400 mb-4">Admin UID: {group.admin}</p>

      {currentUser?.uid === group.admin && (
        <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800">
          <h2 className="font-semibold mb-3 text-gray-200">Add Member by UID:</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newMemberUid}
              onChange={(e) => setNewMemberUid(e.target.value)}
              placeholder="Enter UID"
              // 🎨 Theme Change: Dark input style, Purple focus ring
              className="border border-gray-700 px-3 py-2 rounded w-full bg-gray-900 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button
              onClick={handleAddMember}
              // 🎨 Theme Change: Purple button
              className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-3 text-gray-200">Group Members:</h2>
      <ul className="space-y-2">
        {group.members.map((member) => (
          <li 
            key={member} 
            // 🎨 Theme Change: Darker list item background, light border, responsive padding
            className="flex justify-between items-center border border-gray-700 p-3 rounded bg-gray-800 text-gray-200"
          >
            <span className="break-all pr-2">{member} {member === group.admin && <span className="text-xs text-purple-400">(Admin)</span>}</span>
            {group.admin === currentUser?.uid && member !== group.admin && (
              <button
                onClick={() => handleRemove(member)}
                // 🎨 Theme Change: Red button for danger action
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition flex-shrink-0"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={handleLeave} 
          // 🎨 Theme Change: Darker button for secondary action (Leave)
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Leave Group
        </button>
        <a 
          href={`/groups/${groupId}`} 
          // 🎨 Theme Change: Purple link style
          className="text-purple-400 hover:text-purple-300 underline self-center mt-2 sm:mt-0"
        >
          Go Back to Chat
        </a>
      </div>
    </div>
  );
}
