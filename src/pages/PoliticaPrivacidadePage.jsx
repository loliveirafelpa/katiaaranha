import { colors } from '../theme'

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen px-6 py-10" style={{ background: colors.background, color: colors.text }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: colors.secondary }}>
          Política de Privacidade — Diário Miccional
        </h1>

        <section className="mb-6">
          <h2 className="font-semibold mb-1">Quais dados coletamos</h2>
          <p style={{ color: colors.textSecondary }}>
            Dados de identificação (nome, contato) e dados de saúde relacionados aos seus hábitos
            urinários (horários, líquidos ingeridos, volume urinado, episódios de urgência e de
            perda involuntária de urina, e observações como uso de absorvente, ciclo menstrual e
            medicamentos). Dado de saúde é considerado dado pessoal sensível pela LGPD (art. 5º, II).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold mb-1">Finalidade</h2>
          <p style={{ color: colors.textSecondary }}>
            Exclusivamente para acompanhamento e avaliação fisioterapêutica do assoalho pélvico
            pela Dra. Kátia Aranha.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold mb-1">Quem acessa</h2>
          <p style={{ color: colors.textSecondary }}>
            Você mesma(o) e a profissional responsável pelo seu tratamento. Seus dados estão
            protegidos por controle de acesso técnico (Row Level Security) e sigilo profissional.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold mb-1">Base legal e retenção</h2>
          <p style={{ color: colors.textSecondary }}>
            O tratamento se baseia no seu consentimento específico (LGPD art. 7º, I e art. 11). O
            prazo de retenção dos dados clínicos segue a política definida pela profissional
            responsável, respeitando obrigações legais de guarda de prontuário.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold mb-1">Seus direitos</h2>
          <p style={{ color: colors.textSecondary }}>
            Você pode, a qualquer momento, ver, corrigir, exportar ou solicitar a exclusão dos
            seus dados, e revogar seu consentimento, pela tela "Meus Dados" dentro do sistema.
          </p>
        </section>
      </div>
    </div>
  )
}
