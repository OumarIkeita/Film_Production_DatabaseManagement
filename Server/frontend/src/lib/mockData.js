export const MOCK_USERS = [
  { user_id: 1, username: 'admin_sara',  password: 'admin123',    full_name: 'Sara Mitchell', email: 'sara@cineprod.com',  role: 'admin',        is_active: true },
  { user_id: 2, username: 'prod_james',  password: 'producer123', full_name: 'James Carter',  email: 'james@cineprod.com', role: 'producer',     is_active: true },
  { user_id: 3, username: 'prod_linda',  password: 'producer123', full_name: 'Linda Torres',  email: 'linda@cineprod.com', role: 'producer',     is_active: true },
  { user_id: 4, username: 'crew_alex',   password: 'crew123',     full_name: 'Alex Johnson',  email: 'alex@cineprod.com',  role: 'crew_member',  is_active: true },
  { user_id: 5, username: 'crew_maya',   password: 'crew123',     full_name: 'Maya Patel',    email: 'maya@cineprod.com',  role: 'crew_member',  is_active: true },
  { user_id: 6, username: 'crew_omar',   password: 'crew123',     full_name: 'Omar Hassan',   email: 'omar@cineprod.com',  role: 'crew_member',  is_active: true },
  { user_id: 7, username: 'acc_ryan',    password: 'acc123',      full_name: 'Ryan Brooks',   email: 'ryan@cineprod.com',  role: 'accountant',   is_active: true },
  { user_id: 8, username: 'acc_nina',    password: 'acc123',      full_name: 'Nina Volkova',  email: 'nina@cineprod.com',  role: 'accountant',   is_active: true },
]

export const MOCK_FILMS = [
  { film_id: 1, title: 'Eclipse of Dawn',      genre: 'Drama',    status: 'production',      start_date: '2024-03-01', end_date: '2024-09-30', description: 'A story of two estranged siblings reuniting after their father\'s death.', created_by: 2, created_by_name: 'James Carter' },
  { film_id: 2, title: 'Neon Phantom',         genre: 'Sci-Fi',   status: 'pre_production',  start_date: '2024-06-01', end_date: '2025-02-28', description: 'A cyberpunk thriller set in a dystopian city ruled by AI.',               created_by: 2, created_by_name: 'James Carter' },
  { film_id: 3, title: 'The Last Harvest',     genre: 'Thriller', status: 'post_production', start_date: '2023-08-15', end_date: '2024-04-30', description: 'A farmer uncovers a dark conspiracy threatening his rural community.',    created_by: 3, created_by_name: 'Linda Torres' },
  { film_id: 4, title: 'Laughing in the Rain', genre: 'Comedy',   status: 'development',     start_date: '2024-10-01', end_date: '2025-08-31', description: 'A quirky romantic comedy set during a music festival.',                   created_by: 3, created_by_name: 'Linda Torres' },
  { film_id: 5, title: 'Iron Meridian',        genre: 'Action',   status: 'completed',       start_date: '2022-01-10', end_date: '2023-05-20', description: 'An ex-soldier fights to protect his city from a rogue military faction.', created_by: 2, created_by_name: 'James Carter' },
]

export const MOCK_DEPARTMENTS = [
  { department_id: 1, name: 'Directing',         description: 'Creative vision and direction' },
  { department_id: 2, name: 'Cinematography',    description: 'Camera work, lighting, visual composition' },
  { department_id: 3, name: 'Production Design', description: 'Set design, art direction, visual style' },
  { department_id: 4, name: 'Sound',             description: 'Audio recording, sound design, music' },
  { department_id: 5, name: 'Editing',           description: 'Post-production video and audio editing' },
]

export const MOCK_CREW = [
  { crew_id: 1, user_id: 2, full_name: 'James Carter',  job_title: 'Senior Producer',          department_id: 1, department_name: 'Directing',         phone: '+1-555-0101', hire_date: '2018-04-15' },
  { crew_id: 2, user_id: 3, full_name: 'Linda Torres',  job_title: 'Associate Producer',       department_id: 1, department_name: 'Directing',         phone: '+1-555-0102', hire_date: '2020-07-01' },
  { crew_id: 3, user_id: 4, full_name: 'Alex Johnson',  job_title: 'Director of Photography',  department_id: 2, department_name: 'Cinematography',    phone: '+1-555-0201', hire_date: '2019-03-20' },
  { crew_id: 4, user_id: 5, full_name: 'Maya Patel',    job_title: 'Art Director',             department_id: 3, department_name: 'Production Design', phone: '+1-555-0301', hire_date: '2021-01-10' },
  { crew_id: 5, user_id: 6, full_name: 'Omar Hassan',   job_title: 'Sound Designer',           department_id: 4, department_name: 'Sound',             phone: '+1-555-0401', hire_date: '2022-06-05' },
  { crew_id: 6, user_id: 1, full_name: 'Sara Mitchell', job_title: 'Post-Production Editor',   department_id: 5, department_name: 'Editing',           phone: '+1-555-0501', hire_date: '2017-09-12' },
]

export const MOCK_FILM_CREW = [
  { assignment_id: 1, film_id: 1, crew_id: 1, crew_member_name: 'James Carter',  job_title: 'Senior Producer',         department_name: 'Directing',      role_on_film: 'Lead Producer' },
  { assignment_id: 2, film_id: 1, crew_id: 3, crew_member_name: 'Alex Johnson',  job_title: 'Director of Photography', department_name: 'Cinematography', role_on_film: 'Director of Photography' },
  { assignment_id: 3, film_id: 1, crew_id: 4, crew_member_name: 'Maya Patel',    job_title: 'Art Director',            department_name: 'Production Design', role_on_film: 'Art Director' },
  { assignment_id: 4, film_id: 2, crew_id: 2, crew_member_name: 'Linda Torres',  job_title: 'Associate Producer',      department_name: 'Directing',      role_on_film: 'Producer' },
  { assignment_id: 5, film_id: 2, crew_id: 3, crew_member_name: 'Alex Johnson',  job_title: 'Director of Photography', department_name: 'Cinematography', role_on_film: 'Cinematographer' },
  { assignment_id: 6, film_id: 3, crew_id: 2, crew_member_name: 'Linda Torres',  job_title: 'Associate Producer',      department_name: 'Directing',      role_on_film: 'Associate Producer' },
  { assignment_id: 7, film_id: 3, crew_id: 5, crew_member_name: 'Omar Hassan',   job_title: 'Sound Designer',          department_name: 'Sound',          role_on_film: 'Sound Designer' },
  { assignment_id: 8, film_id: 4, crew_id: 1, crew_member_name: 'James Carter',  job_title: 'Senior Producer',         department_name: 'Directing',      role_on_film: 'Executive Producer' },
]

export const MOCK_BUDGETS = [
  { budget_id: 1, film_id: 1, total_amount: 2500000, currency: 'USD', total_spent: 755000  },
  { budget_id: 2, film_id: 2, total_amount: 5000000, currency: 'USD', total_spent: 550000  },
  { budget_id: 3, film_id: 3, total_amount: 1800000, currency: 'USD', total_spent: 595000  },
  { budget_id: 4, film_id: 5, total_amount:  950000, currency: 'USD', total_spent: 430000  },
]

export const MOCK_EXPENSES = [
  { expense_id: 1,  film_id: 1, film_title: 'Eclipse of Dawn',      category: 'equipment',       description: 'Camera and lens rental for principal photography', amount: 120000, expense_date: '2024-03-15', recorded_by_name: 'Ryan Brooks'  },
  { expense_id: 2,  film_id: 1, film_title: 'Eclipse of Dawn',      category: 'location',        description: 'Location permits and fees for downtown shoot',      amount:  45000, expense_date: '2024-03-20', recorded_by_name: 'Ryan Brooks'  },
  { expense_id: 3,  film_id: 1, film_title: 'Eclipse of Dawn',      category: 'crew',            description: 'Additional crew hires for action sequences',        amount: 210000, expense_date: '2024-04-01', recorded_by_name: 'Ryan Brooks'  },
  { expense_id: 4,  film_id: 1, film_title: 'Eclipse of Dawn',      category: 'post_production', description: 'VFX work for final act',                            amount: 380000, expense_date: '2024-07-10', recorded_by_name: 'Nina Volkova' },
  { expense_id: 5,  film_id: 2, film_title: 'Neon Phantom',         category: 'equipment',       description: 'Specialized drone and camera rigs',                 amount: 200000, expense_date: '2024-06-15', recorded_by_name: 'Ryan Brooks'  },
  { expense_id: 6,  film_id: 2, film_title: 'Neon Phantom',         category: 'location',        description: 'Studio rental for interior sets',                   amount: 350000, expense_date: '2024-07-01', recorded_by_name: 'Ryan Brooks'  },
  { expense_id: 7,  film_id: 3, film_title: 'The Last Harvest',     category: 'crew',            description: 'Extended crew contracts due to schedule overrun',   amount: 320000, expense_date: '2024-01-10', recorded_by_name: 'Nina Volkova' },
  { expense_id: 8,  film_id: 3, film_title: 'The Last Harvest',     category: 'post_production', description: 'Sound mixing and score recording',                  amount:  95000, expense_date: '2024-03-05', recorded_by_name: 'Nina Volkova' },
  { expense_id: 9,  film_id: 3, film_title: 'The Last Harvest',     category: 'marketing',       description: 'Trailer production and festival submissions',        amount: 180000, expense_date: '2024-04-01', recorded_by_name: 'Nina Volkova' },
  { expense_id: 10, film_id: 5, film_title: 'Iron Meridian',        category: 'equipment',       description: 'Stunt equipment and pyrotechnics',                  amount: 430000, expense_date: '2022-06-01', recorded_by_name: 'Ryan Brooks'  },
]

export const MOCK_STATS = {
  total_films:    5,
  active_films:   3,
  total_crew:     6,
  total_expenses: 2330000,
}

export const MOCK_QUERY_RESULTS = {
  budget_summary: [
    { Film: 'Eclipse of Dawn',      Status: 'production',      Budget: '$2,500,000', Spent: '$755,000',  Remaining: '$1,745,000' },
    { Film: 'Neon Phantom',         Status: 'pre_production',  Budget: '$5,000,000', Spent: '$550,000',  Remaining: '$4,450,000' },
    { Film: 'The Last Harvest',     Status: 'post_production', Budget: '$1,800,000', Spent: '$595,000',  Remaining: '$1,205,000' },
    { Film: 'Iron Meridian',        Status: 'completed',       Budget: '$950,000',   Spent: '$430,000',  Remaining: '$520,000'   },
  ],
  over_budget: [],
  active_crew: [
    { Name: 'James Carter',  'Job Title': 'Senior Producer',         Department: 'Directing',         Films: 2 },
    { Name: 'Alex Johnson',  'Job Title': 'Director of Photography', Department: 'Cinematography',    Films: 2 },
    { Name: 'Linda Torres',  'Job Title': 'Associate Producer',      Department: 'Directing',         Films: 2 },
    { Name: 'Omar Hassan',   'Job Title': 'Sound Designer',          Department: 'Sound',             Films: 1 },
    { Name: 'Maya Patel',    'Job Title': 'Art Director',            Department: 'Production Design', Films: 1 },
    { Name: 'Sara Mitchell', 'Job Title': 'Post-Production Editor',  Department: 'Editing',           Films: 0 },
  ],
  department_workload: [
    { Department: 'Directing',         Crew: 2, 'Films Involved': 3, Assignments: 4 },
    { Department: 'Cinematography',    Crew: 1, 'Films Involved': 2, Assignments: 2 },
    { Department: 'Production Design', Crew: 1, 'Films Involved': 1, Assignments: 1 },
    { Department: 'Sound',             Crew: 1, 'Films Involved': 1, Assignments: 1 },
    { Department: 'Editing',           Crew: 1, 'Films Involved': 0, Assignments: 0 },
  ],
  uncrewed_films: [
    { Film: 'Laughing in the Rain', Status: 'development', 'Start Date': '2024-10-01', 'Created By': 'Linda Torres' },
  ],
  expense_breakdown: [
    { Film: 'Eclipse of Dawn',  Category: 'post_production', Count: 1, Total: '$380,000', Avg: '$380,000' },
    { Film: 'Eclipse of Dawn',  Category: 'crew',            Count: 1, Total: '$210,000', Avg: '$210,000' },
    { Film: 'Eclipse of Dawn',  Category: 'equipment',       Count: 1, Total: '$120,000', Avg: '$120,000' },
    { Film: 'Eclipse of Dawn',  Category: 'location',        Count: 1, Total: '$45,000',  Avg: '$45,000'  },
    { Film: 'Neon Phantom',     Category: 'location',        Count: 1, Total: '$350,000', Avg: '$350,000' },
    { Film: 'Neon Phantom',     Category: 'equipment',       Count: 1, Total: '$200,000', Avg: '$200,000' },
    { Film: 'The Last Harvest', Category: 'crew',            Count: 1, Total: '$320,000', Avg: '$320,000' },
    { Film: 'The Last Harvest', Category: 'marketing',       Count: 1, Total: '$180,000', Avg: '$180,000' },
    { Film: 'The Last Harvest', Category: 'post_production', Count: 1, Total: '$95,000',  Avg: '$95,000'  },
    { Film: 'Iron Meridian',    Category: 'equipment',       Count: 1, Total: '$430,000', Avg: '$430,000' },
  ],
}
