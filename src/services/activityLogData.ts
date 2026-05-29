import { supabase } from "../supabase";
import { getCurrentAuthUser } from "./authData";
import { getProfileId, type UserActivityType } from "./profileData";

export type LearningActivityRecord = {
  id: string;
  activityType: UserActivityType;
  activityDate: string;
  subjectName: string | null;
  moduleTitle: string | null;
  activityKey: string | null;
  referenceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type LearningActivitySummary = {
  todayCount: number;
  weekCount: number;
  activeDaysThisWeek: number;
  byType: Record<UserActivityType, number>;
  bySubject: Record<string, number>;
  recent: LearningActivityRecord[];
};

type ActivityLogRow = {
  id: string;
  activity_type: UserActivityType;
  activity_date: string;
  subject_name: string | null;
  module_title: string | null;
  activity_key: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export const EMPTY_LEARNING_ACTIVITY_SUMMARY: LearningActivitySummary = {
  todayCount: 0,
  weekCount: 0,
  activeDaysThisWeek: 0,
  byType: {
    materia: 0,
    calendario: 0,
    flashcard: 0,
    simulado: 0,
  },
  bySubject: {},
  recent: [],
};

function getBahiaDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bahia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getDateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getBahiaDateString(date);
}

function isMissingActivityLog(message: string) {
  return message.includes("Could not find the table 'public.user_activity_log'")
    || message.includes("user_activity_log")
    || message.includes("schema cache");
}

function mapActivity(row: ActivityLogRow): LearningActivityRecord {
  return {
    id: row.id,
    activityType: row.activity_type,
    activityDate: row.activity_date,
    subjectName: row.subject_name,
    moduleTitle: row.module_title,
    activityKey: row.activity_key,
    referenceId: row.reference_id,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export async function loadLearningActivitySummary(days = 14): Promise<LearningActivitySummary> {
  const authUser = await getCurrentAuthUser();
  if (!supabase || !authUser) return EMPTY_LEARNING_ACTIVITY_SUMMARY;

  const profileId = await getProfileId();
  const today = getBahiaDateString();
  const weekStart = getDateDaysAgo(6);
  const rangeStart = getDateDaysAgo(days - 1);

  const { data, error } = await supabase
    .from("user_activity_log")
    .select("id,activity_type,activity_date,subject_name,module_title,activity_key,reference_id,metadata,created_at")
    .eq("profile_id", profileId)
    .gte("activity_date", rangeStart)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    if (!isMissingActivityLog(error.message || "")) {
      console.warn("Nao foi possivel carregar historico de atividades:", error.message);
    }
    return EMPTY_LEARNING_ACTIVITY_SUMMARY;
  }

  const records = ((data || []) as ActivityLogRow[]).map(mapActivity);
  const weekRecords = records.filter((record) => record.activityDate >= weekStart);
  const byType = { ...EMPTY_LEARNING_ACTIVITY_SUMMARY.byType };
  const bySubject: Record<string, number> = {};

  weekRecords.forEach((record) => {
    byType[record.activityType] += 1;
    if (record.subjectName) {
      bySubject[record.subjectName] = (bySubject[record.subjectName] ?? 0) + 1;
    }
  });

  return {
    todayCount: records.filter((record) => record.activityDate === today).length,
    weekCount: weekRecords.length,
    activeDaysThisWeek: new Set(weekRecords.map((record) => record.activityDate)).size,
    byType,
    bySubject,
    recent: records.slice(0, 6),
  };
}
