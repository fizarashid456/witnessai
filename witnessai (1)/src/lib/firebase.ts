import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  setDoc,
  updateDoc
} from "firebase/firestore";

// Read Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID
};

// Check if a real Firebase configuration is present
const hasRealConfig = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.authDomain
);

let app: any;
let auth: any;
let db: any;
let isRealFirebase = false;

if (hasRealConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isRealFirebase = true;
    console.log("[WitnessAI Firebase] Successfully connected to real Firebase.");
  } catch (error) {
    console.error("[WitnessAI Firebase] Error initializing real Firebase:", error);
  }
}

// Custom Simulation Class for offline/mock sandbox experience
// This guarantees that authentication and Firestore-like behavior are persistent and 100% functional
class LocalStorageMockStore {
  private keyPrefix: string;
  constructor(collectionName: string) {
    this.keyPrefix = `witness_ai_mock_${collectionName}`;
  }
  
  getAll(): any[] {
    const data = localStorage.getItem(this.keyPrefix);
    return data ? JSON.parse(data) : [];
  }

  saveAll(items: any[]) {
    localStorage.setItem(this.keyPrefix, JSON.stringify(items));
  }

  add(item: any): any {
    const items = this.getAll();
    const newItem = {
      id: "mock-" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...item
    };
    items.unshift(newItem);
    this.saveAll(items);
    return newItem;
  }

  update(id: string, updates: any): any {
    const items = this.getAll();
    const idx = items.findIndex(item => item.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      this.saveAll(items);
      return items[idx];
    }
    return null;
  }
}

// Setup simulated auth and storage state if real Firebase is not connected
const simulatedAuthListeners = new Set<(user: any | null) => void>();
let simulatedUser: any | null = null;

// Load persisted mock user
try {
  const savedUser = localStorage.getItem("witness_ai_mock_user");
  if (savedUser) {
    simulatedUser = JSON.parse(savedUser);
  }
} catch (e) {
  console.error("Failed to parse simulated user", e);
}

const notifyAuthListeners = () => {
  simulatedAuthListeners.forEach(listener => listener(simulatedUser));
};

const simulatedAuth = {
  currentUser: simulatedUser,
  onAuthStateChanged: (callback: (user: any | null) => void) => {
    simulatedAuthListeners.add(callback);
    // Fire callback with current state immediately
    callback(simulatedUser);
    return () => {
      simulatedAuthListeners.delete(callback);
    };
  },
  signInWithGoogle: async () => {
    // Generate simulated Google User
    const mockGoogleUser = {
      uid: "google-uid-" + Math.random().toString(36).substr(2, 9),
      displayName: "Demo Administrator",
      email: "demo.admin@witnessai.enterprise.com",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      providerId: "google.com"
    };
    simulatedUser = mockGoogleUser;
    localStorage.setItem("witness_ai_mock_user", JSON.stringify(mockGoogleUser));
    notifyAuthListeners();
    return { user: mockGoogleUser };
  },
  signUpWithEmail: async (email: string, pass: string, name: string) => {
    const mockUser = {
      uid: "email-uid-" + Math.random().toString(36).substr(2, 9),
      displayName: name || email.split("@")[0],
      email: email,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      providerId: "password"
    };
    simulatedUser = mockUser;
    localStorage.setItem("witness_ai_mock_user", JSON.stringify(mockUser));
    notifyAuthListeners();
    return { user: mockUser };
  },
  signInWithEmail: async (email: string, pass: string) => {
    const mockUser = {
      uid: "email-uid-persisted",
      displayName: email.split("@")[0].toUpperCase(),
      email: email,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      providerId: "password"
    };
    simulatedUser = mockUser;
    localStorage.setItem("witness_ai_mock_user", JSON.stringify(mockUser));
    notifyAuthListeners();
    return { user: mockUser };
  },
  signOut: async () => {
    simulatedUser = null;
    localStorage.removeItem("witness_ai_mock_user");
    notifyAuthListeners();
  }
};

const simulatedDb = {
  policies: new LocalStorageMockStore("policies"),
  logs: new LocalStorageMockStore("logs")
};

export {
  app,
  auth,
  db,
  isRealFirebase,
  simulatedAuth,
  simulatedDb,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};
