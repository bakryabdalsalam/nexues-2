import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jobboard.com' },
    update: {},
    create: {
      email: 'admin@jobboard.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      profile: {
        create: {}
      }
    }
  });
  console.log('Admin user created:', admin);

  // Seed initial jobs
  console.log('Seeding initial jobs...');
  await prisma.job.createMany({
    data: [
      {
        title: 'Senior Software Engineer',
        description: 'We are looking for an experienced software engineer...',
        company: 'Tech Corp',
        location: 'Remote',
        experienceLevel: 'Senior',
        category: 'Engineering',
        salary: 120000
      },
      {
        title: 'Product Manager',
        description: 'Join our product team to lead exciting initiatives...',
        company: 'Innovation Inc',
        location: 'New York',
        experienceLevel: 'Mid-Level',
        category: 'Product',
        salary: 100000
      },
      {
        title: 'UX Designer',
        description: 'Help us create beautiful and intuitive interfaces...',
        company: 'Design Studio',
        location: 'San Francisco',
        experienceLevel: 'Junior',
        category: 'Design',
        salary: 80000
      }
    ]
  });
  console.log('Jobs seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
