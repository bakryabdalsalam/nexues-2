import { db } from '../services/database.service';

export async function initializeDatabase() {
  try {
    // Create test jobs if none exist
    const jobCount = await db.job.count();
    
    if (jobCount === 0) {
      console.log('Seeding initial jobs...');
      await db.job.createMany({
        data: [
          {
            title: 'Frontend Developer',
            description: 'React developer needed',
            company: 'Tech Corp',
            location: 'Remote',
            experienceLevel: 'Mid-Level',
            category: 'Development',
            salary: 75000
          },
          {
            title: 'Backend Developer',
            description: 'Node.js developer needed',
            company: 'Software Inc',
            location: 'New York',
            experienceLevel: 'Senior',
            category: 'Development',
            salary: 95000
          }
        ]
      });
      console.log('Initial jobs seeded successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}
