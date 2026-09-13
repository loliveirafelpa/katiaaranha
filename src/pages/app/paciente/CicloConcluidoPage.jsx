import { colors } from '../../../theme'

export default function CicloConcluidoPage() {
  return (
    <div className="max-w-lg mx-auto rounded-2xl p-6 text-center" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
      <h1 className="text-lg font-semibold mb-2" style={{ color: colors.secondary }}>
        Diário concluído
      </h1>
      <p style={{ color: colors.textSecondary }}>
        Você concluiu o período de registro do seu diário miccional. Obrigada pelo seu cuidado e
        dedicação! A Dra. Kátia já tem acesso aos seus dados para a próxima consulta.
      </p>
    </div>
  )
}
