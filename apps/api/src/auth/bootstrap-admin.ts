import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

async function main() {
  const readline = createInterface({ input, output });
  const email = (await readline.question('Admin email: ')).trim().toLowerCase();
  const password = await readline.question('Admin password: ');
  readline.close();
  if (!email || password.length < 8)
    throw new Error(
      'Email is required and password must be at least 8 characters.',
    );
  const prisma = new PrismaService();
  await prisma.$connect();
  const passwordHash = AuthService.hashPassword(password);
  await prisma.admin.upsert({
    where: { email },
    update: { password_hash: passwordHash, updated_at: new Date() },
    create: { email, password_hash: passwordHash },
  });
  await prisma.$disconnect();
  console.log('Admin account created or updated.');
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Admin bootstrap failed.',
  );
  process.exitCode = 1;
});
