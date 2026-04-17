
const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal =  document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")
const nomeInput = document.getElementById("nome")
const nomeWarn = document.getElementById("nome-warn")
const confirmPixBtn = document.getElementById("confirm-pix-btn")

let cart = [];

cartBtn.addEventListener("click", function(){
    updateCartModal();
    cartModal.style.display = "flex"
})

cartModal.addEventListener("click", function(event) {
    if(event.target === cartModal){
        cartModal.style.display = "none"
    }
})

closeModalBtn.addEventListener("click", function(){
    cartModal.style.display = "none"
})

menu.addEventListener("click", function(event){
    let parentButton = event.target.closest(".add-to-cart-btn")
    if(parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))
        addToCart(name, price)
    }
})

function addToCart(name, price){
   const existingItem = cart.find(item => item.name === name)
   if(existingItem){
    existingItem.quantity += 1;
   }else{
    cart.push({ name, price, quantity: 1 })
   }
   updateCartModal()
}

function updateCartModal(){
    cartItemsContainer.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "ab-4", "flex-col")
        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-bold">${item.name}</p>
                    <p>Qtd:${item.quantity}</p>
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>
            </div>
        `
        total += item.price * item.quantity;
        cartItemsContainer.appendChild(cartItemElement)
    })
    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    cartCounter.innerHTML = cart.length;
}

cartItemsContainer.addEventListener("click", function (event){
    if(event.target.classList.contains("remove-from-cart-btn")){
        const name = event.target.getAttribute("data-name")
        removeItemCart(name);
    }
})

function removeItemCart(name){
    const index = cart.findIndex(item => item.name === name);
    if(index !== -1){
        if(cart[index].quantity > 1){
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartModal();
    }
}

addressInput.addEventListener("input", function(){
    if(addressInput.value !== ""){
        addressInput.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")
    }
})

nomeInput.addEventListener("input", function(){
    if(nomeInput.value.trim() !== ""){
        nomeInput.classList.remove("border-red-500")
        nomeWarn.classList.add("hidden")
    }
})

checkoutBtn.addEventListener("click", function(){
    const isOpen = checkRestaurantOpen();
    if(!isOpen) {
        Toastify({
            text: "Ops! O restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: { background:"#ef4644" }
        }).showToast();
        return;
    }

    if(cart.length === 0) return;

    if(nomeInput.value.trim() === ""){
        nomeInput.classList.add("border-red-500")
        nomeWarn.classList.remove("hidden")
        return;
    }

    if(addressInput.value === ""){
        addressInput.classList.add("border-red-500")
        addressWarn.classList.remove("hidden")
        return;
    }

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    document.getElementById("pix-amount").textContent = `R$ ${totalPrice.toFixed(2)}`;
    document.getElementById("pix-address").textContent = addressInput.value;

    const cartItemsFormatted = cart.map(item => {
        return `• ${item.name} (x${item.quantity}) - R$ ${item.price.toFixed(2)}`;
    }).join("<br>");
    document.getElementById("pix-order-summary").innerHTML = cartItemsFormatted;

    const pixQrCodeImg = document.getElementById("pix-qrcode");
    pixQrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=00020126580014br.gov.bcb.pix011131975783629520400005303986540${totalPrice.toFixed(2).replace('.', '')}5802BR5925Fabricia Gonçalves Jorge6009SAO PAULO62140510CHAVEPAG1234567896304B14F&size=250x250`;

    document.getElementById("pix-modal").style.display = "flex";
    document.getElementById("cart-modal").style.display = "none";
})

confirmPixBtn.addEventListener("click", () => {
    const nomeCliente = nomeInput.value.trim();
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const formattedItems = cart.map(item => {
        return `• ${item.name} (x${item.quantity}) - R$ ${item.price.toFixed(2)}`;
    }).join("%0A");

    const message =
        `🧾 *Novo Pedido* 🧾%0A%0A` +
        `🙍‍♂️ *Nome:* ${nomeCliente}%0A` +
        `🍔 *Itens:*%0A${formattedItems}%0A%0A` +
        `💰 *Total:* R$ ${totalPrice.toFixed(2)}%0A%0A` +
        `📍 *Endereço para entrega:*%0A${addressInput.value}`;

    window.open(`https://wa.me/31975783629?text=${message}`, "_blank");

    cart = [];
    updateCartModal();
    document.getElementById("pix-modal").style.display = "none";
});

function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    const diaSemana = data.getDay();
    return diaSemana !== 1 && hora >= 8 && hora < 24;
}
