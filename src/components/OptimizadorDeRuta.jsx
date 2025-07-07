import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './OptimizadorDeRuta.css';
import { nodos, conexiones, dijkstra, rutaOptimaPuntosPorPunto } from '../utils/redVial.js';
import logo from '../Logo/logo.png';

// Copia de los tiempos originales (solo una vez)
const tiemposOriginales = conexiones.map(conn => ({
  origen: conn.origen,
  destino: conn.destino,
  tiempo: conn.tiempo
}));

const SimpleTrafficOptimizer = () => {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [puntosIntermedios, setPuntosIntermedios] = useState([]);
  const [criterioOptimizacion, setCriterioOptimizacion] = useState('tiempo');
  const [resultados, setResultados] = useState(null);
  const [animacionActiva, setAnimacionActiva] = useState(false);
  const [posicionCoche, setPosicionCoche] = useState({ x: 0, y: 0 });
  const [progresRuta, setProgresRuta] = useState({ nodoActual: "", porcentaje: 0 });
  const [mostrarTiempos, setMostrarTiempos] = useState(false);
  const svgRef = useRef();

  // Estados para autocomplete
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState([]);
  const [sugerenciasIntermedios, setSugerenciasIntermedios] = useState({});
  const [indiceActivoOrigen, setIndiceActivoOrigen] = useState(-1);
  const [indiceActivoDestino, setIndiceActivoDestino] = useState(-1);
  const [indicesActivosIntermedios, setIndicesActivosIntermedios] = useState({});

  // Funciones para autocomplete
  const obtenerSugerencias = (texto, nodosExcluir = []) => {
    if (!texto || texto.length < 1) return [];
    
    const textoLower = texto.toLowerCase();
    return nodos
      .filter(nodo => 
        nodo.id.toLowerCase().includes(textoLower) && 
        !nodosExcluir.includes(nodo.id)
      )
      .map(nodo => nodo.id)
      .slice(0, 8); // Limitar a 8 sugerencias
  };

  const manejarCambioOrigen = (valor) => {
    setOrigen(valor);
    const nodosExcluir = [destino, ...puntosIntermedios.filter(p => p.trim() !== "")];
    const nuevasSugerencias = obtenerSugerencias(valor, nodosExcluir);
    setSugerenciasOrigen(nuevasSugerencias);
    setIndiceActivoOrigen(-1);
  };

  const manejarCambioDestino = (valor) => {
    setDestino(valor);
    const nodosExcluir = [origen, ...puntosIntermedios.filter(p => p.trim() !== "")];
    const nuevasSugerencias = obtenerSugerencias(valor, nodosExcluir);
    setSugerenciasDestino(nuevasSugerencias);
    setIndiceActivoDestino(-1);
  };

  const manejarCambioIntermedio = (indice, valor) => {
    const nuevosIntermedios = [...puntosIntermedios];
    nuevosIntermedios[indice] = valor;
    setPuntosIntermedios(nuevosIntermedios);
    
    const nodosExcluir = [
      origen, 
      destino, 
      ...nuevosIntermedios.filter((p, i) => i !== indice && p.trim() !== "")
    ].filter(Boolean);
    
    const nuevasSugerencias = obtenerSugerencias(valor, nodosExcluir);
    setSugerenciasIntermedios(prev => ({
      ...prev,
      [indice]: nuevasSugerencias
    }));
    setIndicesActivosIntermedios(prev => ({
      ...prev,
      [indice]: -1
    }));
  };

  const seleccionarSugerenciaOrigen = (sugerencia) => {
    setOrigen(sugerencia);
    setSugerenciasOrigen([]);
    setIndiceActivoOrigen(-1);
  };

  const seleccionarSugerenciaDestino = (sugerencia) => {
    setDestino(sugerencia);
    setSugerenciasDestino([]);
    setIndiceActivoDestino(-1);
  };

  const seleccionarSugerenciaIntermedio = (indice, sugerencia) => {
    const nuevosIntermedios = [...puntosIntermedios];
    nuevosIntermedios[indice] = sugerencia;
    setPuntosIntermedios(nuevosIntermedios);
    setSugerenciasIntermedios(prev => ({
      ...prev,
      [indice]: []
    }));
    setIndicesActivosIntermedios(prev => ({
      ...prev,
      [indice]: -1
    }));
  };

  const manejarTeclaOrigen = (e) => {
    if (sugerenciasOrigen.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceActivoOrigen(prev => 
        prev < sugerenciasOrigen.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceActivoOrigen(prev => 
        prev > 0 ? prev - 1 : sugerenciasOrigen.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indiceActivoOrigen >= 0) {
        seleccionarSugerenciaOrigen(sugerenciasOrigen[indiceActivoOrigen]);
      }
    } else if (e.key === 'Escape') {
      setSugerenciasOrigen([]);
      setIndiceActivoOrigen(-1);
    }
  };

  const manejarTeclaDestino = (e) => {
    if (sugerenciasDestino.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceActivoDestino(prev => 
        prev < sugerenciasDestino.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceActivoDestino(prev => 
        prev > 0 ? prev - 1 : sugerenciasDestino.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indiceActivoDestino >= 0) {
        seleccionarSugerenciaDestino(sugerenciasDestino[indiceActivoDestino]);
      }
    } else if (e.key === 'Escape') {
      setSugerenciasDestino([]);
      setIndiceActivoDestino(-1);
    }
  };

  const manejarTeclaIntermedio = (e, indice) => {
    const sugerencias = sugerenciasIntermedios[indice] || [];
    if (sugerencias.length === 0) return;
    
    const indiceActivo = indicesActivosIntermedios[indice] || -1;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndicesActivosIntermedios(prev => ({
        ...prev,
        [indice]: indiceActivo < sugerencias.length - 1 ? indiceActivo + 1 : 0
      }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndicesActivosIntermedios(prev => ({
        ...prev,
        [indice]: indiceActivo > 0 ? indiceActivo - 1 : sugerencias.length - 1
      }));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indiceActivo >= 0) {
        seleccionarSugerenciaIntermedio(indice, sugerencias[indiceActivo]);
      }
    } else if (e.key === 'Escape') {
      setSugerenciasIntermedios(prev => ({
        ...prev,
        [indice]: []
      }));
      setIndicesActivosIntermedios(prev => ({
        ...prev,
        [indice]: -1
      }));
    }
  };

  // Los nodos y conexiones ahora se importan desde redVial.js

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    // Solo limpiar SVG completo si cambian origen, destino o puntosIntermedios
    // No limpiar si solo cambia mostrarTiempos
    if (mostrarTiempos === false) {
      svg.selectAll("*").remove();
    } else {
      svg.selectAll(".tiempo-fijo-linea").remove();
    }

    const width = 900;
    const height = 600;

    // Crear líneas de conexión
    conexiones.forEach(conn => {
      const nodoOrigen = nodos.find(n => n.id === conn.origen);
      const nodoDestino = nodos.find(n => n.id === conn.destino);
      if (nodoOrigen && nodoDestino) {
        const linea = svg.append("line")
          .attr("x1", nodoOrigen.x)
          .attr("y1", nodoOrigen.y)
          .attr("x2", nodoDestino.x)
          .attr("y2", nodoDestino.y)
          .attr("stroke", "#ccc")
          .attr("stroke-width", 4)
          .attr("class", "conexion-line")
          .style("cursor", "pointer")
          .on("mouseover", function() {
            d3.select(this).attr("stroke", "#ff6b35");
          })
          .on("mouseout", function() {
            d3.select(this).attr("stroke", "#ccc");
          })
          .on("click", function(event) {
            svg.selectAll(".linea-tooltip").remove();
            const midX = (nodoOrigen.x + nodoDestino.x) / 2;
            const midY = (nodoOrigen.y + nodoDestino.y) / 2;
            const tooltip = svg.append("g")
              .attr("class", "linea-tooltip")
              .attr("transform", `translate(${midX + 10}, ${midY - 30})`);
            tooltip.append("rect")
              .attr("width", 60)
              .attr("height", 28)
              .attr("fill", "#222")
              .attr("stroke", "#ff6b35")
              .attr("stroke-width", 1)
              .attr("rx", 6);
            tooltip.append("text")
              .attr("x", 30)
              .attr("y", 18)
              .attr("text-anchor", "middle")
              .attr("fill", "#fff")
              .attr("font-size", "13px")
              .attr("font-weight", "bold")
              .text(conn.tiempo + " min");
            svg.on("click", function(e) {
              if (e.target.tagName !== "line") {
                svg.selectAll(".linea-tooltip").remove();
                svg.on("click", null);
              }
            });
            event.stopPropagation();
          });
        if (mostrarTiempos) {
          const midX = (nodoOrigen.x + nodoDestino.x) / 2;
          const midY = (nodoOrigen.y + nodoDestino.y) / 2;
          svg.append("text")
            .attr("x", midX + 12)
            .attr("y", midY - 8)
            .attr("text-anchor", "start")
            .attr("fill", "#ff6b35")
            .attr("font-size", "13px")
            .attr("font-weight", "bold")
            .attr("class", "tiempo-fijo-linea")
            .text(conn.tiempo + " min");
        }
      }
    });

    // Crear nodos
    nodos.forEach(nodo => {
      const grupo = svg.append("g").attr("class", "nodo-grupo");
      
      // Determinar el estado del nodo (seleccionado o no)
      let estadoNodo = 'disponible';
      let colorBorde = "white";
      let anchoBorde = 2;
      
      if (nodo.id === origen) {
        estadoNodo = 'origen';
        colorBorde = "#ff6b35";
        anchoBorde = 4;
      } else if (nodo.id === destino) {
        estadoNodo = 'destino';
        colorBorde = "#28a745";
        anchoBorde = 4;
      } else if (puntosIntermedios.includes(nodo.id)) {
        estadoNodo = 'parada';
        colorBorde = "#ffc107";
        anchoBorde = 3;
      }
      
      // Círculo del nodo
      const circuloNodo = grupo.append("circle")
        .attr("cx", nodo.x)
        .attr("cy", nodo.y)
        .attr("r", nodo.tipo === "centro" ? 12 : 8)
        .attr("fill", nodo.tipo === "centro" ? "#e74c3c" : 
                     nodo.tipo === "primer-anillo" ? "#3498db" : "#2ecc71")
        .attr("stroke", colorBorde)
        .attr("stroke-width", anchoBorde)
        .attr("class", `nodo-circle nodo-${estadoNodo}`)
        .style("cursor", "pointer")
        .on("mouseover", function(event) {
          // Efecto hover: resaltar el nodo
          d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke", "#ffeb3b")
            .attr("stroke-width", 4)
            .attr("r", nodo.tipo === "centro" ? 15 : 11);
          
          // Mostrar tooltip con información del nodo
          const tooltip = svg.append("g")
            .attr("class", "nodo-tooltip")
            .attr("transform", `translate(${nodo.x + 20}, ${nodo.y - 20})`);
          
          tooltip.append("rect")
            .attr("width", 140)
            .attr("height", 40)
            .attr("fill", "rgba(0,0,0,0.8)")
            .attr("stroke", "#ffeb3b")
            .attr("stroke-width", 1)
            .attr("rx", 5);
          
          tooltip.append("text")
            .attr("x", 70)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .text(nodo.id);
          
          // Mostrar estado del nodo
          let estadoTexto = "Click para seleccionar";
          if (estadoNodo === 'origen') estadoTexto = "📍 ORIGEN";
          else if (estadoNodo === 'destino') estadoTexto = "🎯 DESTINO";
          else if (estadoNodo === 'parada') estadoTexto = "🛣️ PARADA";
          
          tooltip.append("text")
            .attr("x", 70)
            .attr("y", 28)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffeb3b")
            .attr("font-size", "8px")
            .text(`${nodo.tipo} • ${estadoTexto}`);
        })
        .on("mouseout", function(event) {
          // Restaurar el estado normal
          d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke", colorBorde)
            .attr("stroke-width", anchoBorde)
            .attr("r", nodo.tipo === "centro" ? 12 : 8);
          
          // Remover tooltip
          svg.selectAll(".nodo-tooltip").remove();
        })
        .on("click", function(event) {
          // Efecto de click: pulso en el nodo
          d3.select(this)
            .transition()
            .duration(100)
            .attr("r", nodo.tipo === "centro" ? 18 : 14)
            .transition()
            .duration(100)
            .attr("r", nodo.tipo === "centro" ? 12 : 8);
          
          // Crear efecto de onda expansiva
          const ondaExpansiva = grupo.append("circle")
            .attr("cx", nodo.x)
            .attr("cy", nodo.y)
            .attr("r", nodo.tipo === "centro" ? 12 : 8)
            .attr("fill", "none")
            .attr("stroke", "#ffeb3b")
            .attr("stroke-width", 3)
            .attr("opacity", 0.8);
          
          ondaExpansiva.transition()
            .duration(500)
            .attr("r", 30)
            .attr("opacity", 0)
            .on("end", function() {
              d3.select(this).remove();
            });
          
          if (!origen) {
            setOrigen(nodo.id);
          } else if (!destino && nodo.id !== origen && !puntosIntermedios.includes(nodo.id)) {
            setDestino(nodo.id);
          } else if (destino && puntosIntermedios.length < 5 && nodo.id !== origen && nodo.id !== destino && !puntosIntermedios.includes(nodo.id)) {
            // Buscar primera parada vacía o agregar nueva
            const primeraVacia = puntosIntermedios.findIndex(p => p === "");
            if (primeraVacia !== -1) {
              const nuevoPuntos = [...puntosIntermedios];
              nuevoPuntos[primeraVacia] = nodo.id;
              setPuntosIntermedios(nuevoPuntos);
            } else {
              setPuntosIntermedios([...puntosIntermedios, nodo.id]);
            }
          } else {
            // Reiniciar selección
            setOrigen(nodo.id);
            setDestino("");
            setPuntosIntermedios([]);
          }
        });

      // Etiqueta del nodo
      grupo.append("text")
        .attr("x", nodo.x)
        .attr("y", nodo.y - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("fill", "#333")
        .attr("class", "nodo-label")
        .text(nodo.id.split(" ")[nodo.id.split(" ").length - 1])
        .style("pointer-events", "none");
      
      // Agregar indicador visual para nodos seleccionados
      if (estadoNodo === 'origen') {
        grupo.append("text")
          .attr("x", nodo.x)
          .attr("y", nodo.y + 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .text("📍")
          .style("pointer-events", "none");
      } else if (estadoNodo === 'destino') {
        grupo.append("text")
          .attr("x", nodo.x)
          .attr("y", nodo.y + 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .text("🎯")
          .style("pointer-events", "none");
      } else if (estadoNodo === 'parada') {
        grupo.append("text")
          .attr("x", nodo.x)
          .attr("y", nodo.y + 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .text("🛣️")
          .style("pointer-events", "none");
      }
      
      // Efecto de pulso suave para nodos seleccionados
      if (estadoNodo === 'origen' || estadoNodo === 'destino') {
        const anilloPulso = grupo.append("circle")
          .attr("cx", nodo.x)
          .attr("cy", nodo.y)
          .attr("r", nodo.tipo === "centro" ? 18 : 14)
          .attr("fill", "none")
          .attr("stroke", estadoNodo === 'origen' ? "#ff6b35" : "#28a745")
          .attr("stroke-width", 2)
          .attr("opacity", 0.6)
          .style("pointer-events", "none");
        
        // Animación de pulso
        anilloPulso.transition()
          .duration(1500)
          .ease(d3.easeLinear)
          .attr("r", nodo.tipo === "centro" ? 25 : 20)
          .attr("opacity", 0)
          .on("end", function repeat() {
            d3.select(this)
              .attr("r", nodo.tipo === "centro" ? 18 : 14)
              .attr("opacity", 0.6)
              .transition()
              .duration(1500)
              .ease(d3.easeLinear)
              .attr("r", nodo.tipo === "centro" ? 25 : 20)
              .attr("opacity", 0)
              .on("end", repeat);
          });
      }
    });

    // Leyenda
    const leyenda = svg.append("g")
      .attr("class", "leyenda")
      .attr("transform", `translate(${width - 150}, 30)`); // Mover a la esquina superior derecha
    
    leyenda.append("rect")
      .attr("width", 120)
      .attr("height", 70)
      .attr("fill", "white")
      .attr("stroke", "#ddd")
      .attr("rx", 5);

    leyenda.append("text")
      .attr("x", 60)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text("Leyenda");

    // Items de leyenda
    const items = [
      { color: "#e74c3c", text: "Centro", y: 28 },
      { color: "#3498db", text: "1er Anillo", y: 42 },
      { color: "#2ecc71", text: "2do Anillo", y: 56 }
    ];

    items.forEach(item => {
      leyenda.append("circle")
        .attr("cx", 15)
        .attr("cy", item.y)
        .attr("r", 6)
        .attr("fill", item.color);
      
      leyenda.append("text")
        .attr("x", 25)
        .attr("y", item.y + 4)
        .attr("font-size", "10px")
        .text(item.text);
    });

  }, [origen, destino, puntosIntermedios, mostrarTiempos]);

  // Función para animar el coche a lo largo de la ruta
  const animarCoche = (rutaCompleta) => {
    if (!rutaCompleta || rutaCompleta.length < 2) return;
    
    setAnimacionActiva(true);
    const svg = d3.select(svgRef.current);
    
    // Limpiar animaciones previas
    svg.selectAll('.coche-animado').remove();
    svg.selectAll('.ruta-destacada').remove();
    svg.selectAll('.coche-trail').remove();
    svg.selectAll('#ruta-path').remove();
    svg.selectAll('.indicador-paso').remove();
    
    // Crear líneas destacadas para la ruta
    for (let i = 0; i < rutaCompleta.length - 1; i++) {
      const nodoOrigen = nodos.find(n => n.id === rutaCompleta[i]);
      const nodoDestino = nodos.find(n => n.id === rutaCompleta[i + 1]);
      
      if (nodoOrigen && nodoDestino) {
        svg.append("line")
          .attr("class", "ruta-destacada")
          .attr("x1", nodoOrigen.x)
          .attr("y1", nodoOrigen.y)
          .attr("x2", nodoDestino.x)
          .attr("y2", nodoDestino.y)
          .attr("stroke", "#ff6b35")
          .attr("stroke-width", 4)
          .attr("opacity", 0.8);
      }
    }
    
    // Crear el coche (círculo animado con emoji)
    const grupoCache = svg.append("g").attr("class", "coche-animado");
    
    grupoCache.append("circle")
      .attr("r", 10)
      .attr("fill", "#ff6b35")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))");
    
    grupoCache.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("font-size", "12px")
      .text("🚗")
      .style("pointer-events", "none");
    
    // Crear indicadores de paso por cada nodo
    const indicadores = svg.selectAll(".indicador-paso")
      .data(rutaCompleta)
      .enter()
      .append("circle")
      .attr("class", "indicador-paso")
      .attr("cx", d => nodos.find(n => n.id === d).x)
      .attr("cy", d => nodos.find(n => n.id === d).y)
      .attr("r", 15)
      .attr("fill", "none")
      .attr("stroke", "#ff6b35")
      .attr("stroke-width", 2)
      .attr("opacity", 0);
    
    // Crear path para la animación
    let pathData = "";
    const nodoInicial = nodos.find(n => n.id === rutaCompleta[0]);
    pathData += `M ${nodoInicial.x} ${nodoInicial.y}`;
    
    for (let i = 1; i < rutaCompleta.length; i++) {
      const nodo = nodos.find(n => n.id === rutaCompleta[i]);
      pathData += ` L ${nodo.x} ${nodo.y}`;
    }
    
    const path = svg.append("path")
      .attr("id", "ruta-path")
      .attr("d", pathData)
      .style("display", "none");
    
    // Posicionar el coche al inicio
    grupoCache.attr("transform", `translate(${nodoInicial.x}, ${nodoInicial.y})`);
    setPosicionCoche({ x: nodoInicial.x, y: nodoInicial.y });
    
    // Animación del coche
    const pathLength = path.node().getTotalLength();
    const duration = Math.max(4000, rutaCompleta.length * 1000); // Duración más lenta para mejor visualización
    
    let nodoActualIndex = 0;
    
    grupoCache.transition()
      .duration(duration)
      .ease(d3.easeLinear)
      .attrTween("transform", function() {
        return function(t) {
          const point = path.node().getPointAtLength(t * pathLength);
          const nextPoint = path.node().getPointAtLength(Math.min((t + 0.01) * pathLength, pathLength));
          
          // Actualizar posición del coche
          setPosicionCoche({ x: Math.round(point.x), y: Math.round(point.y) });
          
          // Actualizar progreso
          const porcentaje = Math.round(t * 100);
          setProgresRuta({ 
            nodoActual: rutaCompleta[Math.min(nodoActualIndex, rutaCompleta.length - 1)], 
            porcentaje 
          });
          
          // Verificar si estamos cerca de un nodo para activar indicador
          for (let i = nodoActualIndex; i < rutaCompleta.length; i++) {
            const nodo = nodos.find(n => n.id === rutaCompleta[i]);
            const distancia = Math.sqrt(Math.pow(point.x - nodo.x, 2) + Math.pow(point.y - nodo.y, 2));
            
            if (distancia < 20 && i > nodoActualIndex) {
              nodoActualIndex = i;
              // Activar indicador de paso
              d3.select(indicadores.nodes()[i])
                .transition()
                .duration(300)
                .attr("opacity", 1)
                .attr("r", 20)
                .transition()
                .duration(300)
                .attr("opacity", 0)
                .attr("r", 15);
              break;
            }
          }
          
          return `translate(${point.x}, ${point.y})`;
        };
      })
      .on("end", function() {
        setAnimacionActiva(false);
        setProgresRuta({ nodoActual: rutaCompleta[rutaCompleta.length - 1], porcentaje: 100 });
        
        // Parpadear en el destino
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", 15)
          .transition()
          .duration(200)
          .attr("r", 10)
          .transition()
          .duration(200)
          .attr("r", 15)
          .transition()
          .duration(200)
          .attr("r", 10);
          
        // Mostrar mensaje de llegada
        setTimeout(() => {
          setProgresRuta({ nodoActual: "", porcentaje: 0 });
          alert("🎉 ¡El coche ha llegado al destino!");
        }, 2000);
      });
  };

  const calcularRuta = () => {
    if (origen && destino) {
      // Filtrar puntos intermedios que no estén vacíos
      const puntosValidos = puntosIntermedios.filter(p => p.trim() !== "");
      
      // Crear la ruta completa: origen -> puntos intermedios válidos -> destino
      const puntosRuta = [origen, ...puntosValidos, destino];
      
      // Usar algoritmo de Dijkstra para encontrar la ruta óptima
      const resultado = rutaOptimaPuntosPorPunto(puntosRuta, criterioOptimizacion);
      
      if (resultado) {
        setResultados({
          origen,
          destino,
          puntosIntermedios: [...puntosValidos],
          rutaCompleta: resultado.camino,
          segmentosRuta: resultado.segmentos,
          tiempo: resultado.tiempoTotal,
          distancia: resultado.distanciaTotal,
          criterioUsado: resultado.criterioUsado,
          algoritmo: "Dijkstra",
          encontrada: true
        });
        
        // Iniciar animación del coche automáticamente
        setTimeout(() => {
          animarCoche(resultado.camino);
        }, 500);
      } else {
        setResultados({
          error: "No se encontró una ruta válida entre los puntos seleccionados. Verifica que todos los puntos estén conectados en la red vial.",
          encontrada: false
        });
      }
    } else {
      setResultados({
        error: "Por favor selecciona origen y destino haciendo clic en los puntos del mapa",
        encontrada: false
      });
    }
  };

  return (
    <div className="optimizador-container">
      <div className="optimizador-header">
        <div className="optimizador-header-flex">
          <img src={logo} alt="Logo" className="optimizador-logo" />
          <div>
            <h1 className="optimizador-title">RAPIDINGO</h1>
            <p className="optimizador-subtitle">MEJOR TRÁFICO, MEJOR DÍA</p>
          </div>
        </div>
      </div>
      
      <div className="optimizador-control-panel">
        <h3 className="optimizador-control-title">
          🔍 Panel de Control
        </h3>
        
        <div className="optimizador-form-row">
          <div className="optimizador-form-group">
            <label className="optimizador-label">
              📍 Punto de Origen:
            </label>
            <div className="optimizador-autocomplete-wrapper">
              <input 
                type="text"
                value={origen}
                onChange={(e) => manejarCambioOrigen(e.target.value)}
                onKeyDown={manejarTeclaOrigen}
                onFocus={() => {
                  const nodosExcluir = [destino, ...puntosIntermedios.filter(p => p.trim() !== "")];
                  setSugerenciasOrigen(obtenerSugerencias(origen, nodosExcluir));
                }}
                onBlur={() => setTimeout(() => setSugerenciasOrigen([]), 200)}
                placeholder="Escriba el origen..."
                className="optimizador-input"
                autoComplete="off"
              />
              {sugerenciasOrigen.length > 0 && (
                <ul className="optimizador-sugerencias-list">
                  {sugerenciasOrigen.map((sugerencia, index) => (
                    <li 
                      key={sugerencia}
                      className={indiceActivoOrigen === index ? 'active' : ''}
                      onMouseDown={() => seleccionarSugerenciaOrigen(sugerencia)}
                      onMouseEnter={() => setIndiceActivoOrigen(index)}
                    >
                      {sugerencia}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="optimizador-form-group">
            <label className="optimizador-label">
              🎯 Punto de Destino:
            </label>
            <div className="optimizador-autocomplete-wrapper">
              <input 
                type="text"
                value={destino}
                onChange={(e) => manejarCambioDestino(e.target.value)}
                onKeyDown={manejarTeclaDestino}
                onFocus={() => {
                  const nodosExcluir = [origen, ...puntosIntermedios.filter(p => p.trim() !== "")];
                  setSugerenciasDestino(obtenerSugerencias(destino, nodosExcluir));
                }}
                onBlur={() => setTimeout(() => setSugerenciasDestino([]), 200)}
                placeholder="Escriba el destino..."
                className="optimizador-input"
                autoComplete="off"
              />
              {sugerenciasDestino.length > 0 && (
                <ul className="optimizador-sugerencias-list">
                  {sugerenciasDestino.map((sugerencia, index) => (
                    <li 
                      key={sugerencia}
                      className={indiceActivoDestino === index ? 'active' : ''}
                      onMouseDown={() => seleccionarSugerenciaDestino(sugerencia)}
                      onMouseEnter={() => setIndiceActivoDestino(index)}
                    >
                      {sugerencia}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
       
        {/* Puntos Intermedios */}
        <div className="optimizador-intermediate-section">
          <div className="optimizador-intermediate-header">
            <h4 className="optimizador-intermediate-title">
              🛣️ Puntos Intermedios (Opcional)
            </h4>
            {puntosIntermedios.length < 5 && (
              <button 
                className="optimizador-btn-add-stop"
                onClick={() => setPuntosIntermedios([...puntosIntermedios, ""])}
              >
                ➕ Agregar Parada
              </button>
            )}
          </div>
          
          {puntosIntermedios.length > 0 && (
            <div className="optimizador-intermediate-container">
              {puntosIntermedios.map((punto, index) => (
                <div key={index} className="optimizador-intermediate-item">
                  <div className="optimizador-intermediate-number">
                    {index + 1}
                  </div>
                  <div className="optimizador-intermediate-input-container">
                    <div className="optimizador-autocomplete-wrapper">
                      <input 
                        type="text"
                        value={punto}
                        onChange={(e) => manejarCambioIntermedio(index, e.target.value)}
                        onKeyDown={(e) => manejarTeclaIntermedio(e, index)}
                        onFocus={() => {
                          const nodosExcluir = [
                            origen, 
                            destino, 
                            ...puntosIntermedios.filter((p, i) => i !== index && p.trim() !== "")
                          ].filter(Boolean);
                          setSugerenciasIntermedios(prev => ({
                            ...prev,
                            [index]: obtenerSugerencias(punto, nodosExcluir)
                          }));
                        }}
                        onBlur={() => setTimeout(() => {
                          setSugerenciasIntermedios(prev => ({
                            ...prev,
                            [index]: []
                          }));
                        }, 200)}
                        placeholder={`Parada ${index + 1}...`}
                        className="optimizador-input optimizador-input-intermediate"
                        autoComplete="off"
                      />
                      {sugerenciasIntermedios[index] && sugerenciasIntermedios[index].length > 0 && (
                        <ul className="optimizador-sugerencias-list">
                          {sugerenciasIntermedios[index].map((sugerencia, i) => (
                            <li 
                              key={sugerencia}
                              className={indicesActivosIntermedios[index] === i ? 'active' : ''}
                              onMouseDown={() => seleccionarSugerenciaIntermedio(index, sugerencia)}
                              onMouseEnter={() => setIndicesActivosIntermedios(prev => ({
                                ...prev,
                                [index]: i
                              }))}
                            >
                              {sugerencia}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <button 
                    className="optimizador-btn-remove-stop"
                    onClick={() => {
                      const nuevoPuntos = puntosIntermedios.filter((_, i) => i !== index);
                      setPuntosIntermedios(nuevoPuntos);
                    }}
                    title="Eliminar parada"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {puntosIntermedios.length === 0 && (
            <div className="optimizador-intermediate-empty">
              <p>💡 Agrega paradas intermedias para crear rutas más específicas</p>
              <p>🖱️ Haz clic en "Agregar Parada" o selecciona puntos en el mapa</p>
            </div>
          )}
        </div>
        
        <div className="optimizador-buttons-row">
          <button 
            className="optimizador-btn optimizador-btn-primary"
            onClick={calcularRuta}
            disabled={animacionActiva}
          >
            {animacionActiva ? "⏳ Calculando ruta..." : "🚀 Calcular Ruta Óptima"}
          </button>
          
          <button 
            className="optimizador-btn optimizador-btn-success"
            onClick={() => {
              // Randomizar tiempos ±30%
              conexiones.forEach(conn => {
                const factor = 0.7 + Math.random() * 0.6; // entre 0.7 y 1.3
                conn.tiempo = Math.max(1, Math.round(conn.tiempo * factor));
              });
              setResultados({
                mensaje: "🎲 Simulando condiciones de tráfico variables...\n\n✅ Tiempos de viaje actualizados con factores aleatorios!",
                encontrada: false,
                esSimulacion: true
              });
            }}
          >
            🎲 Randomizar Tiempos
          </button>
          
          <button
            className="optimizador-btn optimizador-btn-secondary"
            onClick={() => {
              // Restaurar tiempos originales
              conexiones.forEach(conn => {
                const original = tiemposOriginales.find(
                  o => o.origen === conn.origen && o.destino === conn.destino
                );
                if (original) conn.tiempo = original.tiempo;
              });
              setResultados({
                mensaje: "⏪ Tiempos de viaje restaurados a los valores originales.",
                encontrada: false,
                esSimulacion: true
              });
            }}
          >
            ⏪ Restaurar Tiempos Originales
          </button>
          
          <button 
            className="optimizador-btn optimizador-btn-secondary"
            onClick={() => {
              setOrigen("");
              setDestino("");
              setPuntosIntermedios([]);
              setResultados(null);
            }}
          >
            ↩️ Limpiar Selección
          </button>
        </div>
        
        {resultados && resultados.encontrada && (
          <div className="optimizador-animation-controls">
            <button 
              className="optimizador-btn optimizador-btn-warning"
              onClick={() => animarCoche(resultados.rutaCompleta)}
              disabled={animacionActiva}
            >
              {animacionActiva ? "🚗 Coche en movimiento..." : "🚗 Ver Recorrido"}
            </button>
            
            <button 
              className="optimizador-btn optimizador-btn-info"
              onClick={() => {
                const svg = d3.select(svgRef.current);
                svg.selectAll('.coche-animado').remove();
                svg.selectAll('.ruta-destacada').remove();
                svg.selectAll('.indicador-paso').remove();
                svg.selectAll('#ruta-path').remove();
                setAnimacionActiva(false);
                setProgresRuta({ nodoActual: "", porcentaje: 0 });
              }}
              disabled={!animacionActiva}
            >
              ⏹️ Detener Animación
            </button>
          </div>
        )}
      </div>
      
      <div className="optimizador-map-section">
        <div>
          <h3 className="optimizador-map-title">🗺️ Mapa Interactivo de Santa Cruz de la Sierra</h3>
          <div className="optimizador-map-info">
            <div className="optimizador-instructions">
              <div className="optimizador-instructions-box">
                <strong>Instrucciones:</strong> 
                <br />1. Haz clic para seleccionar origen
                <br />2. Haz clic para seleccionar destino  
                <br />3. Haz clic en otros puntos para agregar hasta 5 paradas intermedias
                <br />4. Usa los botones o escribe directamente en los campos
              </div>
            </div>
          </div>
          
          {/* Información de selección */}
          <div className="optimizador-selection-info">
            <div className={`optimizador-selection-item optimizador-selection-origen ${!origen ? 'empty' : ''}`}>
              📍 Origen: {origen || "Sin seleccionar"}
            </div>
            {puntosIntermedios.filter(p => p !== "").length > 0 && (
              <div className="optimizador-selection-item optimizador-selection-intermediate">
                🛣️ Paradas ({puntosIntermedios.filter(p => p !== "").length}): {puntosIntermedios.filter(p => p !== "").join(" → ")}
              </div>
            )}
            <div className={`optimizador-selection-item optimizador-selection-destino ${!destino ? 'empty' : ''}`}>
              🎯 Destino: {destino || "Sin seleccionar"}
            </div>
            {!origen && (
              <div className="optimizador-selection-hint optimizador-selection-hint_primary">
                👆 Haz clic en un punto del mapa para seleccionar el origen
              </div>
            )}
            {origen && !destino && (
              <div className="optimizador-selection-hint optimizador-selection-hint_primary">
                👆 Ahora selecciona el destino haciendo clic en otro punto
              </div>
            )}
            {origen && destino && puntosIntermedios.length < 5 && (
              <div className="optimizador-selection-hint">
                💡 Puedes agregar hasta {5 - puntosIntermedios.length} paradas más
                <br />🖱️ Haz clic en "Agregar Parada" o selecciona puntos en el mapa
              </div>
            )}
            {puntosIntermedios.length === 5 && (
              <div className="optimizador-selection-hint optimizador-selection-hint_warning">
                ⚠️ Has alcanzado el máximo de 5 paradas intermedias
              </div>
            )}
            
            {animacionActiva && (
              <div className="optimizador-animation-progress">
                <div className="optimizador-progress-info">
                  <div className="optimizador-progress-text">
                    🚗 Coche en: <strong>{progresRuta.nodoActual}</strong>
                  </div>
                  <div className="optimizador-progress-percentage">
                    {progresRuta.porcentaje}% completado
                  </div>
                </div>
                <div className="optimizador-progress-bar">
                  <div 
                    className="optimizador-progress-fill"
                    style={{ width: `${progresRuta.porcentaje}%` }}
                  ></div>
                </div>
                <div className="optimizador-progress-coords">
                  📍 Posición: ({posicionCoche.x}, {posicionCoche.y})
                </div>
              </div>
            )}
          </div>
          <div className="optimizador-svg-container">
            <svg
              ref={svgRef}
              width="900"
              height="600"
              className="optimizador-svg"
            ></svg>
          </div>
          {/* Botón Mostrar/Ocultar Tiempos debajo del mapa, centrado */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 0 0' }}>
            <button
              className="optimizador-btn optimizador-btn-info"
              onClick={() => setMostrarTiempos(v => !v)}
            >
              {mostrarTiempos ? 'Ocultar Tiempos' : 'Mostrar Tiempos'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Sección de Resultados */}
      {resultados && (
        <div className="optimizador-results">
          {resultados.encontrada ? (
            <div className="optimizador-results-success">
              <h3 className="optimizador-results-title">
                🚀 Ruta Óptima Calculada - Algoritmo de {resultados.algoritmo}
              </h3>
              <div className="optimizador-algorithm-info">
                <span className="optimizador-algorithm-badge">
                  ⚡ Optimizado por: {resultados.criterioUsado === 'tiempo' ? 'Tiempo Mínimo' : 'Distancia Mínima'}
                </span>
              </div>
              <div className="optimizador-results-content">
                <div className="optimizador-results-route">
                  <div className="optimizador-route-complete">
                    {resultados.rutaCompleta.map((punto, index) => (
                      <React.Fragment key={index}>
                        <span className={`optimizador-route-point ${
                          index === 0 ? 'origen' : 
                          index === resultados.rutaCompleta.length - 1 ? 'destino' : 'intermedio'
                        }`}>
                          {index === 0 ? '📍' : index === resultados.rutaCompleta.length - 1 ? '🎯' : '🛣️'} {punto}
                        </span>
                        {index < resultados.rutaCompleta.length - 1 && (
                          <span className="optimizador-results-arrow">➡️</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                
                {/* Detalles de segmentos */}
                {resultados.segmentosRuta && resultados.segmentosRuta.length > 1 && (
                  <div className="optimizador-route-segments">
                    <h4>🛣️ Segmentos de la Ruta Óptima:</h4>
                    {resultados.segmentosRuta.map((segmento, index) => (
                      <div key={index} className="optimizador-segment">
                        <span className="optimizador-segment-route">
                          {segmento.desde} → {segmento.hasta}
                        </span>
                        <span className="optimizador-segment-details">
                          ⏱️ {segmento.tiempo} min | 📏 {segmento.distancia} km
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="optimizador-results-details">
                  <div className="optimizador-results-item">
                    <span className="optimizador-results-label">⏱️ Tiempo Total:</span>
                    <span className="optimizador-results-value">
                      {resultados.tiempo} minutos
                    </span>
                  </div>
                  <div className="optimizador-results-item">
                    <span className="optimizador-results-label">📏 Distancia Total:</span>
                    <span className="optimizador-results-value">
                      {resultados.distancia} km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : resultados.esSimulacion ? (
            <div className="optimizador-results-success">
              <h3 className="optimizador-results-title">🎲 Simulación de Tráfico</h3>
              <p className="optimizador-results-message">{resultados.mensaje}</p>
            </div>
          ) : (
            <div className="optimizador-results-error">
              <h3 className="optimizador-results-title">⚠️ Error</h3>
              <p className="optimizador-results-error-message">{resultados.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleTrafficOptimizer;
