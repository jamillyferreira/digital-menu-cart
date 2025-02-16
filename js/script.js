const menu = document.getElementById('menu');
const cartButton = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const spanAdressWarn = document.getElementById('address-warn');
const cartItemsContainer = document.getElementById('cart-items');
const closeModalButton = document.getElementById('close-modal-btn');
const inputAddress = document.getElementById('address');


let cart = [];

// Verifica se o restaurante está aberto (das 18h às 23h)
const checkRestaurantOpen = () => {
    const data = new Date();
    const hours = data.getHours();
    return hours >= 18 && hours <= 23;
};

// Exibe modal
cartButton.addEventListener('click', () => {
    cartModal.style.display = 'flex';
});

// fecha modal
const closeModal = (modal) => {
    modal.style.display = 'none';
};

cartModal.addEventListener('click', (e) => {
    if(e.target === cartModal) closeModal(cartModal);
});

closeModalButton.addEventListener('click', () => closeModal(cartModal));

// Adiciona item ao carrinho
menu.addEventListener('click', (e) => {
    let parentButton = e.target.closest('.add-car-btn');
    if(parentButton) {
        const name = parentButton.getAttribute('data-name');
        const price = parseFloat(parentButton.getAttribute('data-price'));
        addToCart(name, price)
    }      
});

const addToCart = (name, price) => {
    const hasItem = cart.find(item => item.name === name);
    if(hasItem) hasItem.quantity += 1; // Incrementa a quantidade se o item já estiver no carrinho
    else cart.push({name, price, quantity: 1,}) // Adiciona um novo item ao carrinho
    updateCartModal();  
};

// Atualiza o modal do carrinho
const updateCartModal = () => {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('flex', 'justify-between', 'flex-col', 'mb-4')

        const itemContent = document.createElement('div');
        itemContent.classList.add('flex', 'items-center', 'justify-between')
        
        const itemDetails = document.createElement('div');
        itemDetails.innerHTML = `
            <p class='font-medium'>${item.name}</p>
            <p>Qtd: ${item.quantity}</p>
            <p class='font-bold'>R$${item.price.toFixed(2)}</p>
        `
        const removeFromCartBtn = document.createElement('button');
        removeFromCartBtn.classList.add('remove-from-cart-btn', 'bg-red-400', 'text-white', 'px-2', 'rounded')
        removeFromCartBtn.setAttribute('data-name', item.name)
        removeFromCartBtn.textContent = 'Remover';

        cartItemElement.appendChild(itemContent)
        itemContent.appendChild(itemDetails);
        itemContent.appendChild(removeFromCartBtn);
        cartItemsContainer.appendChild(cartItemElement);

        total += item.price * item.quantity;
    })

    document.getElementById('cart-total').textContent = total.toLocaleString('PT-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    document.getElementById('cart-count').textContent = cart.length;  
};

// Remove item do carrinho
cartItemsContainer.addEventListener('click', (e) => {
    if(e.target.classList.contains('remove-from-cart-btn')) {
        const name = e.target.getAttribute('data-name');
        removeItemCart(name);
    }
});

const removeItemCart = (name) => {
    const index = cart.findIndex(item => item.name === name);
    if(index !== -1) {
        const item = cart[index];
        if(item.quantity > 1) item.quantity -= 1;
        else cart.splice(index, 1) 
        updateCartModal();
    };
};

// Finaliza pedido
const finishButton = document.getElementById('finish-btn');
finishButton.addEventListener('click', (e) => {
    const isOpen = checkRestaurantOpen();
    if(!isOpen) {
    Toastify({
        text: "Lanchonete Fechada, abre as 18hrs!",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true, 
        style: {
            color: '#000',
            background: "#ffff",
        },
      }).showToast();
      return;
}
    if (cart.length === 0) return;

// Valida o endereço antes de finalizar o pedido
    const address = inputAddress.value.trim()
    if(!address) {
        showErrorAddress('O endereço não pode estar vazio.');
        return;
    }

    if(!/\d/.test(address)) {
        showErrorAddress('O endereço deve conter um número');
        return;
    };

    const streetKeywords = ['Rua', 'Avenida', 'Almeida', 'Travessa', 'Praça'];
    const hasKeyword = streetKeywords.some(keyword => address.includes(keyword));
    if(!hasKeyword) {
        showErrorAddress('O endereço deve conter o tipo de Logradouro (ex: rua, avenida).');
        return;
    }

    const message = cart.map(item => `${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price}`).join('');
    const phone = '99999999999';

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)} Endereço: ${address}`, '_blank')

    cart = [];
    updateCartModal(); // Atualiza o modal do carrinho
    closeModal(); 
});
// Mostra erro no enderço
const showErrorAddress = (message) => {
    const spanAdressWarn = document.getElementById('address-warn');
    spanAdressWarn.classList.remove('hidden');
    spanAdressWarn.innerHTML = message;
    inputAddress.classList.add('border-red-500');
};

// Limpa erro ao digitar
inputAddress.addEventListener('input', (e) => {
    let inputValue = e.target.value;
    if(inputValue !== '') {
        inputAddress.classList.remove('border-red-500');
        spanAdressWarn.classList.add('hidden')
    }
});

