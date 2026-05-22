export type SubjectActivity = {
  question: string;
  answer: string;
  choices?: string[];
  correctChoice?: number;
  difficulty?: "facil" | "medio" | "dificil";
  explanation?: string;
  rubric?: {
    label: string;
    accepted: string[];
    feedback: string;
  }[];
};

export type SubjectExample = {
  title: string;
  content: string;
};

export type SubjectLessonSection = {
  title: string;
  level: "introducao" | "basico" | "intermediario" | "avancado";
  paragraphs: string[];
  analogy?: string;
  whyItMatters?: string;
  commonMistake?: string;
  teacherTip?: string;
};

export type SubjectVisual = {
  type: "concept-map" | "function-graph" | "flow" | "timeline";
  title: string;
  description: string;
  nodes: string[];
};

export type SubjectReview = {
  summary: string[];
  mentalMap: string[];
  flashcards: { front: string; back: string }[];
};

export type SubjectModuleContent = {
  title: string;
  objective: string;
  explanation: string[];
  examples: SubjectExample[];
  activities: SubjectActivity[];
  learningPath?: string[];
  sections?: SubjectLessonSection[];
  visual?: SubjectVisual;
  review?: SubjectReview;
  miniChallenge?: SubjectActivity;
};

export const SUBJECT_MODULES: Record<string, SubjectModuleContent[]> = {};
