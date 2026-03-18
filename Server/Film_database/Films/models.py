from django.db import models
from django.contrib.auth.models import User
# Create your models here.
#this Table will be about film project

class Project(models.Model):
    Project_Types = [('Movie','Feature Film'),('SHORT','Short Film'),('COMMERCIAL','Commercial'),('SERIES','TV Series')]
    STATUS = [('PRE','Pre_Production'), ('PRO','Production'), ('POST','Post-Production'),('DONE','Released')]
    title = models.CharField(max_length=255)
    project_type = models.CharField(max_length=10,choices=Project_Types)
    status = models.CharField(max_length=10, choices=STATUS,default='PRE')
    total_budget = models.DecimalField(max_digits=15, decimal_places=2)
    production_compony = models.CharField(max_length=255)


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
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="crew_members")
    name = models.CharField(max_length=255)
    department =models.CharField(max_length=10, choices=DEPTS)
    role = models.CharField(max_length=100)
    email = models.EmailField()
    day_rate = models.DecimalField(max_digits=10, decimal_places=2)


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
    project = models.ForeignKey(Project,on_delete=models.CASCADE)
    item_description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100)
    date_spent = models.DateField(auto_now_add=True)


    def __str__(self):
        return f"{self.item_description}: ${self.amount}"
