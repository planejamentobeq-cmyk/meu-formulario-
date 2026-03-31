import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nome_responsavel, operacao, itens, data_inicio, data_fim, duracao } = body

  const { error } = await supabase
    .from('respostas')
    .insert([{ nome_responsavel, operacao, itens, data_inicio, data_fim, duracao }])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = [
    `Responsável:;${nome_responsavel}`,
    `Operação:;${operacao}`,
    `Início:;${data_inicio}`,
    `Fim:;${data_fim}`,
    `Duração:;${duracao}`,
    '',
    'Código;Descrição;Qtd. Necessária;Qtd. Separada;Plaquetas',
    ...itens.map((item: { codigo: string; descricao: string; qtd_necessaria: number; qtd_separada: string; plaquetas: string[] }) =>
      `${item.codigo};${item.descricao};${item.qtd_necessaria};${item.qtd_separada};${item.plaquetas.join(', ')}`
    )
  ]
  const csv = '\uFEFF' + rows.join('\n')
  const base64 = Buffer.from(csv).toString('base64')

  await resend.emails.send({
    from: 'Separação <onboarding@resend.dev>',
    to: ['raissa.carvalho@beq.com.br'],
    subject: `Separação finalizada - ${operacao} - ${nome_responsavel}`,
    html: `
      <h2>Separação de Materiais Finalizada</h2>
      <p><strong>Responsável:</strong> ${nome_responsavel}</p>
      <p><strong>Operação:</strong> ${operacao}</p>
      <p><strong>Início:</strong> ${data_inicio}</p>
      <p><strong>Fim:</strong> ${data_fim}</p>
      <p><strong>Duração:</strong> ${duracao}</p>
      <p>A planilha completa está em anexo.</p>
    `,
    attachments: [
      {
        filename: `separacao_${operacao}_${nome_responsavel}.csv`,
        content: base64,
      }
    ]
  })

  return NextResponse.json({ ok: true })
}
