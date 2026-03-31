'use client'
import { useState } from 'react'

type Item = { codigo: string; descricao: string; qtd_necessaria: number; qtd_separada: string }

export default function Formulario() {
  const [nome, setNome] = useState('')
  const [operacao, setOperacao] = useState('')
  const [itens, setItens] = useState<Item[]>([])
  const [carregando, setCarregando] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const lines = text.trim().split('\n').slice(1)
      const parsed = lines.map(line => {
        const cols = line.split(';')
        return {
          codigo: cols[0]?.trim() || '',
          descricao: cols[1]?.trim() || '',
          qtd_necessaria: Number(cols[2]?.trim()) || 0,
          qtd_separada: ''
        }
      })
      setItens(parsed)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const atualizar = (index: number, valor: string) => {
    setItens(prev => prev.map((item, i) => i === index ? { ...item, qtd_separada: valor } : item))
  }

  const baixarCSV = (nomeResp: string, op: string, dados: Item[]) => {
    const rows = [
      'Código;Descrição;Qtd. Necessária;Qtd. Separada',
      ...dados.map(item => `${item.codigo};${item.descricao};${item.qtd_necessaria};${item.qtd_separada}`)
    ]
    const csv = '\uFEFF' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `separacao_${op}_${nomeResp}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const enviar = async () => {
    if (!nome.trim()) return alert('Informe o nome do responsável')
    if (!operacao.trim()) return alert('Informe a operação')
    if (itens.length === 0) return alert('Carregue a planilha primeiro')
    setCarregando(true)
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_responsavel: nome, operacao, itens }),
    })
    setCarregando(false)
    if (res.ok) {
      baixarCSV(nome, operacao, itens)
      alert('Enviado com sucesso! A planilha foi baixada.')
      setNome('')
      setOperacao('')
      setItens([])
    } else {
      alert('Erro ao enviar. Tente novamente.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Separação de Materiais</h1>
          <p className="text-gray-500 text-sm">Carregue a planilha e preencha as quantidades separadas.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operação</label>
            <input type="text" value={operacao} onChange={e => setOperacao(e.target.value)} placeholder="Ex: OP-001" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planilha (.csv)</label>
            <input type="file" accept=".csv" onChange={handleFile} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
          </div>
        </div>

        {itens.length > 0 && (
          <div className="bg-white rounded-2xl shadow overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="text-left px-4 py-3">Código</th>
                  <th className="text-left px-4 py-3">Descrição</th>
                  <th className="text-center px-4 py-3">Qtd. Necessária</th>
                  <th className="text-center px-4 py-3">Qtd. Separada</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-700">{item.codigo}</td>
                    <td className="px-4 py-3 text-gray-700">{item.descricao}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.qtd_necessaria}</td>
                    <td className="px-4 py-3">
                      <input type="number" min={0} value={item.qtd_separada} onChange={e => atualizar(i, e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={enviar} disabled={carregando} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50">
          {carregando ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </main>
  )
}
