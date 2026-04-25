import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { pullFromCloud } from "../utils/cloudSyncService";
import { migrateGuestData } from "../utils/migrateGuestData";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userType, setUserType] = useState("anonymous");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserType("authenticated");
        setIsGuest(false);

        // ✅ Step 1: migrate guest → user
        await migrateGuestData(currentUser, "authenticated");

        // ✅ Step 2: pull cloud → local
        await pullFromCloud(currentUser.uid);

        window.dispatchEvent(new Event("storage")); // trigger data refresh
      } else {
        setUser(null);
        setUserType("anonymous");
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ LOGIN (FIXED)
  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);

    // 🔥 clear guest data ONLY after login
    Object.keys(localStorage).forEach((key) => {
      if (key.includes("guest")) {
        localStorage.removeItem(key);
      }
    });
  }

  async function signup(email, password) {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setIsGuest(false);
  }

  function continueAsGuest() {
    setUser(null);
    setUserType("guest");
    setIsGuest(true);
  }

  return (
    <UserContext.Provider
      value={{
        userType,
        user,
        login,
        signup,
        logout,
        isLoading,
        isGuest,
        continueAsGuest,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}