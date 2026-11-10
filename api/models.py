# api/models.py
from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class Ingredient(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ingredients")
    name = models.CharField(max_length=255)
    serving_size = models.FloatField()
    serving_size_unit = models.CharField(max_length=50)
    calories = models.FloatField()
    carbs = models.FloatField()
    fat = models.FloatField()
    protein = models.FloatField()

    class Meta:
        unique_together = (("user", "name"),)

class Recipe(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recipes")
    name = models.CharField(max_length=255)

    class Meta:
        unique_together = (("user", "name"),)

class RecipeIngredient(models.Model):
    recipe = models.ForeignKey("Recipe", on_delete=models.CASCADE, related_name="ingredients")
    ingredient = models.ForeignKey("Ingredient", on_delete=models.CASCADE)
    quantity = models.FloatField()

class Meal(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="meals")
    recipe = models.ForeignKey("Recipe", null=True, blank=True, on_delete=models.SET_NULL)
    servings = models.FloatField(default=1)
    date = models.DateField()

class MealIngredient(models.Model):
    meal = models.ForeignKey("Meal", on_delete=models.CASCADE, related_name="ingredients")
    ingredient = models.ForeignKey("Ingredient", on_delete=models.CASCADE)
    quantity = models.FloatField()

class Weight(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="weights")
    date = models.DateField()
    weight = models.FloatField()

    class Meta:
        unique_together = (("user", "date"),)

# Workouts
class Activity(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activities")
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=(("Cardio","Cardio"),("Lifting","Lifting")))
    possible_units = models.JSONField(default=list, blank=True)

    class Meta:
        unique_together = (("user", "name"),)

class BaseWorkout(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="base_workouts")
    name = models.CharField(max_length=255)

    class Meta:
        unique_together = (("user", "name"),)

class BaseWorkoutActivity(models.Model):
    base_workout = models.ForeignKey("BaseWorkout", on_delete=models.CASCADE, related_name="activities")
    activity = models.ForeignKey("Activity", on_delete=models.CASCADE)
    unit = models.CharField(max_length=50, blank=True)
    amount = models.FloatField(null=True, blank=True)
    reps = models.IntegerField(null=True, blank=True)

class WorkoutLog(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workout_logs")
    base_workout = models.ForeignKey("BaseWorkout", null=True, blank=True, on_delete=models.SET_NULL)
    date = models.DateField()

class WorkoutLogActivity(models.Model):
    log = models.ForeignKey("WorkoutLog", on_delete=models.CASCADE, related_name="activities")
    activity = models.ForeignKey("Activity", on_delete=models.CASCADE)
    unit = models.CharField(max_length=50, blank=True)
    amount = models.FloatField(null=True, blank=True)
    reps = models.IntegerField(null=True, blank=True)