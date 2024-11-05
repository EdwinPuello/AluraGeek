document.addEventListener("DOMContentLoaded", () => {
    let productos = [];

    // Cargar productos desde localStorage si existen
    const productosGuardados = localStorage.getItem("productos");
    if (productosGuardados) {
        productos = JSON.parse(productosGuardados); // Convertir la cadena JSON en un array
        renderizarProductos(productos);
    }

    // Cargar productos desde el JSON si no hay en localStorage
    fetch("./assets/json/productos.json")
        .then(response => response.json())
        .then(data => {
            if (productos.length === 0) { // Solo cargar desde JSON si no hay productos guardados
                productos = data; // Almacenar los productos en la variable
                renderizarProductos(productos);
            }
        })
        .catch(error => console.error("Error al cargar los productos:", error));

    function renderizarProductos(productos) {
        const container = document.querySelector("#product-container");
        container.innerHTML = ''; // Limpiar el contenedor antes de agregar los productos

        productos.forEach((producto, index) => {
            const productCard = document.createElement("div");
            productCard.className = "col-md-2 mb-4";

            const precioNumero = parseFloat(producto.precio.replace(/[$,]/g, ''));

            // Formatear el precio
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

    // Función para eliminar un producto
    window.eliminarProducto = function(index) {
        const container = document.querySelector("#product-container");
        const productCard = container.children[index];
        
        if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
            productCard.children[0].classList.add('pixeled');
            setTimeout(() => {
                productos.splice(index, 1); // Eliminar el producto del array
                localStorage.setItem("productos", JSON.stringify(productos)); // Actualizar localStorage
                renderizarProductos(productos); // Volver a renderizar los productos
            }, 300);
        } else {
            // Si el usuario cancela, se elimina la clase para volver a mostrar el producto
            productCard.children[0].classList.remove('pixeled');
        }
    };

    // Manejar el envío del formulario
    const productForm = document.getElementById("productForm");
    productForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        // Obtener los valores del formulario
        const nombre = document.getElementById("productName").value;
        const precio = document.getElementById("productPrice").value;
        const imagen = document.getElementById("productImage").value;

        // Crear un nuevo objeto de producto
        const nuevoProducto = {
            nombre: nombre,
            precio: precio,
            imagen: imagen
        };

        // Agregar el nuevo producto al array y actualizar localStorage
        productos.push(nuevoProducto);
        localStorage.setItem("productos", JSON.stringify(productos)); // Guardar en localStorage
        renderizarProductos(productos);

        // Limpiar el formulario
        productForm.reset();
    });
});
