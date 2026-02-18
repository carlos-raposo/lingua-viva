#!/usr/bin/env python3
"""
TRENDS PROXY - Backend com suporte a dados reais
Google Trends + Bluesky API (Autenticado) + Análise de Neologismos em Português
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
            _bluesky_client = False
    
    return _bluesky_client if _bluesky_client is not False else None

# ==============================================================================
# DADOS MOCKADOS PARA FALLBACK
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
# DETECÇÃO DE NEOLOGISMOS - ANÁLISE LINGUÍSTICA
# ==============================================================================

COMMON_WORDS = {'a', 'à', 'ao', 'aos', 'as', 'até', 'através', 'cada', 'com', 'como', 'consigo',
    'cuja', 'cujo', 'da', 'das', 'de', 'dela', 'dele', 'demais', 'dentro', 'depois',
    'desde', 'dessa', 'desse', 'desta', 'deste', 'deve', 'devem', 'dever', 'deveria',
    'devo', 'dia', 'dias', 'diálogo', 'diária', 'diário', 'diferença', 'diferente',
    'difícil', 'dificuldade', 'do', 'dos', 'doutor', 'doutora', 'e', 'é', 'ela',
    'elas', 'ele', 'eles', 'eleição', 'eleitor', 'em', 'embora', 'emergência',
    'emissão', 'emoção', 'empresa', 'emprego', 'encima', 'encontra', 'encontro',
    'endereço', 'enquanto', 'ens', 'ensaio', 'ensinança', 'ensino', 'ensoberbecida',
    'ensoberbecido', 'ensoberbecedor', 'ensoberbecedora', 'ensoberbecente', 'ensoberbecentemente',
    'ensoberbecentemente', 'ensoberbecenza', 'ensoberbecenza', 'ensoberbecência', 'ensoberbecência'}

def is_neologismo(word):
    """Detecta se uma palavra é potencialmente um neologismo português"""
    
    if len(word) < 3 or len(word) > 30:
        return False
    
    if word.lower() in COMMON_WORDS:
        return False
    
    if word.startswith(('@', 'http', 'www', '.')):
        return False
    
    if word.isdigit():
        return False
    
    if not any(c.isalpha() for c in word):
        return False
    
    # CamelCase (DesDigitalizar, PromptAI)
    if re.search(r'[a-z][A-Z]', word):
        return True
    
    # Múltiplas maiúsculas
    if sum(1 for c in word if c.isupper()) >= 2:
        return True
    
    # Terminações típicas de neologismos
    if any(word.lower().endswith(s) for s in ['izar', 'ção', 'ismo', 'ista', 'ada', 'ado', 'ante']):
        return True
    
    # Gírias curtas
    if len(word) <= 4 and any(c.lower() in 'aeiou' for c in word):
        return True
    
    return False

def extract_neologismos(text):
    """Extrai neologismos de um texto"""
    text_clean = re.sub(r'http\S+|www\S+|@\w+', '', text)
    words = re.findall(r'\b[a-záéíóúâêãõçA-Z][a-záéíóúâêãõçA-Z]*\b', text_clean)
    return {w for w in words if is_neologismo(w)}

# ==============================================================================
# ENDPOINTS
# ==============================================================================

@app.route('/', methods=['GET'])
def index():
    """Info do servidor"""
    return jsonify({
        'service': 'Trends Proxy',
        'version': '2.2',
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
        return jsonify({'success': False, 'error': 'Sem dados', 'geo': geo}), 503

@app.route('/bluesky', methods=['GET'])
def get_bluesky():
    """GET /bluesky - Trending topics do Bluesky"""
    try:
        logger.info("🔷 Fetching Bluesky Trending...")
        
        client = get_bluesky_client()
        if client:
            try:
                trends = client.app.bsky.unspecced.get_trends()
                formatted_trends = [
                    {
                        'termo': t.query.lstrip('#'),
                        'traffic': '+Unknown',
                        'origem': 'Bluesky',
                        'source': 'bluesky',
                        'real': True,
                        'description': f'Tópico trending no Bluesky',
                        'pubDate': datetime.now().isoformat(),
                        'status': 'Trending Agora',
                        'tendencia': 'Explosiva'
                    }
                    for t in trends.trends[:15]
                ]
                
                return jsonify({
                    'success': True,
                    'count': len(formatted_trends),
                    'source': 'bluesky',
                    'timestamp': datetime.now().isoformat(),
                    'data': formatted_trends
                })
            except Exception as e:
                logger.warning(f"Erro ao chamar getTrends: {str(e)}")
        
        # Fallback: usar público
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
            return jsonify({'success': False, 'error': f'Bluesky retornou {response.status_code}'}), response.status_code
    
    except Exception as e:
        logger.error(f"❌ Erro ao buscar Bluesky: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/bluesky/neologismos', methods=['GET'])
def get_neologismos():
    """GET /bluesky/neologismos - Detecta neologismos em posts portugueses"""
    try:
        logger.info("📚 Detectando neologismos em português...")
        
        client = get_bluesky_client()
        if not client:
            logger.warning("❌ Cliente não autenticado, usando fallback...")
            return jsonify({
                'success': True,
                'count': len(NEOLOGISMOS_MOCK),
                'source': 'fallback',
                'idioma': 'português',
                'warning': 'usando mock (cliente não autenticado)',
                'timestamp': datetime.now().isoformat(),
                'data': NEOLOGISMOS_MOCK
            })
        
        neologismos_encontrados = {}
        posts_analisados = 0
        
        try:
            logger.info("🔍 Buscando posts em português...")
            results = client.app.bsky.feed.search_posts(
                query='lang:pt',
                limit=100,
                sort='latest'
            )
            
            if results and results.posts:
                for post in results.posts:
                    try:
                        posts_analisados += 1
                        text = post.record.text if hasattr(post.record, 'text') else ''
                        
                        if not text:
                            continue
                        
                        found_neologismos = extract_neologismos(text)
                        
                        for neologismo in found_neologismos:
                            if neologismo not in neologismos_encontrados:
                                neologismos_encontrados[neologismo] = {
                                    'termo': neologismo,
                                    'context': text[:140],
                                    'fonte': 'Bluesky',
                                    'idioma': 'PT',
                                    'pubDate': datetime.now().isoformat(),
                                    'source': 'bluesky',
                                    'tipo': 'neologismo_detectado'
                                }
                    
                    except Exception as e:
                        logger.debug(f"Erro ao analisar: {str(e)}")
                        continue
        
        except Exception as e:
            logger.warning(f"Erro na busca: {str(e)}")
        
        logger.info(f"📊 Posts: {posts_analisados}, Neologismos: {len(neologismos_encontrados)}")
        
        if neologismos_encontrados:
            resultado = sorted(list(neologismos_encontrados.values()), 
                             key=lambda x: len(x['termo']))[:20]
            source = 'bluesky'
            logger.info(f"✅ {len(resultado)} neologismos encontrados!")
        else:
            resultado = NEOLOGISMOS_MOCK
            source = 'fallback'
            logger.info("⚠️ Nenhum neologismo, usando fallback...")
        
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
        logger.error(f"❌ Erro: {str(e)}")
        return jsonify({
            'success': True,
            'count': len(NEOLOGISMOS_MOCK),
            'source': 'fallback',
            'idioma': 'português',
            'warning': f'Erro: {str(e)}',
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
