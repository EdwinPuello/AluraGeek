document.addEventListener("DOMContentLoaded", () => {
    let productos = [];
    let editando = false;
    let productoIndex = null;

    const productPriceInput = document.getElementById("productPrice");
    const productForm = document.getElementById("productForm");
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productModalLabel = document.getElementById("productModalLabel");
    const productContainer = document.querySelector("#product-container");

    productPriceInput.addEventListener("input", function() {
        let inputValue = this.value.replace(/[^\d,]/g, '');
        const parts = inputValue.split(',');
        if (parts.length > 2) {
            inputValue = parts[0] + ',' + parts[1].replace(/,/g, '');
        }
        const [integerPart, decimalPart] = inputValue.split(',');
        this.value = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (decimalPart ? ',' + decimalPart : '');
    });

    const productosGuardados = localStorage.getItem("productos");
    if (productosGuardados) {
        productos = JSON.parse(productosGuardados);
        renderizarProductos(productos);
    }

    fetch("./assets/json/productos.json")
        .then(response => response.json())
        .then(data => {
            if (productos.length === 0) {
                productos = data;
                renderizarProductos(productos);
            }
        })
        .catch(error => console.error("Error al cargar los productos:", error));

    function renderizarProductos(productos) {
        productContainer.innerHTML = '';
        productos.forEach((producto, index) => {
            const productCard = document.createElement("div");
            productCard.className = "col-12 col-sm-6 col-md-6 col-lg-3 col-xl-2 mb-4";
            const precioNumero = parseFloat(producto.precio.replace(/[$,]/g, ''));
            const precioFormateado = new Intl.NumberFormat('de-DE', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(precioNumero);
            productCard.innerHTML = `
                <div class="card">
                    <img src="${producto.imagen}" class="card-img-top img" alt="${producto.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre.length < 15 ? producto.nombre : producto.nombre.slice(0, 15) + '...'}</h5>
                        <p class="card-text">$${precioFormateado}</p>
                        <button class="btn btn-warning edit" onclick="editarProducto(${index})">Editar</button>
                        <button class="btn btn-danger finish mt-1" onclick="eliminarProducto(${index})">Eliminar</button>
                    </div>
                </div>
            `;
            productContainer.appendChild(productCard);
        });
    }

    window.editarProducto = function(index) {
        const producto = productos[index];
        const precioSinFormato = parseFloat(producto.precio.replace(/[$,]/g, ''));
        const precioConFormato = precioSinFormato.toLocaleString('de-DE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        document.getElementById("productName").value = producto.nombre;
        document.getElementById("productPrice").value = precioConFormato;
        document.getElementById("productImage").value = producto.imagen;
        editando = true;
        productoIndex = index;
        productModalLabel.innerText = "Editar Producto";
        productModal.show();
    };

    window.eliminarProducto = function(index) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás deshacer esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminarlo',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                productos.splice(index, 1);
                localStorage.setItem("productos", JSON.stringify(productos));
                renderizarProductos(productos);
                Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
            }
        });
    };

    productForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const nombre = document.getElementById("productName").value;
        let precio = document.getElementById("productPrice").value.replace(/\./g, '').replace(',', '.');
        const imagen = document.getElementById("productImage").value;

        Swal.fire({
            icon: 'success',
            title: editando ? 'Producto actualizado' : 'Producto agregado',
            text: `¡El producto se ha ${editando ? 'actualizado' : 'agregado'} exitosamente!`,
            showConfirmButton: false,
            timer: 1500
        });

        if (editando) {
            productos[productoIndex] = { nombre, precio, imagen };
            editando = false;
            productoIndex = null;
            productModalLabel.innerText = "Agregar Producto";
        } else {
            productos.push({ nombre, precio, imagen });
        }

        localStorage.setItem("productos", JSON.stringify(productos));
        renderizarProductos(productos);
        productForm.reset();
        productModal.hide();
    });

    document.getElementById("addProduct").addEventListener("click", () => {
        editando = false;
        productForm.reset();
        productModalLabel.innerText = "Agregar Producto";
    });
});
