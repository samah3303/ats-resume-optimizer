import sys, os
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except: pass

import warnings
warnings.filterwarnings('ignore')

import yfinance as yf
import pandas as pd
import numpy as np
import time
import datetime

PENNY_STOCK_MAX_PRICE = 50
MIN_WINNER_GAIN_PCT = 30
LOOKBACK_MONTHS = 6
TOP_N_RESULTS = 10

TEST_DATES = [
    '2026-02-28',
    '2025-08-29',
    '2025-02-28',
    '2024-08-29',
    '2024-02-29',
    '2023-08-29',
    '2023-02-28',
    '2022-08-29',
    '2022-02-28',
    '2021-08-29',
]

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
    'BALRAMCHIN', 'TRIVENI', 'BAJAJHIND', 'EIDPARRY',
    'GESHIP', 'JKPAPER', 'TNPL', 'ORIENTPPR', 'ORIENTCEM',
    'MRPL', 'OIL', 'ONGC', 'IOC', 'BPCL', 'GAIL',
    'SUZLON', 'INDOWIND', 'GREENPOWER',
    'BHEL', 'BEL', 'PFC', 'RECLTD', 'HUDCO', 'RVNL', 'IREDA', 'GRSE', 'COCHINSHIP',
    'EASEMYTRIP', 'THOMASCOOK',
    'BSOFT', 'TANLA', 'CYIENT', 'GMDCLTD', 'MSTCLTD', 'TITAGARH',
    'WABAG', 'NELCO', 'RELINFRA', 'RCOM', 'HERITGFOOD', 'KRBL',
    'ORIENTBELL', 'SOLARA', 'CONFIPET', 'SOUTHWEST', 'JETAIRWAYS', 'QUICKHEAL',
    'JAMNAAUTO', 'AUTOAXLES', 'RAILTEL', 'TIINDIA',
    'CLEAN', 'NUCLEUS', 'ALLCARGO', 'UTKARSHBNK',
    'JAYBARMARU', 'TECHNOE', 'NIACL', 'GICRE', 'JINDALSAW', 'BASF',
    'TATACOMM', 'ESAFSFB', 'NETWEB', 'JSWINFRA',
    'SURYAROSNI', 'GRINFRA', 'BOMDYEING',
    'VISAKAIND', 'MANAPPURAM', 'SBIN', 'TATASTEEL',
    'NAVINFLUOR', 'CAPLIPOINT', 'PENIND', 'NKIND', 'GLAND',
]

def safe_pct(start_val, end_val):
    try:
        if start_val is None or end_val is None: return None
        s = float(start_val)
        e = float(end_val)
        if np.isnan(s) or np.isnan(e) or s <= 0: return None
        return ((e / s) - 1) * 100
    except: return None

def calculate_rsi(prices, period=14):
    prices = prices.dropna()
    if len(prices) < period + 1: return None
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    if loss.iloc[-1] == 0: return 100
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.iloc[-1]

def process():
    start_time = time.time()
    
    print("================================================================")
    print(" PENNY STOCK BATCH BACKTEST - 10 Tests, Rs.50 threshold")
    print("================================================================")
    
    all_data = {}
    all_fundamentals = {}
    
    print("Phase 1: Bulk Data Download")
    for i, symbol in enumerate(NSE_PENNY_CANDIDATES):
        ticker_str = symbol + '.NS'
        try:
            print(f"[{i+1}/{len(NSE_PENNY_CANDIDATES)}] Downloading {symbol}...")
            ticker = yf.Ticker(ticker_str)
            df = ticker.history(start='2020-06-01')
            if not df.empty:
                df.index = pd.to_datetime(df.index, utc=True)
                all_data[symbol] = df
            
            try:
                info = ticker.info
                all_fundamentals[symbol] = {
                    'debtToEquity': info.get('debtToEquity'),
                    'trailingPE': info.get('trailingPE'),
                    'returnOnEquity': info.get('returnOnEquity'),
                    'revenueGrowth': info.get('revenueGrowth'),
                    'earningsGrowth': info.get('earningsGrowth'),
                    'currentRatio': info.get('currentRatio')
                }
            except:
                all_fundamentals[symbol] = {}
                
        except Exception as e:
            print(f"Error downloading {symbol}: {e}")
            
        if (i + 1) % 5 == 0:
            time.sleep(0.3)
            
    print("Downloading Nifty 50 (^NSEI)...")
    try:
        nifty = yf.Ticker('^NSEI')
        nifty_df = nifty.history(start='2020-06-01')
        if not nifty_df.empty:
            nifty_df.index = pd.to_datetime(nifty_df.index, utc=True)
    except:
        nifty_df = pd.DataFrame()
        
    print(f"Data download complete in {time.time() - start_time:.1f} seconds.\n")
    
    test_results = []
    
    print("Phase 2: Running Backtests")
    for idx, t_date_str in enumerate(TEST_DATES):
        print(f"Running Test {idx+1}/{len(TEST_DATES)} for {t_date_str}...")
        test_date = pd.to_datetime(t_date_str).tz_localize('UTC')
        lookback_start = test_date - pd.Timedelta(days=180)
        
        # Calculate Nifty context
        market_trend = "NEUTRAL"
        if not nifty_df.empty:
            nifty_sub = nifty_df.loc[:test_date]
            if len(nifty_sub) > 20:
                nifty_now = nifty_sub.iloc[-1]['Close']
                
                nifty_1m_date = test_date - pd.Timedelta(days=30)
                nifty_1m_sub = nifty_sub.loc[:nifty_1m_date]
                nifty_1m_val = nifty_1m_sub.iloc[-1]['Close'] if len(nifty_1m_sub) > 0 else nifty_now
                
                nifty_6m_date = test_date - pd.Timedelta(days=180)
                nifty_6m_sub = nifty_sub.loc[:nifty_6m_date]
                nifty_6m_val = nifty_6m_sub.iloc[-1]['Close'] if len(nifty_6m_sub) > 0 else nifty_now
                
                ret_6m = safe_pct(nifty_6m_val, nifty_now) or 0
                if ret_6m > 5:
                    market_trend = "BULLISH"
                elif ret_6m < -5:
                    market_trend = "BEARISH"
        
        scored_stocks = []
        penny_count = 0
        winners = []
        
        for symbol, df in all_data.items():
            df_sub = df.loc[:test_date]
            if len(df_sub) < 50:
                continue
                
            current_price = df_sub.iloc[-1]['Close']
            if not (0.50 <= current_price <= PENNY_STOCK_MAX_PRICE):
                continue
                
            penny_count += 1
            
            # Slice lookback
            lookback_df = df_sub.loc[lookback_start:]
            if len(lookback_df) < 10:
                continue
                
            # Check if winner (gained 30%+ from lookback low)
            lb_low = lookback_df['Close'].min()
            lb_high = lookback_df['Close'].max()
            gain_from_low = safe_pct(lb_low, lb_high) or 0
            if gain_from_low >= MIN_WINNER_GAIN_PCT:
                winners.append(symbol)
                
            # Technical calculations
            closes = df_sub['Close']
            volumes = df_sub['Volume']
            
            rsi = calculate_rsi(closes)
            sma20 = closes.rolling(20).mean().iloc[-1] if len(closes) >= 20 else None
            sma50 = closes.rolling(50).mean().iloc[-1] if len(closes) >= 50 else None
            
            vol_20d = volumes.rolling(20).mean().iloc[-1] if len(volumes) >= 20 else 0
            vol_50d = volumes.rolling(50).mean().iloc[-1] if len(volumes) >= 50 else 0
            vol_5d = volumes.rolling(5).mean().iloc[-1] if len(volumes) >= 5 else 0
            
            p_1m = test_date - pd.Timedelta(days=30)
            df_1m = df_sub.loc[:p_1m]
            price_1m_ago = df_1m.iloc[-1]['Close'] if len(df_1m) > 0 else current_price
            ret_1m = safe_pct(price_1m_ago, current_price) or 0
            
            p_3m = test_date - pd.Timedelta(days=90)
            df_3m = df_sub.loc[:p_3m]
            price_3m_ago = df_3m.iloc[-1]['Close'] if len(df_3m) > 0 else current_price
            ret_3m = safe_pct(price_3m_ago, current_price) or 0
            
            score = 0
            
            # Technical scoring
            if vol_50d > 0:
                surge = vol_20d / vol_50d
                if surge > 2: score += 20
                elif surge > 1.5: score += 15
                elif surge > 1.2: score += 10
            
            if vol_20d > 0:
                spike = vol_5d / vol_20d
                if spike > 3: score += 15
                elif spike > 2: score += 10
                elif spike > 1.5: score += 5
                
            if rsi is not None:
                if 30 <= rsi <= 60: score += 15
                elif 60 < rsi <= 70: score += 5
                
            if sma20 is not None and current_price > sma20: score += 10
            if sma20 is not None and sma50 is not None and sma20 > sma50: score += 10
            
            if lb_high > lb_low:
                pos_pct = (current_price - lb_low) / (lb_high - lb_low) * 100
                if 15 <= pos_pct <= 50: score += 10
                
            # Momentum
            if 5 <= ret_1m <= 40: score += 10
            elif ret_1m > 40: score += 5
            
            if ret_3m > 0: score += 10
            
            # Fundamentals
            fund = all_fundamentals.get(symbol, {})
            de = fund.get('debtToEquity')
            if de is not None:
                if de < 0.5: score += 15
                elif de < 1: score += 10
                elif de < 2: score += 5
                else: score -= 10
                
            earn_gr = fund.get('earningsGrowth')
            if earn_gr is not None and earn_gr > 0: score += 10
            
            rev_gr = fund.get('revenueGrowth')
            if rev_gr is not None and rev_gr > 0: score += 10
            
            cr = fund.get('currentRatio')
            if cr is not None and cr > 1.5: score += 5
            
            pe = fund.get('trailingPE')
            if pe is not None:
                if 5 <= pe <= 30: score += 5
                elif pe > 100 or pe < 0: score -= 5
                
            roe = fund.get('returnOnEquity')
            if roe is not None and roe > 0: score += 5
            
            # Market context
            if market_trend == "BULLISH": score += 10
            elif market_trend == "BEARISH": score -= 5
            
            scored_stocks.append({
                'symbol': symbol,
                'score': score,
                'price': current_price
            })
            
        # Rank and Validate
        scored_stocks.sort(key=lambda x: x['score'], reverse=True)
        
        future_date = test_date + pd.Timedelta(days=180)
        
        for item in scored_stocks:
            sym = item['symbol']
            df = all_data[sym]
            df_future = df.loc[test_date:future_date]
            if len(df_future) > 1:
                future_price = df_future.iloc[-1]['Close']
                item['actual_return'] = safe_pct(item['price'], future_price)
            else:
                item['actual_return'] = None
                
        scored_with_returns = [s for s in scored_stocks if s['actual_return'] is not None]
        top5 = scored_with_returns[:5]
        bottom5 = scored_with_returns[-5:] if len(scored_with_returns) >= 5 else []
        
        top5_avg = np.mean([s['actual_return'] for s in top5]) if top5 else 0
        bot5_avg = np.mean([s['actual_return'] for s in bottom5]) if bottom5 else 0
        all_avg = np.mean([s['actual_return'] for s in scored_with_returns]) if scored_with_returns else 0
        
        pos_count = sum(1 for s in scored_with_returns if s['actual_return'] > 0)
        pos_pct = (pos_count / len(scored_with_returns) * 100) if scored_with_returns else 0
        
        test_results.append({
            'test_date': t_date_str,
            'market_trend': market_trend,
            'num_penny_stocks': penny_count,
            'num_winners_found': len(winners),
            'top5': top5,
            'top5_avg_return': top5_avg,
            'bottom5_avg_return': bot5_avg,
            'scoring_edge': top5_avg - bot5_avg,
            'all_avg_return': all_avg,
            'positive_pct': pos_pct
        })

    # Phase 3: Display Comparison
    print("\n================================================================")
    print("  BATCH BACKTEST SUMMARY - 10 Tests, 6-Month Gaps, Rs.50 Threshold")
    print("================================================================")
    print(f"  {'Test Date':<12} {'Market':<8} {'Penny':<7} {'Winners':<9} {'Top5 Avg':<10} {'Bot5 Avg':<10} {'Edge':<8} {'Best Pick (Actual Return)'}")
    print(f"  {'-'*10:<12} {'-'*6:<8} {'-'*5:<7} {'-'*7:<9} {'-'*8:<10} {'-'*8:<10} {'-'*4:<8} {'-'*25}")
    
    top5_returns_all = []
    bot5_returns_all = []
    scoring_edges = []
    top5_pos_count = 0
    top5_total_count = 0
    all_pos_count = 0
    all_total_count = 0
    best_pick = None
    worst_pick = None
    
    freq_map = {}
    csv_rows = []

    for tr in test_results:
        best_in_top5 = max(tr['top5'], key=lambda x: x['actual_return']) if tr['top5'] else None
        best_str = f"{best_in_top5['symbol']} (+{best_in_top5['actual_return']:.1f}%)" if best_in_top5 else "N/A"
        
        print(f"  {tr['test_date']:<12} {tr['market_trend']:<8} {tr['num_penny_stocks']:<7} {tr['num_winners_found']:<9} "
              f"{tr['top5_avg_return']:>+7.1f}%   {tr['bottom5_avg_return']:>+7.1f}%   {tr['scoring_edge']:>+7.1f}%   {best_str}")
        
        top5_returns_all.append(tr['top5_avg_return'])
        bot5_returns_all.append(tr['bottom5_avg_return'])
        scoring_edges.append(tr['scoring_edge'])
        
        for i, stock in enumerate(tr['top5']):
            top5_pos_count += 1 if stock['actual_return'] > 0 else 0
            top5_total_count += 1
            
            if best_pick is None or stock['actual_return'] > best_pick['return']:
                best_pick = {'symbol': stock['symbol'], 'return': stock['actual_return'], 'date': tr['test_date']}
            if worst_pick is None or stock['actual_return'] < worst_pick['return']:
                worst_pick = {'symbol': stock['symbol'], 'return': stock['actual_return'], 'date': tr['test_date']}
                
            sym = stock['symbol']
            if sym not in freq_map:
                freq_map[sym] = {'count': 0, 'scores': [], 'returns': []}
            freq_map[sym]['count'] += 1
            freq_map[sym]['scores'].append(stock['score'])
            freq_map[sym]['returns'].append(stock['actual_return'])
            
            csv_rows.append({
                'test_date': tr['test_date'],
                'market_trend': tr['market_trend'],
                'rank': i + 1,
                'symbol': sym,
                'score': stock['score'],
                'actual_return': stock['actual_return']
            })
            
        all_pos_count += int(tr['num_penny_stocks'] * tr['positive_pct'] / 100)
        all_total_count += tr['num_penny_stocks']

    print("\n================================================================")
    print("  OVERALL STATISTICS (across 10 tests)")
    print("================================================================")
    print(f"  Total test periods:          {len(test_results)}")
    print(f"  Avg Top 5 Return:            {np.mean(top5_returns_all):+.1f}%")
    print(f"  Avg Bottom 5 Return:         {np.mean(bot5_returns_all):+.1f}%")
    print(f"  Avg Scoring Edge:            {np.mean(scoring_edges):+.1f}% pts")
    beats = sum(1 for e in scoring_edges if e > 0)
    print(f"  Tests where Top 5 beat Bot5: {beats}/{len(test_results)} ({(beats/len(test_results)*100):.0f}%)")
    if best_pick:
        print(f"  Best single pick:            {best_pick['symbol']} +{best_pick['return']:.1f}% ({best_pick['date']})")
    if worst_pick:
        print(f"  Worst single pick:           {worst_pick['symbol']} {worst_pick['return']:+.1f}% ({worst_pick['date']})")
    
    print(f"  Avg positive rate (Top 5):   {(top5_pos_count/top5_total_count*100) if top5_total_count else 0:.1f}%")
    print(f"  Avg positive rate (All):     {(all_pos_count/all_total_count*100) if all_total_count else 0:.1f}%")

    print("\n================================================================")
    print("  MOST FREQUENTLY TOP-RANKED STOCKS")
    print("================================================================")
    print(f"  {'SYMBOL':<10} {'Times in Top 5':<16} {'Avg Score':<12} {'Avg Actual Return'}")
    print(f"  {'-'*6:<10} {'-'*14:<16} {'-'*9:<12} {'-'*17}")
    
    freq_list = []
    for sym, data in freq_map.items():
        if data['count'] > 1:
            freq_list.append({
                'symbol': sym,
                'count': data['count'],
                'avg_score': np.mean(data['scores']),
                'avg_return': np.mean(data['returns'])
            })
            
    freq_list.sort(key=lambda x: x['count'], reverse=True)
    for f in freq_list:
        print(f"  {f['symbol']:<10} {f['count']:<16} {f['avg_score']:<12.1f} {f['avg_return']:>+7.1f}%")
        
    df_csv = pd.DataFrame(csv_rows)
    df_csv.to_csv('batch_backtest_results.csv', index=False)
    print("\nSaved detailed results to batch_backtest_results.csv")
    print(f"Total execution time: {(time.time() - start_time)/60:.1f} minutes")

if __name__ == "__main__":
    process()
