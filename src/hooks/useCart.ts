import { useState } from "react";
import { Product, CartItem, Transaction, PaymentMethod } from "../types/pos";
import { saveTransactionLocal } from "../db/localDb";

export const useCart = (isOnline: boolean) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Tambah Produk ke Keranjang Belanja
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  // 2. Kosongkan Keranjang Belanja
  const clearCart = () => setCart([]);

  // 3. Hitung Total Uang Belanjaan
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  // 4. Proses Tombol Bayar (Eksekusi Transaksi)
  const checkout = async (paymentMethod: PaymentMethod, amountPaid: number): Promise<Transaction> => {
    const subtotal = getSubtotal();
    const discountAmount = 0; // Bisa dikembangkan nanti
    const taxAmount = Math.round(subtotal * 0.1); // Pajak 10%
    const grandTotal = subtotal - discountAmount + taxAmount;
    const amountReturn = amountPaid - grandTotal;

    if (amountPaid < grandTotal) {
      throw new Error("Uang pembayaran tidak cukup!");
    }

    // Bungkus data menjadi satu Nota utuh
    const newTransaction: Transaction = {
      id: "TX-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      cashierId: "CSH-001", // Contoh ID Kasir default
      memberId: null,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        qty: item.quantity,
        priceAtSale: item.product.price,
        totalItemPrice: item.product.price * item.quantity,
      })),
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      paymentMethod,
      amountPaid,
      amountReturn,
      timestamp: Date.now(),
      // Jika internet menyala beri status 'synced', jika mati beri status 'pending_sync'
      status: isOnline ? "synced" : "pending_sync",
    };

    // Apapun kondisi sinyalnya, wajib amankan dulu ke Brankas Lokal IndexedDB HP
    await saveTransactionLocal(newTransaction);

    // Kosongkan keranjang setelah sukses bayar
    clearCart();

    return newTransaction;
  };

  return {
    cart,
    addToCart,
    clearCart,
    getSubtotal,
    checkout,
  };
};
