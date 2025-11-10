import { createContext, useEffect, useState, useMemo } from "react";
import { db } from '../Components/firebase'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Create context
export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  // USER STATE
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Sign in
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUserId(user.uid);
      setUserName(user.displayName);
      setAvatarUrl(user.photoURL);
    } catch (error) {
      console.error(error);
    }
  };

  // Sign out
  const signOutUser = async () => {
    await signOut(auth);
    setUserId(null);
    setUserName(null);
    setAvatarUrl(null);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName);
        setAvatarUrl(user.photoURL);
      } else {
        setUserId(null);
        setUserName(null);
        setAvatarUrl(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Memoize context value
  const contextValue = useMemo(() => ({
    userName,
    userId,
    avatarUrl,
    signInWithGoogle,
    signOutUser
  }), [userName, userId, avatarUrl]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}
