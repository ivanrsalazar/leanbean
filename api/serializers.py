# api/serializers.py
from rest_framework import serializers
from .models import Ingredient, Recipe, RecipeIngredient, Meal, MealIngredient, Weight, Activity, BaseWorkout, BaseWorkoutActivity, WorkoutLog, WorkoutLogActivity
from django.contrib.auth import get_user_model


class IngredientSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Ingredient
        fields = "__all__"

class MealIngredientWriteSerializer(serializers.ModelSerializer):
    """Write-only shape when creating/updating a Meal with custom ingredients."""
    class Meta:
        model = MealIngredient  # <-- rename if your model differs
        fields = ("ingredient", "quantity")


class MealIngredientReadSerializer(serializers.ModelSerializer):
    """Optional: nice read shape with embedded ingredient details."""
    ingredient = IngredientSerializer(read_only=True)

    class Meta:
        model = MealIngredient  # <-- rename if your model differs
        fields = ("ingredient", "quantity")

class RecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = ("ingredient", "quantity")

class RecipeSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    ingredients = RecipeIngredientSerializer(many=True)
    class Meta:
        model = Recipe
        fields = ("id", "user", "name", "ingredients")

    def create(self, validated):
        ings = validated.pop("ingredients", [])
        recipe = Recipe.objects.create(**validated)
        for ri in ings:
            RecipeIngredient.objects.create(recipe=recipe, **ri)
        return recipe

    def update(self, instance, validated):
        ings = validated.pop("ingredients", None)
        for k, v in validated.items():
            setattr(instance, k, v)
        instance.save()
        if ings is not None:
            instance.ingredients.all().delete()
            for ri in ings:
                RecipeIngredient.objects.create(recipe=instance, **ri)
        return instance

class MealSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    # Allow recipe-less meals
    recipe = serializers.PrimaryKeyRelatedField(
        queryset=Recipe.objects.all(),
        allow_null=True,
        required=False
    )

    # Nested custom ingredient rows (write-only)
    ingredients = MealIngredientWriteSerializer(many=True, required=False, write_only=True)

    # Optional: expose nested rows on reads (adjust source to your related_name)
    expanded_ingredients = MealIngredientReadSerializer(
        source="mealingredient_set",  # if you set related_name='ingredients', use "ingredients" here
        many=True,
        read_only=True
    )

    class Meta:
        model = Meal
        fields = (
            "id",
            "user",
            "date",
            "servings",
            "recipe",
            "ingredients",           # write-only input
            "expanded_ingredients",  # read-only output (optional)
        )

    def _replace_with_top_level_single(self, validated_data):
        """
        Convenience: allow top-level 'ingredient' + 'quantity' to be sent
        instead of 'ingredients': [{ ingredient, quantity }].
        """
        ingredient = self.initial_data.get("ingredient")
        quantity = self.initial_data.get("quantity")
        if ingredient is not None and quantity is not None and "ingredients" not in validated_data:
            validated_data["ingredients"] = [{"ingredient": ingredient, "quantity": quantity}]

    def create(self, validated):
        # Accept single-ingredient shortcut
        self._replace_with_top_level_single(validated)

        rows = validated.pop("ingredients", [])
        meal = Meal.objects.create(**validated)

        # Create through rows
        for r in rows:
            MealIngredient.objects.create(  # <-- rename model if needed
                meal=meal,
                ingredient=r["ingredient"],
                quantity=r["quantity"]
            )
        return meal

    def update(self, instance, validated):
        # Accept single-ingredient shortcut
        self._replace_with_top_level_single(validated)

        rows = validated.pop("ingredients", None)
        # Update scalar fields
        for k, v in validated.items():
            setattr(instance, k, v)
        instance.save()

        if rows is not None:
            # Clear and reinsert rows for simplicity
            # Adjust related_name if you don't have the default
            instance.mealingredient_set.all().delete()  # if related_name='ingredients', use instance.ingredients.all()
            for r in rows:
                MealIngredient.objects.create(  # <-- rename model if needed
                    meal=instance,
                    ingredient=r["ingredient"],
                    quantity=r["quantity"]
                )
        return instance

class WeightSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Weight
        fields = "__all__"

class ActivitySerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Activity
        fields = "__all__"

class BaseWorkoutActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseWorkoutActivity
        fields = ("activity", "unit", "amount", "reps")

class BaseWorkoutSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    activities = BaseWorkoutActivitySerializer(many=True, required=False)
    class Meta:
        model = BaseWorkout
        fields = ("id", "user", "name", "activities")

    def create(self, validated):
        acts = validated.pop("activities", [])
        bw = BaseWorkout.objects.create(**validated)
        for a in acts:
            BaseWorkoutActivity.objects.create(base_workout=bw, **a)
        return bw

    def update(self, instance, validated):
        acts = validated.pop("activities", None)
        for k, v in validated.items():
            setattr(instance, k, v)
        instance.save()
        if acts is not None:
            instance.activities.all().delete()
            for a in acts:
                BaseWorkoutActivity.objects.create(base_workout=instance, **a)
        return instance

class WorkoutLogActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutLogActivity
        fields = ("activity", "unit", "amount", "reps")

class WorkoutLogSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    activities = WorkoutLogActivitySerializer(many=True)
    class Meta:
        model = WorkoutLog
        fields = ("id", "user", "base_workout", "date", "activities")

    def create(self, validated):
        rows = validated.pop("activities", [])
        log = WorkoutLog.objects.create(**validated)
        for r in rows:
            WorkoutLogActivity.objects.create(log=log, **r)
        return log

    def update(self, instance, validated):
        rows = validated.pop("activities", None)
        for k, v in validated.items():
            setattr(instance, k, v)
        instance.save()
        if rows is not None:
            instance.activities.all().delete()
            for r in rows:
                WorkoutLogActivity.objects.create(log=instance, **r)
        return instance

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )