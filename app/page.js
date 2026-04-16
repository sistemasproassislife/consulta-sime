"use client";
import { useState } from "react";

export default function Home() {
  const [cedula, setCedula] = useState("");
  const [valor, setValor] = useState("");
  const [codser, setCodser] = useState("");
  const [codpre, setCodpre] = useState("");
  const [coddia, setCoddia] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorConexion, setErrorConexion] = useState("");

  const consultar = async () => {
    setLoading(true);
    setErrorConexion("");
    setRespuesta(null);

    try {
      const res = await fetch("/api/consulta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cedula,
          valor,
          codser,
          codpre,
          coddia
        })
      });

      const json = await res.json();
      setRespuesta(json);
    } catch (err) {
      setErrorConexion("Ocurrió un error al consultar el servicio.");
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => {
    setCedula("");
    setValor("");
    setCodser("");
    setCodpre("");
    setCoddia("");
    setRespuesta(null);
    setErrorConexion("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Consulta SIME</h1>
        <p style={styles.subtitle}>
          Ingresa la cédula y, si deseas, agrega los parámetros opcionales.
        </p>

        <div style={styles.formGrid}>
          <input
            type="text"
            placeholder="Cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="valor (opcional)"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="codser (opcional)"
            value={codser}
            onChange={(e) => setCodser(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="codpre (opcional)"
            value={codpre}
            onChange={(e) => setCodpre(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="coddia (opcional)"
            value={coddia}
            onChange={(e) => setCoddia(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.actions}>
          <button onClick={consultar} style={styles.buttonPrimary} disabled={loading}>
            {loading ? "Consultando..." : "Consultar"}
          </button>

          <button onClick={limpiar} style={styles.buttonSecondary} type="button">
            Limpiar
          </button>
        </div>

        {errorConexion && (
          <div style={styles.errorBox}>{errorConexion}</div>
        )}

        {respuesta && (
          <div style={styles.resultCard}>
            <h2 style={styles.resultTitle}>Resultado</h2>
            <pre style={styles.pre}>
              {JSON.stringify(respuesta, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#eef3fb",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "#fff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    textAlign: "center",
    color: "#17356d",
    fontSize: "38px",
  },
  subtitle: {
    textAlign: "center",
    color: "#5e6f8e",
    marginTop: "12px",
    marginBottom: "28px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  input: {
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #cfd7e6",
    fontSize: "16px",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  buttonPrimary: {
    background: "#2f66e8",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "14px 24px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  buttonSecondary: {
    background: "#fff",
    color: "#17356d",
    border: "1px solid #cfd7e6",
    borderRadius: "14px",
    padding: "14px 24px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  errorBox: {
    marginTop: "20px",
    background: "#fff4f4",
    border: "1px solid #f5c2c7",
    color: "#b42318",
    borderRadius: "12px",
    padding: "14px 16px",
  },
  resultCard: {
    marginTop: "24px",
    background: "#f7f9fc",
    border: "1px solid #d5dcea",
    borderRadius: "14px",
    padding: "18px",
  },
  resultTitle: {
    marginTop: 0,
    color: "#17356d",
  },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: 0,
  },
};
