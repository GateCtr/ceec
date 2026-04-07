"use client";

import React, { createContext, useContext } from "react";

export type EgliseData = {
  id: number;
  nom: string;
  slug: string | null;
  sousDomaine: string | null;
  statut: string;
  ville: string;
  adresse: string | null;
  pasteur: string | null;
  telephone: string | null;
  email: string | null;
  description: string | null;
  logoUrl: string | null;
  photoUrl: string | null;
};

type EgliseContextValue = {
  eglise: EgliseData | null;
  isChurchDomain: boolean;
};

const EgliseContext = createContext<EgliseContextValue>({
  eglise: null,
  isChurchDomain: false,
});

export function EgliseProvider({
  eglise,
  isChurchDomain,
  children,
}: {
  eglise: EgliseData | null;
  isChurchDomain: boolean;
  children: React.ReactNode;
}) {
  return (
    <EgliseContext.Provider value={{ eglise, isChurchDomain }}>
      {children}
    </EgliseContext.Provider>
  );
}

export function useEglise(): EgliseContextValue {
  return useContext(EgliseContext);
}
