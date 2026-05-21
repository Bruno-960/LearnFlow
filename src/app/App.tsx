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
} from "lucide-react";
import {
  DEFAULT_PROFILE,
  loadProfile,
  PROFILE_ID,
  saveProfile,
} from "../services/profileData";
import {
  loadFlashcardDecks,
  saveFlashcardDeck,
  type FlashcardDeckData,
} from "../services/flashcardDeckData";

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
  const [userName, setUserName] = useState(DEFAULT_PROFILE.name);
  const [streakDays, setStreakDays] = useState(DEFAULT_PROFILE.streakDays);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [profileDraftName, setProfileDraftName] = useState(userName);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let isMounted = true;

    loadProfile().then((profile) => {
      if (!isMounted) return;
      setUserName(profile.name);
      setStreakDays(profile.streakDays);
      setProfileDraftName(profile.name);
    });

    return () => {
      isMounted = false;
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
      await saveProfile({ id: PROFILE_ID, name: nextName, streakDays });
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
          w-64 bg-sidebar border-r border-sidebar-border flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-foreground">LearnFlow</span>
          </div>
          <button
            className="md:hidden p-1 rounded-lg hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
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
        <div className="mx-3 mb-4 p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5" />
            <span className="text-2xl font-bold">{streakDays} dias</span>
          </div>
          <p className="text-sm text-orange-100">
            {streakDays > 0 ? "Mantenha o ritmo!" : "Comece sua sequência hoje."}
          </p>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            onClick={changeUserName}
            type="button"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
              {getInitials(userName)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate">{userName}</div>
              <div className="text-xs text-muted-foreground">Estudante</div>
            </div>
            <ChevronDown className="w-4 h-4 text-sidebar-foreground flex-shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 md:h-16 border-b border-border bg-card px-4 md:px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger - mobile only */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-semibold text-foreground truncate">{title}</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
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
        <div className="flex-1 overflow-y-auto bg-background pb-16 md:pb-0">
          {currentView === "home" && <HomeView streakDays={streakDays} />}
          {currentView === "calendar" && <CalendarView />}
          {currentView === "flashcards" && <FlashcardsView />}
          {currentView === "simulados" && <SimuladosView />}
          {currentView === "materias" && <MateriasView />}
          {currentView === "configuracoes" && (
            <ConfiguracoesView
              userName={userName}
              onUserNameSave={async (name) => {
                await saveProfile({ id: PROFILE_ID, name, streakDays });
                setUserName(name);
              }}
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
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
    modules: 12,
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
    modules: 14,
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
    modules: 10,
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
    modules: 11,
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
    modules: 13,
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
    modules: 10,
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
    modules: 9,
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
    modules: 8,
    done: 0,
  },
];

function MateriasView() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl space-y-4 md:space-y-6">
        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {SUBJECTS.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setSelected(selected === i ? null : i)}
              className={`flex flex-col items-start p-3 md:p-4 rounded-xl border transition-all text-left ${
                selected === i
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:shadow-md"
              }`}
            >
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-xl mb-2`}>
                {s.icon}
              </div>
              <span className="text-sm font-semibold text-foreground">{s.name}</span>
              <span className="text-xs text-muted-foreground mb-2">{s.done}/{s.modules} módulos</span>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selected !== null && (() => {
          const s = SUBJECTS[selected];
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
                  <span className="text-2xl font-bold text-foreground">{s.progress}%</span>
                  <p className="text-xs text-muted-foreground">{s.done}/{s.modules} módulos</p>
                </div>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${s.progress}%` }} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Tópicos principais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {s.topics.map((topic) => (
                    <div
                      key={topic}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className={`w-2 h-2 rounded-full ${s.iconColor.replace("text-", "bg-")}`} />
                      <span className="text-sm text-foreground">{topic}</span>
                      <button className="ml-auto text-xs text-primary hover:underline">Estudar</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Full list */}
        <div className="space-y-3">
          <h2 className="text-base md:text-lg font-semibold text-foreground">Todas as matérias</h2>
          {SUBJECTS.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setSelected(selected === i ? null : i)}
              className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow text-left"
            >
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground text-sm md:text-base">{s.name}</span>
                  <span className="text-xs text-muted-foreground">{s.progress}%</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{s.subtitle}</p>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaceholderView() {
  return (
    <div className="p-4 md:p-8">
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
  onUserNameSave,
  streakDays,
}: {
  userName: string;
  onUserNameSave: (name: string) => Promise<void>;
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
    <div className="p-4 md:p-8">
      <div className="max-w-3xl space-y-5 md:space-y-6">
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

          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
            Salvar nome
          </button>

          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </form>

        <div className="bg-card rounded-xl p-5 md:p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">Sequência atual</h2>
          <p className="text-sm text-muted-foreground">
            {streakDays} dias seguidos. A contagem começa em 0 e será incrementada quando conectarmos a rotina de login/estudo.
          </p>
        </div>
      </div>
    </div>
  );
}

function HomeView({ streakDays }: { streakDays: number }) {
  const totalModules = SUBJECTS.reduce((total, subject) => total + subject.modules, 0);
  const completedModules = SUBJECTS.reduce((total, subject) => total + subject.done, 0);
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const inProgressSubjects = SUBJECTS.filter((subject) => subject.progress > 0).slice(0, 4);

  return (
    <div className="p-4 md:p-8 space-y-5 md:space-y-6">
      <div className="max-w-6xl space-y-5 md:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-card rounded-xl p-5 md:p-6 border border-border">
            <h3 className="text-sm text-muted-foreground mb-2">Sequência de estudos</h3>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-foreground">{streakDays} dias</span>
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

          <div className="bg-card rounded-xl p-5 md:p-6 border border-border">
            <h3 className="text-sm text-muted-foreground mb-2">Progresso geral</h3>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-foreground">{overallProgress}%</span>
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
          <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4 text-foreground">Continue estudando</h2>
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
            <div className="bg-card border border-border rounded-xl p-5 md:p-6">
              <p className="text-sm text-muted-foreground">Nenhuma matéria em andamento.</p>
            </div>
          )}
        </div>

        {/* Próxima Estudada */}
        <div>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-xl font-semibold text-foreground">Próxima estudada</h2>
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

function CalendarView() {
  const daysOfWeek = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const currentMonth = "Maio 2024";

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl space-y-5 md:space-y-6">
        <div className="bg-card rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-xl font-semibold text-foreground">{currentMonth}</h2>
            <div className="flex items-center gap-2">
              <button className="text-sm text-primary hover:underline hidden sm:block">Semana</button>
              <button className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">Mês</button>
              <div className="flex gap-1 sm:ml-4">
                <button className="p-2 hover:bg-accent rounded-lg">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-accent rounded-lg">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day[0]}</span>
              </div>
            ))}
            {[...Array(2)].map((_, i) => <div key={`empty-${i}`} />)}
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const hasEvent = [3, 6, 9, 13, 17, 19, 24, 27].includes(day);
              const isToday = day === 9;

              return (
                <div
                  key={day}
                  className={`aspect-square p-1 md:p-2 rounded-lg border transition-colors relative flex flex-col items-start ${
                    isToday
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div className="text-xs md:text-sm font-medium">{day}</div>
                  {hasEvent && !isToday && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4 text-foreground">Hoje - 15 de Maio</h2>
          <div className="space-y-3">
            <EventCard time="10:00" title="Química - Massa Atômica" subtitle="Módulo 1 de 6" color="bg-purple-500" />
            <EventCard time="14:30" title="Física - Energia Mecânica" subtitle="Módulo 2 de 8" color="bg-blue-500" />
            <EventCard time="16:45" title="Matemática - Funções" subtitle="Módulo 3 de 7" color="bg-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlashcardsView() {
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
  }, []);

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
    <div className="p-4 md:p-8">
      <div className="max-w-5xl space-y-5 md:space-y-6">
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
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
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
            <button className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
              Iniciar revisão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SimuladosView() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl space-y-5 md:space-y-6">
        <div className="flex gap-4 border-b border-border overflow-x-auto">
          <button className="pb-3 px-1 text-sm font-medium text-primary border-b-2 border-primary whitespace-nowrap">
            Disponíveis
          </button>
          <button className="pb-3 px-1 text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap">
            Realizados
          </button>
          <button className="pb-3 px-1 text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap">
            Rankings
          </button>
        </div>

        <div className="space-y-3 md:space-y-4">
          <SimuladoCard title="ENEM 2023 - 1º Dia" questions={90} subjects={["Exatas", "ENEM"]} description="Prova com questões de Linguagens e Ciências Humanas do ENEM 2023" status="available" />
          <SimuladoCard title="ENEM 2023 - 2º Dia" questions={90} subjects={["Exatas", "ENEM"]} description="Prova com questões de Ciências da Natureza e Matemática do ENEM 2023" status="available" />
          <SimuladoCard title="ENEM 2022 - Completo" questions={180} subjects={["Exatas", "ENEM"]} description="Prova completa do ENEM 2022" status="completed" />
          <SimuladoCard title="Fuvest 2023" questions={90} subjects={["Fuvest"]} description="Simulado com questões da Fuvest 2023" status="available" />
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
    <div className="bg-card border border-border rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow">
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
    <div className="bg-card border border-border rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:shadow-md transition-shadow">
      <div className="text-sm font-medium text-muted-foreground w-12 md:w-16 flex-shrink-0">{time}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground mb-0.5 text-sm md:text-base truncate">{title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <button className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0">
        {tag}
      </button>
    </div>
  );
}

function EventCard({ time, title, subtitle, color }: { time: string; title: string; subtitle: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:shadow-md transition-shadow">
      <div className={`w-1 h-10 md:h-12 ${color} rounded-full flex-shrink-0`} />
      <div className="text-sm font-medium text-muted-foreground w-12 md:w-16 flex-shrink-0">{time}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground mb-0.5 text-sm truncate">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <button className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0">
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
    <div className="bg-card border border-border rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer">
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

function SimuladoCard({
  title,
  questions,
  subjects,
  description,
  status,
}: {
  title: string;
  questions: number;
  subjects: string[];
  description: string;
  status: "available" | "completed";
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Timer className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm md:text-lg text-foreground">{title}</h3>
            {status === "completed" && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs rounded-md flex-shrink-0">
                Concluído
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2 flex-wrap">
            <span>{questions} questões</span>
            <span>•</span>
            {subjects.map((subject, i) => (
              <span key={i}>{subject}</span>
            ))}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{description}</p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
            {status === "available" ? "Iniciar simulado" : "Ver resultado"}
          </button>
        </div>
      </div>
    </div>
  );
}
