import React, { useState } from "react";

export default function Visualizacao({
  selecionados = [],
  nomeAluno = "",
  voltar = () => {},
  editarReps = () => {},
}) {
  // URL pública da Cloudflare R2
  const R2_BASE = "https://pub-0173b7fd04854be5b34e1727d5fa1798.r2.dev";

  // Observações por exercício
  const [obs, setObs] = useState(selecionados.map(() => ""));

  // Converte GIF para Base64 (para o HTML exportado)
  const carregarGIF = async (grupo, file) => {
    const url = `${R2_BASE}/gifs/${grupo}/${encodeURIComponent(file)}`;
    const res = await fetch(url);
    const blob = await res.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  // EXPORTAÇÃO — NOME + Nº + OBSERVAÇÃO + GIF
  const gerarHTML = async () => {
    let blocoHTML = "";

    for (let i = 0; i < selecionados.length; i++) {
      const ex = selecionados[i];

      const base64 = await carregarGIF(ex.grupo, ex.file);

      blocoHTML += `
        <section style="margin-bottom:40px; text-align:center;">
          
          <div style="
            display:flex;
            justify-content:center;
            align-items:center;
            gap:12px;
            margin-bottom:8px;
          ">
            <div style="
              width:32px;
              height:32px;
              border-radius:50%;
              background:#e0e7ff;
              color:#4338ca;
              font-weight:700;
              display:flex;
              justify-content:center;
              align-items:center;
              font-family:Inter, Arial;
            ">
              ${i + 1}
            </div>

            <h3 style="
              font-size:22px;
              font-weight:600;
              font-family:Inter,Arial;
            ">
              ${ex.nome}
            </h3>
          </div>

          ${
            obs[i]
              ? `<p style="
                font-size:14px;
                color:#555;
                margin-bottom:16px;
                font-family:Inter,Arial;
              ">${obs[i]}</p>`
              : ""
          }

          <img src="${base64}" alt="${ex.nome}" style="
            width:290px;
            height:290px;
            object-fit:contain;
            border-radius:14px;
            padding:10px;
            background:#fafafa;
            border:1px solid #eee;
          "/>

        </section>
      `;
    }

    const finalHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Treino - ${nomeAluno}</title>
<style>
  body {
    background:white;
    padding:30px;
    max-width:900px;
    margin:auto;
    font-family:Inter,Arial;
  }
  h1 {
    text-align:center;
    font-size:28px;
    margin-bottom:30px;
    font-weight:600;
  }
</style>
</head>
<body>

<h1>Treino de ${nomeAluno}</h1>

${blocoHTML}

<footer style="text-align:center;margin-top:40px;font-size:12px;color:#aaa;">
  Treino criado por Rodolfo Ferraz
</footer>

</body>
</html>
    `;

    const blob = new Blob([finalHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Treino-${nomeAluno}.html`;
    a.click();
  };

  return (
    <div className="min-h-screen w-[90%] mx-auto py-10">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm rounded-2xl p-8">

        <h2 className="text-3xl font-semibold text-center mb-6">
          Treino de {nomeAluno}
        </h2>

        <div className="space-y-6">
          {selecionados.map((ex, idx) => (
            <div
              key={ex.id}
              className="p-5 border border-gray-200 rounded-2xl shadow-md bg-white"
            >
              {/* Topo — número + nome + reps */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  
                  {/* Número no círculo */}
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                    {idx + 1}
                  </div>

                  <div className="text-lg font-medium">{ex.nome}</div>
                </div>

                {/* Campo de repetição */}
                <input
                  type="text"
                  defaultValue={ex.reps || "3x10 rep"}
                  onChange={(e) => editarReps(idx, e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm w-28 text-center"
                />
              </div>

              {/* Observações */}
              <textarea
                placeholder="Observações para o aluno..."
                value={obs[idx]}
                onChange={(e) => {
                  const novas = [...obs];
                  novas[idx] = e.target.value;
                  setObs(novas);
                }}
                className="w-full border border-gray-300 rounded-md p-2 text-sm mb-4"
                rows={2}
              />

              {/* GIF carregado do R2 */}
              <div className="flex justify-center">
                <img
                  src={`${R2_BASE}/gifs/${ex.grupo}/${encodeURIComponent(ex.file)}`}
                  alt={ex.nome}
                  className="w-28 h-28 object-contain border rounded-xl bg-gray-50"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Botões */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={voltar}
            className="px-6 py-3 text-sm bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition"
          >
            Voltar
          </button>

          <button
            onClick={gerarHTML}
            className="px-6 py-3 text-sm bg-black text-white rounded-xl"
          >
            Exportar treino
          </button>
        </div>

      </div>
    </div>
  );
}
