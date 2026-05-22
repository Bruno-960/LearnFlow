import { supabase } from "../supabase";
import { updateFlashcardDeckStats, type FlashcardDeckData } from "./flashcardDeckData";
import { getProfileId } from "./profileData";

export type FlashcardData = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  reviewCount: number;
  createdAt: string;
};

export type FlashcardCreateResult = {
  card: FlashcardData;
  deck: FlashcardDeckData;
};

export function buildFlashcard(deckId: string, front: string, back: string): FlashcardData {
  return {
    id: crypto.randomUUID(),
    deckId,
    front,
    back,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };
}

function getFlashcardErrorMessage(error: { message?: string } | null): string {
  const message = error?.message || "";

  if (message.includes("Could not find the table 'public.flashcards'")) {
    return "A tabela de flashcards ainda não existe no Supabase. Execute o supabase-schema.sql atualizado no SQL Editor antes de salvar cards.";
  }

  if (message.toLowerCase().includes("row-level security")) {
    return "O Supabase bloqueou o flashcard por política de segurança. Execute as policies atualizadas do supabase-schema.sql.";
  }

  return message || "Não foi possível salvar o flashcard.";
}

export async function loadFlashcards(deckId: string): Promise<FlashcardData[]> {
  if (!supabase) return [];

  const profileId = await getProfileId();

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

  return (data || []).map((card) => ({
    id: card.id,
    deckId: card.deck_id,
    front: card.front,
    back: card.back,
    reviewCount: Number(card.review_count || 0),
    createdAt: card.created_at,
  }));
}

export async function saveFlashcard(card: FlashcardData): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase nao configurado.");
  }

  const profileId = await getProfileId();

  const { error } = await supabase.from("flashcards").insert({
    id: card.id,
    deck_id: card.deckId,
    profile_id: profileId,
    front: card.front,
    back: card.back,
    review_count: card.reviewCount,
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

export async function reviewFlashcard(card: FlashcardData): Promise<FlashcardData> {
  const reviewedCard = {
    ...card,
    reviewCount: card.reviewCount + 1,
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", card.id)
    .eq("profile_id", profileId);

  if (error) console.warn("Nao foi possivel atualizar revisao do flashcard:", error.message);
}
