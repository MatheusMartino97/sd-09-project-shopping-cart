function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(
    createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'),
  );

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function saveAtTheLocalStorage() {
  const cart = document.querySelector('.cart');
  const stringfiedCart = JSON.stringify(cart.innerHTML);

  localStorage.setItem('cart', stringfiedCart);
}

async function updatePrice() {
  const cartProductsNodeList = document.querySelectorAll('li');
  let currentPrice = 0;

  cartProductsNodeList.forEach((product) => {
    currentPrice += parseFloat(product.id);
  });

  const result = (Math.round(currentPrice * 100) / 100).toFixed(2);

  return result === '0.00' ? '0' : result;
}
async function asyncUpdatePrice() {
  try {
    const diffSpan = document.querySelector('.diff')
    const limitCost = document.querySelector('#limit-cost')
    const totalPrice = await updatePrice();
    const totalPriceSpan = document.querySelector('.total-price');
    let HTMLElement = 'span'
    let HTMLClass = ''

    console.log()

    if (limitCost.value != false) {
      if (parseFloat(totalPrice) > parseFloat(limitCost.value)) {
        const diff = parseFloat(totalPrice) - parseFloat(limitCost.value)

        diffSpan.innerHTML = `Você excedeu $<em class='is-red'>${parseFloat(Math.round(diff * 100) / 100).toFixed(2)}</em> do limite de gasto!`
        HTMLElement = 'em'
        HTMLClass = 'is-red'
      } else if (parseFloat(totalPrice)) {
        HTMLClass = 'is-green'
        diffSpan.innerText = ''
      } else if (!parseFloat(totalPrice)) {
        diffSpan.innerText = ''
      }
    }

    if (parseFloat(totalPrice) === 0 && !limitCost.value) {
      diffSpan.innerText = ''
    }

    totalPriceSpan.innerHTML = `<${HTMLElement} class='${HTMLClass}'>${totalPrice}</${HTMLElement}>`;
  } catch (error) {
    window.alert(error);
  }

  saveAtTheLocalStorage();
}

function removeItem(event) {
  const cartItemsOrderedList = document.querySelector('ul.cart__items');

  cartItemsOrderedList.removeChild(event.target);
  asyncUpdatePrice();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerHTML = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice.toFixed(2)}`;
  li.addEventListener('click', function cartItemClickListener() {
    const cartItemsOrderedList = document.querySelector('ul.cart__items');

    cartItemsOrderedList.addEventListener('click', removeItem);
  });
  return li;
}

function addItems(event) {
  if (event.target.className === 'item__add') {
    const cartSection = document.querySelector('.cart__items');
    const endpoint = `https://api.mercadolibre.com/items/${event.target.parentElement.firstChild.innerText}`;

    fetch(endpoint)
      .then(response => response.json())
      .then((data) => {
        const productInfo = {
          sku: data.id,
          name: data.title,
          salePrice: data.price,
        };

        const cartItemElement = createCartItemElement(productInfo);

        cartItemElement.id = productInfo.salePrice;
        cartSection.appendChild(cartItemElement);
        asyncUpdatePrice(productInfo.salePrice);
      })
      .catch(error => window.alert(error));
  }
}

function addItemsClickListener() {
  const itemAddButtonNodeList = document.querySelector('.items');

  if (itemAddButtonNodeList) {
    itemAddButtonNodeList.addEventListener('click', addItems);
  }
}

function fetchAPI(term) {
  const loadingDiv = document.createElement('div');
  const endpoint = `https://api.mercadolibre.com/sites/MLB/search?q=${term}`;
  const itemsSection = document.querySelector('.items');

  loadingDiv.className = 'loading';
  loadingDiv.innerText = 'loading...';
  document.body.appendChild(loadingDiv);

  fetch(endpoint)
    .then(response => response.json())
    .then((data) => {
      data.results.forEach((result) => {
        const { id: sku, title: name, thumbnail: image } = result;
        // const obj = {
        //   sku: result.id,
        //   name: result.title,
        //   image: result.thumbnail,
        // };
        itemsSection.appendChild(
          createProductItemElement({ sku, name, image }),
        );
      });

      document.body.removeChild(document.querySelector('.loading'));
    })
    .catch((error) => {
      window.alert(error);
    });
}

function clearList() {
  const cartItemsList = document.querySelector('.cart__items');
  const totalPrice = document.querySelector('.total-price');
  const diffSpan = document.querySelector('.diff')

  cartItemsList.innerHTML = '';
  totalPrice.innerText = 0;
  diffSpan.innerText = ''

  saveAtTheLocalStorage();
}

function listenToEmptyCartButton() {
  const emptyCartButton = document.querySelector('.empty-cart');

  if (emptyCartButton) {
    emptyCartButton.addEventListener('click', clearList);
  }
}

function searchProduct() {
  const itemsSection = document.querySelector('.items');
  const searchIptInput = document.querySelector('#search-ipt');

  if (searchIptInput.value) {
    itemsSection.innerHTML = '';

    fetchAPI(searchIptInput.value);
  }
}

function listenToSearchBtn() {
  const searchBtnButton = document.querySelector('button.search-btn');

  searchBtnButton.addEventListener('click', searchProduct);
}

function listenToSearchIpt() {
  const searchIptInput = document.querySelector('#search-ipt');
  const itemsSection = document.querySelector('.items');

  searchIptInput.addEventListener('keypress', (event) => {
    if (event.keyCode === 13 && searchIptInput.value) {
      itemsSection.innerHTML = '';

      fetchAPI(searchIptInput.value);
    }
  });
}

function listenToCartItemsOrderedList() {
  const cartItemsOrderedList = document.querySelector('ul.cart__items');


  cartItemsOrderedList.addEventListener('click', removeItem);
}

function loadLocalStorage() {
  const cart = document.querySelector('.cart');
  const parsedCart = JSON.parse(localStorage.getItem('cart'));

  if (localStorage.getItem('cart')) {
    cart.innerHTML = parsedCart;
  }
}

function alertMaxCost() {
  const searchInput = document.querySelector('#limit-cost')
  const formatedPrice = parseFloat(searchInput.value).toFixed(2)

  if (searchInput.value != false) {
    window.alert(`O custo máximo da compra foi definido para $${formatedPrice}.`)
  }
}

function listenToApplyBtn() {
  const applyButton = document.querySelector('.apply')

  applyButton.addEventListener('click', asyncUpdatePrice)
  applyButton.addEventListener('click', alertMaxCost)
}

function listenToLimitCostipt() {
  const limitCostIpt = document.querySelector('#limit-cost')

  limitCostIpt.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) {
      asyncUpdatePrice()
      alertMaxCost()
    }
  })
}

window.onload = function onload() {
  loadLocalStorage();
  fetchAPI('computador');
  addItemsClickListener();
  listenToEmptyCartButton();
  listenToSearchBtn();
  listenToSearchIpt();
  listenToCartItemsOrderedList();
  listenToApplyBtn()
  listenToLimitCostipt()
};
