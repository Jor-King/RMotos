const API = "https://script.google.com/macros/s/AKfycbxt5EmzUQ2d3mEQRr0eXYmCoA-Mgzbeh70XtfMYSt1j_vGA3OTkrQKJGtAZMunXySM1/exec";

let todosProductos = [];
let productosVisibles = 20;

let timeoutBusqueda;
let cargandoMas = false;

window.addEventListener(
  "load",
  updateCartCounter
);

function mostrarLoader() {
    document
        .getElementById("loader")
        .classList.add("show");
}

function ocultarLoader() {
    document
        .getElementById("loader")
        .classList.remove("show");
}

async function cargarProductos(texto = "") {

    try {

        mostrarLoader();

        const res = await fetch(
            `${API}?accion=productos&q=${encodeURIComponent(texto)}`
        );

        const data = await res.json();

        console.log(data);

        todosProductos = data.productos || [];

        productosVisibles = 20;

        renderizar();

    } catch (error) {

        console.error(error);

    } finally {

        ocultarLoader();

    }

}

function renderizar() {

    const contenedor =
        document.getElementById("grid");

    contenedor.innerHTML = "";
    const totalProductos =
        document.getElementById("totalProductos");

    if (totalProductos) {
        totalProductos.textContent =
            `${todosProductos.length} productos`;
    }

    const productosMostrar =
        todosProductos.slice(
            0,
            productosVisibles
        );

    if (productosMostrar.length === 0) {

        contenedor.innerHTML = `
            <div class="sin-resultados">
                <h3>No se encontraron productos</h3>
                <p>
                    Intenta buscar por nombre,
                    código o marca.
                </p>
            </div>
        `;

        return;
    }

    productosMostrar.forEach(producto => {

        const cartItem =
            getCartItem(
            producto.id_producto
        );

        const cantidad =
            cartItem
            ? cartItem.cantidad
            : 0;

        contenedor.insertAdjacentHTML(
            "beforeend",
            `
            <div class="card">

                <div class="card-img">
                <img
                    src="${producto.imagen_url || ''}"
                    alt="${producto.nombre || ''}"
                    loading="lazy"
                    onclick="abrirImagen('${producto.imagen_url}')"
                    onerror="this.src='https://placehold.co/500x500?text=RMotos'"
                >
                </div>

                <div class="card-body">

                <div class="badge-row">

                    <span class="badge bp">
                        ${producto.marca || ''}
                    </span>

                    <span class="badge bm">
                        ${producto.categoria || ''}
                    </span>

                    <span class="badge ${
                        producto.disponibilidad === "Disponible"
                            ? "bp"
                            : "bo"
                    }">
                        ${producto.disponibilidad || ""}
                    </span>

                </div>

                    <div class="pname">
                        ${producto.nombre || ''}
                    </div>

                    <div class="psku">
                        ${producto.codigo || ''}
                    </div>

                    <div class="pfooter">
                        <div class="pprice">
                            $${Number(
                                producto.precio_venta || 0
                            ).toLocaleString("es-CO")}
                        </div>

                        <button
                                class="cart-btn ${cantidad > 0 ? 'added' : ''}"
                                ${cantidad > 0 ? 'disabled="true"' : ''}
                                onclick='if(${cantidad <= 0}) addToCart({

                                    id_producto:"${producto.id_producto}",

                                    nombre:"${producto.nombre}",

                                    imagen_url:"${producto.imagen_url}",

                                    precio_venta:${producto.precio_venta}

                                })'>


                                <svg
                                    class="cart-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.3">

                                    <circle cx="9" cy="20" r="1"/>
                                    <circle cx="18" cy="20" r="1"/>

                                    <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 8H7"/>

                                </svg>

                        </button>

                    </div>

                </div>

            </div>
            `
        );

    });

}

window.addEventListener("scroll", () => {

    if (cargandoMas) return;

    const cercaDelFinal =
        window.innerHeight +
        window.scrollY >=
        document.body.offsetHeight - 300;

    if (
        cercaDelFinal &&
        productosVisibles < todosProductos.length
    ) {

        cargandoMas = true;

        mostrarLoader();

        setTimeout(() => {

            productosVisibles += 20;

            renderizar();

            ocultarLoader();

            cargandoMas = false;

        }, 150);

    }

});

document
    .getElementById("buscar")
    .addEventListener("input", e => {

        clearTimeout(timeoutBusqueda);

        timeoutBusqueda = setTimeout(() => {

            cargarProductos(
                e.target.value
            );

        }, 300);

    });

cargarProductos();

function abrirImagen(url) {

    document
        .getElementById("imagenGrande")
        .src = url;

    document
        .getElementById("modalImagen")
        .classList.add("show");

}

function cerrarImagen() {

    document
        .getElementById("modalImagen")
        .classList.remove("show");

}

document
    .getElementById("modalImagen")
    .addEventListener("click", cerrarImagen);

document
    .querySelector(".cerrar-modal")
    .addEventListener("click", cerrarImagen);



//Funciones carrido de compras

function addToCart(producto) {
  let carrito =
    JSON.parse(localStorage.getItem("cart")) || [];

  const existente = carrito.find(
    p => p.id === producto.id_producto
  );

  // Si ya existe, no hacer nada
  if (existente) {
    return;
  }

  carrito.push({
    id: producto.id_producto,
    nombre: producto.nombre,
    imagen: producto.imagen_url,
    precio: producto.precio_venta,
    cantidad: 1
  });

  localStorage.setItem(
    "cart",
    JSON.stringify(carrito)
  );

  updateCartCounter();
  renderizar();
}

function updateCartCounter() {

  const carrito =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  const total =
    carrito.reduce(
      (acc, item) =>
        acc + item.cantidad,
      0
    );

  const badge =
    document.getElementById(
      "notificationCount"
    );

  badge.textContent = total;

  badge.style.display =
    total > 0
      ? "flex"
      : "none";

}


function loadCart() {

  const carrito =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  renderCart(carrito);

}

function getCartItem(idProducto) {

  const cart =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  return cart.find(
    p => p.id === idProducto
  );

}

function removeFromCart(idProducto) {

  let carrito =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  carrito = carrito.filter(
    p => p.id !== idProducto
);

  localStorage.setItem(
    "cart",
    JSON.stringify(carrito)
  );

  updateCartCounter();
  renderizar();

}

function openCart() {

  document
    .getElementById("cartDrawer")
    .classList.add("active");

  document
    .getElementById("cartOverlay")
    .classList.add("active");

  loadCart();

}

function closeCart() {

  document
    .getElementById("cartDrawer")
    .classList.remove("active");

  document
    .getElementById("cartOverlay")
    .classList.remove("active");

}

function formatMoney(valor) {
  return new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }
  ).format(valor);
}

function renderCart(carrito) {

  const container =
    document.getElementById(
      "cartItems"
    );

  const confirmBtn =
    document.querySelector(
      ".confirm-cart-btn"
    );

  container.innerHTML = "";

  if (!carrito || carrito.length === 0) {

    container.innerHTML = `

      <div
        class="cart-empty"
        style="
          width:100%;
          padding:22px 14px;
          text-align:center;
          border-radius:14px;
          border:1px dashed #e8e8e8;
          background:#fff;
        ">

        <div
          style="
            width:52px;
            height:52px;
            border-radius:16px;
            background:var(--red-light);
            margin:0 auto 12px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">

          <span
            style="
              font-size:22px;
              line-height:1;
              color:var(--red);
            ">
            🛒
          </span>

        </div>

        <h3
          style="
            font-size:18px;
            margin-bottom:6px;
          ">
          Tu carrito está vacío
        </h3>

        <p
          style="
            color:var(--soft);
            font-size:14px;
            margin:0;
          ">
          Agrega productos para continuar.
        </p>

      </div>

    `;

    document.getElementById(
      "cartTotal"
    ).textContent =
      formatMoney(0);

    confirmBtn.disabled = true;

    return;
  }

  confirmBtn.disabled = false;

  let total = 0;

  carrito.forEach(item => {

    const subtotal =
      item.precio *
      item.cantidad;

    total += subtotal;

    container.innerHTML += `

      <div
        class="cart-item"
        style="
          align-items:center;
          border:1px solid #eee;
          border-radius:12px;
          padding:10px;
          background:#fff;
        ">

        <img
          src="${item.imagen}"
          class="cart-item-image"
          style="
            width:100px;
            height:100px;
            border-radius:10px;
            object-fit:cover;
            flex-shrink:0;
          ">

        <div
          class="cart-item-info"
          style="
            flex:1;
            display:flex;
            flex-direction:column;
            gap:6px;
          ">

          <div
            class="cart-item-name"
            style="
              font-size:14px;
              font-weight:800;
              line-height:1.2;
            ">
            ${item.nombre}
          </div>

          <div
            class="cart-item-price"
            style="
              font-size:14px;
              font-weight:900;
              color:var(--red);
            ">
            ${formatMoney(item.precio)}
          </div>

          <div
            class="qty-controls"
            style="
              display:flex;
              align-items:center;
              justify-content:right;
              gap:10px;
              margin-top:6px;
            ">

            <button
              onclick="decreaseQty('${item.id}')"
              style="
                width:34px;
                height:34px;
                border-radius:10px;
                border:1px solid #eee;
                background:#f7f7f7;
                cursor:pointer;
                font-size:20px;
                line-height:1;
                color:var(--mid);
              ">
              −
            </button>

            <span
              style="
                min-width:30px;
                text-align:center;
                font-weight:800;
                color:var(--text);
              ">
              ${item.cantidad}
            </span>

            <button
              onclick="increaseQty('${item.id}')"
              style="
                width:34px;
                height:34px;
                border-radius:10px;
                border:1px solid #f0d5d5;
                background:var(--red-light);
                cursor:pointer;
                font-size:20px;
                line-height:1;
                color:var(--red);
              ">
              +
            </button>

          </div>

        </div>

      </div>

    `;

  });

  document.getElementById(
    "cartTotal"
  ).textContent =
    formatMoney(total);

}
function increaseQty(id) {

  const carrito =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  const item =
    carrito.find(
      p => p.id === id
    );

  item.cantidad++;

  localStorage.setItem(
    "cart",
    JSON.stringify(carrito)
  );

  updateCartCounter();

  loadCart();

}

function decreaseQty(id) {

  let carrito =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  const item =
    carrito.find(
      p => p.id === id
    );

  item.cantidad--;

  if (
    item.cantidad <= 0
  ) {

    carrito =
      carrito.filter(
        p => p.id !== id
      );

  }

  localStorage.setItem(
    "cart",
    JSON.stringify(carrito)
  );

  updateCartCounter();

  loadCart();
  renderizar();

}

function confirmCart() {

  const carrito =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  if (!carrito.length) {

    alert(
      "El carrito está vacío"
    );

    return;
  }

  let mensaje =
    "🛒 *NUEVO PEDIDO*\n\n";

  let total = 0;

  carrito.forEach((p, i) => {

    const subtotal =
      p.precio * p.cantidad;

    total += subtotal;

    mensaje +=
      `${i + 1}. ${p.nombre}\n` +
      `Código: ${p.id}\n` +
      `Cantidad: ${p.cantidad}\n` +
      `Precio: $${p.precio.toLocaleString("es-CO")}\n` +
      `Subtotal: $${subtotal.toLocaleString("es-CO")}\n\n`;

  });

  mensaje +=
    `💰 *TOTAL:* $${total.toLocaleString("es-CO")}\n\n`;

  mensaje +=
    "Por favor indíqueme disponibilidad y forma de entrega.";

  const numero =
    "573007162353"; // tu número

  const url =
    `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  window.open(
    url,
    "_blank"
  );

}


const mensajesMoto = [

    "¿No encuentras un producto? Escríbenos por WhatsApp.",

    "Tenemos miles de referencias disponibles.",

    "Pregunta por productos que aún no aparecen en el catálogo.",

    "Precios competitivos para ayudarte a ahorrar.",

    "Repuestos, aceites y accesorios para tu moto."

];

let mensajeActual = 0;

const mensajeElemento =
    document.getElementById(
        "motoMessage"
    );

mensajeElemento.textContent =
    mensajesMoto[0];

setInterval(() => {

    mensajeActual++;

    if(
        mensajeActual >=
        mensajesMoto.length
    ){
        mensajeActual = 0;
    }

    mensajeElemento.textContent =
        mensajesMoto[mensajeActual];

}, 18000);