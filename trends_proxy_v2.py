#!/usr/bin/env python3
"""
TRENDS PROXY - Backend com suporte a dados reais
Google Trends + Bluesky API (Autenticado) + Neologismos em Português
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime
import logging
import json
import re
import os
from atproto import Client

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==============================================================================
# CONFIGURAÇÃO BLUESKY
# ==============================================================================
BLUESKY_USERNAME = os.environ.get('BLUESKY_USERNAME', 'lingua-viva.bsky.social')
BLUESKY_PASSWORD = os.environ.get('BLUESKY_PASSWORD', '')

# Cliente Bluesky global (lazy-loaded)
_bluesky_client = None

def get_bluesky_client():
    """Retorna cliente Bluesky autenticado (com cache)"""
    global _bluesky_client
    
    if _bluesky_client is None:
        try:
            logger.info(f"🔐 Autenticando no Bluesky como {BLUESKY_USERNAME}...")
            client = Client()
            client.login(BLUESKY_USERNAME, BLUESKY_PASSWORD)
            _bluesky_client = client
            logger.info("✅ Autenticação Bluesky bem-sucedida!")
        except Exception as e:
            logger.error(f"❌ Erro ao autenticar no Bluesky: {str(e)}")
            _bluesky_client = False  # Marcar como falha
    
    return _bluesky_client if _bluesky_client is not False else None

# ==============================================================================
# DETECÇÃO DE NEOLOGISMOS - ANÁLISE LINGUÍSTICA
# ==============================================================================

# Palavras comuns em português (blacklist - não contar como neologismos)
COMMON_WORDS = {
    'a', 'à', 'ao', 'aos', 'aquela', 'aquelas', 'aquele', 'aqueles', 'aquilo',
    'as', 'até', 'através', 'cada', 'caso', 'cela', 'com', 'comigo', 'como', 
    'conseguinte', 'consigo', 'contigo', 'contínua', 'contínuas', 'contínuo', 
    'contínuos', 'cuja', 'cujas', 'cujo', 'cujos', 'da', 'das', 'de', 'dela', 
    'delas', 'dele', 'deles', 'demais', 'dentro', 'depois', 'desde', 'dessa', 
    'dessas', 'desse', 'desses', 'desta', 'deste', 'destes', 'deve', 'devem', 
    'devendo', 'dever', 'deverá', 'deveria', 'deveriamos', 'deveríamos', 'devero',
    'deverou', 'devemos', 'devendo', 'dever', 'deverá', 'deveria', 'deveriamos',
    'devi', 'devida', 'devidas', 'devido', 'devidos', 'devisa', 'deviso', 'devo',
    'devolvamos', 'devolva', 'devolvam', 'develva', 'devolvendo', 'devolver',
    'devolvera', 'devolvi', 'devolvida', 'devolvidas', 'devolvido', 'devolvidos',
    'devolvimento', 'devolvimento', 'devolvimento', 'devolvimento', 'devolvimento',
    'devolvimentos', 'devulva', 'devulvam', 'devulvi', 'devolvida', 'devolvidas',
    'devolvido', 'devolvidos', 'devolvimento', 'devolvimentos', 'devolvimento',
    'di', 'dia', 'dias', 'diante', 'dialogo', 'diálogo', 'diarios', 'diária',
    'diárias', 'diário', 'diários', 'diárias', 'diárias', 'didatica', 'didática',
    'didático', 'didáticos', 'didáticas', 'didatica', 'didatico', 'didaticos',
    'diferenca', 'diferença', 'diferenças', 'diferente', 'diferentes', 'diferenca',
    'diferenca', 'diferenca', 'diferente', 'diferente', 'diferente', 'diferente',
    'dificil', 'difícil', 'dificílima', 'dificílimas', 'dificílimo', 'dificílimos',
    'dificuldade', 'dificuldades', 'difícil', 'difíceis', 'dificuldade', 'dificuldade',
    'dificuldade', 'dificuldade', 'dificuldade', 'dificuldade', 'dificuldade',
    'difundir', 'difunda', 'difundam', 'difundais', 'difundais', 'difundas',
    'difundasses', 'difundava', 'difundavas', 'difundavamos', 'difundavamos',
    'difundavam', 'difundação', 'difundação', 'difundação', 'difundador',
    'difundadora', 'difundadoramente', 'difundadores', 'difundadora', 'difundadora',
    'difundadoras', 'difundadoras', 'difundador', 'difundador', 'difundador',
    'difundador', 'difundador', 'difundador', 'difundadores', 'difundadores',
    'difundadores', 'difundadores', 'difundadores', 'difundadores', 'difundadores',
    'do', 'dos', 'doutor', 'doutora', 'doutoral', 'doutorado', 'doutorados',
    'doutora', 'doutora', 'doutorado', 'doutorado', 'doutorado', 'doutora',
    'doutora', 'doutora', 'doutora', 'doutora', 'dra', 'drástica', 'drásticas',
    'drástico', 'drásticos', 'dra', 'dra', 'dra', 'dra', 'dra', 'dra',
    'e', 'é', 'ela', 'elas', 'ele', 'eles', 'eleição', 'eleições', 'eleitor',
    'eleitora', 'eleitores', 'eleitoras', 'eleitoral', 'eleitorado', 'eleitorado',
    'eleitorado', 'eleição', 'eleição', 'eleição', 'eleição', 'eleição', 'eleição',
    'eleição', 'eleição', 'eleição', 'eleição', 'elétrica', 'elétricas', 'elétrico',
    'eléctrica', 'eléctrico', 'eléctricos', 'eléctrica', 'eléctrica', 'eléctrica',
    'eléctrica', 'eléctrica', 'eléctrica', 'eléctrica', 'eléctrica', 'eléctrica',
    'em', 'embaixada', 'embaixadas', 'embaixador', 'embaixadora', 'embaixadores',
    'embaixadora', 'embaixadora', 'embaixadora', 'embaixadora', 'embaixadora',
    'embaixadora', 'embaixadora', 'embaixadora', 'embaixadora', 'embaixadora',
    'embaixadora', 'embaixadora', 'embaixadora', 'embaixadora', 'embaixadora',
    'embargo', 'embargos', 'embargo', 'embargo', 'embargo', 'embargo', 'embargo',
    'embargo', 'embargo', 'embargo', 'embargo', 'embargo', 'embargo', 'embargo',
    'embargo', 'embargo', 'embargo', 'embargo', 'embargo', 'embargo', 'embargo',
    'em', 'embora', 'embrião', 'embriões', 'embrião', 'embrião', 'embrião',
    'embrião', 'embrião', 'embrião', 'embrião', 'embrião', 'embrião', 'embrião'
}

def is_interesting_word(word):
    """Detecta se uma palavra é potencialmente um neologismo"""
    
    # Ignorar muito curto ou muito longo
    if len(word) < 3 or len(word) > 30:
        return False
    
    # Ignorar palavras comuns
    if word.lower() in COMMON_WORDS:
        return False
    
    # Ignorar URLs e menciones
    if word.startswith(('@', 'http', 'www', '.')):
        return False
    
    # Ignorar números puros
    if word.isdigit():
        return False
    
    # Ignorar apenas pontuação
    if not any(c.isalpha() for c in word):
        return False
    
    # HEURÍSTICA 1: CamelCase criativo (ex: DesDigitalizar, PromptAI)
    if re.search(r'[a-z][A-Z]', word):  # camelCase
        return True
    
    # HEURÍSTICA 2: Múltiplas maiúsculas no meio (ex: AI, ML)
    if sum(1 for c in word if c.isupper()) >= 2:
        return True
    
    # HEURÍSTICA 3: Terminações criativas de gíria portuguesa
    # -izar, -ção, -ismo, -ista, -ada, -ada
    suffixes_slang = ['izar', 'ção', 'ismo', 'ista', 'ada', 'ado', 'ante', 'ência']
    if any(word.lower().endswith(s) for s in suffixes_slang):
        # Se termina em sufixo comum mas palavra é rara = neologismo
        return True
    
    # HEURÍSTICA 4: Compostos com traço ou underscore
    if '-' in word or '_' in word:
        return True
    
    # HEURÍSTICA 5: Padrão de gíria: reduções criativas
    # ex: "bué", "tá", "vcs"
    if len(word) <= 4 and not word.lower() in {'que', 'ser', 'ter', 'nem', 'dos', 'das', 'uma', 'um'}:
        if any(c.lower() in 'aeiou' for c in word):  # tem vogal
            return True
    
    return False

def extract_neologismos_from_text(text):
    """Extrai potenciais neologismos de um texto"""
    # Remover URLs e mencões
    text_clean = re.sub(r'http\S+|www\S+|@\w+', '', text)
    
    # Extrair palavras (manter maiúsculas para CamelCase)
    words = re.findall(r'\b[a-záéíóúâêãõçA-Z][a-záéíóúâêãõçA-Z]*\b', text_clean)
    
    neologismos = set()
    for word in words:
        if is_interesting_word(word):
            neologismos.add(word)
    
    return neologismos
# ==============================================================================
FALLBACK_TRENDS = {
    'PT': [
        {'termo': 'Eleições 2026', 'traffic': '+250K'},
        {'termo': 'Bitcoin', 'traffic': '+180K'},
        {'termo': 'IA', 'traffic': '+150K'},
        {'termo': 'Futebol Portugal', 'traffic': '+140K'},
        {'termo': 'Cinema', 'traffic': '+120K'},
    ],
    'BR': [
        {'termo': 'Eleições 2026', 'traffic': '+500K'},
        {'termo': 'Futebol Brasil', 'traffic': '+450K'},
        {'termo': 'Spotify', 'traffic': '+380K'},
    ],
    'AO': [
        {'termo': 'Angola Notícias', 'traffic': '+50K'},
        {'termo': 'Luanda', 'traffic': '+45K'},
    ]
}

NEOLOGISMOS_MOCK = [
    {'termo': 'Promptar', 'def': 'Arte de formular perguntas a IA', 'fonte': 'Bluesky', 'idioma': 'PT'},
    {'termo': 'Desdigitalizar', 'def': 'Retomar hábitos analógicos', 'fonte': 'Bluesky', 'idioma': 'PT'},
    {'termo': 'Viralizar', 'def': 'Tornar-se tendência viral', 'fonte': 'Bluesky', 'idioma': 'PT'},
    {'termo': 'Bué', 'def': 'Muito (gíria angolana popular)', 'fonte': 'Bluesky', 'idioma': 'PT'},
]

# ==============================================================================
# ENDPOINTS
# ==============================================================================

@app.route('/', methods=['GET'])
def index():
    """Info do servidor"""
    return jsonify({
        'service': 'Trends Proxy',
        'version': '2.1',
        'bluesky_authenticated': get_bluesky_client() is not None,
        'endpoints': {
            'GET /trends?geo=PT': 'Portugal',
            'GET /trends?geo=BR': 'Brasil',
            'GET /trends?geo=AO': 'Angola',
            'GET /bluesky': 'Bluesky Trending',
            'GET /bluesky/neologismos': 'Neologismos Português (autenticado)'
        }
    })

@app.route('/trends', methods=['GET'])
def get_trends():
    """GET /trends?geo=PT|BR|AO"""
    geo = request.args.get('geo', 'PT').upper()
    logger.info(f"📡 Request: /trends?geo={geo}")
    
    # Retornar mock data (Google Trends bloqueado em Render)
    trends = FALLBACK_TRENDS.get(geo, [])
    
    if trends and len(trends) > 0:
        formatted_trends = [
            {
                'termo': t['termo'],
                'traffic': t['traffic'],
                'origem': geo,
                'source': 'fallback',
                'real': False,
                'description': f'Termo em tendência em {geo}',
                'pubDate': datetime.now().isoformat(),
                'status': 'Tendência 2026',
                'tendencia': 'Alta'
            }
            for t in trends
        ]
        return jsonify({
            'success': True,
            'count': len(formatted_trends),
            'geo': geo,
            'timestamp': datetime.now().isoformat(),
            'data': formatted_trends
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Sem dados',
            'geo': geo
        }), 503

@app.route('/bluesky', methods=['GET'])
def get_bluesky():
    """GET /bluesky - Trending topics do Bluesky"""
    try:
        logger.info("🔷 Fetching Bluesky Trending...")
        
        # Usar getTrends endpoint público (não requer auth)
        response = requests.get(
            'https://public.api.bsky.app/xrpc/app.bsky.unspecced.getTrends',
            headers={'Accept': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            trends = data.get('trends', [])
            
            formatted_trends = [
                {
                    'termo': t.get('query', '').lstrip('#'),
                    'traffic': '+Unknown',
                    'origem': 'Bluesky',
                    'source': 'bluesky',
                    'real': True,
                    'description': f'Tópico trending no Bluesky',
                    'pubDate': datetime.now().isoformat(),
                    'status': 'Trending Agora',
                    'tendencia': 'Explosiva'
                }
                for t in trends[:15]
            ]
            
            return jsonify({
                'success': True,
                'count': len(formatted_trends),
                'source': 'bluesky',
                'timestamp': datetime.now().isoformat(),
                'data': formatted_trends
            })
        else:
            logger.warning(f"Bluesky retornou {response.status_code}")
            return jsonify({
                'success': False,
                'error': f'Bluesky retornou {response.status_code}'
            }), response.status_code
    
    except Exception as e:
        logger.error(f"❌ Erro ao buscar Bluesky: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/bluesky/neologismos', methods=['GET'])
def get_neologismos():
    """GET /bluesky/neologismos - Detecta neologismos em posts portugueses (AUTENTICADO)"""
    try:
        logger.info("📚 Analisando posts em português para detectar neologismos...")
        
        client = get_bluesky_client()
        if not client:
            logger.warning("❌ Cliente Bluesky não autenticado, usando fallback...")
            return jsonify({
                'success': True,
                'count': len(NEOLOGISMOS_MOCK),
                'source': 'fallback',
                'idioma': 'português',
                'warning': 'usando dados mockados (cliente não autenticado)',
                'timestamp': datetime.now().isoformat(),
                'data': NEOLOGISMOS_MOCK
            })
        
        neologismos_encontrados = {}  # Dict para evitar duplicatas: {palavra: contexto}
        posts_analisados = 0
        
        # Estratégia: buscar posts com termos genéricos em português
        search_queries = [
            'lang:pt',  # Todos os posts em português
        ]
        
        for query in search_queries:
            try:
                logger.info(f"🔍 Buscando posts: '{query}'...")
                
                # Buscar posts em português
                results = client.app.bsky.feed.search_posts(
                    query=query,
                    limit=100,  # Aumentar para mais análise
                    sort='latest'
                )
                
                if results and results.posts:
                    for post in results.posts:
                        try:
                            posts_analisados += 1
                            
                            # Extrair texto do post
                            text = post.record.text if hasattr(post.record, 'text') else ''
                            
                            if not text:
                                continue
                            
                            # Analisar texto para detectar neologismos
                            found_neologismos = extract_neologismos_from_text(text)
                            
                            for neologismo in found_neologismos:
                                if neologismo not in neologismos_encontrados:
                                    neologismos_encontrados[neologismo] = {
                                        'termo': neologismo,
                                        'context': text[:140],  # Primeiro 140 caracteres como contexto
                                        'fonte': 'Bluesky',
                                        'idioma': 'PT',
                                        'pubDate': datetime.now().isoformat(),
                                        'source': 'bluesky',
                                        'tipo': 'neologismo_detectado'
                                    }
                        
                        except Exception as e:
                            logger.debug(f"Erro ao analisar post: {str(e)}")
                            continue
                
            except Exception as e:
                logger.warning(f"Erro ao buscar '{query}': {str(e)}")
                continue
        
        logger.info(f"📊 Posts analisados: {posts_analisados}, Neologismos detectados: {len(neologismos_encontrados)}")
        
        # Se encontrou neologismos, retornar; senão usar mock
        if neologismos_encontrados:
            # Limitar a 20 melhores neologismos (ordenar por tamanho/relevância)
            resultado = sorted(
                list(neologismos_encontrados.values()),
                key=lambda x: len(x['termo']),  # Preferir palavras médias
                reverse=False
            )[:20]
            
            logger.info(f"✅ Encontrados {len(resultado)} neologismos únicos do Bluesky!")
            source = 'bluesky'
        else:
            logger.info("⚠️  Nenhum neologismo detectado, usando fallback...")
            resultado = NEOLOGISMOS_MOCK
            source = 'fallback'
        
        return jsonify({
            'success': True,
            'count': len(resultado),
            'source': source,
            'idioma': 'português',
            'posts_analisados': posts_analisados,
            'timestamp': datetime.now().isoformat(),
            'data': resultado
        })
    
    except Exception as e:
        logger.error(f"❌ Erro ao detectar neologismos: {str(e)}")
        return jsonify({
            'success': True,
            'count': len(NEOLOGISMOS_MOCK),
            'source': 'fallback',
            'idioma': 'português',
            'warning': f'Erro na análise, usando mock: {str(e)}',
            'timestamp': datetime.now().isoformat(),
            'data': NEOLOGISMOS_MOCK
        })

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'ok',
        'bluesky_authenticated': get_bluesky_client() is not None
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
