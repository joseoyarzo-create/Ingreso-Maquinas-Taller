import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

// Para demostración sin Firebase configurado, usaremos LocalStorage como respaldo
const useMockOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('st_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const saveToLocal = (newOrders) => {
    setOrders(newOrders);
    localStorage.setItem('st_orders', JSON.stringify(newOrders));
  };

  const addOrder = (orderData) => {
    const nextId = orders.length + 1;
    const stId = `ST-${String(nextId).padStart(4, '0')}`;
    const newOrder = {
      ...orderData,
      id: Date.now().toString(), // Firebase ID mock
      stId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCalled: null
    };
    saveToLocal([newOrder, ...orders]);
    return stId;
  };

  const updateOrder = (id, updates) => {
    const newOrders = orders.map(o => 
      o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
    );
    saveToLocal(newOrders);
  };

  return { orders, loading, addOrder, updateOrder };
};

// Hook principal que decide si usar Firebase o Mock
export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Intentamos usar Firebase, si falla (por falta de config), usamos mock
  const isFirebaseEnabled = false; // Cambiar a true cuando esté configurado

  if (!isFirebaseEnabled) {
    return useMockOrders();
  }

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error("Firebase error:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addOrder = async (orderData) => {
    // Lógica para generar ST-XXXX basado en el contador
    // En producción se recomienda un Cloud Function o un documento de contadores
    const nextId = orders.length + 1; 
    const stId = `ST-${String(nextId).padStart(4, '0')}`;
    
    await addDoc(collection(db, "orders"), {
      ...orderData,
      stId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastCalled: null
    });
    return stId;
  };

  const updateOrder = async (id, updates) => {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  };

  return { orders, loading, error, addOrder, updateOrder };
};
