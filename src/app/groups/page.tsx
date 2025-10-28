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
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayUnion(user.uid) });
    fetchGroups();
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { members: arrayRemove(user.uid) });
    fetchGroups();
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("⚠️ Are you sure you want to delete this group?")) return;
    await deleteDoc(doc(db, "groups", groupId));
    alert("❌ Group deleted!");
    fetchGroups();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Groups</h2>
      <div className="space-y-3">
        {groups.length === 0 ? (
          <p className="text-gray-500">No groups available right now.</p>
        ) : (
          groups.map((group) => {
            const isMember = group.members?.includes(user?.uid || "");
            const isAdmin = group.admin === user?.uid;

            return (
              <div
                key={group.id}
                className="flex justify-between items-center bg-white shadow p-4 rounded"
              >
                <h3 className="font-semibold text-gray-800">{group.name}</h3>
                <div className="space-x-2">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => router.push(`/groups/${group.id}`)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Open Chat
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  ) : isMember ? (
                    <>
                      <button
                        onClick={() => router.push(`/groups/${group.id}`)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Open Chat
                      </button>
                      <button
                        onClick={() => handleLeaveGroup(group.id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Leave
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
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
