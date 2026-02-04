import { Music } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-slate-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Music className="w-6 h-6 text-purple-600" />
            <span className="text-xl font-bold text-slate-900">VERSONORA</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">Voltar para Home</Button>
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-3xl prose prose-slate">
          <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

          <p className="text-slate-600 mb-6">
            A sua privacidade é importante para nós. É política do VERSONORA respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site VERSONORA, e outros sites que possuímos e operamos.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Coleta de Informações</h2>
          <p className="text-slate-600 mb-4">
            Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Uso das Informações</h2>
          <p className="text-slate-600 mb-4">
            Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, os protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Compartilhamento de Dados</h2>
          <p className="text-slate-600 mb-4">
            Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Links para Terceiros</h2>
          <p className="text-slate-600 mb-4">
            O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Compromisso do Usuário</h2>
          <p className="text-slate-600 mb-4">
            O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o VERSONORA oferece no site e com caráter enunciativo, mas não limitativo:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4">
            <li>Não se envolver em atividades que sejam ilegais ou contrárias à boa fé e à ordem pública;</li>
            <li>Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, ou sobre cassinos, casas de apostas, jogos de sorte e azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</li>
            <li>Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do VERSONORA, de seus fornecedores ou terceiros.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Mais informações</h2>
          <p className="text-slate-600 mb-4">
            Esperemos que esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.
          </p>
          <p className="text-slate-600 mb-4">
            Esta política é efetiva a partir de Janeiro/2025.
          </p>
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center text-sm text-slate-400">
          <p>&copy; 2025 VERSONORA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
