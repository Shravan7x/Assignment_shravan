const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');

const users = [
  {
    name: 'Shravan Patel',
    email: 'shravan@company.com',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    employee_id: 'EMP001'
  },
  {
    name: 'Rajesh Sharma',
    email: 'rajesh@company.com',
    password: 'password123',
    role: 'director',
    department: 'Management',
    employee_id: null
  },
  {
    name: 'Priya Verma',
    email: 'priya@company.com',
    password: 'password123',
    role: 'accounts',
    department: 'Finance',
    employee_id: null
  }
];

async function seed() {
  console.log('Seeding users...');

  for (const user of users) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (existing) {
      console.log(`  User ${user.email} already exists, skipping.`);
      continue;
    }

    // Insert user
    const { error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        department: user.department,
        employee_id: user.employee_id
      });

    if (error) {
      console.error(`  Failed to insert ${user.email}:`, error.message);
    } else {
      console.log(`  Inserted ${user.email} (${user.role})`);
    }
  }

  console.log('Seeding complete!');
}

seed();
