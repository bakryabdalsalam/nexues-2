import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.job.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
      profile: {
        create: {
          fullName: 'Admin User'
        }
      }
    }
  });

  // Create company user
  const companyPassword = await bcrypt.hash('company123', 10);
  const company = await prisma.user.create({
    data: {
      email: 'company@example.com',
      password: companyPassword,
      name: 'Tech Corp',
      role: UserRole.COMPANY,
      isActive: true,
      profile: {
        create: {
          fullName: 'Tech Corp'
        }
      }
    }
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      name: 'John Doe',
      role: UserRole.USER,
      isActive: true,
      profile: {
        create: {
          fullName: 'John Doe'
        }
      }
    }
  });

  // Create jobs
  await prisma.job.create({
    data: {
      title: 'Senior Frontend Developer',
      description: 'We are looking for an experienced Frontend Developer...',
      location: 'Remote',
      salary: 120000,
      employmentType: 'FULL_TIME',
      remote: true,
      experienceLevel: 'SENIOR',
      category: 'ENGINEERING',
      companyId: company.id
    }
  });

  await prisma.job.create({
    data: {
      title: 'Product Manager',
      description: 'Seeking a talented Product Manager to join our team...',
      location: 'New York, NY',
      salary: 130000,
      employmentType: 'FULL_TIME',
      remote: false,
      experienceLevel: 'MID_LEVEL',
      category: 'PRODUCT',
      companyId: company.id
    }
  });

  await prisma.job.create({
    data: {
      title: 'UI/UX Designer',
      description: 'Join our design team to create beautiful user experiences...',
      location: 'San Francisco, CA',
      salary: 100000,
      employmentType: 'FULL_TIME',
      remote: true,
      experienceLevel: 'JUNIOR',
      category: 'DESIGN',
      companyId: company.id
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
