import { supabase } from "../supabase";
import { getCurrentAuthUser } from "./authData";

export type LearnFlowProfile = {
  id: string;
  name: string;
  streakDays: number;
  lastStudyDate?: string | null;
};

type ProfileUpsertPayload = {
  id: string;
  name: string;
  streak_days: number;
  updated_at: string;
  last_study_date?: string | null;
};

export type UserActivityType = "materia" | "calendario" | "flashcard" | "simulado";

export type UserActivityRecord = {
  streakDays: number;
  lastStudyDate: string;
};

const PROFILE_STORAGE_KEY = "learnflow_guest_profile_id";

export const DEFAULT_PROFILE: LearnFlowProfile = {
  id: "guest-pending",
  name: "Estudante",
  streakDays: 0,
  lastStudyDate: null,
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
  const message = error?.message || "Erro desconhecido.";

  if (message.includes("Could not find the table 'public.profiles'")) {
    return "A area de perfil ainda nao esta pronta. Verifique se o esquema de usuarios foi criado.";
  }

  if (message.toLowerCase().includes("row-level security")) {
    return "Nao foi possivel salvar neste usuario. Entre novamente e tente outra vez.";
  }

  return message;
}

export async function loadProfile(): Promise<LearnFlowProfile> {
  const profileId = await getProfileId();
  const fallbackProfile: LearnFlowProfile = { ...DEFAULT_PROFILE, id: profileId };

  if (!supabase) return fallbackProfile;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,streak_days,last_study_date")
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
    lastStudyDate: data.last_study_date || null,
  };
}

export async function saveProfile(profile: LearnFlowProfile): Promise<void> {
  if (!supabase) {
    throw new Error("A conexao da conta nao esta configurada.");
  }

  const payload: ProfileUpsertPayload = {
    id: profile.id,
    name: profile.name,
    streak_days: profile.streakDays,
    updated_at: new Date().toISOString(),
  };

  if (Object.prototype.hasOwnProperty.call(profile, "lastStudyDate")) {
    payload.last_study_date = profile.lastStudyDate ?? null;
  }

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) throw new Error(getSupabaseErrorMessage(error));
}

function getBahiaDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bahia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getPreviousDateString(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export async function recordStudyDay(): Promise<LearnFlowProfile | null> {
  if (!supabase) return null;

  const profile = await loadProfile();
  const today = getBahiaDateString();

  if (profile.lastStudyDate === today) return profile;

  const yesterday = getPreviousDateString(today);
  const nextStreakDays = profile.lastStudyDate === yesterday
    ? profile.streakDays + 1
    : 0;
  const nextProfile = {
    ...profile,
    streakDays: nextStreakDays,
    lastStudyDate: today,
  };

  await saveProfile(nextProfile);
  return nextProfile;
}

export async function recordUserActivity(activityType: UserActivityType): Promise<UserActivityRecord | null> {
  const authUser = await getCurrentAuthUser();
  if (!supabase || !authUser) return null;

  const { data, error } = await supabase.rpc("record_user_activity", {
    p_activity_type: activityType,
  });

  if (!error) {
    const row = ((data || []) as { streak_days: number; last_study_date: string }[])[0];
    return row
      ? {
        streakDays: Number(row.streak_days || 0),
        lastStudyDate: row.last_study_date,
      }
      : null;
  }

  const message = error.message || "";
  const missingActivityFunction = message.includes("record_user_activity") || message.includes("function") || message.includes("schema cache");
  if (!missingActivityFunction) {
    console.warn("Nao foi possivel registrar atividade do usuario no Supabase:", message);
  }

  return null;
}
