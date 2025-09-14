import CredentialsProvider from 'next-auth/providers/credentials';
import { sql } from './database';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const users = await sql`SELECT id, email, password_hash, full_name, avatar_url, share_code FROM users WHERE email = ${credentials.email}`;
        const user = users[0];

        if (user && (await bcrypt.compare(credentials.password, user.password_hash))) {
          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            image: user.avatar_url,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};