import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import path from 'path';

// Check if app is already initialized to prevent errors on hot-reload/multiple invocations
if (!admin.apps.length) {
  try {
    // Relative path to the Firebase folder from the api directory
    // api/saveCar.ts -> ../Firebase/gen-lang-client-0555533957-firebase-adminsdk-fbsvc-891950a4b8.json
    const serviceAccount = require('../Firebase/gen-lang-client-0555533957-firebase-adminsdk-fbsvc-891950a4b8.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized successfully.");
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratar requisição OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    
    if (!data || !data.proprietario || !data.imovel) {
      return res.status(400).json({ error: 'Missing required data (proprietario or imovel)' });
    }

    const db = admin.firestore();
    
    // Save to a collection called 'car_registrations'
    const docRef = await db.collection('car_registrations').add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'Carvox_Voice_Agent'
    });

    return res.status(200).json({ 
      success: true, 
      id: docRef.id,
      message: 'Dados salvos no Firebase com sucesso!' 
    });
  } catch (error: any) {
    console.error("Erro ao salvar no Firebase:", error);
    return res.status(500).json({ error: 'Failed to save data', details: error.message });
  }
}
