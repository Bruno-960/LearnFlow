import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type CalendarReminderRow = {
  id: string;
  profile_id: string;
  date: string;
  title: string;
};

type CalendarRuleRow = {
  id: string;
  profile_id: string;
  title: string;
  rule_type: "folga" | "estudo" | "revisao" | "simulado" | "outro";
  weekday: number;
  frequency: "weekly" | "biweekly";
  start_date: string;
  is_active: boolean;
};

type PushSubscriptionRow = {
  id: string;
  profile_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

const CALENDAR_NOTIFY_MARKER = "[avisar-1d]";
const TIME_ZONE = "America/Bahia";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com";
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
  throw new Error("Missing Supabase or VAPID environment variables.");
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

const supabase = createClient(supabaseUrl, serviceRoleKey);

function formatDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function getTargetDate() {
  return formatDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000));
}

function normalizeCalendarText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCalendarDisplayTitle(title: string) {
  return title.replace(CALENDAR_NOTIFY_MARKER, "").trim();
}

function hasCalendarNotification(title: string) {
  return title.trim().startsWith(CALENDAR_NOTIFY_MARKER);
}

function isExamLikeCalendarTitle(title: string) {
  const normalizedTitle = normalizeCalendarText(getCalendarDisplayTitle(title));
  return ["simulado", "prova", "avaliacao", "enem", "vestibular"].some((term) =>
    normalizedTitle.includes(term)
  );
}

function getWeekdayIndex(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return (new Date(year, month - 1, day).getDay() + 6) % 7;
}

function getDateDiffInDays(fromDateKey: string, toDateKey: string) {
  const [fromYear, fromMonth, fromDay] = fromDateKey.split("-").map(Number);
  const [toYear, toMonth, toDay] = toDateKey.split("-").map(Number);
  const fromTime = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toTime = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.floor((toTime - fromTime) / (24 * 60 * 60 * 1000));
}

function ruleOccursOn(rule: CalendarRuleRow, dateKey: string) {
  if (!rule.is_active || rule.start_date > dateKey || rule.weekday !== getWeekdayIndex(dateKey)) {
    return false;
  }

  if (rule.frequency === "weekly") return true;

  const weekDiff = Math.floor(getDateDiffInDays(rule.start_date, dateKey) / 7);
  return weekDiff % 2 === 0;
}

async function loadEvents(targetDate: string) {
  const [{ data: reminders, error: remindersError }, { data: rules, error: rulesError }] = await Promise.all([
    supabase
      .from("calendar_reminders")
      .select("id,profile_id,date,title")
      .eq("date", targetDate),
    supabase
      .from("calendar_rules")
      .select("id,profile_id,title,rule_type,weekday,frequency,start_date,is_active")
      .eq("is_active", true)
      .lte("start_date", targetDate),
  ]);

  if (remindersError) throw remindersError;
  if (rulesError) throw rulesError;

  const reminderEvents = ((reminders || []) as CalendarReminderRow[])
    .filter((reminder) => hasCalendarNotification(reminder.title) || isExamLikeCalendarTitle(reminder.title))
    .map((reminder) => ({
      eventKey: `reminder:${reminder.id}`,
      profileId: reminder.profile_id,
      title: getCalendarDisplayTitle(reminder.title),
      date: reminder.date,
    }));

  const ruleEvents = ((rules || []) as CalendarRuleRow[])
    .filter((rule) => ruleOccursOn(rule, targetDate))
    .filter((rule) => hasCalendarNotification(rule.title) || rule.rule_type === "folga" || rule.rule_type === "simulado")
    .map((rule) => ({
      eventKey: `rule:${rule.id}:${targetDate}`,
      profileId: rule.profile_id,
      title: getCalendarDisplayTitle(rule.title),
      date: targetDate,
    }));

  return [...reminderEvents, ...ruleEvents];
}

Deno.serve(async () => {
  const targetDate = getTargetDate();
  const events = await loadEvents(targetDate);

  if (events.length === 0) {
    return Response.json({ targetDate, sent: 0, skipped: 0 });
  }

  const profileIds = Array.from(new Set(events.map((event) => event.profileId)));
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("calendar_push_subscriptions")
    .select("id,profile_id,endpoint,p256dh,auth")
    .eq("is_active", true)
    .in("profile_id", profileIds);

  if (subscriptionsError) throw subscriptionsError;

  let sent = 0;
  let skipped = 0;
  const activeSubscriptions = (subscriptions || []) as PushSubscriptionRow[];

  for (const event of events) {
    const eventSubscriptions = activeSubscriptions.filter((subscription) => subscription.profile_id === event.profileId);

    for (const subscription of eventSubscriptions) {
      const { error: deliveryError } = await supabase
        .from("calendar_notification_deliveries")
        .insert({
          subscription_id: subscription.id,
          event_key: event.eventKey,
          deliver_on: targetDate,
        });

      if (deliveryError) {
        skipped += 1;
        continue;
      }

      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title: "LearnFlow: compromisso amanhã",
            body: `${event.title} em ${event.date}.`,
            url: "/",
          }),
        );
        sent += 1;
      } catch (error) {
        const statusCode = typeof error === "object" && error !== null && "statusCode" in error
          ? Number((error as { statusCode?: number }).statusCode)
          : 0;

        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from("calendar_push_subscriptions")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("id", subscription.id);
        }
      }
    }
  }

  return Response.json({ targetDate, sent, skipped });
});
