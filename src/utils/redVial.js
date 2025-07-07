// Datos de la red vial de Santa Cruz de la Sierra
// Este archivo contiene todos los nodos, conexiones, tiempos y distancias

export const nodos = [
  { id: "Plaza 24 de Septiembre", x: 450, y: 300, tipo: "centro" },
  { id: "Av. Cañoto", x: 300, y: 400, tipo: "primer-anillo" },
  { id: "Av. Landívar", x: 300, y: 260, tipo: "primer-anillo" },
  { id: "Av. Centenario", x: 300, y: 180, tipo: "primer-anillo" },
  { id: "Av. Irala", x: 450, y: 440, tipo: "primer-anillo" },
  { id: "Av. Viedma", x: 600, y: 400, tipo: "primer-anillo" },
  { id: "Av. Brasil", x: 600, y: 300, tipo: "primer-anillo" },
  { id: "Av. Uruguay", x: 600, y: 180, tipo: "primer-anillo" },
  { id: "Av. Monseñor Rivero", x: 450, y: 140, tipo: "primer-anillo" },
  { id: "Av. Cristo Redentor", x: 450, y: 60, tipo: "segundo-anillo" },
  { id: "Av. Alemana", x: 670, y: 110, tipo: "segundo-anillo" },
  { id: "Av. Mutualista", x: 700, y: 180, tipo: "segundo-anillo" },
  { id: "Av. Virgen de Cotoca", x: 700, y: 260, tipo: "segundo-anillo" },
  { id: "Av. Tres Pasos al Frente", x: 730, y: 400, tipo: "segundo-anillo" },
  { id: "Av. El Trompillo", x: 640, y: 480, tipo: "segundo-anillo" },
  { id: "Av. Santos Dumont", x: 450, y: 520, tipo: "segundo-anillo" },
  { id: "Av. Prefecto Rivas", x: 300, y: 540, tipo: "segundo-anillo" },
  { id: "Av. Grigotá", x: 210, y: 480, tipo: "segundo-anillo" },
  { id: "Av. Pirai", x: 150, y: 400, tipo: "segundo-anillo" },
  { id: "Av. Busch", x: 200, y: 160, tipo: "segundo-anillo" },
  { id: "Av. Hernando Sanabria", x: 120, y: 240, tipo: "segundo-anillo" },
  { id: "Av. Roca y Coronado", x: 120, y: 340, tipo: "segundo-anillo" }
];

export const conexiones = [
  { origen: "Plaza 24 de Septiembre", destino: "Av. Cañoto", distancia: 0.8, tiempo: 3 },
  { origen: "Plaza 24 de Septiembre", destino: "Av. Landívar", distancia: 0.7, tiempo: 2 },
  { origen: "Plaza 24 de Septiembre", destino: "Av. Centenario", distancia: 0.9, tiempo: 4 },
  { origen: "Plaza 24 de Septiembre", destino: "Av. Irala", distancia: 0.6, tiempo: 2 },
  { origen: "Plaza 24 de Septiembre", destino: "Av. Viedma", distancia: 0.8, tiempo: 3 },
  { origen: "Plaza 24 de Septiembre", destino: "Av. Brasil", distancia: 0.7, tiempo: 2 },
  { origen: "Plaza 24 de Septiembre", destino: "Av. Uruguay", distancia: 0.9, tiempo: 3 },
  { origen: "Plaza 24 de Septiembre", destino: "Av. Monseñor Rivero", distancia: 0.8, tiempo: 3 },
  { origen: "Av. Cañoto", destino: "Av. Landívar", distancia: 1.2, tiempo: 4 },
  { origen: "Av. Landívar", destino: "Av. Centenario", distancia: 1.1, tiempo: 3 },
  { origen: "Av. Centenario", destino: "Av. Monseñor Rivero", distancia: 1.3, tiempo: 4 },
  { origen: "Av. Cañoto", destino: "Av. Irala", distancia: 1.0, tiempo: 3 },
  { origen: "Av. Irala", destino: "Av. Viedma", distancia: 1.1, tiempo: 4 },
  { origen: "Av. Brasil", destino: "Av. Viedma", distancia: 1.2, tiempo: 4 },
  { origen: "Av. Brasil", destino: "Av. Uruguay", distancia: 1.0, tiempo: 3 },
  { origen: "Av. Uruguay", destino: "Av. Monseñor Rivero", distancia: 1.1, tiempo: 4 },
  { origen: "Av. Monseñor Rivero", destino: "Av. Cristo Redentor", distancia: 2.5, tiempo: 8 },
  { origen: "Av. Uruguay", destino: "Av. Alemana", distancia: 2.8, tiempo: 9 },
  { origen: "Av. Irala", destino: "Av. Santos Dumont", distancia: 2.3, tiempo: 7 },
  { origen: "Av. Cañoto", destino: "Av. Roca y Coronado", distancia: 2.4, tiempo: 8 },
  { origen: "Av. Landívar", destino: "Av. Roca y Coronado", distancia: 2.2, tiempo: 7 },
  { origen: "Av. Centenario", destino: "Av. Hernando Sanabria", distancia: 2.6, tiempo: 8 },
  { origen: "Av. Busch", destino: "Av. Hernando Sanabria", distancia: 1.8, tiempo: 6 },
  { origen: "Av. Busch", destino: "Av. Cristo Redentor", distancia: 2.0, tiempo: 6 },
  { origen: "Av. Busch", destino: "Av. Monseñor Rivero", distancia: 1.9, tiempo: 6 },
  { origen: "Av. Alemana", destino: "Av. Cristo Redentor", distancia: 2.1, tiempo: 7 },
  { origen: "Av. Alemana", destino: "Av. Mutualista", distancia: 2.7, tiempo: 8 },
  { origen: "Av. Mutualista", destino: "Av. Virgen de Cotoca", distancia: 3.2, tiempo: 10 },
  { origen: "Av. Virgen de Cotoca", destino: "Av. Tres Pasos al Frente", distancia: 3.5, tiempo: 11 },
  { origen: "Av. Tres Pasos al Frente", destino: "Av. El Trompillo", distancia: 2.8, tiempo: 9 },
  { origen: "Av. Viedma", destino: "Av. El Trompillo", distancia: 3.1, tiempo: 10 },
  { origen: "Av. El Trompillo", destino: "Av. Santos Dumont", distancia: 2.9, tiempo: 9 },
  { origen: "Av. Brasil", destino: "Av. Virgen de Cotoca", distancia: 3.4, tiempo: 11 },
  { origen: "Av. Hernando Sanabria", destino: "Av. Roca y Coronado", distancia: 2.3, tiempo: 7 },
  { origen: "Av. Pirai", destino: "Av. Roca y Coronado", distancia: 4.2, tiempo: 13 },
  { origen: "Av. Pirai", destino: "Av. Grigotá", distancia: 3.8, tiempo: 12 },
  { origen: "Av. Grigotá", destino: "Av. Cañoto", distancia: 4.5, tiempo: 14 },
  { origen: "Av. Grigotá", destino: "Av. Prefecto Rivas", distancia: 2.1, tiempo: 7 },
  { origen: "Av. Prefecto Rivas", destino: "Av. Cañoto", distancia: 3.2, tiempo: 10 },
  { origen: "Av. Prefecto Rivas", destino: "Av. Santos Dumont", distancia: 2.8, tiempo: 9 }
];

// Estructura para tiempos (en minutos) entre nodos - DEPRECATED
// Los tiempos ahora están incluidos directamente en las conexiones
export const tiempos = {
  // Los datos de tiempo ahora se almacenan en el array 'conexiones'
  // Mantenido para compatibilidad con código anterior
};

// Estructura para distancias (en km) entre nodos - DEPRECATED  
// Las distancias ahora están incluidas directamente en las conexiones
export const distancias = {
  // Los datos de distancia ahora se almacenan en el array 'conexiones'
  // Mantenido para compatibilidad con código anterior
};

// Función utilitaria para obtener tiempo entre dos nodos
export const obtenerTiempo = (origen, destino) => {
  // Buscar en las conexiones directamente
  const conexion = conexiones.find(conn => 
    (conn.origen === origen && conn.destino === destino) ||
    (conn.origen === destino && conn.destino === origen)
  );
  
  return conexion ? conexion.tiempo : null;
};

// Función utilitaria para obtener distancia entre dos nodos
export const obtenerDistancia = (origen, destino) => {
  // Buscar en las conexiones directamente
  const conexion = conexiones.find(conn => 
    (conn.origen === origen && conn.destino === destino) ||
    (conn.origen === destino && conn.destino === origen)
  );
  
  return conexion ? conexion.distancia : null;
};

// Función para verificar si existe conexión entre dos nodos
export const existeConexion = (origen, destino) => {
  return conexiones.some(conn => 
    (conn.origen === origen && conn.destino === destino) ||
    (conn.origen === destino && conn.destino === origen)
  );
};

// Función para agregar nuevos nodos
export const agregarNodo = (nuevoNodo) => {
  if (!nodos.find(n => n.id === nuevoNodo.id)) {
    nodos.push(nuevoNodo);
    return true;
  }
  return false;
};

// Función para agregar nuevas conexiones
export const agregarConexion = (origen, destino, tiempo = null, distancia = null) => {
  if (!existeConexion(origen, destino)) {
    const nuevaConexion = { origen, destino };
    
    if (tiempo !== null) {
      nuevaConexion.tiempo = tiempo;
    }
    
    if (distancia !== null) {
      nuevaConexion.distancia = distancia;
    }
    
    conexiones.push(nuevaConexion);
    return true;
  }
  return false;
};

// Algoritmo de Dijkstra para encontrar la ruta más corta
export const dijkstra = (origen, destino, criterio = 'tiempo') => {
  // Validar que los nodos existan
  const nodoOrigen = nodos.find(n => n.id === origen);
  const nodoDestino = nodos.find(n => n.id === destino);
  
  if (!nodoOrigen || !nodoDestino) {
    return null;
  }

  // Inicializar distancias y nodos previos
  const distancias = {};
  const previos = {};
  const visitados = new Set();
  const porVisitar = new Set();

  // Inicializar todas las distancias como infinito
  nodos.forEach(nodo => {
    distancias[nodo.id] = nodo.id === origen ? 0 : Infinity;
    previos[nodo.id] = null;
    porVisitar.add(nodo.id);
  });

  while (porVisitar.size > 0) {
    // Encontrar el nodo no visitado con menor distancia
    let nodoActual = null;
    let menorDistancia = Infinity;
    
    for (const nodo of porVisitar) {
      if (distancias[nodo] < menorDistancia) {
        menorDistancia = distancias[nodo];
        nodoActual = nodo;
      }
    }

    if (nodoActual === null || distancias[nodoActual] === Infinity) {
      break; // No hay más nodos alcanzables
    }

    // Marcar como visitado
    porVisitar.delete(nodoActual);
    visitados.add(nodoActual);

    // Si llegamos al destino, podemos terminar
    if (nodoActual === destino) {
      break;
    }

    // Revisar todos los vecinos del nodo actual
    const vecinosConexiones = conexiones.filter(conn => 
      conn.origen === nodoActual || conn.destino === nodoActual
    );

    for (const conexion of vecinosConexiones) {
      const vecino = conexion.origen === nodoActual ? conexion.destino : conexion.origen;
      
      if (visitados.has(vecino)) {
        continue; // Ya fue visitado
      }

      // Calcular la nueva distancia usando el criterio seleccionado
      const peso = criterio === 'distancia' ? conexion.distancia : conexion.tiempo;
      const nuevaDistancia = distancias[nodoActual] + peso;

      if (nuevaDistancia < distancias[vecino]) {
        distancias[vecino] = nuevaDistancia;
        previos[vecino] = nodoActual;
      }
    }
  }

  // Reconstruir el camino
  const camino = [];
  let nodoActual = destino;
  
  while (nodoActual !== null) {
    camino.unshift(nodoActual);
    nodoActual = previos[nodoActual];
  }

  // Verificar si se encontró un camino válido
  if (camino[0] !== origen) {
    return null; // No hay camino posible
  }

  // Calcular detalles del camino
  const segmentos = [];
  let tiempoTotal = 0;
  let distanciaTotal = 0;

  for (let i = 0; i < camino.length - 1; i++) {
    const desde = camino[i];
    const hasta = camino[i + 1];
    
    const conexion = conexiones.find(conn => 
      (conn.origen === desde && conn.destino === hasta) ||
      (conn.origen === hasta && conn.destino === desde)
    );

    if (conexion) {
      segmentos.push({
        desde,
        hasta,
        tiempo: conexion.tiempo,
        distancia: conexion.distancia
      });
      
      tiempoTotal += conexion.tiempo;
      distanciaTotal += conexion.distancia;
    }
  }

  return {
    camino,
    segmentos,
    tiempoTotal,
    distanciaTotal: Math.round(distanciaTotal * 100) / 100, // Redondear a 2 decimales
    criterioUsado: criterio
  };
};

// Función para encontrar la ruta óptima con múltiples paradas
export const rutaOptimaPuntosPorPunto = (puntos, criterio = 'tiempo') => {
  if (puntos.length < 2) {
    return null;
  }

  const rutaCompleta = {
    camino: [],
    segmentos: [],
    tiempoTotal: 0,
    distanciaTotal: 0,
    criterioUsado: criterio
  };

  // Calcular ruta entre cada par de puntos consecutivos
  for (let i = 0; i < puntos.length - 1; i++) {
    const resultado = dijkstra(puntos[i], puntos[i + 1], criterio);
    
    if (!resultado) {
      return null; // No hay ruta posible entre algún par de puntos
    }

    // Agregar al camino (evitando duplicar el punto de conexión)
    if (i === 0) {
      rutaCompleta.camino.push(...resultado.camino);
    } else {
      rutaCompleta.camino.push(...resultado.camino.slice(1));
    }

    // Agregar segmentos
    rutaCompleta.segmentos.push(...resultado.segmentos);
    
    // Acumular tiempos y distancias
    rutaCompleta.tiempoTotal += resultado.tiempoTotal;
    rutaCompleta.distanciaTotal += resultado.distanciaTotal;
  }

  rutaCompleta.distanciaTotal = Math.round(rutaCompleta.distanciaTotal * 100) / 100;
  
  return rutaCompleta;
};
