import { useEffect, useState } from "react";
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
  ChevronDown,
  Flame,
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  X,
  ExternalLink,
  FileText,
} from "lucide-react";
import {
  DEFAULT_PROFILE,
  loadProfile,
  recordUserActivity,
  saveProfile,
  type UserActivityType,
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
import { enableDevicePushNotifications } from "../services/pushNotificationData";
import type { SubjectModuleContent } from "../data/subjectContent";
import enem2025Q1SpanishDiversity from "../imports/enem2025/enem-2025-branco-esp-q1-diversidade-linguistica.jpg";
import enem2025Q2SleepCups from "../imports/enem2025/enem-2025-branco-ing-q2-sleep-cups.png";

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

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileId, setProfileId] = useState(DEFAULT_PROFILE.id);
  const [userName, setUserName] = useState(DEFAULT_PROFILE.name);
  const [streakDays, setStreakDays] = useState(DEFAULT_PROFILE.streakDays);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [profileDraftName, setProfileDraftName] = useState(userName);
  const [profileError, setProfileError] = useState("");
  const [studyProgress, setStudyProgress] = useState<StudyProgress>({});
  const [lastStudy, setLastStudy] = useState<LastStudyData>(null);
  const [courseModules, setCourseModules] = useState<SubjectModuleMap>({});
  const [courseContentLoading, setCourseContentLoading] = useState(true);
  const [courseContentError, setCourseContentError] = useState("");
  const [studyFocusMode, setStudyFocusMode] = useState(false);
  const [materiasTarget, setMateriasTarget] = useState<StudyTarget | null>(null);
  const [examReviewAlerts, setExamReviewAlerts] = useState<UpcomingExamAlert[]>([]);
  const [isExamReviewAlertOpen, setIsExamReviewAlertOpen] = useState(false);

  const applyProfile = (profile: typeof DEFAULT_PROFILE) => {
      setProfileId(profile.id);
      setUserName(profile.name);
      setStreakDays(profile.streakDays);
      setProfileDraftName(profile.name);
  };

  const reloadProfile = async () => {
    const profile = await loadProfile();
    applyProfile(profile);
  };

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
      })
      .finally(() => {
        if (isMounted) setAuthReady(true);
      });

    const unsubscribe = onAuthUserChange((user) => {
      if (!isMounted) return;
      setAuthUser(user);
      reloadProfile();
      reloadStudyProgress();
    });

    return () => {
      isMounted = false;
      unsubscribe();
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
    setIsProfileEditorOpen(true);
  };

  const saveProfileName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = profileDraftName.trim();
    if (!nextName) return;
    setProfileError("");
    try {
      await saveProfile({ id: profileId, name: nextName, streakDays });
      setUserName(nextName);
      setIsProfileEditorOpen(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Nao foi possivel salvar o perfil.");
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

  const openMaterias = (target?: StudyTarget) => {
    setMateriasTarget(target ?? null);
    navigate("materias");
  };

  const reloadStudyProgress = async () => {
    const snapshot = await loadStudyProgress();
    setStudyProgress(snapshot.progress);
    setLastStudy(snapshot.lastStudy);
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
      })
      .catch((error) => {
        console.warn("Nao foi possivel salvar progresso de estudos:", error);
      });
  };

  const markUserActivity = (activityType: UserActivityType) => {
    recordUserActivity(activityType)
      .then((result) => {
        if (result) setStreakDays(result.streakDays);
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
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium md:text-lg flex-shrink-0 transition-all duration-300 ease-out ${compactSidebar ? "md:h-10 md:w-10" : ""}`}>
              {getInitials(userName)}
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
            <HomeView
              streakDays={streakDays}
              studyProgress={studyProgress}
              lastStudy={lastStudy}
              courseModules={courseModules}
              courseContentLoading={courseContentLoading}
              courseContentError={courseContentError}
              onRetryCourseContent={reloadCourseContent}
              onOpenMaterias={openMaterias}
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
              authUser={authUser}
              authReady={authReady}
              onUserNameSave={async (name) => {
                await saveProfile({ id: profileId, name, streakDays });
                setUserName(name);
              }}
              onAuthChanged={reloadProfile}
              streakDays={streakDays}
            />
          )}
          {placeholderViews.includes(currentView) && <PlaceholderView />}
        </div>
      </main>

      {isExamReviewAlertOpen && examReviewAlerts.length > 0 && (
        <ExamReviewAlertPopup
          alerts={examReviewAlerts}
          onClose={dismissExamReviewAlert}
          onOpenCalendar={() => openExamReviewTarget("calendar")}
          onOpenSimulados={() => openExamReviewTarget("simulados")}
        />
      )}

      {/* Bottom Nav — mobile only */}
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
            className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Editar perfil</h2>
                <p className="text-sm text-muted-foreground">Atualize o nome exibido no LearnFlow.</p>
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
  onClose,
  onOpenCalendar,
  onOpenSimulados,
}: {
  alerts: UpcomingExamAlert[];
  onClose: () => void;
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

const SUBJECTS = [
  {
    name: "Português",
    subtitle: "Gramática e Literatura",
    topics: ["Morfologia", "Sintaxe", "Redação", "Interpretação de Texto"],
    progress: 0,
    color: "bg-rose-100 dark:bg-rose-950",
    iconColor: "text-rose-600 dark:text-rose-400",
    icon: "📖",
    done: 0,
  },
  {
    name: "Matemática",
    subtitle: "Álgebra, Geometria e mais",
    topics: ["Funções", "Geometria Plana", "Estatística", "Trigonometria"],
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
    <div className="p-4 md:p-8 xl:p-12">
      <div className="w-full max-w-[1500px] rounded-2xl border border-border bg-card p-6 md:p-8">
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
      </div>
    </div>
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

    setSelected(subjectIndex);
    setSelectedModuleTitle(targetModule?.title ?? null);
  }, [courseContentError, courseContentLoading, courseModules, initialTarget]);

  const selectSubject = (index: number) => {
    if (courseContentLoading || courseContentError) return;
    if (selected === index) {
      setSelected(null);
      setSelectedModuleTitle(null);
      return;
    }

    setSelected(index);
    setSelectedModuleTitle(null);
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
    const activeModule =
      subjectModules.find((module) => module.title === selectedModuleTitle) ??
      subjectModules[0] ??
      null;

    return (
      <div className="p-4 md:p-8 xl:p-12">
        <div className="w-full max-w-[1800px] space-y-5">
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
            <aside className="rounded-2xl border border-border bg-card p-3">
              <div className="sr-only">
                <h3 className="font-semibold text-foreground">Módulos de {s.name}</h3>
                <p className="text-sm text-muted-foreground">Escolha uma trilha para estudar.</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(subjectModules.length ? subjectModules.map((module) => module.title) : s.topics).map((topic) => {
                  const module = subjectModules.find((item) => item.title === topic);
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
                        <span className="truncate text-sm font-medium text-foreground">{topic}</span>
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
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 xl:p-12">
      <div className="w-full max-w-[1500px] space-y-4 md:space-y-8">
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

      </div>
    </div>
  );
}

const LESSON_STAGE_LABELS: Record<
  NonNullable<SubjectModuleContent["sections"]>[number]["level"],
  { title: string; badge: string; tone: string }
> = {
  introducao: {
    title: "Introdução",
    badge: "Comece aqui",
    tone: "border-blue-200 bg-blue-50/80 dark:border-blue-900 dark:bg-blue-950/30",
  },
  basico: {
    title: "Explicação básica",
    badge: "Base",
    tone: "border-green-200 bg-green-50/80 dark:border-green-900 dark:bg-green-950/30",
  },
  intermediario: {
    title: "Explicação intermediária",
    badge: "Aprofunde",
    tone: "border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/30",
  },
  avancado: {
    title: "Explicação avançada",
    badge: "Pegadinhas",
    tone: "border-purple-200 bg-purple-50/80 dark:border-purple-900 dark:bg-purple-950/30",
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
  return {
    summary: module.explanation
      .slice(0, 4)
      .map((paragraph) => paragraph.split(".")[0].trim())
      .filter(Boolean),
    mentalMap: [module.title, "Conceitos", "Exemplos", "Prática", "Revisão"],
    flashcards: [
      {
        front: `Qual é a ideia central de ${module.title}?`,
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
  const commonMastery = {
    title: "Plano de domínio",
    label: "método",
    paragraphs: [
      `Estudar ${moduleTitle} no nível completo exige três voltas: entender a ideia, aplicar em situações diferentes e revisar os erros depois de algum intervalo.`,
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

  return [
    ...getSubjectCourseMethod(subjectName, module.title),
    {
      title: "Aprofundamento orientado",
      label: "aula longa",
      paragraphs: [
        module.explanation[0] ?? module.objective,
        module.explanation[1] ?? "Aprofunde o conceito ligando definição, aplicação e erro comum.",
        `Para dominar ${module.title}, o aluno precisa alternar leitura, resolução, explicação oral e revisão. O objetivo é reconhecer o tema em contextos novos, não apenas repetir a definição.`,
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
        `Em prova, ${module.title} costuma aparecer misturado a interpretação de texto, gráficos, situações cotidianas ou problemas sociais.`,
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
        `Defina ${module.title} em uma frase objetiva.`,
        `Dê um exemplo real de aplicação de ${module.title}.`,
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
  const canCompleteModule = canSaveProgress && getModuleActivityTotal(module) > 0 && moduleProgress < 100;
  const completeModule = () => {
    if (!canSaveProgress) return;

    module.activities.forEach((activity) => {
      onActivityAnswered(subjectName, module.title, activity.question);
    });

    if (module.miniChallenge) {
      onActivityAnswered(subjectName, module.title, `desafio:${module.miniChallenge.question ?? module.title}`);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-background/60 p-4 md:p-6">
      <div className={`rounded-2xl border ${identity.border} ${identity.soft} p-5 md:p-6`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-background text-base font-semibold ${identity.accent}`}>
            {identity.icon}
          </span>
          <p className={`text-sm font-medium ${identity.accent}`}>{identity.label}</p>
        </div>
        <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h3 className="text-2xl md:text-3xl font-semibold text-foreground">{module.title}</h3>
          <div className="min-w-40">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Andamento</span>
              <span>{moduleProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${moduleProgress}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-4xl text-sm md:text-base leading-relaxed text-muted-foreground">{module.objective}</p>
          <button
            type="button"
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
            onClick={completeModule}
            disabled={!canCompleteModule}
          >
            {!canSaveProgress ? "Entre para salvar progresso" : moduleProgress >= 100 ? "Aula concluida" : "Marcar aula como concluida"}
          </button>
        </div>
        {!canSaveProgress && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            Voce pode estudar normalmente, mas progresso, sequencia e continuar estudando so ficam salvos depois de entrar na conta.
          </p>
        )}
      </div>

      <section className="space-y-3">
        <h4 className="text-base md:text-lg font-semibold text-foreground">Rota de aprendizagem</h4>
        <div className="grid gap-3 md:grid-cols-4">
          {learningPath.map((step, index) => (
            <div key={step} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </div>
              <p className="text-sm font-medium leading-relaxed text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky top-0 z-10 -mx-4 border-y border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {[
            ["Aula", "aula-guiada"],
            ["Aprofundamento", "aprofundamento"],
            ["Visual", "visual-conceito"],
            ["Exemplos", "exemplos-resolvidos"],
            ["Prática", "pratica-graduada"],
            ["Revisão", "revisao-final"],
          ].map(([label, target]) => (
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

      <section id="aula-guiada" className="scroll-mt-24 space-y-3">
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
                className={`rounded-2xl border p-4 md:p-5 ${stage.tone}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-primary">
                      {stage.badge}
                    </span>
                    <h5 className="mt-2 text-base md:text-lg font-semibold text-foreground">{section.title}</h5>
                    <p className="text-xs text-muted-foreground">{stage.title}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3 text-sm md:text-base leading-relaxed text-foreground">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.analogy && (
                    <div className="rounded-lg bg-background/70 p-3">
                      <strong>Analogia: </strong>{section.analogy}
                    </div>
                  )}
                  {section.whyItMatters && (
                    <div className="rounded-lg bg-background/70 p-3">
                      <strong>Por que importa: </strong>{section.whyItMatters}
                    </div>
                  )}
                  {section.commonMistake && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <strong>Erro comum: </strong>{section.commonMistake}
                    </div>
                  )}
                  {section.teacherTip && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <strong>Truque de professor: </strong>{section.teacherTip}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div id="aprofundamento" className="scroll-mt-24">
        <CourseCompleteSection blocks={courseBlocks} identity={identity} />
      </div>

      {module.visual && (
        <div id="visual-conceito" className="scroll-mt-24">
          <ModuleVisual visual={module.visual} subjectName={subjectName} />
        </div>
      )}

      <section id="exemplos-resolvidos" className="scroll-mt-24 space-y-3">
        <h4 className="text-base md:text-lg font-semibold text-foreground">Exemplos resolvidos</h4>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {module.examples.map((example) => (
            <div key={example.title} className="rounded-xl border border-border bg-card p-4">
              <h5 className="font-semibold text-foreground">{example.title}</h5>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{example.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pratica-graduada" className="scroll-mt-24 space-y-3">
        <h4 className="text-base md:text-lg font-semibold text-foreground">Prática graduada</h4>
        <div className="space-y-3">
          {module.activities.map((activity, index) => (
            <ModuleActivity
              key={activity.question}
              activity={activity}
              index={index}
              difficulty={getActivityDifficulty(activity, index)}
              onAnswered={() => onActivityAnswered(subjectName, module.title, activity.question)}
            />
          ))}
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

      <div id="revisao-final" className="scroll-mt-24">
        <ModuleReview review={review} subjectName={subjectName} />
      </div>
    </div>
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

  return (
    <section className="space-y-3">
      <h4 className="text-base md:text-lg font-semibold text-foreground">{identity.visualTitle}</h4>
      <div className={`rounded-xl border ${identity.border} bg-card p-4 md:p-5`}>
        <div className={`flex flex-col gap-5 ${isCustomChemistryVisual ? "" : "lg:flex-row lg:items-start"}`}>
          <div className={isCustomChemistryVisual ? "w-full" : "flex-1"}>
            <p className={`text-sm font-medium ${identity.accent}`}>{visual.title}</p>
            <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">{visual.description}</p>
            <div className="mt-4">
              <SubjectSignature subjectName={subjectName} nodes={visual.nodes} visualTitle={visual.title} />
            </div>
          </div>
          {!isCustomChemistryVisual && (
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
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-xl border border-indigo-200 bg-background p-4 dark:border-indigo-900">
          <svg viewBox="0 0 420 240" className="h-[240px] w-full">
            <defs>
              <marker id="mathArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="fill-current text-indigo-600" />
              </marker>
            </defs>
            <line x1="42" y1="200" x2="388" y2="200" stroke="currentColor" strokeWidth="2" markerEnd="url(#mathArrow)" className="text-muted-foreground" />
            <line x1="60" y1="216" x2="60" y2="26" stroke="currentColor" strokeWidth="2" markerEnd="url(#mathArrow)" className="text-muted-foreground" />
            <path d="M70 180 L140 148 L210 116 L280 84 L350 52" fill="none" stroke="currentColor" strokeWidth="4" className="text-indigo-600" />
            <path d="M70 168 C140 48 250 48 350 168" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 7" className="text-violet-500" />
            {[70, 140, 210, 280, 350].map((x, index) => (
              <circle key={x} cx={x} cy={180 - index * 32} r="5" className="fill-current text-indigo-600" />
            ))}
            <text x="88" y="44" className="fill-foreground text-sm font-semibold">f(x)=ax+b</text>
            <text x="252" y="68" className="fill-violet-700 text-sm font-semibold dark:fill-violet-300">ax²+bx+c</text>
            <text x="344" y="224" className="fill-muted-foreground text-xs">entrada</text>
            <text x="18" y="42" className="fill-muted-foreground text-xs">saída</text>
          </svg>
        </div>

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-background p-3 dark:border-indigo-900">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
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
    <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 dark:border-cyan-900 dark:bg-cyan-950/20">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-cyan-200 bg-background p-4 dark:border-cyan-900">
          <svg viewBox="0 0 420 230" className="h-[230px] w-full">
            <rect x="34" y="42" width="112" height="78" rx="8" fill="none" stroke="currentColor" strokeWidth="4" className="text-cyan-600" />
            <text x="70" y="138" className="fill-foreground text-sm font-semibold">A=b.h</text>
            <polygon points="205,122 260,42 330,122" fill="none" stroke="currentColor" strokeWidth="4" className="text-indigo-600" />
            <line x1="260" y1="42" x2="260" y2="122" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" className="text-muted-foreground" />
            <text x="225" y="146" className="fill-foreground text-sm font-semibold">A=b.h/2</text>
            <circle cx="104" cy="184" r="32" fill="none" stroke="currentColor" strokeWidth="4" className="text-violet-600" />
            <line x1="104" y1="184" x2="136" y2="184" stroke="currentColor" strokeWidth="3" className="text-violet-600" />
            <text x="150" y="190" className="fill-foreground text-sm font-semibold">πr²</text>
            <path d="M260 178 L330 178 L330 208" fill="none" stroke="currentColor" strokeWidth="4" className="text-emerald-600" />
            <text x="252" y="166" className="fill-muted-foreground text-xs">Pitágoras</text>
          </svg>
        </div>

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="rounded-xl border border-cyan-200 bg-background p-3 dark:border-cyan-900">
              <p className="text-xs font-semibold uppercase text-cyan-700 dark:text-cyan-300">Passo {index + 1}</p>
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
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-amber-200 bg-background p-4 dark:border-amber-900">
          <svg viewBox="0 0 420 230" className="h-[230px] w-full">
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

        <div className="grid gap-2">
          {labels.map((node, index) => (
            <div key={`${node}-${index}`} className="rounded-xl border border-amber-200 bg-background p-3 dark:border-amber-900">
              <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">Conceito {index + 1}</p>
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

  return (
    <section className="space-y-3">
      <h4 className="text-base md:text-lg font-semibold text-foreground">{identity.reviewTitle}</h4>
      <div className="grid gap-3 lg:grid-cols-3">
        <div className={`rounded-xl border ${identity.border} bg-card p-4`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h5 className="font-semibold text-foreground">Resumo visual</h5>
            <span className={`rounded-full ${identity.soft} px-2.5 py-1 text-xs ${identity.accent}`}>essencial</span>
          </div>
          <div className="space-y-3">
            {review.summary.map((item, index) => (
              <div key={item} className="rounded-lg border border-border bg-background p-3">
                <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full ${identity.soft} text-xs font-semibold ${identity.accent}`}>
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
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
            {review.flashcards.map((card) => (
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

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="font-medium leading-relaxed text-foreground">
          {index + 1}. {activity.question}
        </p>
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
    <div className="p-4 md:p-8 xl:p-12">
      <div className="bg-card rounded-xl p-6 text-center border border-border md:p-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Em desenvolvimento</h3>
        <p className="text-muted-foreground">Esta seção estará disponível em breve.</p>
      </div>
    </div>
  );
}

function ConfiguracoesView({
  userName,
  authUser,
  authReady,
  onUserNameSave,
  onAuthChanged,
  streakDays,
}: {
  userName: string;
  authUser: AuthUser | null;
  authReady: boolean;
  onUserNameSave: (name: string) => Promise<void>;
  onAuthChanged: () => Promise<void>;
  streakDays: number;
}) {
  const [draftName, setDraftName] = useState(userName);
  const [status, setStatus] = useState("");

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = draftName.trim();
    if (!nextName) return;
    setStatus("");
    try {
      await onUserNameSave(nextName);
      setStatus("Nome salvo na sua conta.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel salvar o perfil.");
    }
  };

  return (
    <div className="p-4 md:p-8 xl:p-12">
      <div className="w-full max-w-[980px] space-y-5 md:space-y-8">
        <AuthPanel authUser={authUser} authReady={authReady} onAuthChanged={onAuthChanged} />

        <form onSubmit={handleSaveProfile} className="bg-card rounded-xl p-5 md:p-6 border border-border space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Perfil</h2>
            <p className="text-sm text-muted-foreground">Atualize as informações básicas do estudante.</p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Nome do usuário</span>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              placeholder="Digite seu nome"
            />
          </label>

          <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto md:px-5 md:py-2.5 md:text-base">
            Salvar nome
          </button>

          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </form>

        <div className="bg-card rounded-xl p-5 md:p-6 xl:p-8 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">Sequência atual</h2>
          <p className="text-sm text-muted-foreground">
            {streakDays} dias seguidos. A sequência aumenta no primeiro estudo concluído de cada dia.
          </p>
        </div>
      </div>
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
    <div className="p-4 md:p-8 xl:p-12">
      <div className="w-full max-w-[980px] space-y-5">
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
      </div>
    </div>
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

function HomeView({
  streakDays,
  studyProgress,
  lastStudy,
  courseModules,
  courseContentLoading,
  courseContentError,
  onRetryCourseContent,
  onOpenMaterias,
}: {
  streakDays: number;
  studyProgress: StudyProgress;
  lastStudy: LastStudyData;
  courseModules: SubjectModuleMap;
  courseContentLoading: boolean;
  courseContentError: string;
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

  return (
    <div className="p-4 md:p-8 xl:p-12 space-y-5 md:space-y-8">
      <div className="w-full max-w-[1500px] space-y-5 md:space-y-8">
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
      </div>
    </div>
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
  try {
    return await enableDevicePushNotifications();
  } catch (error) {
    console.warn("Nao foi possivel ativar notificacoes push:", error);
    return "unsupported";
  }
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

function CalendarView({ onUserActivity }: { onUserActivity: (activityType: UserActivityType) => void }) {
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
      onUserActivity("calendario");
    } catch (error) {
      setCalendarStatusTone("error");
      setCalendarStatus(error instanceof Error ? error.message : "Nao foi possivel salvar o lembrete.");
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
      onUserActivity("calendario");
    } catch (error) {
      setCalendarStatusTone("error");
      setCalendarStatus(error instanceof Error ? error.message : "Nao foi possivel marcar o simulado.");
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
      onUserActivity("calendario");
    } catch (error) {
      setCalendarStatusTone("error");
      setCalendarStatus(error instanceof Error ? error.message : "Nao foi possivel salvar a recorrencia.");
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
    <div className="p-4 md:p-8 xl:p-12">
      <div className="w-full max-w-[1500px] space-y-5 md:space-y-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
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

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </div>
    </div>
  );
}

function FlashcardsView({
  profileId,
  onUserActivity,
}: {
  profileId: string;
  onUserActivity: (activityType: UserActivityType) => void;
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
      onUserActivity("flashcard");
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
      onUserActivity("flashcard");
    } catch (error) {
      setDeckStatus(error instanceof Error ? error.message : "Nao foi possivel criar o flashcard.");
    }
  };

  const markCardReviewed = async () => {
    if (!currentReviewCard) return;
    try {
      const reviewedCard = await reviewFlashcard(currentReviewCard);
      setCards((currentCards) => currentCards.map((card) => card.id === reviewedCard.id ? reviewedCard : card));
      setReviewIndex((current) => (cards.length > 0 ? (current + 1) % cards.length : 0));
      setIsCardAnswerVisible(false);
      onUserActivity("flashcard");
    } catch (error) {
      setDeckStatus(error instanceof Error ? error.message : "Nao foi possivel atualizar a revisao.");
    }
  };

  return (
    <div className="p-4 md:p-8 xl:p-12">
      <div className="w-full max-w-[1500px] space-y-5 md:space-y-8">
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
                  <h3 className="font-semibold text-foreground">Revisão</h3>
                  <p className="text-sm text-muted-foreground">{cards.length} cards neste deck</p>
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
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Frente</p>
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
                      className="flex-1 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
                      onClick={() => setIsCardAnswerVisible((visible) => !visible)}
                      type="button"
                    >
                      {isCardAnswerVisible ? "Ocultar resposta" : "Mostrar resposta"}
                    </button>
                    <button
                      className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                      onClick={markCardReviewed}
                      type="button"
                    >
                      Revisei
                    </button>
                  </div>
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
      </div>
    </div>
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

const ENEM_OFFICIAL_EXAMS: EnemExam[] = [
  {
    id: "enem-2025-white-english",
    title: "ENEM 2025 - Caderno Branco",
    year: 2025,
    day: 1,
    questionCount: 5,
    areas: ["Linguagens", "Caderno Branco"],
    description: "Questões oficiais de língua estrangeira do ENEM 2025 em formato nativo, com alternativas clicáveis e correção ao finalizar.",
    pdfUrl: "",
    officialUrl: "",
    answerKeyUrl: "",
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
    answerKey: {},
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

function SimuladosView({ onUserActivity }: { onUserActivity: (activityType: UserActivityType) => void }) {
  const [activeTab, setActiveTab] = useState<"official" | "custom" | "history">("official");
  const [selectedExam, setSelectedExam] = useState<EnemExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [languageChoice, setLanguageChoice] = useState<"english" | "spanish">("english");
  const [result, setResult] = useState<EnemExamResult | null>(null);
  const [attempts, setAttempts] = useState<SimuladoAttemptData[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [resultStatus, setResultStatus] = useState("");

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

  const openExam = (exam: EnemExam) => {
    setSelectedExam(exam);
    setAnswers({});
    setResult(null);
    setResultStatus("");
    onUserActivity("simulado");
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
    onUserActivity("simulado");
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
      onUserActivity("simulado");
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

    return (
      <div className="p-4 md:p-8 xl:p-12">
        <div className="w-full max-w-[1500px] space-y-5 md:space-y-8">
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

          {visibleQuestion ? (
            <>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="rounded-xl border border-border bg-card p-5 md:p-7 xl:p-10">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Questão {visibleQuestion.number}</p>
                    <p className="text-sm text-muted-foreground">{visibleQuestion.area}</p>
                  </div>
                  {visibleQuestion.source && (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {visibleQuestion.source}
                    </span>
                  )}
                </div>

                {visibleQuestion.support && (
                  <div className="mb-6 rounded-xl bg-muted/60 p-4 md:p-5 text-sm md:text-base leading-relaxed text-foreground">
                    {visibleQuestion.support}
                  </div>
                )}

                {visibleQuestion.image && (
                  <figure className="mb-6 overflow-hidden rounded-xl border border-border bg-muted/40">
                    <img
                      src={visibleQuestion.image}
                      alt={visibleQuestion.imageAlt ?? ""}
                      className="w-full object-contain"
                    />
                    {visibleQuestion.imageAlt && (
                      <figcaption className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
                        {visibleQuestion.imageAlt}
                      </figcaption>
                    )}
                  </figure>
                )}

                {!visibleQuestion.image && visibleQuestion.imageAlt && (
                  <div className="mb-6 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm md:text-base text-muted-foreground">
                    Imagem da questão pendente de importação: {visibleQuestion.imageAlt}
                  </div>
                )}

                <h3 className="mb-5 text-lg md:text-xl font-semibold leading-relaxed text-foreground">
                  {visibleQuestion.prompt}
                </h3>

                <div className="space-y-3">
                  {visibleQuestion.options?.map((option, index) => {
                    const value = OBJECTIVE_OPTIONS[index];
                    const selected = answers[String(visibleQuestion.number)] === value;
                    return (
                      <button
                        key={value}
                        className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/10 text-foreground" : "border-border hover:bg-accent text-foreground"}`}
                        onClick={() => saveAnswer(String(visibleQuestion.number), value)}
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
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-4 md:p-5">
                  <h3 className="font-semibold text-foreground">Idioma selecionado</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Caderno Branco.</p>
                  {availableLanguages.length > 1 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
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
                          onClick={() => goToQuestion(question.number)}
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
                        onClick={() => goToQuestion(question.number)}
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
        </div>
      </div>
    );
  }


  return (
    <div className="p-4 md:p-8 xl:p-12">
      <div className="w-full max-w-[1500px] space-y-5 md:space-y-8">
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
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Banco ENEM</h2>
          <p className="mt-2 max-w-3xl text-sm md:text-base text-muted-foreground">
            Catálogo em formato nativo. A primeira prova importada é o Caderno Branco do ENEM 2025, com questões de língua estrangeira.
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {ENEM_OFFICIAL_EXAMS.map((exam) => (
            <EnemExamCard key={exam.id} exam={exam} onOpen={openExam} />
          ))}
        </div>
          </>
        ) : activeTab === "custom" ? (
          <PersonalizedSimuladoBuilder attempts={attempts} onOpen={openExam} />
        ) : (
          <SimuladoAttemptsHistory attempts={attempts} isLoading={attemptsLoading} onRetry={refreshAttempts} />
        )}
      </div>
    </div>
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
}: {
  attempts: SimuladoAttemptData[];
  isLoading: boolean;
  onRetry: () => void;
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
        {attempts.map((attempt) => (
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
          </div>
        ))}
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



