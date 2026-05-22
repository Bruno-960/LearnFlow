import { supabase } from "../supabase";
import { getProfileId } from "./profileData";

export type CalendarReminderData = {
  id: string;
  date: string;
  title: string;
};

export type CalendarRuleType = "folga" | "estudo" | "revisao" | "simulado" | "outro";
export type CalendarRuleFrequency = "weekly" | "biweekly";
export type CalendarRuleColor = "orange" | "purple" | "blue" | "green" | "rose" | "slate";

export type CalendarRuleData = {
  id: string;
  title: string;
  type: CalendarRuleType;
  weekday: number;
  frequency: CalendarRuleFrequency;
  startDate: string;
  color: CalendarRuleColor;
  isActive: boolean;
};

export type CalendarRuleOccurrenceData = {
  ruleId: string;
  date: string;
  title: string;
  type: CalendarRuleType;
  frequency: CalendarRuleFrequency;
  color: CalendarRuleColor;
};

type CalendarRuleOccurrenceRow = {
  rule_id: string;
  date: string;
  title: string;
  rule_type: CalendarRuleType;
  frequency: CalendarRuleFrequency;
  color: CalendarRuleColor;
};

function getCalendarErrorMessage(error: { message?: string } | null) {
  const message = error?.message || "Erro desconhecido do Supabase.";

  if (message.includes("calendar_rules") || message.includes("calendar_reminders")) {
    return "As tabelas do calendario ainda nao existem no Supabase. Execute supabase-calendar-schema.sql no SQL Editor.";
  }

  if (message.toLowerCase().includes("row-level security")) {
    return "O Supabase bloqueou a gravacao por politica RLS. Entre na sua conta e execute as policies do calendario.";
  }

  return message;
}

export async function loadCalendarReminders(year: number): Promise<CalendarReminderData[]> {
  if (!supabase) return [];

  const profileId = await getProfileId();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from("calendar_reminders")
    .select("id,date,title")
    .eq("profile_id", profileId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    console.warn("Nao foi possivel carregar lembretes do calendario:", error.message);
    return [];
  }

  return (data || []).map((reminder) => ({
    id: reminder.id,
    date: reminder.date,
    title: reminder.title,
  }));
}

export async function saveCalendarReminder(date: string, title: string): Promise<CalendarReminderData> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const profileId = await getProfileId();

  const { data, error } = await supabase
    .from("calendar_reminders")
    .insert({
      profile_id: profileId,
      date,
      title,
    })
    .select("id,date,title")
    .single();

  if (error) throw new Error(getCalendarErrorMessage(error));

  return {
    id: data.id,
    date: data.date,
    title: data.title,
  };
}

export async function deleteCalendarReminder(id: string): Promise<void> {
  if (!supabase) return;

  const profileId = await getProfileId();

  const { error } = await supabase
    .from("calendar_reminders")
    .delete()
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) throw new Error(getCalendarErrorMessage(error));
}

export async function loadCalendarRules(): Promise<CalendarRuleData[]> {
  if (!supabase) return [];

  const profileId = await getProfileId();

  const { data, error } = await supabase
    .from("calendar_rules")
    .select("id,title,rule_type,weekday,frequency,start_date,color,is_active")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Nao foi possivel carregar regras do calendario:", error.message);
    return [];
  }

  return (data || []).map((rule) => ({
    id: rule.id,
    title: rule.title,
    type: rule.rule_type,
    weekday: Number(rule.weekday),
    frequency: rule.frequency,
    startDate: rule.start_date,
    color: rule.color,
    isActive: Boolean(rule.is_active),
  }));
}

export async function saveCalendarRule(rule: Omit<CalendarRuleData, "id">): Promise<CalendarRuleData> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const profileId = await getProfileId();

  const { data, error } = await supabase
    .from("calendar_rules")
    .insert({
      profile_id: profileId,
      title: rule.title,
      rule_type: rule.type,
      weekday: rule.weekday,
      frequency: rule.frequency,
      start_date: rule.startDate,
      color: rule.color,
      is_active: rule.isActive,
    })
    .select("id,title,rule_type,weekday,frequency,start_date,color,is_active")
    .single();

  if (error) throw new Error(getCalendarErrorMessage(error));

  return {
    id: data.id,
    title: data.title,
    type: data.rule_type,
    weekday: Number(data.weekday),
    frequency: data.frequency,
    startDate: data.start_date,
    color: data.color,
    isActive: Boolean(data.is_active),
  };
}

export async function deleteCalendarRule(id: string): Promise<void> {
  if (!supabase) return;

  const profileId = await getProfileId();

  const { error } = await supabase
    .from("calendar_rules")
    .delete()
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) throw new Error(getCalendarErrorMessage(error));
}

export async function loadCalendarRuleOccurrences(year: number): Promise<CalendarRuleOccurrenceData[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_calendar_rule_occurrences", {
    range_start: `${year}-01-01`,
    range_end: `${year}-12-31`,
  });

  if (error) {
    console.warn("Nao foi possivel carregar recorrencias do calendario:", error.message);
    return [];
  }

  return ((data || []) as CalendarRuleOccurrenceRow[]).map((occurrence) => ({
    ruleId: occurrence.rule_id,
    date: occurrence.date,
    title: occurrence.title,
    type: occurrence.rule_type,
    frequency: occurrence.frequency,
    color: occurrence.color,
  }));
}
