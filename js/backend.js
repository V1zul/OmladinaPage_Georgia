// Data + login layer (Firebase Auth + Firestore). The rest of the site only talks to this file.
import { firebaseConfig } from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/13.1.0/';

export const enabled = !!(firebaseConfig && firebaseConfig.apiKey);

let ready = null;
let A; // firebase/auth module
let F; // firebase/firestore module
let app, auth, db, secondaryAuth;

export function init() {
  if (!enabled) return Promise.resolve(false);
  if (!ready) {
    ready = Promise.all([
      import(SDK + 'firebase-app.js'),
      import(SDK + 'firebase-auth.js'),
      import(SDK + 'firebase-firestore.js'),
    ]).then(([appMod, authMod, fsMod]) => {
      A = authMod;
      F = fsMod;
      app = appMod.initializeApp(firebaseConfig);
      auth = A.getAuth(app);
      db = F.getFirestore(app);
      // Separate app instance so creating a new admin does not log the current one out
      secondaryAuth = A.getAuth(appMod.initializeApp(firebaseConfig, 'secondary'));
      return true;
    });
  }
  return ready;
}

const plain = (snap) => {
  const d = snap.data({ serverTimestamps: 'estimate' });
  const createdAt = d.createdAt && d.createdAt.toMillis ? d.createdAt.toMillis() : 0;
  return { id: snap.id, ...d, createdAt };
};

// ---------- Auth ----------
export async function onUser(cb) {
  await init();
  return A.onAuthStateChanged(auth, async (user) => {
    if (!user) return cb(null);
    let admin = false;
    try { admin = (await F.getDoc(F.doc(db, 'admins', user.uid))).exists(); } catch (e) { admin = false; }
    cb({ uid: user.uid, email: user.email, admin });
  });
}

export async function login(email, password) {
  await init();
  await A.signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  await init();
  await A.signOut(auth);
}

export async function changePassword(currentPassword, newPassword) {
  await init();
  const user = auth.currentUser;
  const cred = A.EmailAuthProvider.credential(user.email, currentPassword);
  await A.reauthenticateWithCredential(user, cred);
  await A.updatePassword(user, newPassword);
}

// ---------- Admins ----------
export async function watchAdmins(cb) {
  await init();
  // No orderBy: the first admin is created by hand and may have no createdAt
  return F.onSnapshot(F.collection(db, 'admins'), (s) => cb(s.docs.map(plain).sort((a, b) => a.createdAt - b.createdAt)));
}

export async function addAdmin(name, email, password) {
  await init();
  const cred = await A.createUserWithEmailAndPassword(secondaryAuth, email, password);
  await A.signOut(secondaryAuth);
  await F.setDoc(F.doc(db, 'admins', cred.user.uid), {
    name, email, addedBy: auth.currentUser.email, createdAt: F.serverTimestamp(),
  });
}

export async function removeAdmin(uid) {
  await init();
  await F.deleteDoc(F.doc(db, 'admins', uid));
}

// ---------- Content (announcements, news, events) ----------
const ORDER = { announcements: ['createdAt', 'desc'], news: ['createdAt', 'desc'], events: ['date', 'asc'] };

export async function watch(collection, cb) {
  await init();
  const [field, dir] = ORDER[collection];
  const q = F.query(F.collection(db, collection), F.orderBy(field, dir));
  return F.onSnapshot(q, (s) => cb(s.docs.map(plain)), () => cb([]));
}

export async function add(collection, data) {
  await init();
  await F.addDoc(F.collection(db, collection), { ...data, createdAt: F.serverTimestamp(), author: auth.currentUser.email });
}

export async function remove(collection, id) {
  await init();
  await F.deleteDoc(F.doc(db, collection, id));
}
