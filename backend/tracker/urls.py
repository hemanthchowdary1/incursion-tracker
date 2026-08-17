from django.urls import path
from . import views

urlpatterns = [
    path('titles/', views.get_all_titles, name='get-titles'),
    path('auth/request-otp/', views.request_otp, name='request-otp'),
    path('auth/register/', views.verify_and_register, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('progress/sync/', views.sync_progress, name='sync-progress'),
    path('marvel-news/', views.get_marvel_news, name='marvel-news'),
]