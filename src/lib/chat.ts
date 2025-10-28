import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

/**
 * chatId banane ka simple rule: dono uids ko sort karke "_" se join karo.
 */
export const getChatId = (uid1: string, uid2: string) =>
  [uid1, uid2].sort().join("_");

/**
 * Agar chat document pehle se exist na kare to create karo.
 */
export const createOrGetChat = async (uid1: string, uid2: string) => {
  const chatId = getChatId(uid1, uid2);
  const chatDocRef = doc(db, "chats", chatId);

  try {
    // Minimal chat doc create if not exists
    await setDoc(
      chatDocRef,
      {
        chatId,
        users: [uid1, uid2],
        createdAt: new Date(),
      },
      { merge: true } // merge: true ensures existing data overwrite nahi hoti
    );
  } catch (err) {
    console.error("Error creating chat:", err);
  }

  return chatId;
};
