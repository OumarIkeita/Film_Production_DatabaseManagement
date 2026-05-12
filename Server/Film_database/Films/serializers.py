from rest_framework import serializers
from django.db.models import Sum
from django.contrib.auth import get_user_model
from .models import (
    Project, Location, Crew, Cast, Scene, 
    Equipment, ShootingDay, Expense, Department,
)

User = get_user_model()

# --- USER SERIALIZER ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

# --- PROJECT /Film SERIALIZER ---
class FilmSerializer(serializers.ModelSerializer):
    film_id = serializers.ReadOnlyField(source='id')
    created_by_name = serializers.ReadOnlyField(source='created_by.full_name')

    class Meta:
        model = Project # Use Project consistently
        fields = [
            'film_id', 'title', 'genre', 'status', 
            'start_date', 'end_date', 'description', 'created_by_name'
        ]


# --- CREW SERIALIZER ---
class CrewSerializer(serializers.ModelSerializer):
    crew_id = serializers.ReadOnlyField(source='id')
    full_name = serializers.CharField(source='name', required=False) 
    job_title = serializers.CharField(source='role', required=False)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), 
        source='department', 
        required=False
    )
    department_name = serializers.CharField(source='get_department_display', read_only=True)
    
    class Meta:
        model = Crew
        fields = [
            'crew_id', 
            'full_name', 
            'job_title', 
            'department_id', 
            'department_name', 
            'phone', 
            'hire_date', 
            'email', 
            'day_rate'
        ]

# --- FINANCE / EXPENSE SERIALIZER ---
class ExpenseSerializer(serializers.ModelSerializer):
    film_title = serializers.ReadOnlyField(source='project.title')
    recorded_by_name = serializers.ReadOnlyField(source='recorded_by.full_name')
    # Rename project to film_id to match frontend form state
    film_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), 
        source='project'
    )

    class Meta:
        model = Expense
        fields = [
            'id', 'film_id', 'film_title', 'category', 
            'description', 'amount', 'expense_date', 'recorded_by_name'
        ]

    def to_representation(self, instance):
        repr = super().to_representation(instance)
        repr['expense_id'] = repr.pop('id') # Changes 'id' to 'expense_id' for frontend
        return repr

# --- LOCATION SERIALIZER ---
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

# --- DEPARTMENT SERIALIZER ---
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

# --- CAST SERIALIZER ---
class CastSerializer(serializers.ModelSerializer):
    project_title = serializers.ReadOnlyField(source='project.title')

    class Meta:
        model = Cast
        fields = '__all__'

# --- SCENE SERIALIZER ---
class SceneSerializer(serializers.ModelSerializer):
    project_title = serializers.ReadOnlyField(source='project.title')
    location_name = serializers.ReadOnlyField(source='location.name')
    setting_display = serializers.CharField(source='get_setting_display', read_only=True)
    time_display = serializers.CharField(source='get_time_of_day_display', read_only=True)

    class Meta:
        model = Scene
        fields = '__all__'

# --- EQUIPMENT SERIALIZER ---
class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'

# --- SHOOTING DAY SERIALIZER ---
class ShootingDaySerializer(serializers.ModelSerializer):
    project_title = serializers.ReadOnlyField(source='project.title')
    # For M2M fields, we can return the list of scene IDs
    scene_details = SceneSerializer(source='scenes', many=True, read_only=True)

    class Meta:
        model = ShootingDay
        fields = ['id', 'project', 'project_title', 'date', 'call_time', 'sunrise', 'sunset', 'scenes', 'scene_details']

# --- FINANCE / EXPENSE SERIALIZER ---
class ExpenseSerializer(serializers.ModelSerializer):
    film_title = serializers.ReadOnlyField(source='project.title')
    recorded_by_name = serializers.ReadOnlyField(source='recorded_by.full_name')
    # Rename project to film_id to match frontend form state
    film_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), 
        source='project'
    )

    class Meta:
        model = Expense
        fields = [
            'id', 'film_id', 'film_title', 'category', 
            'description', 'amount', 'expense_date', 'recorded_by_name'
        ]

    def to_representation(self, instance):
        repr = super().to_representation(instance)
        repr['expense_id'] = repr.pop('id') # Changes 'id' to 'expense_id' for frontend
        return repr

class ProjectCrewSerializer(serializers.ModelSerializer):
    assignment_id = serializers.ReadOnlyField(source='id')
    crew_member_name = serializers.ReadOnlyField(source='name')
    department_name = serializers.CharField(source='get_department_display', read_only=True)

    class Meta:
        model = Crew
        fields = ['assignment_id', 'crew_member_name', 'role', 'department_name']


# --- FILM DETAIL PAGE SERIALIZERS ---
class ProjectDetailSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.full_name')
    film_id = serializers.ReadOnlyField(source='id')
    class Meta:
        model = Project
        fields = [
            'film_id', 'title', 'genre', 'status', 'start_date', 
            'end_date', 'description', 'created_by_name'
        ]


 #Film-specific Crew Serializer (inside a film_detail_page)
class ProjectCrewSerializer(serializers.ModelSerializer):
    assignment_id = serializers.ReadOnlyField(source='id')
    crew_member_name = serializers.ReadOnlyField(source='name')
    job_title = serializers.ReadOnlyField(source='role')
    department_name = serializers.CharField(source='get_department_display', read_only=True)
    role_on_film = serializers.ReadOnlyField(source='role') # Using 'role' for both per your model

    class Meta:
        model = Crew
        fields = ['assignment_id', 'crew_member_name', 'job_title', 'department_name', 'role_on_film']

#Budget Summary Serializer
class ProjectBudgetSerializer(serializers.ModelSerializer):
    total_amount = serializers.DecimalField(source='total_budget', max_digits=15, decimal_places=2)
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['total_amount', 'total_spent']

    def get_total_spent(self, obj):
        # Calculate sum of all expenses for this project
        total = Expense.objects.filter(project=obj).aggregate(Sum('amount'))['amount__sum']
        return total or 0