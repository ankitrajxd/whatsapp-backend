import bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function checkPassword(
  inputPassword: string,
  password: string
): Promise<boolean> {
  return bcrypt.compare(inputPassword, password);
}
