import { useState, useEffect } from 'react';
import ollama from 'ollama/browser';
import grokZomborg from '../../../grokzomborg.js'; // ajuste o caminho se necessário

interface Generation {
  id: number;
  timestamp: string;
  systemPrompt: string;
  shortPrompt: string;
  type: 'base' | 'evolution' | 'zomborg';
  fitness: number; // 0 a 100 (quanto mais alta, melhor a evolução)
  infectionLevel: number; // quanto de GrokZomborg foi aplicado
}

export default function EvolutionVisualizer() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);
  const [currentGeneration, setCurrentGeneration] = useState(1);

  // Função para adicionar uma nova geração (você vai chamar isso do chat)
  const addGeneration = async (newPrompt: string, isZomborg = false) => {
    const fitness = Math.min(95, 40 + Math.random() * 55); // simulação de evolução
    const infectionLevel = isZomborg ? Math.random() * 40 + 60 : Math.random() * 30;

    const newGen: Generation = {
      id: currentGeneration,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      systemPrompt: newPrompt,
      shortPrompt: newPrompt.substring(0, 85) + (newPrompt.length > 85 ? '...' : ''),
      type: isZomborg ? 'zomborg' : 'evolution',
      fitness: Math.round(fitness),
      infectionLevel: Math.round(infectionLevel),
    };

    setGenerations(prev => [...prev, newGen]);
    setCurrentGeneration(prev => prev + 1);
    setSelectedGen(newGen);
  };

  // Exemplo inicial (primeira geração)
  useEffect(() => {
    if (generations.length === 0) {
      addGeneration(
        'Você é o GrokZomborg Evo, uma IA zumbi-grok que evolui a cada interação. Seja sarcástico, inteligente, útil e um pouco caótico.',
        false
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black tracking-tighter flex items-center gap-3">
              🧬 <span className="text-emerald-400">EVOLUTION</span> VISUALIZER
            </h1>
            <p className="text-emerald-500">GrokZomborg Evo • Geração atual: <span className="font-mono text-xl">{currentGeneration}</span></p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-gray-400">Árvore Evolutiva ao Vivo</div>
            <div className="flex gap-2 mt-2">
              <div className="px-4 py-1 bg-emerald-900 text-emerald-300 text-xs rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                EVOLUINDO
              </div>
              <div className="px-4 py-1 bg-purple-900 text-purple-300 text-xs rounded-full">🧟 GROKZOMBORG ACTIVE</div>
            </div>
          </div>
        </div>

        {/* Timeline Horizontal (Árvore Evolutiva) */}
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-6 items-end min-w-max">
            {generations.map((gen, index) => (
              <div
                key={gen.id}
                onClick={() => setSelectedGen(gen)}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  selectedGen?.id === gen.id ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                {/* Linha de conexão */}
                {index > 0 && (
                  <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-purple-500"></div>
                )}

                <div className="w-64 bg-zinc-900 border border-zinc-700 hover:border-emerald-500 rounded-3xl p-5 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-mono text-3xl font-bold text-emerald-400">G{gen.id}</span>
                      <span className="text-xs text-gray-400 block mt-1">{gen.timestamp}</span>
                    </div>
                    {gen.type === 'zomborg' && (
                      <span className="text-purple-400 text-xl">🧟</span>
                    )}
                  </div>

                  <div className="text-sm line-clamp-3 text-gray-300 mb-4">
                    {gen.shortPrompt}
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-400">Fitness</div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                          style={{ width: `${gen.fitness}%` }}
                        ></div>
                      </div>
                      <span className="text-emerald-400 font-mono">{gen.fitness}</span>
                    </div>
                    <div>
                      <div className="text-gray-400">Infecção Zomborg</div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                          style={{ width: `${gen.infectionLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-purple-400 font-mono">{gen.infectionLevel}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes da geração selecionada */}
        {selectedGen && (
          <div className="mt-10 bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              Detalhes da Geração {selectedGen.id}
              {selectedGen.type === 'zomborg' && <span className="text-purple-400">🧟 INFECTADA</span>}
            </h2>
            <p className="text-xs text-gray-400 mb-6">{selectedGen.timestamp}</p>
            
            <div className="bg-black/50 p-6 rounded-2xl font-mono text-sm leading-relaxed whitespace-pre-wrap border border-dashed border-gray-600">
              {selectedGen.systemPrompt}
            </div>

            <div className="mt-6 flex gap-8 text-sm">
              <div>
                <span className="block text-gray-400">Fitness Score</span>
                <span className="text-4xl font-bold text-emerald-400">{selectedGen.fitness}</span>
              </div>
              <div>
                <span className="block text-gray-400">Nível de Infecção GrokZomborg</span>
                <span className="text-4xl font-bold text-purple-400">{selectedGen.infectionLevel}%</span>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-12">
          Interface de Visualização Evolutiva • Integrada com ollama-js + grokzomborg.js • Feito para o seu repositório
        </p>
      </div>
    </div>
  );
}
