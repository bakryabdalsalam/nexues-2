import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check if jobs already exist
  const jobCount = await prisma.job.count();
  
  if (jobCount === 0) {
    console.log('Seeding initial jobs...');
    await prisma.job.createMany({
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
    console.log('Jobs seeded successfully');
  } else {
    console.log('Jobs already exist, skipping seed');
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
