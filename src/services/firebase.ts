import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppNotification } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Critical constraint: Test Firestore connection at boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Firebase Firestore connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Local caching active.');
    }
  }
}
testConnection();

// Safe error handler for Firestore operations
export function handleFirestoreError(error: unknown, operation: string) {
  console.error(`Firestore error during [${operation}]:`, error);
}

// Real-time listener for App Notifications
export function subscribeToFirebaseNotifications(
  role: 'customer' | 'employee' | 'admin' | 'all',
  userId: string,
  onNotificationReceived: (notification: AppNotification) => void
): () => void {
  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(notifsRef, orderBy('timestamp', 'desc'), limit(25));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data() as Omit<AppNotification, 'id'>;
            // Match audience or specific recipient
            if (
              data.recipientRole === 'all' ||
              data.recipientRole === role ||
              data.recipientId === userId ||
              data.recipientId === 'all'
            ) {
              onNotificationReceived({
                ...data,
                id: change.doc.id,
              });
            }
          }
        });
      },
      (error) => {
        handleFirestoreError(error, 'subscribeToNotifications');
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, 'subscribeToFirebaseNotifications-setup');
    return () => {};
  }
}

// Dispatch a notification to Firebase Firestore
export async function dispatchFirebaseNotification(
  notification: Omit<AppNotification, 'id'>
): Promise<string | null> {
  try {
    const notifsRef = collection(db, 'notifications');
    const docRef = await addDoc(notifsRef, {
      ...notification,
      read: false,
      timestamp: notification.timestamp || new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'dispatchFirebaseNotification');
    return null;
  }
}

// Mark notification as read
export async function markFirebaseNotificationRead(docId: string): Promise<void> {
  try {
    const docRef = doc(db, 'notifications', docId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    handleFirestoreError(error, 'markFirebaseNotificationRead');
  }
}

// Save Payment Proof Screenshot to Firestore
export async function savePaymentProofToFirebase(data: {
  bookingId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  payeeUpiId: string;
  utrRef: string;
  screenshotUrl: string;
}): Promise<string | null> {
  try {
    const paymentsRef = collection(db, 'payment_verifications');
    const docRef = await addDoc(paymentsRef, {
      ...data,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'savePaymentProofToFirebase');
    return null;
  }
}
