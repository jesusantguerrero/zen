import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'zen-rules-test',
  firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 },
});

const results = [];
const t = async (name, p) => { try { await p; results.push(['PASS', name]); } catch (e) { results.push(['FAIL', name, e.message]); } };

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'tasks/t1'), { user_uid: 'alice', title: 'A' });
  await setDoc(doc(db, 'tags/g1'), { user_uid: 'alice', name: 'x' });
  await setDoc(doc(db, 'notifications/n1'), { user_uid: 'alice', read_at: null, data: {}, created_at: 1 });
  await setDoc(doc(db, 'public_standups/alice_2026-10-03'), { user_uid: 'alice', items: [] });
  await setDoc(doc(db, 'shared/alice/accounts/bob'), { name: 'Bob' });
  await setDoc(doc(db, 'connections/c1'), { user_uid: 'alice', refreshToken: 'secret' });
});

const alice = env.authenticatedContext('alice').firestore();
const bob = env.authenticatedContext('bob').firestore();
const anon = env.unauthenticatedContext().firestore();

// Tasks
await t('alice reads own task', assertSucceeds(getDoc(doc(alice, 'tasks/t1'))));
await t('bob cannot read alice task', assertFails(getDoc(doc(bob, 'tasks/t1'))));
await t('alice updates own task', assertSucceeds(updateDoc(doc(alice, 'tasks/t1'), { title: 'B' })));
await t('alice cannot hand task to bob', assertFails(updateDoc(doc(alice, 'tasks/t1'), { user_uid: 'bob' })));
await t('bob cannot create task for alice', assertFails(addDoc(collection(bob, 'tasks'), { user_uid: 'alice', title: 'spam' })));
await t('alice creates own task', assertSucceeds(addDoc(collection(alice, 'tasks'), { user_uid: 'alice', title: 'new' })));
await t('alice lists own tasks', assertSucceeds(getDocs(query(collection(alice, 'tasks'), where('user_uid', '==', 'alice')))));

// Tags (were missing)
await t('alice lists own tags', assertSucceeds(getDocs(query(collection(alice, 'tags'), where('user_uid', '==', 'alice')))));
await t('alice creates tag', assertSucceeds(addDoc(collection(alice, 'tags'), { user_uid: 'alice', name: 'y' })));
await t('bob cannot read alice tag', assertFails(getDoc(doc(bob, 'tags/g1'))));
await t('contacts list own', assertSucceeds(getDocs(query(collection(alice, 'contacts'), where('user_uid', '==', 'alice')))));

// Notifications
await t('alice lists unread notifications', assertSucceeds(getDocs(query(collection(alice, 'notifications'), where('user_uid', '==', 'alice'), where('read_at', '==', null)))));
await t('alice marks notification read', assertSucceeds(updateDoc(doc(alice, 'notifications/n1'), { read_at: new Date() })));
await t('alice cannot rewrite notification body', assertFails(updateDoc(doc(alice, 'notifications/n1'), { data: { title: 'x' } })));
await t('alice cannot create notification', assertFails(addDoc(collection(alice, 'notifications'), { user_uid: 'alice' })));
await t('bob cannot read alice notification', assertFails(getDoc(doc(bob, 'notifications/n1'))));

// Shared
await t('alice reads shared list', assertSucceeds(getDocs(collection(alice, 'shared/alice/accounts'))));
await t('bob cannot read alice shared list', assertFails(getDocs(collection(bob, 'shared/alice/accounts'))));

// Public standups
await t('anon reads public standup', assertSucceeds(getDoc(doc(anon, 'public_standups/alice_2026-10-03'))));
await t('bob cannot overwrite alice public standup', assertFails(setDoc(doc(bob, 'public_standups/alice_2026-10-03'), { user_uid: 'bob', items: ['hacked'] })));
await t('alice updates her public standup', assertSucceeds(setDoc(doc(alice, 'public_standups/alice_2026-10-03'), { user_uid: 'alice', items: ['ok'] })));
await t('bob cannot create under alice id', assertFails(setDoc(doc(bob, 'public_standups/alice_2026-10-04'), { user_uid: 'bob' })));
await t('bob creates his own', assertSucceeds(setDoc(doc(bob, 'public_standups/bob_2026-10-04'), { user_uid: 'bob' })));
await t('bob cannot delete alice standup', assertFails(deleteDoc(doc(bob, 'public_standups/alice_2026-10-03'))));

// Connections stay server-only
await t('alice cannot read connections', assertFails(getDoc(doc(alice, 'connections/c1'))));

// Support tickets
const ticket = { email: 'a@b.c', subject: 's', message: 'm', created_at: new Date(), status: 'open' };
await t('anon ticket ok', assertSucceeds(addDoc(collection(anon, 'support_tickets'), ticket)));
await t('ticket with own uid ok', assertSucceeds(addDoc(collection(alice, 'support_tickets'), { ...ticket, user_uid: 'alice' })));
await t('ticket spoofing uid fails', assertFails(addDoc(collection(bob, 'support_tickets'), { ...ticket, user_uid: 'alice' })));
await t('anon ticket null uid ok', assertSucceeds(addDoc(collection(anon, 'support_tickets'), { ...ticket, user_uid: null })));

for (const r of results) console.log(r.join(' | '));
console.log(`${results.filter(r => r[0] === 'PASS').length}/${results.length} passed`);
await env.cleanup();
process.exit(results.some(r => r[0] === 'FAIL') ? 1 : 0);
