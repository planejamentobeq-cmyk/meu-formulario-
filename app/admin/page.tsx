'use client'

export default function Admin() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'white',borderRadius:'16px',padding:'40px',textAlign:'center'}}>
        <h1>Painel Admin</h1>
        <p>Baixe todas as respostas em formato Excel/CSV</p>
        <a href="/api/export">Baixar Planilha (.csv)</a>
      </div>
    </div>
  )
}
