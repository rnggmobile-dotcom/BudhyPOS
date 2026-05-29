import { Transaction, Product } from "../types/pos";

const DB_NAME = "BudhyPOS_LocalDB";
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Toko Berkas Transaksi Offline
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id" });
      }
      
      // Toko Berkas Katalog Produk (untuk cache offline)
      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "id" });
      }
    };
  });
};

// Amankan Nota ke Brankas Lokal
export const saveTransactionLocal = async (tx: Transaction): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("transactions", "readwrite");
    const store = transaction.objectStore("transactions");
    const request = store.put(tx);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Ambil Semua Nota yang Belum Tersinkron ke Cloud
export const getPendingTransactions = async (): Promise<Transaction[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("transactions", "readonly");
    const store = transaction.objectStore("transactions");
    const request = store.getAll();

    request.onsuccess = () => {
      const allTx = request.result as Transaction[];
      // Filter hanya yang statusnya pending_sync
      resolve(allTx.filter((tx) => tx.status === "pending_sync"));
    };
    request.onerror = () => reject(request.error);
  });
};

// Update Status Nota Setelah Sukses Terupload ke Cloud
export const updateTransactionStatus = async (id: string, status: "synced"): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("transactions", "readwrite");
    const store = transaction.objectStore("transactions");
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const data = getRequest.result as Transaction;
      if (data) {
        data.status = status;
        store.put(data);
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};
