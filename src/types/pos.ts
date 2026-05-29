export interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  qty: number;
  priceAtSale: number;
  totalItemPrice: number;
}

export type PaymentMethod = "CASH" | "QRIS" | "TRANSFER";

export interface Transaction {
  id: string;
  cashierId: string;
  memberId: string | null;
  items: TransactionItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  amountReturn: number;
  timestamp: number;
  status: "synced" | "pending_sync";
}
