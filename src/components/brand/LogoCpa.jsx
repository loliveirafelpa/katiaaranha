import logoCpa from '../../assets/logo-cpa.png'

// Logo oficial da CPA Fisioterapia (baixado de cpafisio.com.br), usado tal como e -
// nao e mais um lotus desenhado a mao, e sim a marca real da clinica.
export default function LogoCpa({ height = 32, className = '' }) {
  return (
    <img
      src={logoCpa}
      alt="CPA Fisioterapia"
      className={className}
      style={{ height, width: 'auto' }}
    />
  )
}
