from django.urls import path
from .views import MyTokenObtainPairView, register_user
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    #path('api/home',views.home ,name="home" ),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Auth
    path('auth/register/', views.register_user, name='register'),
    
    # Crew Page
    path('crew/', views.crew_list, name='crew-list'),
    path('crew/<int:pk>/', views.crew_detail, name='crew-detail'),
    
    # Expenses Page
    path('expenses/', views.expense_list, name='expense-list'),
    path('expenses/<int:pk>/', views.expense_detail, name='expense-detail'),
    
    # Films Page
    path('films/', views.film_list_create, name='film-list'),
    path('films/<int:pk>/', views.film_crud, name='film-crud'), # Handles GET, PUT, DELETE
    
    # Film Detail Child Endpoints
    path('films/<int:pk>/crew/', views.film_crew_list, name='film-crew-sublist'),
    path('films/<int:pk>/budget/', views.film_budget_detail, name='film-budget-detail'),

    path('stats/summary/', views.stats_summary, name='stats-summary'),
    
    # Dropdowns
    path('films/dropdown/', views.film_dropdown_list, name='film-dropdown'),

    #department
    path('departments/', views.department_list, name='department-list'),

    #STATE URL
    path('stats/queries/', views.stats_queries, name='stats-queries'),
    
    #dashboard url
    path('stats/summary/', views.stats_summary, name='stats-summary'),
    
    #assign urls
    path('film-crew/', views.assign_film_crew, name='assign-film-crew'),

]
