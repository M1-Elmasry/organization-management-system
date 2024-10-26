import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().min(3).max(20),
  email: z.string().min(6).max(50).email(),
  password: z.string().min(8),
});

export const UserCredentialsSchema = UserSchema.omit({ name: true });

export type User = z.infer<typeof UserSchema>;

export type UserDocument = User & {};

export type UserCredentials = z.infer<typeof UserCredentialsSchema>;
