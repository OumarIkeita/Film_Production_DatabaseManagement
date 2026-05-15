from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F, Q
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


from .serializers import (
    UserSerializer, FilmSerializer, ProjectBudgetSerializer, 
    ProjectCrewSerializer, ProjectDetailSerializer, 
    CrewSerializer, ExpenseSerializer,FilmCrewSerializer
)
from .models import (
    Department, User, Project, Location, FilmCrew,
    Crew, Cast, Scene, Equipment, ShootingDay, Expense
)

# Helper functions for Permissions
def is_producer(user):
    return hasattr(user, 'role') and user.role == 'producer'

def is_accountant(user):
    return hasattr(user, 'role') and user.role == 'accountant'

# --- AUTH ---
@api_view(['POST'])
@permission_classes([AllowAny]) # Fixed: Removed quotes, used list
def register_user(request):
    serializer = UserSerializer(data=request.data) # Fixed: Name matched your import
    if serializer.is_valid():
        serializer.save()
        return Response({'message': "User registered successfully!"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- CREW PAGE ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def crew_list(request): # Renamed to avoid confusion
    if request.method == 'GET':
        crew_members = Crew.objects.all()
        serializer = CrewSerializer(crew_members, many=True) # Fixed: variable casing
        return Response(serializer.data)
    
    if request.method == 'POST':
        if not is_producer(request.user):
            return Response({'error': "Only producers can add crew"}, status=403)
        serializer = CrewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() # Note: Ensure Crew model has fields matching request.data
            return Response(serializer.data, status=status.HTTP_201_CREATED) # Fixed: Correct status
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

# --- EXPENSES ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def expense_list(request):
    if request.method == 'GET':
        expenses = Expense.objects.all().order_by('-date_spent')
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        if not is_accountant(request.user):
            return Response({"detail": "Only accountants can record expenses."}, status=403)
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def expense_detail(request, pk):
    try:
        expense = Expense.objects.get(pk=pk)
    except Expense.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if not is_accountant(request.user):
        return Response({"detail": "Permission denied."}, status=403)
    
    if request.method == "PUT":
        serializer = ExpenseSerializer(expense, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    if request.method == 'DELETE':
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- FILMS / PROJECTS ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def film_list_create(request):
    if request.method == 'GET':
        # Change Film.objects to Project.objects
        films = Project.objects.all().order_by('-id') 
        serializer = FilmSerializer(films, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if not is_producer(request.user):
            return Response({"detail": "Only producers can add films."}, status=403)
        serializer = FilmSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def film_crud(request, pk): # Renamed to avoid naming conflict
    try:
        project = Project.objects.get(pk=pk)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProjectDetailSerializer(project)
        return Response(serializer.data)

    if not is_producer(request.user):
        return Response({"detail": "Permission denied."}, status=403)

    if request.method == 'PUT':
        serializer = FilmSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- FILM CHILD DATA ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def film_crew_list(request, pk):
    crew = FilmCrew.objects.filter(project_id=pk)
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


#login 
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to the token payload (optional)
        token['role'] = user.role
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra data to the JSON response sent to the frontend
        data['user'] = {
            'username': self.user.username,
            'full_name': self.user.full_name,
            'role': self.user.role,
        }
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
def stats_summary(request):
    data = {
        "total_films": Project.objects.count(),
        "total_crew": Crew.objects.count(),
        "total_expenses": Expense.objects.aggregate(Sum('amount'))['amount__sum'] or 0,
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def film_dropdown_list(request):
    films = Project.objects.all()
    # Frontend expects film_id and title
    data = [{"film_id": f.id, "title": f.title} for f in films]
    return Response(data)

#department
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_list(request):
    depts = Department.objects.all()
    # You can use a serializer or return a manual list
    data = [{"department_id": d.id, "name": d.name} for d in depts]
    return Response(data)



#STATE VIEW

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_queries(request):
    # 1. Budget Summary
    # We annotate each project with the sum of its expenses
    budget_summary_qs = Project.objects.annotate(
        spent=Sum('expenses__amount')
    ).all()
    
    budget_summary = []
    for p in budget_summary_qs:
        spent = p.spent or 0
        budget_summary.append({
            "Film": p.title,
            "Status": p.get_status_display(),
            "Budget": f"${p.total_budget:,.2f}",
            "Spent": f"${spent:,.2f}",
            "Remaining": f"${(p.total_budget - spent):,.2f}"
        })

    # 2. Over-Budget Films
    over_budget = [
        item for item in budget_summary 
        if float(item["Spent"].replace('$', '').replace(',', '')) > 
           float(item["Budget"].replace('$', '').replace(',', ''))
    ]
    # Add an "Overspend" key for the frontend column
    for item in over_budget:
        b = float(item["Budget"].replace('$', '').replace(',', ''))
        s = float(item["Spent"].replace('$', '').replace(',', ''))
        item["Overspend"] = f"${(s - b):,.2f}"

    # 3. Most Active Crew
    # Ranked by how many projects they are assigned to
    active_crew_qs = Crew.objects.values('name', 'role', 'department').annotate(
        film_count=Count('project')
    ).order_by('-film_count')[:20]

    active_crew = [{
        "Name": c['name'],
        "Job Title": c['role'],
        "Department": c['department'],
        "Films": c['film_count']
    } for c in active_crew_qs]

    # 4. Department Workload
    dept_workload_qs = Crew.objects.values('department').annotate(
        crew_count=Count('id', distinct=True),
        films_involved=Count('project', distinct=True),
        assignments=Count('id')
    )
    
    department_workload = [{
        "Department": d['department'],
        "Crew": d['crew_count'],
        "Films Involved": d['films_involved'],
        "Assignments": d['assignments']
    } for d in dept_workload_qs]

    # 5. Films With No Crew
    uncrewed_qs = Project.objects.annotate(crew_count=Count('crew_members')).filter(crew_count=0)
    uncrewed_films = [{
        "Film": p.title,
        "Status": p.get_status_display(),
        "Start Date": p.start_date.strftime('%Y-%m-%d') if p.start_date else "TBD",
        "Created By": p.created_by.full_name if p.created_by else "System"
    } for p in uncrewed_qs]

    # 6. Expense Breakdown
    expense_qs = Expense.objects.values('project__title', 'category').annotate(
        count=Count('id'),
        total=Sum('amount'),
        average=Avg('amount')
    ).order_by('project__title')

    expense_breakdown = [{
        "Film": e['project__title'],
        "Category": str(e['category']).replace('_', ' ').title(),
        "Count": e['count'],
        "Total": f"${(e['total'] or 0):,.2f}",
        "Avg": f"${(e['average'] or 0):,.2f}"
    } for e in expense_qs]

    return Response({
        "budget_summary": budget_summary,
        "over_budget": over_budget,
        "active_crew": active_crew,
        "department_workload": department_workload,
        "uncrewed_films": uncrewed_films,
        "expense_breakdown": expense_breakdown
    })

#Dashboard view 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_summary(request):
    user = request.user

    if is_producer(user):
        # 1. Total Films produced by THIS user
        user_projects = Project.objects.filter(created_by=user)
        total_films = user_projects.count()

        # 2. Active Films produced by THIS user
        active_films = user_projects.filter(status='production').count()

        # 3. Total Unique Crew working on THIS user's films
        # FIXED: Changed 'filmcrew' to 'film_assignments' based on your error choices
        total_crew = Crew.objects.filter(
            film_assignments__project__created_by=user
        ).distinct().count()

        # 4. Total Expenses for THIS user's films
        total_expenses = Expense.objects.filter(
            project__created_by=user
        ).aggregate(Sum('amount'))['amount__sum'] or 0

    else:
        # Logic for Accountants or Admins: See everything
        total_films = Project.objects.count()
        active_films = Project.objects.filter(status='production').count()
        total_crew = Crew.objects.count()
        total_expenses = Expense.objects.aggregate(Sum('amount'))['amount__sum'] or 0

    return Response({
        "total_films": total_films,
        "active_films": active_films,
        "total_crew": total_crew,
        "total_expenses": total_expenses
    })
# handleAssign  view 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_film_crew(request):
    if not is_producer(request.user):
        return Response({"detail": "Only producers can assign crew."}, status=403)
        
    serializer = FilmCrewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # This returns specific errors (e.g., "Crew member already assigned to this film")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)