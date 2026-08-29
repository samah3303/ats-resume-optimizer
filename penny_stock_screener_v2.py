import sys, os, time, argparse
from datetime import datetime, timedelta
import yfinance as yf
import pandas as pd
import numpy as np

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except: pass

PENNY_STOCK_MAX_PRICE = 20
MIN_WINNER_GAIN_PCT = 30
LOOKBACK_MONTHS = 6
TOP_N_RESULTS = 30
OUTPUT_CSV = 'penny_stock_results_v2.csv'

NSE_PENNY_CANDIDATES = [
    'IDEA', 'MTNL', 'JPPOWER', 'RTNPOWER', 'RPOWER', 'NHPC', 'SJVN', 'GIPCL', 'NESCO',
    'HCC', 'NBCC', 'IRCON', 'HSCL', 'NATIONALUM', 'SAIL', 'NMDC', 'HINDCOPPER', 'MOIL',
    'MMTC', 'COALINDIA', 'ALOKINDS', 'RSWM', 'SPENTEX', 'SURYALAXMI',
    'YESBANK', 'IDFCFIRSTB', 'IFCI', 'IRFC', 'IDBI', 'CENTRALBK', 'UCOBANK', 'INDIANB',
    'MAHABANK', 'BANKINDIA', 'CANBK', 'PSB', 'UNIONBANK', 'PNB', 'SOUTHBANK', 'KARURVYSYA',
    'DCBBANK', 'KTKBANK', 'IOB', 'FEDERALBNK',
    'GTLINFRA', 'HATHWAY', 'DEN', 'ONMOBILE', 'GTPL', 'HFCL', 'ITI', 'STLTECH',
    'NETWORK18', 'DISHTV', 'NDTV', 'ZEEL', 'DBCORP', 'SUNTV',
    'WOCKPHARMA', 'GRANULES', 'SHILPAMED',
    'ASHOKLEY', 'OLECTRA',
    'IBREALEST', 'UNITECH', 'HDIL', 'DLF',
    'FRETAIL', 'PCJEWELLER',
    'GUJALKALI', 'DEEPAKFERT', 'RCF', 'FACT', 'GSFC', 'CHAMBLFERT', 'GNFC',
    'BALRAMCHIN', 'TRIVENI', 'BAJAJHIND', 'EIDPARRY', 'DALMIASUGAR', 'SHREERENUKA',
    'GESHIP', 'JKPAPER', 'TNPL', 'ORIENTPPR', 'ORIENTCEM',
    'MRPL', 'OIL', 'ONGC', 'IOC', 'BPCL', 'GAIL',
    'SUZLON', 'INDOWIND', 'GREENPOWER',
    'BHEL', 'BEL', 'PFC', 'RECLTD', 'HUDCO', 'RVNL', 'IREDA', 'GRSE', 'COCHINSHIP',
    'EASEMYTRIP', 'THOMASCOOK',
    'BSOFT', 'TANLA', 'CYIENT', 'GMDCLTD', 'MSTCLTD', 'TITAGARH',
    'WABAG', 'NELCO', 'RELINFRA', 'RCOM', 'HERITGFOOD', 'KRBL',
    'ORIENTBELL', 'SOLARA', 'CONFIPET', 'SOUTHWEST', 'JETAIRWAYS', 'QUICKHEAL',
    'JAMNAAUTO', 'AUTOAXLES', 'RAILTEL', 'TIINDIA', 'TATAMTRDVR',
    'CLEAN', 'NUCLEUS', 'ALLCARGO', 'UTKARSHBNK',
    'JAYBARMARU', 'TECHNOE', 'NIACL', 'GICRE', 'JINDALSAW', 'BASF',
    'TATACOMM', 'ESAFSFB', 'NETWEB', 'JSWINFRA',
    'SURYAROSNI', 'GRINFRA', 'SPICEJET', 'BOMDYEING',
    'VISAKAIND', 'MANAPPURAM', 'SBIN', 'TATASTEEL',
    'NAVINFLUOR', 'CAPLIPOINT', 'MOLDTKPAC', 'PENIND', 'NKIND', 'GLAND',
]

POSITIVE_WORDS = [
    'surge', 'soar', 'rally', 'gain', 'profit', 'growth', 'revenue', 'expansion',
    'partnership', 'deal', 'order', 'launch', 'bullish', 'upgrade', 'buy', 'strong',
    'positive', 'approved', 'award', 'dividend', 'record', 'high', 'beat', 'exceed',
    'outperform', 'recovery', 'breakout', 'momentum', 'boost', 'optimistic',
    'earnings', 'up', 'rise', 'rising', 'jumped', 'climbed', 'target',
]
NEGATIVE_WORDS = [
    'loss', 'debt', 'fraud', 'scam', 'penalty', 'downgrade', 'sell', 'weak',
    'negative', 'lawsuit', 'default', 'bankrupt', 'restructuring', 'delisted',
    'decline', 'fall', 'crash', 'plunge', 'slash', 'cut', 'warning', 'risk',
    'bearish', 'miss', 'disappoint', 'lower', 'drop', 'slide', 'concern',
    'investigation', 'probe', 'violation', 'suspend', 'fine', 'down',
]

def safe_return(series, idx1, idx2):
    try:
        val1 = series.iloc[idx1]
        val2 = series.iloc[idx2]
        if val1 and val1 > 0:
            return (val2 - val1) / val1 * 100
    except:
        pass
    return 0.0

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def get_nifty_context(ref_date):
    start_date = ref_date - timedelta(days=180)
    end_date = ref_date + timedelta(days=1)
    ticker = yf.Ticker('^NSEI')
    try:
        hist = ticker.history(start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))
        if hist.empty:
            return {'return_6m': 0, 'return_1m': 0, 'trend': 'NEUTRAL', 'above_sma50': False}
        
        closes = hist['Close']
        if len(closes) < 20:
            return {'return_6m': 0, 'return_1m': 0, 'trend': 'NEUTRAL', 'above_sma50': False}
        
        ret_6m = safe_return(closes, 0, -1)
        idx_1m = max(0, len(closes) - 22)
        ret_1m = safe_return(closes, idx_1m, -1)
        
        sma50 = closes.rolling(window=50).mean().iloc[-1] if len(closes) >= 50 else closes.mean()
        above_sma50 = closes.iloc[-1] > sma50
        
        trend = 'BULLISH' if ret_6m > 5 else ('BEARISH' if ret_6m < -5 else 'NEUTRAL')
        
        return {
            'return_6m': ret_6m,
            'return_1m': ret_1m,
            'trend': trend,
            'above_sma50': above_sma50
        }
    except:
        return {'return_6m': 0, 'return_1m': 0, 'trend': 'NEUTRAL', 'above_sma50': False}

def fetch_prices(symbols, ref_date, is_backtest):
    prices = {}
    print(f"Fetching prices for {len(symbols)} stocks...")
    for i, sym in enumerate(symbols):
        if i > 0 and i % 5 == 0:
            time.sleep(0.5)
        sys.stdout.write(f"\rProgress: {i+1}/{len(symbols)}")
        sys.stdout.flush()
        
        try:
            ticker = yf.Ticker(f"{sym}.NS")
            if is_backtest:
                start_dt = ref_date - timedelta(days=10)
                end_dt = ref_date + timedelta(days=1)
                hist = ticker.history(start=start_dt.strftime('%Y-%m-%d'), end=end_dt.strftime('%Y-%m-%d'))
                if not hist.empty:
                    prices[sym] = hist['Close'].iloc[-1]
            else:
                hist = ticker.history(period='5d')
                if not hist.empty:
                    prices[sym] = hist['Close'].iloc[-1]
        except Exception:
            pass
    print("\n[OK] Price fetching completed.")
    return prices

def fetch_ohlcv(symbols, ref_date):
    data = {}
    start_date = ref_date - timedelta(days=180)
    end_date = ref_date + timedelta(days=1)
    print(f"Downloading 6-month historical data for {len(symbols)} penny stocks...")
    for i, sym in enumerate(symbols):
        if i > 0 and i % 5 == 0:
            time.sleep(0.5)
        sys.stdout.write(f"\rProgress: {i+1}/{len(symbols)}")
        sys.stdout.flush()
        
        try:
            ticker = yf.Ticker(f"{sym}.NS")
            hist = ticker.history(start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))
            if not hist.empty:
                data[sym] = hist
        except:
            pass
    print("\n[OK] Historical data downloaded.")
    return data

def fetch_fundamentals(symbols):
    funds = {}
    print(f"Fetching fundamental data for {len(symbols)} penny stocks...")
    for i, sym in enumerate(symbols):
        if i > 0 and i % 5 == 0:
            time.sleep(0.5)
        sys.stdout.write(f"\rProgress: {i+1}/{len(symbols)}")
        sys.stdout.flush()
        
        try:
            ticker = yf.Ticker(f"{sym}.NS")
            info = ticker.info
            if isinstance(info, dict) and len(info) > 0:
                funds[sym] = {
                    'marketCap': info.get('marketCap', 0),
                    'debtToEquity': info.get('debtToEquity', 0),
                    'returnOnEquity': info.get('returnOnEquity', 0),
                    'revenueGrowth': info.get('revenueGrowth', 0),
                    'earningsGrowth': info.get('earningsGrowth', 0),
                    'currentRatio': info.get('currentRatio', 0),
                    'bookValue': info.get('bookValue', 0),
                    'trailingPE': info.get('trailingPE', 0),
                    'forwardPE': info.get('forwardPE', 0),
                    'dividendYield': info.get('dividendYield', 0),
                    'floatShares': info.get('floatShares', 0),
                    'sharesOutstanding': info.get('sharesOutstanding', 0),
                }
            else:
                funds[sym] = {}
        except:
            funds[sym] = {}
    print("\n[OK] Fundamentals fetched.")
    return funds

def fetch_news_sentiment(symbols, is_backtest):
    sentiment = {}
    if is_backtest:
        print("[!] Warning: News sentiment fetched is current, might not reflect backtest date properly.")
    
    print(f"Fetching news sentiment for {len(symbols)} penny stocks...")
    for i, sym in enumerate(symbols):
        if i > 0 and i % 5 == 0:
            time.sleep(0.5)
        sys.stdout.write(f"\rProgress: {i+1}/{len(symbols)}")
        sys.stdout.flush()
        
        try:
            ticker = yf.Ticker(f"{sym}.NS")
            news = ticker.news
            pos_count = 0
            neg_count = 0
            headlines = []
            if news:
                for item in news:
                    title = ""
                    if 'content' in item and 'title' in item['content']:
                        title = item['content']['title']
                    elif 'title' in item:
                        title = item['title']
                    
                    if title:
                        headlines.append(title)
                        words = title.lower().split()
                        pos_count += sum(1 for w in words if w in POSITIVE_WORDS)
                        neg_count += sum(1 for w in words if w in NEGATIVE_WORDS)
            
            total = len(headlines)
            score = 0
            if total > 0:
                score = (pos_count - neg_count) / max(1, pos_count + neg_count)
            
            sentiment[sym] = {
                'news_count': total,
                'sentiment_score': score,
                'top_headlines': headlines[:3],
                'pos_count': pos_count,
                'neg_count': neg_count
            }
        except:
            sentiment[sym] = {'news_count': 0, 'sentiment_score': 0, 'top_headlines': [], 'pos_count': 0, 'neg_count': 0}
            
    print("\n[OK] News sentiment fetched.")
    return sentiment

def calculate_scores(sym, hist, fund, news, market_context, winners_patterns):
    score = 0
    tech_score = 0
    fund_score = 0
    sent_score = 0
    mkt_score = 0
    liq_score = 0
    signals = []
    
    closes = hist['Close']
    volumes = hist['Volume']
    
    # Technicals (Max 80)
    if len(closes) >= 50:
        vol_20d = volumes.iloc[-20:].mean()
        vol_50d = volumes.iloc[-50:].mean()
        if vol_50d > 0 and vol_20d > vol_50d * 1.5:
            tech_score += 20
            signals.append("Vol Surge 20d")
        elif vol_50d > 0 and vol_20d > vol_50d * 1.2:
            tech_score += 10
            
        vol_5d = volumes.iloc[-5:].mean()
        if vol_20d > 0 and vol_5d > vol_20d * 2:
            tech_score += 15
            signals.append("Vol Spike 5d")
            
        rsi = calculate_rsi(closes).iloc[-1]
        if pd.notna(rsi):
            if 30 <= rsi <= 60:
                tech_score += 15
                signals.append("RSI Sweet Spot")
                
        sma20 = closes.rolling(20).mean().iloc[-1]
        sma50 = closes.rolling(50).mean().iloc[-1]
        if closes.iloc[-1] > sma20:
            tech_score += 10
            signals.append("Price > SMA20")
            
        if sma20 > sma50:
            tech_score += 10
            signals.append("Bullish SMA Cross")
            
        period_low = closes.min()
        if closes.iloc[-1] <= period_low * 1.5:
            tech_score += 10
            signals.append("Near Period Low")
            
        # Momentum (Max 20)
        idx_1m = max(0, len(closes) - 22)
        idx_3m = max(0, len(closes) - 66)
        ret_1m = safe_return(closes, idx_1m, -1)
        ret_3m = safe_return(closes, idx_3m, -1)
        
        if 5 <= ret_1m <= 40:
            tech_score += 10
        if ret_3m > 0:
            tech_score += 10
            
    # Fundamentals (Max 50)
    dte = fund.get('debtToEquity')
    if dte is not None and pd.notna(dte):
        if dte < 0.5:
            fund_score += 15
            signals.append("Low Debt")
        elif dte < 1:
            fund_score += 5
        elif dte > 2:
            fund_score -= 10
            
    eg = fund.get('earningsGrowth', 0)
    if eg is not None and pd.notna(eg) and eg > 0:
        fund_score += 10
        signals.append("Pos Earnings Gr")
        
    rg = fund.get('revenueGrowth', 0)
    if rg is not None and pd.notna(rg) and rg > 0:
        fund_score += 10
        
    cr = fund.get('currentRatio')
    if cr is not None and pd.notna(cr) and cr > 1.5:
        fund_score += 5
        
    pe = fund.get('trailingPE')
    if pe is not None and pd.notna(pe):
        if 5 <= pe <= 30:
            fund_score += 5
            signals.append("Reasonable PE")
        elif pe > 100 or pe < 0:
            fund_score -= 5
            
    roe = fund.get('returnOnEquity', 0)
    if roe is not None and pd.notna(roe) and roe > 0:
        fund_score += 5
        
    # Sentiment (Max 30)
    sent_val = news.get('sentiment_score', 0)
    n_count = news.get('news_count', 0)
    
    if sent_val > 0.3:
        sent_score += 15
        signals.append("High Pos Sentiment")
    elif sent_val > 0:
        sent_score += 10
    elif sent_val < -0.3:
        sent_score -= 10
        
    if n_count >= 3:
        sent_score += 5
        
    if news.get('pos_count', 0) > 0:
        sent_score += min(10, news.get('pos_count', 0) * 3)
        
    # Market Context (Max 20)
    if market_context['trend'] == 'BULLISH':
        mkt_score += 10
    elif market_context['trend'] == 'BEARISH':
        mkt_score -= 5
        
    # Liquidity (Max 5)
    avg_vol = volumes.mean() if len(volumes) > 0 else 0
    if avg_vol > 500000:
        liq_score += 5
        
    total_score = tech_score + fund_score + sent_score + mkt_score + liq_score
    
    return {
        'total': total_score,
        'tech': tech_score,
        'fund': fund_score,
        'sent': sent_score,
        'signals': signals
    }

def main():
    start_time = time.time()
    parser = argparse.ArgumentParser(description="Penny Stock Screener V2")
    parser.add_argument('--date', type=str, help='Backtest reference date YYYY-MM-DD')
    args = parser.parse_args()
    
    if args.date:
        try:
            ref_date = datetime.strptime(args.date, '%Y-%m-%d')
            is_backtest = True
            print(f"--- RUNNING IN BACKTEST MODE FOR DATE: {args.date} ---")
        except ValueError:
            print("Invalid date format. Use YYYY-MM-DD.")
            return
    else:
        ref_date = datetime.now()
        is_backtest = False
        print(f"--- RUNNING LIVE MODE FOR DATE: {ref_date.strftime('%Y-%m-%d')} ---")
        
    print("\n[STEP 1 & 2] Fetching prices & filtering penny stocks...")
    prices = fetch_prices(NSE_PENNY_CANDIDATES, ref_date, is_backtest)
    
    penny_stocks = {sym: p for sym, p in prices.items() if 0.5 <= p <= PENNY_STOCK_MAX_PRICE}
    print(f"\nFound {len(penny_stocks)} penny stocks under Rs.{PENNY_STOCK_MAX_PRICE}.")
    
    if not penny_stocks:
        print("No penny stocks found. Exiting.")
        return

    print("\n[STEP 6] Fetching Market Context...")
    mkt_ctx = get_nifty_context(ref_date)
    print(f"Nifty 6M Return: {mkt_ctx['return_6m']:.2f}% | 1M Return: {mkt_ctx['return_1m']:.2f}% | Trend: {mkt_ctx['trend']}")
    
    symbols_to_process = list(penny_stocks.keys())
    
    print("\n[STEP 3] Downloading OHLCV Data...")
    ohlcv_data = fetch_ohlcv(symbols_to_process, ref_date)
    
    print("\n[STEP 4] Fetching Fundamental Data...")
    fundamentals = fetch_fundamentals(symbols_to_process)
    
    print("\n[STEP 5] Fetching News Sentiment...")
    news_data = fetch_news_sentiment(symbols_to_process, is_backtest)
    
    print("\n[STEP 7 & 8 & 9] Scoring Stocks...")
    results = []
    for sym in symbols_to_process:
        if sym not in ohlcv_data: continue
        
        hist = ohlcv_data[sym]
        fund = fundamentals.get(sym, {})
        news = news_data.get(sym, {})
        
        scores = calculate_scores(sym, hist, fund, news, mkt_ctx, {})
        
        results.append({
            'Symbol': sym,
            'Price': round(penny_stocks[sym], 2),
            'Total Score': scores['total'],
            'Tech Score': scores['tech'],
            'Fund Score': scores['fund'],
            'Sent Score': scores['sent'],
            'Signals': ", ".join(scores['signals'][:3])
        })
        
    if not results:
        print("No results to display.")
        return

    results_df = pd.DataFrame(results).sort_values(by='Total Score', ascending=False).head(TOP_N_RESULTS)
    
    print("\n================================================================")
    print("                      TOP PENNY STOCKS                          ")
    print("================================================================")
    print(results_df.to_string(index=False))
    
    # Show fundamental highlights and news for top 5
    top_5 = results_df.head(5)['Symbol'].tolist()
    print("\n================================================================")
    print("               TOP 5 HIGHLIGHTS & HEADLINES                     ")
    print("================================================================")
    for sym in top_5:
        print(f"\n[{sym}] Price: {penny_stocks[sym]:.2f}")
        fund = fundamentals.get(sym, {})
        print(f"Fundamentals: D/E={fund.get('debtToEquity', 'N/A')}, P/E={fund.get('trailingPE', 'N/A')}, ROE={fund.get('returnOnEquity', 'N/A')}")
        news = news_data.get(sym, {})
        print("Recent News:")
        if news.get('top_headlines'):
            for hl in news['top_headlines']:
                print(f"  - {hl}")
        else:
            print("  (No recent news found)")

    try:
        results_df.to_csv(OUTPUT_CSV, index=False)
        print(f"\n[OK] Results saved to {OUTPUT_CSV}")
    except Exception as e:
        print(f"\n[!] Failed to save CSV: {e}")
    
    if is_backtest:
        print("\n[STEP 11] Backtest Validation (checking 6M forward returns)...")
        future_date = ref_date + timedelta(days=180)
        future_prices = fetch_prices(results_df['Symbol'].tolist(), future_date, False)
        
        validations = []
        for _, row in results_df.iterrows():
            sym = row['Symbol']
            price_then = row['Price']
            price_now = future_prices.get(sym, price_then)
            ret = ((price_now - price_then) / price_then) * 100 if price_then > 0 else 0
            verdict = "WIN" if ret > 20 else ("LOSS" if ret < -10 else "FLAT")
            validations.append({
                'Symbol': sym,
                'Price Then': price_then,
                'Price After 6M': round(price_now, 2),
                'Actual Return %': round(ret, 2),
                'Verdict': verdict
            })
            
        val_df = pd.DataFrame(validations)
        print("\n================================================================")
        print("                   BACKTEST VALIDATION                          ")
        print("================================================================")
        print(val_df.to_string(index=False))
        avg_ret = val_df['Actual Return %'].mean()
        
        top5_ret = val_df.head(5)['Actual Return %'].mean()
        bot5_ret = val_df.tail(5)['Actual Return %'].mean() if len(val_df) >= 10 else 0
        
        print(f"\nAverage Overall Pick Return: {avg_ret:.2f}%")
        print(f"Average Top 5 Return: {top5_ret:.2f}%")
        if len(val_df) >= 10:
            print(f"Average Bottom 5 Return: {bot5_ret:.2f}%")
        
    elapsed = time.time() - start_time
    print(f"\nTotal time taken: {elapsed:.2f} seconds.")
    print("Disclaimer: This script is for educational purposes only. Not financial advice.")

if __name__ == "__main__":
    main()
