import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const nutritionEntries = sqliteTable("nutrition_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(), date: text("date").notNull(),
  mealType: text("meal_type").notNull(), name: text("name").notNull(),
  calories: real("calories").notNull(), protein: real("protein").notNull().default(0),
  carbs: real("carbs").notNull().default(0), fat: real("fat").notNull().default(0),
  detailsJson: text("details_json").notNull().default("[]"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("nutrition_user_date_idx").on(table.userId, table.date)]);

export const savedMeals = sqliteTable("saved_meals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  itemsJson: text("items_json").notNull().default("[]"),
  favorite: integer("favorite", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("saved_meal_user_idx").on(table.userId)]);

export const savedIngredients = sqliteTable("saved_ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  servingLabel: text("serving_label").notNull().default("1 serving"),
  calories: real("calories").notNull().default(0),
  protein: real("protein").notNull().default(0),
  carbs: real("carbs").notNull().default(0),
  fat: real("fat").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("saved_ingredient_user_idx").on(table.userId)]);

export const nutritionGoals = sqliteTable("nutrition_goals", {
  userId: text("user_id").primaryKey(),
  calories: integer("calories").notNull().default(2250),
  protein: real("protein").notNull().default(170),
  carbs: real("carbs").notNull().default(250),
  fat: real("fat").notNull().default(75),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const workoutSets = sqliteTable("workout_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(), date: text("date").notNull(),
  workout: text("workout").notNull(), exercise: text("exercise").notNull(),
  setNumber: integer("set_number").notNull().default(1),
  weight: real("weight").notNull(), reps: integer("reps").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("workout_user_date_idx").on(table.userId, table.date)]);

export const weighIns = sqliteTable("weigh_ins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(), date: text("date").notNull(), weight: real("weight"),
  bodyFat: real("body_fat"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("weight_user_date_idx").on(table.userId, table.date)]);
