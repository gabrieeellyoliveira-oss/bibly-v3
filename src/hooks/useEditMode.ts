import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CardSize = "P" | "M" | "G";

export interface CardConfig {
  name: string;
  size: CardSize;
  visible: boolean;
  position: number;
}

export type CardConfigs = Record<string, CardConfig>;

interface DashboardLayoutRow {
  card_id: string;
  card_name: string | null;
  size: string | null;
  visible: boolean | null;
  position: number | null;
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export function useEditMode(defaultConfigs: CardConfigs) {
  const [editMode, setEditMode] = useState(false);
  const [cardConfigs, setCardConfigs] = useState<CardConfigs>(defaultConfigs);
  const [saving, setSaving] = useState(false);

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, []);

  const updateCard = useCallback((cardId: string, patch: Partial<CardConfig>) => {
    setCardConfigs((prev) => ({
      ...prev,
      [cardId]: { ...prev[cardId], ...patch },
    }));
  }, []);

  const LS_KEY = "bibly_card_configs";

  const loadLayout = useCallback(async () => {
    // 1. Tentar carregar do localStorage primeiro (sempre disponível)
    try {
      const local = localStorage.getItem(LS_KEY);
      if (local) {
        const saved = JSON.parse(local) as CardConfigs;
        setCardConfigs((prev) => {
          const next = { ...prev };
          for (const [id, cfg] of Object.entries(saved)) {
            if (next[id]) next[id] = { ...next[id], ...cfg };
          }
          return next;
        });
      }
    } catch { /* ignore */ }

    // 2. Tentar Supabase se autenticado
    const userId = await getCurrentUserId();
    if (!userId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("dashboard_layout")
      .select("card_id, card_name, size, visible, position")
      .eq("user_id", userId);

    if (error || !data) return;

    const rows = data as DashboardLayoutRow[];
    setCardConfigs((prev) => {
      const next = { ...prev };
      for (const row of rows) {
        if (next[row.card_id]) {
          next[row.card_id] = {
            ...next[row.card_id],
            name: row.card_name ?? next[row.card_id].name,
            size: (row.size as CardSize) ?? next[row.card_id].size,
            visible: row.visible ?? next[row.card_id].visible,
            position: row.position ?? next[row.card_id].position,
          };
        }
      }
      return next;
    });
  }, []);

  const saveLayout = useCallback(async () => {
    setSaving(true);
    try {
      // 1. Sempre salvar no localStorage (funciona sem Supabase Auth)
      localStorage.setItem(LS_KEY, JSON.stringify(cardConfigs));

      // 2. Tentar Supabase se autenticado
      const userId = await getCurrentUserId();
      if (userId) {
        const rows = Object.entries(cardConfigs).map(([cardId, cfg]) => ({
          user_id: userId,
          card_id: cardId,
          card_name: cfg.name,
          size: cfg.size,
          visible: cfg.visible,
          position: cfg.position,
          updated_at: new Date().toISOString(),
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("dashboard_layout")
          .upsert(rows, { onConflict: "user_id,card_id" });
      }
    } finally {
      setSaving(false);
    }
  }, [cardConfigs]);

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  return { editMode, toggleEditMode, cardConfigs, updateCard, saveLayout, saving };
}
