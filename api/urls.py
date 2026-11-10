from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterView,
    IngredientViewSet,
    RecipeViewSet,
    MealViewSet,
    DailyMacrosView,
    WeightViewSet,
    ActivityViewSet,
    BaseWorkoutViewSet,
    WorkoutLogViewSet,
)

router = DefaultRouter()
router.register(r"ingredients", IngredientViewSet, basename="ingredient")
router.register(r"recipes", RecipeViewSet, basename="recipe")
router.register(r"meals", MealViewSet, basename="meal")
router.register(r"weights", WeightViewSet, basename="weight")
router.register(r"activities", ActivityViewSet, basename="activity")
router.register(r"workouts", BaseWorkoutViewSet, basename="workout")
router.register(r"workouts/log", WorkoutLogViewSet, basename="workoutlog")

urlpatterns = [
    path("daily-macros/", DailyMacrosView.as_view()),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("", include(router.urls)),
]