import React from "react";
import ReactMarkdown from "react-markdown";

const CONTENT = `
## Diretrizes oficiais 2026 (Relatorio TikTok)

### 1) Direcao central do relatorio (tema e como agir em 2026)
- **Tema em alta para 2026: Instinto Unico**
- Sair da vida passiva e ir para a criacao ativa: em 2026, as audiencias se afastam do piloto automatico e retomam o instinto unico com curiosidade genuina, conviccao e cuidado.
- Compromisso com a realidade: com a fantasia perdendo forca, as pessoas vao questionar padroes e cocriar novas formas de viver juntas.
- IA amplia, humanos direcionam: a tecnologia nao substitui pessoas — ela amplia o potencial criativo. A direcao vem do instinto humano.
- **O que a tecnologia nao substitui:** conexao, curiosidade e presenca (mesmo quando tudo fica um pouco baguncado).

### 2) Como o TikTok enxerga tendencias (metodo do relatorio)
**Velocidades da cultura (TikTok)**
- **Momentos de tendencias (curto prazo):** estimulos criativos que ganham tracao rapidamente pela alta participacao.
- **Indicadores de tendencias (ponte):** interesses e comportamentos emergentes revelados por novos padroes de conteudo.
- **Forcas de tendencias (longo prazo):** transformacoes duradouras e em larga escala.

**Diretriz pratica:** profissionais precisam de ferramentas para acompanhar tendencias em tempo real, porque elas aparecem e evoluem muito rapido.

### 3) Diretrizes de trabalho com dados + IA
**Como avancar mais rapido com as solucoes do TikTok**
- Identificar padroes em muitos videos, pesquisas, comentarios e comunidades.
- Transformar dados em tendencias com insights humanos (o significado vem de entender o que a comunidade sente).

**Ferramentas citadas e como usar**
- **Insights Spotlight / TikTok Market Scope:** testar e validar hipoteses com dados em tempo real.
- **Content Suite:** explorar conteudo pago e organico de alta performance e investigar mencoes organicas da marca.
- **Symphony Creative Studio:** desenvolver ideias criativas e adaptar mensagens em diferentes formatos, evitando fadiga do criativo.
- **TikTok Market Scope:** conectar reconhecimento → conversao com insights acionaveis em tempo real.

### 4) As 3 tendencias do relatorio (o que fazer em cada uma)

#### Tendencia 1 — Cha de realidade
**Definicao:** a fantasia perde forca; audiencias se realinham no caos e criam novas realidades juntas.

**Diretrizes para marcas**
- Humanizar marca = ouvir, aprender e compartilhar historias reais, sem filtros.
- Adaptar criativo ao contexto cultural (idioma + estetica) conforme a tendencia evolui.

**Primeiros passos**
- Va onde conversas reais acontecem.
- Use Insights Spotlight e TikTok Market Scope para rastrear sentimentos em tempo real.
- Escute primeiro, depois crie conteudo com empatia e inteligencia.

**Dica profissional (rotina)**
- Verificar rotineiramente os insights do segmento no Market Scope: palavras-chave, hashtags, criadores e pesquisas.

**Sabores (subdirecoes)**
- **Forcados a se concentrar:** pessoas se unem com dicas para driblar rotinas apertadas.
- **Cultura pra mim (third culture):** identidade vai alem da demografia; e interseccionalidade.
- **Comente e reaja em grupo:** comentarios com imagem viram cultura.
- **Segunda conta encontrada:** mostrar facetas diferentes e quebrar moldes.

#### Tendencia 2 — Fora do script
**Definicao:** a curiosidade vira moeda; audiencias chegam com intencao e saem com curiosidade, fazendo descobertas fora da rota.

**Diretrizes para marcas**
- Presenca fora da categoria principal: aparecer de forma significativa em espacos adjacentes, nichos e momentos culturais alinhados a identidade da marca.

**Primeiros passos**
- Use Content Suite para investigar mencoes organicas e linguagem real da comunidade.
- Conecte-se com criadores para transformar conteudo autentico em campanhas pagas.

**Dica profissional**
- Use Content Suite como fonte de pesquisa: ele mostra muito mais resultados que a busca manual.

**Diretriz de descoberta (mapear jornadas)**
1) Comece pelo Market Scope (pesquisas principais).
2) Identifique um termo lider.
3) Expanda com termos relacionados (motivacoes + jornada).
4) Estruture o contexto: o que, por que e como as pessoas exploram.

#### Tendencia 3 — ROI emocional
**Definicao:** impulso perde para intencao; compradores recompensam marcas que justificam por que comprar.

**Diretrizes para marcas**
- Nao parecer que esta forçando a venda.
- Consumidores redefinem essencial pelo significado, alegria e pertencimento.
- Ancorar o produto na identidade, na comunidade e em momentos que trazem alegria.

**Primeiros passos (variacoes rapidas)**
- Use Symphony Creative Studio para adaptar um asset para varios idiomas, formatos e estilos.

**Testes sugeridos**
- Se a audiencia estiver estressada, testar: ganchos visuais estilo ASMR, cenas de cozy games e diferentes narracoes.

**Componentes do ROI emocional**
- **Base organica:** definir a comunidade e aparecer com consistencia entregando valor real.
- **Entender audiencia:** usar ferramentas e programas para descobrir quem sao seguidores e o que importa.
- **Parcerias seletivas:** fechar parcerias que realmente encaixam no estilo de vida e comunidade.

**Formula do relatorio**
- **Por que comprar = 2(E²) + F**
- E² = Expansao da base
- E² = Evidencie a economia
- F = Formadores de opiniao

### 5) Treinando seu instinto unico (pag. 15)
- **Cha de realidade:** entender nuances das novas realidades da audiencia para refletir como elas se sentem.
- **Fora do script:** mapear caminhos inesperados que levam a descoberta da marca.
- **ROI emocional:** provar valor real alem do preco — por significado, comprovacao e formadores.

### 6) Fluxo pratico (do insight a estrategia)
1) **Insight:** identificar hashtags em alta no TikTok Market Scope.
2) **Exploracao:** pesquisar videos que mencionam sua marca no Content Suite.
3) **Estrategia:** gerar conceito de video com Symphony Creative Studio e explorar inspiracoes.
`;

const ReportGuidelines: React.FC = () => {
  return (
    <section className="p-6 md:p-8 bg-white border-b border-black">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Relatorio oficial
          </p>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            Diretrizes praticas 2026
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-gray-400">Base prioritaria</span>
      </div>

      <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:uppercase prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-strong:text-black">
        <ReactMarkdown>{CONTENT}</ReactMarkdown>
      </div>
    </section>
  );
};

export default ReportGuidelines;
