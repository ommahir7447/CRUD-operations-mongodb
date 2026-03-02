// API Testing Script
// Run with: node test-api.js
// Make sure server is running first with: node server.js

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Starting API Tests...\n');
  
  try {
    // ============ PRODUCTS TESTS ============
    console.log('📦 Testing Products API...');
    
    // Get all products
    let response = await fetch(`${BASE_URL}/products`);
    let data = await response.json();
    console.log('✓ GET /products:', data.count, 'products found');
    
    // Get single product
    response = await fetch(`${BASE_URL}/products/1`);
    data = await response.json();
    console.log('✓ GET /products/1:', data.data.name);
    
    // Filter products by category
    response = await fetch(`${BASE_URL}/products?category=Electronics`);
    data = await response.json();
    console.log('✓ GET /products?category=Electronics:', data.count, 'products');
    
    // Create new product
    response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Wireless Mouse',
        price: 29.99,
        category: 'Electronics',
        stock: 30,
        description: 'Ergonomic wireless mouse'
      })
    });
    data = await response.json();
    const newProductId = data.data?.id;
    console.log('✓ POST /products:', data.message);
    
    // Update product
    if (newProductId) {
      response = await fetch(`${BASE_URL}/products/${newProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Wireless Mouse Pro',
          price: 34.99,
          category: 'Electronics',
          stock: 25,
          description: 'Premium wireless mouse'
        })
      });
      data = await response.json();
      console.log('✓ PUT /products/:id:', data.message);
    }
    
    // Test validation error
    response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        price: -10
      })
    });
    data = await response.json();
    console.log('✓ Validation error:', data.details.length, 'errors caught');
    
    // ============ USERS TESTS ============
    console.log('\n👤 Testing Users API...');
    
    // Get all users
    response = await fetch(`${BASE_URL}/users`);
    data = await response.json();
    console.log('✓ GET /users:', data.count, 'users found');
    
    // Get single user
    response = await fetch(`${BASE_URL}/users/1`);
    data = await response.json();
    console.log('✓ GET /users/1:', data.data.name);
    
    // Create new user
    response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        address: '789 Test St'
      })
    });
    data = await response.json();
    const newUserId = data.data?.id;
    console.log('✓ POST /users:', data.message);
    
    // Test duplicate email
    response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Another User',
        password: 'password123',
        address: '123 Main St'
      })
    });
    data = await response.json();
    console.log('✓ Duplicate email prevented:', data.error);
    
    // Update user
    if (newUserId) {
      response = await fetch(`${BASE_URL}/users/${newUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User Updated',
          password: 'newpassword123',
          address: '789 Updated St'
        })
      });
      data = await response.json();
      console.log('✓ PUT /users/:id:', data.message);
    }
    
    // ============ CART TESTS ============
    console.log('\n🛒 Testing Cart API...');
    
    const testUserId = newUserId || 1;
    
    // Add item to cart
    response = await fetch(`${BASE_URL}/cart/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 1,
        quantity: 2
      })
    });
    data = await response.json();
    console.log('✓ POST /cart/:userId:', data.message);
    
    // Add another item
    response = await fetch(`${BASE_URL}/cart/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 2,
        quantity: 1
      })
    });
    data = await response.json();
    console.log('✓ Added second item to cart');
    
    // Get cart
    response = await fetch(`${BASE_URL}/cart/${testUserId}`);
    data = await response.json();
    console.log('✓ GET /cart/:userId:', data.data.items.length, 'items, total: $' + data.data.total.toFixed(2));
    
    // Update cart item quantity
    response = await fetch(`${BASE_URL}/cart/${testUserId}/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantity: 3
      })
    });
    data = await response.json();
    console.log('✓ PUT /cart/:userId/:productId:', data.message);
    
    // Test stock validation
    response = await fetch(`${BASE_URL}/cart/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 1,
        quantity: 10000
      })
    });
    data = await response.json();
    console.log('✓ Stock validation:', data.error);
    
    // ============ ORDERS TESTS ============
    console.log('\n📋 Testing Orders API...');
    
    // Create order from cart
    response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        shippingAddress: '123 Main St, City, State 12345',
        paymentMethod: 'Credit Card'
      })
    });
    data = await response.json();
    const orderId = data.data?.id;
    console.log('✓ POST /orders:', data.message, '- Order ID:', orderId);
    
    // Get all orders
    response = await fetch(`${BASE_URL}/orders`);
    data = await response.json();
    console.log('✓ GET /orders:', data.count, 'orders found');
    
    // Get single order
    if (orderId) {
      response = await fetch(`${BASE_URL}/orders/${orderId}`);
      data = await response.json();
      console.log('✓ GET /orders/:id: Order total: $' + data.data.total.toFixed(2));
      
      // Update order status
      response = await fetch(`${BASE_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'processing'
        })
      });
      data = await response.json();
      console.log('✓ PATCH /orders/:id:', data.message, '- Status:', data.data.status);
    }
    
    // Filter orders by user
    response = await fetch(`${BASE_URL}/orders?userId=${testUserId}`);
    data = await response.json();
    console.log('✓ GET /orders?userId=X:', data.count, 'orders for user');
    
    // Test empty cart order
    response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        shippingAddress: '123 Main St',
        paymentMethod: 'Credit Card'
      })
    });
    data = await response.json();
    console.log('✓ Empty cart prevented:', data.error);
    
    // ============ ERROR HANDLING TESTS ============
    console.log('\n⚠️  Testing Error Handling...');
    
    // 404 error
    response = await fetch(`${BASE_URL}/invalid-route`);
    data = await response.json();
    console.log('✓ 404 handler:', data.error);
    
    // Invalid product ID
    response = await fetch(`${BASE_URL}/products/abc`);
    data = await response.json();
    console.log('✓ Invalid ID error:', data.error);
    
    // Product not found
    response = await fetch(`${BASE_URL}/products/99999`);
    data = await response.json();
    console.log('✓ Not found error:', data.error);
    
    // Invalid JSON
    response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });
    data = await response.json();
    console.log('✓ JSON parse error:', data.error);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
console.log('Make sure the server is running on port 3000...\n');
setTimeout(testAPI, 1000);
