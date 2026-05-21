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

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;

  return mapAuthUser(data.user);
}

export function onAuthUserChange(callback: (user: AuthUser | null) => void) {
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(mapAuthUser(session?.user ?? null));
  });

  return () => data.subscription.unsubscribe();
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
