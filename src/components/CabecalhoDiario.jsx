import { colors, fonts } from '../theme'

// Mensagens curtas e sobrias pro topo do diario do paciente. Trocam a cada dia do ciclo
// (sempre a mesma no mesmo dia, pra nao mudar a cada vez que a pagina recarrega).
const MENSAGENS = [
  'Cada registro ajuda a Dra. Kátia a entender melhor a sua rotina.',
  'O importante é a constância, não a perfeição.',
  'Não precisa mudar seus hábitos: o diário serve para mostrar como eles são de verdade.',
  'Esqueceu de anotar algo? Dá para registrar depois, com o horário em que aconteceu.',
  'Seus registros de hoje já fazem parte do seu acompanhamento.',
  'Pequenos registros, ao longo dos dias, mostram muito sobre a sua evolução.',
  'Obrigada por manter o diário em dia. Isso faz diferença no seu tratamento.',
]

function primeiroNome(nomeCompleto) {
  return (nomeCompleto || '').trim().split(/\s+/)[0] || ''
}

// Saudacao em Poppins, a fonte de titulos da CPA - combina com o logo e o resto da tela.
export default function CabecalhoDiario({ nomeCompleto, numeroCiclo, diaAtual }) {
  const nome = primeiroNome(nomeCompleto)
  const mensagem = MENSAGENS[(Math.max(1, diaAtual) - 1) % MENSAGENS.length]
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-wider" style={{ color: colors.accent }}>
        <span>{hoje}</span>
        {numeroCiclo > 0 && (
          <>
            <span aria-hidden="true" className="w-1 h-1 rounded-full" style={{ background: colors.primaryLight }} />
            <span>Ciclo {numeroCiclo}</span>
          </>
        )}
      </div>
      <h1
        className="mt-1 text-3xl sm:text-4xl leading-tight tracking-tight"
        style={{ fontFamily: fonts.heading, fontWeight: 600, color: colors.secondary }}
      >
        {nome ? `Olá, ${nome}` : 'Olá'}
      </h1>
      <p className="mt-1 text-sm max-w-md" style={{ color: colors.textSecondary }}>{mensagem}</p>
    </div>
  )
}
