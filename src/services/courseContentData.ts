import type { SubjectActivity, SubjectLessonSection, SubjectModuleContent, SubjectVisual } from "../data/subjectContent";
import { supabase } from "../supabase";

export type SubjectModuleMap = Record<string, SubjectModuleContent[]>;

type SubjectRow = {
  id: string;
  name: string;
};

type CourseModuleRow = {
  id: string;
  subject_id: string;
  title: string;
  objective: string;
  sort_order: number;
};

type LessonRow = {
  id: string;
  module_id: string;
  title: string;
  summary: string;
  sort_order: number;
};

type LessonBlockRow = {
  id: string;
  lesson_id: string;
  block_type: string;
  title: string;
  content: string;
  sort_order: number;
};

type LessonExerciseRow = {
  id: string;
  lesson_id: string;
  question: string;
  exercise_type: "open" | "multiple_choice";
  choices: unknown;
  correct_answer: string;
  explanation: string;
  difficulty: "facil" | "medio" | "dificil";
  sort_order: number;
};

type RemoteContent = {
  subjects: SubjectRow[];
  modules: CourseModuleRow[];
  lessons: LessonRow[];
  blocks: LessonBlockRow[];
  exercises: LessonExerciseRow[];
};

const BLOCK_LEVEL: Record<string, SubjectLessonSection["level"]> = {
  intro: "introducao",
  theory: "basico",
  example: "intermediario",
  guided_practice: "intermediario",
  common_mistake: "avancado",
  visual_summary: "intermediario",
  mind_map: "intermediario",
  review: "avancado",
  challenge: "avancado",
};

function bySortOrder<T extends { sort_order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function splitParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function parseChoices(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const choices = value
    .map((choice) => (typeof choice === "string" ? choice.trim() : ""))
    .filter(Boolean);

  return choices.length > 0 ? choices : undefined;
}

function getCorrectChoiceIndex(choices: string[] | undefined, correctAnswer: string) {
  if (!choices) return undefined;

  const answer = normalizeText(correctAnswer);
  const letterIndex = "abcde".indexOf(answer);
  if (letterIndex >= 0 && letterIndex < choices.length) return letterIndex;

  const exactIndex = choices.findIndex((choice) => normalizeText(choice) === answer);
  return exactIndex >= 0 ? exactIndex : undefined;
}

function blockToSection(block: LessonBlockRow): SubjectLessonSection {
  const section: SubjectLessonSection = {
    title: block.title || "Conteudo",
    level: BLOCK_LEVEL[block.block_type] ?? "basico",
    paragraphs: splitParagraphs(block.content),
  };

  if (block.block_type === "common_mistake") {
    section.commonMistake = block.content;
  }

  if (block.block_type === "guided_practice" || block.block_type === "challenge") {
    section.teacherTip = "Leia a situacao, identifique os dados e explique o raciocinio antes de responder.";
  }

  return section;
}

function exerciseToActivity(exercise: LessonExerciseRow): SubjectActivity {
  const choices = parseChoices(exercise.choices);

  return {
    question: exercise.question,
    answer: exercise.correct_answer,
    choices,
    correctChoice: getCorrectChoiceIndex(choices, exercise.correct_answer),
    difficulty: exercise.difficulty,
    explanation: exercise.explanation || undefined,
  };
}

function buildModuleContent(
  module: CourseModuleRow,
  lessons: LessonRow[],
  blocksByLesson: Map<string, LessonBlockRow[]>,
  exercisesByLesson: Map<string, LessonExerciseRow[]>,
): SubjectModuleContent {
  const moduleLessons = bySortOrder(lessons.filter((lesson) => lesson.module_id === module.id));
  const moduleBlocks = moduleLessons.flatMap((lesson) => bySortOrder(blocksByLesson.get(lesson.id) ?? []));
  const moduleExercises = moduleLessons.flatMap((lesson) => bySortOrder(exercisesByLesson.get(lesson.id) ?? []));
  const exampleBlocks = moduleBlocks.filter((block) => block.block_type === "example");
  const reviewBlocks = moduleBlocks.filter((block) => ["visual_summary", "mind_map", "review"].includes(block.block_type));
  const explanation = moduleBlocks.length > 0
    ? moduleBlocks.map((block) => block.content)
    : moduleLessons.map((lesson) => lesson.summary).filter(Boolean);
  const lessonTitles = moduleLessons.map((lesson) => lesson.title).filter(Boolean);
  const nodes = moduleBlocks.map((block) => block.title).filter(Boolean).slice(0, 6);

  const visual: SubjectVisual | undefined = nodes.length > 0
    ? {
      type: "concept-map",
      title: `Mapa de ${module.title}`,
      description: "Sequencia dos principais conceitos desta aula.",
      nodes,
    }
    : undefined;

  const difficultExercise = moduleExercises.find((exercise) => exercise.difficulty === "dificil");

  return {
    title: module.title,
    objective: module.objective || moduleLessons[0]?.summary || "Estudar este modulo com explicacao, exemplos e pratica.",
    explanation: explanation.length > 0 ? explanation : [module.objective],
    examples: exampleBlocks.map((block) => ({
      title: block.title || "Exemplo",
      content: block.content,
    })),
    activities: moduleExercises.map(exerciseToActivity),
    learningPath: lessonTitles.length > 0 ? lessonTitles : undefined,
    sections: moduleBlocks.map(blockToSection),
    visual,
    review: {
      summary: reviewBlocks.length > 0 ? reviewBlocks.map((block) => block.content) : explanation.slice(0, 4),
      mentalMap: nodes.length > 0 ? nodes : lessonTitles.slice(0, 6),
      flashcards: moduleBlocks.slice(0, 3).map((block) => ({
        front: block.title || `Conceito de ${module.title}`,
        back: block.content,
      })),
    },
    miniChallenge: difficultExercise ? exerciseToActivity(difficultExercise) : undefined,
  };
}

function buildContentMap(remote: RemoteContent): SubjectModuleMap {
  const subjectsById = new Map(remote.subjects.map((subject) => [subject.id, subject]));
  const lessonsByModule = new Map<string, LessonRow[]>();
  const blocksByLesson = new Map<string, LessonBlockRow[]>();
  const exercisesByLesson = new Map<string, LessonExerciseRow[]>();
  const modulesBySubject = new Map<string, CourseModuleRow[]>();

  remote.modules.forEach((module) => {
    const current = modulesBySubject.get(module.subject_id) ?? [];
    modulesBySubject.set(module.subject_id, [...current, module]);
  });

  remote.lessons.forEach((lesson) => {
    const current = lessonsByModule.get(lesson.module_id) ?? [];
    lessonsByModule.set(lesson.module_id, [...current, lesson]);
  });

  remote.blocks.forEach((block) => {
    const current = blocksByLesson.get(block.lesson_id) ?? [];
    blocksByLesson.set(block.lesson_id, [...current, block]);
  });

  remote.exercises.forEach((exercise) => {
    const current = exercisesByLesson.get(exercise.lesson_id) ?? [];
    exercisesByLesson.set(exercise.lesson_id, [...current, exercise]);
  });

  const contentMap: SubjectModuleMap = {};

  modulesBySubject.forEach((modules, subjectId) => {
    const subject = subjectsById.get(subjectId);
    if (!subject) return;

    contentMap[subject.name] = bySortOrder(modules).map((module) =>
      buildModuleContent(
        module,
        lessonsByModule.get(module.id) ?? [],
        blocksByLesson,
        exercisesByLesson,
      )
    );
  });

  return contentMap;
}

async function loadRemoteCourseContent(): Promise<SubjectModuleMap> {
  if (!supabase) {
    throw new Error("Supabase nao esta configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }

  const [
    subjectsResult,
    modulesResult,
    lessonsResult,
    blocksResult,
    exercisesResult,
  ] = await Promise.all([
    supabase.from("subjects").select("id,name").eq("is_active", true).order("sort_order"),
    supabase
      .from("course_modules")
      .select("id,subject_id,title,objective,sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("lessons")
      .select("id,module_id,title,summary,sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("lesson_blocks")
      .select("id,lesson_id,block_type,title,content,sort_order")
      .order("sort_order"),
    supabase
      .from("lesson_exercises")
      .select("id,lesson_id,question,exercise_type,choices,correct_answer,explanation,difficulty,sort_order")
      .order("sort_order"),
  ]);

  const error = subjectsResult.error || modulesResult.error || lessonsResult.error || blocksResult.error || exercisesResult.error;
  if (error) throw error;

  return buildContentMap({
    subjects: (subjectsResult.data ?? []) as SubjectRow[],
    modules: (modulesResult.data ?? []) as CourseModuleRow[],
    lessons: (lessonsResult.data ?? []) as LessonRow[],
    blocks: (blocksResult.data ?? []) as LessonBlockRow[],
    exercises: (exercisesResult.data ?? []) as LessonExerciseRow[],
  });
}

export async function loadCourseContent(): Promise<SubjectModuleMap> {
  return loadRemoteCourseContent();
}
