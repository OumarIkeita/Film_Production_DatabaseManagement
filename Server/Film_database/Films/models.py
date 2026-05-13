from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import User
#create table(model) for a user
class User(AbstractUser):
    ROLE_CHOICES = [
        ('crew_member', 'Crew Member'),
        ('producer', 'Producer'),
        ('accountant', 'Accountant'),
    ]
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='crew_member')

    # Fix: ensure email is unique for login purposes
    email = models.EmailField(unique=True)

#this Table will be about film project
class Project(models.Model):
    Project_Types = [('Movie','Feature Film'),('SHORT','Short Film'),('COMMERCIAL','Commercial'),('SERIES','TV Series')]
    STATUS = [
        ('development', 'Development'),
        ('pre_production', 'Pre-Production'),
        ('production', 'Production'),
        ('post_production', 'Post-Production'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=255)
    # New fields needed by the frontend:
    genre = models.CharField(max_length=100, blank=True, null=True) 
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    project_type = models.CharField(max_length=10, choices=Project_Types)
    status = models.CharField(max_length=20, choices=STATUS, default='development')
    total_budget = models.DecimalField( max_digits=15, 
        decimal_places=2, 
        default=0,     
        blank=True, 
        null=True )
    production_compony = models.CharField(max_length=255, blank=True, null=True)
    
    # Track which user created this
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.title
#LOCATION WHERE YOU SHOOT
class Location(models.Model):
    name= models.CharField(max_length=255)
    address = models.TextField()
    contact_infos = models.CharField(max_length=255)
    permit_status = models.BooleanField(default=False)
    rental_cost = models.DecimalField(max_digits=10, decimal_places=2 , default=0)

    def __str__(self):
        return self.name
    
#CREW STAFF

class Crew(models.Model):
    DEPTS = [('DIR','Directing'), ('CAMERA','camera'), ('ART','Art Dept'),('SOUND','Sound'),('GRIP','Grip/Electric')]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="crew_members",
                                null=True, blank=True)
    name = models.CharField(max_length=255)
    department =models.CharField(max_length=10, choices=DEPTS)
    role = models.CharField(max_length=100)
    email = models.EmailField(null=True, blank=True)
    day_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    hire_date = models.DateField(blank=True, null=True)


    def __str__(self):
        return f"{self.name} ({self.role})"
    


#cast (THE ACTORS CHARACTERS)

class Cast(models.Model):
    project = models.ForeignKey(Project, on_delete = models.CASCADE)
    character_name = models.CharField(max_length=255)
    actor_name = models.CharField(max_length=255)
    agency_contact = models.CharField(max_length=255, blank=True)
    is_lead = models.BooleanField(default=False)
    

    def __str__(self):
        return f"{self.character_name} - {self.actor_name}"
    



#Scene(Script breakdown)

class Scene(models.Model):
    SETTING = [('INTERIOR','Interior'), ('EXTERIOR','Exterior')]
    TIME = [('DAY','Day'), ('NIGHT','Night')]

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    scene_number = models.IntegerField()
    title = models.CharField(max_length=255)
    setting = models.CharField(max_length=10, choices=SETTING)
    time_of_day = models.CharField(max_length=5, choices=TIME)
    script_page = models.FloatField()
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Scene {self.scene_number}: {self.title}"

#equipment inventory table(tracking)

class Equipment(models.Model):
    item_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, unique=True)
    status= models.CharField(max_length=50, default="available")
    daily_rental_value = models.DecimalField(max_digits=10,decimal_places=2)

    def __str__(self):
        return self.item_name


#SHOOTING DAY (Schedule/ call sheet)
class ShootingDay(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    date = models.DateField()
    call_time = models.TimeField()
    sunrise=models.TimeField(null=True, blank=True)
    sunset = models.TimeField(null=True, blank=True)
    scenes = models.ManyToManyField(Scene)


    def __str__(self):
        return f"Day {self.date} - {self.project.title}"
    




#FINANCE OR BUDGET TRACKING

class Expense(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="expenses")
    item_description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100)
    date_spent = models.DateField(auto_now_add=True)


    def __str__(self):
        return f"{self.item_description}: ${self.amount}"

#create a department table
class Department(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


#assign filmCrew models
class FilmCrew(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="assignments")
    crew = models.ForeignKey(Crew, on_delete=models.CASCADE, related_name="film_assignments")
    role_on_film = models.CharField(max_length=100, blank=True, null=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevents assigning the same person to the same film twice
        unique_together = ('project', 'crew') 

    def __str__(self):
        return f"{self.crew.name} on {self.project.title}"