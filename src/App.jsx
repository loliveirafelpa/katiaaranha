import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import PoliticaPrivacidadePage from './pages/PoliticaPrivacidadePage'
import NotFoundPage from './pages/NotFoundPage'
import AppShell from './AppShell'
import AppIndexRedirect from './pages/app/AppIndexRedirect'
import ConsentimentoPage from './pages/app/ConsentimentoPage'
import MeusDadosPage from './pages/app/MeusDadosPage'
import DiarioAtualPage from './pages/app/paciente/DiarioAtualPage'
import NovaEntradaPage from './pages/app/paciente/NovaEntradaPage'
import HistoricoDiaPage from './pages/app/paciente/HistoricoDiaPage'
import ObservacoesDiaPage from './pages/app/paciente/ObservacoesDiaPage'
import CicloConcluidoPage from './pages/app/paciente/CicloConcluidoPage'
import PacientesListaPage from './pages/app/admin/PacientesListaPage'
import NovoPacientePage from './pages/app/admin/NovoPacientePage'
import PacienteDetalhePage from './pages/app/admin/PacienteDetalhePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/privacidade" element={<PoliticaPrivacidadePage />} />

      <Route path="/app" element={<AppShell />}>
        <Route index element={<AppIndexRedirect />} />
        <Route path="consentimento" element={<ConsentimentoPage />} />
        <Route path="meus-dados" element={<MeusDadosPage />} />

        <Route path="diario" element={<DiarioAtualPage />} />
        <Route path="diario/nova-entrada" element={<NovaEntradaPage />} />
        <Route path="diario/dia/:diaNumero" element={<HistoricoDiaPage />} />
        <Route path="diario/dia/:diaNumero/observacoes" element={<ObservacoesDiaPage />} />
        <Route path="diario/concluido" element={<CicloConcluidoPage />} />

        <Route path="admin/pacientes" element={<PacientesListaPage />} />
        <Route path="admin/pacientes/novo" element={<NovoPacientePage />} />
        <Route path="admin/pacientes/:id" element={<PacienteDetalhePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
