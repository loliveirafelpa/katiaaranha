import { useOutletContext } from 'react-router-dom'
import CabecalhoPagina from '../../../components/CabecalhoPagina'
import TrocarSenhaCard from '../../../components/TrocarSenhaCard'

// Conta da admin: so a troca de senha. A tela "Meus dados" e do paciente (consentimento,
// exclusao da conta) e nao faz sentido aqui.
export default function MinhaContaPage() {
  const { perfil } = useOutletContext()
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <CabecalhoPagina titulo="Minha conta" subtitulo={perfil?.nomeCompleto} />
      <TrocarSenhaCard dica="Se você ainda está usando a senha provisória, troque por uma só sua." />
    </div>
  )
}
