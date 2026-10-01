import 'dotenv/config';

import * as bcrypt from 'bcrypt';

import { AppDataSource } from '../data-source.js';
import { User } from '../../features/users/entities/user.entity.js';
import { UserRole } from '../../features/users/enums/user-role.enum.js';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD are required',
    );
  }

  await AppDataSource.initialize();

  try {
    const usersRepository =
      AppDataSource.getRepository(User);

    const existingAdmin = await usersRepository.findOne({
        where: { email },
      });

    if (existingAdmin) {
      return;
    }

    const passwordHash = await bcrypt.hash(
        password,
        12,
      );

    const admin = usersRepository.create({
        email,
        passwordHash,
        role: UserRole.ADMIN,
      });

    await usersRepository.save(admin);
  } finally {
    await AppDataSource.destroy();
  }
}

void seedAdmin();