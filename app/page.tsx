'use client'
import { useState } from 'react'

const ITENS = [
  'CONE DE SINALIZACAO FLEXIVEL 75CM 02 FAIXAS REFLETIVAS',
  'CORDA DE SEDA TRANCADA BRANCA 12MM PET',
  'MANTA DE BORRACHA ISOLANTE CLASSE 0 TIPO I/II CO 914X250MM',
  'FITA IMANTADA DE CONE P/ ROTA DE FUGA',
  'CAPA DE CONE P/ ROTA DE FUGA',
  'LAMINA DE SERRA STARRETT BI-METAL UNIQUE BS1218 300MM',
  'FITA DE SINALIZAÇÃO',
  'KIT EPI - BOLSA DE NYLON AZUL REF SA-200 GRANDE',
  'MANGA DE BORRACHA CLASSE 2 TIPO II 20KV TAM. M AMARELA/LARANJA',
  'LANTERNA P/ CAPACETE 04 LEDS RECARREGAVEL C/ SUPORTE DE CABECA - FENIX NTK',
  'BALACLAVA RETARDANTE RISCO 2 C/ 03 ORIFICOS 02 VISAO 01 NASAL BEGE',
]

type Item = { nome: string; qtd_necessaria: string; qtd_disponivel: string }

export default function Formulario() {
  const [nome, setNome] = useState('')
  const [itens, setItens] = useState<Item[]>(
    ITENS.map(nome => ({ nome, qtd_necessaria: '', qtd_disponivel: '' }))
  )
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const atualizar = (index: number, campo: keyof Item, valor: string) => {
    setItens(prev => prev.map((item, i) => i === index ? { ...item, [campo]: valor } : item))
  }

  const enviar = async () => {
    if (!nome.trim()) return alert('Informe o nome do responsável')
    setCarregando(true)
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_responsavel: nome, itens }),
    })
    setCarregando(false)
    if (res.ok) setEnviado(true)
    else alert('Erro ao enviar. Tente novamente.')
  }

  if (enviado) return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-600">Enviado com sucesso!</h2>
        <p className="text-gray-500 mt-2">Obrigado, {nome}!</p>
        <button onClick={() => { setEnviado(false); setNome('') }} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg">
          Novo envio
        </button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">📦 Separação de Materiais</h1>
          <p className="text-gray-500 text-sm">Preencha as quantidades necessárias e disponíveis para cada item.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Seu nome completo"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="text-left px-4 py-3 w-1/2">Item</th>
                <th className="text-center px-4 py-3">Qtd. Necessária</th>
                <th className="text-center px-4 py-3">Qtd. Disponível</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-gray-700">{item.nome}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={item.qtd_necessaria}
                      onChange={e => atualizar(i, 'qtd_necessaria', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={item.qtd_disponivel}
                      onChange={e => atualizar(i, 'qtd_disponivel', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={enviar}
          disabled={carregando}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          {carregando ? 'Enviando...' : '✅ Enviar'}
        </button>
      </div>
    </main>
  )
}
