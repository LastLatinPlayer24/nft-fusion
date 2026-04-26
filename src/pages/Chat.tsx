import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Send, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What are the top NFT collections right now?',
  'Analyze the current NFT market stats',
  'Search for Bored Ape Yacht Club collection',
  'What collections are trending today?',
];

export default function Chat() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your NFT market analyst powered by AI. Ask me about collections, floor prices, wallet portfolios, or market trends — I'll fetch real-time data for you.",
    },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const userText = text ?? input.trim();
    if (!userText || loading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? data.error ?? 'Error fetching response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" /> AI NFT Analyst
        </h1>
        <p className="text-muted-foreground mt-1">Real-time NFT market analysis powered by Groq + Llama 3.3</p>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTIONS.map(s => (
            <Button key={s} variant="outline" className="text-left h-auto py-3 px-4 justify-start text-sm" onClick={() => send(s)}>
              {s}
            </Button>
          ))}
        </div>
      )}

      {/* Chat messages */}
      <Card>
        <CardHeader className="py-3 border-b">
          <CardTitle className="text-sm font-medium text-muted-foreground">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[420px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {msg.role === 'assistant' ? <Brain className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Fetching real-time data...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <input
              className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              placeholder="Ask about any NFT collection, wallet, or market..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading}
            />
            <Button size="icon" onClick={() => send()} disabled={!input.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
