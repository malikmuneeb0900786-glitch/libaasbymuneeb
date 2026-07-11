// ==========================================================================
// LIBAAS BY MUNEEB - COMPATIBLE PRO E-COMMERCE CORE
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

// --- 2. GLOBAL STATE (STORE) WITH HARDCODED FALLBACKS ---
const Store = {
    cart: [],
    total: 0,
    inventory: {
        // Keeps your old items working perfectly if clicked
        1: {
            title: "Classic Ivory Embroidered Lawn",
            price: 4500,
            description: ["Fabric: Premium Airjet Lawn Shirt (3 Meters)", "Dupatta: Digital Printed Pure Chiffon (2.5 Meters)", "Trouser: Dyed Cambric Cotton (2.5 Meters)", "Work: Heavy Intricate Front Thread Embroidery Patch"],
            images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"]
        },
        2: {
            title: "Crimson Luxury Festive 3-Piece",
            price: 5200,
            description: ["Fabric: Premium Luxury Chiffon Shirt", "Dupatta: Embroidered Net Border Finished Dupatta", "Trouser: Premium Silk Trouser Fabric with Borders", "Details: Sequins and Tilla Handwoven Threadwork Workpiece"],
            images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop"]
        },
        3: {
            title: "Midnight Black Chiffon Edition",
            price: 5900,
            description: ["Fabric: Jet Black Pure Airjet Crinkle Chiffon", "Organza Block Printed Luxury Dupatta", "Trouser: Premium Dyed Raw Silk (2.5 Meters)"],
            images: ["https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=600&auto=format&fit=crop"]
        }
    }
};

// --- 3. LOAD PRODUCTS FROM FIREBASE ---
async function initializeStorefront() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        
        let html2Piece = "";
        let html3Piece = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            
            // Build safe structure from Firebase data
            const product = {
                title: data.name || "Exclusive Collection Suit",
                price: Number(data.price) || 0,
                description: data.description ? (typeof data.description === 'string' ? data.description.split(",") : data.description) : ["Premium Quality Lawn", "Luxury Finish"],
                images: data.image ? [data.image] : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"],
                category: data.category ? data.category.trim() : "3 Piece"
            };

            // Save to live inventory map
            Store.inventory[id] = product;

            // Generate card HTML safely
            const cardHTML = `
                <div class="product-card">
                    <img src="${product.images[0]}" alt="${product.title}" loading="lazy">
                    <h3>${product.title}</h3>
                    <p class="price">PKR ${product.price.toLocaleString()}</p>
                    <button class="view-btn" onclick="openProductModal('${id}')">View Details</button>
                </div>
            `;

            if (product.category === "2 Piece") {
                html2Piece += cardHTML;
            } else {
                html3Piece += cardHTML;
            }
        });

        // Insert items into your HTML if the containers exist
        const container2P = document.getElementById("suits-2piece");
        const container3P = document.getElementById("suits-3piece");
        
        if (container2P && html2Piece) container2P.innerHTML = html2Piece;
        if (container3P && html3Piece) container3P.innerHTML = html3Piece;

    } catch (error) {
        console.warn("Firebase inventory load paused or empty. Using default storefront items.", error);
    }
}

// --- 4. MODAL UI CONTROLLER (FLUID & BUG-FREE) ---
function openProductModal(productId) {
    const product = Store.inventory[productId];
    if (!product) {
        console.error("Product not found for ID:", productId);
        return;
    }

    // Populate Title & Price
    const titleEl = document.getElementById('modal-title');
    const priceEl = document.getElementById('modal-price');
    if (titleEl) titleEl.innerText = product.title;
    if (priceEl) priceEl.innerText = `PKR ${product.price.toLocaleString()}`;
    
    // Setup Main Display Image
    const mainImg = document.getElementById('modal-main-img');
    if (mainImg && product.images && product.images[0]) {
        mainImg.src = product.images[0];
    }

    // Populate Descriptions
    const descContainer = document.getElementById('modal-description');
    if (descContainer && product.description) {
        descContainer.innerHTML = product.description.map(line => `<li>${line.trim()}</li>`).join('');
    }

    // Setup Interactive Thumbnails safely if the container exists
    const thumbContainer = document.getElementById('modal-thumbnails');
    if (thumbContainer && product.images) {
        thumbContainer.innerHTML = product.images.map((imgUrl, index) => `
            <img src="${imgUrl}" class="thumb-img ${index === 0 ? 'active' : ''}" data-url="${imgUrl}">
        `).join('');

        document.querySelectorAll('.thumb-img').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                if (mainImg) mainImg.src = e.target.dataset.url;
                document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    // Attach Dynamic Add to Cart Action
    const addBtn = document.getElementById('modal-add-btn');
    if (addBtn) {
        addBtn.onclick = () => {
            addToCart(product.title, product.price);
            closeProductModal();
        };
    }

    // Display the Modal view frame
    const modalFrame = document.getElementById('product-modal');
    if (modalFrame) modalFrame.style.display = "block";
}

function closeProductModal() {
    const modalFrame = document.getElementById('product-modal');
    if (modalFrame) modalFrame.style.display = "none";
}

// --- 5. CART CONTROLLER ---
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

function addToCart(itemName, price) {
    Store.cart.push({ name: itemName, price: price });
    Store.total += price;
    updateCartUI();
    
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) sidebar.classList.add('open');
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    if (countEl) countEl.innerText = Store.cart.length;
    
    if (container) {
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
    }
    if (totalEl) totalEl.innerText = `PKR ${Store.total.toLocaleString()}`;
}

// --- 6. CHECKOUT & DATABASE BACKUP ---
async function sendToWhatsApp() {
    if (Store.cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
    let originalText = "Checkout";
    
    if (checkoutBtn) {
        originalText = checkoutBtn.innerText;
        checkoutBtn.innerText = "Processing...";
        checkoutBtn.disabled = true;
    }

    try {
        await addDoc(collection(db, "orders"), {
            items: Store.cart,
            totalAmount: Store.total,
            createdAt: serverTimestamp(),
            status: "Pending Connection"
        });
    } catch (error) {
        console.error("Backup delayed, opening WhatsApp directly.", error);
    }

    let message = "Hello Libaas by Muneeb! I would like to place an order:\n\n";
    Store.cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - PKR ${item.price.toLocaleString()}\n`;
    });
    message += `\n*Total Amount:* PKR ${Store.total.toLocaleString()}\n\n`;
    message += "Please confirm my order and send shipping details. Thanks!";

    if (checkoutBtn) {
        checkoutBtn.innerText = originalText;
        checkoutBtn.disabled = false;
    }
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

// --- 7. GLOBAL WINDOW BINDINGS ---
window.onclick = (event) => {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) closeProductModal();
};

Object.assign(window, {
    openProductModal,
    closeProductModal,
    toggleCart,
    sendToWhatsApp
});

// Run storefront initialization
initializeStorefront();
