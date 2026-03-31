import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('respostas')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows: string[] = [
    'Data;Responsável;Item;Quantidade Necessária;Quantidade Disponível'
  ]

  for (const resposta of data) {
    for (const item of resposta.itens) {
      rows.push(
        `${new Date(resposta.criado_em).toLocaleString('pt-BR')};${resposta.nome_responsavel};${item.nome};${item.qtd_necessaria};${item.qtd_disponivel}`
      )
    }
  }

  const csv = rows.join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="respostas.csv"',
    },
  })
}
