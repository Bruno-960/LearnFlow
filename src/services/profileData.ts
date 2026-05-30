import { supabase } from "../supabase";
import { getCurrentAuthUser } from "./authData";

export type LearnFlowProfile = {
  id: string;
  userNumber?: number | null;
  name: string;
  streakDays: number;
  lastStudyDate?: string | null;
  avatarUrl?: string | null;
  avatarPositionX?: number;
  avatarPositionY?: number;
  frameId?: ProfileFrameId;
};

type ProfileUpsertPayload = {
  id: string;
  name: string;
  streak_days: number;
  updated_at: string;
  last_study_date?: string | null;
  avatar_url?: string | null;
  avatar_position_x?: number;
  avatar_position_y?: number;
  frame_id?: ProfileFrameId;
};

export type ProfileFrameId =
  | "none"
  | "learnflow"
  | "streak"
  | "focus"
  | "mastery"
  | "aprendiz"
  | "persistente"
  | "mestre"
  | "invicto"
  | "lenda-learnflow"
  | "explorador"
  | "enem-candidato"
  | "enem-maratonista"
  | "enem-700"
  | "enem-800"
  | "enem-900"
  | "enem-ouro"
  | "fogo"
  | "agua"
  | "ar"
  | "terra"
  | "raio"
  | "sombra"
  | "luz"
  | "cosmos"
  | "especial-fundador"
  | "especial-beta-tester"
  | "especial-veterano"
  | "especial-30-dias"
  | "especial-portal"
  | "especial-100-modulos";

export type UserActivityType = "materia" | "calendario" | "flashcard" | "simulado";

export type UserActivityDetails = {
  subjectName?: string;
  moduleTitle?: string;
  activityKey?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
};

export type UserActivityRecord = {
  streakDays: number;
  lastStudyDate: string;
};

const PROFILE_STORAGE_KEY = "learnflow_guest_profile_id";

export const DEFAULT_PROFILE: LearnFlowProfile = {
  id: "guest-pending",
  userNumber: null,
  name: "Estudante",
  streakDays: 0,
  lastStudyDate: null,
  avatarUrl: null,
  avatarPositionX: 0,
  avatarPositionY: 0,
  frameId: "learnflow",
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

function isMissingProfileCustomizationColumn(error: { message?: string } | null): boolean {
  const message = (error?.message || "").toLowerCase();
  return (
    message.includes("avatar_url")
    || message.includes("avatar_position_x")
    || message.includes("avatar_position_y")
    || message.includes("frame_id")
    || message.includes("user_number")
    || message.includes("schema cache")
    || message.includes("column")
  );
}

export async function loadProfile(): Promise<LearnFlowProfile> {
  const authUser = await getCurrentAuthUser();
  const profileId = authUser?.id ?? getGuestProfileId();
  const fallbackProfile: LearnFlowProfile = { ...DEFAULT_PROFILE, id: profileId };

  if (!supabase || !authUser) return fallbackProfile;

  let { data, error }: { data: Record<string, any> | null; error: { message?: string } | null } = await supabase
    .from("profiles")
    .select("id,user_number,name,streak_days,last_study_date,avatar_url,avatar_position_x,avatar_position_y,frame_id")
    .eq("id", profileId)
    .maybeSingle();

  if (error && isMissingProfileCustomizationColumn(error)) {
    const legacyResult = await supabase
      .from("profiles")
      .select("id,name,streak_days,last_study_date")
      .eq("id", profileId)
      .maybeSingle();
    data = legacyResult.data;
    error = legacyResult.error;
  }

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
    userNumber: "user_number" in data && data.user_number !== null ? Number(data.user_number) : null,
    name: data.name || DEFAULT_PROFILE.name,
    streakDays: Number(data.streak_days || 0),
    lastStudyDate: data.last_study_date || null,
    avatarUrl: "avatar_url" in data ? data.avatar_url || null : null,
    avatarPositionX: "avatar_position_x" in data && data.avatar_position_x !== null ? Number(data.avatar_position_x) : 0,
    avatarPositionY: "avatar_position_y" in data && data.avatar_position_y !== null ? Number(data.avatar_position_y) : 0,
    frameId: "frame_id" in data ? data.frame_id || DEFAULT_PROFILE.frameId : DEFAULT_PROFILE.frameId,
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

  if (Object.prototype.hasOwnProperty.call(profile, "avatarUrl")) {
    payload.avatar_url = profile.avatarUrl ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(profile, "avatarPositionX")) {
    payload.avatar_position_x = profile.avatarPositionX ?? 0;
  }

  if (Object.prototype.hasOwnProperty.call(profile, "avatarPositionY")) {
    payload.avatar_position_y = profile.avatarPositionY ?? 0;
  }

  if (Object.prototype.hasOwnProperty.call(profile, "frameId")) {
    payload.frame_id = profile.frameId ?? DEFAULT_PROFILE.frameId;
  }

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  if (error && isMissingProfileCustomizationColumn(error)) {
    const legacyPayload: ProfileUpsertPayload = {
      id: profile.id,
      name: profile.name,
      streak_days: profile.streakDays,
      updated_at: payload.updated_at,
    };

    if (Object.prototype.hasOwnProperty.call(profile, "lastStudyDate")) {
      legacyPayload.last_study_date = profile.lastStudyDate ?? null;
    }

    const legacyResult = await supabase.from("profiles").upsert(legacyPayload, { onConflict: "id" });
    if (legacyResult.error) throw new Error(getSupabaseErrorMessage(legacyResult.error));
    throw new Error("Atualize o esquema do Supabase para salvar foto e moldura do perfil.");
  }

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
    : 1;
  const nextProfile = {
    ...profile,
    streakDays: nextStreakDays,
    lastStudyDate: today,
  };

  await saveProfile(nextProfile);
  return nextProfile;
}

export async function recordUserActivity(
  activityType: UserActivityType,
  details: UserActivityDetails = {},
): Promise<UserActivityRecord | null> {
  const authUser = await getCurrentAuthUser();
  if (!supabase || !authUser) return null;

  const { data, error } = await supabase.rpc("record_user_activity", {
    p_activity_type: activityType,
    p_subject_name: details.subjectName ?? null,
    p_module_title: details.moduleTitle ?? null,
    p_activity_key: details.activityKey ?? null,
    p_reference_id: details.referenceId ?? null,
    p_metadata: details.metadata ?? {},
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
