import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "./firebase";
import { getAppDashboardData } from "./googleSheets"; 

export interface ClientProfile {
  frontly_id: string; mobile: string; company: string; email: string;
  credit: string | number; used: string | number; remaining: string | number;
  endDate: string; status: string; googleDrive: string; website: string;
  socialMedia: string; supportPhone: string; supportEmail: string;
  darkLogo: string; lightLogo: string; coloredLogo: string; plan: string;
  planPrice: string; freeTemplates: string | number; templatesUsed: string | number;
  firstName: string; lastName: string; maxCredits: string | number;
}

export interface ClientTemplate {
  frontly_id: string; title: string; id: string; category: string;
  type: string; credit: number; formUrl: string; preview: string;
}

export interface ClientReminder {
  mobile: string; email: string; type: string; date: string; status: string; plan: string;
}

interface AuthUser {
  email: string; firstName: string; lastName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  client: ClientProfile | null;
  templates: ClientTemplate[]; 
  reminders: ClientReminder[]; 
  isLoading: boolean;
  loginWithGoogle: () => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [templates, setTemplates] = useState<ClientTemplate[]>([]);
  const [reminders, setReminders] = useState<ClientReminder[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const displayName = firebaseUser.displayName || "";
        const [firstName = "", lastName = ""] = displayName.split(" ");
        setUser({ email: firebaseUser.email, firstName, lastName });

        try {
          const result = await getAppDashboardData(firebaseUser.email);
          if (result && result.profile) {
            setClient(result.profile);
            setTemplates(result.templates || []);
            setReminders(result.reminders || []);
          } else {
            setClient(null); setTemplates([]); setReminders([]);
          }
        } catch (error) {
          console.error("Failed to load client data from Sheets:", error);
          setClient(null); setTemplates([]); setReminders([]);
        }

      } else {
        setUser(null); setClient(null); setTemplates([]); setReminders([]);
      }
      setIsLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  // NEW: Google Sign In Function
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return await signInWithPopup(auth, provider);
  };
  
  const logout = () => {
    signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, client, templates, reminders, isLoading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
