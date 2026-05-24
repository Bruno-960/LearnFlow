import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export type AuthUser = {
  id: string;
  email: string;
};

function mapAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
  };
}

function getFriendlyAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (normalized.includes("user already registered") || normalized.includes("already registered")) {
    return "Este e-mail ja tem uma conta. Entre com a senha cadastrada.";
  }

  if (normalized.includes("password")) {
    return "A senha precisa atender aos requisitos minimos de seguranca.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }

  return "Nao foi possivel autenticar agora. Tente novamente.";
}

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user) return mapAuthUser(data.user);

  const { data: sessionData } = await supabase.auth.getSession();
  return mapAuthUser(sessionData.session?.user ?? null);
}

export function onAuthUserChange(callback: (user: AuthUser | null) => void) {
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(mapAuthUser(session?.user ?? null));
  });

  return () => data.subscription.unsubscribe();
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("A conexao da conta nao esta configurada.");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(getFriendlyAuthError(error.message));
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("A conexao da conta nao esta configurada.");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(getFriendlyAuthError(error.message));
}

export async function signOut(): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
