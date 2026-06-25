import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function getServiceAccount(): ServiceAccount {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  try {
    const fs = require('fs');
    const path = require('path');
    const searchPaths = [
      path.join(process.cwd(), '..', 'aot-analyzer-bot-firebase-adminsdk-fbsvc-96f7cb0ea5.json'),
      path.join(process.cwd(), 'aot-analyzer-bot-firebase-adminsdk-fbsvc-96f7cb0ea5.json'),
    ];
    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    }
  } catch {
    // ignore
  }

  throw new Error(
    'Firebase Admin SDK credentials not found. Set FIREBASE_CLIENT_EMAIL and ' +
    'FIREBASE_PRIVATE_KEY env vars, or place the service account JSON in the project root.'
  );
}

let adminDb: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (adminDb) return adminDb;

  if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    initializeApp({ credential: cert(serviceAccount) });
  }

  adminDb = getFirestore();
  return adminDb;
}
