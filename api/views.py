# api/views.py
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import Ingredient, Recipe, RecipeIngredient, Meal, Weight, Activity, BaseWorkout, BaseWorkoutActivity, WorkoutLog, WorkoutLogActivity
from .serializers import IngredientSerializer, RecipeSerializer, MealSerializer, WeightSerializer, ActivitySerializer, BaseWorkoutSerializer, WorkoutLogSerializer, RegisterSerializer
from django.utils.dateparse import parse_date
from django.db.models import Prefetch
import datetime
from django.utils import timezone

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return getattr(obj, "user_id", None) == request.user.id

class UserOwnedViewSetMixin:
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

# Example viewsets
class IngredientViewSet(UserOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

class RecipeViewSet(UserOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

class MealViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MealSerializer

    def get_queryset(self):
        # Always scope meals to the logged-in user
        # Keep it safe: select the recipe; prefetch the recipe's ingredients -> ingredient
        return (
            Meal.objects
            .filter(user=self.request.user)
            .select_related("recipe")
            .prefetch_related(
                Prefetch(
                    "recipe__ingredients",
                    queryset=RecipeIngredient.objects.select_related("ingredient")
                )
            )
        )

    @action(detail=False, methods=["get"], url_path="today")
    def today(self, request):
        """
        GET /api/meals/today/?date=YYYY-MM-DD
        Falls back to local today if date is missing/invalid.
        Returns a list of meals with expanded ingredients so the modal can compute macros.
        """
        date_str = request.query_params.get("date")
        try:
            date = datetime.date.fromisoformat(date_str) if date_str else timezone.localdate()
        except ValueError:
            date = timezone.localdate()

        meals_qs = self.get_queryset().filter(date=date)

        # Helper to tolerate different reverse names on Meal for "custom rows"
        def iter_meal_rows(meal):
            # Try common candidates; return the first that behaves like a RelatedManager
            for name in ["ingredients", "meal_ingredients", "mealingredient_set", "items", "mealitem_set"]:
                rel = getattr(meal, name, None)
                if rel is not None and hasattr(rel, "all"):
                    return rel.select_related("ingredient").all()
            return []

        data = []
        for meal in meals_qs:
            servings = float(getattr(meal, "servings", 1) or 1)

            ing_rows = []

            # 1) Base recipe ingredients (scale by meal servings)
            if meal.recipe:
                # Using the prefetched recipe__ingredients -> ingredient
                for ri in getattr(meal.recipe, "ingredients", []).all():
                    ing = ri.ingredient
                    ing_rows.append({
                        "ingredient": {
                            "id": ing.id,
                            "name": ing.name,
                            "serving_size": float(ing.serving_size),
                            "serving_size_unit": ing.serving_size_unit,
                            "calories": float(ing.calories),
                            "carbs": float(ing.carbs),
                            "fat": float(ing.fat),
                            "protein": float(ing.protein),
                        },
                        # scale by servings so the modal totals match what you see in charts
                        "quantity": float(ri.quantity) * servings,
                    })

            # 2) Per-meal custom rows (do NOT scale; they’re already per meal)
            for mi in iter_meal_rows(meal):
                ing = mi.ingredient
                ing_rows.append({
                    "ingredient": {
                        "id": ing.id,
                        "name": ing.name,
                        "serving_size": float(ing.serving_size),
                        "serving_size_unit": ing.serving_size_unit,
                        "calories": float(ing.calories),
                        "carbs": float(ing.carbs),
                        "fat": float(ing.fat),
                        "protein": float(ing.protein),
                    },
                    "quantity": float(getattr(mi, "quantity", 0) or 0),
                })

            data.append({
                "id": meal.id,
                "servings": servings,
                "recipe": {"id": meal.recipe.id, "name": meal.recipe.name} if meal.recipe else None,
                "ingredients": ing_rows,
            })

        return Response(data)

class WeightViewSet(UserOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Weight.objects.all()
    serializer_class = WeightSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        date = self.request.query_params.get("date")
        if date:
            qs = qs.filter(date=date)
        return qs.order_by("date")

class ActivityViewSet(UserOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

class BaseWorkoutViewSet(UserOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = BaseWorkout.objects.all()
    serializer_class = BaseWorkoutSerializer

class WorkoutLogViewSet(UserOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = WorkoutLog.objects.select_related("base_workout").prefetch_related("activities").all()
    serializer_class = WorkoutLogSerializer

    @action(detail=False, methods=["get"])
    def list_by_date(self, request):
        date = request.query_params.get("date")
        qs = self.get_queryset()
        if date:
            qs = qs.filter(date=date)
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)

User = get_user_model()

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = [] 

class DailyMacrosView(APIView):
    permission_classes = [IsAuthenticated]

    def _iter_related_rows(self, owner, candidate_attrs):
        """
        Try a list of attribute names on `owner` and yield rows from the first
        attribute that behaves like a RelatedManager (has .all()).
        """
        for name in candidate_attrs:
            rel = getattr(owner, name, None)
            if rel is not None and hasattr(rel, "all"):
                yield from rel.all()
                return
        # Nothing matched -> yield nothing
        return

    def _recipe_rows(self, recipe):
        # Common names for Recipe -> RecipeIngredient through relation
        #   - recipe.ingredients (most common)
        #   - recipe.recipe_ingredients
        #   - recipe.recipeingredient_set (default if no related_name)
        candidates = ["ingredients", "recipe_ingredients", "recipeingredient_set"]
        yield from self._iter_related_rows(recipe, candidates)

    def _meal_rows(self, meal):
        # Common names for Meal -> MealIngredient through relation
        #   - meal.ingredients (custom related_name)
        #   - meal.meal_ingredients
        #   - meal.mealingredient_set (default if no related_name)
        #   - meal.items / meal.mealitem_set (alternate naming)
        candidates = ["ingredients", "meal_ingredients", "mealingredient_set", "items", "mealitem_set"]
        yield from self._iter_related_rows(meal, candidates)

    def get(self, request):
        # Parse date
        date_str = request.query_params.get("date")
        try:
            date_obj = datetime.date.fromisoformat(date_str) if date_str else datetime.date.today()
        except ValueError:
            return Response({"detail": "Invalid date format, expected YYYY-MM-DD."}, status=400)

        # Base queryset (no prefetch; we’ll traverse relations directly)
        meals = (
            Meal.objects
            .filter(user=request.user, date=date_obj)
            .select_related("recipe")
        )

        totals = {
            "total_calories": 0.0,
            "total_carbs": 0.0,
            "total_fat": 0.0,
            "total_protein": 0.0,
        }

        def add_macros(qty, ing):
            # Guard against missing/nullable fields
            cals = float(getattr(ing, "calories", 0) or 0)
            carbs = float(getattr(ing, "carbs", 0) or 0)
            fat = float(getattr(ing, "fat", 0) or 0)
            protein = float(getattr(ing, "protein", 0) or 0)

            totals["total_calories"] += qty * cals
            totals["total_carbs"] += qty * carbs
            totals["total_fat"] += qty * fat
            totals["total_protein"] += qty * protein

        for meal in meals:
            servings = float(getattr(meal, "servings", 1) or 1)

            # 1) Contribution from the base recipe (if present), scaled by servings
            if meal.recipe:
                for ri in self._recipe_rows(meal.recipe):
                    ing = getattr(ri, "ingredient", None)
                    quantity = float(getattr(ri, "quantity", 0) or 0)
                    if ing is not None and quantity:
                        add_macros(quantity * servings, ing)

            # 2) Contribution from custom meal rows (per‑meal overrides/extra ingredients)
            for mi in self._meal_rows(meal):
                ing = getattr(mi, "ingredient", None)
                quantity = float(getattr(mi, "quantity", 0) or 0)
                if ing is not None and quantity:
                    add_macros(quantity, ing)

        return Response(totals, status=200)