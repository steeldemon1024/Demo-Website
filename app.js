const cart = new Map();
const orderLayer = document.querySelector("[data-order-layer]");
const drawerItems = document.querySelector("[data-drawer-items]");
const drawerEmpty = document.querySelector("[data-drawer-empty]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartCounts = document.querySelectorAll("[data-cart-count]");
const toast = document.querySelector("[data-toast]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

let lastTrigger = null;
let toastTimer = null;
let closeTimer = null;

function formatPrice(value) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

function cartSummary() {
  let total = 0;
  let quantity = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;
    quantity += item.quantity;
  });

  return { total, quantity };
}

function updateCart() {
  const summary = cartSummary();
  cartCounts.forEach((element) => {
    element.textContent = String(summary.quantity);
  });
  cartTotal.textContent = formatPrice(summary.total);
  drawerItems.innerHTML = "";

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "drawer-item";
    row.innerHTML = [
      "<div>",
      "<h3>" + item.name + "</h3>",
      "<p>" + formatPrice(item.price) + "</p>",
      "</div>",
      '<div class="quantity-control" aria-label="' + item.name + ' quantity">',
      '<button type="button" data-quantity="-1" data-name="' + item.name + '" aria-label="Remove one ' + item.name + '">−</button>',
      "<span>" + item.quantity + "</span>",
      '<button type="button" data-quantity="1" data-name="' + item.name + '" aria-label="Add one ' + item.name + '">+</button>',
      "</div>",
    ].join("");
    drawerItems.appendChild(row);
  });

  drawerEmpty.hidden = cart.size > 0;
}

function openOrder(trigger) {
  window.clearTimeout(closeTimer);
  lastTrigger = trigger || document.activeElement;
  orderLayer.hidden = false;
  document.body.classList.add("is-locked");

  window.requestAnimationFrame(() => {
    orderLayer.classList.add("is-open");
    orderLayer.querySelector(".drawer-close").focus();
  });
}

function closeOrder() {
  orderLayer.classList.remove("is-open");
  document.body.classList.remove("is-locked");
  closeTimer = window.setTimeout(() => {
    orderLayer.hidden = true;
    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
  }, 220);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

document.querySelectorAll("[data-add-item]").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.addItem;
    const price = Number(button.dataset.addPrice);
    const existing = cart.get(name);
    cart.set(name, {
      name,
      price,
      quantity: existing ? existing.quantity + 1 : 1,
    });

    updateCart();
    showToast(name + " added to your tray.");
    button.classList.add("is-added");
    window.setTimeout(() => button.classList.remove("is-added"), 1150);
  });
});

document.querySelectorAll("[data-open-order]").forEach((button) => {
  button.addEventListener("click", () => openOrder(button));
});

document.querySelectorAll("[data-close-order]").forEach((button) => {
  button.addEventListener("click", closeOrder);
});

drawerItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity]");
  if (!button) return;

  const item = cart.get(button.dataset.name);
  if (!item) return;

  item.quantity += Number(button.dataset.quantity);
  if (item.quantity <= 0) {
    cart.delete(item.name);
  }

  updateCart();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !orderLayer.hidden) {
    closeOrder();
  }
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  mobileNav.classList.toggle("is-open", !isOpen);
});

mobileNav.querySelectorAll("a, button").forEach((item) => {
  item.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
  });
});

updateCart();
