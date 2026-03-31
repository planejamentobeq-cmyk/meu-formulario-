import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nome_responsavel, operacao, itens } = body

  const { error } = await supabase
    .from('respostas')
    .insert([{ nome_responsavel, operacao, itens }])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
