import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Product, CartItem, PaymentType, Sale, Customer, SalePayment } from '../types.ts';
import { Link } from 'react-router-dom';
import { PlusCircle, MinusCircle, XCircle, Search, UserPlus, Printer, CheckCircle, Trash2, Home, ShoppingCart, AlertCircle, Edit3 } from 'lucide-react';
import Modal from '../components/Modal.tsx';
import PrintableReceipt from '../components/PrintableReceipt';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation.ts';

const AddCustomerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const { addCustomer } = useAppContext();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) {
            alert("Ism va telefon raqam kiritilishi shart.");
            return;
        }
        try {
            const newCustomer = await addCustomer({ name, phone });
            onSave(newCustomer);
            onClose();
            setName('');
            setPhone('');
        } catch (error) {
            alert("Mijoz qo'shishda xatolik");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Yangi mijoz qo'shish">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Mijoz ismi</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Telefon raqami</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Bekor qilish</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Saqlash</button>
                </div>
            </form>
        </Modal>
    );
};


const PaymentModalContent: React.FC<{
    totalAmount: number;
    customerId?: string;
    onProcessPayment: (payments: SalePayment[]) => void;
}> = ({ totalAmount, customerId, onProcessPayment }) => {
    const { settings } = useAppContext();
    const [payments, setPayments] = useState<SalePayment[]>([]);
    const [currentPart, setCurrentPart] = useState<{type: PaymentType, amount: number}>({ type: PaymentType.CASH, amount: totalAmount });
    
    const paidAmount = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
    const remainingAmount = useMemo(() => totalAmount - paidAmount, [totalAmount, paidAmount]);

    useEffect(() => {
        setCurrentPart(prev => ({ ...prev, amount: remainingAmount > 0 ? remainingAmount : 0 }));
    }, [remainingAmount]);
    
    const handleAddPaymentPart = () => {
        if (currentPart.amount <= 0) return;
        if (currentPart.type === PaymentType.DEBT && !customerId) {
            alert("Nasiya uchun avval asosiy ekrandan mijozni tanlang!");
            return;
        }
        setPayments(prev => [...prev, currentPart]);
    };
    
    const handleRemovePaymentPart = (index: number) => {
        setPayments(prev => prev.filter((_, i) => i !== index));
    };

    const handleFinalizePayment = () => {
        if (remainingAmount > 0) {
            alert("To'lov to'liq qoplanmagan!");
            return;
        }
        onProcessPayment(payments);
    };
    
    const paymentTypeLabels: { [key in PaymentType]: string } = {
        [PaymentType.CASH]: "Naqd",
        [PaymentType.CARD]: "Plastik",
        [PaymentType.TRANSFER]: "O'tkazma",
        [PaymentType.DEBT]: "Nasiya"
    };

    if (!settings) return null;

    return (
      <div>
        <div className="text-center mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">To'lash uchun jami</p>
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{totalAmount.toLocaleString()} {settings.currency}</p>
          {paidAmount > 0 && <p className="text-md mt-2">To'landi: <span className="font-semibold text-green-500">{paidAmount.toLocaleString()}</span> | Qoldi: <span className="font-semibold text-red-500">{remainingAmount.toLocaleString()}</span></p>}
        </div>
        <div className="space-y-4">
            {payments.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold">Qo'shilgan to'lovlar:</h4>
                    {payments.map((p, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                           <span className="text-lg">{paymentTypeLabels[p.type]}: <span className="font-semibold">{p.amount.toLocaleString()}</span></span>
                           <button onClick={() => handleRemovePaymentPart(index)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Trash2 size={20}/></button>
                        </div>
                    ))}
                </div>
            )}
            <div className="p-4 border dark:border-gray-600 rounded-lg space-y-3">
                <h4 className="font-semibold text-lg">To'lov qismini qo'shish</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm">To'lov turi</label>
                        <select value={currentPart.type} onChange={e => setCurrentPart(prev => ({ ...prev, type: e.target.value as PaymentType }))} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 mt-1 text-lg">
                            <option value={PaymentType.CASH}>Naqd</option>
                            <option value={PaymentType.CARD}>Plastik</option>
                            <option value={PaymentType.TRANSFER}>O'tkazma</option>
                            <option value={PaymentType.DEBT}>Nasiya</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm">Summa</label>
                        <input type="number" placeholder="Summa" value={currentPart.amount || ''} onChange={e => setCurrentPart(prev => ({...prev, amount: Number(e.target.value)}))} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 mt-1 text-lg"/>
                    </div>
                </div>
                 <button onClick={handleAddPaymentPart} disabled={currentPart.amount <= 0 || remainingAmount <= 0} className="w-full px-4 py-3 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 text-lg">
                    Qo'shish
                 </button>
            </div>
             <button onClick={handleFinalizePayment} disabled={remainingAmount !== 0 || payments.length === 0} className="w-full py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:bg-gray-400 text-xl">
                Savdoni yakunlash
            </button>
        </div>
      </div>
    );
};

const Savdo = () => {
  const { 
    products, 
    customers, 
    addCustomer, 
    createSale,
    settings,
    setSearchTerm,
    searchTerm,
    setSelectedCustomerId,
    lastSale,
    cart,
    setCart,
    addProductToCart,
    removeProductFromCart,
    updateCartItemQuantity,
    updateCartItemPrice // New function
  } = useAppContext();

  // Clear cart function using context's cart state
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setSelectedCustomerId(null);
  };

  // Product selection handler using context's cart functions
  const handleProductSelect = (product: Product, isWholesale: boolean = false) => {
    if (product.stock <= 0) {
      alert('Bu mahsulotdan qoldiq yo\'q!');
      return;
    }
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      // If product exists, just increase quantity
      updateCartItemQuantity(product.id, existingItem.quantity + 1);
    } else {
      // For wholesale, we might want to show a modal to set the price
      if (isWholesale) {
        // We'll add the product with default price for now, and let user edit it in cart
        addProductToCart(product, 1, true);
      } else {
        addProductToCart(product, 1);
      }
    }
    
    // Clear the search term after selecting a product
    setSearchTerm('');
  };

  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(undefined);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<number>(0);

  const receiptRef = useRef<HTMLDivElement>(null);
  const productTableRef = useRef<HTMLDivElement>(null);

  // Cart item rendering helper
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || ''; 
  
  const lastSaleCustomer = useMemo(() => lastSale?.customerId ? customers.find(c => c.id === lastSale.customerId) || null : null, [lastSale, customers]);
  const handleAddNewCustomer = (customer: Customer) => setSelectedCustomerId(customer.id);

  const handleProcessPayment = async (payments: SalePayment[]) => {
    if (cart.length === 0) return;
    
    try {
      const saleData: Omit<Sale, 'id' | 'date' | 'seller'> = { 
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.price,
          product: item.product
        })) as CartItem[],
        subtotal: subtotal,
        discount: discount,
        total: total,
        payments,
        customerId: selectedCustomer
      };
      
      await createSale(saleData);
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
      clearCart();
      setTimeout(() => handlePrint(), 300);
    } catch(error: any) {
      console.error("Savdo yaratishda xatolik:", error.response?.data || error.message);
      const errorMessages = error.response?.data ? 
          Object.entries(error.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n')
          : "Noma'lum server xatoligi.";
      alert(`Xatolik yuz berdi:\n\n${errorMessages}`);
    }
  };

  const filteredProducts = useMemo(() =>
    products.filter(p =>
      p.status === 'active' && (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm))
      )
    ), [products, searchTerm]
  );

  // Implement keyboard navigation for product table
  const { focusedIndex, isKeyboardMode, moveFocus, resetFocus } = useKeyboardNavigation(filteredProducts);

  // Handle keyboard events for the product table
  useEffect(() => {
    const handleTableKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredProducts.length) {
        e.preventDefault();
        handleProductSelect(filteredProducts[focusedIndex]);
      }
    };

    const table = productTableRef.current;
    if (table) {
      table.addEventListener('keydown', handleTableKeyDown as EventListener);
      return () => {
        table.removeEventListener('keydown', handleTableKeyDown as EventListener);
      };
    }
  }, [focusedIndex, filteredProducts, handleProductSelect]);

  // Reset focus when search term changes
  useEffect(() => {
    resetFocus();
  }, [searchTerm, resetFocus]);

  const handlePrint = () => {
    const receiptContent = receiptRef.current?.innerHTML;
    if (receiptContent) {
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'absolute'; printFrame.style.width = '0'; printFrame.style.height = '0'; printFrame.style.border = '0';
        document.body.appendChild(printFrame);
        const frameDoc = printFrame.contentWindow?.document;
        if (frameDoc) {
            frameDoc.open();
            frameDoc.write(`
                <html><head><title>Chek</title><style>
                @media print { body { font-family: monospace; font-size: 12px; color: black; margin: 0; padding: 10px; width: 288px; }
                .text-center { text-align: center; } .font-bold { font-weight: bold; } .text-sm { font-size: 13px; }
                .my-2 { margin-top: 8px; margin-bottom: 8px; } .mt-2 { margin-top: 8px; }
                hr { border: none; border-top: 1px dashed black; } table { width: 100%; border-collapse: collapse; }
                th, td { padding: 2px 0; } .text-left { text-align: left; } .text-right { text-align: right; }
                .w-1\\/2 { width: 50%; } .flex { display: flex; } .justify-between { justify-content: space-between; } }
                </style></head><body>${receiptContent}</body></html>
            `);
            frameDoc.close();
            setTimeout(() => {
                printFrame.contentWindow?.focus();
                printFrame.contentWindow?.print();
                document.body.removeChild(printFrame);
            }, 50);
        }
    }
  };

  // Handle price editing
  const startEditingPrice = (item: CartItem) => {
    setEditingPriceItemId(item.productId);
    setEditingPriceValue(item.price);
  };

  const savePriceEdit = () => {
    if (editingPriceItemId) {
      updateCartItemPrice(editingPriceItemId, editingPriceValue);
      setEditingPriceItemId(null);
    }
  };

  const cancelPriceEdit = () => {
    setEditingPriceItemId(null);
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const [discount, setDiscount] = useState(0);
  const total = useMemo(() => subtotal - discount, [subtotal, discount]);

  if (!settings) return <div>Yuklanmoqda...</div>

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <AddCustomerModal isOpen={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)} onSave={handleAddNewCustomer} />
        
        <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md z-10">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Savdo Terminali</h1>
            <Link to="/" className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Boshqaruv Paneli</span>
            </Link>
        </header>

        <main className="flex-grow flex gap-6 p-6 overflow-hidden">
            <div className="w-5/12 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                        <input 
                            type="text" 
                            placeholder="Mahsulotni nomi yoki shtrix-kodi bo'yicha qidirish..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full p-4 pl-14 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-lg"
                        />
                    </div>
                </div>
                <div ref={productTableRef} className="flex-grow overflow-y-auto" tabIndex={0}>
                    <table className="w-full text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-base text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nomi</th>
                                <th scope="col" className="px-6 py-4">Qoldiq</th>
                                <th scope="col" className="px-6 py-4">Narxi</th>
                                <th scope="col" className="px-6 py-4">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="text-lg">
                            {filteredProducts.map((product, index) => (
                            <tr 
                                key={product.id} 
                                onClick={() => handleProductSelect(product)} 
                                className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer ${
                                    isKeyboardMode && index === focusedIndex 
                                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-gray-700' 
                                        : ''
                                }`}
                            >
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    {product.image && (
                                        <img 
                                            src={product.image.startsWith('/media/') ? `http://127.0.0.1:8000${product.image}` : `http://127.0.0.1:8000/media/${product.image}`} 
                                            alt={product.name} 
                                            className="w-8 h-8 object-cover inline-block mr-2 rounded" 
                                            onError={(e) => {
                                                console.error('Image failed to load:', product.image);
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    {product.name}
                                </td>
                                <td className={`px-6 py-4 ${product.stock <= product.minStock ? 'text-red-500 font-bold' : ''}`}>{product.stock} {product.unit}</td>
                                <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{Number(product.salePrice).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                handleProductSelect(product, false); 
                                            }} 
                                            className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                                        >
                                            Dona
                                        </button>
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                handleProductSelect(product, true); 
                                            }} 
                                            className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                                        >
                                            Optom
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="w-4/12 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Savatcha</h2>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-gray-400"><ShoppingCart size={64} /><p className="mt-4 text-lg">Savatcha bo'sh</p></div>) 
                : (cart.map((item: CartItem) => {
                     const productInCart = products.find(p => p.id === item.productId);
                     const isStockLow = productInCart && item.quantity > productInCart.stock;
                     return (
                         <div key={item.productId} className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isStockLow ? 'bg-red-500/10' : ''}`}>
                             <div className="flex-grow">
                                 <p className="font-semibold">{getProductName(item.productId)}</p>
                                 <div className="flex items-center gap-2">
                                     {editingPriceItemId === item.productId ? (
                                         <div className="flex items-center gap-2">
                                             <input 
                                                 type="number" 
                                                 value={editingPriceValue} 
                                                 onChange={(e) => setEditingPriceValue(Number(e.target.value))} 
                                                 className="w-24 p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                                 autoFocus
                                             />
                                             <button onClick={savePriceEdit} className="p-1 text-green-500">
                                                 <CheckCircle size={16} />
                                             </button>
                                             <button onClick={cancelPriceEdit} className="p-1 text-red-500">
                                                 <XCircle size={16} />
                                             </button>
                                         </div>
                                     ) : (
                                         <div className="flex items-center gap-2">
                                             <p className="text-sm text-gray-500">{item.price.toLocaleString()} x {item.quantity}</p>
                                             <button 
                                                 onClick={() => startEditingPrice(item)} 
                                                 className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"
                                             >
                                                 <Edit3 size={14} />
                                             </button>
                                         </div>
                                     )}
                                     {isStockLow && <AlertCircle className="h-4 w-4 text-red-500" />}
                                 </div>
                             </div>
                             <div className="flex items-center space-x-3">
                                 <button onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}><MinusCircle size={22} className="text-red-500" /></button>
                                 <input type="number" value={item.quantity} onChange={(e) => updateCartItemQuantity(item.productId, parseInt(e.target.value) || 0)} className="text-lg font-bold w-12 text-center bg-transparent border-b dark:border-gray-600 focus:outline-none" />
                                 <button onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}><PlusCircle size={22} className="text-green-500" /></button>
                             </div>
                             <p className="font-bold w-28 text-right text-lg">{(item.price * item.quantity).toLocaleString()}</p>
                             <button onClick={() => removeProductFromCart(item.productId)}><XCircle size={22} className="text-gray-400 hover:text-red-500" /></button>
                         </div>
                     );
                 }))} 
                </div>
            </div>
            <div className="w-3/12 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
                <div className="flex-grow space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Mijoz</h3>
                         <div className="flex items-center space-x-2">
                            <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-base">
                                <option value="">Umumiy mijoz</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button onClick={() => setIsAddCustomerModalOpen(true)} className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex-shrink-0"><UserPlus size={20}/></button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Xulosa</h3>
                        <div className="space-y-3 text-lg">
                            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Jami:</span><span className="font-medium">{subtotal.toLocaleString()} {settings.currency}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-300">Chegirma:</span><input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} className="w-28 p-2 border rounded-md text-right dark:bg-gray-700 dark:border-gray-600"/></div>
                            <div className="flex justify-between font-bold text-2xl border-t dark:border-gray-600 pt-3 mt-3"><span className="text-gray-800 dark:text-white">To'lash uchun:</span><span className="text-blue-600 dark:text-blue-400">{total.toLocaleString()}</span></div>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 space-y-3">
                    <button onClick={clearCart} disabled={cart.length === 0} className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"><Trash2 size={20} /> Bekor qilish</button>
                    <button onClick={() => setIsPaymentModalOpen(true)} disabled={cart.length === 0} className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-lg disabled:opacity-50">To'lov</button>
                </div>
            </div>
        </main>
        
        <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="To'lovni qabul qilish" size="lg">
            <PaymentModalContent totalAmount={total} customerId={selectedCustomer} onProcessPayment={handleProcessPayment} />
        </Modal>
        
        <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Savdo yakunlandi" size="sm">
            <div className="text-center">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium">Muvaffaqiyatli!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Savdo muvaffaqiyatli yakunlandi.</p>
                <div className="hidden">
                    <PrintableReceipt ref={receiptRef} sale={lastSale} products={products} customer={lastSaleCustomer} settings={settings} seller={lastSale?.seller} />
                </div>
                <div className="flex space-x-4">
                    <button onClick={() => setIsReceiptModalOpen(false)} className="w-full py-3 bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold">Yopish</button>
                    <button onClick={handlePrint} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center font-semibold">
                        <Printer size={20} className="mr-2" />
                        Chekni qayta chop etish
                    </button>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default Savdo;