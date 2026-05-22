import { supabase } from "../supabase";
import { getProfileId } from "./profileData";

export type FlashcardDeckData = {
  id: string;
  name: string;
  subtitle: string;
  progress: number;
  icon: string;
  cards: number;
  createdAt: string;
};

export function buildFlashcardDeck(name: string): FlashcardDeckData {
  return {
    id: crypto.randomUUID(),
    name,
    subtitle: "Deck criado pelo usuario",
    progress: 0,
    icon: "cards",
    cards: 0,
    createdAt: new Date().toISOString(),
  };
}

export async function loadFlashcardDecks(): Promise<FlashcardDeckData[]> {
  if (!supabase) return [];

  const profileId = await getProfileId();

  const { data, error } = await supabase
    .from("flashcard_decks")
    .select("id,name,subtitle,progress,icon,cards,created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Nao foi possivel carregar decks no Supabase:", error.message);
    return [];
  }

  return (data || []).map((deck) => ({
    id: deck.id,
    name: deck.name,
    subtitle: deck.subtitle || "Deck criado pelo usuario",
    progress: Number(deck.progress || 0),
    icon: deck.icon || "▤",
    cards: Number(deck.cards || 0),
    createdAt: deck.created_at,
  }));
}

export async function saveFlashcardDeck(deck: FlashcardDeckData): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase nao configurado.");
  }

  const profileId = await getProfileId();

  const { error } = await supabase.from("flashcard_decks").insert({
    id: deck.id,
    profile_id: profileId,
    name: deck.name,
    subtitle: deck.subtitle,
    progress: deck.progress,
    icon: deck.icon,
    cards: deck.cards,
    created_at: deck.createdAt,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message || "Nao foi possivel salvar no Supabase.");
}

export async function createFlashcardDeck(name: string): Promise<FlashcardDeckData> {
  const deck = buildFlashcardDeck(name);
  await saveFlashcardDeck(deck);
  return deck;
}

export async function updateFlashcardDeckStats(deck: FlashcardDeckData): Promise<void> {
  if (!supabase) return;

  const profileId = await getProfileId();

  const { error } = await supabase
    .from("flashcard_decks")
    .update({
      cards: deck.cards,
      progress: deck.progress,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deck.id)
    .eq("profile_id", profileId);

  if (error) console.warn("Nao foi possivel atualizar deck no Supabase:", error.message);
}

