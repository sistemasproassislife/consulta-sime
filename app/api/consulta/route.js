export async function POST(req) {
  try {
    const { cedula, valor, codser, codpre, coddia } = await req.json();

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
          error: "No se pudo obtener el token",
          detalle: tokenData,
        },
        { status: 500 }
      );
    }

    const params = new URLSearchParams();

    if (valor) params.append("valor", valor);
    if (codser) params.append("codser", codser);
    if (codpre) params.append("codpre", codpre);
    if (coddia) params.append("coddia", coddia);

    const queryString = params.toString();
    const url = `${process.env.APEX_API_URL}/${encodeURIComponent(cedula)}${
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
        error: "La respuesta no es JSON válido",
        raw: text,
      };
    }

    return Response.json(data, { status: apiResp.status });
  } catch (error) {
    return Response.json(
      {
        error: "Error interno",
        detalle: error.message,
      },
      { status: 500 }
    );
  }
}
