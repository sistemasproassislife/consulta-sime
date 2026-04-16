"use client";
import { useState } from "react";

const OPCIONES_SERVICIO = [
  { value: "TODOS", label: "TODOS" },
  { value: "CONSULTA", label: "CONSULTA" },
  { value: "IMAGEN", label: "IMAGEN" },
  { value: "LABORATORIO", label: "LABORATORIO" },
  { value: "MEDICAMENTOS", label: "MEDICAMENTOS" },
];

export default function Home() {
  const [cedula, setCedula] = useState("");
  const [codser, setCodser] = useState("TODOS");
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cedula,
          codser,
          coddia,
        }),
      });

      const json = await res.json();
      setRespuesta(json);
    } catch (err) {
      setErrorConexion("Ocurrió un error al consultar el servicio. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => {
    setCedula("");
    setCodser("TODOS");
    setCoddia("");
    setRespuesta(null);
    setErrorConexion("");
  };

  const fault = respuesta?.fault || null;
  const mensajeRequerido = respuesta?.message || "";
  const esErrorFault = fault?.error === true;
  const esErrorRequerido = !!mensajeRequerido;
  const hayErrorNegocio = esErrorFault || esErrorRequerido;

  const mensajes = [];

  if (esErrorFault && fault?.descripcion) {
    mensajes.push(fault.descripcion);
  }

  if (esErrorRequerido && respuesta?.message) {
    mensajes.push(respuesta.message);
  }

  const afiliado = Array.isArray(respuesta?.afiliado) ? respuesta.afiliado : [];
  const plan = afiliado.length > 0 ? afiliado[0] : {};
  const nucleoFamiliar = Array.isArray(plan?.nucleoFamiliar) ? plan.nucleoFamiliar : [];
  const servicios = Array.isArray(plan?.servicios) ? plan.servicios : [];

  const hayExito = !!plan && Object.keys(plan).length > 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.logoWrap}>
          <img
            src="/logo-proassislife.png"
            alt="Proassislife"
            style={styles.logo}
          />
        </div>

        <div style={styles.heroCard}>
          <h1 style={styles.title}>Consulta SIME</h1>
          <p style={styles.subtitle}>
            Ingresa la cédula para consultar la información disponible.
          </p>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Cédula</label>
              <input
                type="text"
                placeholder="Ingresa la cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                style={styles.input}
                maxLength={13}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.fieldLabel}>Servicio</label>
              <select
                value={codser}
                onChange={(e) => setCodser(e.target.value)}
                style={styles.select}
              >
                {OPCIONES_SERVICIO.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.fieldLabel}>Diagnóstico</label>
              <input
                type="text"
                placeholder="Código diagnóstico (opcional)"
                value={coddia}
                onChange={(e) => setCoddia(e.target.value)}
                style={styles.input}
                maxLength={20}
              />
            </div>
          </div>

          <div style={styles.actions}>
            <button
              onClick={consultar}
              style={styles.buttonPrimary}
              disabled={loading}
            >
              {loading ? "Consultando..." : "Consultar"}
            </button>

            <button
              onClick={limpiar}
              style={styles.buttonSecondary}
              type="button"
            >
              Limpiar
            </button>
          </div>
        </div>

        {errorConexion && (
          <div style={styles.errorCard}>
            <div style={styles.errorItem}>
              <div style={styles.errorIcon}>⚠️</div>
              <div>
                <div style={styles.errorTitle}>Error de conexión</div>
                <div style={styles.errorText}>{errorConexion}</div>
              </div>
            </div>
          </div>
        )}

        {hayErrorNegocio && mensajes.length > 0 && (
          <div style={styles.errorCard}>
            {mensajes.map((m, i) => {
              const tipo = obtenerTipoError(m);

              return (
                <div key={i} style={styles.errorItem}>
                  <div style={styles.errorIcon}>
                    {tipo === "cedula" && "⚠️"}
                    {tipo === "carencia" && "⏳"}
                    {tipo === "preexistencia" && "🧬"}
                    {tipo === "mora" && "💰"}
                    {tipo === "no_afiliado" && "❌"}
                    {tipo === "general" && "⚠️"}
                  </div>

                  <div>
                    <div style={styles.errorTitle}>
                      {tipo === "cedula" && "Debes ingresar la cédula"}
                      {tipo === "carencia" && "Afiliado en período de carencia"}
                      {tipo === "preexistencia" && "Preexistencia detectada"}
                      {tipo === "mora" && "Cliente en mora"}
                      {tipo === "no_afiliado" && "No se encontró afiliado"}
                      {tipo === "general" && "Ocurrió un inconveniente"}
                    </div>

                    <div style={styles.errorText}>{m}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!hayErrorNegocio && respuesta && hayExito && (
          <>
            <div style={styles.statusBanner}>
              <div>
                <div style={styles.statusLabel}>Estado de la consulta</div>
                <div style={styles.statusValue}>Afiliado encontrado</div>
              </div>
              <div style={styles.statusBadgeOk}>
                {plan?.estadoActivo || "-"}
              </div>
            </div>

            <div style={styles.resultsWrapper}>
              <SectionTitle>Información del plan</SectionTitle>
              <div style={styles.card}>
                <InfoGrid
                  items={[
                    ["Estado", <span style={styles.estadoOk}>{plan?.estadoActivo || "-"}</span>],
                    ["Plan", plan?.nombrePlan || "-"],
                    ["Código plan", plan?.codigoPlan || "-"],
                    ["Número de contrato", plan?.numeroContrato ?? "-"],
                    ["Beneficiario", plan?.nombreBeneficiario || "-"],
                    ["Cédula beneficiario", plan?.cedulaBeneficiario || "-"],
                    ["En mora", plan?.enMora || "-"],
                    ["En carencia", plan?.enCarencia || "-"],
                    ["Observación", plan?.observacion || "-"],
                    ["Fecha inicio", formatearFecha(plan?.fechaInicio)],
                  ]}
                />
              </div>

              <SectionTitle>Núcleo familiar</SectionTitle>
              {nucleoFamiliar.length > 0 ? (
                nucleoFamiliar.map((persona, index) => (
                  <div style={styles.card} key={index}>
                    <InfoGrid
                      items={[
                        ["Código", persona?.codigo ?? "-"],
                        ["Cédula", persona?.cedulaDependiente || "-"],
                        ["Nombre", unirNombre(persona?.nombreDependiente, persona?.apellidoDependiente)],
                        ["Nacimiento", formatearFecha(persona?.nacimientoDependiente)],
                        ["Género", persona?.generoDependiente || "-"],
                        ["Relación", persona?.relacionDependiente || "-"],
                      ]}
                    />
                  </div>
                ))
              ) : (
                <div style={styles.card}>
                  <span>No existen integrantes registrados.</span>
                </div>
              )}

              <SectionTitle>Servicios</SectionTitle>
              {servicios.length > 0 ? (
                servicios.map((servicio, index) => (
                  <div style={styles.card} key={index}>
                    <InfoGrid
                      items={[
                        ["Servicio", servicio?.servicio || "-"],
                        ["Cobertura", servicio?.cobertura ?? "-"],
                        ["Valor cobertura", servicio?.valorCobertura ?? "-"],
                        ["Valor deducible", servicio?.valorDeducible ?? "-"],
                        ["Copago", servicio?.copago ?? "-"],
                        ["Tipo copago", servicio?.tipoCopago || "-"],
                      ]}
                    />
                  </div>
                ))
              ) : (
                <div style={styles.card}>
                  <span>No existen servicios registrados.</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 style={styles.sectionTitle}>{children}</h2>;
}

function InfoGrid({ items }) {
  return (
    <div style={styles.grid}>
      {items.map(([label, value], index) => (
        <div key={index} style={styles.gridItem}>
          <div style={styles.label}>{label}:</div>
          <div style={styles.value}>{value || "-"}</div>
        </div>
      ))}
    </div>
  );
}

function unirNombre(nombres, apellidos) {
  return [nombres, apellidos].filter(Boolean).join(" ") || "-";
}

function formatearFecha(fecha) {
  if (!fecha) return "-";
  const soloFecha = String(fecha).split("T")[0];
  const partes = soloFecha.split("-");
  if (partes.length !== 3) return soloFecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obtenerTipoError(mensaje) {
  if (!mensaje) return "general";

  const m = mensaje.toUpperCase();

  if (m.includes("CAMPO REQUERIDO")) return "cedula";
  if (m.includes("TODOS LOS CAMPOS SON REQUERIDOS")) return "cedula";
  if (m.includes("CARENCIA")) return "carencia";
  if (m.includes("PREEXISTENCIA")) return "preexistencia";
  if (m.includes("MORA")) return "mora";
  if (m.includes("SERVICIO AL CLIENTE")) return "no_afiliado";

  return "general";
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #eef3fb 0%, #f8fbff 100%)",
    padding: "28px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  logoWrap: {
    textAlign: "center",
    marginBottom: "20px",
  },
  logo: {
    maxWidth: "360px",
    width: "100%",
    height: "auto",
  },
  heroCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "34px",
    boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
    border: "1px solid #e6edf8",
  },
  title: {
    textAlign: "center",
    margin: 0,
    color: "#17356d",
    fontSize: "42px",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    color: "#5e6f8e",
    fontSize: "16px",
    marginTop: "10px",
    marginBottom: "30px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fieldLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#17356d",
  },
  input: {
    padding: "16px 18px",
    borderRadius: "16px",
    border: "1px solid #cfd7e6",
    fontSize: "18px",
    outline: "none",
    background: "#fcfdff",
  },
  select: {
    padding: "16px 18px",
    borderRadius: "16px",
    border: "1px solid #cfd7e6",
    fontSize: "18px",
    outline: "none",
    background: "#fcfdff",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  buttonPrimary: {
    padding: "14px 28px",
    borderRadius: "16px",
    border: "none",
    background: "#2f66e8",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
  },
  buttonSecondary: {
    padding: "14px 24px",
    borderRadius: "16px",
    border: "1px solid #cfd7e6",
    background: "#fff",
    color: "#17356d",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },
  statusBanner: {
    marginTop: "24px",
    background: "#17356d",
    color: "#fff",
    borderRadius: "18px",
    padding: "22px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow: "0 10px 24px rgba(23, 53, 109, 0.18)",
  },
  statusLabel: {
    fontSize: "14px",
    opacity: 0.85,
    marginBottom: "6px",
  },
  statusValue: {
    fontSize: "24px",
    fontWeight: "700",
  },
  statusBadgeOk: {
    background: "#d1fadf",
    color: "#067647",
    border: "1px solid #a6f4c5",
    borderRadius: "999px",
    padding: "10px 18px",
    fontWeight: "700",
  },
  resultsWrapper: {
    marginTop: "18px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 12px 30px rgba(16, 24, 40, 0.06)",
    border: "1px solid #e6edf8",
  },
  sectionTitle: {
    color: "#0e539c",
    fontSize: "26px",
    fontStyle: "italic",
    marginTop: "18px",
    marginBottom: "14px",
    borderBottom: "1px solid #d9e1ef",
    paddingBottom: "10px",
  },
  card: {
    background: "#f7f9fc",
    border: "1px solid #d5dcea",
    borderRadius: "12px",
    padding: "18px 20px",
    marginBottom: "18px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px 26px",
  },
  gridItem: {
    minHeight: "40px",
  },
  label: {
    fontWeight: "700",
    fontStyle: "italic",
    color: "#232f4b",
    marginBottom: "4px",
  },
  value: {
    color: "#4b5565",
    lineHeight: 1.35,
    wordBreak: "break-word",
  },
  estadoOk: {
    color: "#138a36",
    fontWeight: "700",
  },
  errorCard: {
    background: "#fff4f4",
    border: "1px solid #f5c2c7",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "22px",
  },
  errorItem: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },
  errorIcon: {
    fontSize: "28px",
    lineHeight: 1,
  },
  errorTitle: {
    fontWeight: "700",
    color: "#b42318",
    marginBottom: "6px",
    fontSize: "18px",
  },
  errorText: {
    color: "#5f2120",
    fontSize: "15px",
    lineHeight: 1.5,
  },
};
