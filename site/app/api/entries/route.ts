import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import {
  nutritionEntries,
  nutritionGoals,
  savedIngredients,
  savedMeals,
  weighIns,
  workoutSets,
} from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

type MealItem = {
  name?: unknown;
  servingLabel?: unknown;
  quantity?: unknown;
  calories?: unknown;
  protein?: unknown;
  carbs?: unknown;
  fat?: unknown;
};
type ImportedSet = {
  date?: unknown;
  workout?: unknown;
  exercise?: unknown;
  setNumber?: unknown;
  weight?: unknown;
  reps?: unknown;
};
const number = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export async function GET() {
  const user = await getChatGPTUser();
  if (!user)
    return Response.json({ error: "Sign in required" }, { status: 401 });
  const db = getDb();
  const [
    nutrition,
    workouts,
    weights,
    mealTemplates,
    ingredientTemplates,
    goalsRow,
  ] = await Promise.all([
    db
      .select()
      .from(nutritionEntries)
      .where(eq(nutritionEntries.userId, user.userId))
      .orderBy(asc(nutritionEntries.date)),
    db
      .select()
      .from(workoutSets)
      .where(eq(workoutSets.userId, user.userId))
      .orderBy(asc(workoutSets.date), asc(workoutSets.setNumber)),
    db
      .select()
      .from(weighIns)
      .where(eq(weighIns.userId, user.userId))
      .orderBy(asc(weighIns.date)),
    db
      .select()
      .from(savedMeals)
      .where(eq(savedMeals.userId, user.userId))
      .orderBy(asc(savedMeals.name)),
    db
      .select()
      .from(savedIngredients)
      .where(eq(savedIngredients.userId, user.userId))
      .orderBy(asc(savedIngredients.name)),
    db
      .select()
      .from(nutritionGoals)
      .where(eq(nutritionGoals.userId, user.userId))
      .limit(1),
  ]);
  const goals = goalsRow[0] ?? {
    calories: 2250,
    protein: 170,
    carbs: 250,
    fat: 75,
  };
  return Response.json({
    nutrition,
    workouts,
    weights,
    savedMeals: mealTemplates,
    savedIngredients: ingredientTemplates,
    goals,
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return Response.json({ error: "Sign in required" }, { status: 401 });
  const body = (await request.json()) as Record<string, unknown>;
  const type = String(body.type ?? "");
  const db = getDb();

  if (type === "nutrition") {
    const date = String(body.date ?? "");
    const name = String(body.name ?? "").trim();
    const rawItems = Array.isArray(body.items)
      ? (body.items as MealItem[])
      : [];
    const items = rawItems
      .map((item) => ({
        name: String(item.name ?? "").trim(),
        servingLabel:
          String(item.servingLabel ?? "1 serving").trim() || "1 serving",
        quantity: Math.max(0.01, number(item.quantity, 1)),
        calories: number(item.calories),
        protein: number(item.protein),
        carbs: number(item.carbs),
        fat: number(item.fat),
      }))
      .filter((item) => item.name);
    if (!date || !name || !items.length)
      return Response.json(
        { error: "Meal name, date, and at least one item are required" },
        { status: 400 },
      );
    const totals = items.reduce(
      (sum, item) => ({
        calories: sum.calories + item.calories * item.quantity,
        protein: sum.protein + item.protein * item.quantity,
        carbs: sum.carbs + item.carbs * item.quantity,
        fat: sum.fat + item.fat * item.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
    if (body.saveTemplate)
      await db
        .insert(savedMeals)
        .values({
          userId: user.userId,
          name,
          itemsJson: JSON.stringify(items),
        });
    const [entry] = await db
      .insert(nutritionEntries)
      .values({
        userId: user.userId,
        date,
        mealType: String(body.mealType ?? "Meal"),
        name,
        calories: Math.round(totals.calories * 10) / 10,
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        detailsJson: JSON.stringify(items),
      })
      .returning();
    return Response.json({ entry }, { status: 201 });
  }

  if (type === "ingredient") {
    const name = String(body.name ?? "").trim();
    if (!name)
      return Response.json(
        { error: "Ingredient name is required" },
        { status: 400 },
      );
    const [entry] = await db
      .insert(savedIngredients)
      .values({
        userId: user.userId,
        name,
        servingLabel: String(body.servingLabel ?? "1 serving"),
        calories: number(body.calories),
        protein: number(body.protein),
        carbs: number(body.carbs),
        fat: number(body.fat),
      })
      .returning();
    return Response.json({ entry }, { status: 201 });
  }

  if (type === "savedMeal") {
    const name = String(body.name ?? "").trim();
    const items = Array.isArray(body.items) ? (body.items as MealItem[]) : [];
    if (!name || !items.length)
      return Response.json(
        { error: "Meal name and at least one ingredient are required" },
        { status: 400 },
      );
    const [entry] = await db
      .insert(savedMeals)
      .values({
        userId: user.userId,
        name,
        itemsJson: JSON.stringify(items),
        favorite: Boolean(body.favorite),
      })
      .returning();
    return Response.json({ entry }, { status: 201 });
  }

  if (type === "goals") {
    const calories = number(body.calories);
    if (calories <= 0)
      return Response.json(
        { error: "A calorie goal is required" },
        { status: 400 },
      );
    const values = {
      calories: Math.round(calories),
      protein: Math.max(0, number(body.protein)),
      carbs: Math.max(0, number(body.carbs)),
      fat: Math.max(0, number(body.fat)),
      updatedAt: new Date().toISOString(),
    };
    const [entry] = await db
      .insert(nutritionGoals)
      .values({ userId: user.userId, ...values })
      .onConflictDoUpdate({ target: nutritionGoals.userId, set: values })
      .returning();
    return Response.json({ entry }, { status: 201 });
  }

  if (type === "workoutImport") {
    const rawSets = Array.isArray(body.sets)
      ? (body.sets as ImportedSet[])
      : [];
    if (!rawSets.length || rawSets.length > 2000)
      return Response.json(
        { error: "Import must contain between 1 and 2,000 sets" },
        { status: 400 },
      );
    const values = rawSets.map((set) => ({
      userId: user.userId,
      date: String(set.date ?? ""),
      workout: String(set.workout ?? "Training"),
      exercise: String(set.exercise ?? ""),
      setNumber: Math.max(1, Math.round(number(set.setNumber, 1))),
      weight: number(set.weight),
      reps: Math.max(1, Math.round(number(set.reps, 1))),
    }));
    if (values.some((set) => !set.date || !set.exercise))
      return Response.json(
        { error: "Every imported set needs a date and exercise" },
        { status: 400 },
      );
    const chunks = Array.from(
      { length: Math.ceil(values.length / 10) },
      (_, index) => values.slice(index * 10, index * 10 + 10),
    );
    const statements = chunks.map((chunk) =>
      db.insert(workoutSets).values(chunk),
    );
    await db.batch(
      statements as [
        (typeof statements)[number],
        ...(typeof statements)[number][],
      ],
    );
    return Response.json(
      {
        importedSets: values.length,
        sessions: new Set(values.map((set) => `${set.date}:${set.workout}`))
          .size,
      },
      { status: 201 },
    );
  }

  if (type === "weight") {
    const date = String(body.date ?? "");
    const weight = String(body.weight ?? "").trim();
    const bodyFat = String(body.bodyFat ?? "").trim();
    if (
      !date ||
      (!weight && !bodyFat) ||
      (weight && number(weight) <= 0) ||
      (bodyFat && number(bodyFat) <= 0)
    )
      return Response.json(
        { error: "Date and at least one valid measurement are required" },
        { status: 400 },
      );
    const [entry] = await db
      .insert(weighIns)
      .values({
        userId: user.userId,
        date,
        weight: weight ? number(weight) : null,
        bodyFat: bodyFat ? number(bodyFat) : null,
      })
      .returning();
    return Response.json({ entry }, { status: 201 });
  }
  return Response.json({ error: "Unknown entry type" }, { status: 400 });
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return Response.json({ error: "Sign in required" }, { status: 401 });
  const body = (await request.json()) as Record<string, unknown>;
  const type = String(body.type ?? "");
  const id = number(body.id);
  const db = getDb();

  if (type === "nutrition") {
    const date = String(body.date ?? "");
    const name = String(body.name ?? "").trim();
    const rawItems = Array.isArray(body.items)
      ? (body.items as MealItem[])
      : [];
    const items = rawItems
      .map((item) => ({
        name: String(item.name ?? "").trim(),
        servingLabel:
          String(item.servingLabel ?? "1 serving").trim() || "1 serving",
        quantity: Math.max(0.01, number(item.quantity, 1)),
        calories: number(item.calories),
        protein: number(item.protein),
        carbs: number(item.carbs),
        fat: number(item.fat),
      }))
      .filter((item) => item.name);
    if (!id || !date || !name || !items.length)
      return Response.json(
        { error: "Meal name, date, and at least one item are required" },
        { status: 400 },
      );
    const totals = items.reduce(
      (sum, item) => ({
        calories: sum.calories + item.calories * item.quantity,
        protein: sum.protein + item.protein * item.quantity,
        carbs: sum.carbs + item.carbs * item.quantity,
        fat: sum.fat + item.fat * item.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
    const [entry] = await db
      .update(nutritionEntries)
      .set({
        date,
        mealType: String(body.mealType ?? "Meal"),
        name,
        calories: Math.round(totals.calories * 10) / 10,
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        detailsJson: JSON.stringify(items),
      })
      .where(
        and(
          eq(nutritionEntries.id, id),
          eq(nutritionEntries.userId, user.userId),
        ),
      )
      .returning();
    if (!entry)
      return Response.json({ error: "Meal not found" }, { status: 404 });
    return Response.json({ entry });
  }

  if (type === "savedMeal") {
    const name = String(body.name ?? "").trim();
    const items = Array.isArray(body.items) ? (body.items as MealItem[]) : [];
    if (!id || !name || !items.length)
      return Response.json(
        { error: "Meal name and at least one ingredient are required" },
        { status: 400 },
      );
    const changes: {
      name: string;
      itemsJson: string;
      updatedAt: string;
      favorite?: boolean;
    } = {
      name,
      itemsJson: JSON.stringify(items),
      updatedAt: new Date().toISOString(),
    };
    if (typeof body.favorite === "boolean") changes.favorite = body.favorite;
    const [entry] = await db
      .update(savedMeals)
      .set(changes)
      .where(and(eq(savedMeals.id, id), eq(savedMeals.userId, user.userId)))
      .returning();
    if (!entry)
      return Response.json({ error: "Saved meal not found" }, { status: 404 });
    return Response.json({ entry });
  }

  if (type === "ingredient") {
    const name = String(body.name ?? "").trim();
    if (!id || !name)
      return Response.json(
        { error: "Ingredient name is required" },
        { status: 400 },
      );
    const [entry] = await db
      .update(savedIngredients)
      .set({
        name,
        servingLabel: String(body.servingLabel ?? "1 serving"),
        calories: number(body.calories),
        protein: number(body.protein),
        carbs: number(body.carbs),
        fat: number(body.fat),
      })
      .where(
        and(
          eq(savedIngredients.id, id),
          eq(savedIngredients.userId, user.userId),
        ),
      )
      .returning();
    if (!entry)
      return Response.json({ error: "Ingredient not found" }, { status: 404 });
    return Response.json({ entry });
  }

  if (type === "weight") {
    const date = String(body.date ?? ""), weight = String(body.weight ?? "").trim(), bodyFat = String(body.bodyFat ?? "").trim();
    if (!id || !date || (!weight && !bodyFat) || (weight && number(weight) <= 0) || (bodyFat && number(bodyFat) <= 0)) return Response.json({ error: "Date and at least one valid measurement are required" }, { status: 400 });
    const [entry] = await db.update(weighIns).set({ date, weight: weight ? number(weight) : null, bodyFat: bodyFat ? number(bodyFat) : null }).where(and(eq(weighIns.id, id), eq(weighIns.userId, user.userId))).returning();
    if (!entry) return Response.json({ error: "Check-in not found" }, { status: 404 });
    return Response.json({ entry });
  }

  if (type === "workoutSession") {
    const originalDate = String(body.originalDate ?? ""),
      originalWorkout = String(body.originalWorkout ?? ""),
      rows = Array.isArray(body.rows) ? (body.rows as ImportedSet[]) : [];
    if (!originalDate || !originalWorkout || !rows.length)
      return Response.json(
        { error: "A complete workout session is required" },
        { status: 400 },
      );
    const values = rows.map((row) => ({
      userId: user.userId,
      date: String(row.date ?? originalDate),
      workout: String(row.workout ?? originalWorkout),
      exercise: String(row.exercise ?? "").trim(),
      setNumber: Math.max(1, Math.round(number(row.setNumber, 1))),
      weight: number(row.weight),
      reps: Math.max(1, Math.round(number(row.reps, 1))),
    }));
    if (values.some((row) => !row.date || !row.workout || !row.exercise))
      return Response.json(
        { error: "Every set needs a date, workout, and exercise" },
        { status: 400 },
      );
    await db.batch([
      db
        .delete(workoutSets)
        .where(
          and(
            eq(workoutSets.userId, user.userId),
            eq(workoutSets.date, originalDate),
            eq(workoutSets.workout, originalWorkout),
          ),
        ),
      db.insert(workoutSets).values(values),
    ]);
    return Response.json({ updatedSets: values.length });
  }
  return Response.json({ error: "Unknown entry type" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return Response.json({ error: "Sign in required" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const type = params.get("type");
  const id = Number(params.get("id"));
  const db = getDb();
  if (type === "nutrition")
    await db
      .delete(nutritionEntries)
      .where(
        and(
          eq(nutritionEntries.id, id),
          eq(nutritionEntries.userId, user.userId),
        ),
      );
  else if (type === "workout")
    await db
      .delete(workoutSets)
      .where(and(eq(workoutSets.id, id), eq(workoutSets.userId, user.userId)));
  else if (type === "weight")
    await db
      .delete(weighIns)
      .where(and(eq(weighIns.id, id), eq(weighIns.userId, user.userId)));
  else if (type === "savedMeal")
    await db
      .delete(savedMeals)
      .where(and(eq(savedMeals.id, id), eq(savedMeals.userId, user.userId)));
  else if (type === "ingredient")
    await db
      .delete(savedIngredients)
      .where(
        and(
          eq(savedIngredients.id, id),
          eq(savedIngredients.userId, user.userId),
        ),
      );
  else if (type === "workoutSession") {
    const date = params.get("date") ?? "",
      workout = params.get("workout") ?? "";
    await db
      .delete(workoutSets)
      .where(
        and(
          eq(workoutSets.userId, user.userId),
          eq(workoutSets.date, date),
          eq(workoutSets.workout, workout),
        ),
      );
  } else return Response.json({ error: "Unknown entry type" }, { status: 400 });
  return Response.json({ ok: true });
}
