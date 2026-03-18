"use client";

import { useState, useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { authClient } from "@/lib/auth-client";
import { AuthContext } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    setIsAdmin(false);
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    // Dev bypass: fake admin session
    if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true") {
      setUser({ id: "dev-admin", email: "admin@fundmycampus.com" });
      setIsAdmin(true);
      setIsLoading(false);
      return;
    }

    async function checkSession() {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          const u = session.data.user;
          setUser({ id: u.id, email: u.email, name: u.name });

          // Check admin role
          try {
            const profile = await api.get<{ role: string }>(
              `/api/v1/users/${u.id}`
            );
            setIsAdmin(profile.role === "admin");
          } catch {
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    }

    checkSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, isAdmin, isLoading, signOut: handleSignOut }}>
        {children}
        <Toaster position="top-right" richColors />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
