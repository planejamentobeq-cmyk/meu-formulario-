'use client'
import { useState, useEffect, useRef } from 'react'

type Item = {
  codigo: string
  descricao: string
  qtd_necessaria: number
  qtd_separada: string
  plaquetas: string[]
  armazem: string
}

const STORAGE_KEY = 'separacao_dados'

export default function Formulario() {
  const [nome, setNome] = useState('')
  const [operacao, setOperacao] = useState('')
  const [itens, setItens] = useState<Item[]>([])
  const [carregando, setCarregando] = useState(false)
  const [dataInicio, setDataInicio] = useState('')
  const [tempoDecorrido, setTempoDecorrido] = useState(0)
  const intervaloRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY)
    if (salvo) {
      const dados = JSON.parse(salvo)
      setNome(dados.nome || '')
      setOperacao(dados.operacao || '')
      setItens(dados.itens || [])
      setDataInicio(dados.dataInicio || '')
      setTempoDecorrido(dados.tempoDecorrido || 0)
      if (dados.dataInicio) {
        intervaloRef.current = setInterval(() => {
          setTempoDecorrido(prev => prev + 1)
        }, 1000)
      }
    }
  }, [])

  useEffect(() => {
    if (itens.length > 0 || nome || operacao) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nome, operacao, itens, dataInicio, tempoDecorrido }))
    }
  }, [nome, operacao, itens, dataInicio, tempoDecorrido])

  const iniciarCronometro = () => {
    const inicio = new Date().toLocaleString('pt-BR')
    setDataInicio(inicio)
    setTempoDecorrido(0)
    if (intervaloRef.current) clearInterval(intervaloRef.current)
    intervaloRef.current = setInterval(() => {
      setTempoDecorrido(prev => prev + 1)
    }, 1000)
  }

  const pararCronometro = () => {
    if (intervaloRef.current) clearInterval(intervaloRef.current)
  }

  const formatarTempo = (segundos: number) => {
    const h = Math.floor(segundos / 3600).toString().padStart(2, '0')
    const m = Math.floor((segundos % 3600) / 60).toString().padStart(2, '0')
    const s = (segundos % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

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
          qtd_separada: '',
          plaquetas: [],
          armazem: ''
        }
      })
      setItens(parsed)
      iniciarCronometro()
    }
    reader.readAsText(file, 'UTF-8')
  }

  const atualizarQtd = (index: number, valor: string) => {
    setItens(prev => prev.map((item, i) => i === index ? { ...item, qtd_separada: valor } : item))
  }

  const atualizarArmazem = (index: number, valor: string) => {
    setItens(prev => prev.map((item, i) => i === index ? { ...item, armazem: valor } : item))
  }

  const adicionarPlaqueta = (index: number) => {
    setItens(prev => prev.map((item, i) => i === index ? { ...item, plaquetas: [...item.plaquetas, ''] } : item))
  }

  const atualizarPlaqueta = (itemIndex: number, plaquetaIndex: number, valor: string) => {
    setItens(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item
      const novas = [...item.plaquetas]
      novas[plaquetaIndex] = valor
      return { ...item, plaquetas: novas }
    }))
  }

  const removerPlaqueta = (itemIndex: number, plaquetaIndex: number) => {
    setItens(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item
      return { ...item, plaquetas: item.plaquetas.filter((_, pi) => pi !== plaquetaIndex) }
    }))
  }

  const baixarCSV = (nomeResp: string, op: string, dados: Item[], inicio: string, fim: string, duracao: string) => {
    const rows = [
      `Responsável:;${nomeResp}`,
      `Operação:;${op}`,
      `Início:;${inicio}`,
      `Fim:;${fim}`,
      `Duração:;${duracao}`,
      '',
      'Código;Descrição;Qtd. Necessária;Qtd. Separada;Armazém;Plaquetas',
      ...dados.map(item => `${item.codigo};${item.descricao};${item.qtd_necessaria};${item.qtd_separada};${item.armazem};${item.plaquetas.join(', ')}`)
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

  const limpar = () => {
    localStorage.removeItem(STORAGE_KEY)
    setNome('')
    setOperacao('')
    setItens([])
    setDataInicio('')
    setTempoDecorrido(0)
    pararCronometro()
  }

  const enviar = async () => {
    if (!nome.trim()) return alert('Informe o nome do responsável')
    if (!operacao.trim()) return alert('Informe a operação')
    if (itens.length === 0) return alert('Carregue a planilha primeiro')
    pararCronometro()
    const dataFim = new Date().toLocaleString('pt-BR')
    const duracao = formatarTempo(tempoDecorrido)
    setCarregando(true)
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_responsavel: nome, operacao, itens, data_inicio: dataInicio, data_fim: dataFim, duracao }),
    })
    setCarregando(false)
    if (res.ok) {
      baixarCSV(nome, operacao, itens, dataInicio, dataFim, duracao)
      alert('Enviado com sucesso! A planilha foi baixada.')
      limpar()
    } else {
      alert('Erro ao enviar. Tente novamente.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Separação de Materiais</h1>
            <p className="text-gray-500 text-sm">Carregue a planilha e preencha as quantidades separadas.</p>
          </div>
          <div className="flex items-center gap-4">
            {dataInicio && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Início: {dataInicio}</p>
                <p className="text-2xl font-mono font-bold text-blue-600">{formatarTempo(tempoDecorrido)}</p>
              </div>
            )}
            {itens.length > 0 && (
              <button onClick={limpar} className="text-sm text-red-500 hover:text-red-700 border border-red-300 rounded-lg px-3 py-1 hover:bg-red-50 transition">
                Limpar tudo
              </button>
            )}
          </div>
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
                  <th className="text-center px-4 py-3">Armazém</th>
                  <th className="text-center px-4 py-3">Plaquetas</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-700 align-top">{item.codigo}</td>
                    <td className="px-4 py-3 text-gray-700 align-top">{item.descricao}</td>
                    <td className="px-4 py-3 text-center text-gray-700 align-top">{item.qtd_necessaria}</td>
                    <td className="px-4 py-3 align-top">
                      <input type="number" min={0} value={item.qtd_separada} onChange={e => atualizarQtd(i, e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input type="text" value={item.armazem} onChange={e => atualizarArmazem(i, e.target.value)} placeholder="Armazém" className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        {item.plaquetas.map((plaqueta, pi) => (
                          <div key={pi} className="flex gap-1">
                            <input type="text" value={plaqueta} onChange={e => atualizarPlaqueta(i, pi, e.target.value)} placeholder="Nº plaqueta" className="w-full border border-gray-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <button onClick={() => removerPlaqueta(i, pi)} className="text-red-400 hover:text-red-600 px-1 font-bold">✕</button>
                          </div>
                        ))}
                        <button onClick={() => adicionarPlaqueta(i)} className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg px-2 py-1 hover:bg-blue-50 transition">
                          + Adicionar plaqueta
                        </button>
                      </div>
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
