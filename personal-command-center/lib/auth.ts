import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL?.toLowerCase().trim();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // เข้าได้เฉพาะอีเมลที่กำหนดไว้ใน ALLOWED_EMAIL เท่านั้น
    async signIn({ user }) {
      if (!ALLOWED_EMAIL) return false;
      return user.email?.toLowerCase().trim() === ALLOWED_EMAIL;
    },
    async session({ session }) {
      return session;
    },
  },
};
