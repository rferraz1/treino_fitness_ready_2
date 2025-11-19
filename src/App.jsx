import React, { useEffect, useState } from 'react';
import Visualizacao from './Visualizacao.jsx';

export default function App() {
  const [busca, setBusca] = useState('');
  const [gifsMap, setGifsMap] = useState({});
  const [resultados, setResultados] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [visualizando, setVisualizando] = useState(false);
  const [nomeAluno, setNomeAluno] = useState('');

  // ✅ AGORA CARREGA gifsUrls.json (Cloudflare)
  useEffect(() => {
    fetch('/gifsUrls.json')
      .then(r => r.json())
      .then(setGifsMap)
      .catch(() => setGifsMap({}));
  }, []);

  // 🔍 FILTRAGEM DOS EXERCÍCIOS
  useEffect(() => {
    if (!busca.trim()) {
      setResultados([]);
      return;
    }

    const q = busca.toLowerCase();
    const out = [];

    Object.entries(gifsMap).forEach(([grupo, lista]) => {
      lista.forEach((url) => {
        const nomeArquivo = decodeURIComponent(
          url.split('/').pop().replace('.gif', '')
        );

        const nomeLimpo = nomeArquivo
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .toLowerCase();

        if (nomeLimpo.includes(q)) {
          out.push({
            key: `${grupo}::${nomeArquivo}`,
            grupo,
            file: url,        // URL do Cloudflare
            nome: nomeArquivo
          });
        }
      });
    });

    setResultados(out);
  }, [busca, gifsMap]);

  // AÇÕES DE TREINO
  const adicionar = (item) => {
    const id = `${item.grupo}::${item.file}`;
    if (selecionados.find(s => s.id === id)) return;

    setSelecionados(p => [...p, {
      id,
      grupo: item.grupo,
      file: item.file,
      nome: item.nome,
      reps: '',
      carga: ''
    }]);
  };

  const remover = (id) =>
    setSelecionados(p => p.filter(s => s.id !== id));

  const editarNome = (id, novo) =>
    setSelecionados(p => p.map(s => s.id === id ? { ...s, nome: novo } : s));

  const editarReps = (id, novo) =>
    setSelecionados(p => p.map(s => s.id === id ? { ...s, reps: novo } : s));

  const editarCarga = (id, novo) =>
    setSelecionados(p => p.map(s => s.id === id ? { ...s, carga: novo } : s));

  const mover = (index, dir) => {
    setSelecionados(p => {
      const c = [...p];
      const alvo = index + dir;
      if (alvo < 0 || alvo >= c.length) return c;
      [c[index], c[alvo]] = [c[alvo], c[index]];
      return c;
    });
  };

  // VISUALIZAÇÃO FINAL
  if (visualizando) {
    return (
      <Visualizacao
        selecionados={selecionados}
        nomeAluno={nomeAluno}
        voltar={() => setVisualizando(false)}
        editarReps={(idx, val) => {
          const id = selecionados[idx]?.id;
          if (id) editarReps(id, val);
        }}
        editarCarga={(idx, val) => {
          const id = selecionados[idx]?.id;
          if (id) editarCarga(id, val);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Criador de Treinos</h1>
        <input
          className="border px-3 py-2 rounded-lg text-sm"
          placeholder="Nome do aluno..."
          value={nomeAluno}
          onChange={(e) => setNomeAluno(e.target.value)}
        />
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
        
        {/* 🔍 COLUNA ESQUERDA — BUSCA */}
        <section className="lg:col-span-2 bg-white border rounded-2xl shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700">Buscar exercícios</label>

          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <input
              className="border px-3 py-2 rounded-lg flex-1"
              placeholder="Digite parte do nome…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {resultados.map(ex => (
              <div
                key={ex.key}
                className="cursor-pointer border p-3 rounded-xl shadow-sm hover:shadow-md transition bg-white"
                onClick={() => adicionar(ex)}
              >
                <div className="h-28 w-full flex items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  {/* 🎯 AGORA A GIF VEM DO CLOUDFLARE */}
                  <img
                    src={ex.file}
                    alt={ex.nome}
                    className="max-h-full"
                  />
                </div>

                <h3 className="mt-2 text-sm font-medium text-gray-800 line-clamp-2">
                  {ex.nome}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* 📝 COLUNA DIREITA — TREINO MONTADO */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800">Treino Selecionado</h2>

          <div className="mt-4 space-y-4">
            {selecionados.map((s, i) => (
              <div key={s.id} className="border rounded-xl p-3 shadow-sm bg-gray-50">

                <div className="flex items-center gap-3">
                  <img className="w-20 h-20 rounded-lg object-contain bg-white"
                    src={s.file}   // 🎯 também corrige aqui
                    alt={s.nome}
                  />

                  <div className="flex-1">
                    <input
                      className="w-full border px-2 py-1 rounded-lg mb-1"
                      value={s.nome}
                      onChange={(e) => editarNome(s.id, e.target.value)}
                    />

                    <div className="flex gap-2">
                      <input
                        className="border px-2 py-1 rounded-lg w-20"
                        placeholder="Reps"
                        value={s.reps}
                        onChange={(e) => editarReps(s.id, e.target.value)}
                      />
                      <input
                        className="border px-2 py-1 rounded-lg w-20"
                        placeholder="Carga"
                        value={s.carga}
                        onChange={(e) => editarCarga(s.id, e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button className="px-2 py-1 bg-gray-200 rounded-md"
                      onClick={() => mover(i, -1)}>↑</button>
                    <button className="px-2 py-1 bg-gray-200 rounded-md"
                      onClick={() => mover(i, 1)}>↓</button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded-md"
                      onClick={() => remover(s.id)}>X</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            disabled={!selecionados.length}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
            onClick={() => setVisualizando(true)}
          >
            Finalizar Treino
          </button>
        </section>
      </main>
    </div>
  );
}
