import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/utils/password";
import { generateToken } from "@/utils/tokens";

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error();

  const password_hash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
  });
  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) throw new Error("Invalid credentials");
  const token = generateToken({ id: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
