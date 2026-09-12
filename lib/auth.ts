import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL?.toLowerCase().trim();

// Scope เพิ่มจาก Phase 4: อ่านอย่างเดียว (readonly) ทั้งคู่ — แดชบอร์ดนี้
// แค่ "แสดงผล" ตารางนัดหมายกับอีเมลที่ยังไม่ได้อ่าน ไม่แก้ไข/ลบอะไรทั้งสิ้น
const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshed = await res.json();
    if (!res.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      // Google มักไม่ส่ง refresh_token ใหม่กลับมาทุกครั้ง ให้ใช้ตัวเดิมต่อ
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (err) {
    console.error("Failed to refresh Google access token", err);
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: GOOGLE_SCOPES,
          access_type: "offline", // จำเป็น เพื่อให้ได้ refresh_token กลับมา
          prompt: "consent", // บังคับให้ Google ถาม consent ใหม่ทุกครั้งที่ login
        },
      },
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
    async jwt({ token, account }) {
      // ตอน login ครั้งแรก: เก็บ access/refresh token จาก Google ไว้ใน JWT
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
          refreshToken: account.refresh_token,
        };
      }

      // ถ้า access token ยังไม่หมดอายุ ใช้ต่อได้เลย
      if (Date.now() < ((token.accessTokenExpires as number) ?? 0)) {
        return token;
      }

      // หมดอายุแล้ว → ขอ token ใหม่ด้วย refresh token
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // หมายเหตุ: accessToken ถูกแนบไว้ใน session เพื่อให้ API Routes ฝั่ง
      // server ใช้เรียก Google Calendar/Gmail API ได้ผ่าน getServerSession()
      // เนื่องจากแอปนี้เป็น single-user (ล็อกอินได้แค่เจ้าของคนเดียวตาม
      // ALLOWED_EMAIL) ความเสี่ยงจึงต่ำกว่าแอป multi-user ทั่วไป
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    },
  },
};

