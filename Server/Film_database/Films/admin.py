from django.contrib import admin
from .models import (
    Crew, User, Project,Location,Cast,Scene,Equipment,
    ShootingDay,Expense,Department,
)

# Register your models here.
admin.site.register(User),
admin.site.register(Project),
admin.site.register(Location),
admin.site.register(Cast),
admin.site.register(Crew),
admin.site.register(Department),
admin.site.register(Scene),
admin.site.register(ShootingDay),
admin.site.register(Equipment),
admin.site.register(Expense),