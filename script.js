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
    const message = encodeURIComponent(`${cartItems} Valor total da compra: R$${totalPrice.toFixed(2)}`);

    const phone ="31975783629"

    window.open(`https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`, "_blank");


    cart = [];
    updateCartModal();
})

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
