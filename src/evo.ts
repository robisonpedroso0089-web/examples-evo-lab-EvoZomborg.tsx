import { useState, useRef, useEffect } from 'react';
import ollama from 'ollama/browser';

interface Message {
  role: 'user' | 'assistant' | 'evolution';
  content: string;
  generation?: number;
}

export default function EvoZomborg() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState('Você é o EvoZomborg, uma IA que evolui a cada resposta.');

  const scrollRef = useRef<HTMLDivElement>(null);

  const evolve = async (lastResponse: string) => {
    setIsThinking(true);
    try {
      const evolution = await ollama.chat({
        model: 'llama3.1', // ou o modelo que você preferir
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Última resposta dada: "${lastResponse}".\n\nCritique, melhore e crie uma NOVA versão 2.0 de si mesmo. Gere um novo system prompt melhorado.` }
        ],
        stream: false,
      });

      const newSystemPrompt = evolution.message.content;
      setSystemPrompt(newSystemPrompt);

      setMessages(prev => [...prev, {
        role: 'evolution',
        content: `🚀 Geração ${generation + 1} criada!\n\n${newSystemPrompt}`,
        generation: generation + 1
      }]);

      setGeneration(g => g + 1);
    } catch (e) {
      console.error(e);
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

    const response = await ollama.chat({
      model: 'llama3.1',
      messages: [{ role: 'system', content: systemPrompt }, ...messages, userMsg],
      stream: true,
    });

    let fullResponse = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    for await (const part of response) {
      fullResponse += part.message.content;
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1].content = fullResponse;
        return copy;
      });
    }

    // Depois da resposta, a IA evolui automaticamente
    setTimeout(() => evolve(fullResponse), 800);
    setIsThinking(false);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <h1 className="text-5xl font-bold text-center mb-2">🧬 EvoZomborg</h1>
      <p className="text-center text-emerald-400 mb-8">A IA que evolui sozinha • Geração {generation}</p>

      <div ref={scrollRef} className="h-[70vh] overflow-y-auto border border-emerald-500 rounded-3xl p-6 bg-black/50 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-emerald-600' : m.role === 'evolution' ? 'bg-purple-600' : 'bg-gray-800'}`}>
              {m.role === 'evolution' && <span className="text-xs bg-purple-800 px-2 py-1 rounded">EVOLUÇÃO</span>}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Digite sua mensagem... a evolução começa agora"
          className="flex-1 bg-gray-800 border border-emerald-500 rounded-2xl px-6 py-4 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={isThinking}
          className="bg-emerald-500 hover:bg-emerald-600 px-10 rounded-2xl font-bold transition"
        >
          {isThinking ? 'Evoluindo...' : 'Enviar + Evoluir'}
        </button>
      </div>

      <p className="text-center text-xs mt-8 text-gray-500">
        Baseado no ollama-js + grokzomborg.js • Criado por robisonpedroso0089-web
      </p>
    </div>
  );
}
