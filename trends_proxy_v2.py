#!/usr/bin/env python3
"""
TRENDS PROXY - Backend com suporte a datos reais
Google Trends + Bluesky API + Neologismos em Português
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime
import logging
import json
import re
import os

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        'endpoints': {
            'GET /trends?geo=PT': 'Portugal',
            'GET /trends?geo=BR': 'Brasil',
            'GET /trends?geo=AO': 'Angola',
            'GET /bluesky': 'Bluesky Trending',
            'GET /bluesky/neologismos': 'Neologismos Português'
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
    """GET /bluesky/neologismos - Neologismos e gírias em português do Bluesky"""
    try:
        logger.info("📚 Fetching Neologismos em Português...")
        
        # Lista de termos de busca em português
        search_terms = [
            'neologismo',
            'gíria',
            'neolíngua',
            'português moderno',
            'slang português',
            'palavra nova'
        ]
        
        neologismos_encontrados = []
        
        for term in search_terms:
            try:
                # Buscar posts com o termo
                response = requests.get(
                    'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts',
                    params={
                        'q': f'#{term} lang:pt',
                        'limit': 10
                    },
                    headers={'Accept': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    posts = data.get('posts', [])
                    
                    for post in posts:
                        text = post.get('record', {}).get('text', '')
                        
                        # Extrair palavras-chave (simplificado)
                        palavras = re.findall(r'\b[a-záéíóúâêãõç]+\b', text.lower())
                        
                        for palavra in palavras:
                            if len(palavra) > 3:  # Ignorar palavras muito curtas
                                neologismos_encontrados.append({
                                    'termo': palavra.capitalize(),
                                    'context': text[:100],
                                    'fonte': 'Bluesky',
                                    'idioma': 'PT',
                                    'pubDate': datetime.now().isoformat(),
                                    'source': 'bluesky'
                                })
                
            except Exception as e:
                logger.warning(f"Erro ao buscar '{term}': {str(e)}")
                continue
        
        # Se não encontrar, usar mock data
        if not neologismos_encontrados:
            neologismos_encontrados = NEOLOGISMOS_MOCK
        
        return jsonify({
            'success': True,
            'count': len(neologismos_encontrados),
            'source': 'bluesky',
            'idioma': 'português',
            'timestamp': datetime.now().isoformat(),
            'data': neologismos_encontrados
        })
    
    except Exception as e:
        logger.error(f"❌ Erro ao buscar neologismos: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': NEOLOGISMOS_MOCK  # Fallback
        })

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
