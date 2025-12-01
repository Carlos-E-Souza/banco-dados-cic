"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type UserContextValue = {
  email: string | null;
  setEmail: (value: string | null) => void;
  cpf: string | null;
  setCpf: (value: string | null) => void;
  isFuncionario: boolean;
  setIsFuncionario: (value: boolean) => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

const STORAGE_KEY = "ouvidoria:user-email";
const CPF_KEY = "ouvidoria:user-cpf";
const FUNCIONARIO_KEY = "ouvidoria:is-funcionario";

export const UserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [email, setEmailState] = useState<string | null>(null);
  const [cpf, setCpfState] = useState<string | null>(null);
  const [isFuncionario, setIsFuncionarioState] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedEmail = window.sessionStorage.getItem(STORAGE_KEY);
    if (storedEmail) {
      setEmailState(storedEmail);
    }

    const storedCpf = window.sessionStorage.getItem(CPF_KEY);
    if (storedCpf) {
      setCpfState(storedCpf);
    }

    const storedIsFuncionario = window.sessionStorage.getItem(FUNCIONARIO_KEY);
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
      window.sessionStorage.setItem(STORAGE_KEY, value);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const setCpf = (value: string | null) => {
    setCpfState(value);
    if (typeof window === "undefined") {
      return;
    }

    if (value) {
      window.sessionStorage.setItem(CPF_KEY, value);
    } else {
      window.sessionStorage.removeItem(CPF_KEY);
    }
  };

  const setIsFuncionario = (value: boolean) => {
    setIsFuncionarioState(value);
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(FUNCIONARIO_KEY, String(value));
  };

  const value = useMemo<UserContextValue>(
    () => ({ email, setEmail, cpf, setCpf, isFuncionario, setIsFuncionario }),
    [email, cpf, isFuncionario],
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
