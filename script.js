// Welcome message
console.log("Welcome to Libaas by Muneeb");

// Shop Now button
const shopButton = document.querySelector(".hero button");

if (shopButton) {
  shopButton.addEventListener("click", function () {
    alert("Welcome to Libaas by Muneeb! Our collection is coming soon.");
  });
}

// Add to Cart buttons
const cartButtons = document.querySelectorAll(".product button");

cartButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    alert("Product added to cart!");
  });
});
