import { useEffect, useRef, useState } from "react";
import {
  Home,
  Calendar,
  BookOpen,
  CreditCard,
  Timer,
  Trophy,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Bell,
  AlertTriangle,
  Download,
  Target,
  TrendingUp,
  CheckCircle2,
  History,
  ArrowRight,
  Activity,
  ChevronDown,
  Flame,
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  X,
  ExternalLink,
  FileText,
  RefreshCw,
  Camera,
  Lock,
  Coins,
} from "lucide-react";
import {
  DEFAULT_PROFILE,
  loadProfile,
  recordUserActivity,
  saveProfile,
  type UserActivityDetails,
  type UserActivityType,
  type ProfileFrameId,
} from "../services/profileData";
import {
  getCurrentAuthUser,
  onAuthUserChange,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  type AuthUser,
} from "../services/authData";
import {
  createFlashcardDeck,
  loadFlashcardDecks,
  type FlashcardDeckData,
} from "../services/flashcardDeckData";
import {
  createFlashcardForDeck,
  loadDueFlashcards,
  loadFlashcards,
  reviewFlashcard,
  type FlashcardData,
} from "../services/flashcardData";
import {
  loadStudyProgress,
  saveStudyActivityProgress,
  type LastStudyData,
  type StudyProgressMap,
} from "../services/studyProgressData";
import {
  deleteCalendarReminder,
  deleteCalendarRule,
  loadCalendarReminders,
  loadCalendarRuleOccurrences,
  loadCalendarRules,
  saveCalendarReminder,
  saveCalendarRule,
  type CalendarReminderData,
  type CalendarRuleColor,
  type CalendarRuleData,
  type CalendarRuleFrequency,
  type CalendarRuleOccurrenceData,
  type CalendarRuleType,
} from "../services/calendarData";
import {
  loadCourseContent,
  type SubjectModuleMap,
} from "../services/courseContentData";
import {
  loadSimuladoAttempts,
  saveSimuladoAttempt,
  type SimuladoAttemptData,
  type SimuladoAttemptQuestionData,
} from "../services/simuladoAttemptData";
import {
  EMPTY_LEARNING_ACTIVITY_SUMMARY,
  loadLearningActivitySummary,
  type LearningActivityRecord,
  type LearningActivitySummary,
} from "../services/activityLogData";
import {
  DEFAULT_STUDY_GOALS,
  loadStudyGoals,
  saveStudyGoals,
  type StudyGoals,
} from "../services/studyGoalData";
import { enableDevicePushNotifications } from "../services/pushNotificationData";
import type { SubjectModuleContent } from "../data/subjectContent";
import enem2025Q1SpanishDiversity from "../imports/enem2025/enem-2025-branco-esp-q1-diversidade-linguistica.jpg";
import enem2025Q2SleepCups from "../imports/enem2025/enem-2025-branco-ing-q2-sleep-cups.png";
import enem2025Q15Portraits from "../imports/enem2025/enem-2025-branco-por-q15-retratos.png";
import enem2025Q21Bienal from "../imports/enem2025/enem-2025-branco-por-q21-bienal.png";
import enem2025Q22Unicef from "../imports/enem2025/enem-2025-branco-por-q22-unicef.png";
import enem2025Q24IlhaFerro from "../imports/enem2025/enem-2025-branco-por-q24-ilha-ferro.png";
import enem2025Q25Varejao from "../imports/enem2025/enem-2025-branco-por-q25-varejao.png";
import enem2025Q26DoceMistura from "../imports/enem2025/enem-2025-branco-por-q26-doce-mistura.png";
import enem2025Q30Galileu from "../imports/enem2025/enem-2025-branco-por-q30-galileu.png";
import enem2025Q34Redes from "../imports/enem2025/enem-2025-branco-por-q34-redes.png";
import enem2025Q36ViolenciaEscola from "../imports/enem2025/enem-2025-branco-por-q36-violencia-escola.png";
import enem2025Q39BancoTatu from "../imports/enem2025/enem-2025-branco-por-q39-banco-tatu.png";
import enem2025Q43Gufra from "../imports/enem2025/enem-2025-branco-por-q43-gufra.png";

type View =
  | "home"
  | "calendar"
  | "materias"
  | "flashcards"
  | "simulados"
  | "avaliacoes"
  | "desempenho"
  | "configuracoes";

type StudyProgress = StudyProgressMap;

type StudyTarget = {
  subjectName: string;
  moduleTitle?: string;
};

type UpcomingExamAlert = {
  id: string;
  date: string;
  title: string;
  source: "reminder" | "rule";
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const NAV_ITEMS: { view: View; icon: React.ReactNode; label: string }[] = [
  { view: "home", icon: <Home className="w-5 h-5" />, label: "Início" },
  { view: "calendar", icon: <Calendar className="w-5 h-5" />, label: "Calendário" },
  { view: "materias", icon: <BookOpen className="w-5 h-5" />, label: "Matérias" },
  { view: "flashcards", icon: <CreditCard className="w-5 h-5" />, label: "Flashcards" },
  { view: "simulados", icon: <Timer className="w-5 h-5" />, label: "Simulados" },
  { view: "avaliacoes", icon: <Trophy className="w-5 h-5" />, label: "Avaliações" },
  { view: "desempenho", icon: <BarChart3 className="w-5 h-5" />, label: "Desempenho" },
  { view: "configuracoes", icon: <Settings className="w-5 h-5" />, label: "Configurações" },
];

const BOTTOM_NAV: (typeof NAV_ITEMS)[number][] = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[3],
  NAV_ITEMS[4],
];

const VIEW_TITLES: Record<View, { title: string; subtitle: string }> = {
  home: { title: "Início", subtitle: "Pronto para mais um dia de aprendizado?" },
  calendar: { title: "Calendário", subtitle: "Organize seus estudos" },
  materias: { title: "Matérias", subtitle: "Seus módulos de estudo" },
  flashcards: { title: "Flashcards", subtitle: "Reforce seus conhecimentos" },
  simulados: { title: "Simulados", subtitle: "Pratique com simulados" },
  avaliacoes: { title: "Avaliações", subtitle: "Seu desempenho" },
  desempenho: { title: "Desempenho", subtitle: "Acompanhe sua evolução" },
  configuracoes: { title: "Configurações", subtitle: "Personalize o app" },
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "LF";

type ProfileFrameCategory = "basicas" | "conquistas" | "enem" | "elementais" | "especiais" | "loja";

type ProfileFrameAvatarConfig = {
  size: number;
  offsetX: number;
  offsetY: number;
};

type ProfileFrameAssetConfig = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type ProfileFrame = {
  id: ProfileFrameId;
  label: string;
  description: string;
  unlock: string;
  category: ProfileFrameCategory;
  frameClass: string;
  assetSrc?: string;
  avatar?: ProfileFrameAvatarConfig;
  asset?: ProfileFrameAssetConfig;
  priceCoins?: number;
};

type ProfileUnlockStats = {
  completedModules: number;
  totalModules: number;
  streakDays: number;
  profileLevel: number;
  studiedSubjectCount: number;
  totalSubjects: number;
  simuladoAttempts: number;
  bestSimuladoPercent: number;
  bestEnemScore: number;
  hasCompletedFullExam: boolean;
  userNumber?: number | null;
};

type ProfileFrameAccess = {
  unlocked: boolean;
  reason: string;
};

const PROFILE_FRAME_CATEGORIES: { id: ProfileFrameCategory; label: string }[] = [
  { id: "basicas", label: "Básicas" },
  { id: "conquistas", label: "Conquistas" },
  { id: "enem", label: "ENEM" },
  { id: "elementais", label: "Elementais" },
  { id: "especiais", label: "Especiais" },
  { id: "loja", label: "Loja" },
];

type ProfileFrameFilter = ProfileFrameCategory | "all";
type SettingsTab = "perfil" | "molduras" | "metas" | "notificacoes" | "conta" | "aparencia";

const PROFILE_FRAME_FILTERS: { id: ProfileFrameFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "basicas", label: "Básicas" },
  { id: "conquistas", label: "Conquistas" },
  { id: "enem", label: "ENEM" },
  { id: "elementais", label: "Elementais" },
  { id: "especiais", label: "Especiais" },
  { id: "loja", label: "Loja" },
];

const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: "perfil", label: "Perfil" },
  { id: "molduras", label: "Molduras" },
  { id: "metas", label: "Metas" },
  { id: "notificacoes", label: "Notificações" },
  { id: "conta", label: "Conta" },
  { id: "aparencia", label: "Aparência" },
];

const FRAME_ASSET_VERSION = "v=20260530-elementais-2";
const SPECIAL_FRAME_ASSET_VERSION = "v=20260530-especiais-1";
const STORE_FRAME_ASSET_VERSION = "v=20260530-loja-2";
const STORE_FRAME_PURCHASES_KEY = "learnflow_store_frame_purchases";

const PROFILE_FRAMES: ProfileFrame[] = [
  {
    id: "none",
    label: "Simples",
    description: "Avatar sem moldura.",
    unlock: "Disponível para todos.",
    category: "basicas",
    frameClass: "bg-border",
  },
  {
    id: "learnflow",
    label: "LearnFlow",
    description: "Gradiente principal do app.",
    unlock: "Disponível para todos.",
    category: "basicas",
    frameClass: "bg-gradient-to-br from-primary via-purple-500 to-blue-500",
  },
  {
    id: "streak",
    label: "Sequência",
    description: "Visual de constância diária.",
    unlock: "Disponível para testes.",
    category: "basicas",
    frameClass: "bg-gradient-to-br from-orange-400 via-rose-500 to-primary",
  },
  {
    id: "focus",
    label: "Foco",
    description: "Para sessões de estudo intenso.",
    unlock: "Disponível para testes.",
    category: "basicas",
    frameClass: "bg-gradient-to-br from-cyan-400 via-blue-500 to-primary",
  },
  {
    id: "mastery",
    label: "Domínio",
    description: "Para destacar evolução.",
    unlock: "Disponível para testes.",
    category: "basicas",
    frameClass: "bg-gradient-to-br from-emerald-400 via-teal-500 to-primary",
  },
  {
    id: "aprendiz",
    label: "Aprendiz",
    description: "Primeira conquista de progresso.",
    unlock: "Completar o primeiro módulo.",
    category: "conquistas",
    frameClass: "bg-gradient-to-br from-amber-700 via-orange-500 to-yellow-300",
    assetSrc: "/frames/aprendiz.png",
    avatar: { size: 62, offsetX: 0, offsetY: 0 },
  },
  {
    id: "persistente",
    label: "Persistente",
    description: "Ritmo constante de conclusões.",
    unlock: "Completar 5 módulos.",
    category: "conquistas",
    frameClass: "bg-gradient-to-br from-lime-500 via-emerald-500 to-yellow-200",
    assetSrc: "/frames/persistente.png",
  },
  {
    id: "mestre",
    label: "Mestre dos Estudos",
    description: "Marco alto de domínio.",
    unlock: "Completar 20 módulos.",
    category: "conquistas",
    frameClass: "bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-300",
    assetSrc: "/frames/mestre.png",
  },
  {
    id: "invicto",
    label: "Invicto",
    description: "Sequência forte de estudos.",
    unlock: "7 dias seguidos estudando.",
    category: "conquistas",
    frameClass: "bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500",
    assetSrc: "/frames/invicto.png",
    avatar: { size: 62, offsetX: 0, offsetY: 0 },
  },
  {
    id: "lenda-learnflow",
    label: "Lenda LearnFlow",
    description: "Conquista máxima de conteúdo.",
    unlock: "Completar todos os módulos disponíveis.",
    category: "conquistas",
    frameClass: "bg-gradient-to-br from-zinc-200 via-zinc-500 to-zinc-900",
  },
  {
    id: "explorador",
    label: "Explorador",
    description: "Passe por todas as áreas.",
    unlock: "Estudar todas as matérias ao menos uma vez.",
    category: "conquistas",
    frameClass: "bg-gradient-to-br from-slate-300 via-stone-500 to-emerald-500",
    assetSrc: "/frames/explorador.png",
    avatar: { size: 62, offsetX: 0, offsetY: 0 },
  },
  {
    id: "enem-candidato",
    label: "Candidato",
    description: "Entrada na jornada ENEM.",
    unlock: "Fazer o primeiro simulado ENEM.",
    category: "enem",
    frameClass: "bg-gradient-to-br from-sky-300 via-blue-500 to-cyan-600",
    assetSrc: "/frames/enem-candidato.png",
  },
  {
    id: "enem-maratonista",
    label: "Maratonista",
    description: "Prova completa concluída.",
    unlock: "Concluir a prova completa do ENEM.",
    category: "enem",
    frameClass: "bg-gradient-to-br from-cyan-300 via-teal-500 to-blue-600",
    assetSrc: "/frames/enem-maratonista.png",
  },
  {
    id: "enem-700",
    label: "Nota 700+",
    description: "Primeiro patamar de destaque.",
    unlock: "Média acima de 700.",
    category: "enem",
    frameClass: "bg-gradient-to-br from-purple-400 via-fuchsia-500 to-indigo-600",
    assetSrc: "/frames/enem-700.png",
  },
  {
    id: "enem-800",
    label: "Nota 800+",
    description: "Desempenho avançado.",
    unlock: "Média acima de 800.",
    category: "enem",
    frameClass: "bg-gradient-to-br from-orange-300 via-amber-500 to-violet-700",
    assetSrc: "/frames/enem-800.png",
  },
  {
    id: "enem-900",
    label: "Nota 900+",
    description: "Nível de excelência.",
    unlock: "Média acima de 900.",
    category: "enem",
    frameClass: "bg-gradient-to-br from-red-400 via-rose-600 to-yellow-400",
    assetSrc: "/frames/enem-900.png",
  },
  {
    id: "enem-ouro",
    label: "Ouro ENEM",
    description: "Alta precisão na prova.",
    unlock: "Acertar mais de 85%.",
    category: "enem",
    frameClass: "bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-700",
    assetSrc: "/frames/enem-ouro.png",
  },
  {
    id: "fogo",
    label: "Fogo I",
    description: "Energia para iniciar a progressão.",
    unlock: "Nível 5.",
    category: "elementais",
    frameClass: "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-300",
    assetSrc: `/frames/fogo.png?${FRAME_ASSET_VERSION}`,
  },
  {
    id: "agua",
    label: "Água I",
    description: "Ritmo fluido de estudo.",
    unlock: "Nível 10.",
    category: "elementais",
    frameClass: "bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-700",
    assetSrc: `/frames/agua.png?${FRAME_ASSET_VERSION}`,
  },
  {
    id: "ar",
    label: "Ar I",
    description: "Leveza e velocidade.",
    unlock: "Nível 15.",
    category: "elementais",
    frameClass: "bg-gradient-to-br from-slate-100 via-sky-200 to-blue-300",
    assetSrc: `/frames/ar.png?${FRAME_ASSET_VERSION}`,
  },
  {
    id: "terra",
    label: "Terra I",
    description: "Base sólida de aprendizado.",
    unlock: "Nível 20.",
    category: "elementais",
    frameClass: "bg-gradient-to-br from-stone-600 via-lime-600 to-emerald-400",
    assetSrc: `/frames/terra.png?${FRAME_ASSET_VERSION}`,
  },
  {
    id: "raio",
    label: "Raio I",
    description: "Resposta rápida e foco.",
    unlock: "Nível 25.",
    category: "elementais",
    frameClass: "bg-gradient-to-br from-yellow-200 via-amber-400 to-orange-600",
    assetSrc: `/frames/raio.png?${FRAME_ASSET_VERSION}`,
    avatar: { size: 48, offsetX: 0, offsetY: 3 },
  },
  {
    id: "sombra",
    label: "Sombra I",
    description: "Estudo intenso e silencioso.",
    unlock: "Nível 30.",
    category: "elementais",
    frameClass: "bg-gradient-to-br from-zinc-900 via-purple-900 to-fuchsia-500",
    assetSrc: `/frames/sombra.png?${FRAME_ASSET_VERSION}`,
  },
  {
    id: "luz",
    label: "Luz I",
    description: "Clareza nas revisões.",
    unlock: "Nível 35.",
    category: "elementais",
    frameClass: "bg-gradient-to-br from-yellow-100 via-amber-200 to-orange-300",
    assetSrc: `/frames/luz.png?${FRAME_ASSET_VERSION}`,
  },
  {
    id: "cosmos",
    label: "Cosmos I",
    description: "Progressão rara e completa.",
    unlock: "Nível 40.",
    category: "elementais",
    frameClass: "bg-gradient-to-br from-violet-500 via-indigo-700 to-blue-500",
    assetSrc: `/frames/cosmos.png?${FRAME_ASSET_VERSION}`,
  },
  {
    id: "especial-fundador",
    label: "Fundador",
    description: "Marco reservado ao fundador do LearnFlow.",
    unlock: "ID público #1.",
    category: "especiais",
    frameClass: "bg-gradient-to-br from-yellow-200 via-amber-500 to-blue-700",
    assetSrc: `/frames/especial-fundador.png?${SPECIAL_FRAME_ASSET_VERSION}`,
    avatar: { size: 60, offsetX: -2, offsetY: -2 },
  },
  {
    id: "especial-beta-tester",
    label: "Beta Tester",
    description: "Para quem testou o LearnFlow no início.",
    unlock: "Participar dos testes beta.",
    category: "especiais",
    frameClass: "bg-gradient-to-br from-cyan-200 via-sky-500 to-slate-700",
    assetSrc: `/frames/especial-beta-tester.png?${SPECIAL_FRAME_ASSET_VERSION}`,
    avatar: { size: 58, offsetX: -2, offsetY: -1 },
  },
  {
    id: "especial-veterano",
    label: "Veterano",
    description: "Para os primeiros estudantes cadastrados.",
    unlock: "Estar entre os 196 primeiros usuários.",
    category: "especiais",
    frameClass: "bg-gradient-to-br from-yellow-200 via-amber-500 to-yellow-900",
    assetSrc: `/frames/especial-veterano.png?${SPECIAL_FRAME_ASSET_VERSION}`,
    avatar: { size: 60, offsetX: -2, offsetY: -1 },
  },
  {
    id: "especial-30-dias",
    label: "30 Dias",
    description: "Constância forte de estudos.",
    unlock: "Fazer 30 dias de sequência.",
    category: "especiais",
    frameClass: "bg-gradient-to-br from-yellow-200 via-amber-500 to-red-700",
    assetSrc: `/frames/especial-30-dias.png?${SPECIAL_FRAME_ASSET_VERSION}`,
    avatar: { size: 60, offsetX: -2, offsetY: -1 },
  },
  {
    id: "especial-portal",
    label: "Portal",
    description: "Moldura rara para eventos especiais.",
    unlock: "Evento especial futuro.",
    category: "especiais",
    frameClass: "bg-gradient-to-br from-zinc-900 via-orange-700 to-amber-300",
    assetSrc: `/frames/especial-portal.png?${SPECIAL_FRAME_ASSET_VERSION}`,
    avatar: { size: 52, offsetX: 0, offsetY: 0 },
  },
  {
    id: "especial-100-modulos",
    label: "100 Módulos",
    description: "Domínio amplo de conteúdo.",
    unlock: "Completar 100 módulos.",
    category: "especiais",
    frameClass: "bg-gradient-to-br from-yellow-200 via-amber-500 to-emerald-700",
    assetSrc: `/frames/especial-100-modulos.png?${SPECIAL_FRAME_ASSET_VERSION}`,
    avatar: { size: 48, offsetX: 0, offsetY: -6 },
  },
  {
    id: "loja-anel-fogo",
    label: "Anel de Fogo",
    description: "Moldura premium com visual intenso.",
    unlock: "Comprar na Loja.",
    category: "loja",
    frameClass: "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-300",
    assetSrc: `/frames/loja-anel-fogo.png?${STORE_FRAME_ASSET_VERSION}`,
    avatar: { size: 55, offsetX: 0, offsetY: -5 },
    asset: { scale: 0.9, offsetX: 0, offsetY: -7 },
    priceCoins: 900,
  },
  {
    id: "loja-anel-gelo",
    label: "Anel de Gelo",
    description: "Moldura premium de cristais azuis.",
    unlock: "Comprar na Loja.",
    category: "loja",
    frameClass: "bg-gradient-to-br from-cyan-200 via-sky-500 to-blue-700",
    assetSrc: `/frames/loja-anel-gelo.png?${STORE_FRAME_ASSET_VERSION}`,
    avatar: { size: 53, offsetX: 0, offsetY: -5 },
    asset: { scale: 0.9, offsetX: 0, offsetY: -7 },
    priceCoins: 1100,
  },
  {
    id: "loja-gelo-espinhoso",
    label: "Gelo Espinhoso",
    description: "Moldura premium com acabamento afiado.",
    unlock: "Comprar na Loja.",
    category: "loja",
    frameClass: "bg-gradient-to-br from-sky-200 via-cyan-400 to-slate-500",
    assetSrc: `/frames/loja-gelo-espinhoso.png?${STORE_FRAME_ASSET_VERSION}`,
    avatar: { size: 56, offsetX: 0, offsetY: 0 },
    priceCoins: 1250,
  },
  {
    id: "loja-cristal-azul",
    label: "Cristal Azul",
    description: "Moldura premium de gelo nobre.",
    unlock: "Comprar na Loja.",
    category: "loja",
    frameClass: "bg-gradient-to-br from-blue-100 via-cyan-300 to-blue-700",
    assetSrc: `/frames/loja-cristal-azul.png?${STORE_FRAME_ASSET_VERSION}`,
    avatar: { size: 52, offsetX: -3, offsetY: -2 },
    asset: { scale: 0.92, offsetX: -4, offsetY: 0 },
    priceCoins: 1450,
  },
  {
    id: "loja-jade-real",
    label: "Jade Real",
    description: "Moldura premium com detalhe dourado.",
    unlock: "Comprar na Loja.",
    category: "loja",
    frameClass: "bg-gradient-to-br from-purple-600 via-indigo-800 to-amber-300",
    assetSrc: `/frames/loja-jade-real.png?${STORE_FRAME_ASSET_VERSION}`,
    avatar: { size: 49, offsetX: 0, offsetY: -8 },
    asset: { scale: 0.88, offsetX: 0, offsetY: -8 },
    priceCoins: 2100,
  },
  {
    id: "loja-ossos",
    label: "Ossos Antigos",
    description: "Moldura premium mineral.",
    unlock: "Comprar na Loja.",
    category: "loja",
    frameClass: "bg-gradient-to-br from-stone-300 via-cyan-500 to-slate-700",
    assetSrc: `/frames/loja-ossos.png?${STORE_FRAME_ASSET_VERSION}`,
    avatar: { size: 58, offsetX: 0, offsetY: 0 },
    priceCoins: 1500,
  },
  {
    id: "loja-roda-fogo",
    label: "Roda de Fogo",
    description: "Moldura premium com borda flamejante.",
    unlock: "Comprar na Loja.",
    category: "loja",
    frameClass: "bg-gradient-to-br from-orange-700 via-amber-400 to-red-500",
    assetSrc: `/frames/loja-roda-fogo.png?${STORE_FRAME_ASSET_VERSION}`,
    avatar: { size: 52, offsetX: -3, offsetY: -1 },
    asset: { scale: 0.92, offsetX: -4, offsetY: 0 },
    priceCoins: 1650,
  },
];

function getProfileFrame(frameId?: ProfileFrameId) {
  return PROFILE_FRAMES.find((frame) => frame.id === frameId) ?? PROFILE_FRAMES[1];
}

function getProfileLevel(completedModules: number, streakDays: number, totalActivities: number) {
  return Math.max(1, Math.min(99, Math.floor((completedModules * 3 + streakDays + totalActivities) / 5) + 1));
}

function getProfileTotalXp(completedModules: number, streakDays: number, totalActivities: number) {
  return (completedModules * 120) + (streakDays * 90) + (totalActivities * 35);
}

function getXpRequiredForNextLevel(level: number) {
  return 2000 + (Math.max(1, level) * 250);
}

function getStorePurchasesStorageKey(profileId: string) {
  return `${STORE_FRAME_PURCHASES_KEY}:${profileId || "guest"}`;
}

function getStoreFrameIds() {
  return new Set(PROFILE_FRAMES.filter((frame) => frame.category === "loja").map((frame) => frame.id));
}

function loadPurchasedStoreFrames(profileId: string): ProfileFrameId[] {
  if (typeof window === "undefined") return [];

  try {
    const storeFrameIds = getStoreFrameIds();
    const rawValue = window.localStorage.getItem(getStorePurchasesStorageKey(profileId));
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((frameId): frameId is ProfileFrameId => storeFrameIds.has(frameId as ProfileFrameId));
  } catch {
    return [];
  }
}

function savePurchasedStoreFrames(profileId: string, frameIds: ProfileFrameId[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorePurchasesStorageKey(profileId), JSON.stringify(frameIds));
}

function getLearnFlowCoinsEarned(stats: ProfileUnlockStats) {
  return (
    (stats.completedModules * 45)
    + (stats.streakDays * 25)
    + (stats.simuladoAttempts * 60)
    + (stats.studiedSubjectCount * 80)
    + (stats.hasCompletedFullExam ? 300 : 0)
    + (Math.floor(stats.bestSimuladoPercent / 10) * 25)
  );
}

function getPurchasedFrameCost(frameIds: Iterable<ProfileFrameId>) {
  const purchasedFrameIds = new Set(frameIds);
  return PROFILE_FRAMES.reduce((total, frame) => {
    if (frame.category !== "loja" || !purchasedFrameIds.has(frame.id)) return total;
    return total + (frame.priceCoins ?? 0);
  }, 0);
}

function getProfileUnlockStats({
  studyProgress,
  courseModules,
  streakDays,
  activitySummary,
  simuladoAttempts,
  userNumber,
}: {
  studyProgress: StudyProgress;
  courseModules: SubjectModuleMap;
  streakDays: number;
  activitySummary: LearningActivitySummary;
  simuladoAttempts: SimuladoAttemptData[];
  userNumber?: number | null;
}): ProfileUnlockStats {
  const { totalModules, completedModules } = getTotalProgressSummary(studyProgress, courseModules);
  const studiedSubjectCount = SUBJECTS.filter((subject) =>
    getSubjectProgressSummary(studyProgress, courseModules, subject.name).activeModules > 0
      || (activitySummary.bySubject[subject.name] ?? 0) > 0,
  ).length;

  return {
    completedModules,
    totalModules,
    streakDays,
    profileLevel: getProfileLevel(completedModules, streakDays, activitySummary.weekCount),
    studiedSubjectCount,
    totalSubjects: SUBJECTS.length,
    simuladoAttempts: simuladoAttempts.length,
    bestSimuladoPercent: simuladoAttempts.reduce((best, attempt) => Math.max(best, attempt.percent), 0),
    bestEnemScore: 0,
    hasCompletedFullExam: simuladoAttempts.some((attempt) =>
      attempt.questionCount > 0 && attempt.answeredCount >= attempt.questionCount,
    ),
    userNumber,
  };
}

function getProfileFrameAccess(
  frame: ProfileFrame,
  stats: ProfileUnlockStats,
  purchasedFrameIds: Set<ProfileFrameId> = new Set(),
): ProfileFrameAccess {
  if (stats.userNumber === 1) {
    return { unlocked: true, reason: "Liberada para o fundador." };
  }

  if (frame.category === "loja") {
    if (purchasedFrameIds.has(frame.id)) {
      return { unlocked: true, reason: "Comprada na Loja." };
    }

    return {
      unlocked: false,
      reason: `Custa ${(frame.priceCoins ?? 0).toLocaleString("pt-BR")} moedas LearnFlow.`,
    };
  }

  switch (frame.id) {
    case "none":
    case "learnflow":
    case "streak":
    case "focus":
    case "mastery":
      return { unlocked: true, reason: "Disponível para todos." };
    case "aprendiz":
      return { unlocked: stats.completedModules >= 1, reason: `Complete 1 módulo. Atual: ${stats.completedModules}.` };
    case "persistente":
      return { unlocked: stats.completedModules >= 5, reason: `Complete 5 módulos. Atual: ${stats.completedModules}.` };
    case "mestre":
      return { unlocked: stats.completedModules >= 20, reason: `Complete 20 módulos. Atual: ${stats.completedModules}.` };
    case "invicto":
      return { unlocked: stats.streakDays >= 7, reason: `Faça 7 dias de sequência. Atual: ${stats.streakDays}.` };
    case "lenda-learnflow":
      return {
        unlocked: stats.totalModules > 0 && stats.completedModules >= stats.totalModules,
        reason: `Complete todos os módulos. Atual: ${stats.completedModules}/${stats.totalModules}.`,
      };
    case "explorador":
      return {
        unlocked: stats.totalSubjects > 0 && stats.studiedSubjectCount >= stats.totalSubjects,
        reason: `Estude todas as matérias. Atual: ${stats.studiedSubjectCount}/${stats.totalSubjects}.`,
      };
    case "enem-candidato":
      return { unlocked: stats.simuladoAttempts >= 1, reason: `Faça 1 simulado ENEM. Atual: ${stats.simuladoAttempts}.` };
    case "enem-maratonista":
      return { unlocked: stats.hasCompletedFullExam, reason: "Conclua uma prova completa do ENEM." };
    case "enem-700":
      return { unlocked: stats.bestEnemScore >= 700, reason: "Alcance nota ENEM 700+ quando o cálculo de nota estiver disponível." };
    case "enem-800":
      return { unlocked: stats.bestEnemScore >= 800, reason: "Alcance nota ENEM 800+ quando o cálculo de nota estiver disponível." };
    case "enem-900":
      return { unlocked: stats.bestEnemScore >= 900, reason: "Alcance nota ENEM 900+ quando o cálculo de nota estiver disponível." };
    case "enem-ouro":
      return {
        unlocked: stats.hasCompletedFullExam && stats.bestSimuladoPercent >= 85,
        reason: `Conclua a prova e acerte mais de 85%. Melhor: ${stats.bestSimuladoPercent}%.`,
      };
    case "fogo":
      return { unlocked: stats.profileLevel >= 5, reason: `Chegue ao nível 5. Atual: ${stats.profileLevel}.` };
    case "agua":
      return { unlocked: stats.profileLevel >= 10, reason: `Chegue ao nível 10. Atual: ${stats.profileLevel}.` };
    case "ar":
      return { unlocked: stats.profileLevel >= 15, reason: `Chegue ao nível 15. Atual: ${stats.profileLevel}.` };
    case "terra":
      return { unlocked: stats.profileLevel >= 20, reason: `Chegue ao nível 20. Atual: ${stats.profileLevel}.` };
    case "raio":
      return { unlocked: stats.profileLevel >= 25, reason: `Chegue ao nível 25. Atual: ${stats.profileLevel}.` };
    case "sombra":
      return { unlocked: stats.profileLevel >= 30, reason: `Chegue ao nível 30. Atual: ${stats.profileLevel}.` };
    case "luz":
      return { unlocked: stats.profileLevel >= 35, reason: `Chegue ao nível 35. Atual: ${stats.profileLevel}.` };
    case "cosmos":
      return { unlocked: stats.profileLevel >= 40, reason: `Chegue ao nível 40. Atual: ${stats.profileLevel}.` };
    case "especial-fundador":
      return {
        unlocked: stats.userNumber === 1,
        reason: stats.userNumber ? `Reservada para o ID público #1. Seu ID: #${stats.userNumber}.` : "Reservada para o ID público #1.",
      };
    case "especial-beta-tester":
      return {
        unlocked: Boolean(stats.userNumber && stats.userNumber <= 3),
        reason: stats.userNumber ? `Disponível para testadores beta iniciais. Seu ID: #${stats.userNumber}.` : "Disponível para testadores beta iniciais.",
      };
    case "especial-veterano":
      return {
        unlocked: Boolean(stats.userNumber && stats.userNumber <= 196),
        reason: stats.userNumber ? `Disponível para os 196 primeiros usuários. Seu ID: #${stats.userNumber}.` : "Disponível para os 196 primeiros usuários.",
      };
    case "especial-30-dias":
      return { unlocked: stats.streakDays >= 30, reason: `Faça 30 dias de sequência. Atual: ${stats.streakDays}.` };
    case "especial-portal":
      return { unlocked: false, reason: "Reservada para evento especial futuro." };
    case "especial-100-modulos":
      return { unlocked: stats.completedModules >= 100, reason: `Complete 100 módulos. Atual: ${stats.completedModules}.` };
    default:
      return { unlocked: false, reason: frame.unlock };
  }
}

function ProfileFramePreview({
  frame,
  className = "h-24 w-24",
}: {
  frame: ProfileFrame;
  className?: string;
}) {
  if (frame.assetSrc) {
    const assetConfig = frame.asset ?? { scale: 1, offsetX: 0, offsetY: 0 };

    return (
      <img
        src={frame.assetSrc}
        alt=""
        aria-hidden="true"
        className={`${className} object-contain drop-shadow-sm`}
        style={{
          transform: `translate(${assetConfig.offsetX}%, ${assetConfig.offsetY}%) scale(${assetConfig.scale})`,
        }}
      />
    );
  }

  return (
    <div className={`${className} ${frame.frameClass} rounded-full p-2 shadow-sm`}>
      <div className="h-full w-full rounded-full bg-card" />
    </div>
  );
}

function ProfileFrameSelector({
  selectedFrameId,
  onSelect,
  name,
  avatarUrl,
  unlockStats,
  purchasedFrameIds = new Set<ProfileFrameId>(),
}: {
  selectedFrameId: ProfileFrameId;
  onSelect: (frameId: ProfileFrameId) => void;
  name: string;
  avatarUrl?: string | null;
  unlockStats: ProfileUnlockStats;
  purchasedFrameIds?: Set<ProfileFrameId>;
}) {
  return (
    <div className="space-y-4">
      {PROFILE_FRAME_CATEGORIES.map((category) => {
        const frames = PROFILE_FRAMES.filter((frame) => frame.category === category.id);
        if (!frames.length) return null;

        return (
          <section key={category.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">{category.label}</h3>
              <span className="text-xs text-muted-foreground">{frames.length} molduras</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {frames.map((frame) => {
                const access = getProfileFrameAccess(frame, unlockStats, purchasedFrameIds);

                return (
                  <button
                    key={frame.id}
                    className={`relative min-h-[148px] rounded-xl border p-3 text-center transition-colors ${
                      selectedFrameId === frame.id
                        ? "border-primary bg-primary/10"
                        : access.unlocked
                          ? "border-border hover:bg-accent"
                          : "border-border bg-muted/30 opacity-70"
                    }`}
                    type="button"
                    disabled={!access.unlocked}
                    title={access.unlocked ? frame.description : access.reason}
                    onClick={() => {
                      if (access.unlocked) onSelect(frame.id);
                    }}
                  >
                    <div className="flex min-h-[74px] items-center justify-center">
                      {frame.assetSrc ? (
                        <ProfileFramePreview frame={frame} className="h-20 w-20" />
                      ) : (
                        <ProfileAvatar name={name} avatarUrl={avatarUrl} frameId={frame.id} size="md" />
                      )}
                    </div>
                    {selectedFrameId === frame.id && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {!access.unlocked && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <p className="mt-2 text-sm font-semibold leading-tight text-foreground">{frame.label}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                      {access.unlocked ? frame.unlock : access.reason}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ProfileFrameGallery({
  selectedFrameId,
  onSelect,
  unlockStats,
  purchasedFrameIds,
  coinBalance,
  coinsEarned,
  onPurchase,
}: {
  selectedFrameId: ProfileFrameId;
  onSelect: (frameId: ProfileFrameId) => void;
  unlockStats: ProfileUnlockStats;
  purchasedFrameIds: Set<ProfileFrameId>;
  coinBalance: number;
  coinsEarned: number;
  onPurchase: (frameId: ProfileFrameId) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<ProfileFrameFilter>("all");
  const visibleCategories = activeFilter === "all"
    ? PROFILE_FRAME_CATEGORIES
    : PROFILE_FRAME_CATEGORIES.filter((category) => category.id === activeFilter);
  const unlockedFrameCount = PROFILE_FRAMES.filter((frame) => getProfileFrameAccess(frame, unlockStats, purchasedFrameIds).unlocked).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Molduras</h2>
            <p className="text-sm text-muted-foreground">Colete molduras exclusivas e mostre suas conquistas no LearnFlow.</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-semibold text-primary">{unlockedFrameCount}/{PROFILE_FRAMES.length}</p>
          <p className="text-xs text-muted-foreground">molduras liberadas</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-500/25 dark:bg-amber-500/10 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Moedas LearnFlow</p>
            <p className="text-muted-foreground">
              Ganhe moedas concluindo módulos, mantendo sequência, fazendo simulados e estudando novas matérias.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-background px-4 py-2 text-left shadow-sm sm:text-right">
          <p className="text-xl font-semibold text-foreground">{coinBalance.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground">{coinsEarned.toLocaleString("pt-BR")} ganhas no total</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-border pb-3">
        {PROFILE_FRAME_FILTERS.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${activeFilter === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            onClick={() => setActiveFilter(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-6">
        {visibleCategories.map((category) => {
          const frames = PROFILE_FRAMES.filter((frame) => frame.category === category.id);
          if (!frames.length) return null;

          return (
            <section key={category.id} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">
                  {category.label}
                </h3>
                {activeFilter !== "all" && (
                  <button className="text-xs font-medium text-primary hover:underline" onClick={() => setActiveFilter("all")} type="button">
                    Ver todas
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {frames.map((frame) => {
                  const isSelected = selectedFrameId === frame.id;
                  const access = getProfileFrameAccess(frame, unlockStats, purchasedFrameIds);
                  const isStoreFrame = frame.category === "loja";
                  const canPurchase = isStoreFrame && !access.unlocked && coinBalance >= (frame.priceCoins ?? 0);

                  return (
                    <button
                      key={frame.id}
                      className={`relative flex min-h-[230px] flex-col items-center justify-start rounded-xl border p-4 text-center transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : access.unlocked
                            ? "border-border bg-background/40 hover:bg-accent"
                            : "border-border bg-muted/30 opacity-70"
                      }`}
                      type="button"
                      disabled={!access.unlocked && !canPurchase}
                      title={access.unlocked ? frame.description : access.reason}
                      onClick={() => {
                        if (access.unlocked) {
                          onSelect(frame.id);
                          return;
                        }

                        if (canPurchase) {
                          onPurchase(frame.id);
                          onSelect(frame.id);
                        }
                      }}
                    >
                      <ProfileFramePreview frame={frame} className="h-28 w-28 md:h-32 md:w-32" />
                      {isSelected && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      )}
                      {!access.unlocked && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                          <Lock className="h-4 w-4" />
                        </span>
                      )}
                      <p className="mt-3 text-sm font-semibold leading-tight text-foreground">{frame.label}</p>
                      <p className="mt-1 text-xs leading-snug text-muted-foreground">
                        {access.unlocked ? frame.unlock : access.reason}
                      </p>
                      {isStoreFrame && (
                        <span className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          access.unlocked
                            ? "bg-green-500/10 text-green-600"
                            : canPurchase
                              ? "bg-amber-500 text-white"
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {access.unlocked ? (
                            "Comprada"
                          ) : (
                            <>
                              <Coins className="h-3.5 w-3.5" />
                              {(frame.priceCoins ?? 0).toLocaleString("pt-BR")}
                            </>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-5 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-muted-foreground">
        As molduras da Loja usam moedas internas de progresso. Por enquanto não há compra com dinheiro real.
      </p>
    </div>
  );
}

function AvatarPositionControls({
  x,
  y,
  onXChange,
  onYChange,
  onReset,
}: {
  x: number;
  y: number;
  onXChange: (value: number) => void;
  onYChange: (value: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-3 text-left">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">PosiÃ§Ã£o da foto</p>
        <button className="text-xs font-medium text-primary hover:underline" type="button" onClick={onReset}>
          Centralizar
        </button>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Horizontal</span>
        <input
          className="w-full accent-primary"
          type="range"
          min={-18}
          max={18}
          step={1}
          value={x}
          onChange={(event) => onXChange(Number(event.target.value))}
        />
      </label>
      <label className="mt-3 block space-y-1">
        <span className="text-xs text-muted-foreground">Vertical</span>
        <input
          className="w-full accent-primary"
          type="range"
          min={-18}
          max={18}
          step={1}
          value={y}
          onChange={(event) => onYChange(Number(event.target.value))}
        />
      </label>
    </div>
  );
}

const AVATAR_POSITION_LIMIT = 50;

function clampAvatarPosition(value: number) {
  return Math.max(-AVATAR_POSITION_LIMIT, Math.min(AVATAR_POSITION_LIMIT, Math.round(value)));
}

function DraggableAvatarPosition({
  name,
  avatarUrl,
  avatarPositionX,
  avatarPositionY,
  frameId,
  onPositionChange,
  onReset,
}: {
  name: string;
  avatarUrl?: string | null;
  avatarPositionX: number;
  avatarPositionY: number;
  frameId: ProfileFrameId;
  onPositionChange: (x: number, y: number) => void;
  onReset: () => void;
}) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!avatarUrl) return;
    const rect = previewRef.current?.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: avatarPositionX,
      startY: avatarPositionY,
      width: rect?.width || 112,
      height: rect?.height || 112,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const nextX = drag.startX + ((event.clientX - drag.startClientX) / drag.width) * 80;
    const nextY = drag.startY + ((event.clientY - drag.startClientY) / drag.height) * 80;
    onPositionChange(clampAvatarPosition(nextX), clampAvatarPosition(nextY));
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId) {
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={previewRef}
        className={`touch-none select-none ${avatarUrl ? "cursor-grab active:cursor-grabbing" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <ProfileAvatar
          name={name}
          avatarUrl={avatarUrl}
          avatarPositionX={avatarPositionX}
          avatarPositionY={avatarPositionY}
          frameId={frameId}
          size="lg"
        />
      </div>
      {avatarUrl && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Arraste a foto para enquadrar.</p>
          <button className="mt-1 text-xs font-medium text-primary hover:underline" type="button" onClick={onReset}>
            Centralizar
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileAvatar({
  name,
  avatarUrl,
  avatarPositionX = 0,
  avatarPositionY = 0,
  frameId,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  avatarPositionX?: number;
  avatarPositionY?: number;
  frameId?: ProfileFrameId;
  size?: "sm" | "md" | "lg";
}) {
  const frame = getProfileFrame(frameId);
  const hasFrameAsset = Boolean(frame.assetSrc);
  const sizeClass = hasFrameAsset
    ? size === "lg"
      ? "h-28 w-28 text-2xl"
      : size === "sm"
        ? "h-11 w-11 text-xs"
        : "h-14 w-14 text-sm"
    : size === "lg"
      ? "h-24 w-24 text-2xl"
      : size === "sm"
        ? "h-10 w-10 text-sm"
        : "h-12 w-12 text-lg";
  const innerInsetClass = size === "lg" ? "inset-1.5" : "inset-1";
  const avatarConfig = frame.avatar ?? { size: 56, offsetX: 0, offsetY: 0 };
  const assetConfig = frame.asset ?? { scale: 1, offsetX: 0, offsetY: 0 };
  const assetAvatarStyle = hasFrameAsset
    ? {
      height: `${avatarConfig.size}%`,
      left: `${50 - (avatarConfig.size / 2) + avatarConfig.offsetX}%`,
      top: `${50 - (avatarConfig.size / 2) + avatarConfig.offsetY}%`,
      width: `${avatarConfig.size}%`,
    }
    : undefined;

  return (
    <div className={`${sizeClass} ${hasFrameAsset ? "text-white" : `${frame.frameClass} rounded-full p-1 text-white shadow-sm`} relative shrink-0`}>
      <div
        className={`absolute ${hasFrameAsset ? "" : innerInsetClass} overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-500`}
        style={assetAvatarStyle}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`Foto de ${name}`}
            className="absolute -inset-[40%] h-[180%] w-[180%] max-w-none object-cover"
            style={{ transform: `translate(${avatarPositionX}%, ${avatarPositionY}%)` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-semibold text-white">
            {getInitials(name)}
          </div>
        )}
      </div>
      {hasFrameAsset && (
        <img
          src={frame.assetSrc}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-sm"
          style={{
            transform: `translate(${assetConfig.offsetX}%, ${assetConfig.offsetY}%) scale(${assetConfig.scale})`,
          }}
        />
      )}
    </div>
  );
}

async function readProfileAvatarFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Escolha um arquivo de imagem.");
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Nao foi possivel carregar a imagem."));
      nextImage.src = imageUrl;
    });

    const maxSize = 640;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Nao foi possivel preparar a imagem.");

    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL("image/webp", 0.86);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileId, setProfileId] = useState(DEFAULT_PROFILE.id);
  const [userNumber, setUserNumber] = useState(DEFAULT_PROFILE.userNumber ?? null);
  const [userName, setUserName] = useState(DEFAULT_PROFILE.name);
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_PROFILE.avatarUrl);
  const [avatarPositionX, setAvatarPositionX] = useState(DEFAULT_PROFILE.avatarPositionX ?? 0);
  const [avatarPositionY, setAvatarPositionY] = useState(DEFAULT_PROFILE.avatarPositionY ?? 0);
  const [profileFrameId, setProfileFrameId] = useState<ProfileFrameId>(DEFAULT_PROFILE.frameId ?? "learnflow");
  const [purchasedStoreFrameIds, setPurchasedStoreFrameIds] = useState<ProfileFrameId[]>([]);
  const [streakDays, setStreakDays] = useState(DEFAULT_PROFILE.streakDays);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [profileDraftName, setProfileDraftName] = useState(userName);
  const [profileDraftAvatarUrl, setProfileDraftAvatarUrl] = useState<string | null>(DEFAULT_PROFILE.avatarUrl ?? null);
  const [profileDraftAvatarPositionX, setProfileDraftAvatarPositionX] = useState(DEFAULT_PROFILE.avatarPositionX ?? 0);
  const [profileDraftAvatarPositionY, setProfileDraftAvatarPositionY] = useState(DEFAULT_PROFILE.avatarPositionY ?? 0);
  const [profileDraftFrameId, setProfileDraftFrameId] = useState<ProfileFrameId>(DEFAULT_PROFILE.frameId ?? "learnflow");
  const [profileError, setProfileError] = useState("");
  const [studyProgress, setStudyProgress] = useState<StudyProgress>({});
  const [lastStudy, setLastStudy] = useState<LastStudyData>(null);
  const [activitySummary, setActivitySummary] = useState<LearningActivitySummary>(EMPTY_LEARNING_ACTIVITY_SUMMARY);
  const [simuladoAttempts, setSimuladoAttempts] = useState<SimuladoAttemptData[]>([]);
  const [dueFlashcardCount, setDueFlashcardCount] = useState(0);
  const [studyGoals, setStudyGoals] = useState<StudyGoals>(DEFAULT_STUDY_GOALS);
  const [courseModules, setCourseModules] = useState<SubjectModuleMap>({});
  const [courseContentLoading, setCourseContentLoading] = useState(true);
  const [courseContentError, setCourseContentError] = useState("");
  const [studyFocusMode, setStudyFocusMode] = useState(false);
  const [materiasTarget, setMateriasTarget] = useState<StudyTarget | null>(null);
  const [examReviewAlerts, setExamReviewAlerts] = useState<UpcomingExamAlert[]>([]);
  const [isExamReviewAlertOpen, setIsExamReviewAlertOpen] = useState(false);
  const [deviceNotificationStatus, setDeviceNotificationStatus] = useState("");
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(() =>
    typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches,
  );
  const [isPwaUpdateAvailable, setIsPwaUpdateAvailable] = useState(false);
  const [isPwaUpdating, setIsPwaUpdating] = useState(false);

  const applyProfile = (profile: typeof DEFAULT_PROFILE) => {
      setProfileId(profile.id);
      setUserNumber(profile.userNumber ?? null);
      setUserName(profile.name);
      setAvatarUrl(profile.avatarUrl ?? null);
      setAvatarPositionX(profile.avatarPositionX ?? 0);
      setAvatarPositionY(profile.avatarPositionY ?? 0);
      setProfileFrameId(profile.frameId ?? "learnflow");
      setStreakDays(profile.streakDays);
      setProfileDraftName(profile.name);
      setProfileDraftAvatarUrl(profile.avatarUrl ?? null);
      setProfileDraftAvatarPositionX(profile.avatarPositionX ?? 0);
      setProfileDraftAvatarPositionY(profile.avatarPositionY ?? 0);
      setProfileDraftFrameId(profile.frameId ?? "learnflow");
  };

  const reloadProfile = async () => {
    const profile = await loadProfile();
    applyProfile(profile);
  };

  useEffect(() => {
    setPurchasedStoreFrameIds(loadPurchasedStoreFrames(profileId));
  }, [profileId]);

  const reloadCourseContent = async () => {
    setCourseContentLoading(true);
    setCourseContentError("");
    try {
      const modules = await loadCourseContent();
      setCourseModules(modules);
    } catch (error) {
      console.warn("Nao foi possivel carregar o conteudo curricular no Supabase.", error);
      setCourseModules({});
      setCourseContentError("Não foi possível carregar o conteúdo. Tente novamente.");
    } finally {
      setCourseContentLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    reloadCourseContent();

    getCurrentAuthUser()
      .then(async (user) => {
        if (!isMounted) return;
        setAuthUser(user);
        await reloadProfile();
        await reloadStudyProgress();
        await reloadActivitySummary();
        await reloadSimuladoAttempts();
        await reloadDueFlashcards();
        await reloadStudyGoals();
      })
      .finally(() => {
        if (isMounted) setAuthReady(true);
      });

    const unsubscribe = onAuthUserChange((user) => {
      if (!isMounted) return;
      setAuthUser(user);
      reloadProfile();
      reloadStudyProgress();
      reloadActivitySummary();
      reloadSimuladoAttempts();
      reloadDueFlashcards();
      reloadStudyGoals();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const handleUpdateReady = () => {
      setIsPwaUpdateAvailable(true);
    };

    window.addEventListener("learnflow:pwa-update-ready", handleUpdateReady);

    return () => {
      window.removeEventListener("learnflow:pwa-update-ready", handleUpdateReady);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadExamReviewAlerts = async () => {
      if (!authUser) {
        setExamReviewAlerts([]);
        setIsExamReviewAlertOpen(false);
        return;
      }

      const tomorrow = addDays(new Date(), 1);
      const tomorrowKey = dateToKey(tomorrow);
      const years = Array.from(new Set([new Date().getFullYear(), tomorrow.getFullYear()]));

      try {
        const [remindersByYear, occurrencesByYear] = await Promise.all([
          Promise.all(years.map((year) => loadCalendarReminders(year))),
          Promise.all(years.map((year) => loadCalendarRuleOccurrences(year))),
        ]);

        if (!isMounted) return;

        const alerts = buildCalendarReviewAlerts(
          remindersByYear.flat(),
          occurrencesByYear.flat(),
          tomorrowKey,
        );
        setExamReviewAlerts(alerts);

        const dismissKey = getExamReviewDismissKey(authUser.id, tomorrowKey);
        const wasDismissed = window.localStorage.getItem(dismissKey) === "true";
        setIsExamReviewAlertOpen(alerts.length > 0 && !wasDismissed);
        notifyDeviceCalendarAlerts(authUser.id, alerts);
      } catch (error) {
        console.warn("Nao foi possivel carregar avisos de revisao:", error);
      }
    };

    loadExamReviewAlerts();

    const refreshAlerts = () => {
      loadExamReviewAlerts();
    };
    const refreshAlertsOnVisible = () => {
      if (document.visibilityState === "visible") loadExamReviewAlerts();
    };
    const refreshInterval = window.setInterval(loadExamReviewAlerts, 60_000);

    window.addEventListener("focus", refreshAlerts);
    window.addEventListener("learnflow:calendar-updated", refreshAlerts);
    document.addEventListener("visibilitychange", refreshAlertsOnVisible);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshAlerts);
      window.removeEventListener("learnflow:calendar-updated", refreshAlerts);
      document.removeEventListener("visibilitychange", refreshAlertsOnVisible);
    };
  }, [authUser?.id]);

  const changeUserName = () => {
    setProfileDraftName(userName);
    setProfileDraftAvatarUrl(avatarUrl ?? null);
    setProfileDraftAvatarPositionX(avatarPositionX);
    setProfileDraftAvatarPositionY(avatarPositionY);
    setProfileDraftFrameId(profileFrameId);
    setProfileError("");
    setIsProfileEditorOpen(true);
  };

  const saveProfileName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = profileDraftName.trim();
    if (!nextName) return;
    setProfileError("");
    try {
      const selectedFrame = getProfileFrame(profileDraftFrameId);
      const selectedFrameAccess = getProfileFrameAccess(selectedFrame, profileUnlockStats, purchasedStoreFrameSet);
      if (!selectedFrameAccess.unlocked) {
        setProfileError(`Moldura bloqueada: ${selectedFrameAccess.reason}`);
        return;
      }

      await saveProfile({
        id: profileId,
        name: nextName,
        streakDays,
        avatarUrl: profileDraftAvatarUrl,
        avatarPositionX: profileDraftAvatarPositionX,
        avatarPositionY: profileDraftAvatarPositionY,
        frameId: profileDraftFrameId,
      });
      setUserName(nextName);
      setAvatarUrl(profileDraftAvatarUrl);
      setAvatarPositionX(profileDraftAvatarPositionX);
      setAvatarPositionY(profileDraftAvatarPositionY);
      setProfileFrameId(profileDraftFrameId);
      setIsProfileEditorOpen(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Nao foi possivel salvar o perfil.");
    }
  };

  const handleProfileAvatarUpload = async (file: File | undefined) => {
    if (!file) return;
    setProfileError("");
    try {
      const nextAvatarUrl = await readProfileAvatarFile(file);
      setProfileDraftAvatarUrl(nextAvatarUrl);
      setProfileDraftAvatarPositionX(0);
      setProfileDraftAvatarPositionY(0);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Nao foi possivel carregar a foto.");
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const navigate = (view: View) => {
    setCurrentView(view);
    if (view !== "materias") setStudyFocusMode(false);
    setSidebarOpen(false);
  };

  const dismissExamReviewAlert = () => {
    const alertDate = examReviewAlerts[0]?.date;
    if (authUser && alertDate) {
      window.localStorage.setItem(getExamReviewDismissKey(authUser.id, alertDate), "true");
    }
    setIsExamReviewAlertOpen(false);
  };

  const openExamReviewTarget = (view: "calendar" | "simulados") => {
    dismissExamReviewAlert();
    navigate(view);
  };

  const enablePopupDeviceNotifications = async () => {
    setDeviceNotificationStatus("");
    try {
      const permission = await enableDevicePushNotifications();
      setDeviceNotificationStatus(
        permission === "granted"
          ? "Notificações ativadas neste dispositivo."
          : "Permissão não concedida. Abra as permissões do site no navegador e libere notificações.",
      );
    } catch (error) {
      setDeviceNotificationStatus(error instanceof Error ? error.message : "Não foi possível ativar notificações.");
    }
  };

  const openMaterias = (target?: StudyTarget) => {
    setMateriasTarget(target ?? null);
    navigate("materias");
  };

  const installPwa = async () => {
    if (!installPromptEvent) return "manual" as const;

    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    setInstallPromptEvent(null);

    if (choice.outcome === "accepted") {
      setIsPwaInstalled(true);
      return "installed" as const;
    }

    return "dismissed" as const;
  };

  const updatePwa = async () => {
    if (!("serviceWorker" in navigator)) {
      window.location.reload();
      return;
    }

    setIsPwaUpdating(true);
    const registration = await navigator.serviceWorker.getRegistration();
    const waitingWorker = registration?.waiting || registration?.installing;

    if (waitingWorker) {
      let didReload = false;
      const reloadOnce = () => {
        if (didReload) return;
        didReload = true;
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener("controllerchange", reloadOnce, { once: true });
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      window.setTimeout(reloadOnce, 1200);
      return;
    }

    await registration?.update();
    window.location.reload();
  };

  const reloadStudyProgress = async () => {
    const snapshot = await loadStudyProgress();
    setStudyProgress(snapshot.progress);
    setLastStudy(snapshot.lastStudy);
  };

  const reloadActivitySummary = async () => {
    setActivitySummary(await loadLearningActivitySummary());
  };

  const reloadSimuladoAttempts = async () => {
    setSimuladoAttempts(await loadSimuladoAttempts(50));
  };

  const reloadDueFlashcards = async () => {
    const dueCards = await loadDueFlashcards(50);
    setDueFlashcardCount(dueCards.length);
  };

  const reloadStudyGoals = async () => {
    setStudyGoals(await loadStudyGoals());
  };

  const markStudyActivityAnswered = (subjectName: string, moduleTitle: string, activityKey: string) => {
    if (!authUser) {
      return;
    }

    setStudyProgress((current) => {
      const subjectProgress = current[subjectName] ?? {};
      const answeredActivities = subjectProgress[moduleTitle] ?? [];
      if (answeredActivities.includes(activityKey)) return current;

      return {
        ...current,
        [subjectName]: {
          ...subjectProgress,
          [moduleTitle]: [...answeredActivities, activityKey],
        },
      };
    });
    setLastStudy({ subjectName, moduleTitle });
    saveStudyActivityProgress(subjectName, moduleTitle, activityKey)
      .then((result) => {
        if (result) setStreakDays(result.streakDays);
        reloadActivitySummary();
      })
      .catch((error) => {
        console.warn("Nao foi possivel salvar progresso de estudos:", error);
      });
  };

  const markUserActivity = (activityType: UserActivityType, details?: UserActivityDetails) => {
    recordUserActivity(activityType, details)
      .then((result) => {
        if (result) setStreakDays(result.streakDays);
        reloadActivitySummary();
        if (activityType === "simulado") reloadSimuladoAttempts();
      })
      .catch((error) => {
        console.warn("Nao foi possivel registrar atividade do usuario:", error);
      });
  };

  const viewTitle = VIEW_TITLES[currentView];
  const title = currentView === "home" ? `Olá, ${userName}! 👋` : viewTitle.title;
  const subtitle = viewTitle.subtitle;

  const placeholderViews: View[] = ["avaliacoes", "desempenho"];
  const compactSidebar = currentView === "materias" && studyFocusMode;
  const profileUnlockStats = getProfileUnlockStats({
    studyProgress,
    courseModules,
    streakDays,
    activitySummary,
    simuladoAttempts,
    userNumber,
  });
  const purchasedStoreFrameSet = new Set(purchasedStoreFrameIds);
  const isFounderProfile = profileUnlockStats.userNumber === 1;
  const coinsEarned = isFounderProfile ? 10_000 : getLearnFlowCoinsEarned(profileUnlockStats);
  const coinBalance = isFounderProfile ? 10_000 : Math.max(0, coinsEarned - getPurchasedFrameCost(purchasedStoreFrameSet));
  const purchaseStoreFrame = (frameId: ProfileFrameId) => {
    const frame = getProfileFrame(frameId);
    if (frame.category !== "loja" || purchasedStoreFrameSet.has(frameId)) return;
    const price = frame.priceCoins ?? 0;
    if (coinBalance < price) {
      setProfileError(`Moedas insuficientes para comprar ${frame.label}.`);
      return;
    }

    const nextFrameIds = [...purchasedStoreFrameSet, frameId];
    setPurchasedStoreFrameIds(nextFrameIds);
    savePurchasedStoreFrames(profileId, nextFrameIds);
    setProfileError(`${frame.label} comprada. Agora voce pode selecionar essa moldura.`);
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? "dark" : ""}`}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, slide-in as drawer */}
      <aside
        translate="no"
        className={`
          notranslate fixed md:static inset-y-0 left-0 z-40
          w-[min(86vw,20rem)] ${compactSidebar ? "md:w-20 xl:w-20" : "md:w-72 xl:w-80"} bg-sidebar border-r border-sidebar-border flex flex-col
          transform transition-[width,transform] duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className={`flex items-center justify-between transition-[padding] duration-300 ease-out ${compactSidebar ? "p-4 md:px-3 md:py-5" : "p-6 pb-4 md:p-7 md:pb-5"}`}>
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-out ${compactSidebar ? "md:w-full md:justify-center" : ""}`}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className={`whitespace-nowrap font-semibold text-lg md:text-xl text-foreground transition-all duration-300 ease-out ${compactSidebar ? "md:max-w-0 md:opacity-0 md:-translate-x-1" : "md:max-w-40 md:opacity-100 md:translate-x-0"}`}>LearnFlow</span>
          </div>
          <button
            className="md:hidden p-1 rounded-lg hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav translate="no" className={`notranslate flex-1 space-y-1.5 overflow-y-auto transition-[padding] duration-300 ease-out ${compactSidebar ? "px-4 md:px-2.5" : "px-4 md:px-4"}`}>
          {NAV_ITEMS.map(({ view, icon, label }) => (
            <NavItem
              key={view}
              icon={icon}
              label={label}
              active={currentView === view}
              compact={compactSidebar}
              onClick={() => navigate(view)}
            />
          ))}
        </nav>

        {/* Streak Card */}
        <div className={`mx-3 md:mx-4 mb-4 overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white transition-all duration-300 ease-out ${compactSidebar ? "p-4 md:mx-auto md:flex md:h-12 md:w-12 md:items-center md:justify-center md:p-0" : "p-4 md:p-5"}`}>
          <div className={`flex items-center gap-2 mb-1 ${compactSidebar ? "md:mb-0 md:justify-center md:gap-0" : ""}`}>
            <Flame className={`w-5 h-5 md:w-6 md:h-6 shrink-0 transition-all duration-300 ease-out ${compactSidebar ? "md:hidden" : "md:w-6 md:scale-100 md:opacity-100"}`} />
            <span className={`whitespace-nowrap text-2xl md:text-3xl font-bold leading-none transition-all duration-300 ease-out ${compactSidebar ? "md:hidden" : ""}`}>
              {streakDays} dias
            </span>
            <span className={`hidden text-base font-bold leading-none transition-opacity duration-300 ease-out ${compactSidebar ? "md:block md:opacity-100" : "md:opacity-0"}`}>
              {streakDays}
            </span>
          </div>
          <p className={`overflow-hidden text-sm md:text-base text-orange-100 transition-all duration-300 ease-out ${compactSidebar ? "md:hidden" : "md:max-h-10 md:opacity-100"}`}>
            {streakDays > 0 ? "Mantenha o ritmo!" : "Comece sua sequência hoje."}
          </p>
        </div>

        {/* User Profile */}
        <div className={`border-t border-sidebar-border transition-[padding] duration-300 ease-out ${compactSidebar ? "p-3 md:p-2.5" : "p-3"}`}>
          <button
            className={`w-full flex items-center gap-3 md:gap-4 overflow-hidden rounded-lg hover:bg-sidebar-accent transition-all duration-300 ease-out ${compactSidebar ? "p-2 md:h-12 md:justify-center md:gap-0 md:p-0" : "p-2 md:p-3"}`}
            onClick={changeUserName}
            type="button"
          >
            <div className={`transition-all duration-300 ease-out ${compactSidebar ? "md:scale-90" : ""}`}>
              <ProfileAvatar
                name={userName}
                avatarUrl={avatarUrl}
                avatarPositionX={avatarPositionX}
                avatarPositionY={avatarPositionY}
                frameId={profileFrameId}
                size="md"
              />
            </div>
            <div className={`flex-1 text-left min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${compactSidebar ? "md:hidden" : "md:max-w-48 md:opacity-100 md:translate-x-0"}`}>
              <div className="text-sm md:text-base font-medium text-sidebar-foreground truncate">{userName}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Editar perfil</div>
            </div>
            <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-sidebar-foreground flex-shrink-0 transition-all duration-300 ease-out ${compactSidebar ? "md:hidden" : "md:w-5 md:opacity-100"}`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 md:h-20 border-b border-border bg-card px-4 md:px-10 xl:px-12 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger - mobile only */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl xl:text-3xl font-semibold text-foreground truncate">{title}</h1>
              <p className="text-xs md:text-sm xl:text-base text-muted-foreground hidden sm:block">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
            <button
              className="relative p-2 hover:bg-accent rounded-lg transition-colors"
              onClick={() => {
                if (examReviewAlerts.length > 0) setIsExamReviewAlertOpen(true);
              }}
              type="button"
              aria-label="Avisos"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {examReviewAlerts.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-card" />
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-background pb-16 md:pb-0 text-[15px] lg:text-base">
          {currentView === "home" && (
            <DashboardHomeView
              streakDays={streakDays}
              studyProgress={studyProgress}
              activitySummary={activitySummary}
              dueFlashcardCount={dueFlashcardCount}
              studyGoals={studyGoals}
              lastStudy={lastStudy}
              courseModules={courseModules}
              courseContentLoading={courseContentLoading}
              courseContentError={courseContentError}
              canInstallPwa={Boolean(installPromptEvent)}
              isPwaInstalled={isPwaInstalled}
              onInstallPwa={installPwa}
              onRetryCourseContent={reloadCourseContent}
              onOpenMaterias={openMaterias}
              onOpenFlashcards={() => navigate("flashcards")}
            />
          )}
          {currentView === "calendar" && (
            authUser ? (
              <CalendarView onUserActivity={markUserActivity} />
            ) : (
              <AccountRequiredView
                title="Calendário da sua conta"
                description="Entre para criar lembretes, recorrências e folgas sem misturar seus dados com outro dispositivo."
                authUser={authUser}
                authReady={authReady}
                onAuthChanged={reloadProfile}
              />
            )
          )}
          {currentView === "flashcards" && (
            authUser ? (
              <FlashcardsView profileId={profileId} onUserActivity={markUserActivity} />
            ) : (
              <AccountRequiredView
                title="Flashcards salvos por usuário"
                description="Entre para criar decks, revisar cards e manter seu histórico sincronizado na sua conta."
                authUser={authUser}
                authReady={authReady}
                onAuthChanged={reloadProfile}
              />
            )
          )}
          {currentView === "simulados" && <SimuladosView onUserActivity={markUserActivity} />}
          {currentView === "materias" && (
            <MateriasView
              studyProgress={studyProgress}
              courseModules={courseModules}
              courseContentLoading={courseContentLoading}
              courseContentError={courseContentError}
              onRetryCourseContent={reloadCourseContent}
              initialTarget={materiasTarget}
              authUser={authUser}
              onFocusModeChange={setStudyFocusMode}
              onActivityAnswered={markStudyActivityAnswered}
            />
          )}
          {currentView === "configuracoes" && (
            <ConfiguracoesView
              userName={userName}
              userNumber={userNumber}
              avatarUrl={avatarUrl}
              avatarPositionX={avatarPositionX}
              avatarPositionY={avatarPositionY}
              frameId={profileFrameId}
              authUser={authUser}
              authReady={authReady}
              onProfileSave={async ({
                name,
                avatarUrl: nextAvatarUrl,
                avatarPositionX: nextAvatarPositionX,
                avatarPositionY: nextAvatarPositionY,
                frameId: nextFrameId,
              }) => {
                await saveProfile({
                  id: profileId,
                  name,
                  streakDays,
                  avatarUrl: nextAvatarUrl,
                  avatarPositionX: nextAvatarPositionX,
                  avatarPositionY: nextAvatarPositionY,
                  frameId: nextFrameId,
                });
                setUserName(name);
                setAvatarUrl(nextAvatarUrl);
                setAvatarPositionX(nextAvatarPositionX);
                setAvatarPositionY(nextAvatarPositionY);
                setProfileFrameId(nextFrameId);
              }}
              onAuthChanged={reloadProfile}
              canInstallPwa={Boolean(installPromptEvent)}
              isPwaInstalled={isPwaInstalled}
              onInstallPwa={installPwa}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              streakDays={streakDays}
              studyGoals={studyGoals}
              studyProgress={studyProgress}
              courseModules={courseModules}
              activitySummary={activitySummary}
              unlockStats={profileUnlockStats}
              purchasedFrameIds={purchasedStoreFrameSet}
              coinBalance={coinBalance}
              coinsEarned={coinsEarned}
              onFramePurchase={purchaseStoreFrame}
              onStudyGoalsSave={async (goals) => {
                const savedGoals = await saveStudyGoals(goals);
                setStudyGoals(savedGoals);
              }}
            />
          )}
          {placeholderViews.includes(currentView) && <PlaceholderView />}
        </div>
      </main>

      {isExamReviewAlertOpen && examReviewAlerts.length > 0 && (
        <ExamReviewAlertPopup
          alerts={examReviewAlerts}
          deviceNotificationStatus={deviceNotificationStatus}
          onClose={dismissExamReviewAlert}
          onEnableDeviceNotifications={enablePopupDeviceNotifications}
          onOpenCalendar={() => openExamReviewTarget("calendar")}
          onOpenSimulados={() => openExamReviewTarget("simulados")}
        />
      )}

      {/* Bottom Nav — mobile only */}
      {isPwaUpdateAvailable && (
        <PwaUpdateBanner
          isUpdating={isPwaUpdating}
          onDismiss={() => setIsPwaUpdateAvailable(false)}
          onUpdate={updatePwa}
        />
      )}

      <nav translate="no" className="notranslate fixed bottom-0 inset-x-0 z-20 md:hidden bg-card border-t border-border flex">
        {BOTTOM_NAV.map(({ view, icon, label }) => (
          <button
            key={view}
            translate="no"
            onClick={() => navigate(view)}
            className={`notranslate flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              currentView === view ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className={`transition-transform ${currentView === view ? "scale-110" : ""}`}>
              {icon}
            </span>
            <span translate="no" className="text-[10px] font-medium">{label}</span>
            {currentView === view && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
        {/* More button */}
        <button
          translate="no"
          onClick={() => setSidebarOpen(true)}
          className="notranslate flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-muted-foreground"
        >
          <Menu className="w-5 h-5" />
          <span translate="no" className="text-[10px] font-medium">Mais</span>
        </button>
      </nav>

      {isProfileEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={saveProfileName}
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-lg md:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Editar perfil</h2>
                <p className="text-sm text-muted-foreground">Atualize nome, foto e moldura exibidos no LearnFlow.</p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setIsProfileEditorOpen(false)}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
              <div className="shrink-0">
                <DraggableAvatarPosition
                  name={profileDraftName || userName}
                  avatarUrl={profileDraftAvatarUrl}
                  avatarPositionX={profileDraftAvatarPositionX}
                  avatarPositionY={profileDraftAvatarPositionY}
                  frameId={profileDraftFrameId}
                  onPositionChange={(x, y) => {
                    setProfileDraftAvatarPositionX(x);
                    setProfileDraftAvatarPositionY(y);
                  }}
                  onReset={() => {
                    setProfileDraftAvatarPositionX(0);
                    setProfileDraftAvatarPositionY(0);
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{profileDraftName || userName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{getProfileFrame(profileDraftFrameId).label}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                    <Camera className="h-4 w-4" />
                    Escolher foto
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        handleProfileAvatarUpload(event.target.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {profileDraftAvatarUrl && (
                    <button
                      className="rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-accent"
                      type="button"
                      onClick={() => {
                        setProfileDraftAvatarUrl(null);
                        setProfileDraftAvatarPositionX(0);
                        setProfileDraftAvatarPositionY(0);
                      }}
                    >
                      Remover foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Nome do usuário</span>
              <input
                autoFocus
                value={profileDraftName}
                onChange={(event) => setProfileDraftName(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                placeholder="Digite seu nome"
              />
            </label>

            <div className="mt-4 space-y-2">
              <span className="text-sm font-medium text-foreground">Moldura</span>
              <ProfileFrameSelector
                selectedFrameId={profileDraftFrameId}
                onSelect={setProfileDraftFrameId}
                name={profileDraftName || userName}
                avatarUrl={profileDraftAvatarUrl}
                unlockStats={profileUnlockStats}
                purchasedFrameIds={purchasedStoreFrameSet}
              />
              <p className="text-xs text-muted-foreground">
                Molduras bloqueadas aparecem com cadeado e liberam conforme seu progresso.
              </p>
            </div>

            {profileError && (
              <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {profileError}
              </p>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="w-full rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent sm:w-auto"
                onClick={() => setIsProfileEditorOpen(false)}
              >
                Cancelar
              </button>
              <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 sm:w-auto">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ExamReviewAlertPopup({
  alerts,
  deviceNotificationStatus,
  onClose,
  onEnableDeviceNotifications,
  onOpenCalendar,
  onOpenSimulados,
}: {
  alerts: UpcomingExamAlert[];
  deviceNotificationStatus: string;
  onClose: () => void;
  onEnableDeviceNotifications: () => void;
  onOpenCalendar: () => void;
  onOpenSimulados: () => void;
}) {
  const [firstAlert] = alerts;
  const extraCount = Math.max(0, alerts.length - 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">Aviso amanhã</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">{getCalendarDisplayTitle(firstAlert.title)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Marcado para {formatLongDate(firstAlert.date)}. Confira hoje para não perder esse compromisso.
            </p>
          </div>
        </div>

        {extraCount > 0 && (
          <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Mais {extraCount} compromisso{extraCount > 1 ? "s" : ""} também estão marcados para amanhã.
          </p>
        )}

        <button
          className="mt-5 w-full rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700"
          onClick={onEnableDeviceNotifications}
          type="button"
        >
          Ativar notificações no dispositivo
        </button>
        {deviceNotificationStatus && (
          <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {deviceNotificationStatus}
          </p>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            onClick={onOpenCalendar}
            type="button"
          >
            Ver calendário
          </button>
          <button
            className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
            onClick={onOpenSimulados}
            type="button"
          >
            Abrir simulados
          </button>
        </div>

        <button
          className="mt-3 w-full rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={onClose}
          type="button"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}

function PwaUpdateBanner({
  isUpdating,
  onDismiss,
  onUpdate,
}: {
  isUpdating: boolean;
  onDismiss: () => void;
  onUpdate: () => void;
}) {
  return (
    <div className="fixed inset-x-3 bottom-20 z-40 md:bottom-6 md:left-auto md:right-6 md:w-[26rem]">
      <div className="rounded-xl border border-primary/20 bg-card p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <RefreshCw className={`h-5 w-5 ${isUpdating ? "animate-spin" : ""}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground">Nova versao disponivel</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize para usar as correcoes mais recentes sem reinstalar o app.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
            disabled={isUpdating}
            onClick={onUpdate}
            type="button"
          >
            {isUpdating ? "Atualizando..." : "Atualizar agora"}
          </button>
          <button
            className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent disabled:opacity-60"
            disabled={isUpdating}
            onClick={onDismiss}
            type="button"
          >
            Depois
          </button>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  compact = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      translate="no"
      title={compact ? label : undefined}
      onClick={onClick}
      className={`notranslate relative w-full flex items-center gap-3 md:gap-4 overflow-visible md:overflow-hidden rounded-lg transition-all duration-300 ease-out [&>svg]:h-5 [&>svg]:w-5 md:[&>svg]:h-6 md:[&>svg]:w-6 [&>svg]:shrink-0 ${compact ? "px-4 py-2.5 md:h-12 md:justify-center md:gap-0 md:px-0 md:py-0" : "px-4 md:px-4 py-2.5 md:py-3.5"} ${
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      {icon}
      <span translate="no" className={`min-w-0 overflow-hidden whitespace-nowrap text-sm md:text-base font-medium transition-all duration-300 ease-out ${compact ? "md:max-w-0 md:opacity-0 md:-translate-x-1" : "md:max-w-52 md:opacity-100 md:translate-x-0"}`}>{label}</span>
    </button>
  );
}

type PageContainerSize = "default" | "wide" | "fluid" | "narrow";

const PAGE_CONTAINER_WIDTH: Record<PageContainerSize, string> = {
  narrow: "max-w-[980px]",
  default: "max-w-[1500px]",
  wide: "max-w-[1800px]",
  fluid: "max-w-[1920px]",
};

function PageContainer({
  children,
  size = "default",
  className = "",
  contentClassName = "space-y-5 md:space-y-8",
}: {
  children: React.ReactNode;
  size?: PageContainerSize;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={`p-4 md:p-8 xl:p-10 2xl:p-12 ${className}`}>
      <div className={`mx-auto w-full ${PAGE_CONTAINER_WIDTH[size]} ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}

const SUBJECTS = [
  {
    name: "Português",
    subtitle: "Leitura, gramática, redação e literatura",
    topics: ["1ª Série: Base textual", "2ª Série: Argumentação", "3ª Série: ENEM e literatura"],
    progress: 0,
    color: "bg-rose-100 dark:bg-rose-950",
    iconColor: "text-rose-600 dark:text-rose-400",
    icon: "📖",
    done: 0,
  },
  {
    name: "Matemática",
    subtitle: "Álgebra, funções, geometria e dados",
    topics: ["1º Ano: Funções e álgebra", "2º Ano: Trigonometria e espaço", "3º Ano: Revisão ENEM"],
    progress: 0,
    color: "bg-indigo-100 dark:bg-indigo-950",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    icon: "📐",
    done: 0,
  },
  {
    name: "Química",
    subtitle: "Orgânica e Inorgânica",
    topics: ["Ligações Químicas", "Estequiometria", "Termoquímica", "Eletroquímica"],
    progress: 0,
    color: "bg-purple-100 dark:bg-purple-950",
    iconColor: "text-purple-600 dark:text-purple-400",
    icon: "⚗️",
    done: 0,
  },
  {
    name: "Física",
    subtitle: "Mecânica, Eletricidade e Óptica",
    topics: ["Leis de Newton", "Energia Mecânica", "Eletrostática", "Óptica Geométrica"],
    progress: 0,
    color: "bg-blue-100 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: "⚛️",
    done: 0,
  },
  {
    name: "Biologia",
    subtitle: "Genética, Ecologia e Evolução",
    topics: ["Genética", "Ecologia", "Evolução", "Citologia"],
    progress: 0,
    color: "bg-green-100 dark:bg-green-950",
    iconColor: "text-green-600 dark:text-green-400",
    icon: "🧬",
    done: 0,
  },
  {
    name: "História",
    subtitle: "Brasil República e História Geral",
    topics: ["Brasil República", "Primeira Guerra Mundial", "Revolução Industrial", "Era Vargas"],
    progress: 0,
    color: "bg-teal-100 dark:bg-teal-950",
    iconColor: "text-teal-600 dark:text-teal-400",
    icon: "🏛️",
    done: 0,
  },
  {
    name: "Geografia",
    subtitle: "Geografia do Brasil e do Mundo",
    topics: ["Geopolítica", "Climatologia", "Cartografia", "Urbanização"],
    progress: 0,
    color: "bg-cyan-100 dark:bg-cyan-950",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    icon: "🌍",
    done: 0,
  },
  {
    name: "Literatura",
    subtitle: "Escolas Literárias e Análise",
    topics: ["Escolas Literárias", "Análise de Obras", "Figuras de Linguagem", "Gêneros Textuais"],
    progress: 0,
    color: "bg-red-100 dark:bg-red-950",
    iconColor: "text-red-600 dark:text-red-400",
    icon: "📚",
    done: 0,
  },
];

function getSubjectModuleCount(courseModules: SubjectModuleMap, subjectName: string) {
  return courseModules[subjectName]?.length ?? 0;
}

function getModuleActivityTotal(module: SubjectModuleContent) {
  return module.activities.length + (module.miniChallenge ? 1 : 0);
}

function getModuleProgressPercent(
  progress: StudyProgress,
  subjectName: string,
  module: SubjectModuleContent,
) {
  const total = getModuleActivityTotal(module);
  if (total === 0) return 0;
  const answered = progress[subjectName]?.[module.title]?.length ?? 0;
  return Math.min(100, Math.round((answered / total) * 100));
}

function getSubjectProgressSummary(
  progress: StudyProgress,
  courseModules: SubjectModuleMap,
  subjectName: string,
) {
  const modules = courseModules[subjectName] ?? [];
  const moduleCount = modules.length;
  if (moduleCount === 0) return { progressPercent: 0, completedModules: 0, activeModules: 0 };

  const moduleProgress = modules.map((module) => getModuleProgressPercent(progress, subjectName, module));
  const completedModules = moduleProgress.filter((percent) => percent >= 100).length;
  const activeModules = moduleProgress.filter((percent) => percent > 0).length;
  const progressPercent = Math.round(moduleProgress.reduce((total, percent) => total + percent, 0) / moduleCount);

  return { progressPercent, completedModules, activeModules };
}

function getTotalProgressSummary(progress: StudyProgress, courseModules: SubjectModuleMap) {
  const subjectNames = SUBJECTS.map((subject) => subject.name);
  const totalModules = subjectNames.reduce((total, subjectName) => total + getSubjectModuleCount(courseModules, subjectName), 0);
  const completedModules = subjectNames.reduce(
    (total, subjectName) => total + getSubjectProgressSummary(progress, courseModules, subjectName).completedModules,
    0,
  );
  const totalModuleProgress = subjectNames.reduce((total, subjectName) => {
    const modules = courseModules[subjectName] ?? [];
    return total + modules.reduce((sum, module) => sum + getModuleProgressPercent(progress, subjectName, module), 0);
  }, 0);

  return {
    totalModules,
    completedModules,
    overallProgress: totalModules > 0 ? Math.round(totalModuleProgress / totalModules) : 0,
  };
}

function getFirstInProgressModule(
  progress: StudyProgress,
  courseModules: SubjectModuleMap,
  subjectName: string,
) {
  const modules = courseModules[subjectName] ?? [];

  return modules.find((module) => {
    const moduleProgress = getModuleProgressPercent(progress, subjectName, module);
    return moduleProgress > 0 && moduleProgress < 100;
  }) ?? modules.find((module) => getModuleProgressPercent(progress, subjectName, module) > 0) ?? null;
}

type StudyTrackKey = "basico" | "enem" | "aprofundamento";

type StudyTrack = {
  key: StudyTrackKey;
  title: string;
  description: string;
  modules: SubjectModuleContent[];
  progressPercent: number;
  completedModules: number;
};

const STUDY_TRACK_META: Record<StudyTrackKey, { title: string; description: string }> = {
  basico: {
    title: "1ª série",
    description: "",
  },
  enem: {
    title: "2ª série",
    description: "",
  },
  aprofundamento: {
    title: "3ª série",
    description: "",
  },
};

function getStudyTrackMeta(subjectName: string, key: StudyTrackKey) {
  if (subjectName === "Matemática") {
    const mathMeta: Record<StudyTrackKey, { title: string; description: string }> = {
      basico: {
        title: "1º ano",
        description: "Base",
      },
      enem: {
        title: "2º ano",
        description: "Aprofundamento",
      },
      aprofundamento: {
        title: "3º ano",
        description: "Revisão ENEM",
      },
    };

    return mathMeta[key];
  }

  return STUDY_TRACK_META[key];
}

function normalizeStudyTrackText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ª/g, "a")
    .replace(/º/g, "o")
    .toLowerCase();
}

function formatQuestionCount(count: number) {
  return `${count} ${count === 1 ? "questão" : "questões"}`;
}

function getModuleDisplayTitle(title: string) {
  return title.replace(/^\d+\s*(?:[ªº]|Âª|Âº)?\s*(série|serie|ano):\s*/i, "");
}

function getModuleTrackKey(module: SubjectModuleContent, index: number, total: number): StudyTrackKey {
  const text = normalizeStudyTrackText(`${module.title} ${module.objective} ${module.learningPath?.join(" ") ?? ""}`);

  if (/(1a serie|1 serie|1o ano|1 ano|primeira serie|primeiro ano)/.test(text)) {
    return "basico";
  }

  if (/(2a serie|2 serie|2o ano|2 ano|segunda serie|segundo ano)/.test(text)) {
    return "enem";
  }

  if (/(3a serie|3 serie|3o ano|3 ano|terceira serie|terceiro ano)/.test(text)) {
    return "aprofundamento";
  }

  if (/(enem|vestibular|prova|questao|interpretacao|redacao|competencia|habilidade)/.test(text)) {
    return "enem";
  }

  if (/(avancado|aprofund|desafio|revisao|sintese|complex|aplicac)/.test(text)) {
    return "aprofundamento";
  }

  if (total > 0 && index >= Math.ceil(total * 0.7)) {
    return "aprofundamento";
  }

  return "basico";
}

function buildStudyTracks(
  progress: StudyProgress,
  subjectName: string,
  modules: SubjectModuleContent[],
): StudyTrack[] {
  const grouped: Record<StudyTrackKey, SubjectModuleContent[]> = {
    basico: [],
    enem: [],
    aprofundamento: [],
  };

  modules.forEach((module, index) => {
    grouped[getModuleTrackKey(module, index, modules.length)].push(module);
  });

  if (modules.length > 0 && grouped.enem.length === 0) {
    grouped.enem = grouped.aprofundamento.slice(0, 1);
  }

  if (modules.length > 0 && grouped.aprofundamento.length === 0) {
    grouped.aprofundamento = modules.slice(-1);
  }

  return (Object.keys(STUDY_TRACK_META) as StudyTrackKey[])
    .map((key) => {
      const trackModules = grouped[key].filter((module, index, array) =>
        array.findIndex((item) => item.title === module.title) === index
      );
      const moduleProgress = trackModules.map((module) => getModuleProgressPercent(progress, subjectName, module));
      const completedModules = moduleProgress.filter((percent) => percent >= 100).length;
      const progressPercent = trackModules.length > 0
        ? Math.round(moduleProgress.reduce((total, percent) => total + percent, 0) / trackModules.length)
        : 0;

      return {
        key,
        title: getStudyTrackMeta(subjectName, key).title,
        description: getStudyTrackMeta(subjectName, key).description,
        modules: trackModules,
        progressPercent,
        completedModules,
      };
    })
    .filter((track) => track.modules.length > 0);
}

type DashboardReviewItem = {
  title: string;
  description: string;
  target?: StudyTarget;
  action?: "materias" | "flashcards";
  tone: "primary" | "warning" | "neutral";
};

function getActivityTypeLabel(activityType: UserActivityType) {
  const labels: Record<UserActivityType, string> = {
    materia: "Materias",
    calendario: "Calendario",
    flashcard: "Flashcards",
    simulado: "Simulados",
  };

  return labels[activityType];
}

function getRecentActivityTitle(activity: LearningActivityRecord) {
  if (activity.activityType === "materia") {
    return activity.moduleTitle || activity.subjectName || "Estudo concluido";
  }

  if (activity.activityType === "flashcard") {
    const action = activity.metadata.flashcardAction;
    if (action === "review_card") return "Flashcard revisado";
    if (action === "create_card") return "Flashcard criado";
    return "Deck atualizado";
  }

  if (activity.activityType === "simulado") {
    return typeof activity.metadata.examTitle === "string" ? activity.metadata.examTitle : "Simulado finalizado";
  }

  if (activity.activityType === "calendario") {
    return typeof activity.metadata.title === "string" ? activity.metadata.title : "Calendario atualizado";
  }

  return "Atividade registrada";
}

function buildDashboardReviewItems(
  progress: StudyProgress,
  courseModules: SubjectModuleMap,
  lastStudy: LastStudyData,
  activitySummary: LearningActivitySummary,
  dueFlashcardCount: number,
): DashboardReviewItem[] {
  const items: DashboardReviewItem[] = [];

  if (dueFlashcardCount > 0) {
    items.push({
      title: `Revisar ${dueFlashcardCount} flashcard${dueFlashcardCount === 1 ? "" : "s"}`,
      description: "Cards vencidos pela repeticao espacada estao prontos para revisar.",
      action: "flashcards",
      tone: "primary",
    });
  }

  if (lastStudy) {
    items.push({
      title: `Continuar ${getModuleDisplayTitle(lastStudy.moduleTitle ?? "")}`,
      description: `${lastStudy.subjectName} ja esta em andamento. Retome pelo ponto mais recente.`,
      target: lastStudy,
      action: "materias",
      tone: "primary",
    });
  }

  const activeModuleEntry = SUBJECTS
    .map((subject) => {
      const module = getFirstInProgressModule(progress, courseModules, subject.name);
      return module ? { subjectName: subject.name, module } : null;
    })
    .find((entry) => entry && (!lastStudy || entry.module.title !== lastStudy.moduleTitle));

  if (activeModuleEntry) {
    items.push({
      title: `Finalizar ${getModuleDisplayTitle(activeModuleEntry.module.title)}`,
      description: `${activeModuleEntry.subjectName} tem um modulo parcialmente concluido.`,
      target: { subjectName: activeModuleEntry.subjectName, moduleTitle: activeModuleEntry.module.title },
      action: "materias",
      tone: "warning",
    });
  }

  const quietSubject = SUBJECTS
    .map((subject) => ({
      subject,
      modules: courseModules[subject.name] ?? [],
      activityCount: activitySummary.bySubject[subject.name] ?? 0,
      progress: getSubjectProgressSummary(progress, courseModules, subject.name).progressPercent,
    }))
    .filter((entry) => entry.modules.length > 0)
    .sort((first, second) => first.activityCount - second.activityCount || first.progress - second.progress)[0];

  if (quietSubject) {
    const firstModule = quietSubject.modules[0];
    items.push({
      title: `Revisar ${quietSubject.subject.name}`,
      description: quietSubject.activityCount === 0
        ? "Esta materia ainda nao apareceu no seu ritmo recente."
        : "Esta materia teve menos atividade nos ultimos dias.",
      target: { subjectName: quietSubject.subject.name, moduleTitle: firstModule?.title },
      action: "materias",
      tone: "neutral",
    });
  }

  return items.slice(0, 3);
}

function CourseContentState({
  isLoading,
  error,
  onRetry,
}: {
  isLoading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return (
    <PageContainer contentClassName="rounded-2xl border border-border bg-card p-6 md:p-8">
        {isLoading ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Carregando conteúdo...</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Carregando matérias, módulos, aulas e exercícios.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Conteúdo indisponível</h2>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-fit"
              onClick={onRetry}
            >
              Tentar novamente
            </button>
          </div>
        )}
    </PageContainer>
  );
}

function MateriasView({
  studyProgress,
  courseModules,
  courseContentLoading,
  courseContentError,
  onRetryCourseContent,
  initialTarget,
  authUser,
  onFocusModeChange,
  onActivityAnswered,
}: {
  studyProgress: StudyProgress;
  courseModules: SubjectModuleMap;
  courseContentLoading: boolean;
  courseContentError: string;
  onRetryCourseContent: () => void;
  initialTarget: StudyTarget | null;
  authUser: AuthUser | null;
  onFocusModeChange?: (isFocused: boolean) => void;
  onActivityAnswered: (subjectName: string, moduleTitle: string, activityKey: string) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedModuleTitle, setSelectedModuleTitle] = useState<string | null>(null);
  const [selectedTrackKey, setSelectedTrackKey] = useState<StudyTrackKey>("basico");

  useEffect(() => {
    onFocusModeChange?.(selected !== null);
    return () => onFocusModeChange?.(false);
  }, [onFocusModeChange, selected]);

  useEffect(() => {
    if (!initialTarget || courseContentLoading || courseContentError) return;

    const subjectIndex = SUBJECTS.findIndex((subject) => subject.name === initialTarget.subjectName);
    if (subjectIndex < 0) return;

    const modules = courseModules[initialTarget.subjectName] ?? [];
    const targetModule =
      modules.find((module) => module.title === initialTarget.moduleTitle) ??
      modules[0] ??
      null;
    const targetTrack = targetModule
      ? buildStudyTracks(studyProgress, initialTarget.subjectName, modules).find((track) =>
        track.modules.some((module) => module.title === targetModule.title)
      )
      : null;

    setSelected(subjectIndex);
    setSelectedModuleTitle(targetModule?.title ?? null);
    setSelectedTrackKey(targetTrack?.key ?? "basico");
  }, [courseContentError, courseContentLoading, courseModules, initialTarget, studyProgress]);

  const selectSubject = (index: number) => {
    if (courseContentLoading || courseContentError) return;
    if (selected === index) {
      setSelected(null);
      setSelectedModuleTitle(null);
      setSelectedTrackKey("basico");
      return;
    }

    setSelected(index);
    setSelectedModuleTitle(null);
    setSelectedTrackKey("basico");
  };

  if (courseContentLoading || courseContentError) {
    return (
      <CourseContentState
        isLoading={courseContentLoading}
        error={courseContentError}
        onRetry={onRetryCourseContent}
      />
    );
  }

  if (selected !== null) {
    const s = SUBJECTS[selected];
    const subjectModules = courseModules[s.name] ?? [];
    const moduleCount = subjectModules.length;
    const progressSummary = getSubjectProgressSummary(studyProgress, courseModules, s.name);
    const subjectProgress = progressSummary.progressPercent;
    const identity = getSubjectIdentity(s.name);
    const studyTracks = buildStudyTracks(studyProgress, s.name, subjectModules);
    const activeTrack = studyTracks.find((track) => track.key === selectedTrackKey) ?? studyTracks[0] ?? null;
    const visibleModules = activeTrack?.modules ?? subjectModules;
    const activeModule =
      visibleModules.find((module) => module.title === selectedModuleTitle) ??
      visibleModules[0] ??
      subjectModules.find((module) => module.title === selectedModuleTitle) ??
      subjectModules[0] ??
      null;

    return (
      <PageContainer size="wide" contentClassName="space-y-5">
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setSelectedModuleTitle(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para matérias
          </button>

          <div className={`rounded-2xl border ${identity.border} ${identity.soft} p-5 md:p-6`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-3xl`}>
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${identity.accent}`}>{identity.label}</p>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">{s.name}</h2>
                <p className="text-sm md:text-base text-muted-foreground">{s.subtitle}</p>
              </div>
              <div className="min-w-44">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{progressSummary.completedModules}/{moduleCount} módulos</span>
                  <span>{subjectProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background/80">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${subjectProgress}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {studyTracks.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Trilhas de estudo</h3>
                    <p className="text-sm text-muted-foreground">
                      Escolha uma rota para estudar {s.name} com mais ordem.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {studyTracks.length} trilha{studyTracks.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  {studyTracks.map((track) => (
                    <button
                      key={track.key}
                      type="button"
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        activeTrack?.key === track.key
                          ? `${identity.border} ${identity.soft}`
                          : "border-border bg-background hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        setSelectedTrackKey(track.key);
                        setSelectedModuleTitle(track.modules[0]?.title ?? null);
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <h4 className="font-semibold text-foreground">{track.title}</h4>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            activeTrack?.key === track.key ? identity.accent : "text-muted-foreground"
                          }`}
                        >
                          {track.progressPercent}%
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${track.progressPercent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {track.completedModules}/{track.modules.length} modulo{track.modules.length === 1 ? "" : "s"} completos
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <aside className="rounded-2xl border border-border bg-card p-3">
              <div className="sr-only">
                <h3 className="font-semibold text-foreground">Módulos de {s.name}</h3>
                <p className="text-sm text-muted-foreground">Escolha uma trilha para estudar.</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(visibleModules.length ? visibleModules.map((module) => module.title) : s.topics).map((topic) => {
                  const module = visibleModules.find((item) => item.title === topic);
                  const topicLabel = module ? getModuleDisplayTitle(module.title) : topic;
                  const isActive = activeModule?.title === topic;
                  const moduleProgress = module ? getModuleProgressPercent(studyProgress, s.name, module) : 0;

                  return (
                    <button
                      key={topic}
                      type="button"
                      disabled={!module}
                      className={`min-w-[190px] rounded-xl border px-4 py-3 text-left transition-colors ${
                        isActive
                          ? `${identity.border} ${identity.soft}`
                          : module
                            ? "border-border bg-background hover:bg-muted/60"
                            : "border-border bg-muted/30 opacity-70"
                      }`}
                      onClick={() => {
                        if (module) setSelectedModuleTitle(topic);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${s.iconColor.replace("text-", "bg-")}`} />
                        <span className="truncate text-sm font-medium text-foreground">{topicLabel}</span>
                        <span className={`ml-auto text-xs ${module ? identity.accent : "text-muted-foreground"}`}>
                          {module ? `${moduleProgress}%` : "Em breve"}
                        </span>
                      </div>
                      {module && (
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${moduleProgress}%` }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="min-w-0">
              {activeModule ? (
                <ModuleContent
                  module={activeModule}
                  subjectName={s.name}
                  moduleProgress={getModuleProgressPercent(studyProgress, s.name, activeModule)}
                  canSaveProgress={Boolean(authUser)}
                  onActivityAnswered={onActivityAnswered}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
                  <h3 className="font-semibold text-foreground">Conteúdo em preparação</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Esta matéria ainda não possui módulos completos cadastrados.
                  </p>
                </div>
              )}
            </div>
          </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer contentClassName="space-y-4 md:space-y-8">
        {/* Summary bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SUBJECTS.map((s, i) => (
            (() => {
              const moduleCount = getSubjectModuleCount(courseModules, s.name);
              const progressSummary = getSubjectProgressSummary(studyProgress, courseModules, s.name);
              return (
            <button
              key={s.name}
              onClick={() => selectSubject(i)}
              className={`flex flex-col items-start p-3 md:p-5 xl:p-6 rounded-xl border transition-all text-left ${
                selected === i
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:shadow-md"
              }`}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 ${s.color} rounded-xl flex items-center justify-center text-xl md:text-2xl mb-2`}>
                {s.icon}
              </div>
              <span className="text-sm md:text-base font-semibold text-foreground">{s.name}</span>
              <span className="text-xs text-muted-foreground mb-2">{progressSummary.completedModules}/{moduleCount} módulos</span>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progressSummary.progressPercent}%` }}
                />
              </div>
            </button>
              );
            })()
          ))}
        </div>

        {/* Detail panel */}
        {selected !== null && (() => {
          const s = SUBJECTS[selected];
          const subjectModules = courseModules[s.name] ?? [];
          const moduleCount = subjectModules.length;
          const progressSummary = getSubjectProgressSummary(studyProgress, courseModules, s.name);
          const subjectProgress = progressSummary.progressPercent;
          const activeModule =
            subjectModules.find((module) => module.title === selectedModuleTitle) ??
            subjectModules[0] ??
            null;

          return (
            <div className="bg-card border border-border rounded-xl p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-3xl`}>
                  {s.icon}
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-foreground">{s.name}</h2>
                  <p className="text-sm text-muted-foreground">{s.subtitle}</p>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-2xl font-bold text-foreground">{subjectProgress}%</span>
                  <p className="text-xs text-muted-foreground">{progressSummary.completedModules}/{moduleCount} módulos</p>
                </div>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${subjectProgress}%` }} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Tópicos principais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {s.topics.map((topic) => {
                    const hasContent = subjectModules.some((module) => module.title === topic);
                    const isActive = activeModule?.title === topic;

                    return (
                    <button
                      key={topic}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/50 hover:bg-muted text-foreground"
                      }`}
                      onClick={() => {
                        if (hasContent) setSelectedModuleTitle(topic);
                      }}
                      type="button"
                    >
                      <div className={`w-2 h-2 rounded-full ${s.iconColor.replace("text-", "bg-")}`} />
                      <span className="text-sm">{topic}</span>
                      <span className="ml-auto text-xs text-primary">
                        {hasContent ? "Estudar" : "Em breve"}
                      </span>
                    </button>
                    );
                  })}
                </div>
              </div>

              {activeModule ? (
                <ModuleContent
                  module={activeModule}
                      subjectName={s.name}
                      moduleProgress={getModuleProgressPercent(studyProgress, s.name, activeModule)}
                      canSaveProgress={Boolean(authUser)}
                      onActivityAnswered={onActivityAnswered}
                    />
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
                  <h3 className="font-semibold text-foreground">Conteúdo em preparação</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Esta matéria ainda não possui módulos completos cadastrados.
                  </p>
                </div>
              )}
            </div>
          );
        })()}
    </PageContainer>
  );
}

const LESSON_STAGE_LABELS: Record<
  NonNullable<SubjectModuleContent["sections"]>[number]["level"],
  { title: string; badge: string; tone: string }
> = {
  introducao: {
    title: "Introdução",
    badge: "Comece aqui",
    tone: "border-border bg-card",
  },
  basico: {
    title: "Explicação básica",
    badge: "Base",
    tone: "border-border bg-card",
  },
  intermediario: {
    title: "Explicação intermediária",
    badge: "Aprofunde",
    tone: "border-border bg-card",
  },
  avancado: {
    title: "Explicação avançada",
    badge: "Pegadinhas",
    tone: "border-border bg-card",
  },
};

const DEFAULT_LEARNING_PATH = [
  "Entenda a ideia central",
  "Veja exemplos resolvidos",
  "Pratique com dificuldade gradual",
  "Revise erros comuns e flashcards",
];

type SubjectIdentity = {
  label: string;
  accent: string;
  soft: string;
  border: string;
  icon: string;
  visualTitle: string;
  reviewTitle: string;
};

const SUBJECT_IDENTITIES: Record<string, SubjectIdentity> = {
  "História": {
    label: "linha do tempo + contexto",
    accent: "text-amber-700 dark:text-amber-300",
    soft: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900",
    icon: "⌛",
    visualTitle: "Linha histórica interativa",
    reviewTitle: "Revisão por eventos",
  },
  "Biologia": {
    label: "diagramas vivos + sistemas",
    accent: "text-emerald-700 dark:text-emerald-300",
    soft: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-900",
    icon: "◉",
    visualTitle: "Modelo biológico",
    reviewTitle: "Revisão por sistemas",
  },
  "Português": {
    label: "análise textual guiada",
    accent: "text-rose-700 dark:text-rose-300",
    soft: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-900",
    icon: "¶",
    visualTitle: "Leitura guiada",
    reviewTitle: "Revisão por interpretação",
  },
  "Matemática": {
    label: "gráficos + resolução visual",
    accent: "text-indigo-700 dark:text-indigo-300",
    soft: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-900",
    icon: "Æ’",
    visualTitle: "Resolução visual",
    reviewTitle: "Revisão por etapas",
  },
  "Química": {
    label: "reações + estruturas",
    accent: "text-purple-700 dark:text-purple-300",
    soft: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-900",
    icon: "⚗",
    visualTitle: "Modelo químico",
    reviewTitle: "Revisão por relações",
  },
  "Física": {
    label: "movimento + forças",
    accent: "text-sky-700 dark:text-sky-300",
    soft: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-900",
    icon: "↗",
    visualTitle: "Simulação conceitual",
    reviewTitle: "Revisão por fenômeno",
  },
  "Geografia": {
    label: "mapas + território",
    accent: "text-cyan-700 dark:text-cyan-300",
    soft: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-900",
    icon: "◎",
    visualTitle: "Mapa de relações espaciais",
    reviewTitle: "Revisão territorial",
  },
  "Literatura": {
    label: "obra + linguagem",
    accent: "text-red-700 dark:text-red-300",
    soft: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900",
    icon: "§",
    visualTitle: "Análise de linguagem",
    reviewTitle: "Revisão por leitura",
  },
};

const DEFAULT_SUBJECT_IDENTITY: SubjectIdentity = {
  label: "aula guiada",
  accent: "text-primary",
  soft: "bg-primary/5",
  border: "border-primary/20",
  icon: "•",
  visualTitle: "Visual do conceito",
  reviewTitle: "Revisão rápida",
};

function getSubjectIdentity(subjectName: string) {
  return SUBJECT_IDENTITIES[subjectName] ?? DEFAULT_SUBJECT_IDENTITY;
}

function buildFallbackSections(module: SubjectModuleContent): NonNullable<SubjectModuleContent["sections"]> {
  const levels: NonNullable<SubjectModuleContent["sections"]>[number]["level"][] = [
    "introducao",
    "basico",
    "intermediario",
    "avancado",
  ];

  return levels
    .map((level, index) => ({
      level,
      title: LESSON_STAGE_LABELS[level].title,
      paragraphs: module.explanation.slice(index * 2, index * 2 + 2).filter(Boolean),
    }))
    .filter((section) => section.paragraphs.length > 0);
}

function buildFallbackReview(module: SubjectModuleContent): NonNullable<SubjectModuleContent["review"]> {
  const moduleDisplayTitle = getModuleDisplayTitle(module.title);

  return {
    summary: module.explanation
      .slice(0, 4)
      .map((paragraph) => paragraph.split(".")[0].trim())
      .filter(Boolean),
    mentalMap: [moduleDisplayTitle, "Conceitos", "Exemplos", "Prática", "Revisão"],
    flashcards: [
      {
        front: `Qual é a ideia central de ${moduleDisplayTitle}?`,
        back: module.objective,
      },
      {
        front: "Como estudar este módulo?",
        back: "Leia a explicação, resolva os exemplos, faça as atividades e revise os erros.",
      },
    ],
  };
}

function getActivityDifficulty(activity: SubjectModuleContent["activities"][number], index: number) {
  if (activity.difficulty) return activity.difficulty;
  if (index < 2) return "facil";
  if (index < 4) return "medio";
  return "dificil";
}

type CourseBlock = {
  title: string;
  label: string;
  paragraphs: string[];
  tasks: string[];
};

function getSubjectCourseMethod(subjectName: string, moduleTitle: string): CourseBlock[] {
  const moduleDisplayTitle = getModuleDisplayTitle(moduleTitle);
  const commonMastery = {
    title: "Plano de domínio",
    label: "método",
    paragraphs: [
      `Estudar ${moduleDisplayTitle} no nível completo exige três voltas: entender a ideia, aplicar em situações diferentes e revisar os erros depois de algum intervalo.`,
      "Na primeira volta, o foco é compreender o conceito sem pressa. Na segunda, o foco é resolver problemas. Na terceira, o foco é explicar com suas próprias palavras e corrigir lacunas.",
    ],
    tasks: [
      "Leia a aula guiada e anote as palavras que aparecem mais de uma vez.",
      "Resolva os exemplos sem olhar a explicação por pelo menos uma tentativa.",
      "Depois das atividades, escreva um resumo de 5 linhas com causa, regra e aplicação.",
      "Volte ao módulo no dia seguinte e refaça apenas o que errou ou hesitou.",
    ],
  };

  const bySubject: Record<string, CourseBlock[]> = {
    "Português": [
      {
        title: "Leitura ativa",
        label: "interpretação",
        paragraphs: [
          "Em Português, o estudo completo começa pela leitura com marcação. O aluno deve separar tema, tese, palavras de retomada, conectivos e efeito de sentido.",
          "A resposta correta precisa ser sustentada por marcas do texto. Se uma interpretação não consegue apontar uma palavra, estrutura ou trecho que a justifique, ela provavelmente é fraca.",
        ],
        tasks: [
          "Sublinhe conectivos e escreva a relação que cada um cria.",
          "Separe informação explícita, inferência e opinião do autor.",
          "Reescreva um parágrafo mantendo o sentido e mudando a estrutura.",
          "Explique por que uma alternativa errada parece convincente.",
        ],
      },
      commonMastery,
    ],
    "Literatura": [
      {
        title: "Leitura literária",
        label: "obra",
        paragraphs: [
          "Em Literatura, o conteúdo completo exige juntar forma e contexto. Não basta saber o movimento literário: é preciso observar narrador, eu lírico, imagem, ironia, ritmo e crítica social.",
          "Uma boa análise responde a duas perguntas: o que o texto diz e como ele faz isso. O segundo ponto é o que diferencia resumo de interpretação literária.",
        ],
        tasks: [
          "Identifique voz, tema, conflito e tom do texto.",
          "Anote uma imagem ou figura de linguagem e explique seu efeito.",
          "Relacione o trecho ao contexto histórico sem forçar interpretação.",
          "Compare duas leituras possíveis e escolha a mais sustentada pelo texto.",
        ],
      },
      commonMastery,
    ],
    "Matemática": [
      {
        title: "Resolução visual",
        label: "método",
        paragraphs: [
          "Em Matemática, o estudo completo não começa pela fórmula. Começa pela leitura das grandezas: o que varia, o que é fixo, qual unidade aparece e qual relação está sendo pedida.",
          "Sempre que possível, transforme o problema em tabela, desenho, gráfico ou sequência de etapas. A representação visual reduz erro algébrico e melhora interpretação.",
        ],
        tasks: [
          "Liste dados conhecidos, incógnita e unidade antes de calcular.",
          "Resolva uma vez por fórmula e outra por raciocínio visual.",
          "Crie um exemplo parecido trocando os números.",
          "Explique o resultado final em linguagem comum, não só com conta.",
        ],
      },
      commonMastery,
    ],
    "Física": [
      {
        title: "Fenômeno antes da fórmula",
        label: "simulação",
        paragraphs: [
          "Em Física, a fórmula entra depois da descrição do fenômeno. Primeiro identifique corpo, interação, direção, sentido, grandezas e unidades.",
          "O estudo completo exige prever o comportamento antes da conta: aumenta, diminui, conserva, dissipa, aproxima, afasta ou muda de direção.",
        ],
        tasks: [
          "Desenhe o sistema físico com setas e legendas.",
          "Escreva uma previsão qualitativa antes de calcular.",
          "Confira unidade final e ordem de grandeza.",
          "Explique o que mudaria se massa, distância, atrito ou velocidade dobrassem.",
        ],
      },
      commonMastery,
    ],
    "Química": [
      {
        title: "Modelo microscópico",
        label: "estrutura",
        paragraphs: [
          "Em Química, o nível completo conecta três escalas: partículas, representação simbólica e fenômeno observado. Fórmulas e equações só fazem sentido quando ligadas ao que átomos, íons ou moléculas estão fazendo.",
          "Ao estudar uma reação, acompanhe conservação de átomos, transferência ou compartilhamento de elétrons, energia envolvida e evidência macroscópica.",
        ],
        tasks: [
          "Identifique espécies químicas, carga, estado físico e proporção.",
          "Explique o processo em nível microscópico antes da conta.",
          "Relacione a equação a uma observação real.",
          "Revise se massa, carga e energia foram tratadas de forma coerente.",
        ],
      },
      commonMastery,
    ],
    "Biologia": [
      {
        title: "Sistema vivo",
        label: "modelo",
        paragraphs: [
          "Em Biologia, o estudo completo exige pensar em níveis de organização: molécula, célula, tecido, organismo, população, comunidade e ecossistema.",
          "A pergunta mais importante é função. Uma estrutura, processo ou comportamento precisa ser ligado ao papel que exerce na sobrevivência, reprodução, equilíbrio ou adaptação.",
        ],
        tasks: [
          "Localize o tema em um nível de organização biológica.",
          "Explique a função do processo ou estrutura.",
          "Relacione causa, mecanismo e consequência.",
          "Crie uma situação de desequilíbrio e explique o efeito esperado.",
        ],
      },
      commonMastery,
    ],
    "História": [
      {
        title: "Tempo, contexto e conflito",
        label: "processo histórico",
        paragraphs: [
          "Em História, o nível completo depende de processo, não de data isolada. Cada evento deve ser conectado a causas, grupos sociais, interesses, consequências e permanências.",
          "A pergunta decisiva é: quem ganha, quem perde, quem resiste e qual estrutura social aparece por trás do acontecimento.",
        ],
        tasks: [
          "Monte uma linha do tempo com causa, evento e consequência.",
          "Identifique grupos sociais envolvidos e seus interesses.",
          "Separe causa imediata de causa estrutural.",
          "Explique uma permanência do tema no presente.",
        ],
      },
      commonMastery,
    ],
    "Geografia": [
      {
        title: "Espaço e escala",
        label: "território",
        paragraphs: [
          "Em Geografia, o estudo completo exige pensar em escala: local, regional, nacional e global. O mesmo fenômeno muda de sentido conforme a escala analisada.",
          "Toda análise espacial deve relacionar natureza, sociedade, economia, técnica e poder. Mapa, gráfico e paisagem são evidências, não decoração.",
        ],
        tasks: [
          "Identifique a escala do fenômeno estudado.",
          "Relacione localização, causa e consequência.",
          "Leia mapa ou gráfico procurando título, legenda, fonte e unidade.",
          "Explique como o fenômeno afeta grupos sociais diferentes.",
        ],
      },
      commonMastery,
    ],
  };

  return bySubject[subjectName] ?? [commonMastery];
}

function buildCourseBlocks(subjectName: string, module: SubjectModuleContent): CourseBlock[] {
  const firstExample = module.examples[0];
  const firstActivity = module.activities[0];
  const moduleDisplayTitle = getModuleDisplayTitle(module.title);

  return [
    ...getSubjectCourseMethod(subjectName, module.title),
    {
      title: "Aprofundamento orientado",
      label: "aula longa",
      paragraphs: [
        module.explanation[0] ?? module.objective,
        module.explanation[1] ?? "Aprofunde o conceito ligando definição, aplicação e erro comum.",
        `Para dominar ${moduleDisplayTitle}, o aluno precisa alternar leitura, resolução, explicação oral e revisão. O objetivo é reconhecer o tema em contextos novos, não apenas repetir a definição.`,
      ],
      tasks: [
        "Transforme a explicação em um mapa de 6 palavras-chave.",
        "Crie uma pergunta fácil, uma média e uma difícil sobre o tema.",
        "Explique o conteúdo como se estivesse ensinando alguém que nunca viu o assunto.",
        "Anote uma dúvida real para revisar depois.",
      ],
    },
    {
      title: "Aplicação no ENEM",
      label: "prova",
      paragraphs: [
        `Em prova, ${moduleDisplayTitle} costuma aparecer misturado a interpretação de texto, gráficos, situações cotidianas ou problemas sociais.`,
        "A banca normalmente não cobra só memória. Ela cobra leitura do contexto, identificação da regra útil e escolha da alternativa mais coerente com o enunciado.",
      ],
      tasks: [
        firstExample ? `Releia o exemplo "${firstExample.title}" e identifique qual habilidade ele treina.` : "Crie um exemplo aplicado ao cotidiano.",
        firstActivity ? `Refaça a atividade: ${firstActivity.question}` : "Resolva uma questão autoral sobre o tema.",
        "Escreva por que as alternativas erradas seriam atraentes.",
        "Classifique o tema como conceitual, interpretativo, cálculo, processo ou análise crítica.",
      ],
    },
    {
      title: "Banco de treino extra",
      label: "prática",
      paragraphs: [
        "Use este bloco para estudo ativo. A regra é responder antes de olhar qualquer resumo. Se travar, volte à aula guiada e localize exatamente onde está a lacuna.",
        "O treino deve misturar reconhecimento, aplicação e explicação. Isso evita falsa sensação de aprendizado causada por apenas ler o conteúdo.",
      ],
      tasks: [
        `Defina ${moduleDisplayTitle} em uma frase objetiva.`,
        `Dê um exemplo real de aplicação de ${moduleDisplayTitle}.`,
        "Explique um erro comum que alguém cometeria nesse assunto.",
        "Resolva uma questão com consulta e depois outra sem consulta.",
        "Crie uma analogia própria para o conceito principal.",
        "Faça uma revisão 24 horas depois e marque o que ainda está inseguro.",
      ],
    },
  ];
}

function normalizeWrittenAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['"“”‘’.,;!?()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function evaluateWrittenAnswer(
  activity: SubjectModuleContent["activities"][number],
  writtenAnswer: string,
) {
  if (!activity.rubric?.length) return null;

  const normalizedAnswer = normalizeWrittenAnswer(writtenAnswer);
  const criteria = activity.rubric.map((criterion) => {
    const matched = criterion.accepted.some((accepted) =>
      normalizedAnswer.includes(normalizeWrittenAnswer(accepted)),
    );
    return { ...criterion, matched };
  });
  const matched = criteria.filter((criterion) => criterion.matched);
  const missed = criteria.filter((criterion) => !criterion.matched);

  if (matched.length === criteria.length) {
    return {
      status: "correct" as const,
      title: "Resposta correta.",
      matched,
      missed,
    };
  }

  if (matched.length > 0) {
    return {
      status: "partial" as const,
      title: "Resposta parcialmente correta.",
      matched,
      missed,
    };
  }

  return {
    status: "incorrect" as const,
    title: "Resposta incorreta.",
    matched,
    missed,
  };
}

function ModuleContent({
  module,
  subjectName,
  moduleProgress,
  canSaveProgress,
  onActivityAnswered,
}: {
  module: SubjectModuleContent;
  subjectName: string;
  moduleProgress: number;
  canSaveProgress: boolean;
  onActivityAnswered: (subjectName: string, moduleTitle: string, activityKey: string) => void;
}) {
  const sections = module.sections ?? buildFallbackSections(module);
  const review = module.review ?? buildFallbackReview(module);
  const learningPath = module.learningPath ?? DEFAULT_LEARNING_PATH;
  const identity = getSubjectIdentity(subjectName);
  const courseBlocks = buildCourseBlocks(subjectName, module);
  const totalTasks = getModuleActivityTotal(module);
  const completedTasks = Math.min(totalTasks, Math.round((moduleProgress / 100) * totalTasks));
  const estimatedMinutes = Math.max(8, Math.min(28, 8 + sections.length * 2 + module.activities.length * 2));
  const xpReward = 40 + module.activities.length * 5 + (module.miniChallenge ? 15 : 0);
  const hasHardActivity = module.activities.some((activity) => getActivityDifficulty(activity, 0) === "dificil");
  const difficultyLabel = hasHardActivity ? "Médio" : "Fácil";
  const guidedActivity = module.activities[0] ?? null;
  const practiceActivities = guidedActivity ? module.activities.slice(1) : module.activities;
  const indexedPracticeActivities = practiceActivities.map((activity, index) => ({
    activity,
    index: index + (guidedActivity ? 1 : 0),
  }));
  const objectivePracticeActivities = indexedPracticeActivities.filter(({ activity }) => Boolean(activity.choices?.length));
  const writtenPracticeActivities = indexedPracticeActivities.filter(({ activity }) => !activity.choices?.length);
  const navigationItems = [
    ["Aula", "aula-guiada"],
    guidedActivity ? ["Exercício", "exercicio-guiado"] : null,
    ["Visual", "visual-conceito"],
    ["Exemplos", "exemplos-resolvidos"],
    ["Prática", "pratica-graduada"],
    ["Revisão", "revisao-final"],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="space-y-8 rounded-2xl border border-border bg-card p-5 md:p-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-background p-5 md:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-lg font-semibold text-primary">
                {identity.icon}
              </span>
              <p className="text-sm font-medium text-muted-foreground">{identity.label}</p>
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">{getModuleDisplayTitle(module.title)}</h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground md:text-base">{module.objective}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {difficultyLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                {estimatedMinutes} min
              </span>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-border bg-card p-4 lg:w-64">
            <div
              className="hidden"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${moduleProgress * 3.6}deg, hsl(var(--muted)) 0deg)`,
              }}
            >
              <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-background text-center">
                <span className="text-2xl font-bold text-foreground">{moduleProgress}%</span>
                <span className="text-[10px] font-medium uppercase text-muted-foreground">concluído</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Progresso do módulo</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p className="text-2xl font-semibold text-foreground">{moduleProgress}%</p>
                <p className="pb-1 text-xs text-muted-foreground">{completedTasks}/{totalTasks} atividades</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${moduleProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden">
          <div className="rounded-xl bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Primeiro passo</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-foreground">{learningPath[0] ?? "Entenda a ideia central"}</p>
          </div>
          <div className="rounded-xl bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Treino ativo</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-foreground">
              {formatQuestionCount(module.activities.length)} + exemplos resolvidos
            </p>
          </div>
          <div className="rounded-xl bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Saída esperada</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-foreground">Explicar, aplicar e revisar sem depender do resumo.</p>
          </div>
        </div>
        {!canSaveProgress && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            Você pode estudar normalmente, mas progresso, sequência e continuar estudando só ficam salvos depois de entrar na conta.
          </p>
        )}
      </div>

      <ModuleLearningOverview
        learningPath={learningPath}
        review={review}
        activityCount={module.activities.length}
        hasVisual={Boolean(module.visual)}
        moduleProgress={moduleProgress}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
        xpReward={xpReward}
      />

      <div className="sticky top-0 z-10 -mx-4 border-y border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {navigationItems.map(([label, target]) => (
            <a
              key={target}
              href={`#${target}`}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      <section id="aula-guiada" className="scroll-mt-24 space-y-4">
        <div>
          <h4 className="text-base md:text-lg font-semibold text-foreground">Aula guiada</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Leia em fluxo contínuo: conceito, lógica, aplicação e cuidados aparecem abertos.
          </p>
        </div>
        <div className="space-y-4">
          {sections.map((section, index) => {
            const stage = LESSON_STAGE_LABELS[section.level];
            return (
              <article
                key={`${section.level}-${section.title}`}
                className={`rounded-2xl border p-5 md:p-7 ${stage.tone}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                      {stage.badge}
                    </span>
                    <h5 className="mt-2 text-base md:text-lg font-semibold text-foreground">{section.title}</h5>
                    <p className="text-xs text-muted-foreground">{stage.title}</p>
                  </div>
                </div>
                <div className="mt-5 max-w-4xl space-y-4 text-sm leading-7 text-foreground md:text-base md:leading-8">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.analogy && (
                    <div className="rounded-xl border border-border bg-background p-4">
                      <strong>Analogia: </strong>{section.analogy}
                    </div>
                  )}
                  {section.whyItMatters && (
                    <div className="rounded-xl border border-border bg-background p-4">
                      <strong>Por que importa: </strong>{section.whyItMatters}
                    </div>
                  )}
                  {section.commonMistake && (
                    <div className="rounded-xl border border-border bg-background p-4">
                      <strong>Erro comum: </strong>{section.commonMistake}
                    </div>
                  )}
                  {section.teacherTip && (
                    <div className="rounded-xl border border-border bg-background p-4">
                      <strong>Truque de professor: </strong>{section.teacherTip}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {guidedActivity && (
        <section id="exercicio-guiado" className="scroll-mt-24 space-y-3 rounded-2xl border border-border bg-background p-4 md:p-5">
          <div>
            <p className="text-sm font-medium text-primary">Checkpoint guiado</p>
            <h4 className="mt-1 text-base font-semibold text-foreground md:text-lg">Tente antes de seguir</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Responda uma questão curta para confirmar se o conceito principal ficou claro.
            </p>
          </div>
          <ModuleActivity
            activity={guidedActivity}
            index={0}
            difficulty={getActivityDifficulty(guidedActivity, 0)}
            onAnswered={() => onActivityAnswered(subjectName, module.title, guidedActivity.question)}
          />
        </section>
      )}

      <div id="aprofundamento" className="scroll-mt-24">
        <CourseCompleteSection blocks={courseBlocks} identity={identity} />
      </div>

      {module.visual && (
        <div id="visual-conceito" className="scroll-mt-24">
          <ModuleVisual visual={module.visual} subjectName={subjectName} />
        </div>
      )}

      <section id="exemplos-resolvidos" className="scroll-mt-24 space-y-3">
        <ModuleExamples examples={module.examples} />
      </section>

      <section id="pratica-graduada" className="scroll-mt-24 space-y-3">
        <h4 className="text-base md:text-lg font-semibold text-foreground">Prática graduada</h4>
        <div className="space-y-4">
          <ModulePracticeGroup
            title="Questões objetivas"
            description="Resolva primeiro para testar reconhecimento, cálculo e eliminação de alternativas."
            items={objectivePracticeActivities}
            subjectName={subjectName}
            moduleTitle={module.title}
            onActivityAnswered={onActivityAnswered}
          />
          <ModulePracticeGroup
            title="Respostas escritas"
            description="Use para explicar o raciocínio com suas palavras e fechar lacunas de compreensão."
            items={writtenPracticeActivities}
            subjectName={subjectName}
            moduleTitle={module.title}
            onActivityAnswered={onActivityAnswered}
          />
        </div>
      </section>

      {module.miniChallenge && (
        <section className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4 md:p-5">
          <p className="text-sm font-medium text-primary">Mini desafio</p>
          <ModuleActivity
            activity={module.miniChallenge}
            index={0}
            difficulty="dificil"
            onAnswered={() => onActivityAnswered(subjectName, module.title, `desafio:${module.miniChallenge?.question ?? module.title}`)}
          />
        </section>
      )}

      <section className="rounded-2xl border border-border bg-background p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-base font-semibold text-foreground md:text-lg">Fechamento da aula</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Ao terminar, revise o que errou e registre a atividade para manter seu progresso.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 md:min-w-[420px]">
            <span className="rounded-xl border border-border bg-card px-3 py-2">+{xpReward} XP</span>
            <span className="rounded-xl border border-border bg-card px-3 py-2">+1 aula concluída</span>
            <span className="rounded-xl border border-border bg-card px-3 py-2">sequência mantida</span>
          </div>
        </div>
      </section>

      <div id="revisao-final" className="scroll-mt-24">
        <ModuleReview review={review} subjectName={subjectName} />
      </div>
    </div>
  );
}

function ModuleExamples({
  examples,
}: {
  examples: SubjectModuleContent["examples"];
}) {
  if (examples.length === 0) return null;

  const [mainExample, ...supportExamples] = examples;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-base font-semibold text-foreground md:text-lg">Exemplos resolvidos</h4>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Comece pelo exemplo guiado e depois compare com as aplicações rápidas.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article className="rounded-2xl border border-border bg-background p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                exemplo guiado
              </span>
              <h5 className="mt-3 text-lg font-semibold text-foreground">{mainExample.title}</h5>
            </div>
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-foreground md:text-base md:leading-8">
            {mainExample.content}
          </p>
          <div className="mt-4 rounded-xl border border-border bg-card p-3 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Como estudar:</strong> cubra a resposta, tente refazer o raciocínio e só depois compare com o exemplo.
          </div>
        </article>

        {supportExamples.length > 0 && (
          <aside className="rounded-2xl border border-border bg-background p-4 md:p-5">
            <h5 className="font-semibold text-foreground">Aplicações rápidas</h5>
            <div className="mt-3 space-y-3">
              {supportExamples.slice(0, 5).map((example, index) => (
                <article key={example.title} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <h6 className="text-sm font-semibold text-foreground">{example.title}</h6>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{example.content}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function GuidedLessonPlan({
  learningPath,
  review,
  activityCount,
  hasVisual,
}: {
  learningPath: string[];
  review: NonNullable<SubjectModuleContent["review"]>;
  activityCount: number;
  hasVisual: boolean;
}) {
  const supportItems = [
    `${review.summary.length} pontos de resumo`,
    `${formatQuestionCount(activityCount)} de prática`,
    hasVisual ? "mapa visual disponível" : "mapa mental de revisão",
  ];

  return (
    <section className="rounded-2xl border border-border bg-background p-5 md:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <h4 className="text-base font-semibold text-foreground md:text-lg">Plano de leitura</h4>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Siga a aula em ordem. Primeiro entenda, depois aplique, depois revise.
          </p>
          <ol className="mt-5 space-y-3">
            {learningPath.slice(0, 4).map((step, index) => (
              <li key={step} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-sm font-medium leading-relaxed text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <aside className="rounded-xl border border-border bg-card p-4">
          <h5 className="text-sm font-semibold text-foreground">Apoio da aula</h5>
          <div className="mt-3 space-y-2">
            {supportItems.map((item) => (
              <p key={item} className="rounded-lg bg-background px-3 py-2 text-sm text-muted-foreground">
                {item}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function ModuleLearningOverview({
  learningPath,
  review,
  activityCount,
  hasVisual,
  moduleProgress,
  completedTasks,
  totalTasks,
  xpReward,
}: {
  learningPath: string[];
  review: NonNullable<SubjectModuleContent["review"]>;
  activityCount: number;
  hasVisual: boolean;
  moduleProgress: number;
  completedTasks: number;
  totalTasks: number;
  xpReward: number;
}) {
  const goals = learningPath.slice(0, 4);
  const tools = [
    {
      icon: <BookOpen className="h-4 w-4" />,
      title: "Resumo guiado",
      description: `${review.summary.length} pontos para revisar sem reler tudo.`,
    },
    {
      icon: <Target className="h-4 w-4" />,
      title: "Prática do conteúdo",
      description: `${formatQuestionCount(activityCount)} para treinar aplicação.`,
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      title: hasVisual ? "Mapa visual" : "Mapa mental",
      description: `${review.mentalMap.length} conexões para fixar o tema.`,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h4 className="text-base font-semibold text-foreground md:text-lg">O que você vai aprender</h4>
        <p className="text-sm text-muted-foreground">Objetivos práticos para sair da aula sabendo aplicar.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal, index) => (
          <div key={goal} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground">
              {index + 1}
            </span>
            <p className="text-sm font-medium leading-relaxed text-foreground">{goal}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.title} className="flex gap-3 rounded-xl border border-border bg-background p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
              {tool.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{tool.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
            </div>
          </div>
        ))}
        <div className="rounded-xl border border-border bg-background p-3">
          <p className="text-sm font-semibold text-foreground">Desempenho</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-card p-2">
              <strong className="block text-foreground">{moduleProgress}%</strong>
              <span className="text-xs text-muted-foreground">progresso</span>
            </div>
            <div className="rounded-lg bg-card p-2">
              <strong className="block text-foreground">{completedTasks}</strong>
              <span className="text-xs text-muted-foreground">feitas</span>
            </div>
            <div className="rounded-lg bg-card p-2">
              <strong className="block text-foreground">{Math.max(totalTasks - completedTasks, 0)}</strong>
              <span className="text-xs text-muted-foreground">restantes</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-3">
          <p className="text-sm font-semibold text-foreground">Recompensas</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-card px-2.5 py-1">+{xpReward} XP</span>
            <span className="rounded-full bg-card px-2.5 py-1">+1 aula</span>
            <span className="rounded-full bg-card px-2.5 py-1">sequência</span>
          </div>
        </div>
      </div>
    </section>
  );

}

function CourseCompleteSection({
  blocks,
  identity,
}: {
  blocks: CourseBlock[];
  identity: SubjectIdentity;
}) {
  if (blocks.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-base md:text-lg font-semibold text-foreground">Aprofundamento e aplicação</h4>
          <p className="text-sm text-muted-foreground">
            Camada de aprofundamento, prática ativa e revisão para estudar com sobra.
          </p>
        </div>
        <span className={`w-fit rounded-full ${identity.soft} px-3 py-1 text-xs font-medium ${identity.accent}`}>
          trilha longa
        </span>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {blocks.map((block, index) => (
          <article
            key={`${block.title}-${index}`}
            className={`rounded-2xl border ${identity.border} bg-card p-4 md:p-5`}
          >
            <div className="flex items-start gap-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${identity.soft} text-sm font-semibold ${identity.accent}`}>
                {index + 1}
              </span>
              <div>
                <span className={`rounded-full ${identity.soft} px-2.5 py-1 text-xs font-medium ${identity.accent}`}>
                  {block.label}
                </span>
                <h5 className="mt-2 font-semibold text-foreground">{block.title}</h5>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-background p-3">
                <p className="mb-3 text-sm font-semibold text-foreground">Tarefas de domínio</p>
                <div className="grid gap-2">
                  {block.tasks.map((task, taskIndex) => (
                    <div key={task} className="flex items-start gap-3 rounded-lg bg-muted/40 p-2">
                      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${identity.soft} text-xs font-semibold ${identity.accent}`}>
                        {taskIndex + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-foreground">{task}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ModuleVisual({
  visual,
  subjectName,
}: {
  visual: NonNullable<SubjectModuleContent["visual"]>;
  subjectName: string;
}) {
  const identity = getSubjectIdentity(subjectName);
  const isCustomChemistryVisual = subjectName === "Química";
  const isCustomMathVisual = subjectName === "Matemática";

  return (
    <section className="space-y-3">
      <h4 className="text-base md:text-lg font-semibold text-foreground">{identity.visualTitle}</h4>
      <div className={`rounded-xl border ${identity.border} bg-card p-4 md:p-5`}>
        <div className={`flex flex-col gap-5 ${isCustomChemistryVisual || isCustomMathVisual ? "" : "lg:flex-row lg:items-start"}`}>
          <div className={isCustomChemistryVisual || isCustomMathVisual ? "w-full" : "flex-1"}>
            {!isCustomMathVisual && (
              <>
                <p className={`text-sm font-medium ${identity.accent}`}>{visual.title}</p>
                <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">{visual.description}</p>
              </>
            )}
            <div className={isCustomMathVisual ? "mt-0" : "mt-4"}>
              <SubjectSignature subjectName={subjectName} nodes={visual.nodes} visualTitle={visual.title} />
            </div>
          </div>
          {!isCustomChemistryVisual && !isCustomMathVisual && (
          <div className="flex-1">
            <div className={`grid gap-2 ${visual.type === "function-graph" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
              {visual.nodes.map((node, index) => (
                <div key={node} className={`relative rounded-xl border ${identity.border} bg-background p-3 text-center text-sm font-medium text-foreground`}>
                  <span className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full ${identity.soft} text-xs ${identity.accent}`}>
                    {index + 1}
                  </span>
                  <p>{node}</p>
                </div>
              ))}
            </div>
            {visual.type === "function-graph" && (
              <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-gradient-to-tr from-primary/5 to-transparent p-4">
                <svg viewBox="0 0 520 150" className="h-36 w-full overflow-visible" role="img" aria-label="Gráfico de função crescente">
                  <line x1="48" y1="118" x2="486" y2="118" className="stroke-border" strokeWidth="2" />
                  <line x1="48" y1="118" x2="48" y2="18" className="stroke-border" strokeWidth="2" />
                  <line x1="72" y1="100" x2="462" y2="26" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="72" cy="100" r="5" className="fill-primary" />
                  <circle cx="230" cy="70" r="5" className="fill-primary" />
                  <circle cx="462" cy="26" r="5" className="fill-primary" />
                  <text x="58" y="137" className="fill-muted-foreground text-[11px]">x</text>
                  <text x="28" y="30" className="fill-muted-foreground text-[11px]">f(x)</text>
                  <text x="76" y="92" className="fill-primary text-[11px]">f(0)=3</text>
                  <text x="318" y="52" className="fill-primary text-[11px]">cresce 2 por passo</text>
                </svg>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SubjectSignature({
  subjectName,
  nodes,
  visualTitle,
}: {
  subjectName: string;
  nodes: string[];
  visualTitle?: string;
}) {
  if (subjectName === "História") {
    return <HistorySignature nodes={nodes} visualTitle={visualTitle ?? ""} />;
  }

  if (subjectName === "Biologia") {
    return <BiologySignature nodes={nodes} visualTitle={visualTitle ?? ""} />;
  }

  if (subjectName === "Português") {
    return <PortugueseSignature nodes={nodes} visualTitle={visualTitle ?? ""} />;
  }

  if (subjectName === "Literatura") {
    return <LiteratureSignature nodes={nodes} visualTitle={visualTitle ?? ""} />;
  }

  if (subjectName === "Física") {
    return <PhysicsSignature nodes={nodes} visualTitle={visualTitle ?? ""} />;
  }

  if (subjectName === "Matemática") {
    return <MathSignature nodes={nodes} visualTitle={visualTitle ?? ""} />;
  }

  if (subjectName === "Química") {
    return <ChemistrySignature nodes={nodes} visualTitle={visualTitle ?? ""} />;
  }

  if (subjectName === "Geografia") {
    return <GeographySignature nodes={nodes} visualTitle={visualTitle ?? ""} />;
  }

  return null;
}

function PortugueseSignature({ nodes, visualTitle }: { nodes: string[]; visualTitle: string }) {
  const context = normalizeWrittenAnswer(`${visualTitle} ${nodes.join(" ")}`);

  if (context.includes("sintaxe") || context.includes("sujeito") || context.includes("predicado")) {
    return <SyntaxSignature nodes={nodes} />;
  }

  if (context.includes("redacao") || context.includes("tese") || context.includes("argumento")) {
    return <WritingSignature nodes={nodes} />;
  }

  if (context.includes("interpretacao") || context.includes("texto") || context.includes("inferir")) {
    return <ReadingSignature nodes={nodes} />;
  }

  return <MorphologySignature nodes={nodes} />;
}

function SyntaxSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Termo", "Função", "Sujeito", "Predicado", "Complemento", "Sentido"];

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900 dark:bg-rose-950/20">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-rose-200 bg-background p-4 dark:border-rose-900">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Análise da oração</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl bg-rose-100 p-3 text-center text-sm font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-200">
              A leitura diária melhora a escrita.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-rose-200 bg-card p-3 dark:border-rose-900">
                <p className="text-xs uppercase tracking-wide text-rose-700 dark:text-rose-300">sujeito</p>
                <p className="mt-1 text-sm font-medium text-foreground">A leitura diária</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-card p-3 dark:border-rose-900">
                <p className="text-xs uppercase tracking-wide text-rose-700 dark:text-rose-300">predicado</p>
                <p className="mt-1 text-sm font-medium text-foreground">melhora a escrita</p>
              </div>
            </div>
          </div>
        </div>
        <PortugueseNodeGrid labels={labels} />
      </div>
    </div>
  );
}

function WritingSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Tema", "Tese", "Argumento", "Repertório", "Coesão", "Proposta"];

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900 dark:bg-rose-950/20">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-rose-200 bg-background p-4 dark:border-rose-900">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Arquitetura da redação</p>
          <div className="mt-4 space-y-2">
            {["Introdução: tema + tese", "Desenvolvimento: argumento + prova", "Conclusão: intervenção completa"].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-lg bg-card p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-semibold text-white">{index + 1}</span>
                <span className="text-sm font-medium text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {labels.map((label, index) => (
            <div key={label} className="rounded-xl border border-rose-200 bg-background p-3 dark:border-rose-900">
              <div className="mb-2 h-2 rounded-full bg-rose-100 dark:bg-rose-950">
                <div className="h-full rounded-full bg-rose-500" style={{ width: `${45 + index * 8}%` }} />
              </div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">clareza + evidência + progressão</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReadingSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Tema", "Tese", "Inferência", "Conectivo", "Tom", "Efeito"];

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900 dark:bg-rose-950/20">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-rose-200 bg-background p-4 dark:border-rose-900">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Leitura por camadas</p>
          <div className="mt-4 space-y-3">
            {["O que o texto diz", "Como ele organiza a ideia", "O que ele sugere sem dizer diretamente", "Qual efeito produz no leitor"].map((layer, index) => (
              <div key={layer} className="rounded-lg border border-rose-100 bg-card p-3 dark:border-rose-900">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">camada {index + 1}</span>
                <p className="mt-1 text-sm text-foreground">{layer}</p>
              </div>
            ))}
          </div>
        </div>
        <PortugueseNodeGrid labels={labels} />
      </div>
    </div>
  );
}

function MorphologySignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Substantivo", "Verbo", "Adjetivo", "Pronome", "Advérbio", "Contexto"];

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900 dark:bg-rose-950/20">
      <div className="grid gap-3 md:grid-cols-3">
        {labels.map((label, index) => (
          <div key={label} className="rounded-xl border border-rose-200 bg-background p-4 dark:border-rose-900">
            <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {index + 1}
            </span>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="mt-2 text-xs text-muted-foreground">classe gramatical + função no contexto</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortugueseNodeGrid({ labels }: { labels: string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {labels.map((label, index) => (
        <div key={label} className="rounded-xl border border-rose-200 bg-background p-3 text-center dark:border-rose-900">
          <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {index + 1}
          </span>
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

function HistorySignature({ nodes, visualTitle }: { nodes: string[]; visualTitle: string }) {
  const context = normalizeWrittenAnswer(`${visualTitle} ${nodes.join(" ")}`);

  if (context.includes("brasil") || context.includes("colonia") || context.includes("imperio")) {
    return <BrazilHistorySignature nodes={nodes} />;
  }

  if (context.includes("republica") || context.includes("ditadura") || context.includes("cidadania")) {
    return <RepublicHistorySignature nodes={nodes} />;
  }

  if (context.includes("revolucao") || context.includes("mundo") || context.includes("guerra")) {
    return <WorldHistorySignature nodes={nodes} />;
  }

  return <SocialProcessSignature nodes={nodes} />;
}

function BrazilHistorySignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Colonização", "Escravidão", "Economia", "Resistências", "Independência", "Império"];

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[230px] overflow-hidden rounded-xl border border-amber-200 bg-background p-4 dark:border-amber-900">
          <svg viewBox="0 0 430 230" className="h-[230px] w-full">
            <path d="M74 54 C116 28 176 38 202 78 C242 68 300 78 336 118 C360 146 344 184 296 194 C240 206 190 180 154 152 C116 162 70 144 58 108 C52 86 56 66 74 54Z" className="fill-amber-100 stroke-amber-600 dark:fill-amber-950" strokeWidth="3" />
            <path d="M92 132 C138 104 188 102 238 120 C282 136 318 130 356 104" fill="none" stroke="currentColor" strokeDasharray="7 6" strokeWidth="3" className="text-amber-700" />
            <circle cx="128" cy="108" r="10" className="fill-current text-red-500" />
            <circle cx="240" cy="124" r="10" className="fill-current text-red-500" />
            <circle cx="318" cy="112" r="10" className="fill-current text-red-500" />
            <text x="82" y="38" className="fill-foreground text-sm font-semibold">território + trabalho + poder</text>
            <text x="105" y="208" className="fill-muted-foreground text-xs">processos coloniais e permanências sociais</text>
          </svg>
        </div>
        <HistoryNodeGrid labels={labels} />
      </div>
    </div>
  );
}

function RepublicHistorySignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["República", "Oligarquias", "Populismo", "Ditadura", "Redemocratização", "Cidadania"];

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-amber-200 bg-background p-4 dark:border-amber-900">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Leitura institucional</p>
          <div className="mt-4 space-y-3">
            {["Estado", "Economia", "Participação", "Conflito social"].map((label, index) => (
              <div key={label} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-8 flex-1 rounded-lg bg-amber-100 dark:bg-amber-950" style={{ width: `${70 + index * 8}%` }} />
                <span className="w-28 text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative rounded-xl border border-amber-200 bg-background p-4 dark:border-amber-900">
          <div className="absolute left-8 right-8 top-1/2 h-1 rounded-full bg-amber-200 dark:bg-amber-900" />
          <div className="relative grid grid-cols-3 gap-3">
            {labels.map((label, index) => (
              <div key={label} className={`rounded-xl border border-amber-200 bg-card p-3 text-center text-sm font-medium text-foreground dark:border-amber-900 ${index % 2 ? "translate-y-10" : ""}`}>
                <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs text-white">{index + 1}</span>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorldHistorySignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Revoluções", "Capitalismo", "Imperialismo", "Guerras", "Guerra Fria", "Globalização"];

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20">
      <div className="grid gap-4 md:grid-cols-3">
        {labels.map((label, index) => (
          <div key={label} className="rounded-xl border border-amber-200 bg-background p-4 dark:border-amber-900">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                processo {index + 1}
              </span>
              <span className="h-2 w-10 rounded-full bg-amber-500" />
            </div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="mt-2 text-xs text-muted-foreground">causa → ruptura → consequência</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialProcessSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Causas", "Grupos sociais", "Interesses", "Conflitos", "Consequências", "Permanências"];

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20">
      <div className="relative rounded-xl border border-amber-200 bg-background p-4 dark:border-amber-900">
        <div className="grid gap-3 md:grid-cols-6">
          {labels.map((label, index) => (
            <div key={label} className="relative rounded-xl bg-card p-3 text-center">
              {index < labels.length - 1 && <span className="absolute -right-2 top-1/2 hidden h-px w-4 bg-amber-400 md:block" />}
              <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white">{index + 1}</span>
              <p className="text-sm font-medium text-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryNodeGrid({ labels }: { labels: string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {labels.map((label, index) => (
        <div key={label} className="rounded-xl border border-amber-200 bg-background p-3 text-center dark:border-amber-900">
          <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {index + 1}
          </span>
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

function LiteratureSignature({ nodes, visualTitle }: { nodes: string[]; visualTitle: string }) {
  const context = normalizeWrittenAnswer(`${visualTitle} ${nodes.join(" ")}`);

  if (context.includes("poesia") || context.includes("eu lirico") || context.includes("verso")) {
    return <PoetrySignature nodes={nodes} />;
  }

  if (context.includes("narrador") || context.includes("prosa") || context.includes("personagem")) {
    return <NarrativeSignature nodes={nodes} />;
  }

  if (context.includes("escola") || context.includes("movimento") || context.includes("modernismo")) {
    return <LiteraryMovementsSignature nodes={nodes} />;
  }

  return <LiteraryReadingSignature nodes={nodes} />;
}

function LiteraryMovementsSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Barroco", "Arcadismo", "Romantismo", "Realismo", "Modernismo", "Contemporâneo"];

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 dark:border-red-900 dark:bg-red-950/20">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative min-h-[230px] rounded-xl border border-red-200 bg-background p-4 dark:border-red-900">
          <div className="absolute bottom-8 left-10 top-8 w-1 rounded-full bg-red-200 dark:bg-red-900" />
          <div className="relative space-y-3">
            {labels.slice(0, 5).map((label, index) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <div className="rounded-lg border border-red-100 bg-card px-3 py-2 dark:border-red-900">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">contexto + forma + linguagem</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {labels.map((label, index) => (
            <div key={label} className="rounded-xl border border-red-200 bg-background p-3 text-center dark:border-red-900">
              <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                {index + 1}
              </span>
              <p className="text-sm font-medium text-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PoetrySignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Eu lírico", "Imagem", "Ritmo", "Metáfora", "Contraste", "Efeito"];

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 dark:border-red-900 dark:bg-red-950/20">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-red-200 bg-background p-5 font-serif dark:border-red-900">
          <p className="text-xs uppercase tracking-wide text-red-700 dark:text-red-300">Leitura do poema</p>
          <div className="mt-4 space-y-2 text-base text-foreground">
            <p>imagem abre sentido</p>
            <p className="pl-6">ritmo organiza a voz</p>
            <p className="pl-12">metáfora desloca o real</p>
            <p className="pl-6">silêncio também comunica</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {labels.map((label, index) => (
            <div key={label} className="rounded-xl border border-red-200 bg-background p-3 dark:border-red-900">
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">camada {index + 1}</span>
              <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NarrativeSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Narrador", "Personagem", "Espaço", "Tempo", "Conflito", "Crítica"];

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 dark:border-red-900 dark:bg-red-950/20">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[220px] rounded-xl border border-red-200 bg-background p-4 dark:border-red-900">
          <div className="absolute left-6 right-6 top-1/2 h-px bg-red-200 dark:bg-red-900" />
          <div className="relative grid h-full grid-cols-3 gap-3">
            {labels.slice(0, 6).map((label, index) => (
              <div key={label} className={`flex items-center justify-center rounded-xl border border-red-100 bg-card p-3 text-center text-sm font-medium text-foreground dark:border-red-900 ${index % 2 ? "translate-y-8" : ""}`}>
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-red-200 bg-background p-4 dark:border-red-900">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">Roteiro de leitura</p>
          <div className="mt-3 space-y-2">
            {["Quem narra?", "O que omite?", "Qual conflito?", "Que crítica aparece?"].map((item) => (
              <div key={item} className="rounded-lg bg-red-50 px-3 py-2 text-sm text-foreground dark:bg-red-950/30">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiteraryReadingSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Texto", "Contexto", "Forma", "Voz", "Imagem", "Efeito"];

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 dark:border-red-900 dark:bg-red-950/20">
      <div className="grid gap-3 md:grid-cols-3">
        {labels.map((label, index) => (
          <div key={label} className="rounded-xl border border-red-200 bg-background p-4 dark:border-red-900">
            <div className="mb-3 h-2 rounded-full bg-red-100 dark:bg-red-950">
              <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, 35 + index * 12)}%` }} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">camada {index + 1}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeographySignature({ nodes, visualTitle }: { nodes: string[]; visualTitle: string }) {
  const context = normalizeWrittenAnswer(`${visualTitle} ${nodes.join(" ")}`);

  if (context.includes("climatologia") || context.includes("clima") || context.includes("massa de ar")) {
    return <ClimateSignature nodes={nodes} />;
  }

  if (context.includes("cartografia") || context.includes("mapa") || context.includes("escala")) {
    return <CartographySignature nodes={nodes} />;
  }

  if (context.includes("urbanizacao") || context.includes("cidade") || context.includes("urbano")) {
    return <UrbanSignature nodes={nodes} />;
  }

  return <GeopoliticsSignature nodes={nodes} />;
}

function GeopoliticsSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Território", "Fronteiras", "Recursos", "Rotas", "Alianças", "Conflitos"];

  return (
    <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 dark:border-cyan-900 dark:bg-cyan-950/20">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[240px] overflow-hidden rounded-xl border border-cyan-200 bg-background p-4 dark:border-cyan-900">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:28px_28px] text-cyan-500" />
          <svg viewBox="0 0 430 240" className="relative h-[240px] w-full">
            <defs>
              <marker id="geoArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="fill-current text-cyan-700" />
              </marker>
            </defs>
            <path d="M70 70 C95 38 145 50 155 88 C198 78 224 104 205 138 C164 156 114 154 80 130 C54 112 48 92 70 70Z" className="fill-cyan-100 stroke-cyan-600 dark:fill-cyan-950" strokeWidth="3" />
            <path d="M250 68 C286 38 350 56 360 102 C392 118 378 168 332 176 C290 184 240 160 232 122 C225 96 232 80 250 68Z" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950" strokeWidth="3" />
            <path d="M160 112 C210 96 240 100 292 124" fill="none" stroke="currentColor" strokeWidth="4" markerEnd="url(#geoArrow)" className="text-cyan-700" />
            <path d="M96 154 C158 204 252 212 326 178" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="7 6" className="text-violet-600" />
            <circle cx="126" cy="96" r="9" className="fill-current text-orange-500" />
            <circle cx="300" cy="118" r="9" className="fill-current text-orange-500" />
            <text x="92" y="44" className="fill-foreground text-sm font-semibold">poder + espaço</text>
            <text x="232" y="216" className="fill-muted-foreground text-xs">rotas, fronteiras e recursos</text>
          </svg>
        </div>

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="rounded-xl border border-cyan-200 bg-background p-3 dark:border-cyan-900">
              <p className="text-xs font-semibold uppercase text-cyan-700 dark:text-cyan-300">Camada {index + 1}</p>
              <p className="text-sm font-medium text-foreground">{node}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClimateSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Latitude", "Altitude", "Massas de ar", "Chuva", "Pressão", "Vegetação"];

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/20">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="relative min-h-[240px] overflow-hidden rounded-xl border border-sky-200 bg-background p-4 dark:border-sky-900">
          <div className="absolute left-8 top-8 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            Sol
          </div>
          <div className="absolute bottom-8 left-6 right-6 h-12 rounded-[50%] bg-emerald-200 dark:bg-emerald-900" />
          <div className="absolute bottom-16 left-[25%] h-28 w-28 rounded-t-full bg-stone-200 dark:bg-stone-800" />
          <div className="absolute bottom-16 right-[18%] h-20 w-40 rounded-t-full bg-sky-100 dark:bg-sky-950" />
          <svg viewBox="0 0 420 230" className="absolute inset-0 h-full w-full">
            <path d="M70 86 C126 48 168 62 214 92 C260 122 304 110 360 76" fill="none" stroke="currentColor" strokeWidth="4" className="text-sky-600" />
            <path d="M92 132 C142 100 192 112 232 142 C274 172 322 150 366 130" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 7" className="text-violet-600" />
            {[140, 170, 202, 318, 348].map((x, index) => (
              <line key={index} x1={x} y1={72 + (index % 2) * 24} x2={x - 12} y2={112 + (index % 2) * 24} stroke="currentColor" strokeWidth="3" className="text-sky-500" />
            ))}
          </svg>
        </div>

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="flex items-center justify-between rounded-xl border border-sky-200 bg-background p-3 dark:border-sky-900">
              <span className="text-sm font-medium text-foreground">{node}</span>
              <span className="h-2 w-12 rounded-full bg-sky-500/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CartographySignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Escala", "Legenda", "Coordenadas", "Projeção", "Orientação", "Tema"];

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[240px] overflow-hidden rounded-xl border border-indigo-200 bg-background p-4 dark:border-indigo-900">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px] text-indigo-300" />
          <svg viewBox="0 0 430 240" className="relative h-[240px] w-full">
            <path d="M80 72 L156 48 L228 72 L320 44 L360 96 L332 166 L236 190 L168 162 L80 180 Z" fill="none" stroke="currentColor" strokeWidth="4" className="text-indigo-600" />
            <path d="M156 48 L168 162 M228 72 L236 190 M320 44 L332 166" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-indigo-300" />
            <circle cx="132" cy="112" r="7" className="fill-current text-orange-500" />
            <circle cx="262" cy="124" r="7" className="fill-current text-emerald-500" />
            <circle cx="312" cy="82" r="7" className="fill-current text-violet-500" />
            <rect x="70" y="202" width="108" height="10" rx="5" className="fill-current text-foreground" />
            <rect x="70" y="202" width="54" height="10" rx="5" className="fill-current text-indigo-500" />
            <text x="70" y="226" className="fill-muted-foreground text-xs">escala gráfica</text>
            <text x="280" y="210" className="fill-foreground text-sm font-semibold">N ↑</text>
          </svg>
        </div>

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="rounded-xl border border-indigo-200 bg-background p-3 dark:border-indigo-900">
              <p className="text-xs font-semibold uppercase text-indigo-700 dark:text-indigo-300">Leitura {index + 1}</p>
              <p className="text-sm font-medium text-foreground">{node}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UrbanSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Centro", "Periferia", "Transporte", "Moradia", "Saneamento", "Segregação"];

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900 dark:bg-rose-950/20">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[240px] overflow-hidden rounded-xl border border-rose-200 bg-background p-4 dark:border-rose-900">
          <div className="absolute bottom-8 left-8 right-8 h-4 rounded-full bg-muted" />
          <div className="absolute bottom-12 left-12 h-28 w-12 rounded-t-lg bg-rose-300 dark:bg-rose-900" />
          <div className="absolute bottom-12 left-32 h-40 w-14 rounded-t-lg bg-violet-300 dark:bg-violet-900" />
          <div className="absolute bottom-12 left-56 h-24 w-16 rounded-t-lg bg-cyan-300 dark:bg-cyan-900" />
          <div className="absolute bottom-12 right-20 h-32 w-20 rounded-t-lg bg-amber-300 dark:bg-amber-900" />
          <svg viewBox="0 0 430 240" className="absolute inset-0 h-full w-full">
            <path d="M70 190 C140 152 204 154 272 122 C314 102 346 76 380 46" fill="none" stroke="currentColor" strokeWidth="4" className="text-rose-600" />
            <path d="M88 78 C150 120 204 106 260 82 C306 62 342 70 372 112" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="7 7" className="text-violet-600" />
            <text x="70" y="36" className="fill-foreground text-sm font-semibold">fluxos urbanos</text>
            <text x="244" y="218" className="fill-muted-foreground text-xs">cidade desigual + redes</text>
          </svg>
        </div>

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="flex items-center gap-3 rounded-xl border border-rose-200 bg-background p-3 dark:border-rose-900">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{node}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MathSignature({ nodes, visualTitle }: { nodes: string[]; visualTitle: string }) {
  const context = normalizeWrittenAnswer(`${visualTitle} ${nodes.join(" ")}`);

  if (context.includes("geometria") || context.includes("area") || context.includes("triangulo")) {
    return <GeometrySignature nodes={nodes} />;
  }

  if (context.includes("estatistica") || context.includes("media") || context.includes("dados")) {
    return <StatisticsSignature nodes={nodes} />;
  }

  if (context.includes("trigonometria") || context.includes("seno") || context.includes("cosseno")) {
    return <TrigonometrySignature nodes={nodes} />;
  }

  return <FunctionSignature nodes={nodes} />;
}

function FunctionSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Entrada x", "Regra", "Saída f(x)", "Tabela", "Gráfico", "Interpretação"];

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(520px,1.25fr)_minmax(280px,0.75fr)]">
        <div className="rounded-xl border border-border bg-card p-4">
          <svg viewBox="0 0 520 300" className="h-[300px] w-full" role="img" aria-label="Funções e formas geométricas">
            <defs>
              <marker id="mathArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="fill-current text-primary" />
              </marker>
            </defs>
            <rect x="20" y="18" width="480" height="264" rx="18" className="fill-muted/20" />
            <line x1="56" y1="214" x2="286" y2="214" stroke="currentColor" strokeWidth="2" markerEnd="url(#mathArrow)" className="text-muted-foreground" />
            <line x1="72" y1="232" x2="72" y2="52" stroke="currentColor" strokeWidth="2" markerEnd="url(#mathArrow)" className="text-muted-foreground" />
            <path d="M82 188 L128 164 L174 140 L220 116 L266 92" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" />
            <path d="M84 184 C126 70 206 70 270 184" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="7 7" className="text-muted-foreground" />
            {[82, 128, 174, 220, 266].map((x, index) => (
              <circle key={x} cx={x} cy={188 - index * 24} r="5" className="fill-current text-primary" />
            ))}
            <rect x="332" y="54" width="72" height="54" rx="8" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" />
            <text x="328" y="132" className="fill-muted-foreground text-[10px]">retângulo</text>
            <polygon points="430,110 470,54 504,110" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" />
            <line x1="470" y1="54" x2="470" y2="110" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" className="text-muted-foreground" />
            <text x="430" y="132" className="fill-muted-foreground text-[10px]">triângulo</text>
            <circle cx="370" cy="190" r="35" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" />
            <line x1="370" y1="190" x2="405" y2="190" stroke="currentColor" strokeWidth="3" className="text-primary" />
            <text x="410" y="196" className="fill-muted-foreground text-[10px]">raio</text>
            <path d="M440 184 L490 184 L490 232" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" />
            <text x="438" y="172" className="fill-muted-foreground text-[10px]">90°</text>
          </svg>
          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <span className="rounded-lg bg-background px-3 py-2">Função afim: f(x)=ax+b</span>
            <span className="rounded-lg bg-background px-3 py-2">Quadrática: ax²+bx+c</span>
            <span className="rounded-lg bg-background px-3 py-2">Áreas: b.h, b.h/2, πr²</span>
            <span className="rounded-lg bg-background px-3 py-2">Pitágoras: a²=b²+c²</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{node}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GeometrySignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 5) : ["Figura", "Medidas", "Perímetro", "Área", "Semelhança"];

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(480px,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-xl border border-border bg-card p-4">
          <svg viewBox="0 0 420 230" className="h-[250px] w-full">
            <rect x="34" y="42" width="112" height="78" rx="8" fill="none" stroke="currentColor" strokeWidth="4" className="text-cyan-600" />
            <text x="70" y="138" className="fill-muted-foreground text-xs">base x altura</text>
            <polygon points="205,122 260,42 330,122" fill="none" stroke="currentColor" strokeWidth="4" className="text-indigo-600" />
            <line x1="260" y1="42" x2="260" y2="122" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" className="text-muted-foreground" />
            <text x="226" y="146" className="fill-muted-foreground text-xs">metade do retângulo</text>
            <circle cx="104" cy="184" r="32" fill="none" stroke="currentColor" strokeWidth="4" className="text-violet-600" />
            <line x1="104" y1="184" x2="136" y2="184" stroke="currentColor" strokeWidth="3" className="text-violet-600" />
            <text x="150" y="190" className="fill-muted-foreground text-xs">raio</text>
            <path d="M260 178 L330 178 L330 208" fill="none" stroke="currentColor" strokeWidth="4" className="text-emerald-600" />
            <text x="252" y="166" className="fill-muted-foreground text-xs">Pitágoras</text>
          </svg>
        </div>

        <div className="grid auto-rows-fr gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs font-semibold uppercase text-primary">Passo {index + 1}</p>
              <p className="text-sm font-medium text-foreground">{node}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatisticsSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 5) : ["Coleta", "Tabela", "Média", "Mediana", "Interpretação"];
  const bars = [46, 88, 62, 116, 74, 132];

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-emerald-200 bg-background p-4 dark:border-emerald-900">
          <div className="flex h-[220px] items-end gap-3 border-b border-l border-muted px-4 pb-4">
            {bars.map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-emerald-500/80" style={{ height }} />
                <span className="text-[11px] text-muted-foreground">{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-emerald-100 p-2 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">média</div>
            <div className="rounded-lg bg-indigo-100 p-2 font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">mediana</div>
            <div className="rounded-lg bg-violet-100 p-2 font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-200">desvio</div>
          </div>
        </div>

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="flex items-center justify-between rounded-xl border border-emerald-200 bg-background p-3 dark:border-emerald-900">
              <span className="text-sm font-medium text-foreground">{node}</span>
              <span className="h-2 w-12 rounded-full bg-emerald-500/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrigonometrySignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 5) : ["Ângulo", "Cateto oposto", "Cateto adjacente", "Hipotenusa", "Razões"];

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(520px,1.25fr)_minmax(320px,0.75fr)]">
        <div className="rounded-xl border border-border bg-card p-4">
          <svg viewBox="0 0 420 230" className="h-[250px] w-full">
            <polygon points="70,178 330,178 330,48" fill="none" stroke="currentColor" strokeWidth="5" className="text-amber-600" />
            <path d="M94 178 A24 24 0 0 1 111 161" fill="none" stroke="currentColor" strokeWidth="3" className="text-violet-600" />
            <rect x="306" y="154" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
            <text x="108" y="164" className="fill-violet-700 text-sm font-bold dark:fill-violet-300">Î¸</text>
            <text x="170" y="198" className="fill-foreground text-sm font-semibold">cateto adjacente</text>
            <text x="338" y="118" className="fill-foreground text-sm font-semibold">oposto</text>
            <text x="184" y="92" className="fill-foreground text-sm font-semibold">hipotenusa</text>
            <line x1="80" y1="207" x2="340" y2="207" stroke="currentColor" strokeWidth="2" className="text-amber-300" />
            <text x="74" y="28" className="fill-foreground text-sm font-semibold">sen = oposto / hipotenusa</text>
            <text x="74" y="48" className="fill-foreground text-sm font-semibold">cos = adjacente / hipotenusa</text>
            <text x="74" y="68" className="fill-foreground text-sm font-semibold">tg = oposto / adjacente</text>
          </svg>
        </div>

        <div className="grid auto-rows-fr gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs font-semibold uppercase text-primary">Conceito {index + 1}</p>
              <p className="text-sm font-medium text-foreground">{node}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BiologySignature({ nodes, visualTitle }: { nodes: string[]; visualTitle: string }) {
  const context = normalizeWrittenAnswer(`${visualTitle} ${nodes.join(" ")}`);

  if (context.includes("citologia") || context.includes("celula") || context.includes("membrana")) {
    return <CellSignature nodes={nodes} />;
  }

  if (context.includes("genetica") || context.includes("dna") || context.includes("heranca")) {
    return <GeneticsSignature nodes={nodes} />;
  }

  if (context.includes("ecologia") || context.includes("ecossistema") || context.includes("energia")) {
    return <EcologySignature nodes={nodes} />;
  }

  return <EvolutionSignature nodes={nodes} />;
}

function CellSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Membrana", "Núcleo", "DNA", "Mitocôndria", "Ribossomo", "Cloroplasto"];

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[220px] rounded-[40%] border-2 border-emerald-300 bg-gradient-to-br from-emerald-100 to-cyan-50 p-6 dark:border-emerald-800 dark:from-emerald-950/80 dark:to-cyan-950/30">
          <div className="absolute left-[35%] top-[27%] flex h-20 w-24 items-center justify-center rounded-full border border-violet-300 bg-violet-100 text-xs font-bold text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200">
            Núcleo
          </div>
          <div className="absolute left-[17%] top-[58%] h-8 w-16 rounded-full border border-orange-300 bg-orange-100 dark:border-orange-800 dark:bg-orange-950">
            <span className="absolute left-3 top-3 h-px w-10 bg-orange-500" />
            <span className="absolute left-3 top-5 h-px w-10 bg-orange-500" />
          </div>
          <div className="absolute right-[16%] top-[23%] grid grid-cols-2 gap-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className="h-2 w-2 rounded-full bg-emerald-500" />
            ))}
          </div>
          <div className="absolute bottom-5 right-8 rounded-full border border-lime-300 bg-lime-100 px-3 py-2 text-[11px] font-semibold text-lime-800 dark:border-lime-800 dark:bg-lime-950 dark:text-lime-200">
            cloroplasto
          </div>
          <div className="absolute inset-x-6 bottom-3 h-1 rounded-full bg-emerald-300/80 dark:bg-emerald-800" />
        </div>

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-background p-3 dark:border-emerald-900">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{node}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GeneticsSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 5) : ["DNA", "Gene", "Alelos", "Cromossomos", "Fenótipo"];

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/20">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <svg viewBox="0 0 360 210" className="min-h-[210px] w-full rounded-xl border border-sky-200 bg-background dark:border-sky-900">
          <path d="M95 20 C255 55 95 155 255 190" fill="none" stroke="currentColor" strokeWidth="4" className="text-sky-600" />
          <path d="M255 20 C95 55 255 155 95 190" fill="none" stroke="currentColor" strokeWidth="4" className="text-violet-600" />
          {Array.from({ length: 8 }).map((_, index) => {
            const y = 34 + index * 20;
            const x1 = index % 2 === 0 ? 112 : 135;
            const x2 = 360 - x1;
            return (
              <line
                key={index}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="currentColor"
                strokeWidth="3"
                className="text-sky-300 dark:text-sky-800"
              />
            );
          })}
          <text x="130" y="112" className="fill-foreground text-sm font-semibold">DNA</text>
          <text x="204" y="112" className="fill-muted-foreground text-xs">informação hereditária</text>
        </svg>

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="rounded-xl border border-sky-200 bg-background p-3 dark:border-sky-900">
              <p className="text-xs font-semibold uppercase text-sky-700 dark:text-sky-300">Etapa {index + 1}</p>
              <p className="text-sm font-medium text-foreground">{node}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EcologySignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Sol", "Produtores", "Consumidores", "Decompositores", "Matéria", "Energia"];

  return (
    <div className="rounded-xl border border-lime-200 bg-lime-50/70 p-4 dark:border-lime-900 dark:bg-lime-950/20">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="relative min-h-[220px] overflow-hidden rounded-xl border border-lime-200 bg-background p-4 dark:border-lime-900">
          <div className="absolute left-5 top-5 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            Sol
          </div>
          <div className="absolute bottom-6 left-8 right-8 h-10 rounded-[50%] bg-lime-200 dark:bg-lime-900" />
          <div className="absolute bottom-14 left-[25%] h-20 w-6 rounded-full bg-emerald-600" />
          <div className="absolute bottom-28 left-[18%] h-10 w-24 rounded-[50%] bg-emerald-400" />
          <div className="absolute bottom-24 right-[22%] h-12 w-20 rounded-full border border-orange-300 bg-orange-100 dark:border-orange-800 dark:bg-orange-950" />
          <svg viewBox="0 0 260 180" className="absolute inset-8 h-[160px] w-[240px]">
            <defs>
              <marker id="ecoArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="fill-current text-lime-600" />
              </marker>
            </defs>
            <path d="M50 40 C100 60 130 80 165 118" fill="none" stroke="currentColor" strokeWidth="3" markerEnd="url(#ecoArrow)" className="text-lime-600" />
            <path d="M180 126 C145 152 98 150 64 116" fill="none" stroke="currentColor" strokeWidth="3" markerEnd="url(#ecoArrow)" className="text-lime-600" />
          </svg>
        </div>

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="flex items-center justify-between rounded-xl border border-lime-200 bg-background p-3 dark:border-lime-900">
              <span className="text-sm font-medium text-foreground">{node}</span>
              <span className="h-2 w-12 rounded-full bg-lime-500/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvolutionSignature({ nodes }: { nodes: string[] }) {
  const labels = nodes.length ? nodes.slice(0, 6) : ["Variação", "Ambiente", "Seleção", "Reprodução", "Frequência gênica", "Adaptação"];

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20">
      <div className="relative">
        <div className="absolute left-5 right-5 top-8 h-px bg-amber-300 dark:bg-amber-800" />
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="relative rounded-xl border border-amber-200 bg-background p-3 text-center dark:border-amber-900">
              <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                {index + 1}
              </span>
              <p className="text-xs font-semibold text-foreground">{node}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-amber-200 bg-background/70 p-3 text-sm text-muted-foreground dark:border-amber-900">
        Populações mudam quando variações hereditárias interagem com ambiente, reprodução diferencial e tempo.
      </div>
    </div>
  );
}

function PhysicsSignature({ nodes, visualTitle }: { nodes: string[]; visualTitle: string }) {
  const context = normalizeWrittenAnswer(`${visualTitle} ${nodes.join(" ")}`);

  if (context.includes("energia")) {
    return <MechanicalEnergySignature nodes={nodes} />;
  }

  if (context.includes("eletrostatica") || context.includes("carga") || context.includes("campo")) {
    return <ElectrostaticsSignature nodes={nodes} />;
  }

  if (context.includes("optica") || context.includes("luz") || context.includes("espelho") || context.includes("lente")) {
    return <OpticsSignature nodes={nodes} />;
  }

  return <NewtonSignature nodes={nodes} />;
}

function NewtonSignature({ nodes }: { nodes: string[] }) {
  return (
    <div className="grid gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/20 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Diagrama de forças
        </p>
        <svg viewBox="0 0 460 240" className="mt-3 h-56 w-full" role="img" aria-label="Bloco com forcas aplicadas">
          <rect x="180" y="92" width="100" height="62" rx="10" className="fill-sky-100 stroke-sky-400 dark:fill-sky-950" strokeWidth="3" />
          <text x="215" y="128" className="fill-foreground text-[16px] font-bold">m</text>
          <line x1="230" y1="90" x2="230" y2="32" className="stroke-sky-600" strokeWidth="4" markerEnd="url(#arrowPhysics)" />
          <line x1="230" y1="156" x2="230" y2="214" className="stroke-sky-600" strokeWidth="4" markerEnd="url(#arrowPhysics)" />
          <line x1="282" y1="123" x2="382" y2="123" className="stroke-purple-600" strokeWidth="4" markerEnd="url(#arrowPhysics)" />
          <line x1="178" y1="123" x2="96" y2="123" className="stroke-amber-500" strokeWidth="4" markerEnd="url(#arrowPhysics)" />
          <defs>
            <marker id="arrowPhysics" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-current text-sky-600" />
            </marker>
          </defs>
          <text x="238" y="52" className="fill-sky-700 text-[13px]">normal</text>
          <text x="238" y="204" className="fill-sky-700 text-[13px]">peso</text>
          <text x="308" y="111" className="fill-purple-700 text-[13px]">força aplicada</text>
          <text x="92" y="111" className="fill-amber-600 text-[13px]">atrito</text>
        </svg>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Leitura do movimento
        </p>
        <div className="mt-4 space-y-2">
          {["força resultante", "massa", "aceleração", "F = m · a"].map((rule, index) => (
            <div key={rule} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{rule}</span>
            </div>
          ))}
        </div>
      </div>

      <PhysicsReadingChips labels={nodes} />
    </div>
  );
}

function MechanicalEnergySignature({ nodes }: { nodes: string[] }) {
  return (
    <div className="grid gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/20 xl:grid-cols-[1fr_1fr]">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Conversão de energia
        </p>
        <svg viewBox="0 0 460 220" className="mt-3 h-52 w-full" role="img" aria-label="Rampa com energia potencial e cinetica">
          <path d="M60 170 L390 170 L390 70 Z" className="fill-sky-100 stroke-sky-400 dark:fill-sky-950" strokeWidth="3" />
          <circle cx="330" cy="88" r="18" className="fill-purple-500" />
          <circle cx="142" cy="145" r="18" className="fill-purple-500/70" />
          <line x1="330" y1="106" x2="330" y2="170" className="stroke-green-500" strokeWidth="3" strokeDasharray="6 5" />
          <text x="286" y="62" className="fill-foreground text-[13px]">Ep alta</text>
          <text x="98" y="126" className="fill-foreground text-[13px]">Ec maior</text>
          <text x="196" y="194" className="fill-muted-foreground text-[12px]">sem perdas: Em = Ep + Ec</text>
        </svg>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Conservação
        </p>
        <div className="mt-4 grid gap-3">
          <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
            <strong>Energia potencial:</strong> depende da altura e da posição no campo gravitacional.
          </div>
          <div className="rounded-lg bg-purple-100 p-3 text-sm text-purple-800 dark:bg-purple-950 dark:text-purple-200">
            <strong>Energia cinética:</strong> depende da massa e da velocidade.
          </div>
          <div className="rounded-lg bg-amber-100 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <strong>Com atrito:</strong> parte da energia mecânica vira energia térmica.
          </div>
        </div>
      </div>

      <PhysicsReadingChips labels={nodes} />
    </div>
  );
}

function ElectrostaticsSignature({ nodes }: { nodes: string[] }) {
  return (
    <div className="grid gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/20 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Interação entre cargas
        </p>
        <div className="mt-6 flex items-center justify-center gap-8">
          <ChargeBadge label="+" tone="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl text-rose-500">← →</span>
            <span className="text-[11px] text-muted-foreground">repulsão</span>
          </div>
          <ChargeBadge label="+" tone="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200" />
        </div>
        <div className="mt-6 flex items-center justify-center gap-8">
          <ChargeBadge label="+" tone="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl text-green-500">→ ←</span>
            <span className="text-[11px] text-muted-foreground">atração</span>
          </div>
          <ChargeBadge label="-" tone="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Lei de Coulomb
        </p>
        <div className="mt-4 rounded-xl bg-sky-100 p-4 text-center text-xl font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-200">
          F = k · |q1 · q2| / d²
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          A força cresce com as cargas e diminui rapidamente quando a distância aumenta.
        </p>
      </div>

      <PhysicsReadingChips labels={nodes} />
    </div>
  );
}

function OpticsSignature({ nodes }: { nodes: string[] }) {
  return (
    <div className="grid gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/20 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Raios de luz
        </p>
        <svg viewBox="0 0 460 220" className="mt-3 h-52 w-full" role="img" aria-label="Raios de luz refletindo em espelho plano">
          <line x1="250" y1="30" x2="250" y2="190" className="stroke-border" strokeWidth="6" />
          <line x1="250" y1="110" x2="420" y2="110" className="stroke-dashed stroke-muted-foreground" strokeWidth="2" strokeDasharray="7 6" />
          <line x1="80" y1="48" x2="250" y2="110" className="stroke-amber-500" strokeWidth="4" markerEnd="url(#arrowLight)" />
          <line x1="250" y1="110" x2="82" y2="172" className="stroke-amber-500" strokeWidth="4" markerEnd="url(#arrowLight)" />
          <defs>
            <marker id="arrowLight" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-amber-500" />
            </marker>
          </defs>
          <text x="90" y="40" className="fill-foreground text-[12px]">incidente</text>
          <text x="88" y="192" className="fill-foreground text-[12px]">refletido</text>
          <text x="286" y="102" className="fill-muted-foreground text-[12px]">normal</text>
        </svg>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Regras visuais
        </p>
        <div className="mt-4 space-y-2">
          {["raio incidente", "normal", "raio refletido", "ângulos iguais"].map((rule, index) => (
            <div key={rule} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{rule}</span>
            </div>
          ))}
        </div>
      </div>

      <PhysicsReadingChips labels={nodes} />
    </div>
  );
}

function ChargeBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <div className={`flex h-16 w-16 items-center justify-center rounded-full border border-border text-2xl font-bold shadow-sm ${tone}`}>
      {label}
    </div>
  );
}

function PhysicsReadingChips({ labels }: { labels: string[] }) {
  return (
    <div className="rounded-xl border border-sky-200 bg-background/80 p-3 xl:col-span-3 dark:border-sky-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
        Roteiro de leitura
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {labels.slice(0, 6).map((label) => (
          <span key={label} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChemistrySignature({ nodes, visualTitle }: { nodes: string[]; visualTitle: string }) {
  const context = normalizeWrittenAnswer(`${visualTitle} ${nodes.join(" ")}`);

  if (context.includes("estequiometria") || context.includes("mol") || context.includes("receita")) {
    return <StoichiometrySignature nodes={nodes} />;
  }

  if (context.includes("termoquimica") || context.includes("entalpia") || context.includes("hess")) {
    return <ThermochemistrySignature nodes={nodes} />;
  }

  if (context.includes("eletroquimica") || context.includes("oxidacao") || context.includes("pilha") || context.includes("eletrolise")) {
    return <ElectrochemistrySignature nodes={nodes} />;
  }

  const labels = nodes.length > 0 ? nodes : ["Ligação iônica", "Ligação covalente", "Ligação metálica"];

  return (
    <div className="grid gap-3 rounded-xl border border-purple-200 bg-purple-50/70 p-4 dark:border-purple-900 dark:bg-purple-950/20 xl:grid-cols-3">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
          Ligação iônica
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <AtomBadge label="Na" charge="+" tone="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg text-purple-600">e-</span>
            <span className="h-px w-14 bg-purple-300" />
            <span className="text-[11px] text-muted-foreground">transferência</span>
          </div>
          <AtomBadge label="Cl" charge="-" tone="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Metal perde elétron, ametal recebe. A atração entre íons forma um retículo.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
          Ligação covalente
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <AtomBadge label="H" tone="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" />
          <SharedPair />
          <AtomBadge label="O" tone="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" />
          <SharedPair />
          <AtomBadge label="H" tone="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Átomos compartilham pares de elétrons. A geometria decide polaridade e propriedades.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
          Ligação metálica
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="relative flex h-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              M+
              {index % 3 === 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[9px] text-white">
                  e-
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Cátions organizados e elétrons móveis explicam brilho, maleabilidade e condução.
        </p>
      </div>

      <div className="rounded-xl border border-purple-200 bg-background/80 p-3 xl:col-span-3 dark:border-purple-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
          Roteiro de leitura
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {labels.slice(0, 6).map((label) => (
            <span key={label} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StoichiometrySignature({ nodes }: { nodes: string[] }) {
  return (
    <div className="grid gap-3 rounded-xl border border-purple-200 bg-purple-50/70 p-4 dark:border-purple-900 dark:bg-purple-950/20 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
          Receita da reação
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-5 sm:items-center">
          <StoichBox title="2 H2" subtitle="reagente" />
          <span className="text-center text-xl font-bold text-purple-500">+</span>
          <StoichBox title="O2" subtitle="reagente" />
          <span className="text-center text-xl font-bold text-purple-500">→</span>
          <StoichBox title="2 H2O" subtitle="produto" />
        </div>
        <div className="mt-4 rounded-lg bg-purple-100/80 p-3 text-sm text-purple-800 dark:bg-purple-950 dark:text-purple-200">
          Proporção em mol: 2 : 1 : 2. Primeiro converta para mol, depois use a proporção.
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
          Fluxo de cálculo
        </p>
        <div className="mt-4 space-y-2">
          {["massa", "mol", "proporção", "unidade final"].map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <ReadingChips labels={nodes} />
    </div>
  );
}

function ThermochemistrySignature({ nodes }: { nodes: string[] }) {
  return (
    <div className="grid gap-3 rounded-xl border border-purple-200 bg-purple-50/70 p-4 dark:border-purple-900 dark:bg-purple-950/20 xl:grid-cols-2">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
          Diagrama de energia
        </p>
        <svg viewBox="0 0 420 210" className="mt-3 h-52 w-full" role="img" aria-label="Diagrama de energia exotérmica e endotérmica">
          <line x1="42" y1="180" x2="390" y2="180" className="stroke-border" strokeWidth="2" />
          <line x1="42" y1="180" x2="42" y2="28" className="stroke-border" strokeWidth="2" />
          <text x="16" y="34" className="fill-muted-foreground text-[12px]">H</text>
          <path d="M70 70 C140 24, 210 24, 280 130 L360 130" fill="none" className="stroke-purple-600" strokeWidth="4" strokeLinecap="round" />
          <line x1="70" y1="70" x2="125" y2="70" className="stroke-purple-300" strokeWidth="3" />
          <line x1="280" y1="130" x2="360" y2="130" className="stroke-purple-300" strokeWidth="3" />
          <text x="70" y="58" className="fill-foreground text-[12px]">reagentes</text>
          <text x="286" y="150" className="fill-foreground text-[12px]">produtos</text>
          <line x1="250" y1="74" x2="250" y2="128" className="stroke-green-500" strokeWidth="3" markerEnd="url(#arrowDown)" />
          <defs>
            <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-green-500" />
            </marker>
          </defs>
          <text x="258" y="105" className="fill-green-600 text-[12px]">Î”H &lt; 0</text>
        </svg>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
          Sinais e interpretação
        </p>
        <div className="mt-4 grid gap-3">
          <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
            <strong>Exotérmica:</strong> libera calor, produtos com menor entalpia, Î”H negativo.
          </div>
          <div className="rounded-lg bg-amber-100 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <strong>Endotérmica:</strong> absorve calor, produtos com maior entalpia, Î”H positivo.
          </div>
          <div className="rounded-lg bg-purple-100 p-3 text-sm text-purple-800 dark:bg-purple-950 dark:text-purple-200">
            <strong>Lei de Hess:</strong> some caminhos equivalentes e ajuste o Î”H junto com a equação.
          </div>
        </div>
      </div>

      <ReadingChips labels={nodes} />
    </div>
  );
}

function ElectrochemistrySignature({ nodes }: { nodes: string[] }) {
  return (
    <div className="grid gap-3 rounded-xl border border-purple-200 bg-purple-50/70 p-4 dark:border-purple-900 dark:bg-purple-950/20 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
          Pilha Zn/Cu
        </p>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Electrode label="Zn" subtitle="ânodo | oxidação" tone="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white">e- →</span>
            <div className="h-16 w-12 rounded-t-full border-4 border-purple-300 border-b-0" />
            <span className="text-[11px] text-muted-foreground">ponte salina</span>
          </div>
          <Electrode label="Cu" subtitle="cátodo | redução" tone="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Elétrons saem do ânodo e chegam ao cátodo pelo circuito externo.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
          Regras fixas
        </p>
        <div className="mt-4 space-y-2">
          {["oxidação = perde elétrons", "redução = ganha elétrons", "ânodo oxida", "cátodo reduz"].map((rule) => (
            <div key={rule} className="rounded-lg bg-muted/50 p-3 text-sm font-medium text-foreground">
              {rule}
            </div>
          ))}
        </div>
      </div>

      <ReadingChips labels={nodes} />
    </div>
  );
}

function StoichBox({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-center dark:border-purple-900 dark:bg-purple-950/30">
      <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{title}</p>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Electrode({ label, subtitle, tone }: { label: string; subtitle: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
      <div className={`mx-auto flex h-20 w-12 items-center justify-center rounded-lg text-lg font-bold ${tone}`}>
        {label}
      </div>
      <p className="mt-3 text-xs font-medium text-foreground">{subtitle}</p>
    </div>
  );
}

function ReadingChips({ labels }: { labels: string[] }) {
  return (
    <div className="rounded-xl border border-purple-200 bg-background/80 p-3 xl:col-span-3 dark:border-purple-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
        Roteiro de leitura
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {labels.slice(0, 6).map((label) => (
          <span key={label} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function AtomBadge({
  label,
  charge,
  tone,
}: {
  label: string;
  charge?: string;
  tone: string;
}) {
  return (
    <div className={`relative flex h-14 w-14 items-center justify-center rounded-full border border-border text-base font-bold ${tone}`}>
      {label}
      {charge && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs shadow-sm">
          {charge}
        </span>
      )}
    </div>
  );
}

function SharedPair() {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-purple-500" />
        <span className="h-2 w-2 rounded-full bg-purple-500" />
      </div>
      <span className="h-px w-8 bg-purple-300" />
    </div>
  );
}

function ModuleReview({
  review,
  subjectName,
}: {
  review: NonNullable<SubjectModuleContent["review"]>;
  subjectName: string;
}) {
  const identity = getSubjectIdentity(subjectName);
  const coreSummary = review.summary.slice(0, 5);
  const extraSummary = review.summary.slice(5);
  const coreFlashcards = review.flashcards.slice(0, 4);

  return (
    <section className="space-y-4">
      <h4 className="text-base md:text-lg font-semibold text-foreground">{identity.reviewTitle}</h4>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Use esta parte para fechar a aula em poucos minutos e decidir o que revisar depois.
      </p>
      <div className="grid gap-3 lg:grid-cols-3">
        <div className={`rounded-xl border ${identity.border} bg-card p-4`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h5 className="font-semibold text-foreground">Resumo visual</h5>
            <span className={`rounded-full ${identity.soft} px-2.5 py-1 text-xs ${identity.accent}`}>essencial</span>
          </div>
          <div className="space-y-3">
            {coreSummary.map((item, index) => (
              <div key={item} className="rounded-lg border border-border bg-background p-3">
                <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full ${identity.soft} text-xs font-semibold ${identity.accent}`}>
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
          {extraSummary.length > 0 && (
            <details className="mt-3 rounded-lg border border-border bg-background p-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">Ver mais pontos de revisão</summary>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {extraSummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
        <div className={`rounded-xl border ${identity.border} bg-card p-4`}>
          <h5 className="font-semibold text-foreground">Mapa mental</h5>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {review.mentalMap.map((item, index) => (
              <div key={item} className={index % 2 === 0 ? "contents" : "contents"}>
                {index % 2 === 0 ? (
                  <>
                    <span className={`rounded-xl ${identity.soft} px-3 py-2 text-center text-sm font-medium ${identity.accent}`}>{item}</span>
                    <span className="text-center text-muted-foreground">→</span>
                    <span />
                  </>
                ) : (
                  <>
                    <span />
                    <span className="text-center text-muted-foreground">←</span>
                    <span className="rounded-xl bg-muted px-3 py-2 text-center text-sm font-medium text-foreground">{item}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={`rounded-xl border ${identity.border} bg-card p-4`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h5 className="font-semibold text-foreground">Flashcards</h5>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{review.flashcards.length} cards</span>
          </div>
          <div className="space-y-3">
            {coreFlashcards.map((card) => (
              <details key={card.front} className="group rounded-xl border border-border bg-background p-3 transition-colors open:border-primary/40 open:bg-primary/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground">
                  <span>{card.front}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground group-open:bg-primary group-open:text-primary-foreground">virar</span>
                </summary>
                <p className="mt-3 rounded-lg bg-card p-3 text-sm leading-relaxed text-muted-foreground">{card.back}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ModulePracticeGroup({
  title,
  description,
  items,
  subjectName,
  moduleTitle,
  onActivityAnswered,
}: {
  title: string;
  description: string;
  items: { activity: SubjectModuleContent["activities"][number]; index: number }[];
  subjectName: string;
  moduleTitle: string;
  onActivityAnswered: (subjectName: string, moduleTitle: string, activityKey: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-background p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h5 className="font-semibold text-foreground">{title}</h5>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <span className="w-fit rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          {formatQuestionCount(items.length)}
        </span>
      </div>
      <div className="space-y-3">
        {items.map(({ activity, index }) => (
          <ModuleActivity
            key={activity.question}
            activity={activity}
            index={index}
            difficulty={getActivityDifficulty(activity, index)}
            onAnswered={() => onActivityAnswered(subjectName, moduleTitle, activity.question)}
          />
        ))}
      </div>
    </div>
  );
}

function ModuleActivity({
  activity,
  index,
  difficulty,
  onAnswered,
}: {
  activity: SubjectModuleContent["activities"][number];
  index: number;
  difficulty: "facil" | "medio" | "dificil";
  onAnswered: () => void;
}) {
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const hasChoices = Boolean(activity.choices?.length);
  const isChoiceCorrect =
    selectedChoice !== null &&
    activity.correctChoice !== undefined &&
    selectedChoice === activity.correctChoice;
  const correctChoiceLabel =
    hasChoices && activity.correctChoice !== undefined
      ? `${String.fromCharCode(65 + activity.correctChoice)}. ${activity.choices?.[activity.correctChoice] ?? activity.answer}`
      : activity.answer;
  const writtenEvaluation = showFeedback && !hasChoices
    ? evaluateWrittenAnswer(activity, writtenAnswer)
    : null;
  const activityKind = hasChoices ? "Objetiva" : "Resposta escrita";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="font-medium leading-relaxed text-foreground">
          {index + 1}. {activity.question}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="w-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {activityKind}
          </span>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
          difficulty === "facil"
            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
            : difficulty === "medio"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
        }`}>
          {difficulty === "facil" ? "Fácil" : difficulty === "medio" ? "Médio" : "Difícil"}
          </span>
        </div>
      </div>

      {hasChoices ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {activity.choices?.map((choice, choiceIndex) => {
            const selected = selectedChoice === choiceIndex;
            return (
              <button
                key={choice}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:bg-accent text-foreground"
                }`}
                onClick={() => {
                  setSelectedChoice(choiceIndex);
                  setShowFeedback(false);
                }}
                type="button"
              >
                <span className="mr-2 font-semibold">{String.fromCharCode(65 + choiceIndex)}.</span>
                {choice}
              </button>
            );
          })}
        </div>
      ) : (
        <textarea
          value={writtenAnswer}
          onChange={(event) => {
            setWrittenAnswer(event.target.value);
            setShowFeedback(false);
          }}
          className="mt-4 min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          placeholder="Escreva sua resposta aqui antes de conferir."
        />
      )}

      <div className="mt-3 flex justify-end">
        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={hasChoices ? selectedChoice === null : writtenAnswer.trim().length === 0}
          onClick={() => {
            setShowFeedback(true);
            onAnswered();
          }}
          type="button"
        >
          Conferir resposta
        </button>
      </div>

      {showFeedback && (
        <div className="mt-3 rounded-lg bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">
          {hasChoices && activity.correctChoice !== undefined && (
            <p className={isChoiceCorrect ? "mb-2 font-medium text-green-700 dark:text-green-400" : "mb-2 font-medium text-destructive"}>
              {isChoiceCorrect ? "Resposta correta." : "Resposta incorreta."}
            </p>
          )}
          {writtenEvaluation && (
            <div className="space-y-2">
              <p className={`font-medium ${
                writtenEvaluation.status === "correct"
                  ? "text-green-700 dark:text-green-400"
                  : writtenEvaluation.status === "partial"
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-destructive"
              }`}>
                {writtenEvaluation.title}
              </p>

              {writtenEvaluation.status !== "correct" && writtenEvaluation.matched.length > 0 && (
                <div>
                  <p className="font-medium text-foreground">Você acertou:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {writtenEvaluation.matched.map((criterion) => (
                      <li key={criterion.label}>{criterion.label}</li>
                    ))}
                  </ul>
                </div>
              )}

              {writtenEvaluation.status !== "correct" && writtenEvaluation.missed.length > 0 && (
                <div>
                  <p className="font-medium text-foreground">Precisa corrigir:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {writtenEvaluation.missed.map((criterion) => (
                      <li key={criterion.label}>{criterion.feedback}</li>
                    ))}
                  </ul>
                </div>
              )}

              {writtenEvaluation.status !== "correct" && (
                <p><strong>Resposta correta:</strong> {activity.answer}</p>
              )}
            </div>
          )}

          {!writtenEvaluation && (
            <>
              <p><strong>Resposta correta:</strong> {correctChoiceLabel}</p>
              {activity.explanation && <p className="mt-2">{activity.explanation}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PlaceholderView() {
  return (
    <PageContainer>
      <div className="bg-card rounded-xl p-6 text-center border border-border md:p-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Em desenvolvimento</h3>
        <p className="text-muted-foreground">Esta seção estará disponível em breve.</p>
      </div>
    </PageContainer>
  );
}

function ConfiguracoesView({
  userName,
  userNumber,
  avatarUrl,
  avatarPositionX,
  avatarPositionY,
  frameId,
  authUser,
  authReady,
  onProfileSave,
  onStudyGoalsSave,
  onAuthChanged,
  canInstallPwa,
  isPwaInstalled,
  onInstallPwa,
  isDark,
  onToggleTheme,
  streakDays,
  studyGoals,
  studyProgress,
  courseModules,
  activitySummary,
  unlockStats,
  purchasedFrameIds,
  coinBalance,
  coinsEarned,
  onFramePurchase,
}: {
  userName: string;
  userNumber?: number | null;
  avatarUrl?: string | null;
  avatarPositionX: number;
  avatarPositionY: number;
  frameId: ProfileFrameId;
  authUser: AuthUser | null;
  authReady: boolean;
  onProfileSave: (profile: { name: string; avatarUrl: string | null; avatarPositionX: number; avatarPositionY: number; frameId: ProfileFrameId }) => Promise<void>;
  onStudyGoalsSave: (goals: StudyGoals) => Promise<void>;
  onAuthChanged: () => Promise<void>;
  canInstallPwa: boolean;
  isPwaInstalled: boolean;
  onInstallPwa: () => Promise<"installed" | "dismissed" | "manual">;
  isDark: boolean;
  onToggleTheme: () => void;
  streakDays: number;
  studyGoals: StudyGoals;
  studyProgress: StudyProgress;
  courseModules: SubjectModuleMap;
  activitySummary: LearningActivitySummary;
  unlockStats: ProfileUnlockStats;
  purchasedFrameIds: Set<ProfileFrameId>;
  coinBalance: number;
  coinsEarned: number;
  onFramePurchase: (frameId: ProfileFrameId) => void;
}) {
  const [draftName, setDraftName] = useState(userName);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState<string | null>(avatarUrl ?? null);
  const [draftAvatarPositionX, setDraftAvatarPositionX] = useState(avatarPositionX);
  const [draftAvatarPositionY, setDraftAvatarPositionY] = useState(avatarPositionY);
  const [draftFrameId, setDraftFrameId] = useState<ProfileFrameId>(frameId);
  const [draftWeeklyActiveDays, setDraftWeeklyActiveDays] = useState(studyGoals.weeklyActiveDays);
  const [draftDailyActivityTarget, setDraftDailyActivityTarget] = useState(studyGoals.dailyActivityTarget);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("perfil");
  const [status, setStatus] = useState("");
  const [goalsStatus, setGoalsStatus] = useState("");

  useEffect(() => {
    setDraftName(userName);
    setDraftAvatarUrl(avatarUrl ?? null);
    setDraftAvatarPositionX(avatarPositionX);
    setDraftAvatarPositionY(avatarPositionY);
    setDraftFrameId(frameId);
  }, [avatarPositionX, avatarPositionY, avatarUrl, frameId, userName]);

  useEffect(() => {
    setDraftWeeklyActiveDays(studyGoals.weeklyActiveDays);
    setDraftDailyActivityTarget(studyGoals.dailyActivityTarget);
  }, [studyGoals.dailyActivityTarget, studyGoals.weeklyActiveDays]);

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = draftName.trim();
    if (!nextName) return;
    setStatus("");
    try {
      const selectedFrame = getProfileFrame(draftFrameId);
      const selectedFrameAccess = getProfileFrameAccess(selectedFrame, unlockStats, purchasedFrameIds);
      if (!selectedFrameAccess.unlocked) {
        setStatus(`Moldura bloqueada: ${selectedFrameAccess.reason}`);
        return;
      }

      await onProfileSave({
        name: nextName,
        avatarUrl: draftAvatarUrl,
        avatarPositionX: draftAvatarPositionX,
        avatarPositionY: draftAvatarPositionY,
        frameId: draftFrameId,
      });
      setStatus("Perfil salvo na sua conta.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel salvar o perfil.");
    }
  };

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;
    setStatus("");
    try {
      const nextAvatarUrl = await readProfileAvatarFile(file);
      setDraftAvatarUrl(nextAvatarUrl);
      setDraftAvatarPositionX(0);
      setDraftAvatarPositionY(0);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel carregar a foto.");
    }
  };

  const handleSaveStudyGoals = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGoalsStatus("");
    try {
      await onStudyGoalsSave({
        weeklyActiveDays: draftWeeklyActiveDays,
        dailyActivityTarget: draftDailyActivityTarget,
      });
      setGoalsStatus("Metas salvas na sua conta.");
    } catch (error) {
      setGoalsStatus(error instanceof Error ? error.message : "Nao foi possivel salvar as metas.");
    }
  };

  const { totalModules, completedModules } = getTotalProgressSummary(studyProgress, courseModules);
  const unlockedFrameCount = PROFILE_FRAMES.filter((frame) => getProfileFrameAccess(frame, unlockStats, purchasedFrameIds).unlocked).length;
  const nextReward = PROFILE_FRAMES.find((frame) => frame.category !== "loja" && !getProfileFrameAccess(frame, unlockStats, purchasedFrameIds).unlocked) ?? getProfileFrame("fogo");
  const nextRewardProgress = Math.min(100, Math.round((completedModules / Math.max(1, totalModules || 20)) * 100));
  const totalActivities = activitySummary.weekCount;
  const profileLevel = unlockStats.profileLevel;
  const xpRequiredForNextLevel = getXpRequiredForNextLevel(profileLevel);
  const xpCurrent = Math.min(xpRequiredForNextLevel, getProfileTotalXp(completedModules, streakDays, totalActivities));
  const xpProgressPercent = Math.min(100, Math.round((xpCurrent / xpRequiredForNextLevel) * 100));

  return (
    <PageContainer contentClassName="space-y-5">
      <div className="flex gap-2 overflow-x-auto border-b border-border pb-3">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${activeSettingsTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveSettingsTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {activeSettingsTab === "perfil" && (
        <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-5">
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm md:p-6">
            <div className="relative mx-auto flex min-h-36 w-36 items-center justify-center">
              <DraggableAvatarPosition
                name={draftName || userName}
                avatarUrl={draftAvatarUrl}
                avatarPositionX={draftAvatarPositionX}
                avatarPositionY={draftAvatarPositionY}
                frameId={draftFrameId}
                onPositionChange={(x, y) => {
                  setDraftAvatarPositionX(x);
                  setDraftAvatarPositionY(y);
                }}
                onReset={() => {
                  setDraftAvatarPositionX(0);
                  setDraftAvatarPositionY(0);
                }}
              />
              <label className="absolute right-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                <Camera className="h-4 w-4" />
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    handleAvatarUpload(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="min-w-0 max-w-[180px] bg-transparent text-center text-2xl font-semibold text-foreground outline-none focus:text-primary"
                placeholder="Nome"
              />
              <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                Nível {profileLevel}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Foco • Disciplina • Evolução</p>
            {userNumber && (
              <p className="mt-1 text-xs font-medium text-primary">ID público #{userNumber}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">Sempre aprendendo.</p>

            <div className="mt-5 text-left">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {xpCurrent.toLocaleString("pt-BR")} / {xpRequiredForNextLevel.toLocaleString("pt-BR")} XP
                </span>
                <span className="text-muted-foreground">{xpProgressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${xpProgressPercent}%` }} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <Flame className="mx-auto h-5 w-5 text-orange-500" />
                <p className="mt-1 text-lg font-semibold text-foreground">{streakDays}</p>
                <p className="text-xs text-muted-foreground">Dias</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <BookOpen className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-1 text-lg font-semibold text-foreground">{completedModules}</p>
                <p className="text-xs text-muted-foreground">Módulos</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <Trophy className="mx-auto h-5 w-5 text-amber-500" />
                <p className="mt-1 text-lg font-semibold text-foreground">{unlockedFrameCount}</p>
                <p className="text-xs text-muted-foreground">Molduras</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                Salvar perfil
              </button>
              {draftAvatarUrl && (
                <button
                  className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
                  type="button"
                  onClick={() => {
                    setDraftAvatarUrl(null);
                    setDraftAvatarPositionX(0);
                    setDraftAvatarPositionY(0);
                  }}
                >
                  Remover foto
                </button>
              )}
            </div>
            {status && <p className="mt-3 text-sm text-muted-foreground">{status}</p>}
          </form>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Próxima recompensa</h2>
            <div className="mt-4 flex items-center gap-4">
              <ProfileFramePreview frame={nextReward} className="h-16 w-16" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{nextReward.label}</p>
                <p className="text-sm text-muted-foreground">{nextReward.unlock}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${nextRewardProgress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{nextRewardProgress}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Estatísticas rápidas</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                <span className="text-muted-foreground">Atividades na semana</span>
                <strong className="text-foreground">{activitySummary.weekCount}</strong>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                <span className="text-muted-foreground">Simulados registrados</span>
                <strong className="text-foreground">{activitySummary.byType.simulado}</strong>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                <span className="text-muted-foreground">Módulos concluídos</span>
                <strong className="text-foreground">{completedModules}/{totalModules}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Flashcards</span>
                <strong className="text-foreground">{activitySummary.byType.flashcard}</strong>
              </div>
            </div>
          </div>
        </div>
        <ProfileFrameGallery
          selectedFrameId={draftFrameId}
          onSelect={setDraftFrameId}
          unlockStats={unlockStats}
          purchasedFrameIds={purchasedFrameIds}
          coinBalance={coinBalance}
          coinsEarned={coinsEarned}
          onPurchase={onFramePurchase}
        />
        </div>

        )}

        <div className="space-y-5">
          {activeSettingsTab === "molduras" && (
            <ProfileFrameGallery
              selectedFrameId={draftFrameId}
              onSelect={setDraftFrameId}
              unlockStats={unlockStats}
              purchasedFrameIds={purchasedFrameIds}
              coinBalance={coinBalance}
              coinsEarned={coinsEarned}
              onPurchase={onFramePurchase}
            />
          )}

          {activeSettingsTab === "metas" && (
          <form onSubmit={handleSaveStudyGoals} className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Metas de estudo</h2>
              <p className="text-sm text-muted-foreground">Ajuste o ritmo usado no dashboard e nas recomendações diárias.</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Dias ativos por semana</span>
                <input
                  value={draftWeeklyActiveDays}
                  onChange={(event) => setDraftWeeklyActiveDays(Number(event.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  min={1}
                  max={7}
                  type="number"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Atividades por dia</span>
                <input
                  value={draftDailyActivityTarget}
                  onChange={(event) => setDraftDailyActivityTarget(Number(event.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  min={1}
                  max={50}
                  type="number"
                />
              </label>
            </div>

            <button
              className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!authUser}
            >
              Salvar metas
            </button>
            {!authUser && <p className="mt-3 text-sm text-muted-foreground">Entre na conta para salvar metas entre dispositivos.</p>}
            {goalsStatus && <p className="mt-3 text-sm text-muted-foreground">{goalsStatus}</p>}
          </form>
          )}

          {activeSettingsTab === "notificacoes" && (
            <PwaInstallCard canInstall={canInstallPwa} isInstalled={isPwaInstalled} onInstall={onInstallPwa} compact />
          )}

          {activeSettingsTab === "conta" && (
            <AuthPanel authUser={authUser} authReady={authReady} onAuthChanged={onAuthChanged} />
          )}

          {activeSettingsTab === "aparencia" && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
              <h2 className="text-lg font-semibold text-foreground">Aparência</h2>
              <p className="mt-1 text-sm text-muted-foreground">Escolha o tema visual usado no LearnFlow.</p>
              <button
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                onClick={onToggleTheme}
                type="button"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                Usar tema {isDark ? "claro" : "escuro"}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function PwaInstallCard({
  canInstall,
  isInstalled,
  compact = false,
  onInstall,
}: {
  canInstall: boolean;
  isInstalled: boolean;
  compact?: boolean;
  onInstall: () => Promise<"installed" | "dismissed" | "manual">;
}) {
  const [status, setStatus] = useState("");

  const handleInstall = async () => {
    setStatus("");
    const result = await onInstall();

    if (result === "installed") {
      setStatus("App instalado. Se o ícone antigo continuar aparecendo, remova o app antigo e instale novamente.");
      return;
    }

    if (result === "dismissed") {
      setStatus("Instalação cancelada.");
      return;
    }

    setStatus("No Chrome Android, abra o menu de três pontos e toque em Instalar app ou Adicionar à tela inicial.");
  };

  return (
    <div className={`rounded-xl border border-primary/20 bg-primary/5 ${compact ? "p-4 md:p-5" : "p-5 md:p-6"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isInstalled ? "LearnFlow instalado" : "Instalar LearnFlow"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isInstalled
                ? "Para atualizar ícone e permissões, remova o app antigo e instale novamente pelo navegador."
                : "Instale como app para abrir em tela cheia e melhorar o suporte a notificações no celular."}
            </p>
          </div>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          onClick={handleInstall}
          type="button"
        >
          <Download className="h-4 w-4" />
          {canInstall ? "Instalar app" : "Como instalar"}
        </button>
      </div>
      {status && (
        <p className="mt-3 rounded-lg bg-background/70 px-3 py-2 text-sm text-muted-foreground">
          {status}
        </p>
      )}
    </div>
  );
}

function AccountRequiredView({
  title,
  description,
  authUser,
  authReady,
  onAuthChanged,
}: {
  title: string;
  description: string;
  authUser: AuthUser | null;
  authReady: boolean;
  onAuthChanged: () => Promise<void>;
}) {
  return (
    <PageContainer size="narrow" contentClassName="space-y-5">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
          <p className="text-sm font-medium text-primary">Conta necessaria</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">{description}</p>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card/70 p-3">Progresso individual</div>
            <div className="rounded-xl border border-border bg-card/70 p-3">Dados salvos na sua conta</div>
            <div className="rounded-xl border border-border bg-card/70 p-3">Sincronizacao entre dispositivos</div>
          </div>
        </div>

        <AuthPanel
          authUser={authUser}
          authReady={authReady}
          onAuthChanged={onAuthChanged}
          context="gate"
        />
    </PageContainer>
  );
}

function AuthPanel({
  authUser,
  authReady,
  onAuthChanged,
  context = "settings",
}: {
  authUser: AuthUser | null;
  authReady: boolean;
  onAuthChanged: () => Promise<void>;
  context?: "settings" | "gate";
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localAuthUser, setLocalAuthUser] = useState<AuthUser | null>(authUser);

  useEffect(() => {
    setLocalAuthUser(authUser);
    if (authUser) {
      setEmail("");
      setPassword("");
    }
  }, [authUser]);

  const displayAuthUser = authUser ?? localAuthUser;

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
        setStatus("Login realizado.");
      } else {
        await signUpWithEmail(email.trim(), password);
        setMode("signin");
        setStatus("Enviamos um e-mail de verificação. Confirme seu e-mail antes de entrar.");
      }

      if (mode === "signup") {
        setStatus("Conta criada. Enviamos um e-mail de confirmacao. Abra o link do e-mail e depois volte para entrar.");
      }

      const currentUser = await getCurrentAuthUser();
      setLocalAuthUser(currentUser);
      setEmail("");
      setPassword("");
      await onAuthChanged();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel autenticar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setStatus("");
    setIsSubmitting(true);

    try {
      await signOut();
      setLocalAuthUser(null);
      setEmail("");
      setPassword("");
      setMode("signin");
      await onAuthChanged();
      setStatus("Voce saiu da conta.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel sair.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = displayAuthUser
    ? "Conta conectada"
    : mode === "signup"
      ? "Criar conta gratuita"
      : "Entrar na conta";

  const description = displayAuthUser
    ? "Seu progresso, flashcards, calendario e simulados ficam vinculados a esta conta."
    : context === "gate"
      ? "Entre para usar esta area e manter seus dados separados por usuario."
      : "Use sua conta para salvar progresso, flashcards, calendario e simulados entre dispositivos.";

  return (
    <div className="bg-card rounded-xl p-5 md:p-6 border border-border space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {!authReady ? (
        <p className="text-sm text-muted-foreground">Verificando sessao...</p>
      ) : displayAuthUser ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/60 p-4">
            <p className="text-sm text-muted-foreground">Conectado como</p>
            <p className="font-medium text-foreground">{displayAuthUser.email || displayAuthUser.id}</p>
          </div>
          <button
            className="w-full rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            onClick={handleSignOut}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? "Saindo..." : "Sair da conta / trocar conta"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuthSubmit} className="space-y-4" autoComplete="off">
          <div className="grid gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground sm:grid-cols-3">
            <span>Progresso individual</span>
            <span>Flashcards privados</span>
            <span>Calendario sincronizado</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className={`flex-1 rounded-lg px-4 py-2 text-sm sm:flex-none ${mode === "signin" ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-accent"}`}
              onClick={() => {
                setMode("signin");
                setPassword("");
                setStatus("");
              }}
              type="button"
            >
              Entrar
            </button>
            <button
              className={`flex-1 rounded-lg px-4 py-2 text-sm sm:flex-none ${mode === "signup" ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-accent"}`}
              onClick={() => {
                setMode("signup");
                setPassword("");
                setStatus("");
              }}
              type="button"
            >
              Criar conta
            </button>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              placeholder="voce@email.com"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Senha</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              placeholder="Minimo de 6 caracteres"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={6}
              required
            />
          </label>

          <button
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      )}

      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}

function DashboardHomeView({
  streakDays,
  studyProgress,
  activitySummary,
  dueFlashcardCount,
  studyGoals,
  lastStudy,
  courseModules,
  courseContentLoading,
  courseContentError,
  canInstallPwa,
  isPwaInstalled,
  onInstallPwa,
  onRetryCourseContent,
  onOpenMaterias,
  onOpenFlashcards,
}: {
  streakDays: number;
  studyProgress: StudyProgress;
  activitySummary: LearningActivitySummary;
  dueFlashcardCount: number;
  studyGoals: StudyGoals;
  lastStudy: LastStudyData;
  courseModules: SubjectModuleMap;
  courseContentLoading: boolean;
  courseContentError: string;
  canInstallPwa: boolean;
  isPwaInstalled: boolean;
  onInstallPwa: () => Promise<"installed" | "dismissed" | "manual">;
  onRetryCourseContent: () => void;
  onOpenMaterias: (target?: StudyTarget) => void;
  onOpenFlashcards: () => void;
}) {
  const { totalModules, completedModules, overallProgress } = getTotalProgressSummary(studyProgress, courseModules);
  const reviewItems = buildDashboardReviewItems(studyProgress, courseModules, lastStudy, activitySummary, dueFlashcardCount);
  const topSubjectEntry = Object.entries(activitySummary.bySubject).sort(([, first], [, second]) => second - first)[0] ?? null;
  const weeklyGoal = studyGoals.weeklyActiveDays;
  const weeklyGoalProgress = Math.min(100, Math.round((activitySummary.activeDaysThisWeek / weeklyGoal) * 100));
  const dailyGoalProgress = Math.min(100, Math.round((activitySummary.todayCount / studyGoals.dailyActivityTarget) * 100));
  const activityTypeStats: UserActivityType[] = ["materia", "flashcard", "simulado", "calendario"];
  const shouldShowInstallCard = canInstallPwa || isPwaInstalled;
  const inProgressSubjects = SUBJECTS
    .map((subject) => ({
      ...subject,
      computedProgress: getSubjectProgressSummary(studyProgress, courseModules, subject.name).progressPercent,
    }))
    .filter((subject) => subject.computedProgress > 0)
    .slice(0, 4);
  const lastStudySubject = lastStudy ? SUBJECTS.find((subject) => subject.name === lastStudy.subjectName) : null;
  const lastStudyProgress = lastStudy
    ? getModuleProgressPercent(
      studyProgress,
      lastStudy.subjectName,
      courseModules[lastStudy.subjectName]?.find((module) => module.title === lastStudy.moduleTitle) ?? {
        title: lastStudy.moduleTitle,
        objective: "",
        explanation: [],
        examples: [],
        activities: [],
      },
    )
    : 0;

  const openReviewItem = (item?: DashboardReviewItem) => {
    if (item?.action === "flashcards") {
      onOpenFlashcards();
      return;
    }

    onOpenMaterias(item?.target);
  };

  return (
    <PageContainer>
        {shouldShowInstallCard && (
          <PwaInstallCard
            compact
            canInstall={canInstallPwa}
            isInstalled={isPwaInstalled}
            onInstall={onInstallPwa}
          />
        )}

        {(courseContentLoading || courseContentError) && (
          <div className="rounded-xl border border-border bg-card p-4 md:p-5">
            {courseContentLoading ? (
              <div>
                <h2 className="font-semibold text-foreground">Carregando conteudo...</h2>
                <p className="mt-1 text-sm text-muted-foreground">Carregando matérias e módulos.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">Conteudo indisponivel</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{courseContentError}</p>
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-fit"
                  onClick={onRetryCourseContent}
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <section className="rounded-xl border border-border bg-card p-5 md:p-6 xl:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Plano de hoje</p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">Revisao inteligente</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                  Sugestões geradas com seu progresso, histórico recente e módulos em andamento.
                </p>
              </div>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 md:w-auto"
                onClick={() => openReviewItem(reviewItems[0])}
                type="button"
              >
                Estudar agora
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {reviewItems.length > 0 ? (
                reviewItems.map((item) => (
                  <button
                    key={`${item.title}-${item.description}`}
                    className="group flex w-full items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                    onClick={() => openReviewItem(item)}
                    type="button"
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      item.tone === "primary"
                        ? "bg-primary/10 text-primary"
                        : item.tone === "warning"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {item.tone === "primary" ? <Target className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Conclua uma atividade para gerar seu plano de revisao.</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Meta semanal</p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">
                  {activitySummary.activeDaysThisWeek}/{weeklyGoal} dias
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${weeklyGoalProgress}%` }} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {activitySummary.weekCount} atividade{activitySummary.weekCount === 1 ? "" : "s"} registrada{activitySummary.weekCount === 1 ? "" : "s"} nos ultimos 7 dias.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {activityTypeStats.map((activityType) => (
                <div key={activityType} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{getActivityTypeLabel(activityType)}</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{activitySummary.byType[activityType]}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardMetricCard icon={<BarChart3 className="h-5 w-5" />} label="Progresso geral" value={`${overallProgress}%`} helper={`${completedModules}/${totalModules} módulos`} />
          <DashboardMetricCard
            icon={<Activity className="h-5 w-5" />}
            label="Hoje"
            value={`${activitySummary.todayCount}/${studyGoals.dailyActivityTarget}`}
            helper={`${dailyGoalProgress}% da meta diaria`}
          />
          <DashboardMetricCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Mais ativa"
            value={topSubjectEntry?.[0] ?? "Sem dados"}
            helper={topSubjectEntry ? `${topSubjectEntry[1]} atividades` : "esta semana"}
          />
        </div>

        <section>
          <h2 className="text-base md:text-xl xl:text-2xl font-semibold mb-3 md:mb-5 text-foreground">Continue estudando</h2>
          {inProgressSubjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
              {inProgressSubjects.map((subject) => (
                <SubjectCard
                  key={subject.name}
                  name={subject.name}
                  subtitle={`${getSubjectProgressSummary(studyProgress, courseModules, subject.name).activeModules} modulo(s) em andamento`}
                  progress={subject.computedProgress}
                  color={subject.color}
                  icon={subject.icon}
                  onClick={() => {
                    const module = getFirstInProgressModule(studyProgress, courseModules, subject.name);
                    onOpenMaterias({ subjectName: subject.name, moduleTitle: module?.title });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-5 md:p-6 xl:p-8">
              <p className="text-sm text-muted-foreground">Nenhuma materia em andamento.</p>
            </div>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <section>
            <div className="mb-3 flex items-center justify-between md:mb-4">
              <h2 className="text-base font-semibold text-foreground md:text-xl xl:text-2xl">Proxima estudada</h2>
              <button className="text-sm text-primary hover:underline" onClick={() => onOpenMaterias()} type="button">Ver todas</button>
            </div>
            {lastStudy && lastStudySubject ? (
              <button
                className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 md:p-6"
                onClick={() => onOpenMaterias(lastStudy)}
                type="button"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${lastStudySubject.color}`}>
                    {lastStudySubject.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{lastStudy.moduleTitle}</p>
                    <p className="text-sm text-muted-foreground">{lastStudy.subjectName} - {lastStudyProgress}% concluido</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${lastStudyProgress}%` }} />
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 md:p-6">
                <p className="text-sm text-muted-foreground">Nenhum estudo iniciado ainda.</p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground md:text-lg">Historico recente</h2>
                <p className="text-sm text-muted-foreground">Ultimas atividades salvas.</p>
              </div>
              <History className="h-5 w-5 text-primary" />
            </div>
            {activitySummary.recent.length > 0 ? (
              <div className="space-y-3">
                {activitySummary.recent.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{getRecentActivityTitle(activity)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getActivityTypeLabel(activity.activityType)} - {activity.activityDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                O historico aparece depois das proximas atividades.
              </p>
            )}
          </section>
        </div>
    </PageContainer>
  );
}

function DashboardMetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-2xl font-semibold text-foreground">{value}</p>
          {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

function HomeView({
  streakDays,
  studyProgress,
  lastStudy,
  courseModules,
  courseContentLoading,
  courseContentError,
  canInstallPwa,
  isPwaInstalled,
  onInstallPwa,
  onRetryCourseContent,
  onOpenMaterias,
}: {
  streakDays: number;
  studyProgress: StudyProgress;
  lastStudy: LastStudyData;
  courseModules: SubjectModuleMap;
  courseContentLoading: boolean;
  courseContentError: string;
  canInstallPwa: boolean;
  isPwaInstalled: boolean;
  onInstallPwa: () => Promise<"installed" | "dismissed" | "manual">;
  onRetryCourseContent: () => void;
  onOpenMaterias: (target?: StudyTarget) => void;
}) {
  const { totalModules, completedModules, overallProgress } = getTotalProgressSummary(studyProgress, courseModules);
  const inProgressSubjects = SUBJECTS
    .map((subject) => ({
      ...subject,
      computedProgress: getSubjectProgressSummary(studyProgress, courseModules, subject.name).progressPercent,
    }))
    .filter((subject) => subject.computedProgress > 0)
    .slice(0, 4);
  const lastStudySubject = lastStudy ? SUBJECTS.find((subject) => subject.name === lastStudy.subjectName) : null;
  const lastStudyProgress = lastStudy
    ? getModuleProgressPercent(
      studyProgress,
      lastStudy.subjectName,
      courseModules[lastStudy.subjectName]?.find((module) => module.title === lastStudy.moduleTitle) ?? {
        title: lastStudy.moduleTitle,
        objective: "",
        explanation: [],
        examples: [],
        activities: [],
      },
    )
    : 0;
  const shouldShowInstallCard = canInstallPwa || isPwaInstalled;

  return (
    <PageContainer>
        {shouldShowInstallCard && (
          <PwaInstallCard
            compact
            canInstall={canInstallPwa}
            isInstalled={isPwaInstalled}
            onInstall={onInstallPwa}
          />
        )}

        {(courseContentLoading || courseContentError) && (
          <div className="rounded-xl border border-border bg-card p-4 md:p-5">
            {courseContentLoading ? (
              <div>
                <h2 className="font-semibold text-foreground">Carregando conteúdo...</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Carregando matérias e módulos.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">Conteúdo indisponível</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{courseContentError}</p>
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-fit"
                  onClick={onRetryCourseContent}
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6 xl:gap-8">
          <div className="bg-card rounded-xl p-5 md:p-6 xl:p-8 border border-border">
            <h3 className="text-sm xl:text-base text-muted-foreground mb-2">Sequência de estudos</h3>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl xl:text-4xl font-bold text-foreground">{streakDays} dias</span>
            </div>
            <div className="flex gap-1">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => (
                <div key={day} className="flex-1 text-center">
                  <div
                    className={`h-7 md:h-8 rounded-md mb-1 ${
                      i < streakDays ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <span className="text-[10px] md:text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 md:p-6 xl:p-8 border border-border">
            <h3 className="text-sm xl:text-base text-muted-foreground mb-2">Progresso geral</h3>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl xl:text-4xl font-bold text-foreground">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div className="h-full bg-primary rounded-full" style={{ width: `${overallProgress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              {completedModules}/{totalModules} módulos concluídos
            </p>
          </div>
        </div>

        {/* Continue Studying */}
        <div>
          <h2 className="text-base md:text-xl xl:text-2xl font-semibold mb-3 md:mb-5 text-foreground">Continue estudando</h2>
          {inProgressSubjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {inProgressSubjects.map((subject) => (
                <SubjectCard
                  key={subject.name}
                  name={subject.name}
                  subtitle={`${getSubjectProgressSummary(studyProgress, courseModules, subject.name).activeModules} módulo(s) em andamento`}
                  progress={subject.computedProgress}
                  color={subject.color}
                  icon={subject.icon}
                  onClick={() => {
                    const module = getFirstInProgressModule(studyProgress, courseModules, subject.name);
                    onOpenMaterias({ subjectName: subject.name, moduleTitle: module?.title });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5 md:p-6 xl:p-8">
              <p className="text-sm text-muted-foreground">Nenhuma matéria em andamento.</p>
            </div>
          )}
        </div>

        {/* Próxima Estudada */}
        <div>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-xl xl:text-2xl font-semibold text-foreground">Próxima estudada</h2>
            <button className="text-sm text-primary hover:underline" onClick={() => onOpenMaterias()} type="button">Ver todas →</button>
          </div>
          <div className="space-y-3">
            {lastStudy && lastStudySubject ? (
              <button
                className="w-full bg-card border border-border rounded-xl p-4 md:p-6 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
                onClick={() => onOpenMaterias(lastStudy)}
                type="button"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${lastStudySubject.color} rounded-xl flex items-center justify-center text-2xl`}>
                    {lastStudySubject.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{lastStudy.moduleTitle}</p>
                    <p className="text-sm text-muted-foreground">{lastStudy.subjectName} · {lastStudyProgress}% concluído</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${lastStudyProgress}%` }} />
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                <p className="text-sm text-muted-foreground">
                  Nenhum estudo agendado ainda.
                </p>
              </div>
            )}
          </div>
        </div>
    </PageContainer>
  );
}

type CalendarReminder = CalendarReminderData;

type CalendarHoliday = {
  date: string;
  name: string;
  type: "Feriado nacional" | "Ponto facultativo";
};

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const CALENDAR_RULE_TYPE_LABELS: Record<CalendarRuleType, string> = {
  folga: "Folga",
  estudo: "Estudo",
  revisao: "Revisão",
  simulado: "Simulado",
  outro: "Outro",
};

const CALENDAR_RULE_FREQUENCY_LABELS: Record<CalendarRuleFrequency, string> = {
  weekly: "Toda semana",
  biweekly: "Semana sim, semana não",
};

const CALENDAR_RULE_COLOR_CLASSES: Record<CalendarRuleColor, { dot: string; badge: string; border: string }> = {
  orange: {
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-900",
  },
  purple: {
    dot: "bg-purple-500",
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-900",
  },
  blue: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-900",
  },
  green: {
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    border: "border-green-200 dark:border-green-900",
  },
  rose: {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-900",
  },
  slate: {
    dot: "bg-slate-500",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-800",
  },
};

const CALENDAR_RULE_COLOR_OPTIONS: { value: CalendarRuleColor; label: string }[] = [
  { value: "orange", label: "Laranja" },
  { value: "purple", label: "Roxo" },
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "rose", label: "Rosa" },
  { value: "slate", label: "Cinza" },
];

const CALENDAR_NOTIFY_MARKER = "[avisar-1d]";

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatLongDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${day} de ${MONTH_NAMES[month - 1]} de ${year}`;
}

function getDateWeekdayIndex(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return (new Date(year, month - 1, day).getDay() + 6) % 7;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function dateToKey(date: Date) {
  return formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
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

function formatCalendarNotificationTitle(title: string, shouldNotify: boolean) {
  const displayTitle = getCalendarDisplayTitle(title);
  return shouldNotify ? `${CALENDAR_NOTIFY_MARKER} ${displayTitle}` : displayTitle;
}

async function requestDeviceNotificationPermission() {
  return enableDevicePushNotifications();
}

function notifyDeviceCalendarAlerts(userId: string, alerts: UpcomingExamAlert[]) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  alerts.slice(0, 3).forEach((alert) => {
    const notificationKey = `learnflow:device-calendar-alert:${userId}:${alert.id}:${alert.date}`;
    if (window.localStorage.getItem(notificationKey) === "true") return;

    new Notification("LearnFlow: compromisso amanhã", {
      body: `${getCalendarDisplayTitle(alert.title)} em ${formatLongDate(alert.date)}.`,
      tag: notificationKey,
    });
    window.localStorage.setItem(notificationKey, "true");
  });
}

function isExamLikeCalendarTitle(title: string) {
  const normalizedTitle = normalizeCalendarText(getCalendarDisplayTitle(title));
  return ["simulado", "prova", "avaliacao", "enem", "vestibular"].some((term) =>
    normalizedTitle.includes(term),
  );
}

function getExamReviewDismissKey(userId: string, dateKey: string) {
  return `learnflow:exam-review-alert:${userId}:${dateKey}`;
}

function buildCalendarReviewAlerts(
  reminders: CalendarReminderData[],
  occurrences: CalendarRuleOccurrenceData[],
  dateKey: string,
): UpcomingExamAlert[] {
  const reminderAlerts = reminders
    .filter((reminder) =>
      reminder.date === dateKey
      && (hasCalendarNotification(reminder.title) || isExamLikeCalendarTitle(reminder.title))
    )
    .map((reminder) => ({
      id: `reminder-${reminder.id}`,
      date: reminder.date,
      title: reminder.title,
      source: "reminder" as const,
    }));

  const occurrenceAlerts = occurrences
    .filter((occurrence) =>
      occurrence.date === dateKey
      && (hasCalendarNotification(occurrence.title) || occurrence.type === "simulado" || occurrence.type === "folga")
    )
    .map((occurrence) => ({
      id: `rule-${occurrence.ruleId}-${occurrence.date}`,
      date: occurrence.date,
      title: occurrence.title,
      source: "rule" as const,
    }));

  return [...reminderAlerts, ...occurrenceAlerts];
}

function getEasterDate(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getBrazilianHolidays(year: number): CalendarHoliday[] {
  const easter = getEasterDate(year);

  const holidays: CalendarHoliday[] = [
    { date: formatDateKey(year, 0, 1), name: "Confraternização Universal", type: "Feriado nacional" },
    { date: dateToKey(addDays(easter, -48)), name: "Carnaval", type: "Ponto facultativo" },
    { date: dateToKey(addDays(easter, -47)), name: "Carnaval", type: "Ponto facultativo" },
    { date: dateToKey(addDays(easter, -46)), name: "Quarta-feira de Cinzas", type: "Ponto facultativo" },
    { date: dateToKey(addDays(easter, -2)), name: "Sexta-feira Santa", type: "Feriado nacional" },
    { date: dateToKey(easter), name: "Páscoa", type: "Feriado nacional" },
    { date: formatDateKey(year, 3, 21), name: "Tiradentes", type: "Feriado nacional" },
    { date: formatDateKey(year, 4, 1), name: "Dia do Trabalho", type: "Feriado nacional" },
    { date: dateToKey(addDays(easter, 60)), name: "Corpus Christi", type: "Ponto facultativo" },
    { date: formatDateKey(year, 8, 7), name: "Independência do Brasil", type: "Feriado nacional" },
    { date: formatDateKey(year, 9, 12), name: "Nossa Senhora Aparecida", type: "Feriado nacional" },
    { date: formatDateKey(year, 10, 2), name: "Finados", type: "Feriado nacional" },
    { date: formatDateKey(year, 10, 15), name: "Proclamação da República", type: "Feriado nacional" },
    { date: formatDateKey(year, 10, 20), name: "Consciência Negra", type: "Feriado nacional" },
    { date: formatDateKey(year, 11, 25), name: "Natal", type: "Feriado nacional" },
  ];

  return holidays.sort((first, second) => first.date.localeCompare(second.date));
}

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getMondayStartOffset(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function CalendarView({ onUserActivity }: { onUserActivity: (activityType: UserActivityType, details?: UserActivityDetails) => void }) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(dateToKey(today));
  const [reminders, setReminders] = useState<CalendarReminderData[]>([]);
  const [rules, setRules] = useState<CalendarRuleData[]>([]);
  const [ruleOccurrences, setRuleOccurrences] = useState<CalendarRuleOccurrenceData[]>([]);
  const [reminderDraft, setReminderDraft] = useState("");
  const [reminderNotifyBefore, setReminderNotifyBefore] = useState(false);
  const [simuladoDraft, setSimuladoDraft] = useState("Simulado ENEM");
  const [simuladoNotifyBefore, setSimuladoNotifyBefore] = useState(true);
  const [ruleTitle, setRuleTitle] = useState("Folga");
  const [ruleType, setRuleType] = useState<CalendarRuleType>("folga");
  const [ruleFrequency, setRuleFrequency] = useState<CalendarRuleFrequency>("weekly");
  const [ruleColor, setRuleColor] = useState<CalendarRuleColor>("orange");
  const [ruleNotifyBefore, setRuleNotifyBefore] = useState(true);
  const [calendarStatus, setCalendarStatus] = useState("");
  const [calendarStatusTone, setCalendarStatusTone] = useState<"error" | "success">("error");
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  const reloadCalendarData = async () => {
    setIsCalendarLoading(true);
    setCalendarStatus("");
    setCalendarStatusTone("error");
    try {
      const [nextReminders, nextRules, nextOccurrences] = await Promise.all([
        loadCalendarReminders(selectedYear),
        loadCalendarRules(),
        loadCalendarRuleOccurrences(selectedYear),
      ]);
      setReminders(nextReminders);
      setRules(nextRules);
      setRuleOccurrences(nextOccurrences);
    } catch (error) {
      setCalendarStatusTone("error");
      setCalendarStatus(error instanceof Error ? error.message : "Nao foi possivel carregar o calendario.");
    } finally {
      setIsCalendarLoading(false);
    }
  };

  useEffect(() => {
    reloadCalendarData();
  }, [selectedYear]);

  const holidays = getBrazilianHolidays(selectedYear);
  const holidaysByDate = holidays.reduce<Record<string, CalendarHoliday[]>>((acc, holiday) => {
    acc[holiday.date] = [...(acc[holiday.date] ?? []), holiday];
    return acc;
  }, {});
  const remindersByDate = reminders.reduce<Record<string, CalendarReminder[]>>((acc, reminder) => {
    acc[reminder.date] = [...(acc[reminder.date] ?? []), reminder];
    return acc;
  }, {});
  const ruleOccurrencesByDate = ruleOccurrences.reduce<Record<string, CalendarRuleOccurrenceData[]>>((acc, occurrence) => {
    acc[occurrence.date] = [...(acc[occurrence.date] ?? []), occurrence];
    return acc;
  }, {});

  const selectedDayHolidays = holidaysByDate[selectedDate] ?? [];
  const selectedDayReminders = remindersByDate[selectedDate] ?? [];
  const selectedDayRuleOccurrences = ruleOccurrencesByDate[selectedDate] ?? [];
  const daysInMonth = getMonthDays(selectedYear, selectedMonth);
  const monthOffset = getMondayStartOffset(selectedYear, selectedMonth);
  const todayKey = dateToKey(today);

  const selectMonth = (month: number) => {
    setSelectedMonth(month);
    setSelectedDate(formatDateKey(selectedYear, month, 1));
  };

  const changeMonth = (direction: -1 | 1) => {
    const nextMonth = selectedMonth + direction;
    if (nextMonth < 0) {
      const nextYear = selectedYear - 1;
      setSelectedYear(nextYear);
      setSelectedMonth(11);
      setSelectedDate(formatDateKey(nextYear, 11, 1));
      return;
    }

    if (nextMonth > 11) {
      const nextYear = selectedYear + 1;
      setSelectedYear(nextYear);
      setSelectedMonth(0);
      setSelectedDate(formatDateKey(nextYear, 0, 1));
      return;
    }

    setSelectedMonth(nextMonth);
    setSelectedDate(formatDateKey(selectedYear, nextMonth, 1));
  };

  const changeYear = (direction: -1 | 1) => {
    const nextYear = selectedYear + direction;
    setSelectedYear(nextYear);
    setSelectedDate(formatDateKey(nextYear, selectedMonth, 1));
  };

  const addReminder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = reminderDraft.trim();
    if (!title) return;

    setCalendarStatus("");
    setCalendarStatusTone("error");
    try {
      const permission = reminderNotifyBefore
        ? await requestDeviceNotificationPermission()
        : null;
      const reminder = await saveCalendarReminder(
        selectedDate,
        formatCalendarNotificationTitle(title, reminderNotifyBefore),
      );
      setReminders((current) => [...current, reminder]);
      setReminderDraft("");
      if (reminderNotifyBefore && permission !== "granted") {
        setCalendarStatusTone("success");
        setCalendarStatus("Lembrete salvo. O aviso aparece no site; ative notificações do navegador para receber fora da página.");
      }
      window.dispatchEvent(new Event("learnflow:calendar-updated"));
      onUserActivity("calendario", {
        referenceId: reminder.id,
        metadata: { calendarItemType: "reminder", title: reminder.title, date: reminder.date },
      });
    } catch (error) {
      setCalendarStatusTone("error");
      setCalendarStatus(error instanceof Error ? error.message : "Não foi possível salvar o lembrete.");
    }
  };

  const addSimuladoReminder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = simuladoDraft.trim() || "Simulado";
    const reminderTitle = title.toLowerCase().includes("simulado") || title.toLowerCase().includes("prova")
      ? title
      : `Simulado: ${title}`;

    setCalendarStatus("");
    setCalendarStatusTone("error");
    try {
      const permission = simuladoNotifyBefore
        ? await requestDeviceNotificationPermission()
        : null;
      const reminder = await saveCalendarReminder(
        selectedDate,
        formatCalendarNotificationTitle(reminderTitle, simuladoNotifyBefore),
      );
      setReminders((current) => [...current, reminder]);
      setSimuladoDraft("Simulado ENEM");
      setCalendarStatusTone("success");
      if (simuladoNotifyBefore) {
        setCalendarStatus(
          permission === "granted"
            ? "Simulado marcado. O aviso aparece no site e como notificação do dispositivo quando o navegador permitir."
            : "Simulado marcado. O aviso aparece no site; ative notificações do navegador para receber fora da página.",
        );
      } else {
        setCalendarStatus("Simulado marcado.");
      }
      window.dispatchEvent(new Event("learnflow:calendar-updated"));
      onUserActivity("calendario", {
        referenceId: reminder.id,
        metadata: { calendarItemType: "simulado_reminder", title: reminder.title, date: reminder.date },
      });
    } catch (error) {
      setCalendarStatusTone("error");
      setCalendarStatus(error instanceof Error ? error.message : "Não foi possível marcar o simulado.");
    }
  };

  const removeReminder = async (id: string) => {
    setCalendarStatus("");
    setCalendarStatusTone("error");
    try {
      await deleteCalendarReminder(id);
      setReminders((current) => current.filter((reminder) => reminder.id !== id));
      window.dispatchEvent(new Event("learnflow:calendar-updated"));
    } catch (error) {
      setCalendarStatusTone("error");
      setCalendarStatus(error instanceof Error ? error.message : "Nao foi possivel remover o lembrete.");
    }
  };

  const addCalendarRule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = ruleTitle.trim();
    if (!title) return;

    setCalendarStatus("");
    setCalendarStatusTone("error");
    try {
      const permission = ruleNotifyBefore
        ? await requestDeviceNotificationPermission()
        : null;
      const rule = await saveCalendarRule({
        title: formatCalendarNotificationTitle(title, ruleNotifyBefore),
        type: ruleType,
        weekday: getDateWeekdayIndex(selectedDate),
        frequency: ruleFrequency,
        startDate: selectedDate,
        color: ruleColor,
        isActive: true,
      });
      setRules((current) => [...current, rule]);
      setRuleTitle(ruleType === "folga" ? "Folga" : "");
      const nextOccurrences = await loadCalendarRuleOccurrences(selectedYear);
      setRuleOccurrences(nextOccurrences);
      if (ruleNotifyBefore && permission !== "granted") {
        setCalendarStatusTone("success");
        setCalendarStatus("Recorrência criada. O aviso aparece no site; ative notificações do navegador para receber fora da página.");
      }
      window.dispatchEvent(new Event("learnflow:calendar-updated"));
      onUserActivity("calendario", {
        referenceId: rule.id,
        metadata: { calendarItemType: "rule", title: rule.title, type: rule.type, frequency: rule.frequency },
      });
    } catch (error) {
      setCalendarStatusTone("error");
      setCalendarStatus(error instanceof Error ? error.message : "Não foi possível salvar a recorrência.");
    }
  };

  const removeCalendarRule = async (id: string) => {
    setCalendarStatus("");
    setCalendarStatusTone("error");
    try {
      await deleteCalendarRule(id);
      setRules((current) => current.filter((rule) => rule.id !== id));
      setRuleOccurrences((current) => current.filter((occurrence) => occurrence.ruleId !== id));
      window.dispatchEvent(new Event("learnflow:calendar-updated"));
    } catch (error) {
      setCalendarStatusTone("error");
      setCalendarStatus(error instanceof Error ? error.message : "Nao foi possivel remover a recorrencia.");
    }
  };

  return (
    <PageContainer size="fluid">
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(680px,1fr)_minmax(340px,400px)] 2xl:grid-cols-[minmax(760px,1fr)_minmax(380px,460px)]">
          <div className="space-y-5 md:space-y-8">
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 xl:p-8">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                  {MONTH_NAMES[selectedMonth]} de {selectedYear}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Selecione um dia para ver feriados e criar lembretes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button className="rounded-lg border border-border p-2 hover:bg-accent" onClick={() => changeMonth(-1)} type="button">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent" onClick={() => changeYear(-1)} type="button">
                  {selectedYear - 1}
                </button>
                <button className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground" type="button">
                  {selectedYear}
                </button>
                <button className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent" onClick={() => changeYear(1)} type="button">
                  {selectedYear + 1}
                </button>
                <button className="rounded-lg border border-border p-2 hover:bg-accent" onClick={() => changeMonth(1)} type="button">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="py-2 text-center text-xs md:text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {Array.from({ length: monthOffset }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dateKey = formatDateKey(selectedYear, selectedMonth, day);
                const dayHolidays = holidaysByDate[dateKey] ?? [];
                const dayReminders = remindersByDate[dateKey] ?? [];
                const dayRuleOccurrences = ruleOccurrencesByDate[dateKey] ?? [];
                const isSelected = selectedDate === dateKey;
                const isToday = todayKey === dateKey;

                return (
                  <button
                    key={dateKey}
                    className={`min-h-[4.75rem] rounded-lg border p-1.5 text-left transition-colors sm:min-h-20 sm:p-2 md:min-h-24 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => setSelectedDate(dateKey)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-sm font-semibold leading-none sm:text-base">{day}</span>
                      {isToday && (
                        <span className={`hidden rounded-full px-1.5 py-0.5 text-[10px] sm:inline-flex ${isSelected ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                          Hoje
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1 sm:mt-2">
                      {dayHolidays.length > 0 && <span className="h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background" />}
                      {dayReminders.length > 0 && <span className="h-2.5 w-2.5 rounded-full bg-orange-500 ring-1 ring-background" />}
                      {dayRuleOccurrences.slice(0, 3).map((occurrence) => (
                        <span
                          key={`${occurrence.ruleId}-${dateKey}`}
                          className={`h-2.5 w-2.5 rounded-full ring-1 ring-background ${CALENDAR_RULE_COLOR_CLASSES[occurrence.color].dot}`}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 hidden space-y-1 sm:mt-2 sm:block">
                      {dayHolidays.slice(0, 1).map((holiday) => (
                        <p key={holiday.name} className={`line-clamp-1 text-[11px] ${isSelected ? "text-primary-foreground" : "text-green-700 dark:text-green-400"}`}>
                          {holiday.name}
                        </p>
                      ))}
                      {dayReminders.length > 0 && (
                        <p className={`line-clamp-1 text-[11px] ${isSelected ? "text-primary-foreground" : "text-orange-700 dark:text-orange-400"}`}>
                          {dayReminders.length} lembrete{dayReminders.length > 1 ? "s" : ""}
                        </p>
                      )}
                      {dayRuleOccurrences.slice(0, 1).map((occurrence) => (
                        <p key={occurrence.ruleId} className={`line-clamp-1 text-[11px] ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                          {getCalendarDisplayTitle(occurrence.title)}
                        </p>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
            <CalendarAnnualOverview
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              holidays={holidays}
              reminders={reminders}
              ruleOccurrences={ruleOccurrences}
              onSelectMonth={selectMonth}
            />
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-medium text-primary">Dia selecionado</p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">{formatLongDate(selectedDate)}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {isCalendarLoading ? "Carregando dados do calendario..." : "Lembretes e recorrencias ficam salvos na sua conta."}
              </p>
              {calendarStatus && (
                <div className={`mt-3 rounded-lg border p-3 ${
                  calendarStatusTone === "success"
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                    : "border-destructive/20 bg-destructive/10"
                }`}>
                  <p className={`text-sm ${calendarStatusTone === "success" ? "text-green-700 dark:text-green-300" : "text-destructive"}`}>{calendarStatus}</p>
                  {calendarStatusTone === "error" && (
                    <button
                      className="mt-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-accent"
                      onClick={reloadCalendarData}
                      type="button"
                    >
                      Tentar novamente
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Feriados</h4>
                  {selectedDayHolidays.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedDayHolidays.map((holiday) => (
                        <div key={`${holiday.date}-${holiday.name}`} className="rounded-lg bg-green-50 p-3 text-sm dark:bg-green-950">
                          <p className="font-medium text-green-800 dark:text-green-300">{holiday.name}</p>
                          <p className="text-xs text-green-700 dark:text-green-400">{holiday.type}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Nenhum feriado nacional nesta data.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">Recorrencias do dia</h4>
                  {selectedDayRuleOccurrences.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedDayRuleOccurrences.map((occurrence) => {
                        const color = CALENDAR_RULE_COLOR_CLASSES[occurrence.color];
                        return (
                          <div key={occurrence.ruleId} className={`rounded-lg border p-3 text-sm ${color.border} ${color.badge}`}>
                            <p className="font-medium">{getCalendarDisplayTitle(occurrence.title)}</p>
                            <p className="text-xs opacity-80">
                              {CALENDAR_RULE_TYPE_LABELS[occurrence.type]} · {CALENDAR_RULE_FREQUENCY_LABELS[occurrence.frequency]}
                            </p>
                            {(hasCalendarNotification(occurrence.title) || occurrence.type === "folga" || occurrence.type === "simulado") && (
                              <span className="mt-2 inline-flex rounded-full bg-background/70 px-2 py-0.5 text-xs">
                                aviso 1 dia antes
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Nenhuma recorrencia nesta data.</p>
                  )}
                </div>

                <form onSubmit={addSimuladoReminder} className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Timer className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Marcar simulado</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        O site avisa 1 dia antes no calendário e, se permitido, no dispositivo.
                      </p>
                    </div>
                  </div>
                  <label className="block space-y-1 text-sm">
                    <span className="font-medium text-foreground">Nome da prova</span>
                    <input
                      value={simuladoDraft}
                      onChange={(event) => setSimuladoDraft(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                      placeholder="Ex: Simulado ENEM, Prova de Matemática"
                    />
                  </label>
                  <label className="flex items-start gap-2 rounded-lg bg-background/70 p-2 text-sm text-foreground">
                    <input
                      checked={simuladoNotifyBefore}
                      onChange={(event) => setSimuladoNotifyBefore(event.target.checked)}
                      className="mt-1"
                      type="checkbox"
                    />
                    <span>Avisar 1 dia antes</span>
                  </label>
                  <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                    Marcar simulado
                  </button>
                </form>

                <form onSubmit={addReminder} className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="calendar-reminder">
                    Novo lembrete
                  </label>
                  <input
                    id="calendar-reminder"
                    value={reminderDraft}
                    onChange={(event) => setReminderDraft(event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    placeholder="Ex: revisar funções às 19h"
                  />
                  <label className="flex items-start gap-2 text-sm text-foreground">
                    <input
                      checked={reminderNotifyBefore}
                      onChange={(event) => setReminderNotifyBefore(event.target.checked)}
                      className="mt-1"
                      type="checkbox"
                    />
                    <span>Avisar 1 dia antes</span>
                  </label>
                  <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                    Adicionar lembrete
                  </button>
                </form>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">Lembretes do dia</h4>
                  {selectedDayReminders.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedDayReminders.map((reminder) => {
                        const shouldNotifyReminder = hasCalendarNotification(reminder.title) || isExamLikeCalendarTitle(reminder.title);
                        return (
                          <div key={reminder.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/60 p-3">
                            <div className="min-w-0">
                              <p className="text-sm text-foreground">{getCalendarDisplayTitle(reminder.title)}</p>
                              {shouldNotifyReminder && (
                                <span className="mt-2 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                  aviso 1 dia antes
                                </span>
                              )}
                            </div>
                            <button
                              className="text-xs text-muted-foreground hover:text-destructive"
                              onClick={() => removeReminder(reminder.id)}
                              type="button"
                            >
                              Remover
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Nenhum lembrete para esta data.</p>
                  )}
                </div>

                <form onSubmit={addCalendarRule} className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Nova recorrencia</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      A regra comeca em {formatLongDate(selectedDate)} e usa {WEEK_DAYS[getDateWeekdayIndex(selectedDate)]}.
                    </p>
                  </div>

                  <label className="block space-y-1 text-sm">
                    <span className="font-medium text-foreground">Titulo</span>
                    <input
                      value={ruleTitle}
                      onChange={(event) => setRuleTitle(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                      placeholder="Ex: Folga, revisao, simulado"
                    />
                  </label>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block space-y-1 text-sm">
                      <span className="font-medium text-foreground">Tipo</span>
                      <select
                        value={ruleType}
                        onChange={(event) => {
                          const nextType = event.target.value as CalendarRuleType;
                          setRuleType(nextType);
                          if (!ruleTitle.trim() || ruleTitle === CALENDAR_RULE_TYPE_LABELS[ruleType]) {
                            setRuleTitle(CALENDAR_RULE_TYPE_LABELS[nextType]);
                          }
                          if (nextType === "folga" || nextType === "simulado") {
                            setRuleNotifyBefore(true);
                          }
                        }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                      >
                        {Object.entries(CALENDAR_RULE_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block space-y-1 text-sm">
                      <span className="font-medium text-foreground">Frequencia</span>
                      <select
                        value={ruleFrequency}
                        onChange={(event) => setRuleFrequency(event.target.value as CalendarRuleFrequency)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                      >
                        {Object.entries(CALENDAR_RULE_FREQUENCY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-1 text-sm">
                    <span className="font-medium text-foreground">Cor</span>
                    <select
                      value={ruleColor}
                      onChange={(event) => setRuleColor(event.target.value as CalendarRuleColor)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    >
                      {CALENDAR_RULE_COLOR_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-start gap-2 rounded-lg bg-background/70 p-2 text-sm text-foreground">
                    <input
                      checked={ruleNotifyBefore}
                      onChange={(event) => setRuleNotifyBefore(event.target.checked)}
                      className="mt-1"
                      type="checkbox"
                    />
                    <span>Avisar 1 dia antes</span>
                  </label>

                  <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                    Criar recorrencia
                  </button>
                </form>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">Regras ativas</h4>
                  {rules.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {rules.map((rule) => {
                        const color = CALENDAR_RULE_COLOR_CLASSES[rule.color];
                        return (
                          <div key={rule.id} className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${color.border}`}>
                            <div>
                              <p className="text-sm font-medium text-foreground">{getCalendarDisplayTitle(rule.title)}</p>
                              <p className="text-xs text-muted-foreground">
                                {WEEK_DAYS[rule.weekday]} · {CALENDAR_RULE_FREQUENCY_LABELS[rule.frequency]}
                              </p>
                              <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs ${color.badge}`}>
                                {CALENDAR_RULE_TYPE_LABELS[rule.type]}
                              </span>
                              {(hasCalendarNotification(rule.title) || rule.type === "folga" || rule.type === "simulado") && (
                                <span className="ml-2 mt-2 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                  aviso 1 dia antes
                                </span>
                              )}
                            </div>
                            <button
                              className="text-xs text-muted-foreground hover:text-destructive"
                              onClick={() => removeCalendarRule(rule.id)}
                              type="button"
                            >
                              Remover
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Nenhuma regra recorrente criada.</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="hidden">
          <div>
            {MONTH_NAMES.map((monthName, monthIndex) => {
              const monthHolidays = holidays.filter((holiday) => Number(holiday.date.slice(5, 7)) === monthIndex + 1);
              const monthReminderCount = reminders.filter((reminder) => Number(reminder.date.slice(5, 7)) === monthIndex + 1).length;
              const monthRuleOccurrences = ruleOccurrences.filter((occurrence) => Number(occurrence.date.slice(5, 7)) === monthIndex + 1);
              const monthEventCount = monthReminderCount + monthRuleOccurrences.length;

              return (
                <button
                  key={monthName}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    selectedMonth === monthIndex ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
                  }`}
                  onClick={() => selectMonth(monthIndex)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-foreground">{monthName}</h3>
                    {monthEventCount > 0 && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                        {monthEventCount}
                      </span>
                    )}
                  </div>
                  {monthHolidays.length > 0 || monthRuleOccurrences.length > 0 ? (
                    <div className="mt-3 space-y-1">
                      {monthHolidays.map((holiday) => (
                        <p key={`${holiday.date}-${holiday.name}`} className="text-xs text-muted-foreground">
                          <span className="font-medium text-green-700 dark:text-green-400">{Number(holiday.date.slice(8, 10))}</span> · {holiday.name}
                        </p>
                      ))}
                      {monthRuleOccurrences.slice(0, 4).map((occurrence) => (
                        <p key={`${occurrence.ruleId}-${occurrence.date}`} className="text-xs text-muted-foreground">
                          <span className="font-medium text-primary">{Number(occurrence.date.slice(8, 10))}</span> · {occurrence.title}
                        </p>
                      ))}
                      {monthRuleOccurrences.length > 4 && (
                        <p className="text-xs text-muted-foreground">
                          +{monthRuleOccurrences.length - 4} recorrencia{monthRuleOccurrences.length - 4 > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">Sem feriados cadastrados.</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
    </PageContainer>
  );
}

function CalendarAnnualOverview({
  selectedYear,
  selectedMonth,
  holidays,
  reminders,
  ruleOccurrences,
  onSelectMonth,
}: {
  selectedYear: number;
  selectedMonth: number;
  holidays: CalendarHoliday[];
  reminders: CalendarReminderData[];
  ruleOccurrences: CalendarRuleOccurrenceData[];
  onSelectMonth: (month: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 md:p-6 xl:p-8">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Todos os meses de {selectedYear}</h2>
          <p className="text-sm text-muted-foreground">Visao anual com feriados, lembretes e recorrencias da sua conta.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400"><span className="h-2 w-2 rounded-full bg-green-500" /> Feriado</span>
          <span className="inline-flex items-center gap-1 text-orange-700 dark:text-orange-400"><span className="h-2 w-2 rounded-full bg-orange-500" /> Lembrete</span>
          <span className="inline-flex items-center gap-1 text-primary"><span className="h-2 w-2 rounded-full bg-primary" /> Recorrencia</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {MONTH_NAMES.map((monthName, monthIndex) => {
          const monthHolidays = holidays.filter((holiday) => Number(holiday.date.slice(5, 7)) === monthIndex + 1);
          const monthReminderCount = reminders.filter((reminder) => Number(reminder.date.slice(5, 7)) === monthIndex + 1).length;
          const monthRuleOccurrences = ruleOccurrences.filter((occurrence) => Number(occurrence.date.slice(5, 7)) === monthIndex + 1);
          const monthEventCount = monthReminderCount + monthRuleOccurrences.length;

          return (
            <button
              key={monthName}
              className={`rounded-xl border p-4 text-left transition-colors ${
                selectedMonth === monthIndex ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
              }`}
              onClick={() => onSelectMonth(monthIndex)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground">{monthName}</h3>
                {monthEventCount > 0 && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                    {monthEventCount}
                  </span>
                )}
              </div>
              {monthHolidays.length > 0 || monthRuleOccurrences.length > 0 ? (
                <div className="mt-3 space-y-1">
                  {monthHolidays.map((holiday) => (
                    <p key={`${holiday.date}-${holiday.name}`} className="text-xs text-muted-foreground">
                      <span className="font-medium text-green-700 dark:text-green-400">{Number(holiday.date.slice(8, 10))}</span> · {holiday.name}
                    </p>
                  ))}
                  {monthRuleOccurrences.slice(0, 4).map((occurrence) => (
                    <p key={`${occurrence.ruleId}-${occurrence.date}`} className="text-xs text-muted-foreground">
                      <span className="font-medium text-primary">{Number(occurrence.date.slice(8, 10))}</span> · {occurrence.title}
                    </p>
                  ))}
                  {monthRuleOccurrences.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      +{monthRuleOccurrences.length - 4} recorrencia{monthRuleOccurrences.length - 4 > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">Sem feriados cadastrados.</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FlashcardsView({
  profileId,
  onUserActivity,
}: {
  profileId: string;
  onUserActivity: (activityType: UserActivityType, details?: UserActivityDetails) => void;
}) {
  const [decks, setDecks] = useState<FlashcardDeckData[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [deckStatus, setDeckStatus] = useState("");
  const [deckLoadError, setDeckLoadError] = useState("");
  const [cardsLoadError, setCardsLoadError] = useState("");
  const [isDecksLoading, setIsDecksLoading] = useState(false);
  const [isCardsLoading, setIsCardsLoading] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isCardAnswerVisible, setIsCardAnswerVisible] = useState(false);
  const reviewCount = decks.reduce((total, deck) => total + deck.cards, 0);
  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId) ?? null;
  const dueCards = cards.filter((card) => !card.nextReviewAt || new Date(card.nextReviewAt) <= new Date());
  const currentReviewCard = cards[reviewIndex] ?? null;

  const reloadDecks = async () => {
    setIsDecksLoading(true);
    setDeckLoadError("");
    try {
      const loadedDecks = await loadFlashcardDecks();
      setDecks(loadedDecks);
      setSelectedDeckId((current) =>
        current && loadedDecks.some((deck) => deck.id === current)
          ? current
          : loadedDecks[0]?.id ?? null,
      );
    } catch (error) {
      setDecks([]);
      setSelectedDeckId(null);
      setDeckLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar seus flashcards.");
    } finally {
      setIsDecksLoading(false);
    }
  };

  useEffect(() => {
    reloadDecks();
  }, [profileId]);

  const reloadSelectedDeckCards = async () => {
    if (!selectedDeckId) {
      setCards([]);
      setCardsLoadError("");
      setIsCardsLoading(false);
      return;
    }

    setIsCardsLoading(true);
    setCardsLoadError("");
    try {
      const loadedCards = await loadFlashcards(selectedDeckId);
      setCards(loadedCards);
      setReviewIndex(0);
      setIsCardAnswerVisible(false);
    } catch (error) {
      setCards([]);
      setCardsLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar os cards deste deck.");
    } finally {
      setIsCardsLoading(false);
    }
  };

  useEffect(() => {
    reloadSelectedDeckCards();
  }, [selectedDeckId]);

  const createDeck = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = deckName.trim();
    if (!name) return;


    setDeckStatus("");
    try {
      const savedDeck = await createFlashcardDeck(name);
      setDecks((currentDecks) => [...currentDecks, savedDeck]);
      setSelectedDeckId(savedDeck.id);
      setDeckName("");
      setIsCreatingDeck(false);
      onUserActivity("flashcard", {
        referenceId: savedDeck.id,
        metadata: { flashcardAction: "create_deck", deckName: savedDeck.name },
      });
    } catch (error) {
      setDeckStatus(error instanceof Error ? error.message : "Nao foi possivel criar o deck.");
    }
  };

  const createCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const front = cardFront.trim();
    const back = cardBack.trim();
    if (!selectedDeck || !front || !back) return;


    setDeckStatus("");
    try {
      const saved = await createFlashcardForDeck(selectedDeck, front, back);
      const card = saved.card;
      const nextDeck = saved.deck;
      setCards((currentCards) => [...currentCards, card]);
      setDecks((currentDecks) => currentDecks.map((deck) => deck.id === nextDeck.id ? nextDeck : deck));
      setCardFront("");
      setCardBack("");
      onUserActivity("flashcard", {
        referenceId: card.id,
        metadata: { flashcardAction: "create_card", deckId: nextDeck.id, deckName: nextDeck.name },
      });
    } catch (error) {
      setDeckStatus(error instanceof Error ? error.message : "Nao foi possivel criar o flashcard.");
    }
  };

  const markCardReviewed = async (quality: "again" | "good") => {
    if (!currentReviewCard) return;
    try {
      const reviewedCard = await reviewFlashcard(currentReviewCard, quality);
      setCards((currentCards) => currentCards.map((card) => card.id === reviewedCard.id ? reviewedCard : card));
      setReviewIndex((current) => (cards.length > 0 ? (current + 1) % cards.length : 0));
      setIsCardAnswerVisible(false);
      onUserActivity("flashcard", {
        referenceId: reviewedCard.id,
        metadata: {
          flashcardAction: "review_card",
          quality,
          deckId: reviewedCard.deckId,
          reviewCount: reviewedCard.reviewCount,
          nextReviewAt: reviewedCard.nextReviewAt,
          reviewIntervalDays: reviewedCard.reviewIntervalDays,
        },
      });
    } catch (error) {
      setDeckStatus(error instanceof Error ? error.message : "Nao foi possivel atualizar a revisao.");
    }
  };

  return (
    <PageContainer>
        <div className="flex gap-4 overflow-x-auto border-b border-border">
          <button className="pb-3 px-1 text-sm font-medium text-primary border-b-2 border-primary">
            Meus decks
          </button>
          <button className="pb-3 px-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            Revisão
          </button>
        </div>

        <div className="flex justify-start sm:justify-end">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto md:px-5 md:py-2.5 md:text-base"
            onClick={() => setIsCreatingDeck(true)}
            type="button"
          >
            <Plus className="w-4 h-4" />
            Novo deck
          </button>
        </div>

        {isCreatingDeck && (
          <form onSubmit={createDeck} className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">Criar novo deck</h3>
              <p className="text-sm text-muted-foreground">Dê um nome para organizar seus futuros flashcards.</p>
            </div>
            <input
              autoFocus
              value={deckName}
              onChange={(event) => setDeckName(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              placeholder="Ex: Química - Ligações químicas"
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="w-full rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent sm:w-auto"
                onClick={() => {
                  setDeckName("");
                  setIsCreatingDeck(false);
                }}
              >
                Cancelar
              </button>
              <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 sm:w-auto">
                Criar deck
              </button>
            </div>
            {deckStatus && <p className="text-sm text-destructive">{deckStatus}</p>}
          </form>
        )}

        {isDecksLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-xl border border-border bg-muted" />
            ))}
          </div>
        ) : deckLoadError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5">
            <h3 className="font-semibold text-foreground">Flashcards indisponiveis</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Nao foi possivel carregar seus decks agora. Tente novamente em alguns instantes.
            </p>
            <p className="mt-2 text-sm text-destructive">{deckLoadError}</p>
            <button
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              onClick={reloadDecks}
              type="button"
            >
              Tentar novamente
            </button>
          </div>
        ) : decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {decks.map((deck) => (
              <button
                key={deck.id}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedDeckId === deck.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
                onClick={() => setSelectedDeckId(deck.id)}
                type="button"
              >
                <FlashcardDeck
                  name={deck.name}
                  subtitle={`${deck.cards} cards`}
                  progress={deck.progress}
                  color="bg-purple-100 dark:bg-purple-950"
                  icon={deck.icon}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Nenhum deck criado</h3>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              Crie um deck quando quiser começar a registrar seus próprios flashcards.
            </p>
          </div>
        )}

        {selectedDeck && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <form onSubmit={createCard} className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Adicionar flashcard</h3>
                <p className="text-sm text-muted-foreground">Deck selecionado: {selectedDeck.name}</p>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Frente</span>
                <textarea
                  value={cardFront}
                  onChange={(event) => setCardFront(event.target.value)}
                  className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Pergunta, termo ou conceito"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Verso</span>
                <textarea
                  value={cardBack}
                  onChange={(event) => setCardBack(event.target.value)}
                  className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Resposta ou explicação"
                />
              </label>
              <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 sm:w-auto">
                Salvar flashcard
              </button>
            </form>

            <div className="rounded-xl border border-border bg-card p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Revisao inteligente</h3>
                  <p className="text-sm text-muted-foreground">
                    {dueCards.length} de {cards.length} card{cards.length === 1 ? "" : "s"} para revisar hoje
                  </p>
                </div>
                <CreditCard className="h-5 w-5 text-primary" />
              </div>

              {cardsLoadError ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5">
                  <h4 className="font-semibold text-foreground">Cards indisponiveis</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nao foi possivel carregar os cards deste deck agora.
                  </p>
                  <p className="mt-2 text-sm text-destructive">{cardsLoadError}</p>
                  <button
                    className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    onClick={reloadSelectedDeckCards}
                    type="button"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : isCardsLoading ? (
                <div className="rounded-xl border border-border bg-muted/40 p-6">
                  <div className="h-5 w-28 animate-pulse rounded bg-muted-foreground/10" />
                  <div className="mt-4 h-24 animate-pulse rounded-lg bg-muted-foreground/10" />
                  <p className="mt-4 text-sm text-muted-foreground">Carregando cards...</p>
                </div>
              ) : currentReviewCard ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-background p-5 min-h-44">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Frente</p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        intervalo: {currentReviewCard.reviewIntervalDays} dia{currentReviewCard.reviewIntervalDays === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="mt-2 text-base font-medium text-foreground">{currentReviewCard.front}</p>
                    {isCardAnswerVisible && (
                      <div className="mt-4 rounded-lg bg-primary/5 p-3">
                        <p className="text-xs uppercase tracking-wide text-primary">Verso</p>
                        <p className="mt-2 text-sm leading-relaxed text-foreground">{currentReviewCard.back}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent sm:flex-1"
                      onClick={() => setIsCardAnswerVisible((visible) => !visible)}
                      type="button"
                    >
                      {isCardAnswerVisible ? "Ocultar resposta" : "Mostrar resposta"}
                    </button>
                    <button
                      className="rounded-lg border border-orange-200 px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-300 dark:hover:bg-orange-950 sm:flex-1"
                      onClick={() => markCardReviewed("again")}
                      type="button"
                    >
                      Errei
                    </button>
                    <button
                      className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 sm:flex-1"
                      onClick={() => markCardReviewed("good")}
                      type="button"
                    >
                      Acertei
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Acertei aumenta o intervalo de revisao. Errei agenda o card para amanha.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                  <p className="text-sm text-muted-foreground">Adicione cards neste deck para iniciar a revisão.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {deckStatus && <p className="text-sm text-destructive">{deckStatus}</p>}
    </PageContainer>
  );
}

type EnemQuestion = {
  id: string;
  number: number;
  type: "objective" | "open";
  area: string;
  language?: "english" | "spanish";
  prompt: string;
  support?: string;
  source?: string;
  image?: string;
  imageAlt?: string;
  options?: string[];
};

type EnemExam = {
  id: string;
  title: string;
  year: number;
  day: 1 | 2;
  questionCount: number;
  areas: string[];
  description: string;
  pdfUrl: string;
  officialUrl: string;
  answerKeyUrl: string;
  answerKey: Record<number, string>;
  englishAnswerKey?: Record<number, string>;
  spanishAnswerKey?: Record<number, string>;
  questions: EnemQuestion[];
};

type EnemExamResult = {
  correct: number;
  wrong: number;
  unanswered: number;
  percent: number;
  byArea: Record<string, { correct: number; total: number }>;
};

const ENEM_2025_BRANCO_PORTUGUESE_SHARED_TEXT = [
  "De próprio punho",
  "A escrita e suas tecnologias sofrem interessantes metamorfoses, numa ciranda que vai do simples bilhete aos originais de um livro.",
  "[l. 1-8] Estranhei muito na primeira vez que escutei a expressão “de próprio punho”. Parecia que eu ia bater em alguém. Não era bem o caso. Foi numa situação bancária, dessas bem burocráticas, e eu devia escrever algo bem breve, mas com minhas mãos. Na verdade, o que importava era a autenticidade da minha caligrafia, que à época ainda era mais fluente e firme. Depois dos teclados de computador, ela rateia bastante. Minha letra, hoje, tem uma espécie de alternância: dia sim, dia não, trêmula e firme, forte e fraca, mais rotunda e mais cheia de arestas.",
  "[l. 9-20] É claro que já escrevi muito mais de próprio punho ou, numa palavra mais bonita, manuscrevi (prefiro a mão ao punho, embora ele também seja usado na tarefa). Mas isso não é um feito individual. Em larga medida, é social. Muita gente sente o mesmo que eu, isto é, escreve bem menos usando as mãos, ou melhor, empregando algum tipo de tecnologia (lápis, caneta etc.) para escrever com grafite ou tinta ou giz ou carvão ou sangue e o que mais. É importante lembrar que ainda há gente que não sabe escrever neste país, neste planeta, mas muita gente sabe e tem um combo de tecnologias mais ou menos à disposição para isso. Sou dessas pessoas privilegiadas que têm várias possibilidades, e uma delas nunca deixou de ser o uso das minhas mãos. Ainda hoje, são elas que batucam meu teclado de computador ou que tocam suavemente duas ou três telas sensíveis. Mas não expressam mais a minha letra. No lugar, aparecem Times New Roman, Arial, Calibri e mais uma centena de “letras” à minha escolha. Eu e Deus e o mundo.",
  "[l. 21-29] A despeito desse rol de chances e ferramentas para escrever, o manuscrito nunca deixou de pintar aqui e ali, muitas vezes como obrigação. Na escola, por exemplo, até hoje ele é soberano. No Enem também. Curioso, não? Fico pensando em que espaços e ocasiões ainda uso minha letra. Olhando ao redor, na minha casa, minha letra está em espaços muito delimitados e específicos: bilhetes. Eles estão principalmente na cozinha, em especial na porta da geladeira, a fim de manter a comunicação com meus coabitantes, sempre muito esquecidos ou relapsos. Mas também há bilhetes em post its na minha mesa do escritório, textinhos em garranchos por meio dos quais me comunico comigo mesma, a evitar um comportamento esquecido e relapso.",
  "[l. 30-36] No escritório, costumo ser mais suave comigo mesma, mas também muito mais lacônica, a ponto de nem eu me entender, se passar o tempo. Em todos os casos vai minha letra, menos e mais redonda, a lápis e a tinta azul, em post its rosa-choque, colados precariamente, e todos com destino à lixeira, em breve. Justo porque eles funcionam como lembretes de tarefas e coisas que devem ser vencidas e, claro, substituídas por outras, num fluxo infinito, às vezes ansiogênico, com que a maioria dos adultos (e mais ainda as adultas) precisa conviver.",
  "[l. 37-45] As formas de escrever mudam, as necessidades também, e o resultado é um elenco complexo, em que nada dispensa nada, a depender da tarefa ou da importância das coisas ou de suas funções, claro. A escrita e suas tecnologias incríveis vão se reposicionando, mudando de status, numa ciranda interessante e importante que pode ser vista à luz de certa diversidade que encontra suas oportunidades e seus efeitos, aqui e ali. Não adianta muito pensar sempre como se tudo fosse excludente. Estão aí minha farta comunicação por bilhetes, minha gaveta alegre de post its de toda cor, esperando para serem usados, e o cheque do cartório, em que quase tudo já é digital. “Do punho ao pixel” não é uma frase filosoficamente correta. O negócio é mais “o punho e o pixel”.",
  "RIBEIRO, A. E. Disponível em: https://rascunho.com.br. Acesso em: 16 jan. 2024 (adaptado).",
].join("\n\n");

const ENEM_OFFICIAL_EXAMS: EnemExam[] = [
  {
    id: "enem-2025-white-english",
    title: "ENEM 2025 - Caderno Branco",
    year: 2025,
    day: 1,
    questionCount: 45,
    areas: ["Linguagens", "Português", "Caderno Branco"],
    description: "Questões oficiais de Linguagens do ENEM 2025 em formato nativo, com língua estrangeira, Português, alternativas clicáveis e correção ao finalizar.",
    pdfUrl: "https://download.inep.gov.br/enem/provas_e_gabaritos/2025_PV_impresso_D1_CD3.pdf",
    officialUrl: "https://www.gov.br/inep/pt-br/assuntos/noticias/enem/inep-disponibiliza-provas-e-gabaritos-do-enem-2025",
    answerKeyUrl: "https://download.inep.gov.br/enem/provas_e_gabaritos/2025_GB_impresso_D1_CD3.pdf",
    englishAnswerKey: {
      1: "E",
      2: "A",
      3: "D",
      4: "D",
      5: "D",
    },
    spanishAnswerKey: {
      1: "D",
      2: "C",
      3: "B",
      4: "A",
      5: "D",
    },
    answerKey: {
      6: "C",
      7: "E",
      8: "E",
      9: "D",
      10: "C",
      11: "A",
      12: "E",
      13: "B",
      14: "C",
      15: "A",
      16: "E",
      17: "C",
      18: "B",
      19: "C",
      20: "E",
      21: "C",
      22: "B",
      23: "E",
      24: "B",
      25: "C",
      26: "B",
      27: "A",
      28: "B",
      29: "A",
      30: "C",
      31: "E",
      32: "D",
      33: "B",
      34: "D",
      35: "E",
      36: "B",
      37: "C",
      38: "A",
      39: "B",
      40: "A",
      41: "D",
      42: "D",
      43: "C",
      44: "A",
      45: "B",
    },
    questions: [
      {
        id: "enem-2025-branco-ing-q1",
        number: 1,
        type: "objective",
        area: "Inglês",
        language: "english",
        support: "It is true that all children are special, simply because they are children. But most adults are not special, and children end up as adults pretty quickly. Life then can be difficult and even disappointing. The shock of this may account for the emergence of the “snowflake generation” of university students, who are so delicate they can’t handle controversial ideas being put forward in their lectures. The roots of this fragility run deep in modern culture. So, an approach of the world that states: “Life is wonderful, you’re special and, if you are a good boy/girl, life will be amazing forever” is not a message designed to aid bouncing back from failure or confronting catastrophe. Resilience is not about feeding ego — telling your children how wonderful they are — but strengthening it.",
        prompt: "Nesse texto, a expressão “snowflake generation” é usada para",
        source: "ENEM 2025, Caderno Branco, Questão 01.",
        options: [
          "abordar obstáculos impostos a universitários.",
          "destacar mensagens de incentivo a estudantes.",
          "estimular ações proativas em situações de emergência.",
          "retratar relações conflituosas em ambiente universitário.",
          "apontar posturas de uma juventude avessa a contrariedades.",
        ],
      },
      {
        id: "enem-2025-branco-ing-q2",
        number: 2,
        type: "objective",
        area: "Inglês",
        language: "english",
        support: "A imagem mostra copos de café com mensagens relacionadas ao sono: “What is sleep?”, “Slept 5-7 hours” e “Slept 8-10 hours”.",
        prompt: "Nesse texto, a pergunta “What is sleep?”, em uma das embalagens do produto, está relacionada ao(à)",
        source: "ENEM 2025, Caderno Branco, Questão 02.",
        image: enem2025Q2SleepCups,
        imageAlt: "Foto de copos de café organizados por quantidade de sono.",
        options: [
          "escassez de horas de sono.",
          "estímulo a um descanso de qualidade.",
          "gasto com bebidas que combatem a insônia.",
          "consumo de bebidas que causam dependência.",
          "necessidade de um produto que provoque o sono.",
        ],
      },
      {
        id: "enem-2025-branco-ing-q3",
        number: 3,
        type: "objective",
        area: "Inglês",
        language: "english",
        support: "Glory Ames, from the White Earth reservation, is frustrated that despite the presence of several indigenous reservations near Moorhead, local Halloween stores still feature a western section with costumes such as “pow wow princess”. Even worse, despite a long-running debate about racism and cultural appropriation, often prompted by backlash against celebrities and politicians for donning offensive costumes, people continue to wear such costumes. Last Halloween, Ames spotted a photo on Instagram of a girl dressed as a Native American with a bullet in her forehead. She immediately reported it to the social media platform and had it removed. “They blatantly take certain aspects of our culture, race, religion, and use it for their advantage and ignore the people living it”, said Ames.",
        prompt: "Ao abordar um aspecto da celebração do Halloween, esse texto tem por objetivo",
        source: "ENEM 2025, Caderno Branco, Questão 03.",
        options: [
          "denunciar a violência contra crianças indígenas.",
          "descrever costumes tradicionais em celebrações indígenas.",
          "valorizar as vestimentas características dos povos originários.",
          "criticar a exploração indevida de elementos da identidade indígena.",
          "sugerir ações de combate ao preconceito contra os povos originários.",
        ],
      },
      {
        id: "enem-2025-branco-ing-q4",
        number: 4,
        type: "objective",
        area: "Inglês",
        language: "english",
        support: "My idea of philosophy is that if it is not relevant to human problems, if it does not tell us how we can go about eradicating some of the misery in this world, then it is not worth the name of philosophy. I think Socrates made a very profound statement when he asserted that philosophy is to teach us proper living. In this day and age “proper living” means liberation from the urgent problems of poverty, economic necessity and indoctrination, mental oppression.",
        prompt: "Nesse texto, ao discorrer sobre a relevância da filosofia, a escritora Angela Davis tem por objetivo",
        source: "ENEM 2025, Caderno Branco, Questão 04.",
        options: [
          "criticá-la pela restrição temática.",
          "vinculá-la ao universo acadêmico.",
          "afastá-la da abordagem socrática.",
          "aproximá-la dos problemas sociais.",
          "responsabilizá-la pela pobreza humana.",
        ],
      },
      {
        id: "enem-2025-branco-ing-q5",
        number: 5,
        type: "objective",
        area: "Inglês",
        language: "english",
        support: "Remember the sky that you were born under, know each of the star’s stories. Remember the moon, know who she is. Remember the sun’s birth at dawn. [...] Remember your birth, how your mother struggled to give you form and breath [...] Remember the earth whose skin you are: red earth, black earth, yellow earth, white earth, brown earth, we are earth. Remember the plants, trees, animal life who all have their tribes, their families, their histories, too [...] Remember you are all people and all people are you. Remember you are this universe and this universe is you. Remember all is in motion, is growing, is you.",
        prompt: "Nesse poema, de uma autora de ascendência indígena, o eu lírico ressalta a",
        source: "ENEM 2025, Caderno Branco, Questão 05.",
        options: [
          "potência dos astros celestes.",
          "origem das plantas e dos animais.",
          "importância do apego à terra natal.",
          "relação entre seres humanos e natureza.",
          "conexão entre o tempo real e o tempo imaginário.",
        ],
      },
      {
        id: "enem-2025-branco-esp-q1",
        number: 1,
        type: "objective",
        area: "Espanhol",
        language: "spanish",
        prompt: "Na charge, a diversidade linguística está representada pelo uso de",
        source: "ENEM 2025, Caderno Branco, Questão 01.",
        image: enem2025Q1SpanishDiversity,
        imageAlt: "Charge em espanhol sobre o Dia da Paz, com marcas de fala regional.",
        options: ["estruturas verbais com valor de futuro próximo.","expressões idiomáticas características de uma região.","advérbios característicos do repertório vocabular dos jovens.","marcas da oralidade expressas na representação escrita da fala.","enunciados interrogativos em situação comunicativa com um interlocutor."],
      },
      {
        id: "enem-2025-branco-esp-q2",
        number: 2,
        type: "objective",
        area: "Espanhol",
        language: "spanish",
        support: "¿Qué es la generación Alfa? Hacer cortes generacionales no es una ciencia exacta. Sin embargo, según un análisis de 2018 del centro de estudios Pew Research Center, analizar las generaciones ofrece una manera de entender cómo los acontecimientos globales y los cambios tecnológicos, económicos y sociales interactúan para definir la forma en que la gente ve el mundo. Y está claro cómo ve el mundo la próxima generación: a través de una pantalla. Antes las generaciones se definían a partir de sucesos históricos o sociales importantes. Hoy se delimitan por el uso de determinada tecnología. Ninguna de las generaciones anteriores será comparable a nivel digital con los Alfa.",
        prompt: "Nesse texto, a expressão “a través de una pantalla” evidencia que a geração Alfa estabelece com o mundo uma relação marcada pelo(a)",
        source: "ENEM 2025, Caderno Branco, Questão 02.",
        options: ["conflito etário.","efemeridade da tecnologia.","dependência de recursos digitais.","valor dos acontecimentos sociais.","indiferença em relação a fatos históricos."],
      },
      {
        id: "enem-2025-branco-esp-q3",
        number: 3,
        type: "objective",
        area: "Espanhol",
        language: "spanish",
        support: "Letra da canção Polvorado, de Nacho Vegas, sobre patrões e trabalhadores.",
        prompt: "Na letra da canção Polvorado, ao apresentar as reflexões do eu poético, o cantor espanhol Nacho Vegas",
        source: "ENEM 2025, Caderno Branco, Questão 03.",
        options: ["demonstra o orgulho dos trabalhadores para com artistas de referência.","critica a postura dos patrões frente aos direitos dos trabalhadores.","apresenta propostas para diminuir as desigualdades sociais.","evidencia o diálogo horizontal entre patrão e trabalhadores.","questiona a insalubridade do ambiente de trabalho."],
      },
      {
        id: "enem-2025-branco-esp-q4",
        number: 4,
        type: "objective",
        area: "Espanhol",
        language: "spanish",
        support: "Texto sobre a palavra guagua, usada nas Ilhas Canárias e em países da América do Sul, com sentidos ligados a ônibus e bebê, e possíveis origens em Cuba, no quechua e no mapuche.",
        prompt: "Ao abordar a trajetória da palavra guagua, o texto destaca a",
        source: "ENEM 2025, Caderno Branco, Questão 04.",
        options: ["presença de empréstimo linguístico no espanhol.","validação de um vocábulo por uma instituição renomada.","concorrência entre línguas indígenas e a língua espanhola.","valorização da língua de um país em detrimento da de outro.","disputa entre hispano-americanos e espanhóis por sua origem."],
      },
      {
        id: "enem-2025-branco-esp-q5",
        number: 5,
        type: "objective",
        area: "Espanhol",
        language: "spanish",
        support: "Trecho da canção Cuando yo era chiquito, com versos que retomam ações e sensações da infância: todo quedaba cerca, el sueño me alcanzaba, yo sí podía, me iba pa’l río.",
        prompt: "O recurso que caracteriza essa letra de canção como um relato das memórias do eu poético é o uso de",
        source: "ENEM 2025, Caderno Branco, Questão 05.",
        options: ["palavras no grau diminutivo.","adjetivos na descrição da paisagem.","vocábulos relacionados à fauna cubana.","verbos no pretérito imperfeito do indicativo.","marcas linguísticas de uma variedade caribenha."],
      },
      {
        id: "enem-2025-branco-por-q6",
        number: 6,
        type: "objective",
        area: "Português",
        support: ENEM_2025_BRANCO_PORTUGUESE_SHARED_TEXT,
        prompt: "O elemento que caracteriza esse texto como uma crônica é a",
        source: "ENEM 2025, Caderno Branco, Questão 06.",
        options: [
          "defesa das opiniões da autora sobre um tema de interesse coletivo.",
          "exposição sobre o uso de tecnologias nas práticas de escrita atuais.",
          "abordagem de fatos do contexto pessoal em uma perspectiva reflexiva.",
          "utilização de recursos linguísticos para a interlocução direta com o leitor.",
          "apresentação de acontecimentos segundo a ordem de sucessão no tempo.",
        ],
      },
      {
        id: "enem-2025-branco-por-q7",
        number: 7,
        type: "objective",
        area: "Português",
        support: ENEM_2025_BRANCO_PORTUGUESE_SHARED_TEXT,
        prompt: "No que diz respeito ao gênero bilhete, a autora dessa crônica",
        source: "ENEM 2025, Caderno Branco, Questão 07.",
        options: [
          "ressalta a formalidade na comunicação com as pessoas de sua convivência.",
          "critica a ansiedade causada pela velocidade da comunicação.",
          "expressa a obrigatoriedade de concisão nas anotações.",
          "questiona a prática da escrita de próprio punho.",
          "apresenta a diversidade de usos no cotidiano.",
        ],
      },
      {
        id: "enem-2025-branco-por-q8",
        number: 8,
        type: "objective",
        area: "Português",
        support: ENEM_2025_BRANCO_PORTUGUESE_SHARED_TEXT,
        prompt: "O recurso linguístico usado para marcar a síntese da opinião da autora sobre a temática desenvolvida foi o(a)",
        source: "ENEM 2025, Caderno Branco, Questão 08.",
        options: [
          "emprego da primeira pessoa em “Estranhei muito na primeira vez que escutei a expressão ‘de próprio punho’”. (l. 1)",
          "utilização de locução adverbial em “Na verdade, o que importava era a autenticidade da minha caligrafia”. (l. 3-4)",
          "uso de pronome possessivo em “Minha letra, hoje, tem uma espécie de alternância”. (l. 5-6)",
          "adoção de termo autorreflexivo em “No escritório, costumo ser mais suave comigo mesma”. (l. 30)",
          "substituição da expressão “Do punho ao pixel” (l. 44) pela expressão “o punho e o pixel”. (l. 45)",
        ],
      },
      {
        id: "enem-2025-branco-por-q9",
        number: 9,
        type: "objective",
        area: "Português",
        support: ENEM_2025_BRANCO_PORTUGUESE_SHARED_TEXT,
        prompt: "Nesse texto, o que caracteriza a escrita “de próprio punho” é a letra manuscrita, enquanto a escrita digital é ilustrada pelo(a)",
        source: "ENEM 2025, Caderno Branco, Questão 09.",
        options: [
          "utilização de tecnologias diversificadas.",
          "desenvolvimento de novos recursos de escrita.",
          "possibilidade de interações mediadas por telas.",
          "diversidade de fontes tipográficas que estão disponíveis.",
          "delimitação dos espaços onde a produção textual ocorre.",
        ],
      },
      {
        id: "enem-2025-branco-por-q10",
        number: 10,
        type: "objective",
        area: "Português",
        support: ENEM_2025_BRANCO_PORTUGUESE_SHARED_TEXT,
        prompt: "A autora conclui que as novas tecnologias de escrita",
        source: "ENEM 2025, Caderno Branco, Questão 10.",
        options: [
          "evoluem para facilitar a vida cotidiana.",
          "alcançam diferentes realidades sociais.",
          "coexistem com outras já estabelecidas.",
          "promovem maior agilidade na comunicação.",
          "surgem nos contextos em que são necessárias.",
        ],
      },
      {
        id: "enem-2025-branco-por-q11",
        number: 11,
        type: "objective",
        area: "Português",
        support: "Com 20 anos de experiência no futebol de alto rendimento, Marina, ex-jogadora da seleção brasileira de futebol, salienta que, por trás do espetáculo apresentado nas mídias, com mensagens de motivação e superação, o esporte não é tão inclusivo assim. Para a profissional, é preciso analisar com cautela a ideia romântica que a mídia passa para os telespectadores. A realidade é muito mais dura do que as imagens espetaculosas que principalmente a televisão busca transmitir. Atualmente, as crianças e os jovens vislumbram o sucesso profissional e a boa-vida financeira de poucos atletas que se destacam e estampam os meios de comunicação. Tudo parece ser muito mais fácil do que realmente é quando apenas as conquistas são mostradas.",
        prompt: "Nesse texto, a visão crítica de uma ex-atleta de futebol revela que",
        source: "ENEM 2025, Caderno Branco, Questão 11.",
        options: [
          "os meios de comunicação invisibilizam as dificuldades presentes no esporte.",
          "o treinamento atlético de alto nível é desestimulante para os indivíduos.",
          "o trabalho contínuo é desvalorizado no contexto esportivo profissional.",
          "as ações de incentivo financeiro a jovens atletas são precárias.",
          "as publicações da mídia esportiva rotulam atletas iniciantes.",
        ],
      },
      {
        id: "enem-2025-branco-por-q12",
        number: 12,
        type: "objective",
        area: "Português",
        support: "No predomínio das mulheres pretas brasileiras nos Jogos Olímpicos de 2024, uma coisa chamou a atenção no pódio: elas valorizam a parte psicológica. As medalhistas Beatriz Souza e Rebeca Andrade ressaltam, em entrevistas, a importância da saúde mental. Rebeca afirma que a disputa também é consigo mesma e que precisa controlar cabeça e corpo para se apresentar. Na mesma linha, Rayssa Leal exalta a necessidade da terapia, e a Seleção Brasileira de Futebol de Mulheres tem suporte psicológico no treinamento.",
        prompt: "Nesse texto, as atletas brasileiras defendem o(a)",
        source: "ENEM 2025, Caderno Branco, Questão 12.",
        options: [
          "investimento na modernização de equipamentos.",
          "subordinação do treinamento físico ao mental.",
          "estímulo à competição entre adversárias.",
          "aprimoramento da expressão corporal.",
          "importância da saúde emocional.",
        ],
      },
      {
        id: "enem-2025-branco-por-q13",
        number: 13,
        type: "objective",
        area: "Português",
        support: "A característica fundamental no aprendizado das práticas rituais nos candomblés é o processo iniciático e participante. Durante o período de reclusão, o iniciado passa por ritos e começa a adquirir símbolos materiais, gestos e um repertório linguístico específico das cerimônias. Esse repertório, chamado de “língua de santo” na Bahia, compreende uma terminologia religiosa operacional, de caráter mágico-semântico e de aparente forma portuguesa, mas apoiada em sistemas lexicais de diferentes línguas africanas provavelmente faladas no Brasil escravocrata.",
        prompt: "A “língua de santo” tem sua importância para o patrimônio linguístico brasileiro por",
        source: "ENEM 2025, Caderno Branco, Questão 13.",
        options: [
          "apresentar uma carga semântica mítica.",
          "conservar elementos dos falares dos escravizados.",
          "resgatar expressões portuguesas do período colonial.",
          "decodificar o ritual religioso dos nossos antepassados.",
          "favorecer a compreensão do léxico africano contemporâneo.",
        ],
      },
      {
        id: "enem-2025-branco-por-q14",
        number: 14,
        type: "objective",
        area: "Português",
        support: "O meu medo é entrar na faculdade e tirar zero eu que nunca fui bom de matemática fraco no inglês eu que nunca gostei de química geografia e português o que é que eu faço agora hein mãe não sei. [...] O meu medo é a vida piorar e eu não conseguir arranjar emprego nem de faxineiro nem de porteiro nem de ajudante de pedreiro [...]. O meu medo é que mesmo com diploma debaixo do braço andando por aí desiludido e desempregado o policial me olhe de cara feia e eu acabe fazendo uma burrice sei lá uma besteira será que eu vou ter direito a uma cela especial hein mãe não sei.",
        prompt: "Nesse texto, a reiteração dos medos e das angústias do narrador exprime",
        source: "ENEM 2025, Caderno Branco, Questão 14.",
        options: [
          "inseguranças sobre o futuro familiar.",
          "dilemas resultantes de seu fracasso escolar.",
          "incertezas centradas em sua condição social.",
          "hesitações em relação à sua formação profissional.",
          "preocupações com as políticas públicas assistenciais.",
        ],
      },
      {
        id: "enem-2025-branco-por-q15",
        number: 15,
        type: "objective",
        area: "Português",
        support: "O retrato como gênero da pintura ocidental ficou vinculado às elites, tornando invisíveis as populações que não faziam parte do círculo dominante. Num país de tradição escravocrata e colonizado por europeus como o Brasil, pouquíssimas pessoas negras e indígenas foram retratadas em pintura, e menos ainda identificadas com seus nomes nos retratos. Daí a importância, para a história da arte e para a história brasileira, dos retratos de Dalton Paula.",
        image: enem2025Q15Portraits,
        imageAlt: "Retratos de Zeferina e João de Deus Nascimento, obras de Dalton Paula expostas no Masp.",
        prompt: "Ao dar protagonismo a Zeferina e a João de Deus Nascimento, o artista Dalton Paula evidencia que a(s)",
        source: "ENEM 2025, Caderno Branco, Questão 15.",
        options: [
          "arte pode promover formas de afirmação de identidade social.",
          "comunidades periféricas passam a adquirir o gênero retrato.",
          "personagens retratadas simbolizam a sociedade brasileira.",
          "pintura funciona como instrumento de ascensão social.",
          "imagens tradicionais preservam memórias afetivas.",
        ],
      },
      {
        id: "enem-2025-branco-por-q16",
        number: 16,
        type: "objective",
        area: "Português",
        support: [
          "Símbolos",
          "Eu e tu, ante a noite e o amplo desdobramento",
          "do mar, fero, a estourar de encontro à rocha nua...",
          "Um símbolo descubro aqui, neste momento",
          "esta rocha, este mar... a minha vida e a tua.",
          "",
          "O mar vem, o mar vai, nele há o gesto violento",
          "de quem maltrata e, após, se arrepende e recua.",
          "Como compreendo bem da rocha o sentimento!",
          "São muito iguais, por certo, a minha mágoa e a sua.",
          "",
          "Contemplo neste quadro a nossa triste vida;",
          "tu és dúbio mar que, na sua inconsciência,",
          "tem carinhos de amor e fúrias de demência!",
          "",
          "Eu sou a dor estanque, a dor empedernida,",
          "sou rocha a emergir de um côncavo de areia,",
          "imóvel, muda, isenta e alheia ao mar, alheia.",
          "",
          "MACHADO, G. Poesia completa. Rio de Janeiro: Cátedra/MEC, 1978.",
        ].join("\n"),
        prompt: "Nesse soneto, os traços da estética simbolista são resgatados pelo eu lírico ao",
        source: "ENEM 2025, Caderno Branco, Questão 16.",
        options: [
          "rejeitar as emoções de “amor” e “mágoa”.",
          "expressar a dubiedade do olhar sobre o outro.",
          "representar o “eu” e o “tu” como sujeitos volúveis.",
          "associar a sua inconsciência a elementos da natureza.",
          "metaforizar o conflito amoroso nas imagens de “mar” e “rocha”.",
        ],
      },
      {
        id: "enem-2025-branco-por-q17",
        number: 17,
        type: "objective",
        area: "Português",
        support: "Antes do inverno chegar.\nEla tinha olhinhos brilhantes. Os mesmos de antes. Antes da fome. Antes das 17 mudanças de cidade. Dos sete filhos e dos muitos anos de trabalho dentro e fora de casa.\nEla fazia ambrosia, bolo de fubá e pedacinhos de queijo. Antes do inverno, ela plantava flores novas e diferentes para nos esperar nas próximas férias de verão.\nEla tinha o jeito de menina. Menina sapeca, correndo na grama seca do cerrado. O mesmo jeito de antes. Antes do marido (e mesmo com o marido). Antes do cansaço dos anos. Antes da dureza do trato com a terra.\nEla tinha histórias. Compridas, curtas, divertidas e verdadeiras. Mas isso foi antes. Antes das lembranças se bagunçarem feito bolas coloridas de Natal esperando para serem montadas na árvore.\nEu era sua neta. Antes do Alzheimer chegar, eu era sua neta. Mas ela é e sempre será minha avó.\nPERSON, C. R. Borboletas no estômago. São Paulo: Ed. das Autoras, 2021.",
        prompt: "A narradora, ao resgatar memórias da história de vida da avó, faz uso recorrente da locução “antes de”. Esse termo colabora para a progressão temática na medida em que",
        source: "ENEM 2025, Caderno Branco, Questão 17.",
        options: [
          "relaciona eventos ocorridos simultaneamente.",
          "estabelece uma comparação entre as lembranças.",
          "ressalta fatos que ressignificam o momento presente.",
          "sinaliza uma sequência que denota ações consecutivas.",
          "apresenta uma explicação para as memórias resgatadas.",
        ],
      },
      {
        id: "enem-2025-branco-por-q18",
        number: 18,
        type: "objective",
        area: "Português",
        support: "— Vejo, disse ele com algum acanhamento, que o doutor não é nenhum pé-rapado, mas nunca é bom facilitar... Minha filha Nocência fez 18 anos pelo Natal, e é rapariga que pela feição parece moça de cidade, muito ariscazinha de modos, mas bonita e boa deveras... Coitada, foi criada sem mãe, e aqui nestes fundões. [...]\n— Ora muito que bem, continuou Pereira caindo aos poucos na habitual garrulice, quando vi a menina tomar corpo, tratei logo de casá-la.\n— Ah! é casada? perguntou Cirino.\n— Isto é, é e não é. A coisa está apalavrada. Por aqui costuma labutar no costeio do gado para São Paulo um homem de mão-cheia, que talvez o sr. conheça... o Manecão Doca...\n— Não, respondeu Cirino abanando a cabeça.\n— Pois isso é um homem às direitas, desempenado e trabucador como ele só... fura estes sertões todos e vem tangendo pontes de gado que metem pasmo. Também dizem que tem bichado muito e ajuntado cobre grosso [...].\nTAUNAY, A. d’E. Inocência. Disponível em: www.dominiopublico.gov.br. Acesso em: 29 fev. 2024.",
        prompt: "Nesse trecho, ao se referir à sua filha, o pai de Inocência reproduz os ideais românticos, presentes na",
        source: "ENEM 2025, Caderno Branco, Questão 18.",
        options: [
          "valorização do ambiente rural na formação moral da mulher.",
          "figura decorativa da mulher ante o protagonismo masculino.",
          "equivalência de origem social para a harmonia do casal.",
          "importância do dote como condição para o casamento.",
          "aura de mistério sobre a identidade da jovem.",
        ],
      },
      {
        id: "enem-2025-branco-por-q19",
        number: 19,
        type: "objective",
        area: "Português",
        support: "O Ministério do Esporte no Brasil lançou o programa Maré Inclusiva, em 2024, ano dos Jogos Paralímpicos de Paris. Esse programa visa ampliar as oportunidades para pessoas com deficiência que desejam praticar o surf. O parasurf é a prática do surf adaptada para permitir que pessoas com deficiência pratiquem o esporte em todas as suas categorias, modalidades e manifestações. Para a Secretaria Nacional do Paradesporto, a iniciativa é mais do que um programa de esporte, é uma iniciativa que busca transformar vidas e promover a inclusão por meio do parasurf, criando um legado de igualdade e respeito.",
        prompt: "De acordo com esse texto, o programa voltado ao estímulo da prática do parasurf evidencia a",
        source: "ENEM 2025, Caderno Branco, Questão 19.",
        options: [
          "adesão de diferentes países a programas inclusivos.",
          "preocupação política em atender a demandas paralímpicas.",
          "importância de uma política pública esportiva para a inclusão.",
          "eficiência das iniciativas de inclusão em megaeventos esportivos.",
          "escassez de investimento em práticas corporais de aventura na natureza.",
        ],
      },
      {
        id: "enem-2025-branco-por-q20",
        number: 20,
        type: "objective",
        area: "Português",
        support: "Art. 26-A. Nos estabelecimentos de ensino fundamental e médio, oficiais e particulares, torna-se obrigatório o ensino sobre História e Cultura Afro-Brasileira.\n§ 1º O conteúdo programático a que se refere o caput deste artigo incluirá o estudo da História da África e dos Africanos, a luta dos negros no Brasil, a cultura negra brasileira e o negro na formação da sociedade nacional, resgatando a contribuição do povo negro nas áreas social, econômica e política pertinentes à História do Brasil.\n§ 2º Os conteúdos referentes à História e Cultura Afro-Brasileira serão ministrados no âmbito de todo o currículo escolar, em especial nas áreas de Educação Artística e de Literatura e História Brasileiras.\nBRASIL. Lei n. 10 639/2003. Disponível em: www.gov.br/planalto. Acesso em: 5 maio 2024.",
        prompt: "O emprego da norma-padrão é justificado nesse texto",
        source: "ENEM 2025, Caderno Branco, Questão 20.",
        options: [
          "pela especialização de seu público-alvo.",
          "pela relevância cultural de seu conteúdo.",
          "pelos contextos pedagógicos em que circula.",
          "pela importância para os grupos étnico-raciais.",
          "pelas características do gênero a que pertence.",
        ],
      },
      {
        id: "enem-2025-branco-por-q21",
        number: 21,
        type: "objective",
        area: "Português",
        image: enem2025Q21Bienal,
        imageAlt: "Cartaz da Bienal Internacional do Livro de São Paulo com a frase: Você entra Fernando. E sai Pessoa.",
        support: "Disponível em: www.publishnews.com.br. Acesso em: 19 set. 2024.",
        prompt: "Nesse cartaz publicitário, os recursos verbais e não verbais constroem um argumento que objetiva",
        source: "ENEM 2025, Caderno Branco, Questão 21.",
        options: [
          "divulgar a obra de Fernando Pessoa no Brasil.",
          "valorizar a realização de eventos literários no país.",
          "ressaltar o impacto da leitura na vida das pessoas.",
          "fomentar o turismo cultural na cidade de São Paulo.",
          "evidenciar a influência de Pessoa na literatura brasileira.",
        ],
      },
      {
        id: "enem-2025-branco-por-q22",
        number: 22,
        type: "objective",
        area: "Português",
        image: enem2025Q22Unicef,
        imageAlt: "Cartaz do Unicef com crianças negra e indígena e a frase: Em um mundo de diferenças, enxergue a igualdade.",
        support: "Disponível em: www.unicef.org.br. Acesso em: 15 jan. 2024 (adaptado).",
        prompt: "Nesse cartaz, a utilização de frases que projetam a vida profissional de duas crianças tem como objetivo",
        source: "ENEM 2025, Caderno Branco, Questão 22.",
        options: [
          "sugerir a arrecadação de fundos para o sustento de povos originários no país.",
          "sensibilizar a sociedade sobre os benefícios decorrentes do combate ao racismo.",
          "indicar a importância da orientação vocacional na educação de crianças no Brasil.",
          "chamar a atenção sobre a necessidade de ações voltadas para a educação infantil.",
          "valorizar o trabalho de agências internacionais na luta contra a discriminação racial.",
        ],
      },
      {
        id: "enem-2025-branco-por-q23",
        number: 23,
        type: "objective",
        area: "Português",
        support: "Passando por aqui para lembrar algumas palavras, frases e expressões que nos infernizaram em 2023. Inclusive passando por aqui. Se você for proativo, vai achar que é o novo normal. Estarão na sua zona de conforto. Mas, se for reativo como eu, vai achar que é uma narrativa que precisa ser ressignificada.\nÉ uma questão de empatia. É sobre entregar um discurso mais robusto e empoderado. Sei bem que não tenho lugar de fala para harmonizar certos pontos fora da curva e que preciso aplicar toda a minha resiliência para fazer um realinhamento. O nível de fitness está hoje num sarrafo muito alto.\nO fato é que acho cringe essas falas fora da caixinha. Aliás, falar cringe já é meio cringe. Preciso usar a superação para me reinventar e entender que resenha não tem mais a ver com futebol, é qualquer papo, desde que latente.\nPensando bem, não é tão difícil. Frases feitas são aquelas que entram por um ouvido e saem pelo outro sem um estágio intermediário no cérebro. A boca fala por conta própria, dispensando-nos de pensar. E não tem problema nisso. Ou as ditas frases se incorporam à língua ou morrem e nascem outras. A língua é assim. Simples assim.\nCASTRO, R. Disponível em: www1.folha.uol.com.br. Acesso em: 3 fev. 2024 (adaptado).",
        prompt: "Nesse texto, a estratégia empregada para criticar a constante exposição a palavras, frases e expressões automatizadas é o(a)",
        source: "ENEM 2025, Caderno Branco, Questão 23.",
        options: [
          "menção feita à efemeridade de alguns usos linguísticos aleatórios.",
          "subjetividade marcada pela reflexão que se desenvolve em primeira pessoa.",
          "efeito estilístico da repetição intencional da palavra “assim” no último parágrafo.",
          "sedução sugerida pelo envolvimento direto do leitor marcado nos usos de “você” e “sua”.",
          "humor gerado pelo uso das estruturas linguísticas que são objeto da reflexão desenvolvida.",
        ],
      },
      {
        id: "enem-2025-branco-por-q24",
        number: 24,
        type: "objective",
        area: "Português",
        support: "TEXTO I\nA Ilha do Ferro, situada a 18 km do município de Pão de Açúcar, não é uma ilha, como o nome indica. A história do povoado é semelhante à de inúmeros outros que encontramos às margens do Rio São Francisco, entre Alagoas e Sergipe. O que torna diferente o lugar é sua gente. Hoje, dezenas de artistas populares povoam a Ilha do Ferro, trabalhando principalmente com o entalhe em madeira. Onde pessoas comuns enxergariam apenas troncos e galhos retorcidos, eles vislumbram bancos, bonecos, pássaros, cobras e bailarinas. “Às vezes, você passa por um pedaço de madeira uma vez e não vê nada, passa cinco vezes por ele e não vê nada”, conta um dos artistas, “mas, na décima vez, você consegue enxergar alguma forma nesse pedaço de madeira e transformá-lo em arte”.",
        image: enem2025Q24IlhaFerro,
        imageAlt: "Bailarino entalhado em gravetos de madeira, artesanato da Ilha do Ferro.",
        prompt: "A originalidade do trabalho dos artistas da Ilha do Ferro se dá pela",
        source: "ENEM 2025, Caderno Branco, Questão 24.",
        options: [
          "reutilização de materiais para redução do impacto ambiental.",
          "ressignificação da matéria-prima atribuindo-lhe nova função.",
          "reprodução em madeira de modelos artísticos canônicos.",
          "representação de práticas corporais da comunidade.",
          "replicação seriada para distribuição em larga escala.",
        ],
      },
      {
        id: "enem-2025-branco-por-q25",
        number: 25,
        type: "objective",
        area: "Português",
        support: "TEXTO I\nOs trabalhos da exposição Adriana Varejão: suturas, fissuras, ruínas colocam em pauta o exame da história visual, das tradições iconográficas europeias e do fazer artístico ocidental. O corte, a rachadura, o talho e a fissura são elementos de narrativas recorrentes nos trabalhos da artista desde 1992. As produções recentes incluem pinturas tridimensionais de grande escala das séries Ruínas de charque e Línguas.",
        image: enem2025Q25Varejao,
        imageAlt: "Obra Azulejaria em carne viva, de Adriana Varejão.",
        prompt: "A utilização de recursos visuais como suturas, cortes e ruínas por Adriana Varejão, na obra Azulejaria em carne viva, remete à(s)",
        source: "ENEM 2025, Caderno Branco, Questão 25.",
        options: [
          "sobreposição da cultura brasileira à arte portuguesa.",
          "manutenção da representação realista na arte brasileira.",
          "violências desencadeadas pelo processo colonial brasileiro.",
          "desigualdades nos incentivos à produção artística brasileira.",
          "negligência na conservação do patrimônio arquitetônico luso-brasileiro.",
        ],
      },
      {
        id: "enem-2025-branco-por-q26",
        number: 26,
        type: "objective",
        area: "Português",
        image: enem2025Q26DoceMistura,
        imageAlt: "Infográfico Doce mistura sobre nomes regionais de pratos à base de milho.",
        support: "Revista Língua Portuguesa, n. 31, maio 2008 (adaptado).",
        prompt: "Esse texto, que apresenta um prato da culinária brasileira, evidencia",
        source: "ENEM 2025, Caderno Branco, Questão 26.",
        options: [
          "valor afetivo nas nomenclaturas.",
          "variedade linguística entre regiões.",
          "disputa regional pelo melhor prato.",
          "modos de preparo de um mesmo alimento.",
          "paladares diversificados entre diferentes estados.",
        ],
      },
      {
        id: "enem-2025-branco-por-q27",
        number: 27,
        type: "objective",
        area: "Português",
        support: "A diferença entre briga e luta é a existência de juízes e medalhas? A briga desumaniza o outro e pode até matá-lo. Já na luta, as intenções do outro são consideradas sua proposta combativa e suas habilidades, enfim, sua meta de vencer. Na luta, o desenvolvimento passa pelo contato com a agressividade, a raiva, a frustração, o orgulho, a determinação e a fraqueza. Daí também a luta não ser apenas com o outro, mas consigo mesmo, num combate contra as próprias limitações, sobretudo, contra o próprio orgulho.\nBARREIRA, C. A briga desumaniza. A luta, não. O Estado de S. Paulo, 22 ago. 2010 (adaptado).",
        prompt: "Esse texto apresenta as diferenças entre briga e luta, na medida em que aponta o(a)",
        source: "ENEM 2025, Caderno Branco, Questão 27.",
        options: [
          "superação pessoal na luta.",
          "violência evidenciada na luta.",
          "predomínio de regras na briga.",
          "desafio externo presente na luta.",
          "habilidade desenvolvida na briga.",
        ],
      },
      {
        id: "enem-2025-branco-por-q28",
        number: 28,
        type: "objective",
        area: "Português",
        support: [
          "Pequenino morto",
          "",
          "Tange o sino, tange, numa voz de choro,",
          "Numa voz de choro... tão desconsolado...",
          "No caixão dourado, como em berço de ouro,",
          "Pequenino, levam-te dormindo... Acorda!",
          "Olha que te levam para o mesmo lado",
          "De onde o sino tange numa voz de choro...",
          "Pequenino, acorda!",
          "",
          "Que caminho triste, e que viagem! Alas",
          "De ciprestes negros a gemer no vento;",
          "Tanta boca aberta de famintas valas",
          "A pedir que as fartem, a esperar que as encham...",
          "Pequenino, acorda! Recupera o alento,",
          "Foge da cobiça dessas fundas valas",
          "A pedir que as encham.",
          "",
          "CARVALHO, V. Poemas e canções. Rio de Janeiro: Saraiva, 1962 (fragmento).",
        ].join("\n"),
        prompt: "Nesse fragmento do poema, o sentimento de luto adquire contornos expressivos e é intensificado pela",
        source: "ENEM 2025, Caderno Branco, Questão 28.",
        options: [
          "descrição da paisagem de um cemitério.",
          "recusa do eu lírico à irreversibilidade da morte.",
          "sonoridade dos versos produzida pela pontuação.",
          "religiosidade evocada como forma de fortalecimento.",
          "impressão de sonho na construção da estrutura poética.",
        ],
      },
      {
        id: "enem-2025-branco-por-q29",
        number: 29,
        type: "objective",
        area: "Português",
        support: "Só entende os corações desse lugar quem mergulha nesse mar a perder de vista e recoberto de cana caiana, cana fita, cana roxa, cana-de-macaco, açúcar, melado, rapadura, aguardente, fumo, mandioca, quiabos, pimentas, moendas, frutas, fruta-pão, sobrados, senzalas, tachos, casa de purgar. Um reino dentro de outro, com tudo o que se tem direito: reis, rainhas, príncipes e princesas, bobos da corte, cortesãos, conselheiros e escravos, muitos escravos. [...]\nA corte do massapé, como qualquer outra na história da humanidade, fazia tudo para não deixar escapar nenhum mísero grão dos seus domínios para quem estivesse de fora do seu apertado círculo. Os nomes se repetiam de pai para filho, para sobrinho, para netos e bisnetos, de forma concêntrica e repetitiva, para que não pairasse nenhuma dúvida de que são todos da mesma parentela. As farinhas todas num mesmo saco brasonado.\nCRUZ, E. A. Água de barrela. Rio de Janeiro: Malê, 2018.",
        prompt: "Nesse fragmento, o narrador enumera o resultado do trabalho com a terra, o qual, no contexto em que aparece,",
        source: "ENEM 2025, Caderno Branco, Questão 29.",
        options: [
          "espelha a permanência dos privilégios de classe.",
          "oferece um panorama da população do campo.",
          "mostra os benefícios da fartura na agricultura.",
          "defende a importância da atividade coletiva.",
          "valoriza o trabalho ao longo das gerações.",
        ],
      },
      {
        id: "enem-2025-branco-por-q30",
        number: 30,
        type: "objective",
        area: "Português",
        image: enem2025Q30Galileu,
        imageAlt: "Capa da revista Galileu com a chamada: Você não está sozinho.",
        support: "Disponível em: https://revistagalileu.globo.com. Acesso em: 18 jun. 2024 (adaptado).",
        prompt: "Com base na relação dos elementos não verbais com a frase “VOCÊ (NÃO) ESTÁ SOZINHO”, nessa capa de revista, a função poética fica evidente, pois",
        source: "ENEM 2025, Caderno Branco, Questão 30.",
        options: [
          "essa frase informa sobre os riscos de um determinado comportamento social.",
          "o conteúdo da mensagem expressa a atitude do enunciador sobre o tema.",
          "a construção dessa frase possibilita mais de uma interpretação.",
          "essa frase estabelece um diálogo direto com o leitor.",
          "a linguagem utilizada volta-se para si mesma.",
        ],
      },
      {
        id: "enem-2025-branco-por-q31",
        number: 31,
        type: "objective",
        area: "Português",
        support: "Margot Robbie foi criticada por “não ser bonita o suficiente” para interpretar a Barbie. Recentemente, Paolla Oliveira foi chamada de gorda. Só fico pensando o que serei eu com mais de 50 (também no peso), com a minha aparência comum. O corpo da mulher vive um reality show permanente: é sempre vigiado e fiscalizado, como se fosse domínio público. A mulher que não atender aos estereótipos está sujeita a sofrer penalidades básicas, como distúrbios, obsessões, medo do próprio corpo e, é claro, dietas à base de rúcula. “A dieta é o sedativo político mais potente na história das mulheres”, escreveu Naomi Wolf, em 1991. A regra é não haver singularidade, mascarar a passagem do tempo, imobilizar a beleza (já imaginou como isso seria enfadonho?). O mandamento é obedecer às regras sociais do bom comportamento corporal, “como deve ser”, não nos atos, mas na forma.\nKORICH, B. S. Disponível em: www1.folha.uol.com.br. Acesso em: 22 jan. 2024 (adaptado).",
        prompt: "Nesse texto, para introduzir a ideia de que a fiscalização permanente sobre o corpo afeta todas as mulheres, a autora",
        source: "ENEM 2025, Caderno Branco, Questão 31.",
        options: [
          "faz um comentário sobre sua própria imagem.",
          "destaca avaliações particulares entre parênteses.",
          "cita um formato de programa influente no segmento da beleza.",
          "utiliza declaração de uma jornalista como argumento de autoridade.",
          "enumera críticas à aparência de mulheres consideradas padrões de beleza.",
        ],
      },
      {
        id: "enem-2025-branco-por-q32",
        number: 32,
        type: "objective",
        area: "Português",
        support: "I: o nome do filme é roupa suja ... eu assisti na minha casa ... com minha mãe ... tinha um ... o filme era sobre um homem que colocaram ... trocaram as bolsas ... daí o homem levou uma bolsa cheia de dinheiro sem ele saber que na mala dele ... pensando que era dele mas era errada ... quando ele chegou onde ele ia trabalhar ... tinha uma moça tentando abrir a porta pra fazer entrevista com uns cantores lá que tinham ... daí ele perguntou ... “você tá tentando abrir a porta?”... daí ele ... “não ... não” ... daí ele disse ... “ah ... tá ... sim” ... daí ela ... “é ... e quero fazer uma entrevista” ... daí ele disse ... “você quer entrar ... então pode entrar” ... daí entraram ... daí ficaram lá ... quando ela entrou e queria fazer a entrevista um homem num deixou ... daí a mulher pegou ... subiu onde o homem tava trabalhando ... rapaz né ... onde ele tava trabalhando e ficou lá e dando o show ...\nCUNHA, M. A. F. Corpus discurso & gramática: a língua falada e escrita na cidade de Natal. Disponível em: https://deg.uff.br. Acesso em: 4 dez. 2024 (adaptado).",
        prompt: "Nesse texto, a repetição da forma “daí” revela",
        source: "ENEM 2025, Caderno Branco, Questão 32.",
        options: [
          "a necessidade de adequação ao interlocutor.",
          "a origem regional do locutor.",
          "a escolaridade do falante.",
          "uma estratégia presente na linguagem oral.",
          "uma ênfase em determinadas partes do discurso.",
        ],
      },
      {
        id: "enem-2025-branco-por-q33",
        number: 33,
        type: "objective",
        area: "Português",
        support: "Uruku\nUrucum\nRocou\n(Bixa orellana)\nMoju, dono da água, não gosta do cheiro de urucum. Mani’ojarã, dono da mandioca, e os donos das outras plantas cultivadas também não. Eles não suportam. Por isso, os Wajãpi se untam de urucum, deixam o rosto vermelho e se perfumam com seu aroma agradável. Além disso, os seres agressores, os jarã (donos) e os espíritos terrestres, gostam do cheiro dos fluidos humanos, do sangue, do suor. Então, o urucum os dissimula, protegendo as pessoas que vão caçar, caminhar pela floresta, que estão sendo perturbadas por espíritos em sonhos ou que estão em resguardo, como os doentes. O seu uso é tão cotidiano que os Wajãpi o plantam na aldeia, para ter sempre pertinho. Como o urucum não tem jarã, não tem problema nenhum em arrancar e usar para pintar.\nSTRAPPAZZON, A. I.; SIGOLO, R. P. Jardins da história: medicinas indígenas. Recife: ObservaPICS, 2022.",
        prompt: "Esse verbete contribui para a preservação do patrimônio linguístico nacional, pois apresenta uma",
        source: "ENEM 2025, Caderno Branco, Questão 33.",
        options: [
          "explicação de um rito medicinal do povo Wajãpi.",
          "definição de um termo na perspectiva ancestral indígena.",
          "relação de equivalência entre vocábulos de diferentes línguas indígenas.",
          "atualização de saberes tradicionais dos povos indígenas brasileiros.",
          "descrição das propriedades científicas de plantas silvestres.",
        ],
      },
      {
        id: "enem-2025-branco-por-q34",
        number: 34,
        type: "objective",
        area: "Português",
        image: enem2025Q34Redes,
        imageAlt: "Texto visual Teias de afeto e poesia, de Roseana Murray e Eliardo França, sobre sentidos da palavra rede.",
        support: "MURRAY, R.; KLIGERMAN, E. Teias de afeto e poesia. Disponível em: https://roseanamurray.com. Acesso em: 5 maio 2024.",
        prompt: "Nesse texto, a autora aborda diferentes sentidos da palavra “rede” para evidenciar",
        source: "ENEM 2025, Caderno Branco, Questão 34.",
        options: [
          "as formas de comunicação em meios digitais.",
          "a necessidade de atualização das mídias sociais.",
          "os conflitos de identidade dos usuários da internet.",
          "o impacto das tecnologias nas interações humanas.",
          "os desejos de compartilhar vivências com os amigos.",
        ],
      },
      {
        id: "enem-2025-branco-por-q35",
        number: 35,
        type: "objective",
        area: "Português",
        support: "Muitos pensam que narrativa curta é sinônimo de conto, perdendo de vista gêneros que, por tradição ruim, continuam à margem da nobreza. Acontece que o conto tem uma densidade específica, centrando-se na exemplaridade de um instante da condição humana, sem que essa exemplaridade se refira à valoração moral, já que uma grande mazela pode muito bem exemplificar uma das nossas faces. A crônica não tem essa característica. Conservou a marca do registro circunstancial feito por narrador-repórter que relata um fato para muitos leitores que formam um público determinado.\nMas que público é esse? Sendo a crônica uma soma de jornalismo e literatura (daí a imagem do narrador-repórter), dirige-se a uma classe que tem preferência pelo jornal em que ela é publicada, o que significa uma espécie de censura ou, pelo menos, de limitação: a ideologia do veículo corresponde ao interesse dos seus consumidores, direcionados pelos proprietários dos periódicos e/ou pelos editores-chefes da redação. Ocorre ainda o limite de espaço, uma vez que a página comporta várias matérias, o que impõe a cada uma delas um número restrito de laudas, obrigando o redator a explorar, da maneira mais econômica possível, o pequeno espaço de que dispõe. É dessa economia que nasce sua riqueza estrutural.\nSÁ, J. A crônica. São Paulo: Ática, 1987 (adaptado).",
        prompt: "De acordo com esse texto, o aspecto tecnológico que influencia a composição do gênero crônica advém da",
        source: "ENEM 2025, Caderno Branco, Questão 35.",
        options: [
          "conexão ideológica.",
          "densidade temática.",
          "ênfase no público leitor.",
          "apresentação de uma moral.",
          "restrição espacial do suporte.",
        ],
      },
      {
        id: "enem-2025-branco-por-q36",
        number: 36,
        type: "objective",
        area: "Português",
        image: enem2025Q36ViolenciaEscola,
        imageAlt: "Material sobre violência contra mulheres na escola, com referência à Lei Maria da Penha.",
        support: "Disponível em: www.tjdft.jus.br. Acesso em: 15 out. 2024 (adaptado).",
        prompt: "Esse texto trata de um problema social com o propósito de",
        source: "ENEM 2025, Caderno Branco, Questão 36.",
        options: [
          "divulgar campanha virtual contra casos de feminicídio.",
          "promover engajamento do setor educacional na luta contra a violência.",
          "comparar o impacto da violência na qualidade de vida de meninas e meninos.",
          "ressaltar a importância da segurança dos estudantes no ambiente escolar.",
          "dar visibilidade a estudos e pesquisas do setor de segurança.",
        ],
      },
      {
        id: "enem-2025-branco-por-q37",
        number: 37,
        type: "objective",
        area: "Português",
        support: "Do rádio ao podcast\nDesde a disseminação do rádio no Brasil, entre as décadas de 1920 e 1930, principalmente no governo de Getúlio Vargas, as pessoas passaram a dedicar uma parte de seu dia para escutar notícias, novelas, músicas e eventos esportivos em aparelhos de som. O radiojornalismo, por sua vez, teve seu pontapé inicial durante a Revolução Constitucionalista (1932) e se desenvolveu durante a Segunda Guerra Mundial (1939-1945).\nQuando a TV surgiu, esperava-se que o rádio fosse totalmente substituído, porém ele se manteve em alta, pois o sinal de televisão não cobria todos os lugares, diferentemente do rádio. Com o surgimento da internet, dos smartphones e de outros dispositivos móveis, o rádio foi incorporado a essas novas tecnologias até o desenvolvimento da web rádio e do podcast, mostrando-se um meio de comunicação versátil e democrático na área jornalística.\nPara um pesquisador da Universidade Federal de Uberlândia (UFU), o rádio não se tornou obsoleto, visto que não deixou de ser consumido e se reinventou com o tempo. “O podcast é uma continuação, uma evolução natural do rádio”, opina.\nALVES, A.; ALVES, C. Disponível em: https://comunica.ufu.br. Acesso em: 19 abr. 2024 (adaptado).",
        prompt: "Ao abordar a trajetória dos meios de comunicação, esse texto propõe uma reflexão sobre a",
        source: "ENEM 2025, Caderno Branco, Questão 37.",
        options: [
          "tecnologia digital e seus desdobramentos no desenvolvimento da televisão.",
          "evolução da tecnologia digital com o predomínio do podcast sobre o rádio.",
          "permanência do rádio e sua evolução por meio da tecnologia digital.",
          "influência da televisão sobre os programas de radiojornalismo.",
          "interferência da tecnologia digital nas interações humanas.",
        ],
      },
      {
        id: "enem-2025-branco-por-q38",
        number: 38,
        type: "objective",
        area: "Português",
        support: "Desenvolvendo-se nesse meio, é natural que Celina, filha mais velha de D. Adozinda, tivesse seus pequenos flirts com alguns desses rapazes, muito íntimos da casa e trazendo-lhe da cidade presentes de doces, de balas de ovo, de jornais ilustrados ou de frutas.\nAs irmãs mais novas iam ao colégio; ela ficava, enchendo o tempo com uns crochês vagarosos, costuras leves, a leitura dos folhetins dos jornais; e o Gilberto, que raramente saía, andava sempre ao seu lado, muito caído por esse tipo um pouco mórbido de menina anêmica [...].\nO Gilberto não valia nada, mas quem sabe se apareceria outro, simplório e sincero como ele? E a filha, com os seus dezessete anos, começava a embaraçá-la um pouco, nesse difícil papel de virgem numa casa de pensão, cheia de rapazes. Ora, o melhor era esperar, dar tempo ao tempo... E o Gilberto e a Celina continuaram a namorar-se, ele cândido, ela dúbia; enquanto o Coronel Juvenato, que deixara a mulher em Sobral para tratar de uma concessão rendosa com os políticos do Rio, ia agora monopolizando, como protetor mais importante, as alegres visitas matinais da viúva, que já lhe levava sempre o café, mas sem flores colhidas no jardim, ainda rociadas de orvalho, porque o cearense não dava para essas coisas de poesia. Era rápido, prático, e não admitia bobagens. Por isso, todos os sábados à noite, ele dizia a D. Adozinda com um tremor lúbrico nas banhas moles da face, os olhinhos vivos pestanejando:\n- A senhora não se esqueça que amanhã é domingo... Leve-me cedo o café, hein?... que eu tenho de ir à missa...\n- Pois não, pois não, Coronel! fique descansado - respondia a viúva do Ferreira, muito atenciosamente, tirando-lhe umas caspas da gola do paletó, com a mão repolhuda.\nOs outros hóspedes riam-se à socapa; e no domingo o café não faltava, bem cedinho...\nDOLORES, C. A luta. Rio de Janeiro: Ímã, s.d.",
        prompt: "Nesse trecho, ao explorar a descrição como recurso que demarca impressões e pontos de vista, o narrador cria uma ambiência sugestiva do(a)",
        source: "ENEM 2025, Caderno Branco, Questão 38.",
        options: [
          "escárnio relacionado à degradação moral dos indivíduos.",
          "cenário urbano marcado por condições de insalubridade.",
          "persistência do sentimentalismo explorado pelos folhetins.",
          "prática do enriquecimento ilícito visto nas grandes cidades.",
          "desigualdade de gênero acentuada pela baixa escolarização.",
        ],
      },
      {
        id: "enem-2025-branco-por-q39",
        number: 39,
        type: "objective",
        area: "Português",
        image: enem2025Q39BancoTatu,
        imageAlt: "Banco indígena Tatu Kamayurá 1, feito em madeira.",
        support: "TEXTO I\nOrigem, tradição e resistência\nFoi sentada em seu banco de quartzo que a avó do universo, moradora da Maloca do Céu, criou os homens, os animais, a terra e as águas. O banco foi entregue aos ancestrais dos atuais Tukano, que passaram a reproduzi-lo em madeira. O mito Tukano, povo do noroeste da Amazônia que ainda hoje fabrica os bancos em seu estilo tradicional, indica o lugar dos bancos entre os objetos sagrados, ao mesmo tempo parte do universo primitivo e fonte do poder de criação. A presença nos mitos de origem de alguns povos atesta a antiguidade da arte de talhar bancos: os primeiros registros do uso desses objetos entre ameríndios das terras baixas da América do Sul, do Caribe e da América Central datam de, pelo menos, 4 mil anos.\nASSIS, R.; MENDES JR., L. Bancos indígenas do Brasil. São Paulo: BEI Comunicação, 2013.\n\nTEXTO II\nKAMAYURÁ, Y. Tatu Kamayurá 1. Madeira, 61 × 24 × 20 cm. Xingu (MT), s.d. Disponível em: www.colecaobei.com.br. Acesso em: 15 out. 2024.",
        prompt: "Os textos I e II demonstram, na confecção dos bancos, uma íntima relação de sacralidade entre o ser humano e a natureza, perceptível por meio da",
        source: "ENEM 2025, Caderno Branco, Questão 39.",
        options: [
          "representação realista de animais, mostrando o domínio do homem sobre a natureza.",
          "manutenção da herança cultural, atribuindo nova função aos elementos da fauna.",
          "anulação dos traços que permitem reconhecer o animal representado.",
          "presença de grafismos na forma animal representada no banco.",
          "criação de figuras fantásticas baseadas em formas animais.",
        ],
      },
      {
        id: "enem-2025-branco-por-q40",
        number: 40,
        type: "objective",
        area: "Português",
        support: "TRADUZINDO O JURIDIQUÊS\n“Denego a liminar pleiteada na exordial, inobstante após a oitiva da parte adversa e da dilação probatória possa lograr alcançar um outro epílogo para o deslinde da quaestio sub examine.”\nTRADUÇÃO\nNão atendo, por ora, a liminar requerida na petição inicial, ainda que possa chegar a uma outra conclusão após ouvir a outra parte e avaliar as provas produzidas.\n\nProposta de emenda à Constituição 269 de 2013. Aplica-se aos Governadores e Prefeitos o Regime Geral de Previdência Social, vedada a concessão graciosa, após o término do mandato, de vantagem pecuniária, verba de representação, pensão ou subsídio.\nTRADUÇÃO\nTorna-se proibido pagar benefícios vitalícios para ex-prefeitos e ex-governadores.\nSuperinteressante, n. 322, ago. 2013 (adaptado).",
        prompt: "Nesse texto, contribui para a construção da ironia a tradução das passagens escritas em “juridiquês” para uma variedade",
        source: "ENEM 2025, Caderno Branco, Questão 40.",
        options: [
          "padrão, que alcança o público em geral.",
          "histórica, que registra a evolução das leis.",
          "coloquial, que reproduz as relações sociais cotidianas.",
          "erudita, que resgata a origem latina da língua portuguesa.",
          "técnica, que facilita a circulação de informações no sistema judiciário.",
        ],
      },
      {
        id: "enem-2025-branco-por-q41",
        number: 41,
        type: "objective",
        area: "Português",
        support: "Em 1995, os Jenipapo-Kanindé quebraram a tradição da sucessão masculina e nomearam Maria de Lourdes da Conceição Alves como sua líder. Desde então, a Cacique Pequena guia o povo em grandes batalhas pelo direito a terra, educação, saúde e cidadania. Hoje, a anciã de 73 anos prepara duas filhas para lhe sucederem quando ela “tombar e pai Tupã a levar”.\nHoje, 129 famílias do município de Aquiraz são reconhecidas pela Fundação Nacional dos Povos Indígenas (Funai) como indígenas, principal luta de Pequena para o seu povo desde o início. “Em 1995, fui a Brasília e tive a oportunidade de conversar com o presidente da Funai. Pedi que mandasse o povo dele na aldeia para fazer o estudo da nossa mãe-terra e de nós”. Dois anos depois, vieram os antropólogos, que concluíram: “Nós era índio sim!”, diz ela.\nHá cerca de oito anos, Pequena adoeceu e ficou entre a vida e a morte. Nesse momento, precisou escolher, entre os 16 filhos, quem assumiria sua missão quando partisse. Reunida, a família decidiu sobre a sucessão. “Disseram que, como eu era a primeira cacique mulher do Ceará, acharam melhor eu colocar duas filhas”.\nDisponível em: www.sesc-ce.com.br. Acesso em: 15 set. 2024 (adaptado).",
        prompt: "Ao abordar a realidade da etnia Jenipapo-Kanindé, essa reportagem cumpre uma função social quando destaca o(a)",
        source: "ENEM 2025, Caderno Branco, Questão 41.",
        options: [
          "quantidade de famílias indígenas em Aquiraz.",
          "força da tradição nas comunidades indígenas.",
          "estudo sobre a demarcação das terras indígenas.",
          "protagonismo feminino na linha sucessória desse povo.",
          "reconhecimento dessa comunidade pelo governo brasileiro.",
        ],
      },
      {
        id: "enem-2025-branco-por-q42",
        number: 42,
        type: "objective",
        area: "Português",
        support: "Porque ler para crianças é um ato de amor\nParece que, com o avanço da tecnologia, os livros têm enfrentado cada vez mais concorrência. Por isso, é nossa função lembrar a importância da leitura em todas as fases da vida, mas principalmente na primeira infância (entre 0 e 5 anos), quando o desenvolvimento das crianças acontece de forma mais intensa.\nO ato de ler com uma criança ou ler para ela vai muito além de apenas aproveitar uma história em conjunto. É um laço de amorosidade, porque oferece a ela ferramentas que vão ajudá-la a crescer forte e independente.\nSe você precisa de uma motivação extra para entrar nessa rede de incentivo, fique ligado nos motivos a seguir. Adotar esse hábito em casa:\n1 - cria um laço emocional com a criança;\n2 - ajuda no desenvolvimento das capacidades cognitivas;\n3 - ensina sobre o mundo;\n4 - incentiva o processamento de informações e a imaginação.\nDisponível em: www.huffpost.com.br. Acesso em: 22 maio 2018 (adaptado).",
        prompt: "Para persuadir o interlocutor sobre a importância de ler para as crianças, esse texto recorre à estratégia de",
        source: "ENEM 2025, Caderno Branco, Questão 42.",
        options: [
          "propor uma condição aos pais, pelo emprego da conjunção “se”.",
          "relativizar a opinião apresentada pelo autor, com o uso de “Parece que”.",
          "empregar uma linguagem metafórica, com o uso da expressão “laço de amorosidade”.",
          "enumerar razões pertinentes a esse ato, como no exemplo “ensina sobre o mundo”.",
          "implicar o autor do texto como corresponsável pela campanha, pelo uso de “é nossa função”.",
        ],
      },
      {
        id: "enem-2025-branco-por-q43",
        number: 43,
        type: "objective",
        area: "Português",
        image: enem2025Q43Gufra,
        imageAlt: "Ilustração da palavra árabe Gufra, definida como a quantidade de água que pode ser segurada com as mãos.",
        support: "A artista Marija Tiurina criou uma série chamada Palavras intraduzíveis, com diversas ilustrações detalhadas que transmitem o sentido desses vocábulos, que nenhuma palavra única em outras línguas pode descrever.\nROMANZOTI, N. 9 desenhos que ilustram palavras sem tradução para o português. Disponível em: https://hypescience.com. Acesso em: 10 jun. 2019 (adaptado).",
        prompt: "O uso do texto verbal nesse desenho assume a função de",
        source: "ENEM 2025, Caderno Branco, Questão 43.",
        options: [
          "descrever de forma técnica a ilustração.",
          "destacar os múltiplos sentidos do verbete.",
          "explicar o significado da expressão ilustrada.",
          "apresentar termos equivalentes em outras línguas.",
          "apontar para a dificuldade de compreensão do termo.",
        ],
      },
      {
        id: "enem-2025-branco-por-q44",
        number: 44,
        type: "objective",
        area: "Português",
        support: "TEXTO I\nOs Doze Trabalhos de Hércules\nHércules é uma figura lendária da mitologia greco-romana. Ele é frequentemente retratado como um herói de força sobre-humana e coragem, filho de Zeus, o rei dos deuses, e Alcmena, uma mulher mortal. O episódio mais conhecido de Hércules é a realização dos Doze Trabalhos.\nEsses trabalhos são impostos a ele como uma forma de expiação pelos crimes cometidos durante um acesso de loucura, causado pela deusa Hera, esposa de Zeus. Os Doze Trabalhos são: matar o Leão de Nemeia; matar a Hidra de Lerna; capturar a corça de Cerineia; capturar o javali de Erimanto; limpar os estábulos de Áugias; matar as aves do lago Estínfalo; matar o touro de Creta; capturar os cavalos de Diomedes; roubar o cinturão de Hipólita, a rainha das Amazonas; capturar o gado de Gerião; capturar os pomos de ouro do Jardim das Hespérides; capturar o cão de Hades, Cérbero.\nHERTEL, R. Mitologia. Disponível em: https://osmelhoreslivros.com.br. Acesso em: 4 jun. 2025 (adaptado).\n\nTEXTO II\nOs Doze Trabalhos\nO que lhe faltava de estudo lhe sobrava de boa vontade e inteligência. No escritório improvisado na salinha da casa, anunciava seus serviços de bombeiro hidráulico e eletricista. Nas horas vagas entregava panfletos e lavava carros. Quando a cidade fervia com alguma festa, postava-se à entrada vendendo cerveja. Se fosse algum show infantil, cocadas. Aos sábados, era pedreiro e, aos domingos, conservava um jardim de uma mansão, além de tratar da piscina e dos cachorros. Nas férias, abrigava-se na fazenda dos donos da mansão, onde trabalhava como caseiro e motorista. Seu nome: João Antonio da Silva. Mas pode chamar de Hércules.\nFERREIRA, G. V. Os doze trabalhos. Disponível em: www.minicontos.com.br. Acesso em: 15 jul. 2015 (adaptado).",
        prompt: "A comparação entre os textos I e II indica que o(a)",
        source: "ENEM 2025, Caderno Branco, Questão 44.",
        options: [
          "intertextualidade com o mito apresentado no Texto I é um recurso presente no Texto II.",
          "narração de fatos do Texto II sintetiza os acontecimentos retratados no Texto I.",
          "vocabulário empregado no Texto II é ancorado em conhecimento literário.",
          "tema do trabalho como reparação é abordado em ambos os textos.",
          "marcação temporal no passado predomina em ambos os textos.",
        ],
      },
      {
        id: "enem-2025-branco-por-q45",
        number: 45,
        type: "objective",
        area: "Português",
        support: "O mais assustador do meteoro que cruzou o céu da Sibéria e explodiu no ar como várias bombas atômicas é que ele chegou sem ser anunciado. Com todas as atenções voltadas para o outro asteroide, o que passou de raspão, o asteroide da Sibéria entrou pela porta dos fundos sem ser detectado. A desculpa é que era pequeno demais para chamar a atenção e por isso os alarmes não funcionaram. Nossa ilusão, até agora, era que qualquer detrito espacial que se aproximasse de nós seria identificado e rotulado, e sua trajetória calculada até o último milímetro com grande antecedência, o que nos daria tempo para preparar o espírito, ou usar nossos cartões de crédito até o limite, no caso da colisão com a Terra ser inevitável.\nVERISSIMO, L. F. Disponível em: www.estadao.com.br. Acesso em: 1 mar. 2013.",
        prompt: "Com base na organização coesiva desse texto, o(a)",
        source: "ENEM 2025, Caderno Branco, Questão 45.",
        options: [
          "oração “que passou de raspão” refere-se ao “meteoro que cruzou o céu da Sibéria”.",
          "expressão “sua trajetória” refere-se ao elemento textual “qualquer detrito espacial”.",
          "palavra “isso” remete ao segmento textual posterior “os alarmes não funcionaram”.",
          "pronome “o” em “o que nos daria tempo” remete a “ou usar nossos cartões de crédito”.",
          "fragmento “o asteroide da Sibéria” introduz um elemento novo no texto.",
        ],
      }
    ],
  },
];

const OBJECTIVE_OPTIONS = ["A", "B", "C", "D", "E"];

function getEnemQuestionArea(questionNumber: number): "Linguagens" | "Ciências Humanas" {
  return questionNumber <= 45 ? "Linguagens" : "Ciências Humanas";
}

function getOfficialAnswer(exam: EnemExam, questionNumber: number, language: "english" | "spanish") {
  if (questionNumber <= 5) {
    return language === "english"
      ? exam.englishAnswerKey?.[questionNumber]
      : exam.spanishAnswerKey?.[questionNumber];
  }

  return exam.answerKey[questionNumber];
}


function getOptionLabel(question: EnemQuestion, optionLetter: string | undefined) {
  if (!optionLetter) return "Sem resposta";

  const optionIndex = OBJECTIVE_OPTIONS.indexOf(optionLetter);
  const optionText = optionIndex >= 0 ? question.options?.[optionIndex] : null;

  return optionText ? `${optionLetter}. ${optionText}` : optionLetter;
}

function getSimuladoRecommendation(area: string, language: "english" | "spanish") {
  if (area === "Inglês" || area === "Espanhol") {
    const languageName = language === "english" ? "Inglês" : "Espanhol";
    return {
      title: `Reforce interpretação em ${languageName}`,
      body: "Priorize leitura por contexto, cognatos, conectivos, intenção do autor e inferência. Na aba Matérias, revise Interpretação de Texto antes de refazer a prova.",
    };
  }

  if (area === "Linguagens") {
    return {
      title: "Reforce Linguagens",
      body: "Revise interpretação de texto, intenção comunicativa, gênero textual e relações entre linguagem verbal e visual.",
    };
  }

  if (area === "Português") {
    return {
      title: "Reforce Português",
      body: "Revise interpretação, função dos parágrafos, sentido literal e figurado, relações entre ideias e efeitos de sentido no texto.",
    };
  }

  if (area === "Ciências Humanas") {
    return {
      title: "Reforce Ciências Humanas",
      body: "Revise leitura de fontes, contexto histórico, escala geográfica e relações entre sociedade, território e poder.",
    };
  }

  return {
    title: `Reforce ${area}`,
    body: "Use a área de Matérias para revisar os conceitos antes de refazer o simulado.",
  };
}

type SimuladoBankStatusFilter = "all" | "ready" | "pending";

type SimuladoPerformanceSummary = {
  attemptsCount: number;
  bestPercent: number;
  averagePercent: number;
  totalAnswered: number;
  latestAttempt: SimuladoAttemptData | null;
  weakestArea: string | null;
};

function hasExamCorrection(exam: EnemExam) {
  return Object.keys(exam.answerKey).length > 0
    || Object.keys(exam.englishAnswerKey ?? {}).length > 0
    || Object.keys(exam.spanishAnswerKey ?? {}).length > 0;
}

function getExamImportedQuestionCount(exam: EnemExam) {
  return exam.questions.length;
}

function getSimuladoPerformanceSummary(attempts: SimuladoAttemptData[]): SimuladoPerformanceSummary {
  if (attempts.length === 0) {
    return {
      attemptsCount: 0,
      bestPercent: 0,
      averagePercent: 0,
      totalAnswered: 0,
      latestAttempt: null,
      weakestArea: null,
    };
  }

  const totalPercent = attempts.reduce((total, attempt) => total + attempt.percent, 0);
  const areaScores: Record<string, { correct: number; total: number }> = {};

  attempts.forEach((attempt) => {
    Object.entries(attempt.byArea).forEach(([area, score]) => {
      areaScores[area] ??= { correct: 0, total: 0 };
      areaScores[area].correct += score.correct;
      areaScores[area].total += score.total;
    });
  });

  const weakestArea = Object.entries(areaScores)
    .filter(([, score]) => score.total > 0)
    .sort(([, first], [, second]) => first.correct / first.total - second.correct / second.total)[0]?.[0] ?? null;

  return {
    attemptsCount: attempts.length,
    bestPercent: Math.max(...attempts.map((attempt) => attempt.percent)),
    averagePercent: Math.round(totalPercent / attempts.length),
    totalAnswered: attempts.reduce((total, attempt) => total + attempt.answeredCount, 0),
    latestAttempt: attempts[0] ?? null,
    weakestArea,
  };
}

function findQuestionInBank(questionId: string) {
  for (const exam of ENEM_OFFICIAL_EXAMS) {
    const question = exam.questions.find((candidate) => candidate.id === questionId);
    if (question) return { exam, question };
  }

  return null;
}

function buildReviewExamFromAttempt(attempt: SimuladoAttemptData): EnemExam | null {
  const questionsToReview = attempt.questions
    .filter((question) => question.status !== "correct")
    .map((question) => findQuestionInBank(question.questionId)?.question)
    .filter((question): question is EnemQuestion => Boolean(question));

  if (questionsToReview.length === 0) return null;

  const baseExam = ENEM_OFFICIAL_EXAMS.find((exam) => exam.id === attempt.examId) ?? ENEM_OFFICIAL_EXAMS[0];

  return {
    ...baseExam,
    id: `review-${attempt.id}`,
    title: `Revisao de erros: ${attempt.examTitle}`,
    description: "Lista curta com as questoes erradas ou em branco da tentativa anterior.",
    questionCount: questionsToReview.length,
    areas: Array.from(new Set(questionsToReview.map((question) => question.area))),
    questions: questionsToReview,
  };
}

function SimuladosView({ onUserActivity }: { onUserActivity: (activityType: UserActivityType, details?: UserActivityDetails) => void }) {
  const [activeTab, setActiveTab] = useState<"official" | "custom" | "history">("official");
  const [selectedExam, setSelectedExam] = useState<EnemExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [languageChoice, setLanguageChoice] = useState<"english" | "spanish">("english");
  const [result, setResult] = useState<EnemExamResult | null>(null);
  const [attempts, setAttempts] = useState<SimuladoAttemptData[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [resultStatus, setResultStatus] = useState("");
  const [examAreaFilter, setExamAreaFilter] = useState("Todas");
  const [examYearFilter, setExamYearFilter] = useState("Todos");
  const [examStatusFilter, setExamStatusFilter] = useState<SimuladoBankStatusFilter>("all");

  const refreshAttempts = async () => {
    setAttemptsLoading(true);
    try {
      setAttempts(await loadSimuladoAttempts());
    } finally {
      setAttemptsLoading(false);
    }
  };

  useEffect(() => {
    refreshAttempts();
  }, []);

  const performanceSummary = getSimuladoPerformanceSummary(attempts);
  const availableExamAreas = Array.from(new Set(ENEM_OFFICIAL_EXAMS.flatMap((exam) => exam.areas))).sort();
  const availableExamYears = Array.from(new Set(ENEM_OFFICIAL_EXAMS.map((exam) => exam.year))).sort((first, second) => second - first);
  const filteredOfficialExams = ENEM_OFFICIAL_EXAMS.filter((exam) => {
    const matchesArea = examAreaFilter === "Todas" || exam.areas.includes(examAreaFilter);
    const matchesYear = examYearFilter === "Todos" || String(exam.year) === examYearFilter;
    const matchesStatus = examStatusFilter === "all"
      || (examStatusFilter === "ready" && getExamImportedQuestionCount(exam) > 0 && hasExamCorrection(exam))
      || (examStatusFilter === "pending" && (getExamImportedQuestionCount(exam) === 0 || !hasExamCorrection(exam)));

    return matchesArea && matchesYear && matchesStatus;
  });

  const openExam = (exam: EnemExam) => {
    const preferredLanguage = exam.questions.find((question) => question.language)?.language;
    if (preferredLanguage) {
      setLanguageChoice(preferredLanguage);
    }
    setSelectedExam(exam);
    setAnswers({});
    setResult(null);
    setResultStatus("");
  };

  const saveAnswer = (questionId: string, value: string) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));
    setResult(null);
    setResultStatus("");
  };

  const goToQuestion = (questionNumber: number) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      __currentQuestion: String(questionNumber),
    }));
  };

  const scrollToQuestion = (questionNumber: number) => {
    goToQuestion(questionNumber);
    window.setTimeout(() => {
      document.getElementById(`enem-question-${questionNumber}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const persistResult = async (
    exam: EnemExam,
    nextResult: EnemExamResult,
    answeredCount: number,
    recommendationArea: string | null,
    attemptQuestions: EnemQuestion[],
  ) => {
    const examAnswers = Object.fromEntries(
      Object.entries(answers).filter(([key, value]) => key !== "__currentQuestion" && Boolean(value)),
    );

    const questionDetails: SimuladoAttemptQuestionData[] = attemptQuestions.map((question) => {
      const studentAnswer = answers[String(question.number)] || null;
      const officialAnswer = getOfficialAnswer(exam, question.number, languageChoice) || null;
      const isCorrect = Boolean(studentAnswer && officialAnswer && studentAnswer === officialAnswer);
      const status = !studentAnswer ? "unanswered" : isCorrect ? "correct" : "wrong";

      return {
        questionId: question.id,
        questionNumber: question.number,
        area: question.area,
        languageChoice: question.language ?? languageChoice,
        prompt: question.prompt,
        studentAnswer,
        studentAnswerText: getOptionLabel(question, studentAnswer ?? undefined),
        officialAnswer,
        officialAnswerText: getOptionLabel(question, officialAnswer ?? undefined),
        isCorrect,
        status,
      };
    });

    const savedAttempt = await saveSimuladoAttempt({
      examId: exam.id,
      examTitle: exam.title,
      examYear: exam.year,
      examDay: exam.day,
      languageChoice,
      questionCount: exam.questionCount,
      answeredCount,
      correctCount: nextResult.correct,
      wrongCount: nextResult.wrong,
      unansweredCount: nextResult.unanswered,
      percent: nextResult.percent,
      byArea: nextResult.byArea,
      answers: examAnswers,
      recommendationArea,
      questions: questionDetails,
    });

    if (savedAttempt) {
      setAttempts((currentAttempts) => [savedAttempt, ...currentAttempts].slice(0, 10));
      setResultStatus("Resultado salvo no seu histórico.");
      onUserActivity("simulado", {
        referenceId: savedAttempt.id,
        metadata: {
          examId: savedAttempt.examId,
          examTitle: savedAttempt.examTitle,
          percent: savedAttempt.percent,
          answeredCount: savedAttempt.answeredCount,
          recommendationArea: savedAttempt.recommendationArea,
        },
      });
      return;
    }

    setResultStatus("Resultado calculado. Entre na conta para salvar o histórico.");
  };

  const finishExam = async (exam: EnemExam) => {
    const byArea: Record<string, { correct: number; total: number }> = {
      Linguagens: { correct: 0, total: 45 },
      "Ciências Humanas": { correct: 0, total: 45 },
    };
    let correct = 0;
    let unanswered = 0;

    for (let questionNumber = 1; questionNumber <= exam.questionCount; questionNumber += 1) {
      const answer = answers[String(questionNumber)];
      const officialAnswer = getOfficialAnswer(exam, questionNumber, languageChoice);
      const area = getEnemQuestionArea(questionNumber);

      if (!answer) {
        unanswered += 1;
        continue;
      }

      if (answer === officialAnswer) {
        correct += 1;
        byArea[area].correct += 1;
      }
    }

    const wrong = exam.questionCount - correct - unanswered;
    const nextResult = {
      correct,
      wrong,
      unanswered,
      percent: Math.round((correct / exam.questionCount) * 100),
      byArea,
    };
    const weakestAreaEntry = Object.entries(nextResult.byArea).sort(([, first], [, second]) =>
      first.correct / first.total - second.correct / second.total,
    )[0];

    setResult(nextResult);
    await persistResult(
      exam,
      nextResult,
      exam.questionCount - unanswered,
      weakestAreaEntry?.[0] ?? null,
      exam.questions,
    );
  };

  if (selectedExam) {
    const availableLanguages = Array.from(new Set(selectedExam.questions.map((question) => question.language).filter(Boolean))) as Array<"english" | "spanish">;
    const languageLabels: Record<"english" | "spanish", string> = { english: "Inglês", spanish: "Espanhol" };
    const importedQuestions = selectedExam.questions.filter((question) => !question.language || question.language === languageChoice);
    const [firstQuestion] = importedQuestions;
    const currentNumber = Number((answers.__currentQuestion as string | undefined) ?? firstQuestion?.number ?? 1);
    const visibleQuestion = importedQuestions.find((question) => question.number === currentNumber) ?? firstQuestion ?? null;
    const isSeparatedSupport = (question: EnemQuestion) => Boolean(question.support && question.support.length > 1200);
    const shouldRenderSeparatedSupport = (question: EnemQuestion, questionIndex: number) =>
      isSeparatedSupport(question)
      && importedQuestions.findIndex((candidate) => candidate.support === question.support) === questionIndex;
    const answeredCount = importedQuestions.filter((question) => answers[String(question.number)]).length;
    const totalImported = importedQuestions.length;
    const hasOfficialAnswerKey = importedQuestions.every((question) =>
      Boolean(getOfficialAnswer(selectedExam, question.number, languageChoice)),
    );

    const finishImportedExam = async () => {
      if (!hasOfficialAnswerKey) return;

      const byArea: Record<string, { correct: number; total: number }> = {};
      let correct = 0;
      let unanswered = 0;

      for (const question of importedQuestions) {
        const area = question.area;
        byArea[area] = byArea[area] ?? { correct: 0, total: 0 };
        byArea[area].total += 1;

        const answer = answers[String(question.number)];
        const officialAnswer = getOfficialAnswer(selectedExam, question.number, languageChoice);

        if (!answer) {
          unanswered += 1;
          continue;
        }

        if (answer === officialAnswer) {
          correct += 1;
          byArea[area].correct += 1;
        }
      }

      const wrong = totalImported - correct - unanswered;
      const nextResult = {
        correct,
        wrong,
        unanswered,
        percent: totalImported > 0 ? Math.round((correct / totalImported) * 100) : 0,
        byArea,
      };
      const weakestAreaEntry = Object.entries(nextResult.byArea).sort(([, first], [, second]) =>
        first.correct / first.total - second.correct / second.total,
      )[0];

      setResult(nextResult);
      await persistResult(
        selectedExam,
        nextResult,
        answeredCount,
        weakestAreaEntry?.[0] ?? null,
        importedQuestions,
      );
    };

    const weakestArea = result
      ? Object.entries(result.byArea).sort(([, first], [, second]) =>
          first.correct / first.total - second.correct / second.total,
        )[0]
      : null;

    const recommendation = weakestArea ? getSimuladoRecommendation(weakestArea[0], languageChoice) : null;
    const questionReview = result
      ? importedQuestions.map((question) => {
          const studentAnswer = answers[String(question.number)];
          const officialAnswer = getOfficialAnswer(selectedExam, question.number, languageChoice);
          const isCorrect = Boolean(studentAnswer && officialAnswer && studentAnswer === officialAnswer);

          return {
            question,
            studentAnswer,
            officialAnswer,
            isCorrect,
            status: !studentAnswer ? "Não respondida" : isCorrect ? "Correta" : "Incorreta",
          };
        })
      : [];
    const needsReview = questionReview.filter((item) => !item.isCorrect);
    const languageSelector = (
      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <h3 className="font-semibold text-foreground">Idioma selecionado</h3>
        <p className="mt-1 text-sm text-muted-foreground">Caderno Branco.</p>
        {availableLanguages.length > 1 && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-md">
            {availableLanguages.map((language) => (
              <button
                key={language}
                className={"rounded-lg border px-3 py-2 text-sm transition-colors " + (languageChoice === language ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-accent")}
                onClick={() => {
                  setLanguageChoice(language);
                  setAnswers({ __currentQuestion: "1" });
                  setResult(null);
                  setResultStatus("");
                }}
                type="button"
              >
                {languageLabels[language]}
              </button>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <PageContainer size="wide">
          <button
            className="text-sm md:text-base text-primary hover:underline"
            onClick={() => setSelectedExam(null)}
            type="button"
          >
            ← Voltar para provas
          </button>

          <div className="rounded-xl border border-border bg-card p-5 md:p-6 xl:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-medium text-primary">Prova oficial do ENEM</p>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">{selectedExam.title}</h2>
                <p className="mt-2 max-w-3xl text-sm md:text-base text-muted-foreground">
                  Questões renderizadas na página, com texto de apoio legível e alternativas clicáveis.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs md:text-sm text-muted-foreground">
                    {totalImported}/{selectedExam.questionCount} questões importadas
                  </span>
                  {selectedExam.areas.map((area) => (
                    <span key={area} className="rounded-full bg-muted px-3 py-1 text-xs md:text-sm text-muted-foreground">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {selectedExam.pdfUrl && (
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm md:text-base text-foreground hover:bg-accent"
                    href={selectedExam.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileText className="h-4 w-4" />
                    PDF oficial
                  </a>
                )}
                {selectedExam.answerKeyUrl && (
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm md:text-base text-foreground hover:bg-accent"
                    href={selectedExam.answerKeyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Gabarito oficial
                  </a>
                )}
              </div>
            </div>
          </div>

          {languageSelector}

          {visibleQuestion ? (
            <>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-5">
                {importedQuestions.map((question, questionIndex) => {
                  const questionKey = String(question.number);
                  const selectedAnswer = answers[questionKey];
                  const separatedSupport = isSeparatedSupport(question);
                  const sharedSupportNumbers = importedQuestions
                    .filter((candidate) => candidate.support === question.support)
                    .map((candidate) => candidate.number);
                  const firstSharedQuestion = sharedSupportNumbers[0] ?? question.number;
                  const lastSharedQuestion = sharedSupportNumbers[sharedSupportNumbers.length - 1] ?? question.number;

                  return (
                    <div key={question.id} className="contents">
                      {shouldRenderSeparatedSupport(question, questionIndex) && (
                        <section
                          className="scroll-mt-24 rounded-xl border border-border bg-card p-5 md:p-7 xl:p-10"
                          id={`enem-support-${question.number}`}
                        >
                          <p className="mb-4 text-sm font-semibold text-primary">
                            Texto para as questões de {String(firstSharedQuestion).padStart(2, "0")} a {String(lastSharedQuestion).padStart(2, "0")}
                          </p>
                          <div className="rounded-xl bg-muted/60 p-4 text-sm leading-relaxed text-foreground whitespace-pre-line md:p-6 md:text-base xl:p-8">
                            {question.support}
                          </div>
                        </section>
                      )}

                      <section
                        className="scroll-mt-24 rounded-xl border border-border bg-card p-5 md:p-7 xl:p-10"
                        id={`enem-question-${question.number}`}
                      >
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-primary">Questão {question.number}</p>
                            <p className="text-sm text-muted-foreground">{question.area}</p>
                          </div>
                          {question.source && (
                            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                              {question.source}
                            </span>
                          )}
                        </div>

                        {!separatedSupport && question.support && (
                          <div className="mb-6 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed text-foreground whitespace-pre-line md:p-5 md:text-base">
                            {question.support}
                          </div>
                        )}

                        {question.image && (
                          <figure className="mb-6 overflow-hidden rounded-xl border border-border bg-muted/40">
                            <img
                              src={question.image}
                              alt={question.imageAlt ?? ""}
                              className="w-full object-contain"
                            />
                            {question.imageAlt && (
                              <figcaption className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
                                {question.imageAlt}
                              </figcaption>
                            )}
                          </figure>
                        )}

                        {!question.image && question.imageAlt && (
                          <div className="mb-6 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm md:text-base text-muted-foreground">
                            Imagem da questão pendente de importação: {question.imageAlt}
                          </div>
                        )}

                        <h3 className="mb-5 text-lg md:text-xl font-semibold leading-relaxed text-foreground">
                          {question.prompt}
                        </h3>

                        <div className="space-y-3">
                          {question.options?.map((option, index) => {
                            const value = OBJECTIVE_OPTIONS[index];
                            const selected = selectedAnswer === value;
                            return (
                              <button
                                key={value}
                                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/10 text-foreground" : "border-border hover:bg-accent text-foreground"}`}
                                onClick={() => saveAnswer(questionKey, value)}
                                type="button"
                              >
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                                  {value}
                                </span>
                                <span className="pt-1 text-sm md:text-base leading-relaxed">{option}</span>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-4 md:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">Questões importadas</h3>
                      <p className="text-sm text-muted-foreground">{answeredCount}/{totalImported} respondidas</p>
                    </div>
                    <button
                      className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={finishImportedExam}
                      disabled={!hasOfficialAnswerKey}
                      type="button"
                    >
                      Finalizar
                    </button>
                  </div>
                  {!hasOfficialAnswerKey && (
                    <p className="mb-3 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                      Correção desativada até adicionarmos o gabarito oficial dessas 5 questões.
                    </p>
                  )}
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-9">
                    {importedQuestions.map((question) => {
                      const questionKey = String(question.number);
                      return (
                        <button
                          key={question.id}
                          className={`rounded-lg border px-2 py-2 text-sm ${visibleQuestion.number === question.number ? "border-primary bg-primary text-primary-foreground" : answers[questionKey] ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}
                          onClick={() => scrollToQuestion(question.number)}
                          type="button"
                        >
                          {question.number}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {result && (
                  <div className="rounded-xl border border-border bg-card p-4 md:p-5">
                    <h3 className="text-lg font-semibold text-foreground">Resultado</h3>
                    <div className="mt-4 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                      <div className="rounded-lg bg-muted p-3">
                        <div className="text-2xl font-bold text-foreground">{result.correct}</div>
                        <div className="text-xs text-muted-foreground">acertos</div>
                      </div>
                      <div className="rounded-lg bg-muted p-3">
                        <div className="text-2xl font-bold text-foreground">{result.wrong}</div>
                        <div className="text-xs text-muted-foreground">erros</div>
                      </div>
                      <div className="rounded-lg bg-muted p-3">
                        <div className="text-2xl font-bold text-foreground">{result.percent}%</div>
                        <div className="text-xs text-muted-foreground">percentual</div>
                      </div>
                    </div>
                    {recommendation && (
                      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3">
                        <h4 className="font-medium text-foreground">{recommendation.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{recommendation.body}</p>
                      </div>
                    )}
                    {resultStatus && (
                      <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                        {resultStatus}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {result && (
              <div className="rounded-xl border border-border bg-card p-5 md:p-7 xl:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground">Revisão das respostas</h3>
                    <p className="mt-1 text-sm md:text-base text-muted-foreground">
                      Confira o que marcou e compare com o gabarito oficial.
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                    {needsReview.length === 0 ? "Tudo correto" : `${needsReview.length} para revisar`}
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {questionReview.map(({ question, studentAnswer, officialAnswer, isCorrect, status }) => {
                    const wasUnanswered = !studentAnswer;
                    return (
                      <button
                        key={question.id}
                        className={`rounded-xl border p-4 text-left transition-colors hover:bg-accent ${isCorrect ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-rose-300 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30"}`}
                        onClick={() => scrollToQuestion(question.number)}
                        type="button"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-foreground">Questão {question.number}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{question.prompt}</p>
                          </div>
                          <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${isCorrect ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"}`}>
                            {status}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2 md:grid-cols-2">
                          <div className="rounded-lg bg-background/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sua resposta</p>
                            <p className="mt-1 text-sm text-foreground">{getOptionLabel(question, studentAnswer)}</p>
                            {wasUnanswered && (
                              <p className="mt-1 text-xs text-muted-foreground">A questão ficou em branco.</p>
                            )}
                          </div>
                          <div className="rounded-lg bg-background/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gabarito</p>
                            <p className="mt-1 text-sm text-foreground">{getOptionLabel(question, officialAnswer)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 md:p-10 text-center">
              <h3 className="mb-2 text-lg md:text-xl font-semibold text-foreground">Questões ainda não importadas</h3>
              <p className="mx-auto max-w-2xl text-sm md:text-base text-muted-foreground">
                Esta prova já está no catálogo oficial. A próxima etapa é importar enunciado, alternativas e mídia de cada questão.
              </p>
            </div>
          )}
      </PageContainer>
    );
  }


  return (
    <PageContainer>
        <SimuladoPracticeDashboard
          summary={performanceSummary}
          availableExamCount={ENEM_OFFICIAL_EXAMS.length}
          importedQuestionCount={ENEM_OFFICIAL_EXAMS.reduce((total, exam) => total + getExamImportedQuestionCount(exam), 0)}
          onOpenCustom={() => setActiveTab("custom")}
          onOpenHistory={() => {
            setActiveTab("history");
            refreshAttempts();
          }}
        />

        <div className="flex gap-4 border-b border-border overflow-x-auto">
          <button
            className={`pb-3 px-1 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === "official" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("official")}
            type="button"
          >
            Provas oficiais
          </button>
          <button
            className={`pb-3 px-1 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === "custom" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("custom")}
            type="button"
          >
            Personalizado
          </button>
          <button
            className={`pb-3 px-1 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === "history" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            onClick={() => {
              setActiveTab("history");
              refreshAttempts();
            }}
            type="button"
          >
            Minhas respostas
          </button>
        </div>

        {activeTab === "official" ? (
          <>
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 xl:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Filtros do banco</h2>
              <p className="mt-2 max-w-3xl text-sm md:text-base text-muted-foreground">
                Encontre provas por ano, area e status de importacao.
              </p>
            </div>
            <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {filteredOfficialExams.length}/{ENEM_OFFICIAL_EXAMS.length} prova{ENEM_OFFICIAL_EXAMS.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-foreground">Area</span>
              <select
                value={examAreaFilter}
                onChange={(event) => setExamAreaFilter(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="Todas">Todas</option>
                {availableExamAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium text-foreground">Ano</span>
              <select
                value={examYearFilter}
                onChange={(event) => setExamYearFilter(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="Todos">Todos</option>
                {availableExamYears.map((year) => (
                  <option key={year} value={String(year)}>{year}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium text-foreground">Status</span>
              <select
                value={examStatusFilter}
                onChange={(event) => setExamStatusFilter(event.target.value as SimuladoBankStatusFilter)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="all">Todos</option>
                <option value="ready">Prontos para responder</option>
                <option value="pending">Em preparacao</option>
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 md:p-6 xl:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Banco ENEM</h2>
          <p className="mt-2 max-w-3xl text-sm md:text-base text-muted-foreground">
            Catálogo em formato nativo. A primeira prova importada é o Caderno Branco do ENEM 2025, com língua estrangeira e Português.
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {filteredOfficialExams.map((exam) => (
            <EnemExamCard key={exam.id} exam={exam} onOpen={openExam} />
          ))}
        </div>
          </>
        ) : activeTab === "custom" ? (
          <PersonalizedSimuladoBuilder attempts={attempts} onOpen={openExam} />
        ) : (
          <SimuladoAttemptsHistory attempts={attempts} isLoading={attemptsLoading} onRetry={refreshAttempts} onOpenReview={openExam} />
        )}
    </PageContainer>
  );
}

function SimuladoPracticeDashboard({
  summary,
  availableExamCount,
  importedQuestionCount,
  onOpenCustom,
  onOpenHistory,
}: {
  summary: SimuladoPerformanceSummary;
  availableExamCount: number;
  importedQuestionCount: number;
  onOpenCustom: () => void;
  onOpenHistory: () => void;
}) {
  const latestPercent = summary.latestAttempt?.percent ?? 0;

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 xl:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Plano de pratica</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">Exercicios e simulados</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Use provas oficiais, simulados curtos e revisao dos erros para transformar estudo em treino medivel.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              onClick={onOpenCustom}
              type="button"
            >
              <Target className="h-4 w-4" />
              Gerar treino
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              onClick={onOpenHistory}
              type="button"
            >
              <History className="h-4 w-4" />
              Ver historico
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Banco</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{availableExamCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">{importedQuestionCount} questoes nativas</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Tentativas</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.attemptsCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">{summary.totalAnswered} respostas salvas</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Melhor nota</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.bestPercent}%</p>
            <p className="mt-1 text-xs text-muted-foreground">media {summary.averagePercent}%</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Ultima tentativa</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{latestPercent}%</p>
            <p className="mt-1 text-xs text-muted-foreground">{summary.weakestArea ? `reforce ${summary.weakestArea}` : "sem historico"}</p>
          </div>
        </div>
      </div>

      <aside className="rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Proximo melhor passo</p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">
              {summary.weakestArea ? `Treinar ${summary.weakestArea}` : "Fazer primeiro simulado"}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {summary.weakestArea
            ? "O foco sugerido vem da area com menor aproveitamento nas suas tentativas salvas."
            : "Depois do primeiro resultado, o app passa a sugerir treino pela area mais fraca."}
        </p>
      </aside>
    </section>
  );
}

function buildPersonalizedExam(
  focusArea: string,
  languageChoice: "english" | "spanish",
  questionLimit: number,
): EnemExam {
  const baseExam = ENEM_OFFICIAL_EXAMS[0];
  const languageQuestions = baseExam.questions.filter((question) =>
    !question.language || question.language === languageChoice,
  );
  const selectedQuestions = [...languageQuestions]
    .sort((first, second) => Number(second.area === focusArea) - Number(first.area === focusArea))
    .slice(0, questionLimit);
  const areas = Array.from(new Set(selectedQuestions.map((question) => question.area)));

  return {
    ...baseExam,
    id: `personalizado-${focusArea}-${languageChoice}-${questionLimit}`,
    title: `Simulado personalizado: ${focusArea}`,
    description: "Seleção montada a partir do banco ENEM e do foco escolhido para revisar os pontos mais importantes.",
    questionCount: selectedQuestions.length,
    areas,
    questions: selectedQuestions,
  };
}

function PersonalizedSimuladoBuilder({
  attempts,
  onOpen,
}: {
  attempts: SimuladoAttemptData[];
  onOpen: (exam: EnemExam) => void;
}) {
  const latestWeakArea = attempts.find((attempt) => attempt.recommendationArea)?.recommendationArea ?? "Inglês";
  const availableAreas = Array.from(
    new Set(ENEM_OFFICIAL_EXAMS.flatMap((exam) => exam.questions.map((question) => question.area))),
  );
  const [focusArea, setFocusArea] = useState(
    availableAreas.includes(latestWeakArea) ? latestWeakArea : availableAreas[0] ?? "Inglês",
  );
  const [languageChoice, setLanguageChoice] = useState<"english" | "spanish">("english");
  const [questionLimit, setQuestionLimit] = useState(5);
  const availableQuestionCount = ENEM_OFFICIAL_EXAMS[0].questions.filter((question) =>
    !question.language || question.language === languageChoice,
  ).length;

  const generateExam = () => {
    onOpen(buildPersonalizedExam(focusArea, languageChoice, Math.min(questionLimit, availableQuestionCount)));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 xl:p-8">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Simulado personalizado</h2>
        <p className="mt-2 max-w-3xl text-sm md:text-base text-muted-foreground">
          Monte uma prova curta com foco na área que precisa de reforço. Quando houver histórico, o app sugere a área mais fraca.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-foreground">Foco</span>
            <select
              value={focusArea}
              onChange={(event) => setFocusArea(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {availableAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-foreground">Língua</span>
            <select
              value={languageChoice}
              onChange={(event) => setLanguageChoice(event.target.value as "english" | "spanish")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="english">Inglês</option>
              <option value="spanish">Espanhol</option>
            </select>
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-foreground">Questões</span>
            <select
              value={questionLimit}
              onChange={(event) => setQuestionLimit(Number(event.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {[5, 10].filter((amount) => amount <= availableQuestionCount).map((amount) => (
                <option key={amount} value={amount}>{amount} questões</option>
              ))}
            </select>
          </label>
        </div>

        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:bg-primary/90 sm:w-auto"
          onClick={generateExam}
          type="button"
        >
          <Timer className="h-4 w-4" />
          Gerar simulado
        </button>
      </div>

      <aside className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold text-foreground">Foco sugerido</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {attempts.length > 0
            ? `Ultima recomendacao: reforce ${latestWeakArea}.`
            : "Finalize uma prova para o app sugerir o foco automaticamente."}
        </p>
        <div className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          A próxima etapa técnica é conectar este fluxo a uma função de IA no backend para criar questões novas com gabarito e justificativa.
        </div>
      </aside>
    </div>
  );
}

function SimuladoAttemptsHistory({
  attempts,
  isLoading,
  onRetry,
  onOpenReview,
}: {
  attempts: SimuladoAttemptData[];
  isLoading: boolean;
  onRetry: () => void;
  onOpenReview: (exam: EnemExam) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-xl border border-border bg-muted" />
        ))}
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">Nenhuma resposta salva ainda</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Finalize uma prova usando sua conta para acompanhar acertos, erros, percentual e recomendações de estudo.
        </p>
        <button
          className="mt-4 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
          onClick={onRetry}
          type="button"
        >
          Atualizar histórico
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Histórico de simulados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tentativas finalizadas nesta conta, com recomendação baseada na área com menor aproveitamento.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {attempts.map((attempt) => {
          const reviewExam = buildReviewExamFromAttempt(attempt);
          const reviewCount = attempt.questions.filter((question) => question.status !== "correct").length;

          return (
          <div key={attempt.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{attempt.examTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(attempt.finishedAt))}
                </p>
              </div>
              <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {attempt.percent}%
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xl font-bold text-foreground">{attempt.correctCount}</div>
                <div className="text-xs text-muted-foreground">acertos</div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xl font-bold text-foreground">{attempt.wrongCount}</div>
                <div className="text-xs text-muted-foreground">erros</div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xl font-bold text-foreground">{attempt.answeredCount}</div>
                <div className="text-xs text-muted-foreground">respondidas</div>
              </div>
            </div>

            {attempt.recommendationArea && (
              <p className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-muted-foreground">
                Reforce {attempt.recommendationArea} antes da próxima tentativa.
              </p>
            )}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!reviewExam}
                onClick={() => {
                  if (reviewExam) onOpenReview(reviewExam);
                }}
                type="button"
              >
                <RefreshCw className="h-4 w-4" />
                Refazer erros
              </button>
              <span className="rounded-lg border border-border px-4 py-2 text-center text-sm text-muted-foreground">
                {reviewCount} questao{reviewCount === 1 ? "" : "es"} para revisar
              </span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function EnemExamCard({ exam, onOpen }: { exam: EnemExam; onOpen: (exam: EnemExam) => void }) {
  const hasQuestions = exam.questions.length > 0;
  const hasCorrection = Object.keys(exam.answerKey).length > 0 || Object.keys(exam.englishAnswerKey ?? {}).length > 0 || Object.keys(exam.spanishAnswerKey ?? {}).length > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 xl:p-8 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Timer className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="font-semibold text-base md:text-lg text-foreground">{exam.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <span>{exam.questionCount} questões oficiais</span>
                <span>•</span>
                <span>{hasCorrection ? "correção disponível" : "gabarito pendente"}</span>
              </div>
            </div>
            <span className={`w-fit rounded-md px-2 py-1 text-xs ${
              hasQuestions
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
            }`}>
              {hasQuestions ? "Pronto para responder" : "Em preparação"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {exam.areas.map((area) => (
              <span key={area} className="rounded-full bg-muted px-3 py-1 text-xs md:text-sm text-muted-foreground">
                {area}
              </span>
            ))}
          </div>

          <p className="mt-3 text-sm md:text-base text-muted-foreground">{exam.description}</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base text-primary-foreground hover:bg-primary/90"
              onClick={() => onOpen(exam)}
              type="button"
            >
              {hasQuestions ? "Responder questões" : "Ver preparação"}
            </button>
            <a
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base text-foreground hover:bg-accent"
              href={exam.officialUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir no Inep
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubjectCard({
  name,
  subtitle,
  progress,
  color,
  icon,
  onClick,
}: {
  name: string;
  subtitle: string;
  progress: number;
  color: string;
  icon: string;
  onClick?: () => void;
}) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      className="bg-card border border-border rounded-xl p-3 text-left md:p-5 xl:p-6 hover:shadow-md transition-shadow"
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 ${color} rounded-xl flex items-center justify-center text-xl md:text-2xl mb-3`}>
        {icon === "cards" ? <CreditCard className="h-5 w-5 text-primary" /> : icon}
      </div>
      <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">{name}</h3>
      <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
        <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{progress}%</p>
    </Component>
  );
}

function StudyCard({ time, title, subtitle, tag }: { time: string; title: string; subtitle: string; tag: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 md:p-5 xl:p-6 flex items-center gap-3 md:gap-5 hover:shadow-md transition-shadow">
      <div className="text-sm font-medium text-muted-foreground w-12 md:w-16 flex-shrink-0">{time}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground mb-0.5 text-sm md:text-base truncate">{title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <button className="px-3 md:px-5 py-1.5 md:py-2.5 text-xs md:text-base text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0">
        {tag}
      </button>
    </div>
  );
}

function EventCard({ time, title, subtitle, color }: { time: string; title: string; subtitle: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 md:p-5 xl:p-6 flex items-center gap-3 md:gap-5 hover:shadow-md transition-shadow">
      <div className={`w-1 h-10 md:h-12 ${color} rounded-full flex-shrink-0`} />
      <div className="text-sm font-medium text-muted-foreground w-12 md:w-16 flex-shrink-0">{time}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground mb-0.5 text-sm truncate">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <button className="px-3 md:px-5 py-1.5 md:py-2.5 text-xs md:text-base text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0">
        Estudar
      </button>
    </div>
  );
}

function FlashcardDeck({
  name,
  subtitle,
  progress,
  color,
  icon,
}: {
  name: string;
  subtitle: string;
  progress: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 md:p-5 xl:p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className={`w-10 h-10 md:w-12 md:h-12 ${color} rounded-xl flex items-center justify-center text-xl md:text-2xl mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">{name}</h3>
      <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
        <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{progress}%</p>
    </div>
  );
}



