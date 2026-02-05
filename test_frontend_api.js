// Test frontend API calls
// Open browser console and paste this code

async function testExpenseAPI() {
    const token = localStorage.getItem('pos-auth-token');
    
    if (!token) {
        console.error('No token found! Please login first.');
        return;
    }
    
    console.log('Token found:', token.substring(0, 50) + '...');
    
    try {
        // Test initial data
        console.log('Testing /api/data/initial/...');
        const response = await fetch('http://127.0.0.1:8000/api/data/initial/', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Initial data loaded successfully!');
            console.log('Expense types:', data.expenseTypes?.length || 0);
            console.log('Expenses:', data.expenses?.length || 0);
            console.log('Employees:', data.employees?.length || 0);
            
            // Log expense types
            if (data.expenseTypes) {
                console.log('Expense types:', data.expenseTypes);
            }
            
            // Log expenses
            if (data.expenses) {
                console.log('Expenses:', data.expenses);
            }
        } else {
            console.error('❌ Failed to load initial data:', response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error);
    }
}

// Test expense creation
async function testCreateExpense() {
    const token = localStorage.getItem('pos-auth-token');
    
    if (!token) {
        console.error('No token found!');
        return;
    }
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/expense-types/', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const expenseTypes = await response.json();
            if (expenseTypes.length > 0) {
                const firstType = expenseTypes[0];
                
                const createResponse = await fetch('http://127.0.0.1:8000/api/expenses/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: 25000,
                        typeId: firstType.id,
                        description: 'Frontend test xarajati'
                    })
                });
                
                console.log('Create expense status:', createResponse.status);
                
                if (createResponse.ok) {
                    const newExpense = await createResponse.json();
                    console.log('✅ Expense created:', newExpense);
                } else {
                    console.error('❌ Failed to create expense:', await createResponse.text());
                }
            }
        }
    } catch (error) {
        console.error('❌ Create expense test failed:', error);
    }
}

console.log('🧪 API Test Functions Loaded');
console.log('Run: testExpenseAPI() to test data loading');
console.log('Run: testCreateExpense() to test expense creation');
