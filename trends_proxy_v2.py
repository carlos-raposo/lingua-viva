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
    """GET /bluesky/neologismos - Neologismos e gírias em português do Bluesky (AUTENTICADO)"""
    try:
        logger.info("📚 Fetching Neologismos em Português...")
        
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
        
        # Lista de hashtags e termos de busca em português
        search_terms = [
            '#neologismo',
            '#gíria',
            '#neolíngua',
            '#português',
            '#slang',
            '#neolingua'
        ]
        
        neologismos_encontrados = {}  # Dict para evitar duplicatas
        
        for term in search_terms:
            try:
                logger.info(f"🔍 Buscando posts com '{term}'...")
                
                # Buscar posts com o termo em português
                results = client.app.bsky.feed.search_posts(
                    query=f'{term} lang:pt',
                    limit=20,
                    sort='latest'
                )
                
                if results and results.posts:
                    for post in results.posts:
                        text = post.record.text if hasattr(post.record, 'text') else str(post.record)
                        
                        # Extrair hashtags e palavras-chave
                        hashtags = re.findall(r'#([a-záéíóúâêãõç_]+)', text, re.IGNORECASE)
                        
                        for tag in hashtags:
                            if len(tag) > 2 and tag.lower() not in ['neologismo', 'gíria', 'português', 'slang']:
                                if tag not in neologismos_encontrados:
                                    neologismos_encontrados[tag] = {
                                        'termo': tag.capitalize(),
                                        'context': text[:150],
                                        'fonte': 'Bluesky',
                                        'idioma': 'PT',
                                        'pubDate': datetime.now().isoformat(),
                                        'source': 'bluesky'
                                    }
                
            except Exception as e:
                logger.warning(f"Erro ao buscar '{term}': {str(e)}")
                continue
        
        # Se encontrou neologismos, retornar; senão usar mock
        if neologismos_encontrados:
            resultado = list(neologismos_encontrados.values())
            logger.info(f"✅ Encontrados {len(resultado)} neologismos únicos do Bluesky!")
        else:
            resultado = NEOLOGISMOS_MOCK
            logger.info("⚠️  Nenhum neologismo encontrado, usando fallback...")
        
        return jsonify({
            'success': True,
            'count': len(resultado),
            'source': 'bluesky' if neologismos_encontrados else 'fallback',
            'idioma': 'português',
            'timestamp': datetime.now().isoformat(),
            'data': resultado
        })
    
    except Exception as e:
        logger.error(f"❌ Erro ao buscar neologismos: {str(e)}")
        return jsonify({
            'success': True,
            'count': len(NEOLOGISMOS_MOCK),
            'source': 'fallback',
            'idioma': 'português',
            'warning': f'Erro na busca, usando mock: {str(e)}',
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
