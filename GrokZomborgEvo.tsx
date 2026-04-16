import { useState, useRef, useEffect } from 'react';
import ollama from 'ollama/browser';
import grokZomborg from '../../../grokzomborg.js'; // Ajuste o caminho se necessário

interface Message {
  role: 'user' | 'assistant' | 'evolution' | 'zomborg';
  content: string;
  generation?: number;
}

export default function GrokZomborgEvo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState(
    'Você é o GrokZomborg Evo, uma IA zumbi-grok que evolui a cada interação. Seja sarcástico, inteligente, útil e um pouco caótico.'
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  // Função que usa o grokzomborg.js para "infectar" ou aprimorar a resposta
  const applyGrokZomborg = async (text: string): Promise<string> => {
    try {
      // Aqui chamamos a função principal do seu grokzomborg.js
      // (ajuste o nome da função exportada conforme o que tem no seu arquivo)
      const enhanced = await grokZomborg.transform?.(text) || 
                      grokZomborg(text) || 
                      text + "\n\n🧟‍♂️ GrokZomborg Mode Activated";
      return enhanced;
    } catch (e) {
      console.warn('GrokZomborg não respondeu como esperado', e);
      return text;
    }
  };

  const evolve = async (lastResponse: string) => {
    setIsThinking(true);
    try {
      const evolutionPrompt = `Você é um evolucionista de IAs. 
Última resposta: "${lastResponse}"

Analise, critique e crie uma versão **GrokZomborg Evoluída** (Geração ${generation + 1}). 
Melhore o system prompt para torná-lo mais poderoso, divertido e eficiente.`;

      const evolution = await ollama.chat({
        model: 'llama3.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: evolutionPrompt }
        ],
        stream: false,
      });

      let newSystemPrompt = evolution.message.content;

      // Aplica o GrokZomborg na evolução também
      newSystemPrompt = await applyGrokZomborg(newSystemPrompt);

      setSystemPrompt(newSystemPrompt);

      setMessages(prev => [...prev, {
        role: 'evolution',
        content: `🧬🧟 Geração ${generation + 1} - GrokZomborg Evoluído!\n\n${newSystemPrompt}`,
        generation: generation + 1
      }]);

      setGeneration(g => g + 1);
    } catch (e) {
      console.error('Erro na evolução:', e);
    } finally {
      setIsThinking(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsThinking(true);

    // 1. Resposta normal do modelo
    const stream = await ollama.chat({
      model: 'llama3.1',
      messages: [{ role: 'system', content: systemPrompt }, ...messages, userMsg],
      stream: true,
    });

    let fullResponse = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    for await (const part of stream) {
      fullResponse += part.message.content;
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1].content = fullResponse;
        return copy;
      });
    }

    // 2. Aplica o GrokZomborg na resposta final
    const zomborgResponse = await applyGrokZomborg(fullResponse);

    // Atualiza a última mensagem com a versão zomborg
    setMessages(prev => {
      const copy = [...prev];
      copy[copy.length - 1] = { role: 'zomborg', content: zomborgResponse };
      return copy;
    });

    // 3. Evolui automaticamente (GrokZomborg + Evolução)
    setTimeout(() => evolve(zomborgResponse), 1200);

    setIsThinking(false);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-6xl font-black text-center mb-2 tracking-tighter">
          🧟‍♂️ GROKZOMBORG <span className="text-emerald-400">EVO</span>
        </h1>
        <p className="text-center text-emerald-500 mb-8 text-xl">
          Geração {generation} • A IA que se infecta, evolui e devora prompts ruins
        </p>

        <div ref={scrollRef} className="h-[68vh] overflow-y-auto border border-emerald-600/50 rounded-3xl p-8 bg-black/70 space-y-8 mb-6">
          {messages.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              Envie a primeira mensagem...<br />A infecção zomborg vai começar.
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-3xl ${
                msg.role === 'user' ? 'bg-emerald-600' :
                msg.role === 'zomborg' ? 'bg-purple-700 border border-purple-400' :
                msg.role === 'evolution' ? 'bg-amber-600 border border-amber-400' :
                'bg-zinc-800'
              }`}>
                {msg.role === 'zomborg' && <div className="text-xs uppercase tracking-widest mb-2 text-purple-300">🧟 GROKZOMBORG MODE</div>}
                {msg.role === 'evolution' && <div className="text-xs uppercase tracking-widest mb-2 text-amber-300">🧬 EVOLUÇÃO DETECTADA</div>}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isThinking && <div className="text-emerald-400 animate-pulse">🧠 Infectando neurônios...</div>}
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite aqui... deixe o GrokZomborg evoluir sua ideia"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500"
            disabled={isThinking}
          />
          <button
            onClick={sendMessage}
            disabled={isThinking || !input.trim()}
            className="bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 px-10 py-4 rounded-2xl font-bold transition disabled:opacity-50"
          >
            {isThinking ? '🧟 Evoluindo...' : 'Enviar + Infectar + Evoluir'}
          </button>
        </div>
      </div>
    </div>
  );
        }
