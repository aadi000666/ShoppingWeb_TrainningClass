const products = [
  { name: "Floral printed kurti", category: "Fashion", price: 399, originalPrice: 799, rating: "4.3", reviews: "1.2k", tag: "BESTSELLER", emoji: "👗", color: "#f4d8df" },
  { name: "Everyday cotton saree", category: "Fashion", price: 649, originalPrice: 1199, rating: "4.5", reviews: "856", tag: "POPULAR", emoji: "🥻", color: "#e8d9ee" },
  { name: "Classic casual shirt", category: "Men", price: 449, originalPrice: 899, rating: "4.2", reviews: "642", tag: "GREAT VALUE", emoji: "👔", color: "#d6e8ee" },
  { name: "Soft cotton bedsheet", category: "Home", price: 529, originalPrice: 999, rating: "4.4", reviews: "2.1k", tag: "TOP RATED", emoji: "🛏️", color: "#e2e7d5" },
  { name: "Daily glow skincare set", category: "Beauty", price: 299, originalPrice: 599, rating: "4.1", reviews: "934", tag: "JUST IN", emoji: "🧴", color: "#f5e2ce" },
  { name: "Comfy kids' outfit", category: "Kids", price: 349, originalPrice: 699, rating: "4.6", reviews: "518", tag: "POPULAR", emoji: "🧸", color: "#f4e6b9" },
  { name: "Lightweight fashion bag", category: "Fashion", price: 499, originalPrice: 999, rating: "4.3", reviews: "1.5k", tag: "BESTSELLER", emoji: "👜", color: "#ead9cf" },
  { name: "Minimal ceramic mug set", category: "Home", price: 279, originalPrice: 549, rating: "4.2", reviews: "377", tag: "GREAT VALUE", emoji: "☕", color: "#dce5e0" }
];

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const cartCount = document.querySelector("#cart-count");
const cartButton = document.querySelector("#cart-button");
const toast = document.querySelector("#toast");

const CART_STORAGE_KEY = "aadishop-cart";
const formatPrice = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
let selectedCategory = "All";
let cartItems = loadCart();
let toastTimer;

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "{}");
    if (!savedCart || typeof savedCart !== "object" || Array.isArray(savedCart)) return {};

    return Object.fromEntries(
      Object.entries(savedCart).filter(([index, quantity]) =>
        Number.isInteger(Number(index)) && products[Number(index)] && Number.isInteger(quantity) && quantity > 0
      )
    );
  } catch {
    return {};
  }
}

function getCartQuantity() {
  return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
}

function getCartTotal() {
  return Object.entries(cartItems).reduce((total, [index, quantity]) =>
    total + products[Number(index)].price * quantity, 0
  );
}

function updateCartDisplay() {
  const quantity = getCartQuantity();
  cartCount.textContent = String(quantity);
  cartButton.setAttribute("aria-label", `Shopping cart, ${quantity} ${quantity === 1 ? "item" : "items"}`);
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = filteredProducts.map((product) => {
    const productIndex = products.indexOf(product);
    const quantityInCart = cartItems[productIndex] || 0;
    return `
      <article class="product-card">
        <div class="product-art" style="background: ${product.color}">
          <span class="product-tag">${product.tag}</span>
          <span class="product-emoji" aria-hidden="true">${product.emoji}</span>
        </div>
        <div class="product-info">
          <p class="product-name">${product.name}</p>
          <p class="product-price">₹${formatPrice.format(product.price)}<small>₹${formatPrice.format(product.originalPrice)}</small></p>
          <p class="product-meta"><span class="rating">★ ${product.rating}</span>${product.reviews} reviews</p>
          <button class="add-button" type="button" data-product-index="${productIndex}" aria-label="Add ${product.name} to cart${quantityInCart ? `, ${quantityInCart} already in cart` : ""}">
            Add to cart${quantityInCart ? ` <span class="cart-item-quantity" aria-hidden="true">· ${quantityInCart} in cart</span>` : ""}
          </button>
        </div>
      </article>
    `;
  }).join("");

  resultCount.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? "item" : "items"}`;
  emptyState.hidden = filteredProducts.length !== 0;
  productGrid.hidden = filteredProducts.length === 0;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3000);
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);

document.querySelector(".category-nav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  selectedCategory = button.dataset.category;
  document.querySelectorAll(".category-link").forEach((link) => {
    const isActive = link === button;
    link.classList.toggle("active", isActive);
    link.setAttribute("aria-pressed", String(isActive));
  });
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-index]");
  if (!button) return;

  const productIndex = Number(button.dataset.productIndex);
  const product = products[productIndex];
  if (!product) return;

  cartItems[productIndex] = (cartItems[productIndex] || 0) + 1;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch {
    showToast("Added to cart. Your browser could not save the cart between visits.");
  }
  updateCartDisplay();
  renderProducts();
  showToast(`${product.name} added to your cart`);
});

cartButton.addEventListener("click", () => {
  const quantity = getCartQuantity();
  if (!quantity) {
    showToast("Your cart is empty");
    return;
  }

  const items = Object.entries(cartItems)
    .map(([index, count]) => `${products[Number(index)].name} × ${count}`)
    .slice(0, 3);
  const remainingItems = Object.keys(cartItems).length - items.length;
  const summary = `${items.join(", ")}${remainingItems > 0 ? `, and ${remainingItems} more` : ""}`;
  showToast(`${quantity} ${quantity === 1 ? "item" : "items"}: ${summary}. Total ₹${formatPrice.format(getCartTotal())}`);
});

updateCartDisplay();
renderProducts();
