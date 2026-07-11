// ==========================================================================
// LIBAAS BY MUNEEB - PRO E-COMMERCE CORE
// ==========================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDMknsh9jUVtpA2ISrEEjcq0Q2Wq-vEb34",
    authDomain: "libaasbymuneeb.firebaseapp.com",
    projectId: "libaasbymuneeb",
    storageBucket: "libaasbymuneeb.firebasestorage.app",
    messagingSenderId: "417597787712",
    appId: "1:417597787712:web:7c5b6ecba15f66c0aa19a5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const WHATSAPP_NUMBER = "923234962078";

// --- 2. GLOBAL STATE (STORE) ---
const Store = {
    cart: [],
    total: 0,
    inventory: {}
};

// --- 3. INVENTORY & DOM MANAGEMENT ---
async function initializeStorefront() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        
        let html2Piece = "";
        let html3Piece = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            
            // Clean & structure product data with safe fallbacks
            const product = {
                title: data.name || "Exclusive Collection Suit",
                price: Number(data.price) || 0,
                description: data.description ? data.description.split(",") : ["Premium Quality Lawn", "Luxury Finish"],
                images: data.image ? [data.image] : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"],
                category: data.category ? data.category.trim() : "3 Piece"
            };

            // Save to global state
            Store.inventory[id] = product;

            // Generate beautifully structured HTML card
            const cardHTML = `
                <div class="product-card">
                    <img src="${product.images[0]}" alt="${product.title}" loading="lazy">
                    <h3>${product.title}</h3>
                    <p class="price">PKR ${product.price.toLocaleString()}</p>
                    <button class="view-btn" onclick="openProductModal('${id}')">View Details</button>
                </div>
            `;

            // Sort into optimized HTML strings
            if (product.category === "2 Piece") {
                html2Piece += cardHTML;
            } else {
                html3Piece += cardHTML;
            }
        });

        // Batch DOM updates for maximum rendering performance
        const container2P = document.getElementById("suits-2piece");
        const container3P = document.getElementById("suits-3piece");
        
        if (container2P) container2P.innerHTML = html2Piece || "<p>Coming Soon...</p>";
        if (container3P) container3P.innerHTML = html3Piece || "<p>Coming Soon...</p>";

    } catch (error) {
        console.error("Critical Error: Failed to load inventory from Firebase.", error);
    }
}

// --- 4. MODAL UI CONTROLLER ---
function openProductModal(productId) {
    const product = Store.inventory[productId];
    if (!product) return;

    // Populate Text & Price
    document.getElementById('modal-title').innerText = product.title;
    document.getElementById('modal-price').innerText = `PKR ${product.price.toLocaleString()}`;
    
    // Setup Main Image
    const mainImg = document.getElementById('modal-main-img');
    mainImg.src = product.images[0];

    // Populate Descriptions cleanly
    const descContainer = document.getElementById('modal-description');
    descContainer.innerHTML = product.description.map(line => `<li>${line.trim()}</li>`).join('');

    // Setup Interactive Thumbnails
    const thumbContainer = document.getElementById('modal-thumbnails');
    thumbContainer.innerHTML = product.images.map((imgUrl, index) => `
        <img src="${imgUrl}" class="thumb-img ${index === 0 ? 'active' : ''}" data-url="${imgUrl}">
    `).join('');

    // Attach Thumbnail Listeners
    document.querySelectorAll('.thumb-img').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            mainImg.src = e.target.dataset.url;
            document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Attach Add to Cart Action
    const addBtn = document.getElementById('modal-add-btn');
    addBtn.onclick = () => {
        addToCart(product.title, product.price);
        closeProductModal();
    };

    // Reveal Modal
    document.getElementById('product-modal').style.display = "block";
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = "none";
}

// --- 5. CART CONTROLLER ---
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
}

function addToCart(itemName, price) {
    Store.cart.push({ name: itemName, price: price });
    Store.total += price;
    updateCartUI();
    document.getElementById('cart-sidebar').classList.add('open');
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = Store.cart.length;
    const container = document.getElementById('cart-items');
    
    if (Store.cart.length === 0) {
        container.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    } else {
        container.innerHTML = Store.cart.map(item => `
            <div class="cart-item">
                <span>${item.name}</span>
                <strong>PKR ${item.price.toLocaleString()}</strong>
            </div>
        `).join('');
    }
    document.getElementById('cart-total').innerText = `PKR ${Store.total.toLocaleString()}`;
}

// --- 6. CHECKOUT & DATABASE BACKUP ---
async function sendToWhatsApp() {
    if (Store.cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Professional UI interaction: Show loading state
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalText = checkoutBtn.innerText;
    checkoutBtn.innerText = "Processing...";
    checkoutBtn.disabled = true;

    try {
        // Securely back up order to Firestore
        await addDoc(collection(db, "orders"), {
            items: Store.cart,
            totalAmount: Store.total,
            createdAt: serverTimestamp(),
            status: "Pending Connection"
        });
    } catch (error) {
        console.error("Order backup delayed, proceeding to WhatsApp.", error);
    }

    // Format WhatsApp Receipt
    let message = "Hello Libaas by Muneeb! I would like to place an order:\n\n";
    Store.cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - PKR ${item.price.toLocaleString()}\n`;
    });
    message += `\n*Total Amount:* PKR ${Store.total.toLocaleString()}\n\n`;
    message += "Please confirm my order and send shipping details. Thanks!";

    // Reset button & Open WhatsApp
    checkoutBtn.innerText = originalText;
    checkoutBtn.disabled = false;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

// --- 7. EVENT LISTENERS & EXPORTS ---
window.onclick = (event) => {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) closeProductModal();
};

// Expose necessary functions to the global window for HTML buttons
Object.assign(window, {
    openProductModal,
    closeProductModal,
    toggleCart,
    sendToWhatsApp
});

// Boot up the store
initializeStorefront();
