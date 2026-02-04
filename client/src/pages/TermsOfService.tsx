import Header from "@/components/Header";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Header showNav={false} />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-3xl prose prose-slate">
          <h1 className="text-4xl font-bold mb-8">Termos de Serviço</h1>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Termos</h2>
          <p className="text-slate-600 mb-4">
            Ao acessar ao site VERSONORA, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Uso de Licença</h2>
          <p className="text-slate-600 mb-4">
            É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site VERSONORA, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4">
            <li>modificar ou copiar os materiais; </li>
            <li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial); </li>
            <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site VERSONORA; </li>
            <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou </li>
            <li>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</li>
          </ul>
          <p className="text-slate-600 mb-4">
            Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida pelo VERSONORA a qualquer momento. Ao encerrar a visualização desses materiais ou após o término desta licença, deve apagar todos os materiais baixados em sua posse, seja em formato eletrônico ou impresso.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Isenção de responsabilidade</h2>
          <p className="text-slate-600 mb-4">
            Os materiais no site do VERSONORA são fornecidos 'como estão'. VERSONORA não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
          </p>
          <p className="text-slate-600 mb-4">
            Além disso, o VERSONORA não garante ou faz qualquer representação relativa à precisão, aos resultados prováveis ​​ou à confiabilidade do uso dos materiais em seu site ou de outra forma relacionado a esses materiais ou em sites vinculados a este site.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Limitações</h2>
          <p className="text-slate-600 mb-4">
            Em nenhum caso o VERSONORA ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em VERSONORA, mesmo que VERSONORA ou um representante autorizado do VERSONORA tenha sido notificado oralmente ou por escrito da possibilidade de tais danos. Como algumas jurisdições não permitem limitações em garantias implícitas, ou limitações de responsabilidade por danos consequentes ou incidentais, essas limitações podem não se aplicar a você.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Precisão dos materiais</h2>
          <p className="text-slate-600 mb-4">
            Os materiais exibidos no site do VERSONORA podem incluir erros técnicos, tipográficos ou fotográficos. VERSONORA não garante que qualquer material em seu site seja preciso, completo ou atual. VERSONORA pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio. No entanto, VERSONORA não se compromete a atualizar os materiais.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Links</h2>
          <p className="text-slate-600 mb-4">
            O VERSONORA não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso pelo VERSONORA do site. O uso de qualquer site vinculado é por conta e risco do usuário.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Modificações</h3>
          <p className="text-slate-600 mb-4">
            O VERSONORA pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Lei aplicável</h3>
          <p className="text-slate-600 mb-4">
            Estes termos e condições são regidos e interpretados de acordo com as leis do Brasil e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
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
