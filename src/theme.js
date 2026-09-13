// Paleta e tipografia do projeto. Nunca usar hex direto em componentes - sempre importar daqui.
//
// Paleta alinhada com a identidade visual da CPA Fisioterapia (cpafisio.com.br): tudo em
// laranja e subtons de laranja, do mais claro (fundos) ao mais escuro (títulos/destaques),
// sem cor "secundária" de outra família (nada de azul/roxo).
//
// Excecao deliberada: success/warning/danger continuam verde/amarelo/vermelho porque
// codificam severidade clinica (leve/moderada/intensa) nos graficos do admin - reduzir isso
// a tons de laranja tornaria os graficos de urgencia/perda ilegiveis a distancia.
export const colors = {
  primary: '#E8752C',       // laranja principal da marca (botões, links, logo)
  primaryLight: '#F0A868',  // laranja claro (fundos de destaque, hover suave, degradê do lótus)
  secondary: '#9C3D14',     // terracota escuro - usado onde antes era o roxo-marinho (títulos, fundos sólidos)
  secondaryLight: '#B8551E',
  accent: '#C2571F',        // laranja de apoio, um pouco mais escuro que o primary - divisores, ênfase
  background: '#FBF1E4',    // bege claro com base laranja (mesmo recurso do site de referência)
  surface: '#FFFFFF',
  text: '#3A2A1E',          // marrom quase-preto com base quente, para texto de corpo
  textSecondary: '#8A6B52', // marrom-alaranjado suave, texto secundário
  border: '#F0DCC2',        // borda em laranja bem claro
  success: '#4C8B6B',       // severidade clínica "leve" (ver nota acima)
  warning: '#D9A441',       // severidade clínica "moderada"
  danger: '#B5483F',        // severidade clínica "intensa" / ações destrutivas
}

// Poppins (arredondada, geométrica) para títulos e Cormorant Garamond como toque elegante
// pontual - mesma dupla de fontes usada pela CPA Fisioterapia. Inter no corpo do texto.
// Carregadas via Google Fonts em index.css.
export const fonts = {
  heading: "'Poppins', system-ui, sans-serif",
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
}
