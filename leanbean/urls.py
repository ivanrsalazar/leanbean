from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import frontend

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth (JWT)
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # App API
    path("api/", include("api.urls")),

    # Built React app and its client-side routes. Keep this last.
    re_path(r"^(?P<path>.*)$", frontend, name="frontend"),
]
