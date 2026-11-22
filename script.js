const products = [
  { name: "Roadster Floral Kurti", category: "Fashion", price: 699, originalPrice: 1499, rating: "4.3", reviews: "1.2k", tag: "BESTSELLER", emoji: "👗", color: "#ffe1e9" },
  { name: "HERE&NOW Casual Saree", category: "Fashion", price: 899, originalPrice: 1799, rating: "4.5", reviews: "856", tag: "TRENDING", emoji: "🥻", color: "#eaddf5" },
  { name: "HRX Men Running Shirt", category: "Men", price: 549, originalPrice: 1099, rating: "4.2", reviews: "642", tag: "POPULAR", emoji: "👔", color: "#dceaf1" },
  { name: "Home Centre Bedsheet", category: "Home", price: 799, originalPrice: 1599, rating: "4.4", reviews: "2.1k", tag: "TOP RATED", emoji: "🛏️", color: "#e7ebdc" },
  { name: "M.A.C Glow Beauty Set", category: "Beauty", price: 1299, originalPrice: 1899, rating: "4.1", reviews: "934", tag: "NEW", emoji: "🧴", color: "#f5dfcf" },
  { name: "H&M Kids Casual Outfit", category: "Kids", price: 649, originalPrice: 1299, rating: "4.6", reviews: "518", tag: "POPULAR", emoji: "🧸", color: "#f5e7af" },
  { name: "Lavie Fashion Handbag", category: "Fashion", price: 999, originalPrice: 1999, rating: "4.3", reviews: "1.5k", tag: "BESTSELLER", emoji: "👜", color: "#efdcd5" },
  { name: "Ceramic Coffee Mug Set", category: "Home", price: 499, originalPrice: 999, rating: "4.2", reviews: "377", tag: "GREAT DEAL", emoji: "☕", color: "#dfe7e2" }
];

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const cartCount = document.querySelector("#cart-count");
const cartButton = document.querySelector("#cart-button");
const toast = document.querySelector("#toast");

const CART_STORAGE_KEY = "myntra-clone-cart";
const formatPrice = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
let selectedCategory = "All";
let cartItems = loadCart();
let toastTimer;

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "{}");
    if (!savedCart || typeof savedCart !== "object" || Array.isArray(savedCart)) return {};
    return Object.fromEntries(Object.entries(savedCart).filter(([index, quantity]) =>
      Number.isInteger(Number(index)) && products[Number(index)] && Number.isInteger(quantity) && quantity > 0
    ));
  } catch { return {}; }
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
  cartButton.setAttribute("aria-label", `Shopping bag, ${quantity} ${quantity === 1 ? "item" : "items"}`);
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
          <p class="product-price">Rs. ${formatPrice.format(product.price)}<small>Rs. ${formatPrice.format(product.originalPrice)}</small></p>
          <p class="product-meta"><span class="rating">★ ${product.rating}</span>${product.reviews} reviews</p>
          <button class="add-button" type="button" data-product-index="${productIndex}" aria-label="Add ${product.name} to bag${quantityInCart ? `, ${quantityInCart} already in bag` : ""}">
            ${quantityInCart ? `Move to bag · ${quantityInCart}` : "Add to bag"}
          </button>
        </div>
      </article>`;
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

searchForm.addEventListener("submit", (event) => { event.preventDefault(); renderProducts(); });
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
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)); }
  catch { showToast("Added to bag. Your browser could not save the bag between visits."); }
  updateCartDisplay();
  renderProducts();
  showToast(`${product.name} added to your bag`);
});

cartButton.addEventListener("click", () => {
  const quantity = getCartQuantity();
  if (!quantity) { showToast("Your bag is empty"); return; }
  const items = Object.entries(cartItems).map(([index, count]) => `${products[Number(index)].name} × ${count}`).slice(0, 3);
  const remainingItems = Object.keys(cartItems).length - items.length;
  const summary = `${items.join(", ")}${remainingItems > 0 ? `, and ${remainingItems} more` : ""}`;
  showToast(`${quantity} ${quantity === 1 ? "item" : "items"}: ${summary}. Total Rs. ${formatPrice.format(getCartTotal())}`);
});

updateCartDisplay();
renderProducts();
