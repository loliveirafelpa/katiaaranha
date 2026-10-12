import { useCallback, useEffect, useRef, useState } from 'react'
import { atualizarExercicio, criarExercicio, definirExercicioAtivo, listarExercicios } from '../../../lib/exerciciosApi'
import { CATEGORIAS_EXERCICIO, agruparExerciciosPorCategoria } from '../../../data/categoriasExercicio'
import CabecalhoPagina from '../../../components/CabecalhoPagina'
import { colors } from '../../../theme'

const FORM_VAZIO = { nome: '', categoria: 'assoalho_pelvico', categoriaOutro: '', descricao: '', instrucoes: '', seriesPadrao: '', repeticoesPadrao: '' }

export default function ExerciciosCatalogoPage() {
  const [exercicios, setExercicios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [form, setForm] = useState(FORM_VAZIO)
  // null = cadastrando um novo; id = editando esse exercicio no mesmo formulario
  const [editandoId, setEditandoId] = useState(null)
  const formRef = useRef(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [erroCarregar, setErroCarregar] = useState(false)

  const carregar = useCallback(async () => {
    try {
      setExercicios(await listarExercicios({ incluirInativos: true }))
      setErroCarregar(false)
    } catch {
      setErroCarregar(true)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim()) {
      setErro('Informe o nome do exercício.')
      return
    }
    if (form.categoria === 'outro' && !form.categoriaOutro.trim()) {
      setErro('Informe a origem do exercício.')
      return
    }
    setSalvando(true)
    try {
      const salvar = editandoId ? (dados) => atualizarExercicio(editandoId, dados) : criarExercicio
      await salvar({
        ...form,
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        instrucoes: form.instrucoes.trim(),
        seriesPadrao: form.seriesPadrao === '' ? null : Number(form.seriesPadrao),
        repeticoesPadrao: form.repeticoesPadrao.trim(),
      })
      setForm(FORM_VAZIO)
      setEditandoId(null)
      await carregar()
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  function handleEditar(ex) {
    setErro('')
    setEditandoId(ex.id)
    setForm({
      nome: ex.nome || '',
      categoria: ex.categoria,
      categoriaOutro: ex.categoriaOutro || '',
      descricao: ex.descricao || '',
      instrucoes: ex.instrucoes || '',
      seriesPadrao: ex.seriesPadrao ?? '',
      repeticoesPadrao: ex.repeticoesPadrao || '',
    })
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleCancelarEdicao() {
    setEditandoId(null)
    setForm(FORM_VAZIO)
    setErro('')
  }

  async function handleAlternarAtivo(ex) {
    await definirExercicioAtivo(ex.id, !ex.ativo)
    setExercicios((atual) => atual.map((e) => (e.id === ex.id ? { ...e, ativo: !ex.ativo } : e)))
  }

  const campoClasse = 'w-full px-3 py-2 rounded-lg border text-sm'

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Catálogo de exercícios"
        subtitulo={
          <p className="max-w-2xl">
            Estes são os exercícios disponíveis para prescrever na aba "Exercícios/Orientações" da ficha de cada paciente.
            Um exercício desativado sai da lista de prescrição, mas continua aparecendo para quem já o recebeu.
          </p>
        }
      />

      {carregando ? (
        <p style={{ color: colors.textSecondary }}>Carregando...</p>
      ) : erroCarregar ? (
        <p style={{ color: colors.danger }}>Não foi possível carregar o catálogo. Tente novamente em instantes.</p>
      ) : (
        agruparExerciciosPorCategoria(exercicios).map((grupo) => (
          <section key={grupo.chave} className="space-y-2">
            <h2 className="text-sm font-semibold" style={{ color: colors.secondary }}>{grupo.label}</h2>
            <ul className="space-y-2">
              {grupo.itens.map((ex) => (
                <li
                  key={ex.id}
                  className="rounded-xl p-3 flex items-start justify-between gap-3 text-sm"
                  style={{ background: colors.surface, border: `1px solid ${colors.border}`, opacity: ex.ativo ? 1 : 0.55 }}
                >
                  <div>
                    <p className="font-medium">{ex.nome}</p>
                    {ex.descricao && <p className="text-xs" style={{ color: colors.textSecondary }}>{ex.descricao}</p>}
                    {(ex.seriesPadrao || ex.repeticoesPadrao) && (
                      <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                        Padrão: {[ex.seriesPadrao && `${ex.seriesPadrao} séries`, ex.repeticoesPadrao].filter(Boolean).join(' de ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => handleEditar(ex)} className="text-xs underline" style={{ color: colors.primary }}>
                      Editar
                    </button>
                    <button onClick={() => handleAlternarAtivo(ex)} className="text-xs underline" style={{ color: ex.ativo ? colors.danger : colors.primary }}>
                      {ex.ativo ? 'Desativar' : 'Reativar'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-2xl p-4 space-y-3"
        style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
      >
        <h2 className="text-sm font-semibold" style={{ color: colors.secondary }}>
          {editandoId ? 'Editar exercício' : 'Cadastrar novo exercício'}
        </h2>
        {editandoId && (
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            A alteração vale também para os pacientes que já receberam este exercício.
          </p>
        )}
        <input type="text" placeholder="Nome do exercício" value={form.nome} onChange={(e) => alterar('nome', e.target.value)} className={campoClasse} style={{ borderColor: colors.border }} />
        <select value={form.categoria} onChange={(e) => alterar('categoria', e.target.value)} className={campoClasse} style={{ borderColor: colors.border }}>
          {CATEGORIAS_EXERCICIO.map((c) => <option key={c.valor} value={c.valor}>{c.label}</option>)}
        </select>
        {form.categoria === 'outro' && (
          <input
            type="text"
            placeholder="Origem do exercício (ex.: Hipopressivos)"
            value={form.categoriaOutro}
            onChange={(e) => alterar('categoriaOutro', e.target.value)}
            list="origens-exercicio"
            className={campoClasse}
            style={{ borderColor: colors.border }}
          />
        )}
        {/* Sugere as origens ja digitadas, pra nao criar "Hipopressivo" e "Hipopressivos" separados */}
        <datalist id="origens-exercicio">
          {[...new Set(exercicios.filter((ex) => ex.categoria === 'outro').map((ex) => ex.categoriaOutro))].map((o) => <option key={o} value={o} />)}
        </datalist>
        <input type="text" placeholder="Para que serve (frase curta)" value={form.descricao} onChange={(e) => alterar('descricao', e.target.value)} className={campoClasse} style={{ borderColor: colors.border }} />
        <textarea rows={3} placeholder="Como fazer (instruções que a paciente vai ler)" value={form.instrucoes} onChange={(e) => alterar('instrucoes', e.target.value)} className={campoClasse} style={{ borderColor: colors.border }} />
        <div className="grid grid-cols-3 gap-2">
          <input type="number" min="1" placeholder="Séries" value={form.seriesPadrao} onChange={(e) => alterar('seriesPadrao', e.target.value)} className={campoClasse} style={{ borderColor: colors.border }} />
          <input type="text" placeholder="Repetições (ex.: 10 repetições)" value={form.repeticoesPadrao} onChange={(e) => alterar('repeticoesPadrao', e.target.value)} className={`${campoClasse} col-span-2`} style={{ borderColor: colors.border }} />
        </div>
        {erro && <p className="text-sm" style={{ color: colors.danger }}>{erro}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={salvando} className="flex-1 py-2 rounded-lg font-medium text-white disabled:opacity-60" style={{ background: colors.primary }}>
            {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar exercício'}
          </button>
          {editandoId && (
            <button type="button" onClick={handleCancelarEdicao} className="py-2 px-4 text-sm underline" style={{ color: colors.textSecondary }}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
