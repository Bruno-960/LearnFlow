import { supabase } from "../supabase";
import { updateFlashcardDeckStats, type FlashcardDeckData } from "./flashcardDeckData";
import { getProfileId } from "./profileData";

export type FlashcardData = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  reviewCount: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  reviewIntervalDays: number;
  createdAt: string;
};

export type FlashcardReviewQuality = "again" | "good";

export type FlashcardCreateResult = {
  card: FlashcardData;
  deck: FlashcardDeckData;
};

export function buildFlashcard(deckId: string, front: string, back: string): FlashcardData {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    deckId,
    front,
    back,
    reviewCount: 0,
    lastReviewedAt: null,
    nextReviewAt: now,
    reviewIntervalDays: 1,
    createdAt: now,
  };
}

function getFlashcardErrorMessage(error: { message?: string } | null): string {
  const message = error?.message || "";

  if (message.includes("Could not find the table 'public.flashcards'")) {
    return "A area de flashcards ainda nao esta pronta. Verifique se o esquema de flashcards foi criado.";
  }

  if (message.toLowerCase().includes("row-level security")) {
    return "Nao foi possivel salvar este flashcard no usuario atual. Entre novamente e tente outra vez.";
  }

  return message || "Nao foi possivel salvar o flashcard.";
}

function isMissingSpacedReviewColumns(message: string) {
  return message.includes("last_reviewed_at")
    || message.includes("next_review_at")
    || message.includes("review_interval_days")
    || message.includes("schema cache");
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function mapFlashcard(card: {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  review_count: number | null;
  last_reviewed_at?: string | null;
  next_review_at?: string | null;
  review_interval_days?: number | null;
  created_at: string;
}): FlashcardData {
  return {
    id: card.id,
    deckId: card.deck_id,
    front: card.front,
    back: card.back,
    reviewCount: Number(card.review_count || 0),
    lastReviewedAt: card.last_reviewed_at ?? null,
    nextReviewAt: card.next_review_at ?? card.created_at,
    reviewIntervalDays: Number(card.review_interval_days || 1),
    createdAt: card.created_at,
  };
}

function getNextReviewInterval(card: FlashcardData, quality: FlashcardReviewQuality) {
  if (quality === "again") return 1;
  if (card.reviewCount <= 0) return 1;
  return Math.min(30, Math.max(1, card.reviewIntervalDays) * 2);
}

async function loadLegacyFlashcards(profileId: string, deckId: string): Promise<FlashcardData[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("flashcards")
    .select("id,deck_id,front,back,review_count,created_at")
    .eq("profile_id", profileId)
    .eq("deck_id", deckId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Nao foi possivel carregar flashcards no Supabase:", error.message);
    return [];
  }

  return (data || []).map(mapFlashcard);
}

export async function loadFlashcards(deckId: string): Promise<FlashcardData[]> {
  if (!supabase) return [];

  const profileId = await getProfileId();

  const { data, error } = await supabase
    .from("flashcards")
    .select("id,deck_id,front,back,review_count,last_reviewed_at,next_review_at,review_interval_days,created_at")
    .eq("profile_id", profileId)
    .eq("deck_id", deckId)
    .order("next_review_at", { ascending: true });

  if (error) {
    if (isMissingSpacedReviewColumns(error.message || "")) {
      return loadLegacyFlashcards(profileId, deckId);
    }

    console.warn("Nao foi possivel carregar flashcards no Supabase:", error.message);
    return [];
  }

  return (data || []).map(mapFlashcard);
}

export async function loadDueFlashcards(limit = 20): Promise<FlashcardData[]> {
  if (!supabase) return [];

  const profileId = await getProfileId();

  const { data, error } = await supabase
    .from("flashcards")
    .select("id,deck_id,front,back,review_count,last_reviewed_at,next_review_at,review_interval_days,created_at")
    .eq("profile_id", profileId)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at", { ascending: true })
    .limit(limit);

  if (error) {
    if (!isMissingSpacedReviewColumns(error.message || "")) {
      console.warn("Nao foi possivel carregar revisoes de flashcards:", error.message);
    }
    return [];
  }

  return (data || []).map(mapFlashcard);
}

export async function saveFlashcard(card: FlashcardData): Promise<void> {
  if (!supabase) {
    throw new Error("A conexao da conta nao esta configurada.");
  }

  const profileId = await getProfileId();

  const { error } = await supabase.from("flashcards").insert({
    id: card.id,
    deck_id: card.deckId,
    profile_id: profileId,
    front: card.front,
    back: card.back,
    review_count: card.reviewCount,
    last_reviewed_at: card.lastReviewedAt,
    next_review_at: card.nextReviewAt,
    review_interval_days: card.reviewIntervalDays,
    created_at: card.createdAt,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(getFlashcardErrorMessage(error));
}

export async function createFlashcardForDeck(
  deck: FlashcardDeckData,
  front: string,
  back: string,
): Promise<FlashcardCreateResult> {
  const card = buildFlashcard(deck.id, front, back);
  const nextDeck = {
    ...deck,
    cards: deck.cards + 1,
  };

  await saveFlashcard(card);
  await updateFlashcardDeckStats(nextDeck);

  return {
    card,
    deck: nextDeck,
  };
}

export async function reviewFlashcard(
  card: FlashcardData,
  quality: FlashcardReviewQuality = "good",
): Promise<FlashcardData> {
  const reviewedAt = new Date();
  const nextInterval = getNextReviewInterval(card, quality);
  const reviewedCard = {
    ...card,
    reviewCount: card.reviewCount + 1,
    lastReviewedAt: reviewedAt.toISOString(),
    nextReviewAt: addDays(reviewedAt, nextInterval).toISOString(),
    reviewIntervalDays: nextInterval,
  };

  await updateFlashcardReview(reviewedCard);
  return reviewedCard;
}

export async function updateFlashcardReview(card: FlashcardData): Promise<void> {
  if (!supabase) return;

  const profileId = await getProfileId();

  const { error } = await supabase
    .from("flashcards")
    .update({
      review_count: card.reviewCount,
      last_reviewed_at: card.lastReviewedAt,
      next_review_at: card.nextReviewAt,
      review_interval_days: card.reviewIntervalDays,
      updated_at: new Date().toISOString(),
    })
    .eq("id", card.id)
    .eq("profile_id", profileId);

  if (error) console.warn("Nao foi possivel atualizar revisao do flashcard:", error.message);
}
