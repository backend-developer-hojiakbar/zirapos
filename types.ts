export enum Permission {
  VIEW_DASHBOARD = "view_dashboard",
  USE_SALES_TERMINAL = "use_sales_terminal",
  VIEW_SALES_HISTORY = "view_sales_history",
  MANAGE_PRODUCTS = "manage_products",
  MANAGE_WAREHOUSE = "manage_warehouse",
  MANAGE_CUSTOMERS = "manage_customers",
  MANAGE_SUPPLIERS = "manage_suppliers",
  VIEW_REPORTS = "view_reports",
  MANAGE_SETTINGS = "manage_settings",
  MANAGE_EMPLOYEES = "manage_employees",
}

export const permissionLabels: Record<Permission, string> = {
  [Permission.VIEW_DASHBOARD]: "Boshqaruv panelini ko'rish",
  [Permission.USE_SALES_TERMINAL]: "Savdo terminalidan foydalanish",
  [Permission.VIEW_SALES_HISTORY]: "Savdolar tarixini ko'rish",
  [Permission.MANAGE_PRODUCTS]: "Mahsulotlarni boshqarish",
  [Permission.MANAGE_WAREHOUSE]: "Omborni boshqarish",
  [Permission.MANAGE_CUSTOMERS]: "Mijozlarni boshqarish",
  [Permission.MANAGE_SUPPLIERS]: "Yetkazib beruvchilarni boshqarish",
  [Permission.VIEW_REPORTS]: "Hisobotlarni ko'rish",
  [Permission.MANAGE_SETTINGS]: "Sozlamalarni boshqarish",
  [Permission.MANAGE_EMPLOYEES]: "Xodimlarni boshqarish",
};

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  roleId: string;
  pin?: string;
  role: Role;
}

export interface Product {
    id: string;
    name: string;
    barcode?: string;
    unit: string;
    purchasePrice: number;
    salePrice: number;
    stock: number;
    minStock: number;
    description?: string;
    status: 'active' | 'archived';
    image?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  address?: string;
  bankDetails?: string;
}

export interface Customer {
  id: string;
  name:string;
  phone: string;
  address?: string;
  debt: number | string;
}

export enum PaymentType {
  CASH = 'naqd',
  CARD = 'plastik',
  TRANSFER = 'o\'tkazma',
  DEBT = 'nasiya',
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface SalePayment {
    type: PaymentType;
    amount: number;
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number | string;
  discount: number | string;
  total: number | string;
  payments: SalePayment[];
  customerId?: string;
  customer?: Customer; // BU QATOR QO'SHILDI
  seller: Employee;
}

export interface DebtPayment {
    id: string;
    customerId: string;
    amount: number | string;
    date: string;
    paymentType: PaymentType.CASH | PaymentType.CARD | PaymentType.TRANSFER;
}

export enum StockMovementType {
    KIRIM = 'kirim',
    CHIQIM = 'chiqim',
    SAVDO = 'savdo',
    VOZVRAT = 'vozvrat',
}

export interface StockMovement {
    id: string;
    productId: string;
    product?: Product;
    quantity: number;
    type: StockMovementType;
    date: string;
    relatedId?: string;
    comment?: string;
}

export interface Warehouse {
    id: string;
    name: string;
    location?: string;
    description?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface WarehouseProduct {
    id: string;
    warehouseId: string;
    warehouse?: Warehouse;
    productId: string;
    product?: Product;
    quantity: number;
    reserved_quantity: number;
    available_quantity?: number;
    created_at?: string;
    updated_at?: string;
}

export interface GoodsReceiptItem {
    productId: string;
    product?: Product;
    quantity: number;
    purchasePrice: number;
}

export interface GoodsReceipt {
    id: string;
    date: string;
    supplierId: string;
    supplier?: Supplier;
    docNumber?: string;
    items: GoodsReceiptItem[];
    totalAmount: number | string;
    warehouseId?: string;  // Add warehouse field
    warehouse?: Warehouse; // Add warehouse field
}

export interface Unit {
  id: string;
  name: string;
}

export interface StoreSettings {
    name: string;
    address: string;
    phone: string;
    currency: string;
    units: Unit[];
    receiptHeader?: string;
    receiptFooter?: string;
    receiptShowStoreName: boolean;
    receiptShowAddress: boolean;
    receiptShowPhone: boolean;
    receiptShowChekId: boolean;
    receiptShowDate: boolean;
    receiptShowSeller: boolean;
    receiptShowCustomer: boolean;
    receiptShowQR: boolean;
    location?: string; // Added location field
    id: string;
}