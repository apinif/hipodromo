import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

const devCredentialsProvider = CredentialsProvider({
  id: "dev-login",
  name: "Dev Login",
  credentials: {
    name: { label: "Name", type: "text", placeholder: "Your name" },
  },
  async authorize(credentials) {
    if (!credentials?.name) return null;
    const email = `dev-${credentials.name.toLowerCase().replace(/\s+/g, "-")}@localhost.dev`;

    // Upsert a user so the session works with the database adapter
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: credentials.name, email },
      });
    }
    return { id: user.id, name: user.name, email: user.email };
  },
});

const googleProvider = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.NODE_ENV === "development" ? [devCredentialsProvider] : []),
    ...(process.env.GOOGLE_CLIENT_ID ? [googleProvider] : []),
  ],
  session: {
    // Credentials provider requires JWT strategy (can't use database sessions)
    strategy: process.env.NODE_ENV === "development" ? "jwt" : "database",
  },
  callbacks: {
    session: async ({ session, token, user }) => {
      if (session?.user) {
        // JWT strategy uses token, database strategy uses user
        session.user.id = (token?.sub ?? user?.id) as string;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
};
