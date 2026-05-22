import { supabase } from "../supabase";
import { getCurrentAuthUser } from "./authData";
import { getProfileId, recordStudyDay } from "./profileData";

export type StudyProgressMap = Record<string, Record<string, string[]>>;

export type LastStudyData = {
  subjectName: string;
  moduleTitle: string;
} | null;

type StudyProgressRow = {
  subject_name: string;
  module_title: string;
  activity_key: string;
  answered_at: string;
};

type RecordStudyActivityRow = {
  streak_days: number;
  last_study_date: string;
};

export type StudyActivitySaveResult = {
  streakDays: number;
  lastStudyDate: string;
} | null;

export async function loadStudyProgress(): Promise<{
  progress: StudyProgressMap;
  lastStudy: LastStudyData;
}> {
  const authUser = await getCurrentAuthUser();
  if (!supabase || !authUser) return { progress: {}, lastStudy: null };

  const profileId = await getProfileId();

  const { data, error } = await supabase
    .from("study_progress")
    .select("subject_name,module_title,activity_key,answered_at")
    .eq("profile_id", profileId)
    .order("answered_at", { ascending: false });

  if (error) {
    console.warn("Nao foi possivel carregar progresso de estudos no Supabase:", error.message);
    return { progress: {}, lastStudy: null };
  }

  const progress: StudyProgressMap = {};
  const rows = (data || []) as StudyProgressRow[];

  rows.forEach((row) => {
    progress[row.subject_name] ??= {};
    progress[row.subject_name][row.module_title] ??= [];

    if (!progress[row.subject_name][row.module_title].includes(row.activity_key)) {
      progress[row.subject_name][row.module_title].push(row.activity_key);
    }
  });

  const latest = rows[0];

  return {
    progress,
    lastStudy: latest
      ? {
        subjectName: latest.subject_name,
        moduleTitle: latest.module_title,
      }
      : null,
  };
}

export async function saveStudyActivityProgress(
  subjectName: string,
  moduleTitle: string,
  activityKey: string,
): Promise<StudyActivitySaveResult> {
  const authUser = await getCurrentAuthUser();
  if (!supabase || !authUser) return null;

  const { data: rpcData, error: rpcError } = await supabase.rpc("record_study_activity", {
    p_subject_name: subjectName,
    p_module_title: moduleTitle,
    p_activity_key: activityKey,
  });

  if (!rpcError) {
    const row = ((rpcData || []) as RecordStudyActivityRow[])[0];
    return row
      ? {
        streakDays: Number(row.streak_days || 0),
        lastStudyDate: row.last_study_date,
      }
      : null;
  }

  const rpcMessage = rpcError.message || "";
  const canFallback = rpcMessage.includes("record_study_activity") || rpcMessage.includes("function") || rpcMessage.includes("schema cache");

  if (!canFallback) {
    console.warn("Nao foi possivel salvar progresso de estudos no Supabase:", rpcMessage);
    return null;
  }

  const profileId = await getProfileId();

  const { error } = await supabase.from("study_progress").upsert({
    profile_id: profileId,
    subject_name: subjectName,
    module_title: moduleTitle,
    activity_key: activityKey,
    answered_at: new Date().toISOString(),
  }, {
    onConflict: "profile_id,subject_name,module_title,activity_key",
  });

  if (error) {
    console.warn("Nao foi possivel salvar progresso de estudos no Supabase:", error.message);
    return null;
  }

  const profile = await recordStudyDay();
  return profile
    ? {
      streakDays: profile.streakDays,
      lastStudyDate: profile.lastStudyDate ?? "",
    }
    : null;
}
