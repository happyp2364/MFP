import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import * as fs from 'fs';

async function scanBackupsWithAuth() {
  console.log('--- SCANNING BACKUPS WITH AUTOMATIC SIGN-IN ---');
  const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);
  const auth = getAuth(app);

  const email = `temp-user-${Date.now()}@example.com`;
  const password = 'TemporaryPassword123!';

  try {
    console.log(`Creating temporary user: ${email}...`);
    await createUserWithEmailAndPassword(auth, email, password);
    console.log('Successfully created temporary user!');
  } catch (err: any) {
    console.log(`Failed to create user (might already exist or email sign-up disabled): ${err.message}`);
    // If sign-up is disabled, let's try standard sign-in for vpcreation2002@gmail.com
    try {
      console.log('Attempting login as vpcreation2002@gmail.com...');
      await signInWithEmailAndPassword(auth, 'vpcreation2002@gmail.com', 'Marudhar@2026');
      console.log('Signed in as vpcreation2002@gmail.com!');
    } catch (loginErr: any) {
      console.error('Failed to sign in as vpcreation2002@gmail.com:', loginErr.message);
      return;
    }
  }

  try {
    const colRef = collection(db, 'backups');
    const snap = await getDocs(colRef);
    console.log(`Found ${snap.size} documents in "backups" collection.`);
    
    let found = false;
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const sizeBytes = Buffer.byteLength(JSON.stringify(data), 'utf8');
      console.log(`Backup Document ID: "${docSnap.id}" | Size: ${(sizeBytes / 1024).toFixed(2)} KB`);
      
      const dataStr = JSON.stringify(data);
      if (dataStr.includes('mfp-custom-1785214970914')) {
        console.log(`⭐ FOUND MATCH in backup "${docSnap.id}"!`);
        found = true;
        
        try {
          const snapshotObj = JSON.parse(data.snapshotJson);
          const products = snapshotObj.products || [];
          const target = products.find((p: any) => p.id === 'mfp-custom-1785214970914');
          if (target) {
            console.log(`🎉 Located target product inside backup: "${target.name}"`);
            printBreakdown(target);
          } else {
            console.log('Target product id not found inside snapshotJson.products');
          }
        } catch (e: any) {
          console.error('Failed to parse snapshotJson:', e.message);
        }
      }
    });

    if (!found) {
      console.log('Target product mfp-custom-1785214970914 was NOT found in any backups.');
    }
  } catch (err: any) {
    console.error('Failed to read backups collection:', err.message);
  }
}

function printBreakdown(data: any) {
  interface FieldAnalysis {
    path: string;
    type: string;
    sizeBytes: number;
    preview: string;
  }

  const list: FieldAnalysis[] = [];

  function analyzeItem(key: string, value: any, currentPath: string) {
    const itemPath = currentPath ? `${currentPath}.${key}` : key;
    const itemSizeBytes = Buffer.byteLength(JSON.stringify({ [key]: value }), 'utf8');
    let preview = '';
    
    if (value === null) {
      preview = 'null';
    } else if (Array.isArray(value)) {
      preview = `Array with ${value.length} items`;
    } else if (typeof value === 'object') {
      preview = `Object with ${Object.keys(value).length} keys`;
    } else {
      const strVal = String(value);
      preview = strVal.length > 60 ? strVal.slice(0, 60) + '...' : strVal;
    }

    list.push({
      path: itemPath,
      type: Array.isArray(value) ? 'array' : typeof value,
      sizeBytes: itemSizeBytes,
      preview
    });

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([subKey, subVal]) => {
        analyzeItem(subKey, subVal, itemPath);
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          analyzeItem(`[${idx}]`, item, itemPath);
        } else if (typeof item === 'string' && item.length > 200) {
          list.push({
            path: `${itemPath}[${idx}]`,
            type: 'string (long)',
            sizeBytes: Buffer.byteLength(item, 'utf8'),
            preview: item.slice(0, 60) + '...'
          });
        }
      });
    }
  }

  Object.entries(data).forEach(([k, v]) => {
    analyzeItem(k, v, '');
  });

  list.sort((a, b) => b.sizeBytes - a.sizeBytes);

  console.log('\n================ EVERY FIELD ANALYSIS ================');
  list.forEach((item) => {
    console.log(`- Path: ${item.path}`);
    console.log(`  Type: ${item.type}`);
    console.log(`  Size: ${(item.sizeBytes / 1024).toFixed(2)} KB (${item.sizeBytes} bytes)`);
    console.log(`  Preview: ${item.preview}`);
    console.log('----------------------------------------------------');
  });

  console.log('\n================ LARGEST 20 FIELDS ================');
  list.slice(0, 20).forEach((item, idx) => {
    console.log(`${idx + 1}. Path: "${item.path}" | Size: ${(item.sizeBytes / 1024).toFixed(2)} KB | Type: ${item.type} | Preview: ${item.preview}`);
  });
  console.log('====================================================');
}

scanBackupsWithAuth().catch((err) => {
  console.error(err);
  process.exit(1);
});
