import { supabase } from "../supabase";
import { getCurrentAuthUser } from "./authData";
import { getProfileId } from "./profileData";

export type SimuladoAttemptArea = {
  correct: number;
  total: number;
};

export type SimuladoQuestionStatus = "correct" | "wrong" | "unanswered";

export type SimuladoAttemptQuestionData = {
  id?: string;
  attemptId?: string;
  questionId: string;
  questionNumber: number;
  area: string;
  languageChoice: string;
  prompt: string;
  studentAnswer: string | null;
  studentAnswerText: string;
  officialAnswer: string | null;
  officialAnswerText: string;
  isCorrect: boolean;
  status: SimuladoQuestionStatus;
};

export type SimuladoAttemptData = {
  id: string;
  examId: string;
  examTitle: string;
  examYear: number;
  examDay: number;
  languageChoice: string;
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percent: number;
  byArea: Record<string, SimuladoAttemptArea>;
  answers: Record<string, string>;
  recommendationArea: string | null;
  questions: SimuladoAttemptQuestionData[];
  finishedAt: string;
};

export type SimuladoAttemptSaveInput = Omit<SimuladoAttemptData, "id" | "finishedAt">;

type SimuladoAttemptRow = {
  id: string;
  exam_id: string;
  exam_title: string;
  exam_year: number;
  exam_day: number;
  language_choice: string;
  question_count: number;
  answered_count: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  percent: number;
  by_area: Record<string, SimuladoAttemptArea> | null;
  answers: Record<string, string> | null;
  recommendation_area: string | null;
  finished_at: string;
};

type SimuladoAttemptQuestionRow = {
  id: string;
  attempt_id: string;
  question_id: string;
  question_number: number;
  area: string;
  language_choice: string;
  prompt: string;
  student_answer: string | null;
  student_answer_text: string | null;
  official_answer: string | null;
  official_answer_text: string | null;
  is_correct: boolean;
  status: SimuladoQuestionStatus;
};

function mapQuestion(row: SimuladoAttemptQuestionRow): SimuladoAttemptQuestionData {
  return {
    id: row.id,
    attemptId: row.attempt_id,
    questionId: row.question_id,
    questionNumber: Number(row.question_number || 0),
    area: row.area,
    languageChoice: row.language_choice,
    prompt: row.prompt,
    studentAnswer: row.student_answer,
    studentAnswerText: row.student_answer_text ?? "Sem resposta",
    officialAnswer: row.official_answer,
    officialAnswerText: row.official_answer_text ?? "Gabarito indisponivel",
    isCorrect: Boolean(row.is_correct),
    status: row.status,
  };
}

function mapAttempt(row: SimuladoAttemptRow, questions: SimuladoAttemptQuestionData[] = []): SimuladoAttemptData {
  return {
    id: row.id,
    examId: row.exam_id,
    examTitle: row.exam_title,
    examYear: Number(row.exam_year || 0),
    examDay: Number(row.exam_day || 0),
    languageChoice: row.language_choice,
    questionCount: Number(row.question_count || 0),
    answeredCount: Number(row.answered_count || 0),
    correctCount: Number(row.correct_count || 0),
    wrongCount: Number(row.wrong_count || 0),
    unansweredCount: Number(row.unanswered_count || 0),
    percent: Number(row.percent || 0),
    byArea: row.by_area ?? {},
    answers: row.answers ?? {},
    recommendationArea: row.recommendation_area,
    questions,
    finishedAt: row.finished_at,
  };
}

function isMissingAttemptTable(message: string) {
  return message.includes("Could not find the table 'public.simulado_attempts'")
    || message.includes("simulado_attempts")
    || message.includes("schema cache");
}

function isMissingQuestionTable(message: string) {
  return message.includes("Could not find the table 'public.simulado_attempt_questions'")
    || message.includes("simulado_attempt_questions")
    || message.includes("schema cache");
}

async function loadAttemptQuestions(attemptIds: string[]): Promise<Record<string, SimuladoAttemptQuestionData[]>> {
  if (!supabase || attemptIds.length === 0) return {};

  const { data, error } = await supabase
    .from("simulado_attempt_questions")
    .select("id,attempt_id,question_id,question_number,area,language_choice,prompt,student_answer,student_answer_text,official_answer,official_answer_text,is_correct,status")
    .in("attempt_id", attemptIds)
    .order("question_number", { ascending: true });

  if (error) {
    if (!isMissingQuestionTable(error.message || "")) {
      console.warn("Nao foi possivel carregar respostas detalhadas do simulado:", error.message);
    }
    return {};
  }

  return ((data || []) as SimuladoAttemptQuestionRow[]).reduce<Record<string, SimuladoAttemptQuestionData[]>>((grouped, row) => {
    const attemptQuestions = grouped[row.attempt_id] ?? [];
    attemptQuestions.push(mapQuestion(row));
    grouped[row.attempt_id] = attemptQuestions;
    return grouped;
  }, {});
}

export async function loadSimuladoAttempts(limit = 10): Promise<SimuladoAttemptData[]> {
  const authUser = await getCurrentAuthUser();
  if (!supabase || !authUser) return [];

  const profileId = await getProfileId();

  const { data, error } = await supabase
    .from("simulado_attempts")
    .select("id,exam_id,exam_title,exam_year,exam_day,language_choice,question_count,answered_count,correct_count,wrong_count,unanswered_count,percent,by_area,answers,recommendation_area,finished_at")
    .eq("profile_id", profileId)
    .order("finished_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (!isMissingAttemptTable(error.message || "")) {
      console.warn("Nao foi possivel carregar historico de simulados:", error.message);
    }
    return [];
  }

  const rows = (data || []) as SimuladoAttemptRow[];
  const questionsByAttempt = await loadAttemptQuestions(rows.map((row) => row.id));

  return rows.map((row) => mapAttempt(row, questionsByAttempt[row.id] ?? []));
}

export async function saveSimuladoAttempt(input: SimuladoAttemptSaveInput): Promise<SimuladoAttemptData | null> {
  const authUser = await getCurrentAuthUser();
  if (!supabase || !authUser) return null;

  const profileId = await getProfileId();

  const { data, error } = await supabase
    .from("simulado_attempts")
    .insert({
      profile_id: profileId,
      exam_id: input.examId,
      exam_title: input.examTitle,
      exam_year: input.examYear,
      exam_day: input.examDay,
      language_choice: input.languageChoice,
      question_count: input.questionCount,
      answered_count: input.answeredCount,
      correct_count: input.correctCount,
      wrong_count: input.wrongCount,
      unanswered_count: input.unansweredCount,
      percent: input.percent,
      by_area: input.byArea,
      answers: input.answers,
      recommendation_area: input.recommendationArea,
    })
    .select("id,exam_id,exam_title,exam_year,exam_day,language_choice,question_count,answered_count,correct_count,wrong_count,unanswered_count,percent,by_area,answers,recommendation_area,finished_at")
    .single();

  if (error) {
    if (!isMissingAttemptTable(error.message || "")) {
      console.warn("Nao foi possivel salvar tentativa de simulado:", error.message);
    }
    return null;
  }

  const savedAttempt = mapAttempt(data as SimuladoAttemptRow, input.questions);

  if (input.questions.length > 0) {
    const { error: questionsError } = await supabase
      .from("simulado_attempt_questions")
      .insert(input.questions.map((question) => ({
        attempt_id: savedAttempt.id,
        profile_id: profileId,
        question_id: question.questionId,
        question_number: question.questionNumber,
        area: question.area,
        language_choice: question.languageChoice,
        prompt: question.prompt,
        student_answer: question.studentAnswer,
        student_answer_text: question.studentAnswerText,
        official_answer: question.officialAnswer,
        official_answer_text: question.officialAnswerText,
        is_correct: question.isCorrect,
        status: question.status,
      })));

    if (questionsError && !isMissingQuestionTable(questionsError.message || "")) {
      console.warn("Nao foi possivel salvar respostas detalhadas do simulado:", questionsError.message);
    }
  }

  return savedAttempt;
}
