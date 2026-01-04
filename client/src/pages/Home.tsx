import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Sparkles, Heart, Megaphone, ShoppingBag, MessageCircle } from "lucide-react";
import { useState } from "react";

/**
 * Design Philosophy: Minimalismo Moderno com Foco em Criatividade
 * - Espaço em branco generoso como protagonista
 * - Tipografia hierárquica (Poppins para títulos, Inter para corpo)
 * - Cores: Branco, Preto profundo, Roxo vibrante (#7C3AED)
 * - Linhas geométricas finas como divisores
 * - Micro-interações sutis
 */

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    type: "",
    message: "",
    style: "",
    keywords: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de saber mais sobre os serviços da VERSONORA. Nome: ${formData.name}, Email: ${formData.email}, Tipo: ${formData.type}, Mensagem: ${formData.message}`
    );
    window.open(`https://wa.me/5527998989899?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-slate-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-600" />
            <span className="text-xl font-bold text-slate-900">VERSONORA</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#como-funciona" className="hover:text-purple-600 transition-colors">Como Funciona</a>
            <a href="#tipos" className="hover:text-purple-600 transition-colors">Tipos</a>
            <a href="#formulario" className="hover:text-purple-600 transition-colors">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 -z-10"></div>
        
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Sua História,
                <br />
                <span className="text-purple-600">Nossa Melodia</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Transformamos briefings em jingles comerciais, políticos e músicas para casamentos personalizadas. 
                Inteligência Artificial + Curadoria Humana = Perfeição Emocional.
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Começar Meu Briefing
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50"
                >
                  Saiba Mais
                </Button>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative h-96 md:h-full flex items-center justify-center">
              <img 
                src="/images/hero-music-creation.png" 
                alt="Criação de Música" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Divider Line */}
      <div className="px-4">
        <div className="container mx-auto border-t border-slate-200"></div>
      </div>

      {/* O Diferencial Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">O Diferencial: Curadoria IA</h2>
            <p className="text-lg text-slate-600">
              Combinamos a velocidade da Inteligência Artificial com a sensibilidade humana
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <div className="relative h-80 flex items-center justify-center">
              <img 
                src="/images/ai-curation-concept.png" 
                alt="Conceito de Curadoria IA" 
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Right: Text */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Geração Inteligente
                </h3>
                <p className="text-slate-600">
                  Nossa IA processa seu briefing e gera a base da letra e melodia em minutos, 
                  capturando a essência da sua mensagem.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Heart className="w-6 h-6 text-purple-600" />
                  Refinamento Humano
                </h3>
                <p className="text-slate-600">
                  Especialistas em música refinam cada detalhe, garantindo que a emoção 
                  e a efetividade comercial sejam perfeitas.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Music className="w-6 h-6 text-purple-600" />
                  Entrega Premium
                </h3>
                <p className="text-slate-600">
                  Receba sua música em alta qualidade, pronta para emocionar, vender ou celebrar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider Line */}
      <div className="px-4">
        <div className="container mx-auto border-t border-slate-200"></div>
      </div>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-16">Como Funciona</h2>

          <div className="space-y-8">
            {[
              { step: "1", title: "Briefing", desc: "Você nos conta sua ideia, necessidades e visão em detalhes." },
              { step: "2", title: "Curadoria IA", desc: "Nossa tecnologia processa e cria a base da letra e melodia." },
              { step: "3", title: "Refinamento", desc: "Especialistas ajustam cada detalhe para perfeição." },
              { step: "4", title: "Entrega", desc: "Receba sua música pronta para emocionar ou vender." },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-lg">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider Line */}
      <div className="px-4">
        <div className="container mx-auto border-t border-slate-200"></div>
      </div>

      {/* Tipos de Música Section */}
      <section id="tipos" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-16">Para Quem?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShoppingBag, title: "Comercial", desc: "Jingles que vendem, marcas que ficam na memória." },
              { icon: Megaphone, title: "Político", desc: "Mensagens que mobilizam e inspiram." },
              { icon: Heart, title: "Casamento", desc: "Momentos eternizados em melodia e emoção." },
            ].map((item, idx) => (
              <Card key={idx} className="p-8 border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-purple-100 rounded-full">
                    <item.icon className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">{item.title}</h3>
                <p className="text-slate-600 text-center">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Divider Line */}
      <div className="px-4">
        <div className="container mx-auto border-t border-slate-200"></div>
      </div>

      {/* Formulário Section */}
      <section id="formulario" className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold text-center mb-4">Vamos Criar Sua Música?</h2>
          <p className="text-center text-slate-600 mb-12">
            Preencha o formulário abaixo e nossa equipe entrará em contato via WhatsApp para detalhar tudo.
          </p>

          <Card className="p-8 border-slate-200">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input 
                    id="name"
                    name="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa / Projeto</Label>
                <Input 
                  id="company"
                  name="company"
                  placeholder="Nome da empresa ou projeto"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Música *</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comercial">Jingle Comercial</SelectItem>
                    <SelectItem value="politico">Jingle Político</SelectItem>
                    <SelectItem value="casamento">Música para Casamento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Estilo Musical Preferido</Label>
                <Select value={formData.style} onValueChange={(value) => handleSelectChange("style", value)}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Selecione um estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="sertanejo">Sertanejo</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="mpb">MPB</SelectItem>
                    <SelectItem value="funk">Funk</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Palavras-chave ou Frases Obrigatórias</Label>
                <Input 
                  id="keywords"
                  name="keywords"
                  placeholder="Ex: VERSONORA, inovação, criatividade"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  className="border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Conte-nos Sobre Sua Ideia *</Label>
                <Textarea 
                  id="message"
                  name="message"
                  placeholder="Descreva sua ideia, mensagem principal e qualquer detalhe importante..."
                  value={formData.message}
                  onChange={handleInputChange}
                  className="border-slate-300 min-h-32"
                />
              </div>

              <Button 
                type="button"
                onClick={handleWhatsAppClick}
                disabled={!formData.name || !formData.email || !formData.type || !formData.message}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar via WhatsApp
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5" />
                VERSONORA
              </h3>
              <p className="text-slate-400 text-sm">
                Transformando histórias em melodias com IA e curadoria humana.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#tipos" className="hover:text-white transition-colors">Tipos</a></li>
                <li><a href="#formulario" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <a 
                href="https://wa.me/5527998989899" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                +55 27 99898-9899
              </a>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2026 VERSONORA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/5527998989899" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-40"
        title="Fale conosco no WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}
