# Personal Command Center

แดชบอร์ดส่วนตัวแบบ Single-user — Phase 1 (ฐานราก + Login) และ Phase 2
(To-Do, Project Hub, Quick Converter) เสร็จแล้ว

## Stack

- Next.js 14 (App Router) + Tailwind CSS
- NextAuth.js (Google Login, จำกัดเฉพาะ 1 อีเมล)
- Firebase Firestore (client SDK + admin SDK)

## วิธีติดตั้งและรันบนเครื่อง

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า Google OAuth

1. ไปที่ https://console.cloud.google.com/apis/credentials
2. สร้าง OAuth Client ID แบบ "Web application"
3. ใส่ Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   (ตอน deploy จริงบน Vercel ให้เพิ่ม `https://your-domain.vercel.app/api/auth/callback/google` ด้วย)
4. คัดลอก Client ID และ Client Secret

### 3. ตั้งค่า Firebase

1. สร้างโปรเจกต์ที่ https://console.firebase.google.com
2. เปิดใช้งาน Firestore Database (โหมด production)
3. ไปที่ Project Settings > General > "Your apps" > เพิ่ม Web App เพื่อได้ config (apiKey, authDomain, ฯลฯ)
4. ไปที่ Project Settings > Service accounts > "Generate new private key" เพื่อได้ไฟล์ JSON
   สำหรับ Firebase Admin SDK (ใช้ค่า `project_id`, `client_email`, `private_key`)

### 4. ตั้งค่า Firestore Security Rules

เนื่องจากการอ่าน/เขียนทั้งหมดผ่าน API Routes ด้วย Admin SDK (มี requireSession ป้องกันแล้ว)
ให้ตั้ง Firestore rules ปิดการเข้าถึงตรงจาก client ทั้งหมด:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. สร้างไฟล์ .env.local

คัดลอกจาก `.env.local.example` แล้วใส่ค่าจริงทั้งหมด (Google OAuth, Firebase client config,
Firebase admin credentials, และอีเมลของคุณใน `ALLOWED_EMAIL`)

สร้าง `NEXTAUTH_SECRET` แบบสุ่มด้วยคำสั่ง:

```bash
openssl rand -base64 32
```

### 6. รันโปรเจกต์

```bash
npm run dev
```

เปิด http://localhost:3000 — ระบบจะพาไปหน้า login ก่อน ถ้าล็อกอินด้วยอีเมลที่ไม่ตรงกับ
`ALLOWED_EMAIL` จะเข้าใช้งานไม่ได้

## โครงสร้างโปรเจกต์

```
app/
  login/                 หน้า login (Google sign-in)
  (dashboard)/           หน้าที่ต้อง login ก่อน (มี Sidebar/Topbar)
    page.tsx             Overview
    projects/            Project Hub (directory + tracker)
    todo/                To-Do List (CRUD)
    tools/converter/     Quick Converter/Formatter
    tools/token-monitor/ placeholder — รอ Phase 3
    schedule/            placeholder — รอ Phase 4 (Google Calendar)
    inbox/               placeholder — รอ Phase 4 (Gmail API)
  api/
    auth/[...nextauth]/  NextAuth route
    todos/               CRUD API สำหรับ To-Do
    projects/            CRUD API สำหรับ Project Hub
lib/
  auth.ts                NextAuth config + email allowlist
  firebase.ts            Firebase client SDK
  firebase-admin.ts       Firebase Admin SDK (lazy init)
  apiGuard.ts            helper เช็ก session ในทุก API route
middleware.ts            บังคับ login ก่อนเข้าทุกหน้า ยกเว้น /login
```

## Deploy ขึ้น Vercel (Phase 4)

1. Push โค้ดขึ้น GitHub
2. Import repo เข้า Vercel
3. ใส่ Environment Variables ทั้งหมดจาก `.env.local` ใน Vercel project settings
   (อย่าลืมเปลี่ยน `NEXTAUTH_URL` เป็นโดเมนจริง)
4. เพิ่ม redirect URI ของโดเมนจริงใน Google OAuth console

## งานที่เหลือ (Phase 3-4)

- Phase 3: สร้าง API Route เช็กโควตา Token จากผู้ให้บริการ AI + แสดงเป็น Progress Bar
  ที่หน้า `/tools/token-monitor`
- Phase 4: เชื่อม Google Calendar API ที่หน้า `/schedule` และ Gmail API ที่หน้า `/inbox`
  แล้ว deploy ขึ้น Vercel จริง
