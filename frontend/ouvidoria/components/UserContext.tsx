"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type UserContextValue = {
  email: string | null;
  setEmail: (value: string | null) => void;
  isFuncionario: boolean;
  setIsFuncionario: (value: boolean) => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

const STORAGE_KEY = "ouvidoria:user-email";
const FUNCIONARIO_KEY = "ouvidoria:is-funcionario";

export const UserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [email, setEmailState] = useState<string | null>(null);
  const [isFuncionario, setIsFuncionarioState] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedEmail = window.localStorage.getItem(STORAGE_KEY);
    if (storedEmail) {
      setEmailState(storedEmail);
    }

    const storedIsFuncionario = window.localStorage.getItem(FUNCIONARIO_KEY);
    if (storedIsFuncionario) {
      setIsFuncionarioState(storedIsFuncionario === "true");
    }
  }, []);

  const setEmail = (value: string | null) => {
    setEmailState(value);
    if (typeof window === "undefined") {
      return;
    }

    if (value) {
      window.localStorage.setItem(STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const setIsFuncionario = (value: boolean) => {
    setIsFuncionarioState(value);
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(FUNCIONARIO_KEY, String(value));
  };

  const value = useMemo<UserContextValue>(
    () => ({ email, setEmail, isFuncionario, setIsFuncionario }),
    [email, isFuncionario],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
