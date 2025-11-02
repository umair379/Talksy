"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { User as FirebaseUser } from "firebase/auth";

interface Group {
  id: string;
  name: string;
  admin: string;
  members: string[];
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) setUser(u);
      else router.push("/login");
    });
    return unsubscribe;
  }, [router]);

  const fetchGroups = async () => {
    const querySnapshot = await getDocs(collection(db, "groups"));
    const data: Group[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Group, "id">),
    }));
    setGroups(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayUnion(user.uid) });
    
    // Local state update
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, members: [...g.members, user.uid] } : g));

    router.push(`/groups/${groupId}`);
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayRemove(user.uid) });
    
    // Local state update
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, members: g.members.filter(m => m !== user.uid) } : g));
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    await deleteDoc(doc(db, "groups", groupId));
    
    // Local state update
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };
  
  if (loading) {
    // 🎨 Theme Change: Dark loading screen, purple text
    return <p className="text-center mt-10 text-purple-400">Loading groups...</p>;
  }

  return (
    // 📱 Responsiveness: Responsive padding, max-w-3xl centered
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* 🎨 Theme Change: Purple heading, dark border bottom */}
      <h1 className="text-2xl font-bold mb-6 text-purple-400 border-b border-gray-700 pb-2">
        Available Groups
      </h1>

      <div className="grid gap-4">
        {groups.length === 0 ? (
            <p className="text-gray-400">No groups available. Create one!</p>
        ) : (
          groups.map((group) => {
            const isMember = group.members.includes(user?.uid || "");
            const isAdmin = group.admin === user?.uid;

            return (
              <div
                key={group.id}
                // 🎨 Theme Change: Dark item background, light border, purple hover
                className="p-4 border border-gray-700 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 text-gray-100 shadow-lg transition hover:bg-purple-900/50"
              >
                <div className="mb-3 sm:mb-0">
                  {/* 🎨 Theme Change: Highlight name */}
                  <h2 className="font-semibold text-lg text-purple-300">{group.name}</h2>
                  <p className="text-sm text-gray-400">Members: {group.members.length}</p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? "You are the Admin" : isMember ? "You are a member" : "Public"}
                  </p>
                </div>
                
                {/* 📱 Responsiveness: Button actions wrap to full width on mobile if needed (space-y-2), desktop row (sm:space-x-3) */}
                <div className="flex flex-wrap gap-2 sm:space-x-3 mt-2 sm:mt-0">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => router.push(`/groups/${group.id}`)}
                        // 🎨 Theme Change: Primary button purple
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition text-sm"
                      >
                        Open Chat
                      </button>
                      <button
                        onClick={() => router.push(`/groups/${group.id}/manage`)}
                        // 🎨 Theme Change: Secondary button dark
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition text-sm"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        // 🎨 Theme Change: Danger action red
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                      >
                        Delete
                      </button>
                    </>
                  ) : isMember ? (
                    <>
                      <button
                        onClick={() => router.push(`/groups/${group.id}`)}
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition text-sm"
                      >
                        Open Chat
                      </button>
                      <button
                        onClick={() => handleLeaveGroup(group.id)}
                        // 🎨 Theme Change: Leave button yellow/orange
                        className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition text-sm"
                      >
                        Leave
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
