import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// ใช้เฉพาะฝั่ง server (API Routes) เท่านั้น — ห้าม import ไฟล์นี้ใน client component
//
// สำคัญ: ตั้งใจให้ initialize แบบ "lazy" (เรียกตอนใช้งานจริงเท่านั้น)
// ไม่ใช่ตอน import module เพราะตอน `next build` จะพยายามโหลดทุก route
// เพื่อ collect page data — ถ้า credential ยังไม่ถูกตั้งค่า (เช่นตอน build
// บนเครื่อง dev ที่ยังไม่ได้ใส่ .env จริง) จะทำให้ build พังไปด้วย
function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

let cachedDb: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getAdminApp());
  }
  return cachedDb;
}
