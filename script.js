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

let cart = [];

// abrir o modal do carrinho
cartBtn.addEventListener("click", function(){
    updateCartModal();
    cartModal.style.display = "flex"
})

//fechar o modal quando clicar fora
cartModal.addEventListener("click", function(event) {
    if(event.target === cartModal){
        cartModal.style.display = "none"
    }
})

closeModalBtn.addEventListener("click", function(){
    cartModal.style.display = "none"
})

// adcionar item no carrinho
menu.addEventListener("click", function(event){
    let parentButton = event.target.closest(".add-to-cart-btn")
    
    if(parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))
        addToCart(name, price)
    }
})

//função para adcionar no carrinho
function addToCart(name, price){
   const existingItem = cart.find(item => item.name === name)
   if(existingItem){
    //se o item ja existe, aumenta apenas a quanitade + 1
    existingItem.quantity += 1;
   }else{
    cart.push({
        name,
        price,
        quantity: 1,
    })
   }
    updateCartModal()
}

// atualiza o carrinho
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
                    <p class"font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>
                    <button class="remove-from-cart-btn" data-name="${item.name}">
                        Remover
                    </button>
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

//função para remover item do carrinho
cartItemsContainer.addEventListener("click", function (event){
    if(event.target.classList.contains("remove-from-cart-btn")){
        const name = event.target.getAttribute("data-name")

        removeItemCart(name);
    }
})

function removeItemCart(name){
    const index = cart.findIndex(item => item.name === name);

    if(index !== -1){
        const item = cart[index];

        if(item.quantity > 1){
            item.quantity -= 1;
            updateCartModal();
            return;
        }
        cart.splice(index, 1);
        updateCartModal();
    }
}

//endereçamento
addressInput.addEventListener("input", function(event){
    let inputValue = event.target.value;
    if(inputValue !== ""){
        addressInput.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")
    }
    
})

//fechar carrinho
checkoutBtn.addEventListener("click", function(){

    //const isOpen = checkRestaurantOpen();
   // if(isOpen){
  //      alert("RESTAURANTE FECHADO NO MOMENTO!")
   //     return;
  //  }

  const isOpen = checkRestaurantOpen();
  if(!isOpen) {
    Toastify({
        text: "Ops! O restaurante está fechado!",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background:"#ef4644"
        },
    }).showToast();
    return;
  }

    if(cart.length === 0) return;

    if(addressInput.value === ""){
        addressWarn.classList.remove("hidden")
        addressInput.classList.add("border-red-500")
        return;
    }

    const calculateItemTotal = (item) => {
        return item.quantity * item.price;
    }

    //enviar o pedido para a api do whatsapp
    const cartItems = cart.map((item) => {
        const itemTotal = calculateItemTotal(item);
        return(
            ` ${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price}| `
        )
      
    }).join("");

   const totalPrice = cart.reduce((total, item) => {
    return total + calculateItemTotal(item);
}, 0);

// Atualiza dados do modal Pix
document.getElementById("pix-amount").textContent = `R$ ${totalPrice.toFixed(2)}`;
document.getElementById("pix-address").textContent = addressInput.value;

const cartItemsFormatted = cart.map(item => {
    return `Item: ${item.name} (x${item.quantity}) - R$ ${item.price.toFixed(2)}`;
}).join("<br>");

document.getElementById("pix-order-summary").innerHTML = cartItemsFormatted;

// Atualiza o QRCode Pix (recomendado: usar uma API para gerar o QR com o valor)
const pixQrCodeImg = document.getElementById("pix-qrcode");
pixQrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=00020126580014br.gov.bcb.pix011131975783629520400005303986540${totalPrice.toFixed(2).replace('.', '')}5802BR5925Fabricia Gonçalves Jorge6009SAO PAULO62140510CHAVEPAG1234567896304B14F&size=250x250`;

// Abre o modal Pix
document.getElementById("pix-modal").style.display = "flex";



    cart = [];
    updateCartModal();
})

confirmPixBtn.addEventListener("click", () => {
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const formattedItems = cart.map(item => {
        return `• ${item.name} (x${item.quantity}) - R$ ${item.price.toFixed(2)}`;
    }).join("%0A"); // %0A = quebra de linha no WhatsApp

    const message = 
        `🧾 *Novo Pedido* 🧾%0A%0A` +
        `🍔 *Itens:*%0A${formattedItems}%0A%0A` +
        `💰 *Total:* R$ ${totalPrice.toFixed(2)}%0A%0A` +
        `📍 *Endereço para entrega:*%0A${addressInput.value}`;

    window.open(`https://wa.me/31975783629?text=${message}`, "_blank");

    cart = [];
    updateCartModal();
    pixModal.style.display = "none";
});




//verificar a hora e manipular o card horario
function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    const diaSemana = data.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    const abertoHoje = diaSemana !== 1; // Aberto se NÃO for segunda (1)
    const horarioAberto = hora >= 8 && hora < 24;

    return abertoHoje && horarioAberto;
}
const spanItem = document.getElementById("date-span")
const isOpen = checkRestaurantOpen();

if(isOpen){
    spanItem.classList.remove("bg-red-500")
    spanItem.classList.add("bg-green-600")
}else{
    spanItem.classList.remove("bg-green-600")
    spanItem.classList.add("bg-red-500")
}


const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY + 200; // compensa o menu fixo

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
