import os
import django
import random
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Film_database.settings')
django.setup()

from Films.models import Project

def seed_database():
    titles = [
        "The Midnight", "Silent Echoes", "Beyond the Horizon", "Neon Streets", 
        "Shadow of Rome", "Galactic Voyage", "Urban Legend", "Crimson Tide", 
        "Desert Rose", "Frozen Heart", "Emerald Forest", "Final Frontier", 
        "Golden Gate", "Hidden Valley", "Iron Fist", "Justice League", 
        "Kingdom Come", "Lost Souls", "Mystery Island", "Night Watch"
    ]
    
    suffixes = ["I", "II", "III", "IV", "V", "Returns", "Origins", "Rebirth", "Legacy", "Chronicles"]
    
    genres = ["Action", "Drama", "Sci-Fi", "Horror", "Documentary", "Comedy", "Thriller", "Romance"]
    
    statuses = ['development', 'pre_production', 'production', 'post_production', 'completed']
    
    types = ['Movie', 'SHORT', 'COMMERCIAL', 'SERIES']

    print(f"Starting to seed 200 films...")

    for i in range(200):
        # Generate a semi-unique title
        base_title = random.choice(titles)
        suffix = random.choice(suffixes) if random.random() > 0.7 else ""
        title = f"{base_title} {suffix} {i}".strip()

        # Generate realistic dates
        start = datetime.now() + timedelta(days=random.randint(-365, 365))
        end = start + timedelta(days=random.randint(30, 180))

        Project.objects.create(
            title=title,
            genre=random.choice(genres),
            status=random.choice(statuses),
            project_type=random.choice(types),
            start_date=start.date(),
            end_date=end.date(),
            total_budget=random.randint(50000, 5000000),
            production_compony="CineProd Studios",
            description=f"This is an automated description for the production of {title}."
        )

    print("Successfully seeded 200 films!")

if __name__ == '__main__':
    seed_database()