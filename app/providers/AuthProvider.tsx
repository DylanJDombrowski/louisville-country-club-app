import { supabase } from "@/lib/supabase"; // Your Supabase client
import { Session } from "@supabase/supabase-js";
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

// Define the shape of your context data
type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

// Create the context
const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
});

// Create the provider component
export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the initial session
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    // Listen for changes in authentication state (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
