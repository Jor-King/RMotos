const API = "https://script.google.com/macros/s/AKfycbxt5EmzUQ2d3mEQRr0eXYmCoA-Mgzbeh70XtfMYSt1j_vGA3OTkrQKJGtAZMunXySM1/exec";

let todosProductos = [];
let productosVisibles = 20;

let timeoutBusqueda;
let cargandoMas = false;

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
    document.getElementById("totalProductos").textContent =
    `${todosProductos.length} productos`;

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

        contenedor.insertAdjacentHTML(
            "beforeend",
            `
            <div class="card">

                <div class="card-img">
                    <img
                        src="${producto.imagen_url || ''}"
                        alt="${producto.nombre || ''}"
                        loading="lazy"
                        onerror="this.src='https://placehold.co/500x500?text=RMotos'"
                    >
                </div>

                <div class="card-body">

                    <div class="badge-row">
                        <span class="badge bp">
                            ${producto.marca || ''}
                        </span>
                        <span class="badge bm">${producto.categoria || ''}</span>
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