"use client";

import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Activity,
  Apple,
  ArrowUpRight,
  BookmarkPlus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  FileUp,
  Flame,
  Gauge,
  Leaf,
  Medal,
  Menu,
  Minus,
  Pencil,
  Plus,
  Save,
  Scale,
  Sparkles,
  Star,
  Table2,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MealItem = {
  name: string;
  servingLabel: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
type Nutrition = {
  id: number;
  date: string;
  mealType: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  detailsJson?: string;
};
type SavedMeal = { id: number; name: string; itemsJson: string; favorite?: boolean };
type SavedIngredient = {
  id: number;
  name: string;
  servingLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
type Workout = {
  id: number;
  date: string;
  workout: string;
  exercise: string;
  setNumber: number;
  weight: number;
  reps: number;
};
type WeighIn = {
  id: number;
  date: string;
  weight?: number | null;
  bodyFat?: number | null;
};
type Goals = { calories: number; protein: number; carbs: number; fat: number };
type LogType =
  "nutrition" | "ingredient" | "goals" | "workoutImport" | "weight";
const red = "#e11d3f",
  dark = "#15171a",
  day = (n = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  },
  nice = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  round1 = (value: number) => Math.round(value * 10) / 10;
const hydrationSubscribe = () => () => {};
const hydrationClientSnapshot = () => true;
const hydrationServerSnapshot = () => false;
const defaultGoals: Goals = {
  calories: 2250,
  protein: 170,
  carbs: 250,
  fat: 75,
};
const mealItems = (json: string) =>
  (JSON.parse(json || "[]") as Partial<MealItem>[]).map((x) => ({
    ...x,
    servingLabel: x.servingLabel || "1 serving",
    quantity: Number(x.quantity) || 1,
  })) as MealItem[];
const demos = {
  nutrition: [
    {
      id: -1,
      date: day(),
      mealType: "Breakfast",
      name: "Greek yogurt bowl",
      calories: 410,
      protein: 31,
      carbs: 48,
      fat: 10,
    },
    {
      id: -2,
      date: day(),
      mealType: "Lunch",
      name: "Chicken rice bowl",
      calories: 680,
      protein: 52,
      carbs: 72,
      fat: 18,
    },
    {
      id: -3,
      date: day(1),
      mealType: "Dinner",
      name: "Salmon and potatoes",
      calories: 720,
      protein: 48,
      carbs: 62,
      fat: 27,
    },
  ] as Nutrition[],
  workouts: Array.from({ length: 8 }, (_, i) => [
    {
      id: -10 - i * 3,
      date: day((7 - i) * 7),
      workout: "Push",
      exercise: "Incline Bench Press",
      setNumber: 1,
      weight: 55 + i * 2.5,
      reps: 10,
    },
    {
      id: -11 - i * 3,
      date: day((7 - i) * 7 + 2),
      workout: "Pull",
      exercise: "Lat Pulldown",
      setNumber: 1,
      weight: 90 + i * 5,
      reps: 10,
    },
    {
      id: -12 - i * 3,
      date: day((7 - i) * 7 + 4),
      workout: "Legs And Abs",
      exercise: i % 2 ? "Leg Extension (Machine)" : "Bulgarian Split Squat",
      setNumber: 1,
      weight: 45 + i * 4,
      reps: 8,
    },
  ]).flat() as Workout[],
  weights: Array.from({ length: 8 }, (_, i) => ({
    id: -100 - i,
    date: day((7 - i) * 7),
    weight: 184.8 - i * 0.55 + (i % 2 ? 0.3 : 0),
    bodyFat: 19.5 - i * 0.25,
  })) as WeighIn[],
};
const nav = [
  { id: "today", label: "Today", icon: Gauge },
  { id: "nutrition", label: "Nutrition", icon: Apple },
  { id: "training", label: "Training", icon: Dumbbell },
  { id: "stats", label: "Stats", icon: Trophy },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
];

export default function Dashboard({
  displayName,
  signOutPath,
}: {
  displayName: string;
  signOutPath: string;
}) {
  const hydrated = useSyncExternalStore(
    hydrationSubscribe,
    hydrationClientSnapshot,
    hydrationServerSnapshot,
  );
  const [view, setView] = useState("today"),
    [mobile, setMobile] = useState(false),
    [log, setLog] = useState<LogType | null>(null),
    [loading, setLoading] = useState(true);
  const [mealPreset, setMealPreset] = useState<number | null>(null),
    [entryPreset, setEntryPreset] = useState<Nutrition | null>(null),
    [savedMealEdit, setSavedMealEdit] = useState<SavedMeal | null>(null),
    [checkEdit, setCheckEdit] = useState<WeighIn | null>(null),
    [checkDate, setCheckDate] = useState(day()),
    [ingredientEdit, setIngredientEdit] = useState<SavedIngredient | null>(
      null,
    );
  const [nutrition, setNutrition] = useState<Nutrition[]>([]),
    [workouts, setWorkouts] = useState<Workout[]>([]),
    [weights, setWeights] = useState<WeighIn[]>([]),
    [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]),
    [savedIngredients, setSavedIngredients] = useState<SavedIngredient[]>([]),
    [goals, setGoals] = useState<Goals>(defaultGoals);
  const load = useCallback(
    () =>
      fetch("/api/entries")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          setNutrition(d.nutrition || []);
          setWorkouts(d.workouts || []);
          setWeights(d.weights || []);
          setSavedMeals(d.savedMeals || []);
          setSavedIngredients(d.savedIngredients || []);
          setGoals(d.goals || defaultGoals);
        })
        .finally(() => setLoading(false)),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);
  if (!hydrated)
    return (
      <div className="site-loading" aria-label="Loading Leanbean">
        <div className="brand">
          <span><Leaf /></span>
          Leanbean
        </div>
        <i />
      </div>
    );
  const demo =
      !loading && !nutrition.length && !workouts.length && !weights.length,
    n = demo ? demos.nutrition : nutrition,
    w = demo ? demos.workouts : workouts,
    wt = demo ? demos.weights : weights,
    first = displayName.split(/\s|@/)[0];
  const defaultLog: LogType =
    view === "training"
      ? "workoutImport"
      : view === "stats"
        ? "weight"
        : "nutrition";
  const openMeal = (
    preset: number | null = null,
    entry: Nutrition | null = null,
  ) => {
    setMealPreset(preset);
    setEntryPreset(entry);
    setLog("nutrition");
  };
  async function remove(type: string, id: number, label: string) {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    const r = await fetch(`/api/entries?type=${type}&id=${id}`, {
      method: "DELETE",
    });
    if (r.ok) load();
  }
  async function toggleFavorite(meal: SavedMeal) {
    const r = await fetch("/api/entries", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "savedMeal", id: meal.id, name: meal.name, items: mealItems(meal.itemsJson), favorite: !meal.favorite }) });
    if (r.ok) load();
  }
  async function saveLoggedMeal(meal: Nutrition) {
    const items = mealItems(meal.detailsJson || "[]");
    if (!items.length) return;
    const r = await fetch("/api/entries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "savedMeal", name: meal.name, items }) });
    if (r.ok) load();
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <div className="brand">
          <span>
            <Leaf />
          </span>
          Leanbean
        </div>
        <small className="sidebar-label">Journal</small>
        <nav>
          {nav.map((x) => (
            <button
              key={x.id}
              className={view === x.id ? "active" : ""}
              onClick={() => {
                setView(x.id);
                setMobile(false);
              }}
            >
              <x.icon />
              {x.label}
            </button>
          ))}
        </nav>
        <div className="spacer" />
        <div className="side-note">
          <Sparkles />
          <div>
            <b>Small wins compound.</b>
            <small>Keep today simple and consistent.</small>
          </div>
        </div>
        <a className="profile" href={signOutPath} target="_top">
          <i>{first[0]?.toUpperCase()}</i>
          <span>
            <b>{first}</b>
            <small>Sign out</small>
          </span>
        </a>
      </aside>
      {mobile && <button className="scrim" onClick={() => setMobile(false)} />}
      <main>
        <header>
          <button className="menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <span className="date">
            <CalendarDays />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
          <button
            className="primary"
            onClick={() =>
              defaultLog === "nutrition" ? openMeal() : setLog(defaultLog)
            }
          >
            {defaultLog === "workoutImport" ? <FileUp /> : <Plus />}
            {defaultLog === "workoutImport"
              ? "Import workout"
              : "Log something"}
          </button>
        </header>
        <div className="content">
          {demo && (
            <div className="demo">
              <Sparkles />
              Previewing example data. Your first log starts a private journal.
              <button onClick={() => openMeal()}>Add first entry →</button>
            </div>
          )}
          {view === "today" && (
            <Today
              first={first}
              n={n}
              w={w}
              wt={wt}
              goals={goals}
              log={(t) => (t === "nutrition" ? openMeal() : setLog(t))}
              editMeal={(x) => openMeal(null, x)}
              deleteMeal={(x) => remove("nutrition", x.id, x.name)}
              checkIn={(date)=>{setCheckEdit(null);setCheckDate(date);setLog("weight")}}
            />
          )}{" "}
          {view === "nutrition" && (
            <NutritionView
              data={n}
              saved={savedMeals}
              ingredients={savedIngredients}
              goals={goals}
              editGoals={() => setLog("goals")}
              log={openMeal}
              addIngredient={() => {
                setIngredientEdit(null);
                setLog("ingredient");
              }}
              editSavedMeal={setSavedMealEdit}
              deleteSavedMeal={(x) => remove("savedMeal", x.id, x.name)}
              editIngredient={(x) => {
                setIngredientEdit(x);
                setLog("ingredient");
              }}
              deleteIngredient={(x) => remove("ingredient", x.id, x.name)}
              editMeal={(x) => openMeal(null, x)}
              deleteMeal={(x) => remove("nutrition", x.id, x.name)}
              toggleFavorite={toggleFavorite}
              saveRecent={saveLoggedMeal}
            />
          )}{" "}
          {view === "training" && (
            <Training
              data={w}
              log={() => setLog("workoutImport")}
              changed={load}
            />
          )}{" "}
          {view === "stats" && (
            <Stats workouts={w} weights={wt} log={() => {setCheckEdit(null);setCheckDate(day());setLog("weight")}} editCheck={x=>{setCheckEdit(x);setCheckDate(x.date);setLog("weight")}} deleteCheck={x=>remove("weight",x.id,`check-in from ${nice(x.date)}`)} />
          )}{" "}
          {view === "calendar" && (
            <CalendarView
              nutrition={n}
              workouts={w}
              weights={wt}
              goals={goals}
            />
          )}
        </div>
      </main>
      {log === "nutrition" && (
        <NutritionLog
          savedMeals={savedMeals}
          savedIngredients={savedIngredients}
          initialMealId={mealPreset}
          initialEntry={entryPreset}
          close={() => setLog(null)}
          done={() => {
            setLog(null);
            load();
          }}
        />
      )}
      {log === "ingredient" && (
        <IngredientLog
          initial={ingredientEdit}
          close={() => {
            setLog(null);
            setIngredientEdit(null);
          }}
          done={() => {
            setLog(null);
            setIngredientEdit(null);
            load();
          }}
        />
      )}
      {log === "goals" && (
        <GoalsLog
          goals={goals}
          close={() => setLog(null)}
          done={() => {
            setLog(null);
            load();
          }}
        />
      )}
      {log === "workoutImport" && (
        <WorkoutImport
          close={() => setLog(null)}
          done={() => {
            setLog(null);
            load();
          }}
        />
      )}
      {log === "weight" && (
        <WeightLog
          initial={checkEdit}
          datePreset={checkDate}
          close={() => {setLog(null);setCheckEdit(null)}}
          done={() => {
            setLog(null);
            setCheckEdit(null);
            load();
          }}
        />
      )}
      {savedMealEdit && (
        <SavedMealEditor
          meal={savedMealEdit}
          close={() => setSavedMealEdit(null)}
          done={() => {
            setSavedMealEdit(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function Title({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="title">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      {action}
    </div>
  );
}
function PanelHead({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-head">
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      {action}
    </div>
  );
}
function Button({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="primary big" onClick={onClick}>
      {children}
    </button>
  );
}
function Meals({
  data,
  onEdit,
  onDelete,
  onSave,
  isSaved,
}: {
  data: Nutrition[];
  onEdit?: (meal: Nutrition) => void;
  onDelete?: (meal: Nutrition) => void;
  onSave?: (meal: Nutrition) => void;
  isSaved?: (meal: Nutrition) => boolean;
}) {
  return (
    <div className="meal-list">
      {data.length ? (
        data
          .slice()
          .reverse()
          .map((x) => (
            <div className="meal" key={x.id}>
              <i>
                <Apple />
              </i>
              <span>
                <b>{x.name}</b>
                <small>
                  {x.mealType} · P {round1(x.protein)}g · C {round1(x.carbs)}g · F {round1(x.fat)}g
                </small>
              </span>
              <strong>
                {round1(x.calories)}
                <small> kcal</small>
              </strong>
              {x.id > 0 && (onEdit || onDelete || (onSave && !isSaved?.(x))) && (
                <div className="row-actions">
                  {onSave && !isSaved?.(x) && (
                    <button aria-label={`Save ${x.name} as a reusable meal`} onClick={() => onSave(x)}>
                      <BookmarkPlus />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      aria-label={`Edit ${x.name}`}
                      onClick={() => onEdit(x)}
                    >
                      <Pencil />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      aria-label={`Delete ${x.name}`}
                      onClick={() => onDelete(x)}
                    >
                      <Trash2 />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
      ) : (
        <div className="empty">
          <Leaf />
          Nothing logged yet.
        </div>
      )}
    </div>
  );
}
type TrendState = "up" | "down" | "same" | "new";
function exerciseTrend(data: Workout[], exercise: string, date: string) {
  const currentRows = data.filter(
      (x) => x.exercise === exercise && x.date === date,
    ),
    current = Math.round(
      Math.max(...currentRows.map((x) => x.weight * (1 + x.reps / 30)), 0),
    ),
    priorDates = [
      ...new Set(
        data
          .filter((x) => x.exercise === exercise && x.date < date)
          .map((x) => x.date),
      ),
    ].sort(),
    previousDate = priorDates.at(-1),
    previous = previousDate
      ? Math.round(
          Math.max(
            ...data
              .filter((x) => x.exercise === exercise && x.date === previousDate)
              .map((x) => x.weight * (1 + x.reps / 30)),
          ),
        )
      : null,
    state: TrendState =
      previous === null
        ? "new"
        : current > previous
          ? "up"
          : current < previous
            ? "down"
            : "same";
  return {
    state,
    current,
    previous,
    delta: previous === null ? null : current - previous,
  };
}
function exercisePerformance(data: Workout[], exercise: string, date: string, bodyweight: boolean) {
  const score=(rows:Workout[])=>Math.round(Math.max(...rows.map(x=>bodyweight?x.reps:x.weight*(1+x.reps/30)),0)),current=score(data.filter(x=>x.exercise===exercise&&x.date===date)),priorDates=[...new Set(data.filter(x=>x.exercise===exercise&&x.date<date).map(x=>x.date))].sort(),previousDate=priorDates.at(-1),previous=previousDate?score(data.filter(x=>x.exercise===exercise&&x.date===previousDate)):null,state:TrendState=previous===null?"new":current>previous?"up":current<previous?"down":"same";return {state,current,previous,delta:previous===null?null:current-previous,unit:bodyweight?"reps":"lb"};
}
function TrendMark({ state }: { state: TrendState }) {
  return state === "up" ? (
    <TrendingUp />
  ) : state === "down" ? (
    <TrendingDown />
  ) : (
    <Minus />
  );
}
type GoalTone = "below" | "acceptable" | "perfect" | "over" | "met" | "unset";
function goalFeedback(label: string, value: number, goal: number): { tone: GoalTone; text: string; percent: number } {
  if (goal <= 0) return { tone: "unset", text: "No goal set", percent: 0 };
  const ratio = value / goal, percent = Math.round(ratio * 100);
  if (label !== "Calories") return ratio >= 1 ? { tone: "met", text: "Goal met", percent } : { tone: "below", text: `${Math.max(Math.round(goal-value),0)}g remaining`, percent };
  if (ratio < .9) return { tone: "below", text: "Below range", percent };
  if (ratio >= .98 && ratio <= 1.02) return { tone: "perfect", text: "Right on target", percent };
  if (ratio > 1.1) return { tone: "over", text: "Way over", percent };
  return { tone: "acceptable", text: "Acceptable range", percent };
}
function GoalCard({ label, value, goal, unit = "g" }: { label: string; value: number; goal: number; unit?: string }) {
  const feedback = goalFeedback(label, value, goal);
  return <div className={`goal-card goal-${feedback.tone}`}><small>{label}</small><b>{round1(value).toLocaleString()}{unit}</b><em>{feedback.text}</em><span>{goal > 0 ? `${feedback.percent}% of ${goal.toLocaleString()}${unit}` : "Optional"}</span></div>;
}
function SummaryStat({
  label,
  value,
  goal,
}: {
  label: string;
  value: number;
  goal: number;
}) {
  const set = goal > 0, feedback = goalFeedback(label, value, goal);
  return (
    <div className={`summary-stat goal-${feedback.tone}`}>
      <span>{label}</span>
      <b>
        {round1(value).toLocaleString()}
        {label === "Calories" ? "" : "g"}
      </b>
      <small>
        {feedback.text}{set ? ` · ${feedback.percent}%` : ""}
      </small>
      <i>
        <em
          style={{ width: set ? `${Math.min(value / goal, 1) * 100}%` : "0%" }}
        />
      </i>
    </div>
  );
}
function Today({
  first,
  n,
  w,
  wt,
  goals,
  log,
  editMeal,
  deleteMeal,
  checkIn,
}: {
  first: string;
  n: Nutrition[];
  w: Workout[];
  wt: WeighIn[];
  goals: Goals;
  log: (t: LogType) => void;
  editMeal: (x: Nutrition) => void;
  deleteMeal: (x: Nutrition) => void;
  checkIn: (date: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(day()),
    [trainingDetail, setTrainingDetail] = useState<{ date: string; workout: string; rows: Workout[] } | null>(null),
    meals = n.filter((x) => x.date === selectedDate),
    m = meals.reduce(
      (a, x) => ({
        cal: a.cal + x.calories,
        p: a.p + x.protein,
        c: a.c + x.carbs,
        f: a.f + x.fat,
      }),
      { cal: 0, p: 0, c: 0, f: 0 },
    ),
    rangeStart = (() => { const d = new Date(`${selectedDate}T12:00:00`); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10); })(),
    sessions = new Set(w.filter((x) => x.date >= rangeStart && x.date <= selectedDate).map((x) => x.date)).size,
    last = wt.filter((x) => x.date <= selectedDate).at(-1),
    lastDate = w.filter((x) => x.date <= selectedDate).at(-1)?.date,
    lastRows = lastDate ? w.filter((x) => x.date === lastDate) : [],
    lastType = lastRows.at(-1)?.workout,
    session = lastRows.filter((x) => x.workout === lastType),
    volume = session.reduce((sum, x) => sum + x.weight * x.reps, 0),
    exercises = [...new Set(session.map((x) => x.exercise))];
  function moveDate(delta: number) {
    const next = new Date(`${selectedDate}T12:00:00`);
    next.setDate(next.getDate() + delta);
    setSelectedDate(next.toISOString().slice(0, 10));
  }
  return (
    <>
      <Title
        eyebrow="Daily overview"
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, ${first}.`}
        detail={`${nice(selectedDate)} · daily essentials, compact and easy to scan.`}
        action={<div className="day-navigator"><button aria-label="Previous day" onClick={() => moveDate(-1)}><ChevronLeft /></button><input aria-label="Daily view date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /><button aria-label="Next day" onClick={() => moveDate(1)}><ChevronRight /></button><button className="secondary" onClick={() => setSelectedDate(day())}>Today</button></div>}
      />
      <section className="today-summary">
        <div className="macro-strip">
          <div className="strip-title">
            <span>
              <Flame />
              {selectedDate === day() ? "Today’s" : nice(selectedDate)} nutrition
            </span>
            <button className="text-btn" onClick={() => log("nutrition")}>
              Add meal +
            </button>
          </div>
          <div className="summary-stats">
            <SummaryStat label="Calories" value={m.cal} goal={goals.calories} />
            <SummaryStat label="Protein" value={m.p} goal={goals.protein} />
            <SummaryStat label="Carbs" value={m.c} goal={goals.carbs} />
            <SummaryStat label="Fat" value={m.f} goal={goals.fat} />
          </div>
        </div>
        <div className="daily-status">
          <div>
            <Dumbbell />
            <span>
              <small>Trailing 7 days</small>
              <b>{sessions} training sessions</b>
            </span>
          </div>
          <div>
            <Scale />
            <span>
              <small>Latest check-in</small>
              <b>
                {last?.weight
                  ? `${last.weight.toFixed(1)} lb`
                  : last?.bodyFat
                    ? `${last.bodyFat.toFixed(1)}% BF`
                    : "Not logged"}
              </b>
            </span>
            <button className="text-btn" onClick={() => checkIn(selectedDate)}>Add check-in +</button>
          </div>
        </div>
      </section>
      <section className="columns">
        <div className="panel">
          <PanelHead
            title={selectedDate === day() ? "Today’s meals" : `Meals · ${nice(selectedDate)}`}
            detail={`${meals.length} meals · ${round1(m.cal)} kcal`}
          />
          <Meals data={meals} onEdit={editMeal} onDelete={deleteMeal} />
        </div>
        <div className={`panel recent-training ${session.length ? "clickable" : ""}`} role={session.length ? "button" : undefined} tabIndex={session.length ? 0 : undefined} onClick={() => session.length && setTrainingDetail({date: lastDate!, workout: lastType!, rows: session})} onKeyDown={(event) => { if (session.length && (event.key === "Enter" || event.key === " ")) setTrainingDetail({date: lastDate!, workout: lastType!, rows: session}); }}>
          <PanelHead
            title="Latest training session"
            detail={
              lastDate
                ? `${nice(lastDate)} · ${lastType} · colors compare estimated 1RM`
                : "Import a workout to begin"
            }
          />
          {session.length ? (
            <>
              <div className="session-summary">
                <div>
                  <small>Volume</small>
                  <b>{Math.round(volume).toLocaleString()} lb</b>
                </div>
                <div>
                  <small>Working sets</small>
                  <b>{session.length}</b>
                </div>
                <div>
                  <small>Exercises</small>
                  <b>{exercises.length}</b>
                </div>
              </div>
              <div className="exercise-chips trend-chips">
                {exercises.slice(0, 6).map((x) => {
                  const trend = exerciseTrend(w, x, lastDate!);
                  return (
                    <span
                      className={`trend-${trend.state}`}
                      title={`Best estimated 1RM: ${trend.current} lb${trend.previous === null ? " · first session" : ` · previous ${trend.previous} lb`}`}
                      key={x}
                    >
                      <TrendMark state={trend.state} />
                      <b>{x}</b>
                      <small>
                        {trend.delta === null
                          ? "New"
                          : trend.delta === 0
                            ? "No change"
                            : `${trend.delta > 0 ? "+" : ""}${trend.delta} lb`}
                      </small>
                    </span>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="empty compact">
              <Dumbbell />
              No workouts imported yet.
            </div>
          )}
        </div>
      </section>
      <section className="insight">
        <Sparkles />
        <div>
          <span>Leanbean insight</span>
          <h3>
            {session.length
              ? `${lastType} is your latest completed session.`
              : "Your next complete session starts the trend."}
          </h3>
          <p>
            {session.length
              ? "Green improved, red declined, and gray held steady versus the previous session’s best estimated 1RM."
              : "Import whole workouts and Leanbean will turn them into useful progress signals."}
          </p>
        </div>
        <ArrowUpRight />
      </section>
      {trainingDetail && <WorkoutComparisonModal session={trainingDetail} allWorkouts={w} close={() => setTrainingDetail(null)} />}
    </>
  );
}

function weekCalories(data: Nutrition[]) {
  const now = new Date(),
    start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10),
      rows = data.filter((x) => x.date === iso);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      calories: rows.reduce((s, x) => s + x.calories, 0),
      protein: rows.reduce((s, x) => s + x.protein, 0),
      carbs: rows.reduce((s, x) => s + x.carbs, 0),
      fat: rows.reduce((s, x) => s + x.fat, 0),
    };
  });
}
function NutritionView({
  data,
  saved,
  ingredients,
  goals,
  log,
  addIngredient,
  editGoals,
  editSavedMeal,
  deleteSavedMeal,
  editIngredient,
  deleteIngredient,
  editMeal,
  deleteMeal,
  toggleFavorite,
  saveRecent,
}: {
  data: Nutrition[];
  saved: SavedMeal[];
  ingredients: SavedIngredient[];
  goals: Goals;
  log: (id?: number | null) => void;
  addIngredient: () => void;
  editGoals: () => void;
  editSavedMeal: (x: SavedMeal) => void;
  deleteSavedMeal: (x: SavedMeal) => void;
  editIngredient: (x: SavedIngredient) => void;
  deleteIngredient: (x: SavedIngredient) => void;
  editMeal: (x: Nutrition) => void;
  deleteMeal: (x: Nutrition) => void;
  toggleFavorite: (x: SavedMeal) => void;
  saveRecent: (x: Nutrition) => void;
}) {
  const [library, setLibrary] = useState<"meals" | "ingredients" | null>(null),
    [breakdown, setBreakdown] = useState<"calories" | "macros" | "stacked">(
      "calories",
    ),
    week = weekCalories(data),
    weekStart = day(new Date().getDay()),
    weekEntries = data.filter((x) => x.date >= weekStart),
    totals = weekEntries.reduce(
      (a, x) => ({ p: a.p + x.protein, c: a.c + x.carbs, f: a.f + x.fat }),
      { p: 0, c: 0, f: 0 },
    ),
    favorites = saved.filter((meal) => meal.favorite),
    savedNames = new Set(saved.map((meal) => meal.name.trim().toLowerCase())),
    macroText = [
      goals.protein ? `P ${goals.protein}g` : "",
      goals.carbs ? `C ${goals.carbs}g` : "",
      goals.fat ? `F ${goals.fat}g` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  return (
    <>
      <Title
        eyebrow="Nutrition"
        title="Fuel with intention."
        detail="Build reusable ingredients and meals, adjust quantities for today, and measure against your own goals."
        action={
          <div className="title-actions">
            <button className="secondary" onClick={editGoals}>
              <Target />
              Set goals
            </button>
            <Button onClick={() => log()}>
              <Plus />
              Add meal
            </Button>
          </div>
        }
      />
      <div className="goal-row">
        <span>
          <Flame />
          Daily goals
        </span>
        <b>{goals.calories} kcal</b>
        <small>{macroText || "Macro goals optional"}</small>
      </div>
      <div className="panel">
        <PanelHead
          title="This week’s nutrition"
          detail="Sunday through Saturday"
          action={
            <div className="view-toggle">
              <button
                className={breakdown === "calories" ? "active" : ""}
                onClick={() => setBreakdown("calories")}
              >
                Calories
              </button>
              <button
                className={breakdown === "macros" ? "active" : ""}
                onClick={() => setBreakdown("macros")}
              >
                Goals
              </button>
              <button
                className={breakdown === "stacked" ? "active" : ""}
                onClick={() => setBreakdown("stacked")}
              >
                Stacked macros
              </button>
            </div>
          }
        />
        {breakdown === "calories" ? (
          <div className="chart">
            <ResponsiveContainer>
              <BarChart data={week} margin={{ top: 8, right: 4, left: -24 }}>
                <CartesianGrid vertical={false} stroke="#d5d7da" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="calories" fill={red} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : breakdown === "stacked" ? (
          <div className="chart">
            <ResponsiveContainer>
              <BarChart data={week} margin={{ top: 8, right: 4, left: -24 }}>
                <CartesianGrid vertical={false} stroke="#d5d7da" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar
                  dataKey="protein"
                  name="Protein (g)"
                  stackId="macros"
                  fill="#16a34a"
                />
                <Bar
                  dataKey="carbs"
                  name="Carbs (g)"
                  stackId="macros"
                  fill="#737780"
                />
                <Bar
                  dataKey="fat"
                  name="Fat (g)"
                  stackId="macros"
                  fill={red}
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="macro-breakdown">
            <Macro
              label="Protein"
              value={totals.p}
              target={goals.protein * 7}
            />
            <Macro label="Carbs" value={totals.c} target={goals.carbs * 7} />
            <Macro label="Fat" value={totals.f} target={goals.fat * 7} />
          </div>
        )}
      </div>
      <section className="columns nutrition-top">
        <div className="panel">
          <PanelHead
            title="Saved meals"
            detail={`${saved.length} reusable meal${saved.length === 1 ? "" : "s"}`}
            action={
              <button className="text-btn" onClick={() => log()}>
                New meal +
              </button>
            }
          />
          <div className="library-overview favorite-meals"><div>{favorites.map(x=><button key={x.id} onClick={()=>log(x.id)}><Star/><span>{x.name}</span></button>)}{!favorites.length&&<small>Favorite meals will stay visible here.</small>}</div><button className="secondary" onClick={()=>setLibrary("meals")} disabled={!saved.length}>View all <strong>{saved.length}</strong></button></div>
        </div>
        <div className="panel">
          <PanelHead
            title="Saved ingredients"
            detail={`${ingredients.length} reusable ingredient${ingredients.length === 1 ? "" : "s"}`}
            action={
              <button className="text-btn" onClick={addIngredient}>
                New ingredient +
              </button>
            }
          />
          <div className="library-overview"><div>{ingredients.slice(0,3).map(x=><span key={x.id}>{x.name}</span>)}{!ingredients.length&&<small>No saved ingredients yet.</small>}</div><button className="secondary" onClick={()=>setLibrary("ingredients")} disabled={!ingredients.length}>View all <strong>{ingredients.length}</strong></button></div>
        </div>
      </section>
      <div className="panel">
        <PanelHead
          title="Recent meals"
          detail="Edit or remove any logged meal"
        />
        <Meals data={data.slice(-10)} onEdit={editMeal} onDelete={deleteMeal} onSave={saveRecent} isSaved={(meal) => savedNames.has(meal.name.trim().toLowerCase())} />
      </div>
      {library === "meals" && <Modal close={()=>setLibrary(null)} icon={<Apple/>} title="Saved meals" detail="Favorite, log, edit, or delete a reusable meal without creating an entry."><div className="saved-meals library-modal-list">{saved.map(x=>{const items=mealItems(x.itemsJson);return <div className="saved-row" key={x.id}><button className="saved-main" onClick={()=>{setLibrary(null);log(x.id)}}><span><b>{x.name}</b><small>{items.length} items</small></span><strong>{round1(items.reduce((s,i)=>s+i.calories*i.quantity,0))} kcal</strong></button><div className="row-actions"><button className={x.favorite?"favorite":""} aria-label={`${x.favorite?"Remove":"Add"} ${x.name} ${x.favorite?"from":"to"} favorites`} onClick={()=>toggleFavorite(x)}><Star/></button><button aria-label={`Edit ${x.name}`} onClick={()=>{setLibrary(null);editSavedMeal(x)}}><Pencil/></button><button aria-label={`Delete ${x.name}`} onClick={()=>deleteSavedMeal(x)}><Trash2/></button></div></div>})}</div></Modal>}
      {library === "ingredients" && <Modal close={()=>setLibrary(null)} icon={<Apple/>} title="Saved ingredients" detail="Review, edit, or delete nutrition stored per serving."><div className="ingredient-library library-modal-list">{ingredients.map(x=><div key={x.id}><span><b>{x.name}</b><small>{x.servingLabel}</small></span><strong>{Math.round(x.calories)} kcal</strong><small>P {x.protein} · C {x.carbs} · F {x.fat}</small><div className="row-actions"><button aria-label={`Edit ${x.name}`} onClick={()=>{setLibrary(null);editIngredient(x)}}><Pencil/></button><button aria-label={`Delete ${x.name}`} onClick={()=>deleteIngredient(x)}><Trash2/></button></div></div>)}</div></Modal>}
    </>
  );
}
function Macro({
  label,
  value,
  target,
}: {
  label: string;
  value: number;
  target: number;
}) {
  const set = target > 0;
  return (
    <div>
      <span>{label}</span>
      <b>{Math.round(value)}g</b>
      <small>
        {set
          ? `${Math.round((value / (target / 7)) * 100)}% of weekly goal`
          : "No goal set"}
      </small>
      <i>
        <em
          style={{
            width: set ? `${Math.min(value / target, 1) * 100}%` : "0%",
          }}
        />
      </i>
    </div>
  );
}

function Training({
  data,
  log,
  changed,
}: {
  data: Workout[];
  log: () => void;
  changed: () => void;
}) {
  const [sessionEdit, setSessionEdit] = useState<{
      date: string;
      workout: string;
      rows: Workout[];
    } | null>(null),
    [sessionDetail, setSessionDetail] = useState<{ date: string; workout: string; rows: Workout[] } | null>(null),
    [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set()),
    [lastSelected, setLastSelected] = useState<number | null>(null),
    [range, setRange] = useState<"week" | "month" | "custom">("month"),
    [anchor, setAnchor] = useState(() => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth() - 1, 1);
    }),
    [customStart, setCustomStart] = useState(day(30)),
    [customEnd, setCustomEnd] = useState(day());
  function bounds() {
    if (range === "custom") return { start: customStart, end: customEnd };
    if (range === "month") {
      const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1),
        end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
      return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      };
    }
    const start = new Date(anchor);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }
  function preset(next: "week" | "month") {
    const now = new Date();
    setRange(next);
    setAnchor(
      next === "week"
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        : new Date(now.getFullYear(), now.getMonth() - 1, 1),
    );
  }
  function move(delta: number) {
    const next = new Date(anchor);
    if (range === "week") next.setDate(next.getDate() + delta * 7);
    else next.setMonth(next.getMonth() + delta);
    setAnchor(next);
  }
  const { start, end } = bounds(),
    filtered = data.filter((x) => x.date >= start && x.date <= end),
    types = [...new Set(filtered.map((x) => x.workout))],
    [type, setType] = useState(""),
    activeType = types.includes(type) ? type : types[0] || "",
    exercises = [
      ...new Set(
        filtered.filter((x) => x.workout === activeType).map((x) => x.exercise),
      ),
    ],
    [exercise, setExercise] = useState(""),
    activeExercise = exercises.includes(exercise)
      ? exercise
      : exercises[0] || "",
    trendRows = filtered.filter((x) => x.workout === activeType && x.exercise === activeExercise),
    trend = [...new Set(trendRows.map((x) => x.date))].sort().map((date) => ({
      date,
      oneRM: round1(Math.max(...trendRows.filter((x) => x.date === date).map((x) => x.weight * (1 + x.reps / 30)))),
    })),
    sessionKeys = [...new Set(filtered.map((x) => `${x.date}|${x.workout}`))]
      .sort()
      .reverse();
  function selectSession(key: string, index: number, event: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }) {
    if (event.shiftKey && lastSelected !== null) {
      const from = Math.min(lastSelected,index), to = Math.max(lastSelected,index);
      setSelectedSessions(current=>new Set([...current,...sessionKeys.slice(from,to+1)]));
    } else {
      setSelectedSessions(current=>{const next=new Set(current);if(next.has(key))next.delete(key);else next.add(key);return next});
      setLastSelected(index);
    }
  }
  async function deleteSelected() {
    if (!selectedSessions.size || !window.confirm(`Delete ${selectedSessions.size} selected workout session${selectedSessions.size === 1 ? "" : "s"}?`)) return;
    await Promise.all([...selectedSessions].map(key=>{const [date,workout]=key.split("|");return fetch(`/api/entries?type=workoutSession&date=${encodeURIComponent(date)}&workout=${encodeURIComponent(workout)}`,{method:"DELETE"})}));
    setSelectedSessions(new Set());setLastSelected(null);changed();
  }
  return (
    <>
      <Title
        eyebrow="Training"
        title="Progress in the window that matters."
        detail="Move week by week or month by month, or choose an exact date range."
        action={
          <Button onClick={log}>
            <FileUp />
            Import workout files
          </Button>
        }
      />
      <div className="range-bar">
        <div className="quick-ranges">
          <button
            className={range === "week" ? "active" : ""}
            onClick={() => preset("week")}
          >
            Last week
          </button>
          <button
            className={range === "month" ? "active" : ""}
            onClick={() => preset("month")}
          >
            Last month
          </button>
          <button
            className={range === "custom" ? "active" : ""}
            onClick={() => setRange("custom")}
          >
            Custom
          </button>
        </div>
        {range === "custom" ? (
          <div className="custom-dates">
            <input
              aria-label="Range start"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <span>to</span>
            <input
              aria-label="Range end"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        ) : (
          <div className="period-scroll">
            <button aria-label="Previous period" onClick={() => move(-1)}>
              <ChevronLeft />
            </button>
            <b>
              {nice(start)} – {nice(end)}
            </b>
            <button aria-label="Next period" onClick={() => move(1)}>
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
      <section className="training-kpis">
        <Kpi
          icon={<Activity />}
          label="Total volume"
          value={`${Math.round(filtered.reduce((s, x) => s + x.weight * x.reps, 0)).toLocaleString()} lb`}
        />
        <Kpi
          icon={<Dumbbell />}
          label="Sessions"
          value={`${sessionKeys.length}`}
        />
        <Kpi
          icon={<Medal />}
          label="Exercises"
          value={`${new Set(filtered.map((x) => x.exercise)).size}`}
        />
        <Kpi icon={<Flame />} label="Workout types" value={`${types.length}`} />
      </section>
      <div className="panel">
        <PanelHead
          title="Exercise deep dive"
          detail={`${nice(start)} through ${nice(end)}`}
          action={
            <div className="deep-filters">
              <label>
                Workout
                <select
                  value={activeType}
                  onChange={(e) => {
                    setType(e.target.value);
                    setExercise("");
                  }}
                >
                  {types.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Exercise
                <select
                  value={activeExercise}
                  onChange={(e) => setExercise(e.target.value)}
                >
                  {exercises.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
          }
        />
        {trend.length ? (
          <div className="chart tall">
            <ResponsiveContainer>
              <LineChart
                data={trend}
                margin={{ top: 15, right: 10, left: -15 }}
              >
                <CartesianGrid vertical={false} stroke="#d5d7da" />
                <XAxis
                  dataKey="date"
                  tickFormatter={nice}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  dataKey="oneRM"
                  name="Est. 1RM"
                  stroke={red}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty">
            <Dumbbell />
            No workouts in this range.
          </div>
        )}
      </div>
      <div className="panel">
        <PanelHead
          title="Workouts in this range"
          detail="Click to inspect · ⌘/Ctrl-click to select · Shift-click for a range"
          action={<div className="selection-actions"><button onClick={()=>setSelectedSessions(new Set(sessionKeys))}>Select all</button><button onClick={()=>{setSelectedSessions(new Set());setLastSelected(null)}} disabled={!selectedSessions.size}>Clear</button><button className="delete-selected" onClick={deleteSelected} disabled={!selectedSessions.size}><Trash2/>Delete {selectedSessions.size||""}</button></div>}
        />
        <div className="sessions scroll-sessions">
          {sessionKeys.map((key) => {
            const [date, workout] = key.split("|"),
              rows = filtered.filter(
                (x) => x.date === date && x.workout === workout,
              );
            return (
              <div key={key} className={`session-card ${selectedSessions.has(key)?"selected":""}`} onClick={(event)=>{if(event.metaKey||event.ctrlKey||event.shiftKey)selectSession(key,sessionKeys.indexOf(key),event);else setSessionDetail({date,workout,rows})}}>
                <button className="session-check" aria-label={`Select ${workout} on ${date}`} onClick={(event)=>{event.stopPropagation();selectSession(key,sessionKeys.indexOf(key),event)}}>{selectedSessions.has(key)?<span>✓</span>:null}</button>
                <span>{workout}</span>
                <small>{nice(date)}</small>
                <h3>{new Set(rows.map((x) => x.exercise)).size} exercises</h3>
                <b>{rows.length} working sets</b>
                <p>
                  <ArrowUpRight />
                  {Math.round(
                    rows.reduce((s, x) => s + x.weight * x.reps, 0),
                  ).toLocaleString()}{" "}
                  lb volume
                </p>
                <button
                  className="manage-session"
                  onClick={(event) => {event.stopPropagation();setSessionEdit({ date, workout, rows })}}
                >
                  <Table2 /> Edit session
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {sessionEdit && (
        <WorkoutSessionEditor
          session={sessionEdit}
          close={() => setSessionEdit(null)}
          done={() => {
            setSessionEdit(null);
            changed();
          }}
        />
      )}
      {sessionDetail && <WorkoutSessionDetail session={sessionDetail} close={()=>setSessionDetail(null)} edit={()=>{setSessionEdit(sessionDetail);setSessionDetail(null)}}/>}
    </>
  );
}
function Kpi({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <i>{icon}</i>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}

function Stats({
  workouts,
  weights,
  log,
  editCheck,
  deleteCheck,
}: {
  workouts: Workout[];
  weights: WeighIn[];
  log: () => void;
  editCheck: (check: WeighIn) => void;
  deleteCheck: (check: WeighIn) => void;
}) {
  const workoutTypes = [...new Set(workouts.map((x) => x.workout))],
    [recordType, setRecordType] = useState("All"),
    recordRows =
      recordType === "All"
        ? workouts
        : workouts.filter((x) => x.workout === recordType),
    records = [...new Set(recordRows.map((x) => x.exercise))]
      .map((ex) => {
        const rows = recordRows.filter((x) => x.exercise === ex),
          best = rows.reduce((a, b) =>
            a.weight * (1 + a.reps / 30) > b.weight * (1 + b.reps / 30) ? a : b,
          );
        return {
          ...best,
          oneRM: Math.round(best.weight * (1 + best.reps / 30)),
        };
      })
      .sort((a, b) => b.oneRM - a.oneRM),
    days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => ({
      day: d,
      sessions: new Set(
        workouts
          .filter((x) => new Date(`${x.date}T12:00:00`).getDay() === i)
          .map((x) => x.date),
      ).size,
    })),
    latestWeight = weights.filter((x) => x.weight).at(-1),
    latestFat = weights.filter((x) => x.bodyFat).at(-1);
  return (
    <>
      <Title
        eyebrow="Stats"
        title="Strength and composition."
        detail="Personal bests, body weight, body fat, and training consistency in one timeline."
        action={
          <Button onClick={log}>
            <Scale />
            Log check-in
          </Button>
        }
      />
      <section className="body-metrics">
        <div>
          <small>Latest weight</small>
          <b>
            {latestWeight?.weight
              ? `${latestWeight.weight.toFixed(1)} lb`
              : "—"}
          </b>
        </div>
        <div>
          <small>Latest body fat</small>
          <b>{latestFat?.bodyFat ? `${latestFat.bodyFat.toFixed(1)}%` : "—"}</b>
        </div>
      </section>
      <div className="panel checkin-panel">
        <PanelHead title="Recent check-ins" detail="Edit either measurement or delete the complete check-in" />
        <div className="checkin-list">{weights.length?weights.slice(-8).reverse().map(check=><div key={check.id}><span><b>{nice(check.date)}</b><small>{check.weight?`${check.weight.toFixed(1)} lb`:"No weight"} · {check.bodyFat?`${check.bodyFat.toFixed(1)}% body fat`:"No body fat"}</small></span>{check.id>0&&<div className="row-actions"><button aria-label={`Edit check-in from ${check.date}`} onClick={()=>editCheck(check)}><Pencil/></button><button aria-label={`Delete check-in from ${check.date}`} onClick={()=>deleteCheck(check)}><Trash2/></button></div>}</div>):<div className="empty compact"><Scale/>No check-ins yet.</div>}</div>
      </div>
      <section className="columns records">
        <div className="panel">
          <PanelHead
            title="Body composition"
            detail="Each check-in can contain either or both measurements"
          />
          <div className="chart">
            <ResponsiveContainer>
              <LineChart
                data={weights}
                margin={{ top: 10, right: 8, left: -12 }}
              >
                <CartesianGrid vertical={false} stroke="#d5d7da" />
                <XAxis
                  dataKey="date"
                  tickFormatter={nice}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="weight"
                  domain={["dataMin - 2", "dataMax + 2"]}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="fat"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Line
                  yAxisId="weight"
                  connectNulls
                  dataKey="weight"
                  name="Weight (lb)"
                  stroke={dark}
                  strokeWidth={3}
                />
                <Line
                  yAxisId="fat"
                  connectNulls
                  dataKey="bodyFat"
                  name="Body fat (%)"
                  stroke={red}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <PanelHead title="Consistency" detail="Sessions by weekday" />
          <div className="chart">
            <ResponsiveContainer>
              <BarChart data={days}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="sessions" fill={red} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      <div className="panel">
        <PanelHead
          title="Personal records"
          detail="Best estimated one-rep max for every exercise"
          action={
            <label className="inline-filter">
              Workout type
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
              >
                <option>All</option>
                {workoutTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
          }
        />
        <div className="record-table">
          <div className="record head">
            <span>Exercise</span>
            <span>Best set</span>
            <span>Est. 1RM</span>
            <span>Date</span>
          </div>
          {records.map((r, i) => (
            <div className="record" key={r.exercise}>
              <span>
                <i>{i + 1}</i>
                <b>{r.exercise}</b>
              </span>
              <span>
                {r.weight} lb × {r.reps}
              </span>
              <strong>{r.oneRM} lb</strong>
              <span>{nice(r.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CalendarView({
  nutrition,
  workouts,
  weights,
  goals,
}: {
  nutrition: Nutrition[];
  workouts: Workout[];
  weights: WeighIn[];
  goals: Goals;
}) {
  const [cursor, setCursor] = useState(() => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }),
    [detail, setDetail] = useState<{
      date: string;
      kind: "nutrition" | "workout";
    } | null>(null),
    [exercisePreview, setExercisePreview] = useState<string | null>(null),
    year = cursor.getFullYear(),
    month = cursor.getMonth(),
    offset = new Date(year, month, 1).getDay(),
    count = new Date(year, month + 1, 0).getDate(),
    cells = Array.from(
      { length: Math.ceil((offset + count) / 7) * 7 },
      (_, index) => {
        const date = index - offset + 1;
        if (date < 1 || date > count) return null;
        const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`,
          meals = nutrition.filter((x) => x.date === iso),
          rows = workouts.filter((x) => x.date === iso),
          sessions = [...new Set(rows.map((x) => x.workout))],
          check = weights.find((x) => x.date === iso),
          totals = meals.reduce(
            (sum, x) => ({
              calories: sum.calories + x.calories,
              protein: sum.protein + x.protein,
              carbs: sum.carbs + x.carbs,
              fat: sum.fat + x.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 },
          );
        return { date, iso, meals, rows, sessions, check, totals };
      },
    );
  function move(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }
  const selectedMeals = detail
      ? nutrition.filter((x) => x.date === detail.date)
      : [],
    selectedRows = detail ? workouts.filter((x) => x.date === detail.date) : [],
    selectedTotals = selectedMeals.reduce(
      (sum, x) => ({
        calories: sum.calories + x.calories,
        protein: sum.protein + x.protein,
        carbs: sum.carbs + x.carbs,
        fat: sum.fat + x.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    ),
    previewRows = exercisePreview ? selectedRows.filter((x) => x.exercise === exercisePreview) : [],
    previewBodyweight = previewRows.length > 0 && previewRows.every((x) => x.weight <= 0);
  return (
    <>
      <Title
        eyebrow="Calendar"
        title="Your journal at a glance."
        detail="Open the nutrition or workout entry inside any day for the full breakdown."
      />
      <div className="panel calendar-panel">
        <div className="calendar-head">
          <button aria-label="Previous month" onClick={() => move(-1)}>
            <ChevronLeft />
          </button>
          <h2>
            {cursor.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button aria-label="Next month" onClick={() => move(1)}>
            <ChevronRight />
          </button>
        </div>
        <div className="calendar-grid calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((x) => (
            <b key={x}>{x}</b>
          ))}
        </div>
        <div className="calendar-grid">
          {cells.map((cell, index) =>
            cell ? (
              <div
                className={`calendar-day ${cell.iso === day() ? "today" : ""}`}
                key={cell.iso}
              >
                <strong>{cell.date}</strong>
                <div>
                  {cell.meals.length > 0 && (
                    <button
                      className="calorie-dot"
                      onClick={() =>
                        setDetail({ date: cell.iso, kind: "nutrition" })
                      }
                    >
                      <Flame />
                      <span>{round1(cell.totals.calories)} kcal</span>
                      <small>
                        P{round1(cell.totals.protein)} · C
                        {round1(cell.totals.carbs)} · F
                        {round1(cell.totals.fat)}
                      </small>
                    </button>
                  )}
                  {cell.sessions.length > 0 && (
                    <button
                      className="workout-dot"
                      onClick={() => setDetail({ date: cell.iso, kind: "workout" })}
                    >
                      <Dumbbell />
                      <span>{cell.sessions.join(" + ")}</span>
                      <small>
                        {cell.rows.length} sets ·{" "}
                        {new Set(cell.rows.map((x) => x.exercise)).size}{" "}
                        exercises
                      </small>
                    </button>
                  )}
                  {cell.check && (
                    <span className="weight-dot">
                      <Scale />
                      {cell.check.weight
                        ? `${cell.check.weight.toFixed(1)} lb`
                        : ""}
                      {cell.check.weight && cell.check.bodyFat ? " · " : ""}
                      {cell.check.bodyFat
                        ? `${cell.check.bodyFat.toFixed(1)}%`
                        : ""}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="calendar-day muted" key={`blank-${index}`} />
            ),
          )}
        </div>
      </div>
      {detail?.kind === "nutrition" && (
        <Modal
          close={() => setDetail(null)}
          icon={<Apple />}
          title={`Nutrition · ${nice(detail.date)}`}
          detail={`${selectedMeals.length} logged meal${selectedMeals.length === 1 ? "" : "s"}`}
        >
          <div className="detail-macros"><GoalCard label="Calories" value={selectedTotals.calories} goal={goals.calories} unit=" kcal"/><GoalCard label="Protein" value={selectedTotals.protein} goal={goals.protein}/><GoalCard label="Carbs" value={selectedTotals.carbs} goal={goals.carbs}/><GoalCard label="Fat" value={selectedTotals.fat} goal={goals.fat}/></div>
          <Meals data={selectedMeals} />
        </Modal>
      )}
      {detail?.kind === "workout" && <WorkoutComparisonModal session={{date: detail.date, workout: [...new Set(selectedRows.map((x) => x.workout))].join(" + "), rows: selectedRows}} allWorkouts={workouts} close={() => setDetail(null)} />}
      {detail?.kind === "workout" && false && (
        <Modal
          close={() => setDetail(null)}
          icon={<Dumbbell />}
          title={`Workout · ${nice(detail.date)}`}
          detail={`${new Set(selectedRows.map((x) => x.exercise)).size} exercises · ${selectedRows.length} working sets`}
        >
          <div className="workout-exercise-scroll">
            {[...new Set(selectedRows.map((x) => x.exercise))].map((ex) => {
              const rows = selectedRows.filter((x) => x.exercise === ex),
                bodyweight = rows.every(x=>x.weight<=0),
                trend = exercisePerformance(workouts, ex, detail.date, bodyweight),
                best = bodyweight ? rows.reduce((a,b)=>a.reps>b.reps?a:b) : rows.reduce((a, b) => a.weight * (1 + a.reps / 30) > b.weight * (1 + b.reps / 30) ? a : b);
              return (
                <button
                  className={`exercise-summary trend-${trend.state} ${exercisePreview === ex ? "active" : ""}`}
                  key={ex}
                  onClick={() =>
                    setExercisePreview(exercisePreview === ex ? null : ex)
                  }
                >
                  <span>
                    <TrendMark state={trend.state} />
                    <b>{ex}</b>
                  </span>
                  <strong>{rows.length} sets</strong>
                  <small>
                    {bodyweight ? `Best ${best.reps} reps` : `Best ${best.weight} lb × ${best.reps} · est. ${trend.current} lb`}
                  </small>
                  <em>
                    {trend.delta === null
                      ? "First session"
                      : trend.delta === 0
                        ? "No change"
                        : `${trend.delta > 0 ? "+" : ""}${trend.delta} ${trend.unit} vs prior`}
                  </em>
                </button>
              );
            })}
          </div>
          <p className="modal-hint">
            Choose an exercise to inspect its sets. Green improved, red
            declined, and gray stayed level.
          </p>
          {exercisePreview && (
            <div className="exercise-preview">
              <PanelHead
                title={exercisePreview}
                detail={previewBodyweight ? "Reps for each bodyweight set" : "Estimated 1RM for each set in this session"}
              />
              <div className="chart">
                <ResponsiveContainer>
                  <LineChart
                    data={previewRows.map((x) => ({
                        set: `Set ${x.setNumber}`,
                        metric: previewBodyweight ? x.reps : Math.round(x.weight * (1 + x.reps / 30)),
                        weight: x.weight,
                      }))}
                  >
                    <CartesianGrid vertical={false} stroke="#d5d7da" />
                    <XAxis dataKey="set" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line
                      dataKey="metric"
                      name={previewBodyweight ? "Reps" : "Est. 1RM"}
                      stroke={red}
                      strokeWidth={3}
                    />
                    {!previewBodyweight&&<Line dataKey="weight" name="Weight" stroke={dark} strokeDasharray="4 4"/>}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

async function responseJson(response: Response) {
  const text = await response.text();
  if (!text)
    throw new Error(
      `Request failed (${response.status}). The server returned an empty response.`,
    );
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(
      `Request failed (${response.status}). The server returned an invalid response.`,
    );
  }
}

function NutritionLog({
  savedMeals,
  savedIngredients,
  initialMealId,
  initialEntry,
  close,
  done,
}: {
  savedMeals: SavedMeal[];
  savedIngredients: SavedIngredient[];
  initialMealId: number | null;
  initialEntry: Nutrition | null;
  close: () => void;
  done: () => void;
}) {
  const blank = (): MealItem => ({
      name: "",
      servingLabel: "1 serving",
      quantity: 1,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }),
    initial = savedMeals.find((x) => x.id === initialMealId),
    [name, setName] = useState(initialEntry?.name || initial?.name || ""),
    [mealType, setMealType] = useState(initialEntry?.mealType || "Meal"),
    [date, setDate] = useState(initialEntry?.date || day()),
    [items, setItems] = useState<MealItem[]>(
      initialEntry
        ? mealItems(initialEntry.detailsJson || "[]")
        : initial
          ? mealItems(initial.itemsJson)
          : [blank()],
    ),
    [savedRows, setSavedRows] = useState<Set<number>>(new Set()),
    [saveTemplate, setSaveTemplate] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  function choose(id: string) {
    const m = savedMeals.find((x) => String(x.id) === id);
    if (!m) {
      setName("");
      setItems([blank()]);
      return;
    }
    setName(m.name);
    setItems(mealItems(m.itemsJson));
  }
  function addSaved(id: string) {
    const x = savedIngredients.find((item) => String(item.id) === id);
    if (x)
      setItems((rows) => [
        ...rows.filter((row) => row.name || row.calories),
        {
          name: x.name,
          servingLabel: x.servingLabel,
          quantity: 1,
          calories: x.calories,
          protein: x.protein,
          carbs: x.carbs,
          fat: x.fat,
        },
      ]);
  }
  function update(i: number, key: keyof MealItem, value: string) {
    setItems((rows) =>
      rows.map((row, n) =>
        n === i
          ? {
              ...row,
              [key]:
                key === "name" || key === "servingLabel"
                  ? value
                  : Number(value),
            }
          : row,
      ),
    );
  }
  async function saveIngredient(item: MealItem, index: number) {
    if (!item.name.trim()) {
      setError("Name the ingredient before saving it.");
      return;
    }
    try {
      const r = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "ingredient", ...item }),
        }),
        j = await responseJson(r);
      if (!r.ok)
        throw new Error(
          String(j.error || `Could not save ingredient (${r.status})`),
        );
      setSavedRows((current) => new Set(current).add(index));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save ingredient");
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/entries", {
          method: initialEntry ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "nutrition",
            id: initialEntry?.id,
            date,
            name,
            mealType,
            items,
            saveTemplate: initialEntry ? false : saveTemplate,
          }),
        }),
        j = await responseJson(r);
      if (!r.ok)
        throw new Error(String(j.error || `Could not save (${r.status})`));
      done();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setSaving(false);
    }
  }
  const totals = items.reduce(
    (a, x) => ({
      cal: a.cal + x.calories * x.quantity,
      p: a.p + x.protein * x.quantity,
      c: a.c + x.carbs * x.quantity,
      f: a.f + x.fat * x.quantity,
    }),
    { cal: 0, p: 0, c: 0, f: 0 },
  );
  return (
    <Modal
      close={close}
      icon={<Apple />}
      title={initialEntry ? "Edit logged meal" : "Add a meal"}
      detail="Nutrition values are per serving. Set the serving size, then multiply it with quantity."
    >
      <form onSubmit={submit}>
        <label>
          Saved meal
          <select
            onChange={(e) => choose(e.target.value)}
            defaultValue={initialMealId ? String(initialMealId) : ""}
          >
            <option value="">Build a new meal</option>
            {savedMeals.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <Controlled label="Meal name" value={name} set={setName} />
          <label>
            Meal type
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
              <option>Meal</option>
            </select>
          </label>
        </div>
        <Controlled label="Date" type="date" value={date} set={setDate} />
        <div className="meal-builder-head">
          <b>Ingredients · values per serving</b>
          <div>
            <select
              aria-label="Add saved ingredient"
              defaultValue=""
              onChange={(e) => {
                addSaved(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">+ Add saved ingredient</option>
              {savedIngredients.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} · {x.servingLabel}
                </option>
              ))}
            </select>
            <span>
              {Math.round(totals.cal)} kcal · P {Math.round(totals.p)} · C{" "}
              {Math.round(totals.c)} · F {Math.round(totals.f)}
            </span>
          </div>
        </div>
        <div className="ingredient-labels">
          <span>Ingredient</span>
          <span>Serving</span>
          <span>Qty</span>
          <span>kcal</span>
          <span>P</span>
          <span>C</span>
          <span>F</span>
          <span>Save</span>
        </div>
        <div className="meal-builder">
          {items.map((item, i) => (
            <div className="ingredient-row" key={i}>
              <input
                aria-label="Item name"
                placeholder="Chicken thighs"
                value={item.name}
                onChange={(e) => update(i, "name", e.target.value)}
              />
              <input
                aria-label="Serving size"
                placeholder="4 oz"
                value={item.servingLabel}
                onChange={(e) => update(i, "servingLabel", e.target.value)}
              />
              <input
                aria-label="Quantity"
                placeholder="Qty"
                type="number"
                min="0.01"
                step="0.01"
                value={item.quantity || ""}
                onChange={(e) => update(i, "quantity", e.target.value)}
              />
              <input
                aria-label="Calories per serving"
                placeholder="kcal"
                type="number"
                value={item.calories || ""}
                onChange={(e) => update(i, "calories", e.target.value)}
              />
              <input
                aria-label="Protein per serving"
                placeholder="P"
                type="number"
                value={item.protein || ""}
                onChange={(e) => update(i, "protein", e.target.value)}
              />
              <input
                aria-label="Carbs per serving"
                placeholder="C"
                type="number"
                value={item.carbs || ""}
                onChange={(e) => update(i, "carbs", e.target.value)}
              />
              <input
                aria-label="Fat per serving"
                placeholder="F"
                type="number"
                value={item.fat || ""}
                onChange={(e) => update(i, "fat", e.target.value)}
              />
              <button
                className={savedRows.has(i) ? "saved" : ""}
                type="button"
                aria-label={`Save ${item.name || "ingredient"} to saved ingredients`}
                title="Save this ingredient"
                onClick={() => saveIngredient(item, i)}
              >
                {savedRows.has(i) ? <Save /> : <BookmarkPlus />}
              </button>
              <button
                type="button"
                aria-label="Remove item"
                onClick={() => setItems((v) => v.filter((_, n) => n !== i))}
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="secondary"
          onClick={() => setItems((v) => [...v, blank()])}
        >
          <Plus />
          Add custom ingredient
        </button>
        {!initialEntry && (
          <label className="check">
            <input
              type="checkbox"
              checked={saveTemplate}
              onChange={(e) => setSaveTemplate(e.target.checked)}
            />
            <span>
              {name && savedMeals.some((x) => x.name === name)
                ? "Save this variation as a new recurring meal"
                : "Save as a recurring meal"}
            </span>
          </label>
        )}
        {error && <div className="error">{error}</div>}
        <button className="primary save" disabled={saving}>
          {saving ? "Saving…" : initialEntry ? "Save meal changes" : "Log meal"}
        </button>
      </form>
    </Modal>
  );
}

function GoalsLog({
  goals,
  close,
  done,
}: {
  goals: Goals;
  close: () => void;
  done: () => void;
}) {
  const [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "goals",
            ...Object.fromEntries(new FormData(e.currentTarget)),
          }),
        }),
        j = await responseJson(r);
      if (!r.ok)
        throw new Error(String(j.error || `Could not save (${r.status})`));
      done();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setSaving(false);
    }
  }
  return (
    <Modal
      close={close}
      icon={<Target />}
      title="Set nutrition goals"
      detail="Calories are required. Protein, carbs, and fat are optional and can be left blank."
    >
      <form onSubmit={submit}>
        <Field
          label="Calories"
          name="calories"
          type="number"
          value={String(goals.calories)}
        />
        <div className="form-grid">
          <Field
            label="Protein (g)"
            name="protein"
            type="number"
            value={goals.protein ? String(goals.protein) : ""}
            required={false}
          />
          <Field
            label="Carbs (g)"
            name="carbs"
            type="number"
            value={goals.carbs ? String(goals.carbs) : ""}
            required={false}
          />
          <Field
            label="Fat (g)"
            name="fat"
            type="number"
            value={goals.fat ? String(goals.fat) : ""}
            required={false}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="primary save" disabled={saving}>
          {saving ? "Saving…" : "Save goals"}
        </button>
      </form>
    </Modal>
  );
}

function IngredientLog({
  initial,
  close,
  done,
}: {
  initial: SavedIngredient | null;
  close: () => void;
  done: () => void;
}) {
  const [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget)),
        r = await fetch("/api/entries", {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "ingredient",
            id: initial?.id,
            ...values,
          }),
        }),
        j = await responseJson(r);
      if (!r.ok)
        throw new Error(String(j.error || `Could not save (${r.status})`));
      done();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setSaving(false);
    }
  }
  return (
    <Modal
      close={close}
      icon={<Apple />}
      title={initial ? "Edit saved ingredient" : "Save an ingredient"}
      detail="Enter nutrition for one serving. You will choose the quantity each time you add it to a meal."
    >
      <form onSubmit={submit}>
        <Field label="Ingredient name" name="name" value={initial?.name} />
        <Field
          label="Serving size"
          name="servingLabel"
          value={initial?.servingLabel || "4 oz"}
        />
        <div className="form-grid">
          <Field
            label="Calories per serving"
            name="calories"
            type="number"
            value={initial ? String(initial.calories) : undefined}
          />
          <Field
            label="Protein per serving (g)"
            name="protein"
            type="number"
            value={initial ? String(initial.protein) : undefined}
          />
          <Field
            label="Carbs per serving (g)"
            name="carbs"
            type="number"
            value={initial ? String(initial.carbs) : undefined}
          />
          <Field
            label="Fat per serving (g)"
            name="fat"
            type="number"
            value={initial ? String(initial.fat) : undefined}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="primary save" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Save ingredient"}
        </button>
      </form>
    </Modal>
  );
}

function SavedMealEditor({
  meal,
  close,
  done,
}: {
  meal: SavedMeal;
  close: () => void;
  done: () => void;
}) {
  const [name, setName] = useState(meal.name),
    [items, setItems] = useState(() => mealItems(meal.itemsJson)),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  function update(index: number, key: keyof MealItem, value: string) {
    setItems((rows) =>
      rows.map((row, i) =>
        i === index
          ? {
              ...row,
              [key]:
                key === "name" || key === "servingLabel"
                  ? value
                  : Number(value),
            }
          : row,
      ),
    );
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/entries", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "savedMeal", id: meal.id, name, items }),
        }),
        j = await responseJson(r);
      if (!r.ok)
        throw new Error(String(j.error || `Could not save (${r.status})`));
      done();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setSaving(false);
    }
  }
  return (
    <Modal
      close={close}
      icon={<Pencil />}
      title="Edit saved meal"
      detail="Update the reusable template without logging a meal."
    >
      <form onSubmit={submit}>
        <Controlled label="Saved meal name" value={name} set={setName} />
        <div className="compact-editor">
          {items.map((item, index) => (
            <div className="compact-editor-row" key={index}>
              <input
                aria-label="Ingredient"
                value={item.name}
                onChange={(e) => update(index, "name", e.target.value)}
              />
              <input
                aria-label="Serving"
                value={item.servingLabel}
                onChange={(e) => update(index, "servingLabel", e.target.value)}
              />
              <input
                aria-label="Quantity"
                type="number"
                step="0.01"
                value={item.quantity}
                onChange={(e) => update(index, "quantity", e.target.value)}
              />
              <input
                aria-label="Calories"
                type="number"
                value={item.calories}
                onChange={(e) => update(index, "calories", e.target.value)}
              />
              <input
                aria-label="Protein"
                type="number"
                value={item.protein}
                onChange={(e) => update(index, "protein", e.target.value)}
              />
              <input
                aria-label="Carbs"
                type="number"
                value={item.carbs}
                onChange={(e) => update(index, "carbs", e.target.value)}
              />
              <input
                aria-label="Fat"
                type="number"
                value={item.fat}
                onChange={(e) => update(index, "fat", e.target.value)}
              />
              <button
                type="button"
                aria-label="Remove ingredient"
                onClick={() =>
                  setItems((rows) => rows.filter((_, i) => i !== index))
                }
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="secondary"
          onClick={() =>
            setItems((rows) => [
              ...rows,
              {
                name: "",
                servingLabel: "1 serving",
                quantity: 1,
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
              },
            ])
          }
        >
          <Plus />
          Add ingredient
        </button>
        {error && <div className="error">{error}</div>}
        <button className="primary save" disabled={saving}>
          {saving ? "Saving…" : "Save template"}
        </button>
      </form>
    </Modal>
  );
}

type ComparisonTooltipItem = { dataKey?: string | number; value?: number; color?: string; name?: string; payload?: Record<string, string | number | null> };
function ComparisonTooltip({ active, payload, label }: { active?: boolean; payload?: ComparisonTooltipItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="comparison-tooltip"><b>{label}</b>{payload.map((item) => <span key={String(item.dataKey)} style={{borderColor: item.color}}><strong>{item.name}: {round1(Number(item.value))}</strong><small>{item.payload?.[`meta_${String(item.dataKey)}`]}</small></span>)}</div>;
}

function WorkoutComparisonModal({ session, allWorkouts, close }: { session: { date: string; workout: string; rows: Workout[] }; allWorkouts: Workout[]; close: () => void }) {
  const exercises = [...new Set(session.rows.map((row) => row.exercise))],
    [selected, setSelected] = useState(exercises[0] || ""),
    currentRows = session.rows.filter((row) => row.exercise === selected),
    bodyweight = currentRows.length > 0 && currentRows.every((row) => row.weight <= 0),
    dates = [...new Set(allWorkouts.filter((row) => row.exercise === selected && row.date <= session.date).map((row) => row.date))].sort().slice(-3),
    sets = [...new Set(dates.flatMap((date) => allWorkouts.filter((row) => row.exercise === selected && row.date === date).map((row) => row.setNumber)))].sort((a, b) => a - b),
    chartData = sets.map((setNumber) => {
      const point: Record<string, string | number | null> = { set: `Set ${setNumber}` };
      dates.forEach((date, index) => {
        const row = allWorkouts.find((item) => item.exercise === selected && item.date === date && item.setNumber === setNumber), key = `session${index}`;
        point[key] = row ? round1(bodyweight ? row.reps : row.weight * (1 + row.reps / 30)) : null;
        point[`meta_${key}`] = row ? (bodyweight ? `${row.reps} reps` : `${round1(row.weight)} lb × ${row.reps} reps`) : "No matching set";
      });
      return point;
    }),
    colors = ["#a1a1aa", dark, red];
  return <Modal close={close} icon={<Dumbbell/>} title={`${session.workout} · ${nice(session.date)}`} detail="Compare every set with the same exercise’s two prior sessions.">
    <div className="comparison-exercises">{exercises.map((exercise) => <button className={selected === exercise ? "active" : ""} key={exercise} onClick={() => setSelected(exercise)}>{exercise}</button>)}</div>
    <PanelHead title={selected} detail={bodyweight ? "Reps per set · working details appear on hover" : "Estimated 1RM per set · working weight appears on hover"} />
    {chartData.length ? <div className="chart tall"><ResponsiveContainer><BarChart data={chartData} margin={{top: 12, right: 6, left: -18}}><CartesianGrid vertical={false} stroke="#d5d7da"/><XAxis dataKey="set" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip content={<ComparisonTooltip />}/>{dates.map((date, index) => <Bar key={date} dataKey={`session${index}`} name={date === session.date ? `Current · ${nice(date)}` : nice(date)} fill={colors[index + (3 - dates.length)]} radius={[5,5,0,0]}/>)}</BarChart></ResponsiveContainer></div> : <div className="empty compact"><Dumbbell/>No comparable sets.</div>}
    <div className="comparison-legend">{dates.map((date, index) => <span key={date}><i style={{background: colors[index + (3 - dates.length)]}}/>{date === session.date ? "Current" : nice(date)}</span>)}</div>
  </Modal>;
}

function WorkoutSessionDetail({ session, close, edit }: { session: { date: string; workout: string; rows: Workout[] }; close: () => void; edit: () => void }) {
  const exercises=[...new Set(session.rows.map(x=>x.exercise))];
  return <Modal close={close} icon={<Dumbbell/>} title={`${session.workout} · ${nice(session.date)}`} detail={`${exercises.length} exercises · ${session.rows.length} working sets`}><div className="session-detail-summary"><div><small>Total volume</small><b>{Math.round(session.rows.reduce((sum,x)=>sum+x.weight*x.reps,0)).toLocaleString()} lb</b></div><div><small>Exercises</small><b>{exercises.length}</b></div><div><small>Sets</small><b>{session.rows.length}</b></div></div><div className="session-exercise-groups">{exercises.map(ex=>{const rows=session.rows.filter(x=>x.exercise===ex),bodyweight=rows.every(x=>x.weight<=0),best=bodyweight?Math.max(...rows.map(x=>x.reps)):Math.round(Math.max(...rows.map(x=>x.weight*(1+x.reps/30))));return <section key={ex}><header><b>{ex}</b><span>{bodyweight?`Best ${best} reps`:`Best est. 1RM ${best} lb`}</span></header><div>{rows.map(row=><span key={row.id}><small>Set {row.setNumber}</small><strong>{bodyweight?`${row.reps} reps`:`${row.weight} lb × ${row.reps}`}</strong></span>)}</div></section>})}</div><button className="primary save" onClick={edit}><Pencil/>Edit this session</button></Modal>
}

function WorkoutSessionEditor({
  session,
  close,
  done,
}: {
  session: { date: string; workout: string; rows: Workout[] };
  close: () => void;
  done: () => void;
}) {
  const [date, setDate] = useState(session.date),
    [workout, setWorkout] = useState(session.workout),
    [rows, setRows] = useState(() => session.rows.map((row) => ({ ...row }))),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  function update(index: number, key: keyof Workout, value: string) {
    setRows((current) =>
      current.map((row, i) =>
        i === index
          ? { ...row, [key]: key === "exercise" ? value : Number(value) }
          : row,
      ),
    );
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = rows.map((row) => ({ ...row, date, workout })),
        r = await fetch("/api/entries", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "workoutSession",
            originalDate: session.date,
            originalWorkout: session.workout,
            rows: payload,
          }),
        }),
        j = await responseJson(r);
      if (!r.ok)
        throw new Error(String(j.error || `Could not save (${r.status})`));
      done();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setSaving(false);
    }
  }
  async function remove() {
    if (
      !window.confirm(
        `Delete the complete ${session.workout} session from ${nice(session.date)}?`,
      )
    )
      return;
    const r = await fetch(
      `/api/entries?type=workoutSession&date=${encodeURIComponent(session.date)}&workout=${encodeURIComponent(session.workout)}`,
      { method: "DELETE" },
    );
    if (r.ok) done();
    else setError("Could not delete this workout session.");
  }
  return (
    <Modal
      close={close}
      icon={<Table2 />}
      title="Edit workout session"
      detail="Change the session once, review sets in a compact table, or delete the whole workout."
    >
      <form onSubmit={submit}>
        <div className="form-grid">
          <Controlled label="Date" type="date" value={date} set={setDate} />
          <Controlled label="Workout type" value={workout} set={setWorkout} />
        </div>
        <div className="workout-table">
          <div className="workout-table-head">
            <span>Exercise</span>
            <span>Set</span>
            <span>Weight</span>
            <span>Reps</span>
            <span />
          </div>
          {rows.map((row, index) => (
            <div className="workout-table-row" key={`${row.id}-${index}`}>
              <input
                aria-label="Exercise"
                value={row.exercise}
                onChange={(e) => update(index, "exercise", e.target.value)}
              />
              <input
                aria-label="Set number"
                type="number"
                value={row.setNumber}
                onChange={(e) => update(index, "setNumber", e.target.value)}
              />
              <input
                aria-label="Weight"
                type="number"
                step="0.1"
                value={row.weight}
                onChange={(e) => update(index, "weight", e.target.value)}
              />
              <input
                aria-label="Reps"
                type="number"
                value={row.reps}
                onChange={(e) => update(index, "reps", e.target.value)}
              />
              <button
                type="button"
                aria-label="Remove set"
                onClick={() =>
                  setRows((current) => current.filter((_, i) => i !== index))
                }
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
        {error && <div className="error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="danger" onClick={remove}>
            <Trash2 />
            Delete session
          </button>
          <button className="primary" disabled={saving || !rows.length}>
            {saving ? "Saving…" : "Save session"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function parseWorkout(text: string) {
  const lines = text
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean),
    workout = lines[0] || "Training";
  let date = "",
    exercise = "";
  const sets: Omit<Workout, "id">[] = [];
  for (const line of lines.slice(1)) {
    const dm = line.match(/^[A-Za-z]+,\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/);
    if (dm) {
      date = new Date(`${dm[1]} ${dm[2]}, ${dm[3]} 12:00:00`)
        .toISOString()
        .slice(0, 10);
      continue;
    }
    if (line.startsWith("https://")) continue;
    const sm = line.match(
      /^Set\s+(\d+):\s*(?:([+-]?[\d.]+)\s*lb\s*[×x]\s*(\d+)|(\d+)\s*reps?)/i,
    );
    if (sm) {
      sets.push({
        date,
        workout,
        exercise,
        setNumber: Number(sm[1]),
        weight: sm[2] ? Number(sm[2]) : 0,
        reps: Number(sm[3] || sm[4]),
      });
      continue;
    }
    exercise = line;
  }
  return { workout, date, sets };
}
function WorkoutImport({
  close,
  done,
}: {
  close: () => void;
  done: () => void;
}) {
  const [sessions, setSessions] = useState<ReturnType<typeof parseWorkout>[]>(
      [],
    ),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  async function files(e: ChangeEvent<HTMLInputElement>) {
    const chosen = [...(e.target.files || [])];
    setSessions(
      await Promise.all(chosen.map(async (f) => parseWorkout(await f.text()))),
    );
  }
  async function submit() {
    const sets = sessions.flatMap((x) => x.sets);
    setSaving(true);
    try {
      const r = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "workoutImport", sets }),
        }),
        j = await responseJson(r);
      if (!r.ok)
        throw new Error(String(j.error || `Import failed (${r.status})`));
      done();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      setSaving(false);
    }
  }
  return (
    <Modal
      close={close}
      icon={<FileUp />}
      title="Import complete workouts"
      detail="Choose one or more Strong-style .txt exports. Each file is treated as one workout session."
    >
      <label className="dropzone">
        <FileUp />
        <b>Select workout .txt files</b>
        <span>Weighted, assisted, and bodyweight sets are supported.</span>
        <input type="file" accept=".txt,text/plain" multiple onChange={files} />
      </label>
      {sessions.length > 0 && (
        <div className="import-summary">
          <b>
            {sessions.length} workout{sessions.length === 1 ? "" : "s"} ready
          </b>
          {sessions.map((s, i) => (
            <span key={i}>
              <strong>{s.workout}</strong> · {nice(s.date)} · {s.sets.length}{" "}
              sets
            </span>
          ))}
        </div>
      )}
      {error && <div className="error">{error}</div>}
      <button
        className="primary save"
        onClick={submit}
        disabled={saving || !sessions.length}
      >
        {saving
          ? "Importing…"
          : `Import ${sessions.length || ""} workout${sessions.length === 1 ? "" : "s"}`}
      </button>
    </Modal>
  );
}
function WeightLog({ initial, datePreset, close, done }: { initial: WeighIn | null; datePreset: string; close: () => void; done: () => void }) {
  const [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const body = {
      type: "weight",
      id: initial?.id,
      ...Object.fromEntries(new FormData(e.currentTarget)),
    };
    try {
      const r = await fetch("/api/entries", {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        j = await responseJson(r);
      if (!r.ok)
        throw new Error(String(j.error || `Could not save (${r.status})`));
      done();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setSaving(false);
    }
  }
  return (
    <Modal
      close={close}
      icon={<Scale />}
      title={initial ? "Edit check-in" : "Body composition check-in"}
      detail="Enter weight, body-fat percentage, or both. At least one measurement is required."
    >
      <form onSubmit={submit}>
        <Field label="Date" name="date" type="date" value={initial?.date || datePreset} />
        <div className="form-grid">
          <Field
            label="Weight (lb) · optional"
            name="weight"
            type="number"
            value={initial?.weight ? String(initial.weight) : undefined}
            required={false}
          />
          <Field
            label="Body fat (%) · optional"
            name="bodyFat"
            type="number"
            value={initial?.bodyFat ? String(initial.bodyFat) : undefined}
            required={false}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="primary save" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Save check-in"}
        </button>
      </form>
    </Modal>
  );
}
function Modal({
  close,
  icon,
  title,
  detail,
  children,
}: {
  close: () => void;
  icon: ReactNode;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <div
      className="modal-wrap"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="modal">
        <button className="close" onClick={close}>
          <X />
        </button>
        <i className="modal-icon">{icon}</i>
        <h2>{title}</h2>
        <p>{detail}</p>
        {children}
      </div>
    </div>
  );
}
function Field({
  label,
  name,
  type = "text",
  value,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value}
        step={type === "number" ? "0.1" : undefined}
        required={required}
      />
    </label>
  );
}
function Controlled({
  label,
  type = "text",
  value,
  set,
}: {
  label: string;
  type?: string;
  value: string;
  set: (v: string) => void;
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => set(e.target.value)}
        required
      />
    </label>
  );
}
