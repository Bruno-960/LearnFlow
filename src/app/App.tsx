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
  saveProfile,
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
  loadFlashcardDecks,
  saveFlashcardDeck,
  type FlashcardDeckData,
} from "../services/flashcardDeckData";
import { SUBJECT_MODULES, type SubjectModuleContent } from "../data/subjectContent";
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

  useEffect(() => {
    let isMounted = true;

    getCurrentAuthUser()
      .then(async (user) => {
        if (!isMounted) return;
        setAuthUser(user);
        await reloadProfile();
      })
      .finally(() => {
        if (isMounted) setAuthReady(true);
      });

    const unsubscribe = onAuthUserChange((user) => {
      if (!isMounted) return;
      setAuthUser(user);
      reloadProfile();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

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
    setSidebarOpen(false);
  };

  const viewTitle = VIEW_TITLES[currentView];
  const title = currentView === "home" ? `Olá, ${userName}! 👋` : viewTitle.title;
  const subtitle = viewTitle.subtitle;

  const placeholderViews: View[] = ["avaliacoes", "desempenho"];

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
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 md:w-72 xl:w-80 bg-sidebar border-r border-sidebar-border flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 pb-4 md:p-7 md:pb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-semibold text-lg md:text-xl text-foreground">LearnFlow</span>
          </div>
          <button
            className="md:hidden p-1 rounded-lg hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 md:px-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map(({ view, icon, label }) => (
            <NavItem
              key={view}
              icon={icon}
              label={label}
              active={currentView === view}
              onClick={() => navigate(view)}
            />
          ))}
        </nav>

        {/* Streak Card */}
        <div className="mx-3 md:mx-4 mb-4 p-4 md:p-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-2xl md:text-3xl font-bold">{streakDays} dias</span>
          </div>
          <p className="text-sm md:text-base text-orange-100">
            {streakDays > 0 ? "Mantenha o ritmo!" : "Comece sua sequência hoje."}
          </p>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            className="w-full flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-sidebar-accent transition-colors"
            onClick={changeUserName}
            type="button"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium md:text-lg flex-shrink-0">
              {getInitials(userName)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm md:text-base font-medium text-sidebar-foreground truncate">{userName}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Editar perfil</div>
            </div>
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-sidebar-foreground flex-shrink-0" />
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
            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
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
          {currentView === "home" && <HomeView streakDays={streakDays} />}
          {currentView === "calendar" && <CalendarView />}
          {currentView === "flashcards" && <FlashcardsView profileId={profileId} />}
          {currentView === "simulados" && <SimuladosView />}
          {currentView === "materias" && <MateriasView />}
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

      {/* Bottom Nav — mobile only */}
      <nav className="fixed bottom-0 inset-x-0 z-20 md:hidden bg-card border-t border-border flex">
        {BOTTOM_NAV.map(({ view, icon, label }) => (
          <button
            key={view}
            onClick={() => navigate(view)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              currentView === view ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className={`transition-transform ${currentView === view ? "scale-110" : ""}`}>
              {icon}
            </span>
            <span className="text-[10px] font-medium">{label}</span>
            {currentView === view && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
        {/* More button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-muted-foreground"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">Mais</span>
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

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
                onClick={() => setIsProfileEditorOpen(false)}
              >
                Cancelar
              </button>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 md:py-3.5 rounded-lg transition-colors [&>svg]:h-5 [&>svg]:w-5 md:[&>svg]:h-6 md:[&>svg]:w-6 ${
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      {icon}
      <span className="text-sm md:text-base font-medium">{label}</span>
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

function getSubjectModuleCount(subjectName: string) {
  return SUBJECT_MODULES[subjectName]?.length ?? 0;
}

function MateriasView() {
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedModuleTitle, setSelectedModuleTitle] = useState<string | null>(null);

  const selectSubject = (index: number) => {
    if (selected === index) {
      setSelected(null);
      setSelectedModuleTitle(null);
      return;
    }

    setSelected(index);
    setSelectedModuleTitle(null);
  };

  return (
    <div className="p-4 md:p-8 xl:p-12">
      <div className="w-full max-w-[1500px] space-y-4 md:space-y-8">
        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {SUBJECTS.map((s, i) => (
            (() => {
              const moduleCount = getSubjectModuleCount(s.name);
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
              <span className="text-xs text-muted-foreground mb-2">{s.done}/{moduleCount} módulos</span>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${moduleCount > 0 ? Math.round((s.done / moduleCount) * 100) : 0}%` }}
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
          const subjectModules = SUBJECT_MODULES[s.name] ?? [];
          const moduleCount = subjectModules.length;
          const subjectProgress = moduleCount > 0 ? Math.round((s.done / moduleCount) * 100) : 0;
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
                  <p className="text-xs text-muted-foreground">{s.done}/{moduleCount} módulos</p>
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
                <ModuleContent module={activeModule} />
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

function ModuleContent({ module }: { module: SubjectModuleContent }) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-background/60 p-5 md:p-6">
      <div>
        <p className="text-sm font-medium text-primary">Módulo de estudo</p>
        <h3 className="mt-1 text-xl md:text-2xl font-semibold text-foreground">{module.title}</h3>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">{module.objective}</p>
      </div>

      <section className="space-y-3">
        <h4 className="text-base font-semibold text-foreground">Conteúdo explicativo</h4>
        <div className="space-y-3 text-sm md:text-base leading-relaxed text-foreground">
          {module.explanation.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-base font-semibold text-foreground">Exemplos</h4>
        <div className="grid gap-3 md:grid-cols-3">
          {module.examples.map((example) => (
            <div key={example.title} className="rounded-xl border border-border bg-card p-4">
              <h5 className="font-semibold text-foreground">{example.title}</h5>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{example.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-base font-semibold text-foreground">Atividades</h4>
        <div className="space-y-3">
          {module.activities.map((activity, index) => (
            <ModuleActivity key={activity.question} activity={activity} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ModuleActivity({
  activity,
  index,
}: {
  activity: SubjectModuleContent["activities"][number];
  index: number;
}) {
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const hasChoices = Boolean(activity.choices?.length);
  const isChoiceCorrect =
    selectedChoice !== null &&
    activity.correctChoice !== undefined &&
    selectedChoice === activity.correctChoice;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-medium leading-relaxed text-foreground">
        {index + 1}. {activity.question}
      </p>

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
          onClick={() => setShowFeedback(true)}
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
          <p>{activity.answer}</p>
        </div>
      )}
    </div>
  );
}

function PlaceholderView() {
  return (
    <div className="p-4 md:p-8 xl:p-12">
      <div className="bg-card rounded-xl p-10 md:p-12 text-center border border-border">
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
      setStatus("Nome salvo no Supabase.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel salvar no Supabase.");
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

          <button className="px-4 py-2 md:px-5 md:py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm md:text-base">
            Salvar nome
          </button>

          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </form>

        <div className="bg-card rounded-xl p-5 md:p-6 xl:p-8 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">Sequência atual</h2>
          <p className="text-sm text-muted-foreground">
            {streakDays} dias seguidos. A contagem começa em 0 e será incrementada quando conectarmos a rotina de login/estudo.
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthPanel({
  authUser,
  authReady,
  onAuthChanged,
}: {
  authUser: AuthUser | null;
  authReady: boolean;
  onAuthChanged: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setStatus("Conta criada. Se o Supabase pedir confirmacao por email, confirme antes de entrar.");
      }

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
      await onAuthChanged();
      setStatus("Voce saiu da conta.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel sair.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-5 md:p-6 border border-border space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Conta</h2>
        <p className="text-sm text-muted-foreground">
          Entre para separar seus dados por usuario e sincronizar entre dispositivos.
        </p>
      </div>

      {!authReady ? (
        <p className="text-sm text-muted-foreground">Verificando sessao...</p>
      ) : authUser ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/60 p-4">
            <p className="text-sm text-muted-foreground">Conectado como</p>
            <p className="font-medium text-foreground">{authUser.email || authUser.id}</p>
          </div>
          <button
            className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSignOut}
            disabled={isSubmitting}
            type="button"
          >
            Sair da conta
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              className={`rounded-lg px-4 py-2 text-sm ${mode === "signin" ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-accent"}`}
              onClick={() => setMode("signin")}
              type="button"
            >
              Entrar
            </button>
            <button
              className={`rounded-lg px-4 py-2 text-sm ${mode === "signup" ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-accent"}`}
              onClick={() => setMode("signup")}
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
              minLength={6}
              required
            />
          </label>

          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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

function HomeView({ streakDays }: { streakDays: number }) {
  const totalModules = SUBJECTS.reduce((total, subject) => total + getSubjectModuleCount(subject.name), 0);
  const completedModules = SUBJECTS.reduce((total, subject) => total + subject.done, 0);
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const inProgressSubjects = SUBJECTS.filter((subject) => subject.progress > 0).slice(0, 4);

  return (
    <div className="p-4 md:p-8 xl:p-12 space-y-5 md:space-y-8">
      <div className="w-full max-w-[1500px] space-y-5 md:space-y-8">
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {inProgressSubjects.map((subject) => (
                <SubjectCard
                  key={subject.name}
                  name={subject.name}
                  subtitle={subject.topics[0] ?? subject.subtitle}
                  progress={subject.progress}
                  color={subject.color}
                  icon={subject.icon}
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
            <button className="text-sm text-primary hover:underline">Ver todas →</button>
          </div>
          <div className="space-y-3">
            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <p className="text-sm text-muted-foreground">
                Nenhum estudo agendado ainda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type CalendarReminder = {
  id: string;
  date: string;
  title: string;
};

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

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatLongDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${day} de ${MONTH_NAMES[month - 1]} de ${year}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function dateToKey(date: Date) {
  return formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
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

function CalendarView() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(dateToKey(today));
  const [reminders, setReminders] = useState<CalendarReminder[]>([]);
  const [reminderDraft, setReminderDraft] = useState("");

  const holidays = getBrazilianHolidays(selectedYear);
  const holidaysByDate = holidays.reduce<Record<string, CalendarHoliday[]>>((acc, holiday) => {
    acc[holiday.date] = [...(acc[holiday.date] ?? []), holiday];
    return acc;
  }, {});
  const remindersByDate = reminders.reduce<Record<string, CalendarReminder[]>>((acc, reminder) => {
    acc[reminder.date] = [...(acc[reminder.date] ?? []), reminder];
    return acc;
  }, {});

  const selectedDayHolidays = holidaysByDate[selectedDate] ?? [];
  const selectedDayReminders = remindersByDate[selectedDate] ?? [];
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

  const addReminder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = reminderDraft.trim();
    if (!title) return;

    setReminders((current) => [
      ...current,
      { id: crypto.randomUUID(), date: selectedDate, title },
    ]);
    setReminderDraft("");
  };

  const removeReminder = (id: string) => {
    setReminders((current) => current.filter((reminder) => reminder.id !== id));
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

            <div className="grid grid-cols-7 gap-1.5 md:gap-2 lg:gap-3">
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
                const isSelected = selectedDate === dateKey;
                const isToday = todayKey === dateKey;

                return (
                  <button
                    key={dateKey}
                    className={`min-h-20 rounded-lg border p-2 text-left transition-colors md:min-h-24 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => setSelectedDate(dateKey)}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{day}</span>
                      {isToday && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${isSelected ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                          Hoje
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {dayHolidays.length > 0 && <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-white" : "bg-green-500"}`} />}
                      {dayReminders.length > 0 && <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-white" : "bg-orange-500"}`} />}
                    </div>
                    <div className="mt-2 space-y-1">
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
                  <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                    Adicionar lembrete
                  </button>
                </form>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">Lembretes do dia</h4>
                  {selectedDayReminders.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedDayReminders.map((reminder) => (
                        <div key={reminder.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/60 p-3">
                          <p className="text-sm text-foreground">{reminder.title}</p>
                          <button
                            className="text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => removeReminder(reminder.id)}
                            type="button"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Nenhum lembrete para esta data.</p>
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
              <p className="text-sm text-muted-foreground">Visão anual com os feriados nacionais e pontos facultativos principais.</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400"><span className="h-2 w-2 rounded-full bg-green-500" /> Feriado</span>
              <span className="inline-flex items-center gap-1 text-orange-700 dark:text-orange-400"><span className="h-2 w-2 rounded-full bg-orange-500" /> Lembrete</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MONTH_NAMES.map((monthName, monthIndex) => {
              const monthHolidays = holidays.filter((holiday) => Number(holiday.date.slice(5, 7)) === monthIndex + 1);
              const monthReminderCount = reminders.filter((reminder) => Number(reminder.date.slice(5, 7)) === monthIndex + 1).length;

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
                    {monthReminderCount > 0 && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                        {monthReminderCount}
                      </span>
                    )}
                  </div>
                  {monthHolidays.length > 0 ? (
                    <div className="mt-3 space-y-1">
                      {monthHolidays.map((holiday) => (
                        <p key={`${holiday.date}-${holiday.name}`} className="text-xs text-muted-foreground">
                          <span className="font-medium text-green-700 dark:text-green-400">{Number(holiday.date.slice(8, 10))}</span> · {holiday.name}
                        </p>
                      ))}
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

function FlashcardsView({ profileId }: { profileId: string }) {
  const [decks, setDecks] = useState<FlashcardDeckData[]>([]);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [deckStatus, setDeckStatus] = useState("");
  const reviewCount = decks.reduce((total, deck) => total + deck.cards, 0);

  useEffect(() => {
    let isMounted = true;

    loadFlashcardDecks().then((loadedDecks) => {
      if (isMounted) setDecks(loadedDecks);
    });

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const createDeck = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = deckName.trim();
    if (!name) return;

    const deck = {
      id: crypto.randomUUID(),
      name,
      subtitle: "Deck criado pelo usuário",
      progress: 0,
      icon: "▤",
      cards: 0,
      createdAt: new Date().toISOString(),
    };

    setDeckStatus("");
    try {
      await saveFlashcardDeck(deck);
      setDecks((currentDecks) => [...currentDecks, deck]);
      setDeckName("");
      setIsCreatingDeck(false);
    } catch (error) {
      setDeckStatus(error instanceof Error ? error.message : "Nao foi possivel criar o deck no Supabase.");
    }
  };

  return (
    <div className="p-4 md:p-8 xl:p-12">
      <div className="w-full max-w-[1500px] space-y-5 md:space-y-8">
        <div className="flex gap-4 border-b border-border">
          <button className="pb-3 px-1 text-sm font-medium text-primary border-b-2 border-primary">
            Meus decks
          </button>
          <button className="pb-3 px-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            Revisão
          </button>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 md:px-5 md:py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm md:text-base"
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
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
                onClick={() => {
                  setDeckName("");
                  setIsCreatingDeck(false);
                }}
              >
                Cancelar
              </button>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                Criar deck
              </button>
            </div>
            {deckStatus && <p className="text-sm text-destructive">{deckStatus}</p>}
          </form>
        )}

        {decks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {decks.map((deck) => (
              <FlashcardDeck
                key={deck.id}
                name={deck.name}
                subtitle={`${deck.cards} cards`}
                progress={deck.progress}
                color="bg-purple-100 dark:bg-purple-950"
                icon={deck.icon}
              />
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

        {reviewCount > 0 && (
          <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Revisão inteligente</h3>
              <p className="text-sm text-muted-foreground">Você tem {reviewCount} cards disponíveis para revisar.</p>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 md:px-5 md:py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm md:text-base">
              Iniciar revisão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type EnemQuestion = {
  id: string;
  number: number;
  type: "objective" | "open";
  area: string;
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

const ENEM_OFFICIAL_EXAMS: EnemExam[] = [
  {
    id: "enem-2025-white-english",
    title: "ENEM 2025 - Inglês, Caderno Branco",
    year: 2025,
    day: 1,
    questionCount: 5,
    areas: ["Linguagens", "Inglês"],
    description: "Piloto nativo com as cinco questões de inglês enviadas para importação.",
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
    spanishAnswerKey: {},
    answerKey: {},
    questions: [
      {
        id: "enem-2025-branco-ing-q1",
        number: 1,
        type: "objective",
        area: "Inglês",
        support: "It is true that all children are special, simply because they are children. But most adults are not special, and children end up as adults pretty quickly. Life then can be difficult and even disappointing. The shock of this may account for the emergence of the “snowflake generation” of university students, who are so delicate they can’t handle controversial ideas being put forward in their lectures. The roots of this fragility run deep in modern culture. So, an approach of the world that states: “Life is wonderful, you’re special and, if you are a good boy/girl, life will be amazing forever” is not a message designed to aid bouncing back from failure or confronting catastrophe. Resilience is not about feeding ego — telling your children how wonderful they are — but strengthening it.",
        prompt: "Nesse texto, a expressão “snowflake generation” é usada para",
        source: "ENEM 2025, Inglês, Caderno Branco, Questão 01.",
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
        support: "A imagem mostra copos de café com mensagens relacionadas ao sono: “What is sleep?”, “Slept 5-7 hours” e “Slept 8-10 hours”.",
        prompt: "Nesse texto, a pergunta “What is sleep?”, em uma das embalagens do produto, está relacionada ao(à)",
        source: "ENEM 2025, Inglês, Caderno Branco, Questão 02.",
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
        support: "Glory Ames, from the White Earth reservation, is frustrated that despite the presence of several indigenous reservations near Moorhead, local Halloween stores still feature a western section with costumes such as “pow wow princess”. Even worse, despite a long-running debate about racism and cultural appropriation, often prompted by backlash against celebrities and politicians for donning offensive costumes, people continue to wear such costumes. Last Halloween, Ames spotted a photo on Instagram of a girl dressed as a Native American with a bullet in her forehead. She immediately reported it to the social media platform and had it removed. “They blatantly take certain aspects of our culture, race, religion, and use it for their advantage and ignore the people living it”, said Ames.",
        prompt: "Ao abordar um aspecto da celebração do Halloween, esse texto tem por objetivo",
        source: "ENEM 2025, Inglês, Caderno Branco, Questão 03.",
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
        support: "My idea of philosophy is that if it is not relevant to human problems, if it does not tell us how we can go about eradicating some of the misery in this world, then it is not worth the name of philosophy. I think Socrates made a very profound statement when he asserted that philosophy is to teach us proper living. In this day and age “proper living” means liberation from the urgent problems of poverty, economic necessity and indoctrination, mental oppression.",
        prompt: "Nesse texto, ao discorrer sobre a relevância da filosofia, a escritora Angela Davis tem por objetivo",
        source: "ENEM 2025, Inglês, Caderno Branco, Questão 04.",
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
        support: "Remember the sky that you were born under, know each of the star’s stories. Remember the moon, know who she is. Remember the sun’s birth at dawn. [...] Remember your birth, how your mother struggled to give you form and breath [...] Remember the earth whose skin you are: red earth, black earth, yellow earth, white earth, brown earth, we are earth. Remember the plants, trees, animal life who all have their tribes, their families, their histories, too [...] Remember you are all people and all people are you. Remember you are this universe and this universe is you. Remember all is in motion, is growing, is you.",
        prompt: "Nesse poema, de uma autora de ascendência indígena, o eu lírico ressalta a",
        source: "ENEM 2025, Inglês, Caderno Branco, Questão 05.",
        options: [
          "potência dos astros celestes.",
          "origem das plantas e dos animais.",
          "importância do apego à terra natal.",
          "relação entre seres humanos e natureza.",
          "conexão entre o tempo real e o tempo imaginário.",
        ],
      },
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

function SimuladosView() {
  const [selectedExam, setSelectedExam] = useState<EnemExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [languageChoice, setLanguageChoice] = useState<"english" | "spanish">("english");
  const [result, setResult] = useState<{
    correct: number;
    wrong: number;
    unanswered: number;
    percent: number;
    byArea: Record<string, { correct: number; total: number }>;
  } | null>(null);

  const openExam = (exam: EnemExam) => {
    setSelectedExam(exam);
    setAnswers({});
    setResult(null);
  };

  const saveAnswer = (questionId: string, value: string) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));
    setResult(null);
  };

  const finishExam = (exam: EnemExam) => {
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
    setResult({
      correct,
      wrong,
      unanswered,
      percent: Math.round((correct / exam.questionCount) * 100),
      byArea,
    });
  };

  if (selectedExam) {
    const importedQuestions = selectedExam.questions;
    const [firstQuestion] = importedQuestions;
    const currentNumber = Number((answers.__currentQuestion as string | undefined) ?? firstQuestion?.number ?? 1);
    const visibleQuestion = importedQuestions.find((question) => question.number === currentNumber) ?? firstQuestion ?? null;
    const answeredCount = importedQuestions.filter((question) => answers[String(question.number)]).length;
    const totalImported = importedQuestions.length;
    const hasOfficialAnswerKey = importedQuestions.every((question) =>
      Boolean(getOfficialAnswer(selectedExam, question.number, languageChoice)),
    );

    const finishImportedExam = () => {
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
      setResult({
        correct,
        wrong,
        unanswered,
        percent: totalImported > 0 ? Math.round((correct / totalImported) * 100) : 0,
        byArea,
      });
    };

    const weakestArea = result
      ? Object.entries(result.byArea).sort(([, first], [, second]) =>
          first.correct / first.total - second.correct / second.total,
        )[0]
      : null;

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
                  <h3 className="font-semibold text-foreground">Idioma da prova</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Inglês, Caderno Branco.</p>
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
                  <div className="grid grid-cols-5 gap-2">
                    {importedQuestions.map((question) => {
                      const questionKey = String(question.number);
                      return (
                        <button
                          key={question.id}
                          className={`rounded-lg border px-2 py-2 text-sm ${visibleQuestion.number === question.number ? "border-primary bg-primary text-primary-foreground" : answers[questionKey] ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}
                          onClick={() => saveAnswer("__currentQuestion", String(question.number))}
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
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
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
                    {weakestArea && (
                      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3">
                        <h4 className="font-medium text-foreground">Recomendação</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Priorize {weakestArea[0]} na aba Matérias antes de refazer estas questões.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
          <button className="pb-3 px-1 text-sm md:text-base font-medium text-primary border-b-2 border-primary whitespace-nowrap">
            Provas oficiais
          </button>
          <button className="pb-3 px-1 text-sm md:text-base font-medium text-muted-foreground whitespace-nowrap" disabled>
            Minhas respostas
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 md:p-6 xl:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Banco ENEM</h2>
          <p className="mt-2 max-w-3xl text-sm md:text-base text-muted-foreground">
            Catálogo em formato nativo. A primeira prova importada é o bloco de inglês do ENEM 2025, Caderno Branco.
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {ENEM_OFFICIAL_EXAMS.map((exam) => (
            <EnemExamCard key={exam.id} exam={exam} onOpen={openExam} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EnemExamCard({ exam, onOpen }: { exam: EnemExam; onOpen: (exam: EnemExam) => void }) {
  const hasQuestions = exam.questions.length > 0;
  const hasCorrection = Object.keys(exam.answerKey).length > 0 || Object.keys(exam.englishAnswerKey ?? {}).length > 0;

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
}: {
  name: string;
  subtitle: string;
  progress: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 md:p-5 xl:p-6 hover:shadow-md transition-shadow">
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
