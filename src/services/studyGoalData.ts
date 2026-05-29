import { supabase } from "../supabase";
import { getCurrentAuthUser } from "./authData";
import { getProfileId } from "./profileData";

export type StudyGoals = {
  weeklyActiveDays: number;
  dailyActivityTarget: number;
};

type StudyGoalsRow = {
  weekly_active_days: number | null;
  daily_activity_target: number | null;
};

export const DEFAULT_STUDY_GOALS: StudyGoals = {
  weeklyActiveDays: 5,
  dailyActivityTarget: 3,
};

function clampInteger(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function isMissingStudyGoals(message: string) {
  return message.includes("Could not find the table 'public.study_goals'")
    || message.includes("study_goals")
    || message.includes("schema cache");
}

export function normalizeStudyGoals(goals: StudyGoals): StudyGoals {
  return {
    weeklyActiveDays: clampInteger(goals.weeklyActiveDays, 1, 7),
    dailyActivityTarget: clampInteger(goals.dailyActivityTarget, 1, 50),
  };
}

export async function loadStudyGoals(): Promise<StudyGoals> {
  const authUser = await getCurrentAuthUser();
  if (!supabase || !authUser) return DEFAULT_STUDY_GOALS;

  const profileId = await getProfileId();

  const { data, error } = await supabase
    .from("study_goals")
    .select("weekly_active_days,daily_activity_target")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    if (!isMissingStudyGoals(error.message || "")) {
      console.warn("Nao foi possivel carregar metas de estudo:", error.message);
    }
    return DEFAULT_STUDY_GOALS;
  }

  if (!data) return DEFAULT_STUDY_GOALS;

  const row = data as StudyGoalsRow;
  return normalizeStudyGoals({
    weeklyActiveDays: Number(row.weekly_active_days || DEFAULT_STUDY_GOALS.weeklyActiveDays),
    dailyActivityTarget: Number(row.daily_activity_target || DEFAULT_STUDY_GOALS.dailyActivityTarget),
  });
}

export async function saveStudyGoals(goals: StudyGoals): Promise<StudyGoals> {
  const authUser = await getCurrentAuthUser();
  if (!supabase || !authUser) {
    throw new Error("Entre na conta para salvar metas de estudo.");
  }

  const profileId = await getProfileId();
  const normalizedGoals = normalizeStudyGoals(goals);

  const { error } = await supabase.from("study_goals").upsert({
    profile_id: profileId,
    weekly_active_days: normalizedGoals.weeklyActiveDays,
    daily_activity_target: normalizedGoals.dailyActivityTarget,
    updated_at: new Date().toISOString(),
  }, { onConflict: "profile_id" });

  if (error) throw new Error(error.message || "Nao foi possivel salvar metas de estudo.");

  return normalizedGoals;
}
