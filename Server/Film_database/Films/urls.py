from django.urls import path
from . import views
urlpatterns = [
    path('api/home',views.home ,name="home" ),
]
