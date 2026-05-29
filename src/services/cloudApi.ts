import { Transaction } from "../types/pos";
import { updateTransactionStatus } from "../db/localDb";

// Simulasi pengiriman data ke server backend
export const syncTransactionsToCloud = async (transactions: Transaction[]): Promise<void> => {
  for (const tx of transactions) {
    try {
      // Di sini nanti Anda akan mengganti URL dengan API asli server Anda
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });

      if (response.ok) {
        // Jika server berhasil terima, update status di IndexedDB jadi 'synced'
        await updateTransactionStatus(tx.id, "synced");
        console.log(`Nota ${tx.id} berhasil tersinkron!`);
      }
    } catch (error) {
      console.error(`Gagal sinkron nota ${tx.id}:`, error);
    }
  }
};
