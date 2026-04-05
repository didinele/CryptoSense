import yfinance as yf
import psycopg2
import time

# Configurația conexiunii (aceleași date din application.properties)
#
DB_CONFIG = {
    "host": "localhost",
    "database": "stock_portfolio",
    "user": "liviu", #
    "password": "parola_secreta",
    "port": "5432"
}

def update_market_prices():
    try:
        # 1. Conectare la baza de date din Docker
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # 2. Luăm toate ticker-ele unice din tabelul assets
        cur.execute("SELECT DISTINCT ticker FROM assets")
        tickers = [row[0] for row in cur.fetchall()]

        if not tickers:
            print("Niciun activ găsit în baza de date.")
            return

        print(f"Actualizez prețurile pentru: {tickers}")

        # 3. Luăm prețurile reale de pe Yahoo Finance
        for ticker in tickers:
            # yfinance folosește formatul "BTC-USD" pentru crypto
            yf_ticker = f"{ticker}-USD" if ticker == "BTC" else ticker
            data = yf.Ticker(yf_ticker)
            current_price = data.fast_info['last_price']

            print(f"Preț actual {ticker}: {current_price:.2f} USD")

            # Aici am putea salva prețul într-un tabel de ISTORIC pentru grafice
            # Momentan doar îl afișăm în consolă

        cur.close()
        conn.close()

    except Exception as e:
        print(f"Eroare: {e}")

# Rulează scanarea la fiecare 30 de secunde
while True:
    update_market_prices()
    time.sleep(30)