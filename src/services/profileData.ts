import { supabase } from "../supabase";
import { getCurrentAuthUser } from "./authData";

export type LearnFlowProfile = {
  id: string;
  name: string;
  streakDays: number;
};

const PROFILE_STORAGE_KEY = "learnflow_guest_profile_id";

export const DEFAULT_PROFILE: LearnFlowProfile = {
  id: "guest-pending",
  name: "Estudante",
  streakDays: 0,
};

function createGuestProfileId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `guest-${crypto.randomUUID()}`;
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getGuestProfileId(): string {
  if (typeof window === "undefined") return DEFAULT_PROFILE.id;

  const existingProfileId = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (existingProfileId) return existingProfileId;

  const profileId = createGuestProfileId();
  window.localStorage.setItem(PROFILE_STORAGE_KEY, profileId);
  return profileId;
}

export async function getProfileId(): Promise<string> {
  const authUser = await getCurrentAuthUser();
  return authUser?.id ?? getGuestProfileId();
}

function getSupabaseErrorMessage(error: { message?: string } | null): string {
  const message = error?.message || "Erro desconhecido do Supabase.";

  if (message.includes("Could not find the table 'public.profiles'")) {
    return "A tabela public.profiles ainda nao existe no Supabase. Execute o arquivo supabase-schema.sql no SQL Editor do Supabase.";
  }

  if (message.toLowerCase().includes("row-level security")) {
    return "O Supabase bloqueou a gravacao por politica RLS. Execute as policies do arquivo supabase-schema.sql.";
  }

  return message;
}

export async function loadProfile(): Promise<LearnFlowProfile> {
  const profileId = await getProfileId();
  const fallbackProfile: LearnFlowProfile = { ...DEFAULT_PROFILE, id: profileId };

  if (!supabase) return fallbackProfile;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,streak_days")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    console.warn("Nao foi possivel carregar o perfil no Supabase:", error.message);
    return fallbackProfile;
  }

  if (!data) {
    try {
      await saveProfile(fallbackProfile);
    } catch (saveError) {
      console.warn(
        "Nao foi possivel criar o perfil inicial no Supabase:",
        saveError instanceof Error ? saveError.message : saveError,
      );
    }
    return fallbackProfile;
  }

  return {
    id: data.id,
    name: data.name || DEFAULT_PROFILE.name,
    streakDays: Number(data.streak_days || 0),
  };
}

export async function saveProfile(profile: LearnFlowProfile): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase nao configurado.");
  }

  const { error } = await supabase.from("profiles").upsert({
    id: profile.id,
    name: profile.name,
    streak_days: profile.streakDays,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });

  if (error) throw new Error(getSupabaseErrorMessage(error));
}
