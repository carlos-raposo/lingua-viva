# Entrypoint for Vercel
# Imports the Flask app from trends_proxy_v2.py

from trends_proxy_v2 import app

if __name__ == '__main__':
    app.run()
