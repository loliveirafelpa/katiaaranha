import { colors } from '../theme'

export default function ModalConfirmacaoExclusao({ aberto, titulo, mensagem, onConfirmar, onCancelar, confirmando }) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 z-50" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: colors.surface }}>
        <h2 className="font-semibold mb-2" style={{ color: colors.secondary }}>{titulo}</h2>
        <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>{mensagem}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancelar} className="px-4 py-2 rounded-lg text-sm" style={{ color: colors.textSecondary }}>
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={confirmando}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            style={{ background: colors.danger }}
          >
            {confirmando ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
