document.addEventListener("DOMContentLoaded", () => {
    let productos = [];

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
        const container = document.querySelector("#product-container");
        container.innerHTML = '';

        productos.forEach((producto, index) => {
            const productCard = document.createElement("div");
            productCard.className = "col-12 col-sm-6 col-md-6 col-lg-4 mb-4";

            const precioNumero = parseFloat(producto.precio.replace(/[$,]/g, ''));
            const precioFormateado = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(precioNumero);
            
            productCard.innerHTML = `
                <div class="card">
                    <img src="${producto.imagen}" class="card-img-top img" alt="${producto.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre.length < 15 ? producto.nombre : producto.nombre.slice(0, 15) + '...'}</h5>
                        <p class="card-text">${precioFormateado}</p>
                        <button class="btn btn-danger finish" onclick="eliminarProducto(${index})">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(productCard);
        });
    }

    // Función para eliminar un producto con confirmación de SweetAlert2
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

                Swal.fire(
                    'Eliminado',
                    'El producto ha sido eliminado.',
                    'success'
                );
            }
        });
    };

    // Manejar el envío del formulario con alerta de éxito
    const productForm = document.getElementById("productForm");
    productForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const nombre = document.getElementById("productName").value;
        const precio = document.getElementById("productPrice").value;
        const imagen = document.getElementById("productImage").value;

        const nuevoProducto = {
            nombre: nombre,
            precio: precio,
            imagen: imagen
        };

        productos.push(nuevoProducto);
        localStorage.setItem("productos", JSON.stringify(productos));
        renderizarProductos(productos);

        productForm.reset();

        Swal.fire({
            icon: 'success',
            title: 'Producto agregado',
            text: '¡El producto se ha agregado exitosamente!',
            showConfirmButton: false,
            timer: 1500
        });
    });
});
