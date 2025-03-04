"use client";

import { createContext, useContext } from "react";
import { type Session } from "next-auth";

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
export const useSessionContext = () => useContext(SessionContext);
