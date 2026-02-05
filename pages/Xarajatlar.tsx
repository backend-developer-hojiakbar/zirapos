import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Expense, ExpenseType, Employee } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusCircle, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation.ts';

const ExpenseForm: React.FC<{ expense?: Expense; onSave: (expense: Partial<Expense>) => void; onClose: () => void }> = ({ expense, onSave, onClose }) => {
    const { employees, settings, expenseTypes, isDataLoading } = useAppContext();
    
    // Only show loading state if essential data is completely missing
    if (!settings) {
        return <div className="text-center py-4">Sozlamalar yuklanmoqda...</div>;
    }
    
    const [formData, setFormData] = useState<Partial<Expense>>({
        amount: expense?.amount || 0,
        typeId: expense?.typeId || (expenseTypes && expenseTypes.length > 0 ? expenseTypes[0].id : ''),
        description: expense?.description || '',
        employeeId: expense?.employeeId || (employees && employees.length > 0 ? employees[0].id : ''),
    });
    
    // Check if data is still loading
    const isDataReady = settings && expenseTypes && employees && !isDataLoading;
    
    // Disable form submission if no expense types are available or data is loading
    const canSubmit = isDataReady && expenseTypes.length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = e.target.type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? (value ? parseFloat(value) : 0) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const getSubmitButtonText = () => {
        if (!isDataReady) {
            return 'Ma\'lumotlar yuklanmoqda...';
        }
        if (!canSubmit) {
            return 'Xarajat turlari mavjud emas';
        }
        return 'Saqlash';
    };

    // Remove the redundant check since we already handled it above
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Summa</label>
                    <input 
                        type="number" 
                        name="amount" 
                        value={formData.amount || ''} 
                        onChange={handleChange} 
                        required 
                        step="any"
                        disabled={!isDataReady}
                        placeholder={!isDataReady ? "Ma'lumotlar yuklanmoqda..." : "Summani kiriting"}
                        className={`mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 ${!isDataReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Turi</label>
                    <select 
                        name="typeId" 
                        value={formData.typeId || ''} 
                        onChange={handleChange} 
                        disabled={!isDataReady || (expenseTypes && expenseTypes.length === 0)}
                        className={`mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 ${!isDataReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {!isDataReady ? (
                            <option value="">Ma'lumotlar yuklanmoqda...</option>
                        ) : expenseTypes && expenseTypes.length > 0 ? (
                            expenseTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.display_name}</option>
                            ))
                        ) : (
                            <option value="">Xarajat turlari mavjud emas</option>
                        )}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Xodim</label>
                    <select 
                        name="employeeId" 
                        value={formData.employeeId || ''} 
                        onChange={handleChange} 
                        disabled={!isDataReady}
                        className={`mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 ${!isDataReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {!isDataReady ? (
                            <option value="">Ma'lumotlar yuklanmoqda...</option>
                        ) : employees && employees.length > 0 ? (
                            employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))
                        ) : (
                            <option value="">Xodimlar mavjud emas</option>
                        )}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tavsif</label>
                <textarea 
                    name="description" 
                    value={formData.description || ''} 
                    onChange={handleChange} 
                    rows={3} 
                    disabled={!isDataReady}
                    placeholder={!isDataReady ? "Ma'lumotlar yuklanmoqda..." : "Tavsifni kiriting"}
                    className={`mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 ${!isDataReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={!canSubmit}>
                    {getSubmitButtonText()}
                </button>
            </div>
        </form>
    );
};

const Xarajatlar = () => {
    const { expenses, addExpense, updateExpense, deleteExpense, settings, employees, expenseTypes, isDataLoading } = useAppContext();
    
    // Show loading state
    if (isDataLoading) {
        return <div className="text-center py-8">Ma'lumotlar yuklanmoqda...</div>;
    }
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const tableRef = useRef<HTMLDivElement>(null);

    const handleOpenModal = (expense?: Expense) => {
        setEditingExpense(expense);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingExpense(undefined);
        setModalOpen(false);
    };

    const handleSaveExpense = async (expenseData: Partial<Expense>) => {
        try {
            if (editingExpense) {
                await updateExpense(editingExpense.id, expenseData);
            } else {
                await addExpense(expenseData);
            }
            handleCloseModal();
        } catch (error) { alert("Xarajatni saqlashda xatolik yuz berdi"); }
    };

    const handleDeleteExpense = async (id: string) => {
        if (window.confirm("Haqiqatan ham bu xarajatni o'chirmoqchimisiz?")) {
            try {
                await deleteExpense(id);
            } catch (error) { alert("Xarajatni o'chirishda xatolik yuz berdi."); }
        }
    };

    // Filter expenses based on search and type
    const filteredExpenses = (expenses || []).filter(exp => {
        const typeDisplay = exp.type?.display_name || '';
        const matchesSearch = exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             typeDisplay.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || exp.type?.id === filterType;
        return matchesSearch && matchesType;
    });

    // Calculate totals
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Implement keyboard navigation
    const { focusedIndex, isKeyboardMode, moveFocus, resetFocus } = useKeyboardNavigation(filteredExpenses);

    // Handle keyboard events for the table
    useEffect(() => {
        const handleTableKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredExpenses.length) {
                e.preventDefault();
                handleOpenModal(filteredExpenses[focusedIndex]);
            }
        };

        const table = tableRef.current;
        if (table) {
            table.addEventListener('keydown', handleTableKeyDown as EventListener);
            return () => {
                table.removeEventListener('keydown', handleTableKeyDown as EventListener);
            };
        }
    }, [focusedIndex, filteredExpenses, handleOpenModal]);

    // Reset focus when search term changes
    useEffect(() => {
        resetFocus();
    }, [searchTerm, filterType, resetFocus]);

    // Show loading state only when data is actually loading
    if (!settings && isDataLoading) return <div>Yuklanmoqda...</div>;
    if (!settings) return <div>Sozlamalar yuklanmadi. Iltimos, sahifani yangilang.</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Xarajat qidirish..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                    />
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                        disabled={expenseTypes && expenseTypes.length === 0}
                    >
                        <option value="all">Barcha turlar</option>
                        {expenseTypes && expenseTypes.length > 0 ? (
                            expenseTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.display_name}</option>
                            ))
                        ) : (
                            <option value="">Xarajat turlari mavjud emas</option>
                        )}
                    </select>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusCircle size={18} className="mr-2" />
                    Yangi xarajat
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Umumiy xarajatlar: {totalExpenses.toLocaleString()} {settings.currency}</h3>
                </div>
                
                <div ref={tableRef} className="overflow-x-auto" tabIndex={0}>
                    {filteredExpenses.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Xarajatlar topilmadi</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {searchTerm || filterType !== 'all' 
                                    ? 'Qidiruv natijasida xarajatlar topilmadi' 
                                    : 'Hozircha xarajatlar mavjud emas'
                                }
                            </p>
                            {searchTerm || filterType !== 'all' ? (
                                <button 
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterType('all');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Filtrlarni bekor qilish
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleOpenModal()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
                                >
                                    <PlusCircle size={18} className="mr-2" />
                                    Birinchi xarajatni qo'shish
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Sana</th>
                                    <th scope="col" className="px-6 py-3">Summa</th>
                                    <th scope="col" className="px-6 py-3">Turi</th>
                                    <th scope="col" className="px-6 py-3">Xodim</th>
                                    <th scope="col" className="px-6 py-3">Tavsif</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((exp, index) => {
                                    const employee = employees.find(emp => emp.id === exp.employeeId);
                                    return (
                                        <tr 
                                            key={exp.id} 
                                            className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${
                                                isKeyboardMode && index === focusedIndex 
                                                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-gray-700' 
                                                    : ''
                                            }`}
                                            onClick={() => handleOpenModal(exp)}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                {new Date(exp.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-red-600 dark:text-red-400">{Number(exp.amount).toLocaleString()} {settings.currency}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    exp.type?.display_name?.toLowerCase().includes('ish haqi') || exp.type?.name?.toLowerCase().includes('salary') ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                                                    exp.type?.display_name?.toLowerCase().includes('ijara') || exp.type?.name?.toLowerCase().includes('rent') ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' :
                                                    exp.type?.display_name?.toLowerCase().includes('kommunal') || exp.type?.name?.toLowerCase().includes('utilities') ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300' :
                                                    exp.type?.display_name?.toLowerCase().includes('marketing') || exp.type?.name?.toLowerCase().includes('marketing') ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300' :
                                                    exp.type?.display_name?.toLowerCase().includes('texnik') || exp.type?.name?.toLowerCase().includes('maintenance') ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                                                    exp.type?.display_name?.toLowerCase().includes('operatsion') || exp.type?.name?.toLowerCase().includes('operational') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                                }`}>
                                                    {exp.type?.display_name || exp.type?.name || "Noma'lum"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{employee?.name || "Noma'lum"}</td>
                                            <td className="px-6 py-4">{exp.description || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(exp); }} className="p-1 text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteExpense(exp.id); }} className="p-1 text-red-600 hover:text-red-800 ml-2"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingExpense ? "Xarajatni tahrirlash" : "Yangi xarajat qo'shish"} size="lg">
                <ExpenseForm expense={editingExpense} onSave={handleSaveExpense} onClose={handleCloseModal} />
            </Modal>
        </div>
    );
};

export default Xarajatlar;