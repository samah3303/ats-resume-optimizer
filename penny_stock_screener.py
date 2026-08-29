"""
NSE Penny Stock Screener
========================
Automatically finds NSE penny stocks (under Rs.20) with potential for price
appreciation by learning patterns from recent winners.

Usage:
    python penny_stock_screener.py

Output:
    - Console table with top ranked penny stocks
    - penny_stock_results.csv with full results

DISCLAIMER: This tool is for EDUCATIONAL/RESEARCH purposes only.
It is NOT financial advice. Penny stocks are extremely volatile and risky.
Always do your own due diligence before investing.
"""

import warnings
warnings.filterwarnings("ignore")

import sys
import os

# Fix Windows console encoding for emoji/unicode output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time
import argparse

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

PENNY_STOCK_MAX_PRICE = 20          # Maximum price in Rs to qualify as penny stock
MIN_WINNER_GAIN_PCT = 30            # Minimum % gain to classify as a "winner"
LOOKBACK_MONTHS = 6                 # How many months of history to analyze
TOP_N_RESULTS = 30                  # Number of top candidates to display
BATCH_SIZE = 20                     # Stocks to download per yfinance batch
SLEEP_BETWEEN_BATCHES = 2           # Seconds to wait between batches
OUTPUT_CSV = "penny_stock_results.csv"

# ─────────────────────────────────────────────────────────────────────────────
# COMPREHENSIVE NSE PENNY STOCK UNIVERSE
# ─────────────────────────────────────────────────────────────────────────────
# Large curated list of NSE stocks that are currently or have recently
# traded under Rs.20. The script verifies current prices dynamically.

NSE_PENNY_CANDIDATES = [
    # ── Telecom ──
    "IDEA", "MTNL",

    # ── Power & Energy ──
    "JPPOWER", "RTNPOWER", "RPOWER", "NHPC", "SJVN",
    "GIPCL", "NESCO",

    # ── Infrastructure ──
    "HCC", "NBCC", "IRCON", "HSCL",

    # ── Metals & Mining ──
    "NATIONALUM", "SAIL", "NMDC", "HINDCOPPER", "MOIL",
    "MMTC", "COALINDIA",

    # ── Textiles ──
    "ALOKINDS", "RSWM", "SPENTEX", "SURYALAXMI",

    # ── Banking & Finance ──
    "YESBANK", "IDFCFIRSTB", "IFCI", "IRFC", "IDBI",
    "CENTRALBK", "UCOBANK", "INDIANB", "MAHABANK",
    "BANKINDIA", "CANBK", "PSB", "UNIONBANK", "PNB",
    "SOUTHBANK", "KARURVYSYA", "DCBBANK", "KTKBANK",
    "IOB", "FEDERALBNK",

    # ── IT / Tech / Telecom Infra ──
    "GTLINFRA", "HATHWAY", "DEN", "ONMOBILE", "GTPL",
    "HFCL", "ITI", "STLTECH",

    # ── Media ──
    "NETWORK18", "DISHTV", "NDTV", "ZEEL",
    "DBCORP", "SUNTV",

    # ── Pharma ──
    "WOCKPHARMA", "GRANULES", "SHILPAMED",

    # ── Auto ──
    "ASHOKLEY", "OLECTRA",

    # ── Real Estate ──
    "IBREALEST", "UNITECH", "HDIL", "DLF",

    # ── Retail / Consumer ──
    "FRETAIL", "PCJEWELLER",

    # ── Chemicals & Fertilizers ──
    "GUJALKALI", "DEEPAKFERT", "RCF", "FACT", "GSFC",
    "CHAMBLFERT", "GNFC",

    # ── Sugar ──
    "BALRAMCHIN", "TRIVENI", "BAJAJHIND", "EIDPARRY",
    "DALMIASUGAR", "SHREERENUKA",

    # ── Shipping ──
    "GESHIP",

    # ── Paper ──
    "JKPAPER", "TNPL", "ORIENTPPR",

    # ── Cement ──
    "ORIENTCEM",

    # ── Oil & Gas ──
    "MRPL", "OIL", "ONGC", "IOC", "BPCL", "GAIL",

    # ── Renewable / Wind ──
    "SUZLON", "INDOWIND", "GREENPOWER",

    # ── Defence / PSU ──
    "BHEL", "BEL", "PFC", "RECLTD", "HUDCO",
    "RVNL", "IREDA", "GRSE", "COCHINSHIP",

    # ── Travel ──
    "EASEMYTRIP", "THOMASCOOK",

    # ── Misc Small / Micro Caps ──
    "BSOFT", "TANLA", "CYIENT",
    "GMDCLTD", "MSTCLTD", "TITAGARH",
    "WABAG", "NELCO",
    "RELINFRA", "RCOM",
    "HERITGFOOD", "KRBL",
    "ORIENTBELL", "SOLARA",
    "CONFIPET", "SOUTHWEST",
    "JETAIRWAYS", "QUICKHEAL",
    "JAMNAAUTO", "AUTOAXLES",
    "RAILTEL", "TIINDIA", "TATAMTRDVR",
    "CLEAN", "NUCLEUS",
    "ALLCARGO", "UTKARSHBNK",

    # ── Commonly cited penny stocks ──
    "JAYBARMARU", "TECHNOE",
    "NIACL", "GICRE",
    "JINDALSAW", "BASF",
    "INFIBEAM", "TATACOMM",
    "TATASTLLP", "ESAFSFB",
    "NETWEB", "JSWINFRA",
    "NBFCSBK", "SURYAROSNI",
    "GRINFRA", "GTLINFRA",
    "SPICEJET", "BOMDYEING",
    "VISAKAIND", "MANAPPURAM",
    "SBIN", "TATASTEEL",

    # ── Recently added / IPO penny stocks ──
    "NAVINFLUOR", "CAPLIPOINT",
    "MOLDTKPAC", "AGRIRBR",
    "LGBBROSTEL", "PENIND",
    "NKIND", "GLAND",
]


def print_header(ref_date, is_backtest=False):
    """Print the tool header."""
    print("\n" + "=" * 70)
    print("  NSE PENNY STOCK SCREENER")
    if is_backtest:
        print("  ** BACKTEST MODE ** — Simulating as if today = {}".format(ref_date.strftime('%Y-%m-%d')))
    print("  Analyzing stocks under Rs.{} on NSE".format(PENNY_STOCK_MAX_PRICE))
    print("=" * 70)
    print(f"  Ref Date  : {ref_date.strftime('%Y-%m-%d')}")
    print(f"  Lookback  : {LOOKBACK_MONTHS} months")
    print(f"  Min Gain  : {MIN_WINNER_GAIN_PCT}% (to classify as winner)")
    if is_backtest:
        future_date = ref_date + timedelta(days=LOOKBACK_MONTHS * 30)
        print(f"  Validate  : Checking actual results up to {future_date.strftime('%Y-%m-%d')}")
    print("=" * 70 + "\n")


def download_single_stock(symbol, period="5d"):
    """Download data for a single stock. Returns DataFrame or None."""
    try:
        ticker = yf.Ticker(symbol + ".NS")
        df = ticker.history(period=period)
        if df is not None and not df.empty and len(df) >= 1:
            return df
    except Exception:
        pass
    return None


def fetch_current_prices(symbols, ref_date=None):
    """
    Fetch prices for all symbols using yfinance.
    If ref_date is provided, fetches the closing price on that date.
    Returns a dict of {symbol: price}.
    """
    is_backtest = ref_date is not None
    date_label = ref_date.strftime('%Y-%m-%d') if is_backtest else "today"
    print(f"[Step 1] Fetching prices as of {date_label} for {len(symbols)} candidate stocks...")
    print(f"         (This will take a few minutes)\n")

    prices = {}
    total = len(symbols)

    for idx, symbol in enumerate(symbols, 1):
        sys.stdout.write(f"\r   [{idx}/{total}] Checking {symbol:<20s}")
        sys.stdout.flush()

        try:
            ticker = yf.Ticker(symbol + ".NS")

            if is_backtest:
                # Fetch a window around the ref_date to find the closest trading day
                start = ref_date - timedelta(days=10)
                end = ref_date + timedelta(days=1)
                hist = ticker.history(start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"))
            else:
                hist = ticker.history(period="5d")

            if hist is not None and not hist.empty and "Close" in hist.columns:
                last_price = float(hist["Close"].dropna().iloc[-1])
                if last_price > 0:
                    prices[symbol] = last_price
        except Exception:
            pass

        if idx % 10 == 0:
            time.sleep(1)

    print(f"\n\n   [OK] Got prices for {len(prices)} stocks\n")
    return prices


def filter_penny_stocks(prices):
    """Filter stocks trading under the penny stock threshold."""
    print(f"[Step 2] Filtering stocks under Rs.{PENNY_STOCK_MAX_PRICE}...")

    penny_stocks = {
        symbol: price
        for symbol, price in prices.items()
        if 0.5 <= price <= PENNY_STOCK_MAX_PRICE  # Exclude sub-Rs.0.50 (likely suspended)
    }

    print(f"   [OK] Found {len(penny_stocks)} penny stocks under Rs.{PENNY_STOCK_MAX_PRICE}\n")

    if penny_stocks:
        sorted_pennies = sorted(penny_stocks.items(), key=lambda x: x[1])
        print(f"   {'Symbol':<20s} {'Price':>10s}")
        print(f"   {'=' * 20} {'=' * 10}")
        for sym, price in sorted_pennies:
            print(f"   {sym:<20s} Rs.{price:.2f}")
        print()

    return penny_stocks


def download_historical_data(symbols, ref_date=None):
    """
    Download 6-month historical OHLCV data for all stocks individually.
    Uses ref_date as the end date if provided, otherwise uses today.
    Returns a dict of {symbol: DataFrame}.
    """
    end_date = ref_date if ref_date else datetime.now()
    start_date = end_date - timedelta(days=LOOKBACK_MONTHS * 30)

    print(f"[Step 3] Downloading historical data ({start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')})...")

    history = {}
    total = len(symbols)

    for idx, symbol in enumerate(symbols, 1):
        sys.stdout.write(f"\r   [{idx}/{total}] Downloading {symbol:<20s}")
        sys.stdout.flush()

        try:
            ticker = yf.Ticker(symbol + ".NS")
            df = ticker.history(
                start=start_date.strftime("%Y-%m-%d"),
                end=end_date.strftime("%Y-%m-%d"),
            )

            if df is not None and not df.empty and len(df) >= 20:
                # Ensure we have the columns we need
                required_cols = ["Open", "High", "Low", "Close", "Volume"]
                if all(col in df.columns for col in required_cols):
                    history[symbol] = df[required_cols].copy()
        except Exception:
            pass

        if idx % 10 == 0:
            time.sleep(1)

    print(f"\n\n   [OK] Got historical data for {len(history)} stocks\n")
    return history


def compute_technical_indicators(df):
    """
    Compute technical indicators for a stock's historical data.
    Returns a dict of indicator values.
    """
    if df is None or len(df) < 20:
        return None

    try:
        # Drop rows with NaN in Close before computing
        df_clean = df.dropna(subset=["Close"])
        if len(df_clean) < 20:
            return None

        close = df_clean["Close"].values.astype(float).flatten()
        volume = df_clean["Volume"].fillna(0).values.astype(float).flatten()
        high = df_clean["High"].fillna(df_clean["Close"]).values.astype(float).flatten()
        low = df_clean["Low"].fillna(df_clean["Close"]).values.astype(float).flatten()

        # Sanity check
        if len(close) < 20 or close[-1] <= 0:
            return None

        def safe_return(end_val, start_val):
            """Compute % return safely, avoiding division by zero/NaN."""
            if start_val is None or np.isnan(start_val) or start_val <= 0:
                return 0.0
            if end_val is None or np.isnan(end_val):
                return 0.0
            return ((end_val / start_val) - 1) * 100

        indicators = {}

        # --- Price Momentum ---
        indicators["return_1m"] = safe_return(close[-1], close[-20]) if len(close) >= 20 else 0
        indicators["return_3m"] = safe_return(close[-1], close[-60]) if len(close) >= 60 else indicators["return_1m"]
        indicators["return_full"] = safe_return(close[-1], close[0])

        # --- Moving Averages ---
        sma_20 = np.mean(close[-20:])
        sma_50 = np.mean(close[-50:]) if len(close) >= 50 else sma_20

        indicators["sma_20"] = sma_20
        indicators["sma_50"] = sma_50
        indicators["price_vs_sma20"] = ((close[-1] / sma_20) - 1) * 100 if sma_20 > 0 else 0
        indicators["price_vs_sma50"] = ((close[-1] / sma_50) - 1) * 100 if sma_50 > 0 else 0
        indicators["sma_crossover"] = 1 if sma_20 > sma_50 else 0

        # --- Volume Analysis ---
        avg_volume_20 = np.mean(volume[-20:])
        avg_volume_50 = np.mean(volume[-50:]) if len(volume) >= 50 else avg_volume_20

        indicators["volume_surge"] = (avg_volume_20 / avg_volume_50) if avg_volume_50 > 0 else 1
        indicators["avg_volume"] = avg_volume_20

        recent_vol = np.mean(volume[-5:]) if len(volume) >= 5 else volume[-1]
        indicators["recent_vol_spike"] = (recent_vol / avg_volume_20) if avg_volume_20 > 0 else 1

        # --- Volatility ---
        if len(close) >= 21:
            daily_returns = np.diff(close[-21:]) / close[-21:-1]
            indicators["volatility_20d"] = np.std(daily_returns) * 100
        else:
            indicators["volatility_20d"] = 0

        # --- Price Position ---
        period_high = np.max(high)
        period_low = np.min(low)
        price_range = period_high - period_low

        indicators["pct_from_low"] = ((close[-1] - period_low) / period_low * 100) if period_low > 0 else 0
        indicators["pct_from_high"] = ((period_high - close[-1]) / period_high * 100) if period_high > 0 else 0
        indicators["price_position"] = ((close[-1] - period_low) / price_range) if price_range > 0 else 0.5

        # --- RSI (14-period) ---
        if len(close) >= 15:
            deltas = np.diff(close[-15:])
            gains = np.where(deltas > 0, deltas, 0)
            losses = np.where(deltas < 0, -deltas, 0)
            avg_gain = np.mean(gains)
            avg_loss = np.mean(losses)
            rs = avg_gain / avg_loss if avg_loss > 0 else 100
            indicators["rsi_14"] = 100 - (100 / (1 + rs))
        else:
            indicators["rsi_14"] = 50

        # --- Trend Consistency ---
        if len(close) >= 20:
            up_days = np.sum(np.diff(close[-20:]) > 0)
            indicators["up_day_ratio"] = up_days / 19
        else:
            indicators["up_day_ratio"] = 0.5

        indicators["current_price"] = float(close[-1])

        return indicators

    except Exception as e:
        return None


def identify_winners(history):
    """
    Identify stocks that gained >= MIN_WINNER_GAIN_PCT in the lookback period.
    Returns list of (symbol, gain%) tuples.
    """
    print(f"[Step 4] Identifying winners (stocks that gained {MIN_WINNER_GAIN_PCT}%+ in {LOOKBACK_MONTHS} months)...")

    winners = []
    for symbol, df in history.items():
        try:
            close = df["Close"].values.astype(float).flatten()
            if len(close) < 20:
                continue

            start_price = close[0]
            end_price = close[-1]

            if start_price > 0:
                gain = ((end_price / start_price) - 1) * 100
                if gain >= MIN_WINNER_GAIN_PCT:
                    winners.append((symbol, gain))
        except Exception:
            continue

    winners.sort(key=lambda x: x[1], reverse=True)

    if winners:
        print(f"   [OK] Found {len(winners)} winners:\n")
        print(f"   {'Symbol':<20s} {'Gain':>10s}")
        print(f"   {'=' * 20} {'=' * 10}")
        for sym, gain in winners:
            print(f"   {sym:<20s} {gain:>+9.1f}%")
        print()
    else:
        print("   [!] No winners found with {}%+ gain. Will score based on technical signals only.\n".format(MIN_WINNER_GAIN_PCT))

    return winners


def extract_winner_patterns(winners, history):
    """
    Extract the technical indicator patterns that winners showed at the
    START of their rally (first 40 days of the period).
    """
    print("[Step 5] Extracting patterns from winners...")

    if not winners:
        print("   [!] No winners to analyze. Scoring will use standalone technical signals.\n")
        return None

    all_indicators = []

    for symbol, gain in winners:
        if symbol not in history:
            continue

        df = history[symbol]
        early_df = df.iloc[:min(40, len(df) // 3)]
        indicators = compute_technical_indicators(early_df)

        if indicators:
            all_indicators.append(indicators)

    if not all_indicators:
        print("   [!] Could not extract patterns from winners.\n")
        return None

    profile = {}
    keys = all_indicators[0].keys()
    for key in keys:
        values = [ind[key] for ind in all_indicators if key in ind and ind[key] is not None]
        if values:
            profile[key] = np.mean(values)

    print(f"   [OK] Analyzed {len(all_indicators)} winner profiles\n")
    print("   Average Winner Pattern (at start of rally):")
    print(f"      RSI:              {profile.get('rsi_14', 0):.1f}")
    print(f"      Volume Surge:     {profile.get('volume_surge', 0):.2f}x")
    print(f"      Price vs SMA20:   {profile.get('price_vs_sma20', 0):+.1f}%")
    print(f"      Price vs SMA50:   {profile.get('price_vs_sma50', 0):+.1f}%")
    print(f"      %% from Low:      {profile.get('pct_from_low', 0):.1f}%")
    print(f"      Up-day Ratio:     {profile.get('up_day_ratio', 0):.2f}")
    print(f"      Volatility (20d): {profile.get('volatility_20d', 0):.2f}%")
    print()

    return profile


def score_stocks(history, penny_stocks, winner_profile, winners_list):
    """
    Score all current penny stocks by comparing their current indicators
    to the winner profile. Returns a sorted list of candidates.
    """
    print("[Step 6] Scoring current penny stocks...")

    winner_symbols = {w[0] for w in winners_list} if winners_list else set()
    candidates = []
    skipped = 0

    for symbol, current_price in penny_stocks.items():
        if symbol not in history:
            skipped += 1
            continue

        df = history[symbol]
        indicators = compute_technical_indicators(df)

        if indicators is None:
            skipped += 1
            continue

        # ─── Compute Score (max ~110 points) ───
        score = 0
        reasons = []

        # 1. Volume surge (higher = accumulation) — max 20 pts
        vol_surge = indicators.get("volume_surge", 1)
        if vol_surge > 1.2:
            s = min(20, (vol_surge - 1) * 20)
            score += s
            reasons.append(f"Vol surge {vol_surge:.1f}x")

        # 2. Recent volume spike — max 15 pts
        recent_spike = indicators.get("recent_vol_spike", 1)
        if recent_spike > 1.3:
            s = min(15, (recent_spike - 1) * 15)
            score += s
            reasons.append(f"Vol spike {recent_spike:.1f}x")

        # 3. RSI sweet spot (30-60) — max 15 pts
        rsi = indicators.get("rsi_14", 50)
        if 30 <= rsi <= 60:
            score += 15
            reasons.append(f"RSI {rsi:.0f}")
        elif 25 <= rsi < 30:
            score += 12
            reasons.append(f"RSI {rsi:.0f} (oversold)")
        elif 60 < rsi <= 70:
            score += 5
        elif rsi > 70:
            score -= 5

        # 4. Price above SMA20 — max 10 pts
        price_vs_sma20 = indicators.get("price_vs_sma20", 0)
        if 0 < price_vs_sma20 <= 15:
            score += 10
            reasons.append("Above SMA20")
        elif price_vs_sma20 > 15:
            score += 5

        # 5. Bullish SMA crossover (20 > 50) — 10 pts
        if indicators.get("sma_crossover", 0) == 1:
            score += 10
            reasons.append("SMA cross")

        # 6. Price near lows (room to run) — max 10 pts
        price_pos = indicators.get("price_position", 0.5)
        if 0.15 <= price_pos <= 0.50:
            score += 10
            reasons.append(f"Near lows ({price_pos:.0%})")
        elif price_pos < 0.15:
            score += 5

        # 7. Positive short-term momentum — max 10 pts
        ret_1m = indicators.get("return_1m", 0)
        if 5 <= ret_1m <= 40:
            score += 10
            reasons.append(f"1M: {ret_1m:+.0f}%")
        elif 0 < ret_1m < 5:
            score += 5

        # 8. Liquidity — 5 pts
        avg_vol = indicators.get("avg_volume", 0)
        if avg_vol >= 500000:
            score += 5
            reasons.append("High liquidity")
        elif avg_vol >= 100000:
            score += 3

        # 9. Moderate volatility — 5 pts
        volatility = indicators.get("volatility_20d", 0)
        if 1 <= volatility <= 5:
            score += 5

        # 10. Winner pattern similarity — max 10 pts
        if winner_profile:
            similarity = 0
            comparisons = 0
            for key in ["rsi_14", "volume_surge", "price_vs_sma20", "price_position", "up_day_ratio"]:
                if key in indicators and key in winner_profile and winner_profile[key] != 0:
                    diff_pct = abs(indicators[key] - winner_profile[key]) / max(abs(winner_profile[key]), 0.01)
                    similarity += max(0, 1 - diff_pct)
                    comparisons += 1
            if comparisons > 0:
                score += (similarity / comparisons) * 10

        is_winner = symbol in winner_symbols

        candidates.append({
            "Symbol": symbol,
            "Price": round(current_price, 2),
            "Score": round(score, 1),
            "RSI": round(rsi, 1),
            "Vol_Surge": round(vol_surge, 2),
            "1M_Return": round(ret_1m, 1),
            "3M_Return": round(indicators.get("return_3m", 0), 1),
            "Full_Return": round(indicators.get("return_full", 0), 1),
            "Price_Position": round(price_pos, 2),
            "SMA_Cross": "YES" if indicators.get("sma_crossover", 0) else "no",
            "Avg_Volume": int(avg_vol),
            "Reasons": " | ".join(reasons[:4]),
            "Already_Winner": "*" if is_winner else "",
        })

    candidates.sort(key=lambda x: x["Score"], reverse=True)

    print(f"   [OK] Scored {len(candidates)} stocks (skipped {skipped})\n")
    return candidates


def display_results(candidates):
    """Display the top candidates in a formatted table."""
    print("\n" + "=" * 100)
    print("  TOP PENNY STOCK CANDIDATES - Ranked by Pattern Score")
    print("=" * 100)

    if not candidates:
        print("\n  No candidates found.\n")
        return

    top = candidates[:TOP_N_RESULTS]

    print(f"\n  {'#':<4} {'Symbol':<14} {'Price':>8} {'Score':>7} {'RSI':>6} "
          f"{'VolSrg':>7} {'1M Ret':>8} {'3M Ret':>8} {'SMA':>5}  {'Key Signals'}")
    print(f"  {'---':<4} {'----------':<14} {'------':>8} {'-----':>7} {'---':>6} "
          f"{'-----':>7} {'------':>8} {'------':>8} {'---':>5}  {'----------'}")

    for i, c in enumerate(top, 1):
        w = c["Already_Winner"]
        print(f"  {i:<4} {c['Symbol']:<14} Rs.{c['Price']:>5.2f} {c['Score']:>6.1f} "
              f"{c['RSI']:>5.1f} {c['Vol_Surge']:>6.2f}x {c['1M_Return']:>+7.1f}% "
              f"{c['3M_Return']:>+7.1f}% {c['SMA_Cross']:>5}  {c['Reasons'][:40]} {w}")

    print(f"\n  {'=' * 100}")
    print(f"  * = Stock was also a past winner (gained {MIN_WINNER_GAIN_PCT}%+ in last {LOOKBACK_MONTHS} months)")

    print(f"""
  SCORING BREAKDOWN (max ~110 points):
  ────────────────────────────────────
     Volume Surge:          up to 20 pts   (20d avg vol > 50d avg = accumulation)
     Recent Vol Spike:      up to 15 pts   (5d vol vs 20d avg = sudden interest)
     RSI Sweet Spot:        up to 15 pts   (30-60 = not overbought, not dead)
     Price > SMA20:         up to 10 pts   (early uptrend signal)
     Bullish SMA Cross:          10 pts    (20-day MA > 50-day MA)
     Near Period Lows:      up to 10 pts   (15-50% of range = room to run)
     Short-term Momentum:   up to 10 pts   (positive 1-month return, not extreme)
     Winner Similarity:     up to 10 pts   (matches past winner profile)
     Liquidity:                   5 pts    (avg volume > 5 lakh)
     Moderate Volatility:         5 pts    (controlled daily swings)
    """)


def save_results(candidates):
    """Save full results to CSV."""
    if not candidates:
        return

    df = pd.DataFrame(candidates)
    df.to_csv(OUTPUT_CSV, index=False)
    full_path = os.path.abspath(OUTPUT_CSV)
    print(f"  [SAVED] Full results: {full_path}\n")


def fetch_future_returns(symbols, ref_date):
    """
    For backtesting: fetch what actually happened to each stock
    in the 6 months AFTER the ref_date.
    Returns a dict of {symbol: {price_then, price_now, actual_return}}.
    """
    future_end = ref_date + timedelta(days=LOOKBACK_MONTHS * 30)
    # Cap at today if future_end is in the future
    today = datetime.now()
    if future_end > today:
        future_end = today

    print(f"[Step 7] BACKTEST VALIDATION: Fetching actual prices from {ref_date.strftime('%Y-%m-%d')} to {future_end.strftime('%Y-%m-%d')}...")

    results = {}
    total = len(symbols)

    for idx, symbol in enumerate(symbols, 1):
        sys.stdout.write(f"\r   [{idx}/{total}] Validating {symbol:<20s}")
        sys.stdout.flush()

        try:
            ticker = yf.Ticker(symbol + ".NS")
            df = ticker.history(
                start=ref_date.strftime("%Y-%m-%d"),
                end=future_end.strftime("%Y-%m-%d"),
            )

            if df is not None and not df.empty and "Close" in df.columns:
                close = df["Close"].dropna()
                if len(close) >= 2:
                    price_start = float(close.iloc[0])
                    price_end = float(close.iloc[-1])
                    if price_start > 0:
                        actual_return = ((price_end / price_start) - 1) * 100
                        results[symbol] = {
                            "price_start": round(price_start, 2),
                            "price_end": round(price_end, 2),
                            "actual_return": round(actual_return, 1),
                        }
        except Exception:
            pass

        if idx % 10 == 0:
            time.sleep(1)

    print(f"\n\n   [OK] Got future data for {len(results)} stocks\n")
    return results


def display_backtest_results(candidates, future_returns, ref_date):
    """Display backtest results with actual returns for validation."""
    future_end = ref_date + timedelta(days=LOOKBACK_MONTHS * 30)
    today = datetime.now()
    if future_end > today:
        future_end = today

    print("\n" + "=" * 115)
    print("  BACKTEST RESULTS — Did the scoring predict correctly?")
    print(f"  Scored on: {ref_date.strftime('%Y-%m-%d')}  |  Actual results by: {future_end.strftime('%Y-%m-%d')}")
    print("=" * 115)

    if not candidates:
        print("\n  No candidates to validate.\n")
        return

    top = candidates[:TOP_N_RESULTS]

    print(f"\n  {'#':<4} {'Symbol':<14} {'Price Then':>10} {'Score':>7} "
          f"{'Price Now':>10} {'ACTUAL':>9} {'Verdict':>10}  {'Key Signals'}")
    print(f"  {'---':<4} {'----------':<14} {'--------':>10} {'-----':>7} "
          f"{'--------':>10} {'------':>9} {'-------':>10}  {'----------'}")

    correct_predictions = 0
    total_scored = 0

    for i, c in enumerate(top, 1):
        symbol = c["Symbol"]
        future = future_returns.get(symbol, {})

        if future:
            price_end = future["price_end"]
            actual_ret = future["actual_return"]
            total_scored += 1

            if actual_ret >= 20:
                verdict = "++ WIN"
                correct_predictions += 1
            elif actual_ret >= 0:
                verdict = "+ ok"
                correct_predictions += 1
            elif actual_ret >= -10:
                verdict = "~ flat"
            else:
                verdict = "- LOSS"

            print(f"  {i:<4} {symbol:<14} Rs.{c['Price']:>6.2f} {c['Score']:>6.1f} "
                  f"Rs.{price_end:>6.2f} {actual_ret:>+8.1f}% {verdict:>10}  {c['Reasons'][:35]}")
        else:
            print(f"  {i:<4} {symbol:<14} Rs.{c['Price']:>6.2f} {c['Score']:>6.1f} "
                  f"{'N/A':>10} {'N/A':>9} {'N/A':>10}  {c['Reasons'][:35]}")

    print(f"\n  {'=' * 115}")

    if total_scored > 0:
        accuracy = (correct_predictions / total_scored) * 100
        print(f"\n  BACKTEST SUMMARY:")
        print(f"  ─────────────────")
        print(f"  Stocks scored:       {total_scored}")
        print(f"  Positive returns:    {correct_predictions} ({accuracy:.0f}%)")
        print(f"  Negative returns:    {total_scored - correct_predictions} ({100 - accuracy:.0f}%)")

        # Calculate average return of top 5 vs bottom 5
        top5_returns = []
        bottom5_returns = []
        for i, c in enumerate(top):
            symbol = c["Symbol"]
            if symbol in future_returns:
                ret = future_returns[symbol]["actual_return"]
                if i < 5:
                    top5_returns.append(ret)
                if i >= len(top) - 5:
                    bottom5_returns.append(ret)

        if top5_returns:
            print(f"\n  Avg return (Top 5 scored):    {np.mean(top5_returns):+.1f}%")
        if bottom5_returns:
            print(f"  Avg return (Bottom 5 scored): {np.mean(bottom5_returns):+.1f}%")
        if top5_returns and bottom5_returns:
            edge = np.mean(top5_returns) - np.mean(bottom5_returns)
            print(f"  Scoring Edge (Top5 - Bot5):   {edge:+.1f}% pts")
    print()


def main():
    """Main execution flow."""
    # Parse arguments
    parser = argparse.ArgumentParser(description="NSE Penny Stock Screener")
    parser.add_argument(
        "--date",
        type=str,
        default=None,
        help="Reference date for backtesting (format: YYYY-MM-DD). Example: --date 2025-08-29"
    )
    args = parser.parse_args()

    # Determine reference date
    if args.date:
        try:
            ref_date = datetime.strptime(args.date, "%Y-%m-%d")
            is_backtest = True
        except ValueError:
            print(f"[ERROR] Invalid date format: {args.date}. Use YYYY-MM-DD.")
            return
    else:
        ref_date = datetime.now()
        is_backtest = False

    start_time = time.time()

    print_header(ref_date, is_backtest)

    # Step 1: Fetch prices as of ref_date
    prices = fetch_current_prices(NSE_PENNY_CANDIDATES, ref_date=ref_date if is_backtest else None)

    if not prices:
        print("[ERROR] Could not fetch any stock prices. Check your internet connection.")
        return

    # Step 2: Filter penny stocks
    penny_stocks = filter_penny_stocks(prices)

    if not penny_stocks:
        print("[ERROR] No penny stocks found under Rs.{}. Try increasing the threshold.".format(PENNY_STOCK_MAX_PRICE))
        return

    # Step 3: Download historical data (lookback from ref_date)
    penny_symbols = list(penny_stocks.keys())
    history = download_historical_data(penny_symbols, ref_date=ref_date if is_backtest else None)

    if not history:
        print("[ERROR] Could not download historical data.")
        return

    # Step 4: Identify winners
    winners = identify_winners(history)

    # Step 5: Extract winner patterns
    winner_profile = extract_winner_patterns(winners, history)

    # Step 6: Score and rank all penny stocks
    candidates = score_stocks(history, penny_stocks, winner_profile, winners)

    # Step 7: Display results
    if is_backtest:
        # Also show the regular results table
        display_results(candidates)
        # Fetch what actually happened and show validation
        future_returns = fetch_future_returns(penny_symbols, ref_date)
        display_backtest_results(candidates, future_returns, ref_date)
    else:
        display_results(candidates)

    # Save
    save_results(candidates)

    elapsed = time.time() - start_time
    print(f"  Completed in {elapsed:.0f} seconds.")
    print()
    print("  !! DISCLAIMER: This is for EDUCATIONAL purposes only. NOT financial advice. !!")
    print("  !! Penny stocks are extremely risky. Always do your own research.           !!")
    print()


if __name__ == "__main__":
    main()
