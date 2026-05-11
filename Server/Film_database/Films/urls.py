from django.urls import path
from . import views
urlpatterns = [
    path('api/home',views.home ,name="home" ),

    #register page urls
    path('register/', views.register_user, name='registe_user'),

    #Crew page urls
    path('crew/', views.crew, name="crew_list"),
    path('crew/<int:pk>/', views.crew_detail, name='crew-detail'),

    #expense page  urls
    path('expense/', views.expense, name="expense-list"),
    path('expense/<int:pk>/', views.expense_detail, name="expense-detail"),
    path('films/', views.film_dropdown_list, name='film-dropdown'),

    #Film page urls
    path('films/', views.film_list_create, name='film-list'), #api.get and api.pot
    path('films/<int:pk>/', views.film_detail, name='film-detail'), #api.put and api.delete
    

]
