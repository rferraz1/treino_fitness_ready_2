import React, { useEffect, useState } from 'react';
import Visualizacao from './Visualizacao.jsx';

export default function App() {
  const [busca, setBusca] = useState('');
  const [gifsMap, setGifsMap] = useState({});
  const [resultados, setResultados] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [visualizando, setVisualizando] = useState(false);
  const [nomeAluno, setNomeAluno] = useState('');

  // carrega o gifs.json
  useEffect(() => {
    fetch('/gifs.json')
      .then(r => r.json())
      .then(setGifsMap)
      .catch(() => setGifsMap({}));
  }, []);

  // filtra exercícios
  useEffect(() => {
    if (!busca.trim()) {
      setResultados([]);
      return;
    }
    const q = busca.toLowerCase();
    const out = [];
    Object.entries(gifsMap).forEach(([grupo, arquivos]) => {
      arquivos.forEach(arquivo => {
        if (arquivo.toLowerCase().includes(q)) {
          out.push({
            key: `${grupo}::${arquivo}`,
            grupo,
            file: arquivo,
            nome: arquivo.replace(/\.gif$/i, '').replace(/_/g, ' ')
          });
        }
      });
    });
    setResultados(out);
  }, [busca, gifsMap]);

  // ações no treino
  const adicionar = (item) => {
    const id = `${item.grupo}::${item.file}`;
    if (selecionados.find(s => s.id === id)) return;
    const novo = {
      id,
      grupo: item.grupo,
      file: item.file,
      nome: item.nome,
      reps: '3x10 rep',
      carga: '' // campo de carga
    };
    setSelecionados(p => [...p, novo]);
  };

  const remover = (id) =>
    setSelecionados(p => p.filter(s => s.id !== id));

  const editarNome = (id, novo) =>
    setSelecionados(p => p.map(s => s.id === id ? { ...s, nome: novo } : s));

  const editarReps = (id, novo) =>
    setSelecionados(p => p.map(s => s.id === id ? { ...s, reps: novo } : s));

  const editarCarga = (id, novo) =>
    setSelecionados(p => p.map(s => s.id === id ? { ...s, carga: novo } : s));

  const mover = (index, dir) =>
    setSelecionados(p => {
      const c = [...p];
      const alvo = dir === 'up' ? index - 1 : index + 1;
      if (alvo < 0 || alvo >= c.length) return c;
      [c[index], c[alvo]] = [c[alvo], c[index]];
      return c;
    });

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
    <div className="min-h-screen w-[90%] mx-auto py-10">
      <header className="mb-10 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Planner de Exercícios
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Monte treinos limpos, salvos e fáceis de compartilhar com seus alunos.
          </p>
        </div>
        <div className="hidden sm:flex text-xs text-gray-400">
          Treinos by <span className="font-medium ml-1">Rodolfo Ferraz</span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna esquerda - busca */}
        <section className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700">
            Buscar exercícios
          </label>

          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Ex.: agachamento, rosca direta, supino..."
              className="flex-1 px-4 py-3 text-base rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition"
            />
            <button
              onClick={() => setBusca('')}
              className="px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
            >
              Limpar
            </button>
          </div>

          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Resultados
              </h2>
              <span className="text-xs text-gray-400">
                {busca.trim()
                  ? `${resultados.length} exercício(s) encontrado(s)`
                  : 'Comece digitando para ver os exercícios'}
              </span>
            </div>

            {busca.trim() ? (
              resultados.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {resultados.map(ex => (
                    <article
                      key={ex.key}
                      className="border border-gray-100 rounded-xl p-3 bg-white hover:shadow-sm transition"
                    >
                      <div className="h-56 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        <img
                          src={`/gifs/${ex.grupo}/${ex.file}`}
                          alt={ex.nome}
                          className="max-h-full"
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                            {ex.nome}
                          </h3>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {ex.grupo}
                          </p>
                        </div>
                        <button
                          onClick={() => adicionar(ex)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                        >
                          Adicionar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-gray-500">
                  Nenhum exercício encontrado para <span className="font-medium">"{busca}"</span>.
                </p>
              )
            ) : (
              <div className="mt-6 border border-dashed border-gray-200 rounded-2xl py-12 text-center text-sm text-gray-400">
                Digite na busca acima para listar os exercícios com GIFs.
              </div>
            )}
          </div>
        </section>

        {/* Coluna direita - treino selecionado */}
        <aside className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Treino Selecionado
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {selecionados.length} exercício(s) neste treino
          </p>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nome do aluno
            </label>
            <input
              value={nomeAluno}
              onChange={e => setNomeAluno(e.target.value)}
              placeholder="Ex.: João Silva"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition"
            />
          </div>

          <ul className="mt-5 space-y-3">
            {selecionados.length ? (
              selecionados.map((s, idx) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xs w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200">
                      {idx + 1}
                    </div>
                    <img
                      src={`/gifs/${s.grupo}/${s.file}`}
                      alt={s.nome}
                      className="w-16 h-16 rounded-lg object-cover bg-white border border-gray-200"
                    />
                    <div>
                      <input
                        value={s.nome}
                        onChange={e => editarNome(s.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-full mb-1 outline-none focus:ring-1 focus:ring-black/5"
                      />
                      <div className="flex gap-2 text-[11px] text-gray-500">
                        <span>{s.grupo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-[11px]">
                    <input
                      value={s.reps}
                      onChange={e => editarReps(s.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 w-24 text-xs outline-none focus:ring-1 focus:ring-black/5"
                      placeholder="Séries x reps"
                    />
                    <input
                      value={s.carga || ''}
                      onChange={e => editarCarga(s.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 w-24 text-xs outline-none focus:ring-1 focus:ring-black/5"
                      placeholder="Carga (kg)"
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => mover(idx, 'up')}
                        className="px-1.5 py-0.5 border border-gray-200 rounded-md text-[10px]"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => mover(idx, 'down')}
                        className="px-1.5 py-0.5 border border-gray-200 rounded-md text-[10px]"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => remover(s.id)}
                        className="px-1.5 py-0.5 border border-red-200 bg-red-50 text-red-600 rounded-md text-[10px]"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">
                Nenhum exercício selecionado.
              </li>
            )}
          </ul>

          <div className="mt-6">
            <button
              onClick={() => setVisualizando(true)}
              disabled={!selecionados.length}
              className="w-full py-3 rounded-xl text-sm font-medium text-white bg-black disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Visualizar / Exportar treino
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
