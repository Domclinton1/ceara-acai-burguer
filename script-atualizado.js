const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")
const pixAmount = document.getElementById("pix-amount")
const pixAddress = document.getElementById("pix-address")
const pixOrderSummary = document.getElementById("pix-order-summary")
const pixQrCodeImg = document.getElementById("pix-qrcode")
const pixModal = document.getElementById("pix-modal")
const closePixModalBtn = document.getElementById("close-pix-modal")
const confirmPixBtn = document.getElementById("confirm-pix-btn")

let cart = [];

cartBtn.addEventListener("click", () => {
    updateCartModal();
    cartModal.style.display = "flex";
});

cartModal.addEventListener("click", (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

closeModalBtn.addEventListener("click", () => {
    cartModal.style.display = "none";
});

menu.addEventListener("click", (event) => {
    const parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartModal();
}

function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "ab-4", "flex-col");

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-bold">${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>
            </div>
        `;

        total += item.price * item.quantity;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerHTML = cart.length;
}

cartItemsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartModal();
    }
}

addressInput.addEventListener("input", (event) => {
    const inputValue = event.target.value;
    if (inputValue !== "") {
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
    }
});

checkoutBtn.addEventListener("click", () => {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "Ops! O restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: { background: "#ef4644" }
        }).showToast();
        return;
    }

    if (cart.length === 0) return;

    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    const totalPrice = cart.reduce((total, item) => total + item.quantity * item.price, 0);
    pixAmount.textContent = `R$ ${totalPrice.toFixed(2)}`;
    pixAddress.textContent = addressInput.value;

    pixOrderSummary.innerHTML = cart.map(item => (
        `• ${item.name} (x${item.quantity}) - R$ ${item.price.toFixed(2)}`
    )).join("<br>");

    pixQrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=00020126580014br.gov.bcb.pix011131975783629520400005303986540${totalPrice.toFixed(2).replace('.', '')}5802BR5925Fabricia Gonçalves Jorge6009SAO PAULO62140510CHAVEPAG1234567896304B14F&size=250x250`;

    pixModal.style.display = "flex";
});

confirmPixBtn.addEventListener("click", () => {
    const message = encodeURIComponent(cart.map(item => (
        `${item.name} (x${item.quantity}) - R$${item.price.toFixed(2)}`
    )).join(" | ") + `\nTotal: R$${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}\nEndereço: ${addressInput.value}`);

    window.open(`https://wa.me/31975783629?text=${message}`, "_blank");
    cart = [];
    updateCartModal();
    pixModal.style.display = "none";
});

closePixModalBtn.addEventListener("click", () => {
    pixModal.style.display = "none";
});

function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    const diaSemana = data.getDay();
    return diaSemana !== 1 && hora >= 8 && hora < 24;
}

const spanItem = document.getElementById("date-span")
if (checkRestaurantOpen()) {
    spanItem.classList.remove("bg-red-500")
    spanItem.classList.add("bg-green-600")
} else {
    spanItem.classList.remove("bg-green-600")
    spanItem.classList.add("bg-red-500")
}

const navLinks = document.querySelectorAll(".nav-link");
window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY + 200;
    navLinks.forEach(link => {
        const sectionId = link.getAttribute("href").substring(1);
        const section = document.getElementById(sectionId);
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                link.classList.add("border-b-2", "border-purple-700");
            } else {
                link.classList.remove("border-b-2", "border-purple-700");
            }
        }
    });
});
