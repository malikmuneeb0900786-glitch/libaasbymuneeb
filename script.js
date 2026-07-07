let cart = [];
let total = 0;

// WHATSAPP CONTACT REGISTRATION (Format: 923xxxxxxxx)
const WHATSAPP_NUMBER = "923001234567"; 

// Premium Shopify Mock Catalog Dataset
const productsData = {
    1: {
        title: "Classic Ivory Embroidered Lawn",
        price: 4500,
        description: [
            "Fabric: Premium Airjet Lawn Shirt (3 Meters)",
            "Dupatta: Digital Printed Pure Chiffon (2.5 Meters)",
            "Trouser: Dyed Cambric Cotton (2.5 Meters)",
            "Work: Heavy Intricate Front Thread Embroidery Patch"
        ],
        images: [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop"
        ]
    },
    2: {
        title: "Crimson Luxury Festive 3-Piece",
        price: 5200,
        description: [
            "Fabric: Premium Luxury Chiffon Shirt",
            "Dupatta: Embroidered Net Border Finished Dupatta",
            "Trouser: Premium Silk Trouser Fabric with Borders",
            "Details: Sequins and Tilla Handwoven Threadwork Workpiece"
        ],
        images: [
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=600&auto=format&fit=crop"
        ]
    },
    3: {
        title: "Midnight Black Chiffon Edition",
        price: 5900,
        description: [
            "Fabric: Jet Black Pure Airjet Crinkle Chiffon",
            "Dupatta: Organza Block Printed Luxury Dupatta",
            "Trouser: Premium Dyed Raw Silk (2.5 Meters)",
            "Aesthetics: Minimalist Golden Zari Border Trims on Daman & Sleeves"
        ],
        images: [
            "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"
        ]
    }
};

// Cart Panel Side Toggle
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
}

// Open Shopify View Details Overlay Box dynamically
function openProductModal(productId) {
    const product = productsData[productId];
    if(!product) return;

    // Load Title & Price State
    document.getElementById('modal-title').innerText = product.title;
    document.getElementById('modal-price').innerText = "PKR " + product.price.toLocaleString();
    
    // Set Main Frame Image Reference
    const mainImg = document.getElementById('modal-main-img');
    mainImg.src = product.images[0];

    // Clear and Append List Descriptions
    const descContainer = document.getElementById('modal-description');
    descContainer.innerHTML = "";
    product.description.forEach(line => {
        const li = document.createElement('li');
        li.innerText = line;
        descContainer.appendChild(li);
    });

    // Populate Multi-Image Gallery Row View Grid 
    const thumbContainer = document.getElementById('modal-thumbnails');
    thumbContainer.innerHTML = "";
    product.images.forEach((imgUrl, index) => {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.className = "thumb-img" + (index === 0 ? " active" : "");
        img.onclick = function() {
            mainImg.src = imgUrl;
            document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
            img.classList.add('active');
        };
        thumbContainer.appendChild(img);
    });

    // Configure Add Button directly for context execution block
    const addBtn = document.getElementById('modal-add-btn');
    addBtn.onclick = function() {
        addToCart(product.title, product.price);
        closeProductModal();
    };

    // Show window display block frame
    document.getElementById('product-modal').style.display = "block";
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = "none";
}

// Universal Cart Array Operations
function addToCart(itemName, price) {
    cart.push({ name: itemName, price: price });
    total += price;
    updateCartUI();
    
    // Slide Open Cart Sidebar Panel view drawer natively
    document.getElementById('cart-sidebar').classList.add('open');
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    } else {
        cartItemsContainer.innerHTML = '';
        cart.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `<span>${item.name}</span><strong>PKR ${item.price.toLocaleString()}</strong>`;
            cartItemsContainer.appendChild(div);
        });
    }
    document.getElementById('cart-total').innerText = 'PKR ' + total.toLocaleString();
}

// Redirect and submit orders straight to business WhatsApp chat channel
function sendToWhatsApp() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let message = "Hello Libaas by Muneeb! I would like to place an order:\n\n";
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - PKR ${item.price.toLocaleString()}\n`;
    });
    message += `\n*Total Amount:* PKR ${total.toLocaleString()}\n\n`;
    message += "Please confirm my order and send shipping details. Thanks!";

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

// Close Modal window if custom backgrounds are clicked
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
