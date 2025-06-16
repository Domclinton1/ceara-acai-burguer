
const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const nomeInput = document.getElementById("nome")
const nomeWarn = document.getElementById("nome-warn")
const bairroSelect = document.getElementById("bairro")
const enderecoInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")
const confirmPixBtn = document.getElementById("confirm-pix-btn")
const taxaEntregaSpan = document.getElementById("taxa-entrega")


let cart = []

const bairros = {
  "Pindorama": 3.00,
  "Glória": 4.00,
  "Novo Glória": 5.00,
  "Jardim Filadélfia": 5.00,
  "Jardim Filadélfia BECOS": 7.00,
  "Milanez": 7.00,
  "Oitis": 9.00,
  "Padre Eustáquio": 10.00,
  "Ceasa": 15.00,
}

cartBtn.addEventListener("click", () => {
  updateCartModal()
  cartModal.style.display = "flex"
})

cartModal.addEventListener("click", event => {
  if (event.target === cartModal) cartModal.style.display = "none"
})

closeModalBtn.addEventListener("click", () => {
  cartModal.style.display = "none"
})

menu.addEventListener("click", event => {
  let parentButton = event.target.closest(".add-to-cart-btn")
  if (parentButton) {
    const name = parentButton.getAttribute("data-name")
    const price = parseFloat(parentButton.getAttribute("data-price"))
    addToCart(name, price)
  }
})

function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name)
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({ name, price, quantity: 1 })
  }
  updateCartModal()
}

function updateCartModal() {
  cartItemsContainer.innerHTML = ""
  let total = 0
  cart.forEach(item => {
    const el = document.createElement("div")
    el.classList.add("flex", "justify-between", "ab-4", "flex-col")
    el.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="font-bold">${item.name}</p>
          <p>Qtd: ${item.quantity}</p>
          <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>
      </div>`
    total += item.price * item.quantity
    cartItemsContainer.appendChild(el)
  })
  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
  cartCounter.innerHTML = cart.length
}

cartItemsContainer.addEventListener("click", event => {
  if (event.target.classList.contains("remove-from-cart-btn")) {
    removeItemCart(event.target.getAttribute("data-name"))
  }
})

function removeItemCart(name) {
  const index = cart.findIndex(item => item.name === name)
  if (index !== -1) {
    cart[index].quantity > 1 ? cart[index].quantity-- : cart.splice(index, 1)
    updateCartModal()
  }
}

enderecoInput.addEventListener("input", () => {
  if (enderecoInput.value.trim() !== "") {
    enderecoInput.classList.remove("border-red-500")
    addressWarn.classList.add("hidden")
  }
})

nomeInput.addEventListener("input", () => {
  if (nomeInput.value.trim() !== "") {
    nomeInput.classList.remove("border-red-500")
    nomeWarn.classList.add("hidden")
  }
})

bairroSelect.addEventListener("change", () => {
  const bairroSelecionado = bairroSelect.value
  const taxa = bairros[bairroSelecionado] || 0
  taxaEntregaSpan.textContent = `R$ ${taxa.toFixed(2)}`
})

checkoutBtn.addEventListener("click", () => {
  const isOpen = checkRestaurantOpen()
  if (!isOpen) {
    Toastify({
      text: "Ops! O restaurante está fechado!",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: { background: "#ef4644" }
    }).showToast()
    return
  }

  if (cart.length === 0) return

  const nome = nomeInput.value.trim()
  const endereco = enderecoInput.value.trim()
  const bairro = bairroSelect.value
  const taxa = bairros[bairro] || 0

  if (nome === "") {
    nomeInput.classList.add("border-red-500")
    nomeWarn.classList.remove("hidden")
    return
  }

  if (endereco === "") {
    enderecoInput.classList.add("border-red-500")
    addressWarn.classList.remove("hidden")
    return
  }

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const total = subtotal + taxa

  const itensFormatados = cart.map(item =>
    `• ${item.name} (x${item.quantity}) - R$ ${item.price.toFixed(2)}`
  ).join("%0A")

  const msg = 
    `🧾 *Novo Pedido* 🧾%0A%0A` +
    `🙍‍♂️ *Nome:* ${nome}%0A` +
    `📦 *Itens:*%0A${itensFormatados}%0A%0A` +
    `📍 *Endereço:* ${endereco}, ${bairro}%0A` +
    `🚚 *Taxa de entrega:* R$ ${taxa.toFixed(2)}%0A` +
    `💰 *Total:* R$ ${total.toFixed(2)}` +
    `🗝️ *Chave Pix:* 54.523.723/0001-02` +
    `⚠️*Ao realizar o pagamento, enviar comprovante de pagamento*⚠️`


  window.open(`https://wa.me/31975783629?text=${msg}`, "_blank")

  // Atualiza dados do modal Pix
document.getElementById("pix-nome").textContent = nome;
document.getElementById("pix-amount").textContent = `R$ ${total.toFixed(2)}`;
document.getElementById("pix-address").textContent = `${endereco}, ${bairro}`;

// Itens do pedido com taxa de entrega incluída
const cartItemsFormattedHTML = cart.map(item => {
  return `🍔 ${item.name} (x${item.quantity}) - R$ ${item.price.toFixed(2)}`
}).join("<br>");

const taxaHTML = `🚚 <strong>Taxa de entrega:</strong> R$ ${taxa.toFixed(2)}<br>`;
const totalHTML = `<strong>Total com entrega:</strong> R$ ${total.toFixed(2)}`;

document.getElementById("pix-order-summary").innerHTML = `
  ${cartItemsFormattedHTML}<br>${taxaHTML}<br>${totalHTML}
`;

// Atualiza QR Code Pix (simulado)
const pixQrCodeImg = document.getElementById("pix-qrcode");
pixQrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=VALOR_${total.toFixed(2).replace(".", "")}&size=250x250`;

// Exibe modal Pix
document.getElementById("pix-modal").style.display = "flex";
document.getElementById("cart-modal").style.display = "none";

})

confirmPixBtn.addEventListener("click", () => {
  document.getElementById("pix-modal").style.display = "none"
  cart = []
  updateCartModal()
})

function checkRestaurantOpen() {
  const data = new Date()
  const hora = data.getHours()
  const diaSemana = data.getDay()
  return diaSemana !== 2 && hora >= 8 && hora < 24
}

