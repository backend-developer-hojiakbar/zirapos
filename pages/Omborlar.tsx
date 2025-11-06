import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Warehouse, WarehouseProduct, Product } from '../types.ts';
import { Plus, Edit, Trash2, Search, Eye, Warehouse as WarehouseIcon } from 'lucide-react';
import Modal from '../components/Modal.tsx';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation.ts';

const WarehouseForm: React.FC<{
    warehouse?: Warehouse;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (warehouse: Partial<Warehouse>) => void;
}> = ({ warehouse, isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState(warehouse?.name || '');
    const [location, setLocation] = useState(warehouse?.location || '');
    const [description, setDescription] = useState(warehouse?.description || '');
    const [isActive, setIsActive] = useState(warehouse?.is_active !== false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            location,
            description,
            is_active: isActive
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={warehouse ? "Omborni tahrirlash" : "Yangi ombor yaratish"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nomi *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Manzil</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tavsif</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">Faol</label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md"
                    >
                        Bekor qilish
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Saqlash
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const WarehouseProductForm: React.FC<{
    warehouseId: string;
    warehouseProduct?: WarehouseProduct;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (warehouseProduct: Partial<WarehouseProduct>) => void;
}> = ({ warehouseId, warehouseProduct, isOpen, onClose, onSubmit }) => {
    const { products } = useAppContext();
    const [productId, setProductId] = useState(warehouseProduct?.productId || '');
    const [quantity, setQuantity] = useState(warehouseProduct?.quantity || 0);
    const [reservedQuantity, setReservedQuantity] = useState(warehouseProduct?.reserved_quantity || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            warehouseId,
            productId,
            quantity,
            reserved_quantity: reservedQuantity
        });
    };

    const availableProducts = useMemo(() => {
        return products.filter(p => p.status === 'active');
    }, [products]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={warehouseProduct ? "Ombor mahsulotini tahrirlash" : "Omborga mahsulot qo'shish"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Mahsulot *</label>
                    <select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        required
                        disabled={!!warehouseProduct}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">Tanlang...</option>
                        {availableProducts.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Miqdori *</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        required
                        min="0"
                        step="0.01"
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Zaxiraga olingan miqdor</label>
                    <input
                        type="number"
                        value={reservedQuantity}
                        onChange={(e) => setReservedQuantity(Number(e.target.value))}
                        min="0"
                        step="0.01"
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md"
                    >
                        Bekor qilish
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Saqlash
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const WarehouseProductsList: React.FC<{ warehouseId: string }> = ({ warehouseId }) => {
    const { warehouseProducts, products, addWarehouseProduct, updateWarehouseProduct, deleteWarehouseProduct } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<WarehouseProduct | null>(null);
    const tableRef = useRef<HTMLDivElement>(null);

    const warehouseProductsList = useMemo(() => {
        return warehouseProducts.filter(wp => wp.warehouseId === warehouseId);
    }, [warehouseProducts, warehouseId]);

    const getProduct = (id: string) => products.find(p => p.id === id);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEditProduct = (warehouseProduct: WarehouseProduct) => {
        setEditingProduct(warehouseProduct);
        setIsFormOpen(true);
    };

    const handleSubmitProduct = async (warehouseProductData: Partial<WarehouseProduct>) => {
        try {
            if (editingProduct) {
                await updateWarehouseProduct(editingProduct.id, warehouseProductData);
            } else {
                await addWarehouseProduct(warehouseProductData);
            }
            setIsFormOpen(false);
        } catch (error) {
            alert("Mahsulotni saqlashda xatolik yuz berdi");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) {
            try {
                await deleteWarehouseProduct(id);
            } catch (error) {
                alert("Mahsulotni o'chirishda xatolik yuz berdi");
            }
        }
    };
    
    // Implement keyboard navigation for warehouse products
    const { focusedIndex, isKeyboardMode, moveFocus } = useKeyboardNavigation(warehouseProductsList);

    // Handle keyboard events for the table
    useEffect(() => {
        const handleTableKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < warehouseProductsList.length) {
                e.preventDefault();
                handleEditProduct(warehouseProductsList[focusedIndex]);
            }
        };

        const table = tableRef.current;
        if (table) {
            table.addEventListener('keydown', handleTableKeyDown as EventListener);
            return () => {
                table.removeEventListener('keydown', handleTableKeyDown as EventListener);
            };
        }
    }, [focusedIndex, warehouseProductsList, handleEditProduct]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ombordagi mahsulotlar</h3>
                <button
                    onClick={handleAddProduct}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus size={16} className="mr-1" />
                    Mahsulot qo'shish
                </button>
            </div>
            
            {warehouseProductsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Bu omborda hali mahsulotlar yo'q
                </div>
            ) : (
                <div ref={tableRef} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto" tabIndex={0}>
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Mahsulot</th>
                                <th scope="col" className="px-6 py-3">Miqdori</th>
                                <th scope="col" className="px-6 py-3">Zaxirada</th>
                                <th scope="col" className="px-6 py-3">Mavjud</th>
                                <th scope="col" className="px-6 py-3 text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouseProductsList.map((wp, index) => {
                                const product = getProduct(wp.productId);
                                return (
                                    <tr 
                                        key={wp.id} 
                                        className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${
                                            isKeyboardMode && index === focusedIndex 
                                                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-gray-700' 
                                                : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4 font-medium">{product?.name || 'Noma\'lum'}</td>
                                        <td className="px-6 py-4">{wp.quantity} {product?.unit || ''}</td>
                                        <td className="px-6 py-4">{wp.reserved_quantity} {product?.unit || ''}</td>
                                        <td className="px-6 py-4 font-medium">{(wp.quantity - wp.reserved_quantity).toFixed(2)} {product?.unit || ''}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditProduct(wp)}
                                                className="p-1 text-blue-600 hover:text-blue-800 mr-2"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(wp.id)}
                                                className="p-1 text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
            <WarehouseProductForm
                warehouseId={warehouseId}
                warehouseProduct={editingProduct || undefined}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleSubmitProduct}
            />
        </div>
    );
};

const Omborlar = () => {
    const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
    const warehouseListRef = useRef<HTMLDivElement>(null);

    const filteredWarehouses = useMemo(() => {
        if (!searchTerm) return warehouses;
        const term = searchTerm.toLowerCase();
        return warehouses.filter(warehouse =>
            warehouse.name.toLowerCase().includes(term) ||
            (warehouse.location && warehouse.location.toLowerCase().includes(term))
        );
    }, [warehouses, searchTerm]);

    const selectedWarehouse = useMemo(() => {
        return warehouses.find(w => w.id === selectedWarehouseId) || null;
    }, [warehouses, selectedWarehouseId]);
    
    // Implement keyboard navigation for warehouse list
    const { focusedIndex, isKeyboardMode, moveFocus } = useKeyboardNavigation(filteredWarehouses);

    // Handle keyboard events for the warehouse list
    useEffect(() => {
        const handleWarehouseListKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredWarehouses.length) {
                e.preventDefault();
                setSelectedWarehouseId(filteredWarehouses[focusedIndex].id);
            }
        };

        const list = warehouseListRef.current;
        if (list) {
            list.addEventListener('keydown', handleWarehouseListKeyDown as EventListener);
            return () => {
                list.removeEventListener('keydown', handleWarehouseListKeyDown as EventListener);
            };
        }
    }, [focusedIndex, filteredWarehouses, setSelectedWarehouseId]);

    const handleAddWarehouse = () => {
        setEditingWarehouse(null);
        setIsFormOpen(true);
    };

    const handleEditWarehouse = (warehouse: Warehouse) => {
        setEditingWarehouse(warehouse);
        setIsFormOpen(true);
    };

    const handleSubmitWarehouse = async (warehouseData: Partial<Warehouse>) => {
        try {
            if (editingWarehouse) {
                await updateWarehouse(editingWarehouse.id, warehouseData);
            } else {
                await addWarehouse(warehouseData);
            }
            setIsFormOpen(false);
        } catch (error) {
            alert("Omborni saqlashda xatolik yuz berdi");
        }
    };

    const handleDeleteWarehouse = async (id: string) => {
        if (window.confirm("Haqiqatan ham bu omborni o'chirmoqchimisiz?")) {
            try {
                await deleteWarehouse(id);
                if (selectedWarehouseId === id) {
                    setSelectedWarehouseId(null);
                }
            } catch (error) {
                alert("Omborni o'chirishda xatolik yuz berdi");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl font-bold">Omborlar</h1>
                <button
                    onClick={handleAddWarehouse}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus size={20} className="mr-2" />
                    Yangi ombor
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Omborlar bo'yicha qidirish..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        
                        <div ref={warehouseListRef} className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto" tabIndex={0}>
                            {filteredWarehouses.map((warehouse, index) => (
                                <div
                                    key={warehouse.id}
                                    onClick={() => setSelectedWarehouseId(warehouse.id)}
                                    className={`p-3 rounded-lg cursor-pointer border ${
                                        selectedWarehouseId === warehouse.id
                                            ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    } ${
                                        isKeyboardMode && index === focusedIndex 
                                            ? 'ring-2 ring-blue-500' 
                                            : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{warehouse.name}</h3>
                                            {warehouse.location && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                    {warehouse.location}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditWarehouse(warehouse);
                                                }}
                                                className="p-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteWarehouse(warehouse.id);
                                                }}
                                                className="p-1 text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center mt-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            warehouse.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {warehouse.is_active ? 'Faol' : 'Nofaol'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="lg:col-span-2">
                    {selectedWarehouse ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedWarehouse.name}</h2>
                                    {selectedWarehouse.location && (
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            {selectedWarehouse.location}
                                        </p>
                                    )}
                                    {selectedWarehouse.description && (
                                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                                            {selectedWarehouse.description}
                                        </p>
                                    )}
                                </div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedWarehouse.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                    {selectedWarehouse.is_active ? 'Faol' : 'Nofaol'}
                                </span>
                            </div>
                            
                            <WarehouseProductsList warehouseId={selectedWarehouse.id} />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                            <WarehouseIcon size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">Ombor tanlang</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Ma'lumotlarni ko'rish uchun chap tomondan ombor tanlang
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            <WarehouseForm
                warehouse={editingWarehouse || undefined}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleSubmitWarehouse}
            />
        </div>
    );
};

export default Omborlar;