from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,  IsAuthenticated
from .serializers import (UserSerializer,FilmSerializer,ProjectBudgetSerializer,ProjectCrewSerializer,
                          ProjectDetailSerializer,CrewSerializer,ExpenseSerializer)

from .models import (Department,Film,
                        User,Project, Location,Crew,Cast,Scene,Equipment,ShootingDay,Expense)
# Create your views here.
def home (request):
    data = "hello world";
    return JsonResponse({"content":data})


#create function base view for Film Regis page

@api_view(['POST'])
@permission_classes(['AllowAny'])
def register_user(request):
    serializer = RegisterSerial(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({
            'message':"User registered successfull!"

        },status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#create a view for crew_page
#this function will check if the user is Producer or not
def is_producer(user):
    return hasattr(user, 'role') and user.role == 'producer'

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def crew (request):
    if request.method == 'GET':
        crew = Crew.objects.all()
        serializer = CrewSerializer(Crew,many=True)
        return Response(serializer.data)
    if request.method == 'POST':
        if not is_producer(request.user):
            return Response({'error':"Only producers can add crew"},
                            status=403)
        serializer = CrewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user = request.user)
            return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)
        
#create a view for crew detail page to put and to delete element
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def crew_detail(request, pk):
    try:
        member = Crew.objects.get(pk=pk)
    except Crew.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if not is_producer(request.user):
        return Response({"error": "Unauthorized"}, status=403)

    if request.method == 'PUT':
        serializer = CrewSerializer(member, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


#create a view  to manager expense

def is_accountant(user):
    return hasattr(user, 'role') and user.role == 'accountant'

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def expense(request):
    if request.method == 'GET':
        expenses = Expense.objects.all().order_by('-expense_date')
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)
    
    #create a post for new expense
    if request.method == 'POST':
        if not is_accountant(request.user):
            return Response({"detail":"Only accountants can record expenses."}, status=403)
        serializer = ExpenseSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(recorded_by = request.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#create a expense detail view
@api_view(['PUT','DELETE'])
@permission_classes([IsAuthenticated])
def expense_detail(request, pk):
    try:
        expense = Expense.objects.get(pk=pk)
    except Expense.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if not is_accountant(request.user):
        return Response({"detail":"Permission denied."},status=403)
    if request.method == "PUT":
        serializer = ExpenseSerializer(expense,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'DELETE':
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Helper view to populate the Film dropdown in the modal
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def film_dropdown_list(request):
    # Reusing Project model as 'Films' for the frontend
    films = Project.objects.all()
    # Simplified representation for dropdowns
    data = [{"film_id": f.id, "title": f.title} for f in films]
    return Response(data)


#Film page view management
def is_producer(user):
    return hasattr(user, 'role') and user.role == 'producer'

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def film_list_create(request):
    # GET: List all films
    if request.method == 'GET':
        films = Film.objects.all().order_by('-id')
        serializer = FilmSerializer(films, many=True)
        return Response(serializer.data)

    # POST: Add new film (Producer only)
    if request.method == 'POST':
        if not is_producer(request.user):
            return Response({"detail": "Only producers can add films."}, status=403)
            
        serializer = FilmSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#This will manager film page now we can be able to put and delete film inside a db
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def film_detail(request, pk):
    try:
        film = Film.objects.get(pk=pk)
    except Film.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Only producers can edit or delete
    if not is_producer(request.user):
        return Response({"detail": "Permission denied."}, status=403)

    if request.method == 'PUT':
        serializer = FilmSerializer(film, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        film.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    


#Create a view to manager film_detail_Id_page
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def film_detail(request, pk):
    try:
        project = Project.objects.get(pk=pk)
        serializer = ProjectDetailSerializer(project)
        return Response(serializer.data)
    except Project.DoesNotExist:
        return Response({"error": "Film not found"}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def film_crew_list(request, pk):
    # Filter crew members specifically for this project
    crew = Crew.objects.filter(project_id=pk)
    serializer = ProjectCrewSerializer(crew, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def film_budget_detail(request, pk):
    try:
        project = Project.objects.get(pk=pk)
        serializer = ProjectBudgetSerializer(project)
        return Response(serializer.data)
    except Project.DoesNotExist:
        return Response({"error": "Film not found"}, status=404)