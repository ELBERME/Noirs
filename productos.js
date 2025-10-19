// ==== CARGAR PRODUCTOS DESDE JSON ====
let todosLosProductos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let productoActual = null;

// Elementos del DOM
const carrusel = document.getElementById("carrusel");
const camisas = document.getElementById("camisas");
const pantalones = document.getElementById("pantalones");
const zapatos = document.getElementById("zapatos");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImagen");
const modalTitulo = document.getElementById("modalTitulo");
const modalDescripcion = document.getElementById("modalDescripcion");
const modalPrecio = document.getElementById("modalPrecio");
const modalMateriales = document.getElementById("modalMateriales");
const cerrarModal = document.getElementById("cerrarModal");
const agregarCarritoBtn = document.getElementById("agregarCarrito");
const carritoFlotante = document.getElementById("carritoFlotante");
const panelCarrito = document.getElementById("panelCarrito");
const listaCarrito = document.getElementById("listaCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const vaciarCarrito = document.getElementById("vaciarCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");

// Detectar si estamos en página de hombre o mujer
const paginaActual = window.location.pathname;
const esHombre = paginaActual.includes('hombre.html');
const esMujer = paginaActual.includes('mujer.html');

// ==== CARGAR PRODUCTOS DESDE JSON ====
async function cargarProductos() {
  try {
    const response = await fetch('productos.json');
    const productos = await response.json();
    
    // Filtrar productos según la página
    if (esHombre) {
      todosLosProductos = productos.filter(p => p.categoria === 'Hombre');
    } else if (esMujer) {
      todosLosProductos = productos.filter(p => p.categoria === 'Mujer');
    } else {
      todosLosProductos = productos;
    }
    
    mostrarProductos();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    // Fallback a productos de ejemplo si falla
    usarProductosEjemplo();
  }
}

// ==== MOSTRAR PRODUCTOS ====
function mostrarProductos() {
  // Limpiar contenedores
  if (carrusel) carrusel.innerHTML = '';
  if (camisas) camisas.innerHTML = '';
  if (pantalones) pantalones.innerHTML = '';
  if (zapatos) zapatos.innerHTML = '';

  // Productos destacados para el carrusel
  const destacados = todosLosProductos.filter(p => p.destacado);
  
  destacados.forEach(p => {
    if (carrusel) {
      const card = crearCardCarrusel(p);
      carrusel.appendChild(card);
    }
  });

  // Clasificar productos por tipo (buscar en nombre y descripción)
  todosLosProductos.forEach(p => {
    const nombre = p.nombre.toLowerCase();
    const descripcion = p.descripcion.toLowerCase();
    
    // Crear card para cada sección donde corresponda
    if (nombre.includes('camisa') || nombre.includes('blusa') || nombre.includes('top')) {
      if (camisas) {
        const card = crearCardProducto(p);
        agregarEventListenersCard(card, p);
        camisas.appendChild(card);
      }
    }
    if (nombre.includes('pantalon') || nombre.includes('jean') || nombre.includes('vaquero')) {
      if (pantalones) {
        const card = crearCardProducto(p);
        agregarEventListenersCard(card, p);
        pantalones.appendChild(card);
      }
    }
    if (nombre.includes('zapato') || nombre.includes('zapatilla') || nombre.includes('mocas')) {
      if (zapatos) {
        const card = crearCardProducto(p);
        agregarEventListenersCard(card, p);
        zapatos.appendChild(card);
      }
    }
  });
}

// ==== AGREGAR EVENT LISTENERS A CARDS ====
function agregarEventListenersCard(card, producto) {
  const botonCarrito = card.querySelector('.boton-carrito');
  const botonVerRapido = card.querySelector('.boton-ver-rapido');
  
  if (botonCarrito) {
    botonCarrito.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirModal(producto);
    });
  }
  
  if (botonVerRapido) {
    botonVerRapido.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirModal(producto);
    });
  }
  
  card.addEventListener('click', () => abrirModal(producto));
}

// ==== CREAR CARD PARA CARRUSEL ====
function crearCardCarrusel(producto) {
  const card = document.createElement("div");
  card.classList.add("card");
  
  const precioFinal = calcularPrecioFinal(producto);
  const tieneDescuento = producto.descuento > 0;
  
  card.innerHTML = `
    <div class="card-imagen">
      <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://placehold.co/400x400/d4af37/1a1a1a?text=${encodeURIComponent(producto.nombre)}'">
      ${tieneDescuento ? `<span class="badge-descuento">-${(producto.descuento * 100).toFixed(0)}%</span>` : ''}
    </div>
    <div class="card-contenido">
      <h4>${producto.nombre}</h4>
      <div class="precio-container">
        ${tieneDescuento ? `<span class="precio-original">$${producto.precio.toLocaleString()}</span>` : ''}
        <span class="precio-actual">$${precioFinal.toLocaleString()}</span>
      </div>
    </div>
  `;
  
  card.addEventListener("click", () => abrirModal(producto));
  return card;
}

// ==== CREAR CARD PARA PRODUCTOS ====
function crearCardProducto(producto) {
  const div = document.createElement("div");
  div.classList.add("producto");
  
  const precioFinal = calcularPrecioFinal(producto);
  const tieneDescuento = producto.descuento > 0;
  
  div.innerHTML = `
    <div class="producto-imagen">
      <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://placehold.co/400x400/d4af37/1a1a1a?text=${encodeURIComponent(producto.nombre)}'">
      ${tieneDescuento ? `<span class="badge-descuento">-${(producto.descuento * 100).toFixed(0)}%</span>` : ''}
      <div class="producto-overlay">
        <button class="boton-ver-rapido">Vista rápida</button>
      </div>
    </div>
    <div class="producto-info">
      <h4>${producto.nombre}</h4>
      <p class="producto-descripcion-corta">${producto.descripcion.substring(0, 60)}...</p>
      <div class="precio-container">
        ${tieneDescuento ? `<span class="precio-original">$${producto.precio.toLocaleString()}</span>` : ''}
        <span class="precio-actual">$${precioFinal.toLocaleString()}</span>
      </div>
      <button class="boton-carrito">Agregar al carrito</button>
    </div>
  `;
  
  return div;
}

// ==== CALCULAR PRECIO CON DESCUENTO ====
function calcularPrecioFinal(producto) {
  if (producto.descuento > 0) {
    return Math.round(producto.precio * (1 - producto.descuento));
  }
  return producto.precio;
}

// ==== MODAL ====
function abrirModal(producto) {
  modal.style.display = "flex";
  modalImg.src = producto.imagen;
  modalTitulo.textContent = producto.nombre;
  modalDescripcion.textContent = producto.descripcion;
  
  const precioFinal = calcularPrecioFinal(producto);
  const tieneDescuento = producto.descuento > 0;
  
  if (tieneDescuento) {
    modalPrecio.innerHTML = `
      <span class="precio-original-modal">$${producto.precio.toLocaleString()}</span>
      <span class="precio-actual-modal">$${precioFinal.toLocaleString()}</span>
      <span class="ahorro-modal">¡Ahorras $${(producto.precio - precioFinal).toLocaleString()}!</span>
    `;
  } else {
    modalPrecio.innerHTML = `<span class="precio-actual-modal">$${precioFinal.toLocaleString()}</span>`;
  }
  
  // Mostrar materiales
  if (modalMateriales && producto.materiales) {
    modalMateriales.innerHTML = `<strong>Materiales:</strong> ${producto.materiales.join(', ')}`;
  }
  
  productoActual = producto;
  document.body.style.overflow = 'hidden'; // Prevenir scroll
}

function cerrarModalFunc() {
  modal.style.display = "none";
  document.body.style.overflow = 'auto';
}

cerrarModal.addEventListener("click", cerrarModalFunc);
window.addEventListener("click", e => { 
  if (e.target === modal) cerrarModalFunc(); 
});

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'flex') {
    cerrarModalFunc();
  }
});

agregarCarritoBtn.addEventListener("click", () => {
  agregarAlCarrito(productoActual);
  cerrarModalFunc();
  mostrarNotificacion('Producto agregado al carrito');
});

// ==== CARRITO ====
function agregarAlCarrito(producto) {
  const precioFinal = calcularPrecioFinal(producto);
  const productoCarrito = {
    ...producto,
    precioFinal: precioFinal
  };
  carrito.push(productoCarrito);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  
  if (carrito.length === 0) {
    listaCarrito.innerHTML = '<li class="carrito-vacio">Tu carrito está vacío</li>';
    totalCarrito.textContent = '';
    contadorCarrito.textContent = '0';
    return;
  }
  
  carrito.forEach((p, i) => {
    const li = document.createElement("li");
    li.classList.add('item-carrito');
    li.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" class="carrito-item-img">
      <div class="carrito-item-info">
        <h5>${p.nombre}</h5>
        <p>$${p.precioFinal.toLocaleString()}</p>
      </div>
      <button class="eliminar-item" data-index="${i}">×</button>
    `;
    listaCarrito.appendChild(li);
  });
  
  // Event listeners para eliminar items
  document.querySelectorAll('.eliminar-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      actualizarCarrito();
    });
  });
  
  const total = carrito.reduce((a, b) => a + b.precioFinal, 0);
  totalCarrito.innerHTML = `
    <div class="carrito-total">
      <span>Total:</span>
      <span class="total-precio">$${total.toLocaleString()}</span>
    </div>
    <button class="boton-finalizar">Finalizar compra</button>
  `;
  
  contadorCarrito.textContent = carrito.length;
}

vaciarCarrito.addEventListener("click", () => {
  if (carrito.length > 0 && confirm('¿Estás seguro de vaciar el carrito?')) {
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarCarrito();
    mostrarNotificacion('Carrito vaciado');
  }
});

// ==== BOTÓN FLOTANTE ====
carritoFlotante.addEventListener("click", () => {
  panelCarrito.classList.toggle("activo");
});

// Cerrar panel al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!panelCarrito.contains(e.target) && !carritoFlotante.contains(e.target)) {
    panelCarrito.classList.remove('activo');
  }
});

// ==== NOTIFICACIONES ====
function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.className = 'notificacion';
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  
  setTimeout(() => notif.classList.add('mostrar'), 10);
  setTimeout(() => {
    notif.classList.remove('mostrar');
    setTimeout(() => notif.remove(), 300);
  }, 2000);
}

// ==== CARRUSEL AUTOMÁTICO MEJORADO ====
let desplazamiento = 0;
let pausarCarrusel = false;

function animarCarrusel() {
  if (!pausarCarrusel && carrusel) {
    desplazamiento += 1;
    carrusel.scrollLeft = desplazamiento;
    
    if (desplazamiento >= carrusel.scrollWidth - carrusel.clientWidth) {
      desplazamiento = 0;
    }
  }
}

if (carrusel) {
  setInterval(animarCarrusel, 30);
  
  carrusel.addEventListener('mouseenter', () => pausarCarrusel = true);
  carrusel.addEventListener('mouseleave', () => pausarCarrusel = false);
}

// ==== PRODUCTOS DE EJEMPLO (FALLBACK) ====
function usarProductosEjemplo() {
  todosLosProductos = [
    { 
      id: 1, 
      nombre: "Camisa Casual", 
      precio: 80000, 
      imagen: "https://s.alicdn.com/@sc04/kf/H9c3e41457b084f9cbd0318018208eaabk.jpg_640x640.jpg", 
      categoria: esMujer ? "Mujer" : "Hombre",
      descripcion: "Camisa casual elegante", 
      destacado: true,
      descuento: 0.1,
      materiales: ["100% Algodón"]
    }
  ];
  mostrarProductos();
}

// ==== INICIALIZAR ====
cargarProductos();
actualizarCarrito();