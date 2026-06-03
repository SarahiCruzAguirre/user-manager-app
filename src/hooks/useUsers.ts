"use client";

import { useState, useEffect, useCallback } from "react";
import { userService } from "../services/userService";

interface UserProps {
  _id?: string;
  nombre: string;
  cc: string;
  email: string;
  role: string;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memorizamos la función con useCallback
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data as UserProps[]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al sincronizar usuarios");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // CORRECCIÓN DEFINITIVA PARA ESLINT: Rompe la ejecución síncrona en el montaje
  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted) {
        fetchUsers();
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchUsers]);

  const addUser = async (userData: Omit<UserProps, "_id">) => {
    try {
      await userService.createUser(userData);
      await fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo registrar";
      throw new Error(msg);
    }
  };

  const editUser = async (id: string, userData: Partial<UserProps>) => {
    try {
      await userService.updateUser(id, userData);
      await fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo actualizar";
      throw new Error(msg);
    }
  };

  const removeUser = async (id: string) => {
    try {
      await userService.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo remover";
      throw new Error(msg);
    }
  };

  return {
    users,
    loading,
    error,
    addUser,
    editUser,
    removeUser,
    refreshUsers: fetchUsers,
  };
}