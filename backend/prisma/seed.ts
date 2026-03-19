import { prisma } from '../src/utils/prisma.js';

async function main() {
  console.log('Seeding the database...');

  // 1. Clean up existing data (Optional but recommended so you can re-run the seed safely)
  await prisma.actionItem.deleteMany();
  await prisma.transcript.deleteMany();
  await prisma.note.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  Cleaned up old data.');

  // 2. Create Dummy Users
  const user1 = await prisma.user.create({
    data: {
      email: 'ahmad@example.com',
      fullName: 'Ahmad',
      password: 'password123', // Dummy password
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'granola@example.com',
      fullName: 'Granola Interviewer',
      password: 'password123', // Dummy password
    },
  });
  console.log('👤 Created dummy users.');

  // 3. Create Sample Notes for User 1
  const note1 = await prisma.note.create({
    data: {
      title: 'Interview Prep Strategy',
      content: 'We need to focus on Prisma and Express today.',
      ownerId: user1.id,
      status: 'completed',
    },
  });

  const note2 = await prisma.note.create({
    data: {
      title: 'Database Design Meeting',
      content: 'Discussing how to handle foreign keys properly.',
      ownerId: user1.id,
      status: 'in_progress',
    },
  });
  console.log('📝 Created sample notes.');

  console.log('✅ Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Use this UUID to test your endpoints:');
  console.log(`👉 ${user1.id} 👈`);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
