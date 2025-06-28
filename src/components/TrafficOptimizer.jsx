import React, { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';
import './TrafficOptimizer.css';

const redVial = {
  nodos: [
    { id: "Plaza 24 de Septiembre", tipo: "primer-anillo", x: 400, y: 300 },
    { id: "Av. Cañoto", tipo: "primer-anillo", x: 500, y: 250 },
    { id: "Av. Irala", tipo: "primer-anillo", x: 500, y: 350 },
    { id: "Av. Omar Chávez", tipo: "primer-anillo", x: 400, y: 400 },
    { id: "Av. Uruguay", tipo: "primer-anillo", x: 300, y: 350 },
    { id: "Av. Grigotá", tipo: "segundo-anillo", x: 300, y: 200 },
    { id: "Av. Alemania", tipo: "segundo-anillo", x: 600, y: 200 },
    { id: "Av. Roca y Coronado", tipo: "segundo-anillo", x: 650, y: 350 },
    { id: "Av. Cristo Redentor", tipo: "segundo-anillo", x: 500, y: 500 },
    { id: "Av. Beni", tipo: "segundo-anillo", x: 300, y: 500 },
    { id: "Av. San Martín", tipo: "segundo-anillo", x: 150, y: 350 }
  ],
  aristas: [
    { origen: "Plaza 24 de Septiembre", destino: "Av. Cañoto", peso: 3 },
    { origen: "Av. Cañoto", destino: "Av. Irala", peso: 2 },
    { origen: "Av. Irala", destino: "Av. Omar Chávez", peso: 4 },
    { origen: "Av. Omar Chávez", destino: "Av. Uruguay", peso: 3 },
    { origen: "Av. Uruguay", destino: "Plaza 24 de Septiembre", peso: 2 },
    { origen: "Av. Grigotá", destino: "Av. Alemania", peso: 5 },
    { origen: "Av. Alemania", destino: "Av. Roca y Coronado", peso: 4 },
    { origen: "Av. Roca y Coronado", destino: "Av. Cristo Redentor", peso: 6 },
    { origen: "Av. Cristo Redentor", destino: "Av. Beni", peso: 3 },
    { origen: "Av. Beni", destino: "Av. San Martín", peso: 5 },
    { origen: "Av. San Martín", destino: "Av. Grigotá", peso: 4 },
    { origen: "Av. Cañoto", destino: "Av. Alemania", peso: 6 },
    { origen: "Av. Irala", destino: "Av. Roca y Coronado", peso: 5 },
    { origen: "Av. Omar Chávez", destino: "Av. Cristo Redentor", peso: 5 },
    { origen: "Av. Uruguay", destino: "Av. Beni", peso: 6 },
    { origen: "Plaza 24 de Septiembre", destino: "Av. Grigotá", peso: 7 }
  ]
};

function dijkstra(origen, destino) {
  const distancias = {};
  const anteriores = {};
  const noVisitados = new Set();
  redVial.nodos.forEach(nodo => {
    distancias[nodo.id] = Infinity;
    anteriores[nodo.id] = null;
    noVisitados.add(nodo.id);
  });
  distancias[origen] = 0;
  while (noVisitados.size > 0) {
    let nodoActual = null;
    let menorDistancia = Infinity;
    noVisitados.forEach(nodo => {
      if (distancias[nodo] < menorDistancia) {
        menorDistancia = distancias[nodo];
        nodoActual = nodo;
      }
    });
    if (nodoActual === null || nodoActual === destino) break;
    noVisitados.delete(nodoActual);
    redVial.aristas.forEach(arista => {
      if (arista.origen === nodoActual && noVisitados.has(arista.destino)) {
        const distanciaAlternativa = distancias[nodoActual] + arista.peso;
        if (distanciaAlternativa < distancias[arista.destino]) {
          distancias[arista.destino] = distanciaAlternativa;
          anteriores[arista.destino] = nodoActual;
        }
      }
    });
  }
  const ruta = [];
  let nodo = destino;
  while (nodo !== null) {
    ruta.unshift(nodo);
    nodo = anteriores[nodo];
  }
  return {
    ruta,
    distanciaTotal: distancias[destino]
  };
}

const TrafficOptimizer = () => {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [resultado, setResultado] = useState(null);
  const svgRef = useRef();
  const [rutaActual, setRutaActual] = useState([]);

  useEffect(() => {
    drawNetwork();
    // eslint-disable-next-line
  }, [rutaActual]);

  const drawNetwork = () => {
    // Center the SVG content visually in the available area
    // Use a viewBox and responsive width/height
    const width = 800;
    const height = 600;
    // Use a moderate left shift for centerX to keep all nodes visible
    const centerX = width / 2 - 50;
    const centerY = height / 2;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    // Draw edges
    const aristas = svg.selectAll(".edge-group")
      .data(redVial.aristas)
      .enter()
      .append("g");
    aristas.append("line")
      .attr("class", d =>
        "edge" + (isEdgeInRoute(d, rutaActual) ? " highlighted" : "")
      )
      .attr("x1", d => getNode(d.origen).x)
      .attr("y1", d => getNode(d.origen).y)
      .attr("x2", d => getNode(d.destino).x)
      .attr("y2", d => getNode(d.destino).y);
    aristas.append("text")
      .attr("class", "edge-label")
      .attr("x", d => (getNode(d.origen).x + getNode(d.destino).x) / 2)
      .attr("y", d => (getNode(d.origen).y + getNode(d.destino).y) / 2)
      .text(d => d.peso + "min");
    // Draw nodes
    const nodos = svg.selectAll(".node-group")
      .data(redVial.nodos)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
    nodos.append("circle")
      .attr("class", d =>
        `node-circle ${d.tipo}${rutaActual.includes(d.id) ? " selected" : ""}`
      )
      .attr("r", 25);
    nodos.append("text")
      .attr("class", "node-text")
      .text(d => d.id.split(" ").slice(-1)[0])
      .attr("dy", "0.35em");
    nodos.append("title").text(d => d.id);
  };

  function getNode(id) {
    return redVial.nodos.find(n => n.id === id);
  }
  function isEdgeInRoute(edge, ruta) {
    for (let i = 0; i < ruta.length - 1; i++) {
      if (edge.origen === ruta[i] && edge.destino === ruta[i + 1]) return true;
    }
    return false;
  }

  const handleCalcular = () => {
    if (!origen || !destino) {
      alert("Por favor seleccione origen y destino");
      return;
    }
    if (origen === destino) {
      alert("El origen y destino no pueden ser iguales");
      return;
    }
    const res = dijkstra(origen, destino);
    if (res.distanciaTotal === Infinity) {
      alert("No existe ruta entre los puntos seleccionados");
      return;
    }
    setResultado(res);
    setRutaActual(res.ruta);
  };

  return (
    <div className="container" style={{ maxWidth: 1400, margin: "0 auto", padding: 20 }}>
      <div className="header" style={{ textAlign: "center", marginBottom: 30, color: "white" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: 10, textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
          🚦 Sistema de Optimización de Tráfico
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
          Santa Cruz de la Sierra - Algoritmo de Dijkstra para Rutas Óptimas
        </p>
      </div>
      <div className="main-content" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30, minHeight: 600 }}>
        <div className="control-panel" style={{ background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: 25, boxShadow: "0 15px 35px rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <div className="section">
            <h3 style={{ color: "#4a5568", marginBottom: 15, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: 10 }}>
              <span role="img" aria-label="lupa">🔍</span> Selección de Ruta
            </h3>
            <div className="input-group" style={{ marginBottom: 15 }}>
              <label htmlFor="origen">Punto de Origen:</label>
              <select id="origen" value={origen} onChange={e => setOrigen(e.target.value)}>
                <option value="">-- Seleccione origen --</option>
                {redVial.nodos.map(n => (
                  <option key={n.id} value={n.id}>{n.id}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 15 }}>
              <label htmlFor="destino">Punto de Destino:</label>
              <select id="destino" value={destino} onChange={e => setDestino(e.target.value)}>
                <option value="">-- Seleccione destino --</option>
                {redVial.nodos.map(n => (
                  <option key={n.id} value={n.id}>{n.id}</option>
                ))}
              </select>
            </div>
            <button className="btn" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", padding: "15px 30px", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 10 }} onClick={handleCalcular}>
              🚀 Calcular Ruta Óptima
            </button>
          </div>
          {resultado && (
            <div id="resultados" className="results" style={{ background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)", borderRadius: 15, padding: 20, marginTop: 20, borderLeft: "5px solid #667eea" }}>
              <h4 style={{ color: "#2d3748", marginBottom: 15, fontSize: "1.1rem" }}>📊 Resultados del Análisis</h4>
              <div className="route-info" style={{ background: "white", padding: 15, borderRadius: 10, marginBottom: 15, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <div className="route-path" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  {resultado.ruta.map((nodo, idx) => (
                    <React.Fragment key={nodo + idx}>
                      <div className="route-node" style={{ background: "#667eea", color: "white", padding: "8px 15px", borderRadius: 20, fontSize: "0.9rem", fontWeight: 600 }}>{nodo.split(" ").slice(-1)[0]}</div>
                      {idx < resultado.ruta.length - 1 && <div className="route-arrow" style={{ color: "#667eea", fontWeight: "bold" }}>→</div>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="time-info" style={{ display: "flex", alignItems: "center", gap: 10, color: "#4a5568", fontWeight: 600 }}>
                  <span>🕒 Tiempo total de viaje: <strong>{resultado.distanciaTotal} minutos</strong></span>
                </div>
              </div>
              <div className="stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 15 }}>
                <div className="stat-card" style={{ background: "white", padding: 15, borderRadius: 10, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <div className="stat-value" style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>{resultado.distanciaTotal}</div>
                  <div className="stat-label" style={{ color: "#718096", fontSize: "0.9rem", marginTop: 5 }}>Minutos</div>
                </div>
                <div className="stat-card" style={{ background: "white", padding: 15, borderRadius: 10, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <div className="stat-value" style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>{resultado.ruta.length}</div>
                  <div className="stat-label" style={{ color: "#718096", fontSize: "0.9rem", marginTop: 5 }}>Intersecciones</div>
                </div>
              </div>
            </div>
          )}
          <div className="section">
            <h3 style={{ color: "#4a5568", marginBottom: 15, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: 10 }}>
              <span role="img" aria-label="info">🎯</span> Información del Proyecto
            </h3>
            <div style={{ background: "#f7fafc", padding: 15, borderRadius: 10, fontSize: "0.9rem", lineHeight: 1.6 }}>
              <p><strong>Objetivo:</strong> Optimizar el flujo vehicular en Santa Cruz mediante algoritmos de investigación operativa.</p>
              <br />
              <p><strong>Metodología:</strong> Aplicación del algoritmo de Dijkstra para encontrar rutas mínimas en la red vial urbana.</p>
            </div>
          </div>
        </div>
        <div className="visualization-panel" style={{ background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: 25, boxShadow: "0 15px 35px rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.2)", position: "relative" }}>
          <div className="legend" style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.9)", padding: 15, borderRadius: 10, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
            <div className="legend-item" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: "0.9rem" }}>
              <div className="legend-color" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid white", background: "#38a169" }}></div>
              <span>Primer Anillo</span>
            </div>
            <div className="legend-item" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: "0.9rem" }}>
              <div className="legend-color" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid white", background: "#3182ce" }}></div>
              <span>Segundo Anillo</span>
            </div>
            <div className="legend-item" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: "0.9rem" }}>
              <div className="legend-color" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid white", background: "#e53e3e" }}></div>
              <span>Ruta Óptima</span>
            </div>
          </div>
          <svg ref={svgRef} className="svg-container" style={{ width: "100%", height: 600, borderRadius: 15, overflow: "hidden" }}></svg>
        </div>
      </div>
    </div>
  );
};

export default TrafficOptimizer;
