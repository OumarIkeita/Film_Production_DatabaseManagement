# Film Production Management System — Term Project Report

---

## Project Members and Their Contributions

| Name | Student ID | Role & Contributions |
|------|-----------|----------------------|
| Ahmad | *(your ID)* | Developed the full-stack application: React/Next.js frontend (UI pages, routing, auth context, API integration), Django REST API backend, JWT authentication, database connection and deployment |
| Oumar Ikeita | *(Oumar's ID)* | Developed ERD design, DDL schema, DML seed data, and SQL queries (procedures, functions, triggers) |
| *(Member 3)* | *(ID)* | *(contribution)* |

> **Note:** Only one member has submitted this report on behalf of the group.

---

## 1. Introduction

### System Overview

The **Film Production Management System (CinePROD)** is a web-based database application designed to streamline and centralize the management of film production operations. The system manages all aspects of a production company's workflow — from tracking active film projects and managing crew assignments to recording expenses and generating analytical statistics.

### Key Assumptions

- A **User** can have one of three roles: **Producer**, **Accountant**, or **Crew Member**. Role-based access control (RBAC) is enforced throughout the system.
- A **Producer** can create and manage film projects, add and assign crew members.
- An **Accountant** can record and manage project expenses.
- A **Crew Member** has read-only access to view projects and statistics.
- Each **Project** (Film) can have multiple crew members, scenes, shooting days, and expenses.
- A **Crew Member** can be assigned to multiple films through a junction table (`FilmCrew`), preventing duplicate assignments.
- The system uses **JWT (JSON Web Tokens)** for stateless authentication.
- The backend runs on **Django REST Framework** and the frontend on **Next.js 15**.
- The database is **SQLite** (for development); the schema is fully portable to PostgreSQL for production.

---

## 2. Database

### 2.1 ER Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────┐
│    USER     │         │    PROJECT       │         │   LOCATION   │
│─────────────│         │──────────────────│         │──────────────│
│ PK id       │1──────N │ PK id            │N──────1 │ PK id        │
│ username    │creates  │ title            │uses     │ name         │
│ email       │         │ genre            │         │ address      │
│ full_name   │         │ description      │         │ contact_info │
│ role        │         │ status           │         │ permit_status│
│ password    │         │ project_type     │         │ rental_cost  │
└─────────────┘         │ total_budget     │         └──────────────┘
                        │ start_date       │                 ^
                        │ end_date         │                 | located at
                        │ production_co    │                 |
                        │ FK created_by    │         ┌──────────────┐
                        └──────────────────┘         │    SCENE     │
                               │  │  │               │──────────────│
               ┌───────────────┘  │  └──────────┐   │ PK id        │
               │ 1:N              │1:N           │   │ scene_number │
               v                  v              v   │ title        │
        ┌────────────┐    ┌─────────────┐  ┌────────│ setting      │
        │  EXPENSE   │    │SHOOTING_DAY │  │        │ time_of_day  │
        │────────────│    │─────────────│  │        │ script_page  │
        │ PK id      │    │ PK id       │  │        │ FK project   │
        │ category   │    │ date        │  │        │ FK location  │
        │ description│    │ call_time   │  │        └──────────────┘
        │ amount     │    │ sunrise     │  │
        │ expense_dt │    │ sunset      │  │ M:N (via ShootingDay_scenes)
        │ FK project │    │ FK project  │──┘
        │ FK rec_by  │    └─────────────┘
        └────────────┘

        ┌──────────────┐         ┌─────────────┐         ┌───────────────┐
        │     CREW     │         │  FILM_CREW  │         │  DEPARTMENT   │
        │──────────────│         │─────────────│         │───────────────│
        │ PK id        │1──────N │ PK id       │         │ PK id         │
        │ name         │assigned │ FK project  │         │ name          │
        │ department   │via      │ FK crew     │         └───────────────┘
        │ role         │junction │ role_on_film│
        │ email        │         │ assigned_at │
        │ day_rate     │         └─────────────┘
        │ phone        │
        │ hire_date    │         ┌──────────────┐         ┌──────────────┐
        │ FK project   │         │     CAST     │         │  EQUIPMENT   │
        └──────────────┘         │──────────────│         │──────────────│
                                 │ PK id        │         │ PK id        │
                                 │ character_nm │         │ item_name    │
                                 │ actor_name   │         │ category     │
                                 │ agency_cont  │         │ serial_num   │
                                 │ is_lead      │         │ status       │
                                 │ FK project   │         │ daily_rental │
                                 └──────────────┘         └──────────────┘
```

**Relationships Summary:**
- `User` → `Project` : One-to-Many (a user creates many projects)
- `Project` → `Expense` : One-to-Many (a project has many expenses)
- `Project` → `Scene` : One-to-Many
- `Project` → `ShootingDay` : One-to-Many
- `ShootingDay` ↔ `Scene` : Many-to-Many (via junction table)
- `Project` ↔ `Crew` : Many-to-Many (via `FilmCrew` junction table)
- `Scene` → `Location` : Many-to-One

---

### 2.2 Data Definition Language (DDL)

Below is the equivalent SQL DDL generated from the Django models. Django auto-generates this via `makemigrations` / `migrate`.

```sql
-- ============================================================
-- TABLE: films_user  (Custom User extending AbstractUser)
-- ============================================================
CREATE TABLE "films_user" (
    "id"          INTEGER     NOT NULL PRIMARY KEY AUTOINCREMENT,
    "password"    VARCHAR(128) NOT NULL,
    "username"    VARCHAR(150) NOT NULL UNIQUE,
    "email"       VARCHAR(254) NOT NULL UNIQUE,
    "full_name"   VARCHAR(255) NOT NULL,
    "role"        VARCHAR(20)  NOT NULL DEFAULT 'crew_member'
                  CHECK("role" IN ('crew_member','producer','accountant')),
    "is_active"   BOOLEAN     NOT NULL DEFAULT 1,
    "is_staff"    BOOLEAN     NOT NULL DEFAULT 0,
    "date_joined" DATETIME    NOT NULL
);

-- ============================================================
-- TABLE: films_project
-- ============================================================
CREATE TABLE "films_project" (
    "id"                 INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title"              VARCHAR(255) NOT NULL,
    "genre"              VARCHAR(100),
    "description"        TEXT,
    "start_date"         DATE,
    "end_date"           DATE,
    "project_type"       VARCHAR(10)  NOT NULL
                         CHECK("project_type" IN ('Movie','SHORT','COMMERCIAL','SERIES')),
    "status"             VARCHAR(20)  NOT NULL DEFAULT 'development'
                         CHECK("status" IN (
                             'development','pre_production','production',
                             'post_production','completed','cancelled')),
    "total_budget"       DECIMAL(15,2) DEFAULT 0,
    "production_compony" VARCHAR(255),
    "created_by_id"      INTEGER REFERENCES "films_user"("id") ON DELETE SET NULL
);

-- ============================================================
-- TABLE: films_location
-- ============================================================
CREATE TABLE "films_location" (
    "id"            INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name"          VARCHAR(255) NOT NULL,
    "address"       TEXT         NOT NULL,
    "contact_infos" VARCHAR(255) NOT NULL,
    "permit_status" BOOLEAN      NOT NULL DEFAULT 0,
    "rental_cost"   DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- ============================================================
-- TABLE: films_crew
-- ============================================================
CREATE TABLE "films_crew" (
    "id"         INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name"       VARCHAR(255) NOT NULL,
    "department" VARCHAR(10)  NOT NULL
                 CHECK("department" IN ('DIR','CAMERA','ART','SOUND','GRIP')),
    "role"       VARCHAR(100) NOT NULL,
    "email"      VARCHAR(254),
    "day_rate"   DECIMAL(10,2),
    "phone"      VARCHAR(20),
    "hire_date"  DATE,
    "project_id" INTEGER REFERENCES "films_project"("id") ON DELETE CASCADE
);

-- ============================================================
-- TABLE: films_scene
-- ============================================================
CREATE TABLE "films_scene" (
    "id"           INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scene_number" INTEGER      NOT NULL,
    "title"        VARCHAR(255) NOT NULL,
    "setting"      VARCHAR(10)  NOT NULL CHECK("setting" IN ('INTERIOR','EXTERIOR')),
    "time_of_day"  VARCHAR(5)   NOT NULL CHECK("time_of_day" IN ('DAY','NIGHT')),
    "script_page"  REAL         NOT NULL,
    "project_id"   INTEGER      NOT NULL REFERENCES "films_project"("id") ON DELETE CASCADE,
    "location_id"  INTEGER      REFERENCES "films_location"("id") ON DELETE SET NULL
);

-- ============================================================
-- TABLE: films_cast
-- ============================================================
CREATE TABLE "films_cast" (
    "id"             INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "character_name" VARCHAR(255) NOT NULL,
    "actor_name"     VARCHAR(255) NOT NULL,
    "agency_contact" VARCHAR(255) NOT NULL DEFAULT '',
    "is_lead"        BOOLEAN      NOT NULL DEFAULT 0,
    "project_id"     INTEGER      NOT NULL REFERENCES "films_project"("id") ON DELETE CASCADE
);

-- ============================================================
-- TABLE: films_equipment
-- ============================================================
CREATE TABLE "films_equipment" (
    "id"                INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_name"         VARCHAR(255) NOT NULL,
    "category"          VARCHAR(100) NOT NULL,
    "serial_number"     VARCHAR(100) NOT NULL UNIQUE,
    "status"            VARCHAR(50)  NOT NULL DEFAULT 'available',
    "daily_rental_value" DECIMAL(10,2) NOT NULL
);

-- ============================================================
-- TABLE: films_shootingday
-- ============================================================
CREATE TABLE "films_shootingday" (
    "id"         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date"       DATE    NOT NULL,
    "call_time"  TIME    NOT NULL,
    "sunrise"    TIME,
    "sunset"     TIME,
    "project_id" INTEGER NOT NULL REFERENCES "films_project"("id") ON DELETE CASCADE
);

-- ============================================================
-- TABLE: films_shootingday_scenes  (M2M Junction)
-- ============================================================
CREATE TABLE "films_shootingday_scenes" (
    "id"            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shootingday_id" INTEGER NOT NULL REFERENCES "films_shootingday"("id") ON DELETE CASCADE,
    "scene_id"       INTEGER NOT NULL REFERENCES "films_scene"("id") ON DELETE CASCADE,
    UNIQUE ("shootingday_id", "scene_id")
);

-- ============================================================
-- TABLE: films_expense
-- ============================================================
CREATE TABLE "films_expense" (
    "id"               INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category"         VARCHAR(100) NOT NULL,
    "description"      VARCHAR(255) NOT NULL,
    "amount"           DECIMAL(12,2) NOT NULL,
    "expense_date"     DATE,
    "project_id"       INTEGER NOT NULL REFERENCES "films_project"("id") ON DELETE CASCADE,
    "recorded_by_id"   INTEGER REFERENCES "films_user"("id") ON DELETE SET NULL
);

-- ============================================================
-- TABLE: films_department
-- ============================================================
CREATE TABLE "films_department" (
    "id"   INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" VARCHAR(100) NOT NULL
);

-- ============================================================
-- TABLE: films_filmcrew  (Crew-to-Project junction with extra data)
-- ============================================================
CREATE TABLE "films_filmcrew" (
    "id"           INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role_on_film" VARCHAR(100),
    "assigned_at"  DATETIME     NOT NULL,
    "project_id"   INTEGER      NOT NULL REFERENCES "films_project"("id") ON DELETE CASCADE,
    "crew_id"      INTEGER      NOT NULL REFERENCES "films_crew"("id") ON DELETE CASCADE,
    UNIQUE ("project_id", "crew_id")   -- prevents duplicate assignments
);
```

---

### 2.3 Data Manipulation Language (DML)

```sql
-- ============================================================
-- INSERT: Sample Users
-- ============================================================
INSERT INTO films_user (username, email, full_name, role, password, is_active, is_staff, date_joined)
VALUES
  ('ahmad_prod',    'ahmad@cineprod.com',   'Ahmad Al-Sabil',  'producer',    'hashed_pw', 1, 0, '2025-01-01'),
  ('oumar_acc',     'oumar@cineprod.com',   'Oumar Ikeita',    'accountant',  'hashed_pw', 1, 0, '2025-01-01'),
  ('sarah_crew',    'sarah@cineprod.com',   'Sarah Johnson',   'crew_member', 'hashed_pw', 1, 0, '2025-01-01');

-- ============================================================
-- INSERT: Sample Projects
-- ============================================================
INSERT INTO films_project (title, genre, description, project_type, status, total_budget, start_date, end_date, created_by_id)
VALUES
  ('Midnight Horizon',  'Thriller',  'A noir thriller set in the 1940s.',   'Movie', 'production',      500000.00, '2025-02-01', '2025-08-01', 1),
  ('Desert Storm',      'Action',    'An action film shot in the Sahara.',  'Movie', 'pre_production',  750000.00, '2025-05-01', '2025-12-01', 1),
  ('City Lights',       'Drama',     'A drama about urban life.',           'SHORT', 'development',      50000.00, '2025-03-01', '2025-04-01', 1);

-- ============================================================
-- INSERT: Locations
-- ============================================================
INSERT INTO films_location (name, address, contact_infos, permit_status, rental_cost)
VALUES
  ('Downtown Studio A', '100 Main St, City',      'studio@contact.com', 1, 2500.00),
  ('Sahara Desert Site','Morocco, North Africa',   'loc@morocco.com',   1, 5000.00),
  ('City Rooftop',      '55 High St, Metropolis',  'roof@city.com',     0, 1200.00);

-- ============================================================
-- INSERT: Crew Members
-- ============================================================
INSERT INTO films_crew (name, department, role, email, day_rate, phone, hire_date, project_id)
VALUES
  ('James Carter',   'DIR',    'Director of Photography', 'james@crew.com',  800.00, '555-0101', '2025-02-01', 1),
  ('Lena Park',      'CAMERA', 'Camera Operator',         'lena@crew.com',   500.00, '555-0102', '2025-02-05', 1),
  ('Marcus Obi',     'SOUND',  'Sound Mixer',             'marcus@crew.com', 450.00, '555-0103', '2025-02-05', 1),
  ('Yuki Tanaka',    'ART',    'Production Designer',     'yuki@crew.com',   600.00, '555-0104', '2025-05-01', 2),
  ('Carlos Mena',    'GRIP',   'Gaffer',                  'carlos@crew.com', 400.00, '555-0105', '2025-05-01', 2);

-- ============================================================
-- INSERT: Expenses
-- ============================================================
INSERT INTO films_expense (category, description, amount, expense_date, project_id, recorded_by_id)
VALUES
  ('equipment',  'Camera rental – RED Epic',         12000.00, '2025-02-10', 1, 2),
  ('catering',   'On-set catering Week 1',             3500.00, '2025-02-14', 1, 2),
  ('location',   'Studio A rental deposit',            5000.00, '2025-02-01', 1, 2),
  ('travel',     'Flight tickets – Morocco scouting',  8000.00, '2025-05-10', 2, 2),
  ('equipment',  'Drone rental for aerial shots',      4500.00, '2025-05-15', 2, 2);

-- ============================================================
-- INSERT: FilmCrew Assignments (junction)
-- ============================================================
INSERT INTO films_filmcrew (project_id, crew_id, role_on_film, assigned_at)
VALUES
  (1, 1, 'Director of Photography', '2025-02-01 09:00:00'),
  (1, 2, 'Camera Operator',         '2025-02-01 09:00:00'),
  (1, 3, 'Sound Mixer',             '2025-02-01 09:00:00'),
  (2, 4, 'Production Designer',     '2025-05-01 09:00:00'),
  (2, 5, 'Gaffer',                  '2025-05-01 09:00:00');

-- ============================================================
-- UPDATE: Change project status
-- ============================================================
UPDATE films_project SET status = 'post_production' WHERE title = 'Midnight Horizon';

-- ============================================================
-- DELETE: Remove an expense record
-- ============================================================
DELETE FROM films_expense WHERE description = 'On-set catering Week 1';
```

---

## 3. Queries, Stored Procedures, Functions & Triggers

### Query 1 — Budget Summary per Film
```sql
SELECT
    p.title                                        AS "Film",
    p.status                                       AS "Status",
    p.total_budget                                 AS "Budget",
    COALESCE(SUM(e.amount), 0)                     AS "Total Spent",
    p.total_budget - COALESCE(SUM(e.amount), 0)    AS "Remaining"
FROM films_project p
LEFT JOIN films_expense e ON e.project_id = p.id
GROUP BY p.id, p.title, p.status, p.total_budget
ORDER BY p.title;
```

### Query 2 — Over-Budget Films
```sql
SELECT
    p.title                                     AS "Film",
    p.total_budget                              AS "Budget",
    COALESCE(SUM(e.amount), 0)                  AS "Spent",
    COALESCE(SUM(e.amount), 0) - p.total_budget AS "Overspend"
FROM films_project p
LEFT JOIN films_expense e ON e.project_id = p.id
GROUP BY p.id, p.title, p.total_budget
HAVING COALESCE(SUM(e.amount), 0) > p.total_budget
ORDER BY "Overspend" DESC;
```

### Query 3 — Most Active Crew Members (by number of film assignments)
```sql
SELECT
    c.name                      AS "Crew Member",
    c.role                      AS "Job Title",
    c.department                AS "Department",
    COUNT(fc.project_id)        AS "Films Assigned"
FROM films_crew c
JOIN films_filmcrew fc ON fc.crew_id = c.id
GROUP BY c.id, c.name, c.role, c.department
ORDER BY "Films Assigned" DESC
LIMIT 10;
```

### Query 4 — Department Workload Summary
```sql
SELECT
    c.department                        AS "Department",
    COUNT(DISTINCT c.id)                AS "Total Crew",
    COUNT(DISTINCT fc.project_id)       AS "Films Involved",
    COUNT(fc.id)                        AS "Total Assignments"
FROM films_crew c
LEFT JOIN films_filmcrew fc ON fc.crew_id = c.id
GROUP BY c.department
ORDER BY "Total Assignments" DESC;
```

### Query 5 — Films With No Crew Assigned
```sql
SELECT
    p.title      AS "Film",
    p.status     AS "Status",
    p.start_date AS "Start Date"
FROM films_project p
WHERE p.id NOT IN (
    SELECT DISTINCT project_id FROM films_filmcrew
);
```

### Query 6 — Expense Breakdown by Film and Category
```sql
SELECT
    p.title             AS "Film",
    e.category          AS "Category",
    COUNT(e.id)         AS "Number of Expenses",
    SUM(e.amount)       AS "Total Amount",
    AVG(e.amount)       AS "Average Amount"
FROM films_expense e
JOIN films_project p ON p.id = e.project_id
GROUP BY p.title, e.category
ORDER BY p.title, "Total Amount" DESC;
```

### Query 7 — All Crew for a Specific Film
```sql
SELECT
    c.name          AS "Crew Member",
    fc.role_on_film AS "Role on Film",
    c.department    AS "Department",
    c.day_rate      AS "Day Rate",
    c.email         AS "Email"
FROM films_filmcrew fc
JOIN films_crew c ON c.id = fc.crew_id
JOIN films_project p ON p.id = fc.project_id
WHERE p.title = 'Midnight Horizon';
```

### Query 8 — Projects Nearing or Past End Date (still not completed)
```sql
SELECT
    p.title      AS "Film",
    p.status     AS "Status",
    p.end_date   AS "Deadline",
    DATE('now')  AS "Today"
FROM films_project p
WHERE p.end_date <= DATE('now', '+30 days')
  AND p.status NOT IN ('completed', 'cancelled')
ORDER BY p.end_date ASC;
```

---

### Stored Procedure — Get Full Film Report
```sql
-- SQLite doesn't support stored procedures natively.
-- Equivalent using a VIEW for reusability:

CREATE VIEW film_full_report AS
SELECT
    p.title                                     AS film_title,
    p.status,
    p.total_budget,
    COALESCE(SUM(e.amount), 0)                  AS total_spent,
    p.total_budget - COALESCE(SUM(e.amount), 0) AS remaining,
    COUNT(DISTINCT fc.crew_id)                  AS crew_count,
    u.full_name                                 AS created_by
FROM films_project p
LEFT JOIN films_expense  e  ON e.project_id  = p.id
LEFT JOIN films_filmcrew fc ON fc.project_id = p.id
LEFT JOIN films_user     u  ON u.id          = p.created_by_id
GROUP BY p.id, p.title, p.status, p.total_budget, u.full_name;

-- Usage:
SELECT * FROM film_full_report;
SELECT * FROM film_full_report WHERE status = 'production';
```

### Trigger — Prevent Duplicate Crew Assignment
```sql
-- Django enforces this at the model level with unique_together = ('project', 'crew')
-- Equivalent SQL trigger:

CREATE TRIGGER prevent_duplicate_crew
BEFORE INSERT ON films_filmcrew
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'Crew member already assigned to this project')
    WHERE EXISTS (
        SELECT 1 FROM films_filmcrew
        WHERE project_id = NEW.project_id
          AND crew_id    = NEW.crew_id
    );
END;
```

### Function — Calculate Remaining Budget
```sql
-- Implemented as a reusable query / view in Django:
-- In views.py (Python equivalent):

-- SELECT
--     total_budget - COALESCE(SUM(amount), 0) AS remaining_budget
-- FROM films_project p
-- LEFT JOIN films_expense e ON e.project_id = p.id
-- WHERE p.id = <project_id>
-- GROUP BY p.total_budget;

-- Django ORM equivalent used in the application:
--   Project.objects.annotate(spent=Sum('expenses__amount'))
--   remaining = project.total_budget - (project.spent or 0)
```

---

## 4. Application User Interface Screenshots

> **Note:** Run the application and take screenshots of the following pages to insert here:

### Pages to Screenshot:

| Page | URL | Description |
|------|-----|-------------|
| Login | `http://localhost:3000/login` | JWT login form |
| Register | `http://localhost:3000/register` | User registration with role selection |
| Dashboard | `http://localhost:3000/` | Stats overview (total films, crew, expenses) |
| Films List | `http://localhost:3000/films` | All projects with status badges |
| Film Detail | `http://localhost:3000/films/<id>` | Crew, budget, and scene details |
| Crew Management | `http://localhost:3000/crew` | Add/edit/delete crew members |
| Expenses | `http://localhost:3000/expenses` | Expense tracking by film |
| Statistics | `http://localhost:3000/stats` | SQL query results rendered as tables |
| Admin Users | `http://localhost:3000/admin/users` | Admin-only user management |

> *(Insert screenshots here — use Snipping Tool / CMD+Shift+4 on Mac)*

---

## 5. GitHub Link

**Repository:** [https://github.com/OumarIkeita/Film_Production_DatabaseManagement](https://github.com/OumarIkeita/Film_Production_DatabaseManagement)

---

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Backend Framework | Django 4.x + Django REST Framework |
| Authentication | JWT via `djangorestframework-simplejwt` |
| Database | SQLite (dev) |
| Frontend Framework | Next.js 15 (React 18) with Turbopack |
| Styling | Tailwind CSS + shadcn/ui |
| HTTP Client | Axios |
| CORS | `django-cors-headers` |
