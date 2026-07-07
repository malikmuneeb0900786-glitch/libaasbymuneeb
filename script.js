let cart = [];
let total = 0;

// Dynamic Sliding Window Animation Toggle 
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('open');
}

// Logic to add unstitched clothing products to bag
function addToCart(itemName, price) {
    cart.push({ name: itemName, price: price });
    total += price;
    updateCartUI();
    
    // Automatically open the cart panel to visually show user the addition
    const sidebar = document.getElementById('cart-sidebar');
    if (!sidebar.classList.contains('open')) {
        sidebar.classList.add('open');
    }
}

// Render dynamic state mutations directly onto DOM
function updateCartUI() {
    // Update structural counters
    document.getElementById('cart-count').innerText = cart.length;
    
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    } else {
        cartItemsContainer.innerHTML = '';
        cart.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name}</span>
                <strong>PKR ${item.price.toLocaleString()}</strong>
            `;
            cartItemsContainer.appendChild(div);
        });
    }
    
    // Total aggregate string interpolation formatting
    document.getElementById('cart-total').innerText = 'PKR ' + total.toLocaleString();
}

