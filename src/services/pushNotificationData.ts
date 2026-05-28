import { supabase } from "../supabase";
import { getProfileId } from "./profileData";

type PushSubscriptionJson = {
  endpoint?: string;
  keys?: {
    auth?: string;
    p256dh?: string;
  };
};

const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function getPushSupportError() {
  if (!("serviceWorker" in navigator)) return "Este navegador não suporta service worker.";
  if (!("PushManager" in window)) return "Este navegador não suporta notificações push.";
  if (!("Notification" in window)) return "Este navegador não suporta notificações.";
  if (!vapidPublicKey) return "Configure VITE_VAPID_PUBLIC_KEY para ativar notificações no dispositivo.";
  if (!supabase) return "A conexão da conta não está configurada.";
  return null;
}

export function canUseDevicePushNotifications() {
  return getPushSupportError() === null;
}

export async function enableDevicePushNotifications(): Promise<"granted" | "denied" | "unsupported"> {
  const supportError = getPushSupportError();
  if (supportError) throw new Error(supportError);

  const permission = Notification.permission === "default"
    ? await Notification.requestPermission()
    : Notification.permission;

  if (permission !== "granted") return permission === "denied" ? "denied" : "unsupported";

  const registration = await navigator.serviceWorker.register("/learnflow-sw.js");
  const readyRegistration = await navigator.serviceWorker.ready;
  const existingSubscription = await readyRegistration.pushManager.getSubscription();
  const subscription = existingSubscription ?? await readyRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  const subscriptionJson = subscription.toJSON() as PushSubscriptionJson;
  if (!subscriptionJson.endpoint || !subscriptionJson.keys?.p256dh || !subscriptionJson.keys?.auth) {
    throw new Error("Não foi possível ler a inscrição de notificação do dispositivo.");
  }

  const profileId = await getProfileId();
  const { error } = await supabase!
    .from("calendar_push_subscriptions")
    .upsert({
      profile_id: profileId,
      endpoint: subscriptionJson.endpoint,
      p256dh: subscriptionJson.keys.p256dh,
      auth: subscriptionJson.keys.auth,
      user_agent: navigator.userAgent,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "profile_id,endpoint" });

  if (error) {
    throw new Error(error.message || "Não foi possível salvar a notificação do dispositivo.");
  }

  return "granted";
}
