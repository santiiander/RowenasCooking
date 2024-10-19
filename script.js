let carrito = [];

document.body.classList.add('loading');

document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');

    loadingProgress.style.width = '100%';

    fetchProducts().then(() => {
        setTimeout(() => {
            document.body.classList.remove('loading');
            loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
            document.querySelectorAll('body > *:not(#loading-screen)').forEach(el => {
                el.style.display = '';
            });
        }, 3000);
    });

    const botonConsultar = document.getElementById('consultar-pedido');
    botonConsultar.addEventListener('click', consultarPedido);

    // Cart modal functionality
    const carritoIcon = document.getElementById('carrito-icon');
    const carritoModal = document.getElementById('carrito-modal');
    const closeModal = carritoModal.querySelector('.close');

    carritoIcon.addEventListener('click', (e) => {
        e.preventDefault();
        carritoModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        carritoModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == carritoModal) {
            carritoModal.style.display = 'none';
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Contact form submission
    const contactForm = document.getElementById('contacto-form');
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const nombre = formData.get('nombre');
        const email = formData.get('email');
        const mensaje = formData.get('mensaje');

        // Send WhatsApp message
        const whatsappMessage = encodeURIComponent(`¡Hola! soy ${nombre}, mi email es ${email} 😁
${mensaje} 🤗`);
        const whatsappLink = `https://wa.me/5493472549686?text=${whatsappMessage}`;
        window.open(whatsappLink, '_blank');

        Swal.fire({
            title: '¡Mensaje Enviado!',
            text: 'Gracias por contactarnos. Te responderemos pronto.',
            icon: 'success',
            confirmButtonColor: '#FFA5B9'
        });
        
        this.reset();
    });

    // Intersection Observer for fade-in effect
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const heroSection = document.querySelector('.hero');
        const scrollPosition = window.pageYOffset;
        heroSection.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
    });

    // Responsive menu functionality
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !menuToggle.contains(e.target) && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Close menu when clicking a link (in mobile mode)
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });

    // Adjust menu visibility on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
});

async function fetchProducts() {
    const sheetId = '1BcdxpTnuP7LLVgHbrIimGt05haEbdnef7_0cRv0uns0';
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

    try {
        const response = await fetch(sheetUrl);
        const csvText = await response.text();
        const products = parseCSV(csvText);
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    return lines.slice(1).map(line => {
        const [nombre, descripcion, precio, nombreImagen, cantidadVecesPedidas, pedidosTotales] = line.split(',').map(item => item.replace(/^"|"$/g, ''));
        return { nombre, descripcion, precio, nombreImagen, cantidadVecesPedidas: parseInt(cantidadVecesPedidas), pedidosTotales: parseInt(pedidosTotales) };
    });
}

function displayProducts(products) {
    const productosContainer = document.getElementById('productos-container');
    productosContainer.innerHTML = '';

    products.forEach((product, index) => {
        const { nombre, descripcion, precio, nombreImagen } = product;
        const productDiv = document.createElement('div');
        productDiv.className = 'producto';
        productDiv.dataset.id = index + 1;
        productDiv.dataset.nombre = nombre;
        productDiv.dataset.precio = precio;

        const imagenUrl = `Productos/${nombreImagen}`;

        const buttonText = precio === '0' ? 'Próximamente' : 'Agregar al Carrito';
        const buttonClass = precio === '0' ? 'agregar-carrito disabled' : 'agregar-carrito';

        productDiv.innerHTML = `
            <img src="${imagenUrl}" alt="${nombre}" class="producto-imagen" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(nombre)}'">
            <h3>${nombre}</h3>
            <p class="descripcion">${descripcion}</p>
            <p class="precio">$${precio}</p>
            <button class="${buttonClass}">${buttonText}</button>
        `;

        productosContainer.appendChild(productDiv);
    });

    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito);
    });
}

function agregarAlCarrito(evento) {
    const boton = evento.target;
    const producto = boton.closest('.producto');
    const id = producto.dataset.id;
    const nombre = producto.dataset.nombre;
    const precio = parseFloat(producto.dataset.precio);

    if (precio === 0) {
        mostrarNotificacion("Próximamente podrás adquirir este producto", "info");
        return;
    }

    const productoEnCarrito = carrito.find(item => item.id === id);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }

    actualizarCarrito();
    actualizarContadorCarrito();
    mostrarNotificacion(`${nombre} agregado al carrito`);

    // Add animation to the cart icon
    const carritoIcon = document.getElementById('carrito-icon');
    carritoIcon.classList.add('animate__animated', 'animate__rubberBand');
    setTimeout(() => {
        carritoIcon.classList.remove('animate__animated', 'animate__rubberBand');
    }, 1000);
}

function actualizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');

    listaCarrito.innerHTML = '';
    let total = 0;

    carrito.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="producto-carrito">
                <div class="producto-info">
                    ${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad}
                </div>
                <div class="producto-acciones">
                    <input type="number" class="cantidad-eliminar" value="1" min="1" max="${item.cantidad}">
                    <button class="eliminar-producto" data-id="${item.id}">Eliminar</button>
                </div>
            </div>
        `;
        listaCarrito.appendChild(li);
        total += item.precio * item.cantidad;

        const botonEliminar = li.querySelector('.eliminar-producto');
        botonEliminar.addEventListener('click', (e) => eliminarDelCarrito(e, item.id));
    });

    totalCarrito.textContent = total.toFixed(2);
}

function eliminarDelCarrito(evento, id) {
    const cantidadEliminar = parseInt(evento.target.previousElementSibling.value);
    const productoEnCarrito = carrito.find(item => item.id === id);

    if (productoEnCarrito) {
        if (cantidadEliminar >= productoEnCarrito.cantidad) {
            carrito = carrito.filter(item => item.id !== id);
            mostrarNotificacion(`${productoEnCarrito.nombre} eliminado del carrito`);
        } else {
            productoEnCarrito.cantidad -= cantidadEliminar;
            mostrarNotificacion(`${cantidadEliminar} ${productoEnCarrito.nombre}(s) eliminado(s) del carrito`);
        }
        actualizarCarrito();
        actualizarContadorCarrito();
    }
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('carrito-contador');
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    contador.textContent = totalItems;
}

function consultarPedido() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }

    let mensaje = '¡Hola! En mi carrito tengo los siguientes productos:\n\n';

    carrito.forEach(item => {
        mensaje += `${item.nombre} (${item.cantidad}) $${(item.precio * item.cantidad).toFixed(2)}\n`;
    });

    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    mensaje += `\nCon un coste total de $${total.toFixed(2)}\n`;
    mensaje += 'Me gustaría saber los medios de pago y tiempo, así mismo envío y otros detalles!';

    const whatsappLink = `https://wa.me/5493472549686?text=${encodeURIComponent(mensaje)}`;
    window.location.href = whatsappLink;
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    Swal.fire({
        title: mensaje,
        icon: tipo,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
}