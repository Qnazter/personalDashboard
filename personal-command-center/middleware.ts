export { default } from "next-auth/middleware";

export const config = {
  // ป้องกันทุกหน้า ยกเว้นหน้า login, api/auth, และไฟล์ static
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
