export async function POST(req) {
  try {
    const { cedula, codser, coddia } = await req.json();

    const tokenResp = await fetch(process.env.OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
          ).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenResp.json();

    if (!tokenResp.ok) {
      return Response.json(
        {
          fault: {
            codigo: "",
            descripcion: "No se pudo obtener el token de autenticación",
            error: true,
          },
        },
        { status: 500 }
      );
    }

    const params = new URLSearchParams();

    if (codser && codser !== "TODOS") params.append("codser", codser);
    if (coddia) params.append("coddia", coddia);

    const queryString = params.toString();
    const url = `${process.env.APEX_API_URL}/${encodeURIComponent(cedula || "")}${
      queryString ? `?${queryString}` : ""
    }`;

    const apiResp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    });

    const text = await apiResp.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        fault: {
          codigo: "",
          descripcion: text || "La respuesta del servicio no es un JSON válido",
          error: true,
        },
      };
    }

    return Response.json(data, { status: apiResp.status });
  } catch (error) {
    return Response.json(
      {
        fault: {
          codigo: "",
          descripcion: "Error interno al consultar el servicio",
          error: true,
        },
        detalle: error.message,
      },
      { status: 500 }
    );
  }
}
