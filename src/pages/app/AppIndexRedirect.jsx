import { Navigate, useOutletContext } from 'react-router-dom'

export default function AppIndexRedirect() {
  const { perfil } = useOutletContext()

  if (perfil.role === 'admin') {
    return <Navigate to="/app/admin/pacientes" replace />
  }
  return <Navigate to="/app/diario" replace />
}
