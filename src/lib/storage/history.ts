"use client";

import { useCallback } from "react";
import { getHistoryLocal, saveHistoryLocal } from "./localStorage";
import { HistoryEntry } from "@/types";

export function useHistoryManager() {
  const push = useCallback((entry: HistoryEntry) => {
    const list = getHistoryLocal();
    const next = [entry, ...list].slice(0, 80);
    saveHistoryLocal(next);
    return next;
  }, []);

  const removeAll = useCallback(() => {
    saveHistoryLocal([]);
  }, []);

  return { push, removeAll };
}
