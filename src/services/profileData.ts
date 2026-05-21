import { supabase } from "../supabase";

export type LearnFlowProfile = {
  id: string;
  name: string;
  streakDays: number;
};

export const PROFILE_ID = "local-user";

export const DEFAULT_PROFILE: LearnFlowProfile = {
  id: PROFILE_ID,
  name: "Estudante",
  streakDays: 0,
};

export async function loadProfile(): Promise<LearnFlowProfile> {
  if (!supabase) return DEFAULT_PROFILE;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,streak_days")
    .eq("id", PROFILE_ID)
    .maybeSingle();

  if (error) {
    console.warn("Nao foi possivel carregar o perfil no Supabase:", error.message);
    return DEFAULT_PROFILE;
  }

  if (!data) return DEFAULT_PROFILE;

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
  });

  if (error) throw error;
}
