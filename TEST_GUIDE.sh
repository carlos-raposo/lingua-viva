#!/bin/bash
# MATRIZ NEOLÓGICA V2.6 - GUIA DE TESTE RÁPIDO

echo "🧪 TESTE DE INTEGRAÇÃO - MATRIZ NEOLÓGICA"
echo "=========================================="
echo ""

# Verificar se ficheiros existem
echo "📋 Verificando ficheiros..."
for file in "stream.js" "matriz-engine.js" "matriz.html" "matriz-style.css"
do
    if [ -f "$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ $file NÃO ENCONTRADO"
    fi
done

echo ""
echo "🚀 Servidor HTTP iniciado em http://localhost:8000"
echo "   URL: http://localhost:8000/matriz.html"
echo ""

# Instruções de teste
echo "📝 PASSOS DE TESTE:"
echo ""
echo "1️⃣  CARREGAMENTO INICIAL"
echo "   - Abra http://localhost:8000/matriz.html"
echo "   - Deve ver overlay preto com texto animado (manifesto)"
echo "   - Console deve mostrar: ✅ stream.js carregado"
echo ""

echo "2️⃣  CLIQUE EM 'SINTONIZAR_MATRIZ'"
echo "   - Som deve tocar (beep)"
echo "   - Overlay desaparece"
echo "   - Palavras começam a cair"
echo "   - Console deve mostrar: 🔄 Fetching Google Trends"
echo ""

echo "3️⃣  AGUARDE CARREGAMENTO DE DADOS"
echo "   - 2-3 segundos para buscar Google Trends"
echo "   - Console deve mostrar: ✅ Google Trends: 25 termos carregados"
echo "   - OU: ⚠️  Todos os provedores falharam. Usando fallback"
echo ""

echo "4️⃣  CLIQUE NUMA PALAVRA"
echo "   - Modal deve aparecer com detalhes"
echo "   - Se ORIGEM = 'Google_Pulse_PT' → Dados do Google Trends ✓"
echo "   - Se ORIGEM = 'Global', 'Brasil', etc → mockData (fallback) ⚠️"
echo ""

echo "5️⃣  VERIFIQUE FILTROS"
echo "   - Clique '[FILTRAR POR REGIÃO: TODAS]'"
echo "   - Deve alternar entre: TODAS, BRASIL, PORTUGAL, ANGOLA, GLOBAL"
echo "   - Partículas devem refiltar conforme e re-iniciar"
echo ""

echo "📊 ESPERADO DURANTE OPERAÇÃO NORMAL:"
echo "   ✅ Primeiro: palavras do mockData (fallback inicial)"
echo "   ✅ Depois (2-3s): palavras do Google Trends (Portugal)"
echo "   ✅ ORIGEM sempre mostra fonte correta no modal"
echo ""

echo "🔍 DEBUGGING VIA CONSOLE (F12):"
echo "   - mockData disponível? window.mockData"
echo "   - wordsDB carregado? window.wordsDB"
echo "   - isDataLoaded? window.isDataLoaded"
echo ""

echo "⚠️  FALHAS COMUNS:"
echo "   - Console mostra erro CORS? → Proxy allorigins.win pode estar down"
echo "   - Palavras não caem? → Verificar se mockData carregou (F12)"
echo "   - Modal vazio? → Verificar console para erros javascript"
echo ""

echo "✅ TESTE COMPLETO"
echo "   Se ver palavras em português caindo com ORIGEM 'Google_Pulse_PT' = SUCESSO!"
