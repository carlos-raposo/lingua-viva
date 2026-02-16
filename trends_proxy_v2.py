#!/usr/bin/env python3
"""
TRENDS PROXY V2 - Backend com suporte a fallback automático
Quando Google Trends bloqueia, usa dados mockados
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from xml.etree import ElementTree as ET
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dados mockados para fallback
FALLBACK_TRENDS = {
    'PT': [
        {'termo': 'Eleições 2026', 'traffic': '+250K'},
        {'termo': 'Bitcoin', 'traffic': '+180K'},
        {'termo': 'IA', 'traffic': '+150K'},
        {'termo': 'Futebol Portugal', 'traffic': '+140K'},
        {'termo': 'Cinema', 'traffic': '+120K'},
        {'termo': 'Tecnologia', 'traffic': '+110K'},
        {'termo': 'Saúde', 'traffic': '+100K'},
        {'termo': 'Clima', 'traffic': '+90K'},
        {'termo': 'Política', 'traffic': '+85K'},
        {'termo': 'Educação', 'traffic': '+80K'},
    ],
    'BR': [
        {'termo': 'Eleições 2026', 'traffic': '+500K'},
        {'termo': 'Futebol Brasil', 'traffic': '+450K'},
        {'termo': 'Spotify', 'traffic': '+380K'},
        {'termo': 'Netflix', 'traffic': '+350K'},
        {'termo': 'São Paulo', 'traffic': '+320K'},
    ],
    'AO': [
        {'termo': 'Angola Notícias', 'traffic': '+50K'},
        {'termo': 'Luanda', 'traffic': '+45K'},
        {'termo': 'Economia', 'traffic': '+40K'},
    ]
}

def get_fallback_trends(geo_code="PT"):
    """Retorna dados mockados como fallback"""
    logger.info(f"📊 Usando fallback trends para {geo_code}...")
    trends_data = FALLBACK_TRENDS.get(geo_code, FALLBACK_TRENDS['PT'])
    
    return [
        {
            'termo': item['termo'],
            'origem': f'Google_Pulse_{geo_code}',
            'traffic': item['traffic'],
            'pubDate': datetime.now().isoformat(),
            'description': f'Termo em tendência em {geo_code}',
            'source': 'fallback',
            'real': False
        }
        for item in trends_data
    ]

def parse_google_trends_rss(geo_code="PT"):
    """Busca e parse Google Trends RSS feed"""
    try:
        url = f"https://trends.google.com/trends/trendingsearches/daily/rss?geo={geo_code}"
        
        logger.info(f"📡 Tentando buscar Google Trends RSS ({geo_code})...")
        
        # Headers muito realistas
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml,application/xml',
            'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Referer': 'https://trends.google.com/',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'DNT': '1'
        }
        
        response = requests.get(
            url, 
            headers=headers, 
            timeout=10,
            verify=True,
            allow_redirects=True
        )
        
        logger.info(f"   Status HTTP: {response.status_code}")
        
        if response.status_code == 404:
            logger.warning("⚠️  Google Trends retornou 404 - URL pode ter mudado")
            logger.info("   Usando fallback...")
            return get_fallback_trends(geo_code)
        
        response.raise_for_status()
        
        logger.info(f"✅ RSS recebido ({len(response.content)} bytes)")
        
        # Parse XML
        root = ET.fromstring(response.content)
        
        # Namespace para Google Trends
        namespace = {'ht': 'http://www.google.com/trends/queries'}
        items = root.findall('.//item')
        logger.info(f"📊 Items encontrados: {len(items)}")
        
        if len(items) == 0:
            logger.warning("⚠️ Nenhum item no feed - usando fallback")
            return get_fallback_trends(geo_code)
        
        trends = []
        
        for idx, item in enumerate(items[:25]):
            try:
                title = item.findtext('title', '').strip()
                title = title.split('. ', 1)[-1].strip()
                
                pub_date = item.findtext('pubDate', datetime.now().isoformat())
                
                traffic_elem = item.find('ht:approx_traffic', namespace)
                traffic = traffic_elem.text if traffic_elem is not None else "+0"
                
                trends.append({
                    'termo': title,
                    'origem': f'Google_Pulse_{geo_code}',
                    'traffic': traffic,
                    'pubDate': pub_date,
                    'description': '',
                    'source': 'google_trends_real',
                    'real': True
                })
                
                logger.info(f"   {idx+1}. {title}")
                
            except Exception as e:
                logger.warning(f"   ⚠️ Erro ao parse item {idx}: {e}")
                continue
        
        if len(trends) > 0:
            logger.info(f"✅ {len(trends)} termos reais carregados!")
            return trends
        else:
            logger.warning("Nenhum termo conseguiu ser parseado - usando fallback")
            return get_fallback_trends(geo_code)
        
    except requests.exceptions.HTTPError as e:
        logger.error(f"❌ HTTP Error {e.response.status_code}")
        return get_fallback_trends(geo_code)
    except requests.exceptions.Timeout:
        logger.error("❌ Timeout")
        return get_fallback_trends(geo_code)
    except requests.exceptions.ConnectionError as e:
        logger.error(f"❌ Conexão falhou: {e}")
        return get_fallback_trends(geo_code)
    except ET.ParseError as e:
        logger.error(f"❌ Erro XML: {e}")
        return get_fallback_trends(geo_code)
    except Exception as e:
        logger.error(f"❌ Erro: {type(e).__name__}: {e}")
        return get_fallback_trends(geo_code)

@app.route('/trends', methods=['GET'])
def get_trends():
    """GET /trends?geo=PT"""
    geo = request.args.get('geo', 'PT').upper()
    logger.info(f"📡 Request: /trends?geo={geo}")
    
    trends = parse_google_trends_rss(geo)
    
    if trends and len(trends) > 0:
        return jsonify({
            'success': True,
            'count': len(trends),
            'geo': geo,
            'timestamp': datetime.now().isoformat(),
            'data': trends
        })
    else:
        logger.error("Nenhum dado")
        return jsonify({
            'success': False,
            'error': 'Sem dados',
            'geo': geo,
            'timestamp': datetime.now().isoformat()
        }), 503

@app.route('/bluesky', methods=['GET'])
def get_bluesky():
    """GET /bluesky - Trending posts do Bluesky via getTrends (endpoint público)"""
    logger.info("📡 Request: /bluesky - Usando getTrends público")
    
    try:
        # ESTRATÉGIA CORRETA: getTrends (endpoint público do Bluesky)
        logger.info("🔍 Tentando app.bsky.unspecced.getTrends (API pública)...")
        response = requests.get(
            'https://public.api.bsky.app/xrpc/app.bsky.unspecced.getTrends',
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout=10
        )
        
        logger.info(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            trends_list = data.get('trends', [])
            logger.info(f"✅ Tendências recebidas! Total: {len(trends_list)}")
            
            if trends_list and len(trends_list) > 0:
                trends = []
                
                # Iterar sobre tendências retornadas
                for idx, trend in enumerate(trends_list[:15]):  # Máx 15 termos
                    # Extrair nome do tópico
                    topic_parts = trend.get('path', '').split('/')
                    topic_name = topic_parts[-1] if len(topic_parts) > 0 else f"Trend_{idx}"
                    
                    # Se o nome estiver vazio, usar displayName
                    if not topic_name or topic_name == '':
                        topic_name = trend.get('displayName', f"Trend_{idx}")
                    
                    # Calcular traffic simulado baseado em posição
                    traffic_value = (15 - idx) * 100  # Descresce com posição
                    traffic = f"+{traffic_value}K"
                    
                    trends.append({
                        'termo': topic_name.replace('-', ' ').replace('_', ' ').title(),
                        'origem': 'BLUESKY',
                        'traffic': traffic,
                        'pubDate': datetime.now().isoformat(),
                        'description': f'Bluesky trending REAL',
                        'source': 'bluesky',
                        'real': True  # ✅ DADOS REAIS!
                    })
                
                logger.info(f"✅✅ BLUESKY REAL: {len(trends)} termos extraídos com sucesso!")
                return jsonify({
                    'success': True,
                    'count': len(trends),
                    'source': 'bluesky_real',  # Marcar como REAL
                    'timestamp': datetime.now().isoformat(),
                    'data': trends
                })
            else:
                logger.warning("⚠️  Trends list vazia")
        
        logger.warning(f"❌ getTrends falhou (status {response.status_code})")
        
    except Exception as e:
        logger.error(f"❌ Erro ao buscar getTrends: {e}")
    
    # FALLBACK: Se getTrends não funcionar
    logger.warning("⚠️  getTrends falhou - retornando fallback")
    fallback_bluesky = [
        {'termo': 'Tecnologia', 'traffic': '+250K'},
        {'termo': 'IA', 'traffic': '+200K'},
        {'termo': 'Python', 'traffic': '+180K'},
        {'termo': 'Desenvolvimento', 'traffic': '+150K'},
        {'termo': 'JavaScript', 'traffic': '+140K'},
        {'termo': 'WebDevelopment', 'traffic': '+130K'},
        {'termo': 'Cloud', 'traffic': '+120K'},
        {'termo': 'DevOps', 'traffic': '+110K'},
        {'termo': 'Docker', 'traffic': '+100K'},
        {'termo': 'GitWorkflow', 'traffic': '+90K'},
    ]
    trends = []
    for item in fallback_bluesky:
        trends.append({
            'termo': item['termo'],
            'origem': 'BLUESKY',
            'traffic': item['traffic'],
            'pubDate': datetime.now().isoformat(),
            'description': f'Bluesky trending (FALLBACK - API indisponível)',
            'source': 'bluesky',
            'real': False
        })
    
    logger.info(f"⚠️  Bluesky (fallback): {len(trends)} termos carregados!")
    return jsonify({
        'success': True,
        'count': len(trends),
        'source': 'bluesky_fallback',
        'timestamp': datetime.now().isoformat(),
        'data': trends
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check"""
    return jsonify({'status': 'ok', 'service': 'Trends Proxy'})

@app.route('/', methods=['GET'])
def index():
    """Info"""
    return jsonify({
        'service': 'Trends Proxy',
        'endpoints': {
            'GET /trends?geo=PT': 'Portugal',
            'GET /trends?geo=BR': 'Brasil',
            'GET /trends?geo=AO': 'Angola',
            'GET /bluesky': 'Bluesky Trending',
        }
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 TRENDS PROXY V2 - Iniciando...")
    print("=" * 60)
    print("📡 http://localhost:5000")
    print("   GET /trends?geo=PT (Portugal)")
    print("   GET /bluesky (Bluesky)")
    print("=" * 60)
    print()
    app.run(host='localhost', port=5000, debug=False)
