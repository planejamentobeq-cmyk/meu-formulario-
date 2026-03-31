export default function Admin() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">📊 Painel Admin</h1>
        <p className="text-gray-500 mb-6">Baixe todas as respostas em formato Excel/CSV</p>
        
          href="/api/export"
          className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
        >
          ⬇️ Baixar Planilha (.csv)
        </a>
      </div>
    </main>
  )
}
