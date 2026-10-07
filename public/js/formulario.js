
const form = document.getElementById('form-pedido');      
const inputArchivo = document.getElementById('archivo');  
const cajaError = document.getElementById('error');       
const botonEnviar = document.getElementById('btn-enviar');

// 2) CUANDO CAMBIA EL TIPO DE PEDIDO (STL o foto)
// -----------------------------------------------------------------------------
// Cambiamos el texto del campo del archivo y qué archivos deja elegir (accept).
// También borramos el archivo que había elegido, porque ya no corresponde
// (si había elegido un STL y ahora eligió "diseño", ese STL no sirve).

// querySelectorAll busca TODOS los elementos que cumplan la condición:
// los input cuyo name sea "tipo" (los dos radio: STL y diseño).
const radiosTipo = document.querySelectorAll('input[name="tipo"]');

for (const radio of radiosTipo) {
  
  radio.addEventListener('change', () => {
    
    if (document.getElementById('tipo-diseno').checked) {
     
      document.getElementById('archivo-label').textContent = 'Foto de la pieza';
      document.getElementById('archivo-ayuda').textContent = 'JPG, PNG, WEBP o HEIC.';
      
      inputArchivo.accept = 'image/*';
    } else {
      
      document.getElementById('archivo-label').textContent = 'Archivo STL';
      document.getElementById('archivo-ayuda').textContent = 'Formato .stl, hasta 50 MB.';
      inputArchivo.accept = '.stl';
    }
    
    inputArchivo.value = '';
  });
}



form.addEventListener('submit', async (evento) => {
  
  evento.preventDefault();
  
  ocultarError();

  
  const error = validarFormulario();
  if (error) {
    mostrarError(error);
    return; 
  }


  const datos = new FormData(form);

  botonEnviar.disabled = true;
  botonEnviar.textContent = 'Enviando…';

  try {
    const respuesta = await fetch('/api/pedidos', { method: 'POST', body: datos });
   
    const cuerpo = await respuesta.json();

    
    if (respuesta.ok) {

      location.href = '/pedido-enviado.html?id=' + cuerpo.id;
      return;
    }
    
    mostrarError(cuerpo.error || 'No se pudo enviar el pedido.');
  } catch (e) {
    
    mostrarError('No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.');
  }

 
  botonEnviar.disabled = false;
  botonEnviar.textContent = 'Enviar pedido';
});



function validarFormulario() {
 
  const dimensiones = document.getElementById('dimensiones').value.trim();
  const cantidad = Number(document.getElementById('cantidad').value);
  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const email = document.getElementById('email').value.trim();

 
  if (inputArchivo.files.length === 0) {
    return 'Adjuntá el archivo o la foto de la pieza.';
  }
  
  if (inputArchivo.files[0].size > 50 * 1024 * 1024) {
    return 'El archivo pesa más de 50 MB.';
  }
  if (dimensiones === '') {
    return 'Indicá las medidas (o "tamaño original").';
  }
  
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return 'La cantidad tiene que ser un número entero mayor a 0.';
  }
  if (nombre === '') {
    return 'Escribí tu nombre.';
  }
  
  if (telefono.replace(/\D/g, '').length < 10) {
    return 'Revisá el número de WhatsApp (con código de área, sin 0 ni 15).';
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Revisá el email.';
  }

  
  return null;
}

function mostrarError(mensaje) {
  
  cajaError.textContent = mensaje;
  cajaError.classList.remove('d-none');
  
  cajaError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function ocultarError() {
  cajaError.classList.add('d-none');
}
