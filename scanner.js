// ─── STRATEGY SIGNAL ENGINE ───────────────────────────────────────────────
// Implements the pullback swing trade strategy:
// Trend + Pullback to EMA + RSI + Volume Dry-up + Candle Pattern

function calcEMA(closes, period) {
  if (closes.length < period) return null;
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcSMA(closes, period) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  const changes = closes.slice(-period - 1).map((c, i, arr) => i > 0 ? c - arr[i - 1] : 0).slice(1);
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);
  const avgGain = gains.reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function detectCandle(quotes) {
  if (quotes.length < 2) return { pattern: "None", bullish: false };
  const today = quotes[quotes.length - 1];
  const prev = quotes[quotes.length - 2];
  const { open: o, high: h, low: l, close: c } = today;
  const body = Math.abs(c - o);
  const range = h - l;
  const upperWick = h - Math.max(o, c);
  const lowerWick = Math.min(o, c) - l;

  // Hammer: small body, long lower wick (>2x body), at bottom
  if (lowerWick > body * 2 && upperWick < body * 0.5 && c > o) {
    return { pattern: "Hammer", bullish: true };
  }
  // Bullish Engulfing: today's body engulfs yesterday's body
  if (c > o && prev.close < prev.open && c > prev.open && o < prev.close) {
    return { pattern: "Bullish Engulfing", bullish: true };
  }
  // Doji: very small body relative to range
  if (range > 0 && body / range < 0.1) {
    return { pattern: "Doji", bullish: true }; // neutral but counts near support
  }
  // Bullish Marubozu: strong green candle, small wicks
  if (c > o && body / range > 0.8) {
    return { pattern: "Strong Bull Bar", bullish: true };
  }
  // Morning Star approximation: prev red, today green gap
  if (c > o && prev.close < prev.open && o < prev.close) {
    return { pattern: "Morning Star", bullish: true };
  }
  return { pattern: c > o ? "Green Bar" : "Red Bar", bullish: c > o };
}

function analyzeStock(ticker, quotes) {
  if (!quotes || quotes.length < 50) return null;

  const closes = quotes.map(q => q.close).filter(Boolean);
  const volumes = quotes.map(q => q.volume).filter(Boolean);

  if (closes.length < 50) return null;

  const price = closes[closes.length - 1];
  const ema21 = calcEMA(closes, 21);
  const sma50 = calcSMA(closes, 50);
  const sma200 = calcSMA(closes, Math.min(200, closes.length));
  const rsi = calcRSI(closes, 14);
  const avgVol20 = calcSMA(volumes, 20);
  const todayVol = volumes[volumes.length - 1];
  const candle = detectCandle(quotes.slice(-2));

  if (!ema21 || !sma50 || !rsi || !avgVol20) return null;

  // ─── SIGNAL CHECKS ─────────────────────────────────────────────
  const aboveSMA50 = price > sma50;
  const aboveSMA200 = sma200 ? price > sma200 : true;
  const nearEMA21 = Math.abs(price - ema21) / ema21 < 0.04; // within 4%
  const pullbackToEMA = price < ema21 * 1.04 && price > ema21 * 0.96;
  const rsiGood = rsi >= 35 && rsi <= 58;
  const volumeDryUp = todayVol < avgVol20 * 0.85; // volume 15%+ below average
  const bullishCandle = candle.bullish;
  const trendUp = aboveSMA50 && aboveSMA200;

  // ─── SCORE (0–10) ───────────────────────────────────────────────
  let score = 0;
  if (trendUp) score += 2.5;
  if (pullbackToEMA) score += 2.5;
  if (rsiGood) score += 2;
  if (volumeDryUp) score += 1.5;
  if (bullishCandle) score += 1.5;
  score = Math.round(score * 10) / 10;

  // ─── SIGNAL STATUS ──────────────────────────────────────────────
  const allSignals = trendUp && pullbackToEMA && rsiGood && volumeDryUp && bullishCandle;
  const strongSetup = trendUp && pullbackToEMA && rsiGood && (volumeDryUp || bullishCandle);

  let signal = "WEAK";
  if (allSignals) signal = "STRONG BUY";
  else if (strongSetup) signal = "WATCH";
  else if (score >= 5) signal = "POSSIBLE";

  if (signal === "WEAK") return null; // filter out weak signals

  // ─── TRADE LEVELS ───────────────────────────────────────────────
  const recentLows = quotes.slice(-5).map(q => q.low);
  const swingLow = Math.min(...recentLows);
  const stopLoss = +(swingLow * 0.995).toFixed(2); // 0.5% below swing low
  const riskPerShare = +(price - stopLoss).toFixed(2);
  const target1 = +(price + riskPerShare * 1.5).toFixed(2);
  const target2 = +(price + riskPerShare * 2.5).toFixed(2);

  // ─── ENTRY ──────────────────────────────────────────────────────
  const entryPrice = +(price * 1.002).toFixed(2); // slight buffer above close

  const pctFromEMA = +((price - ema21) / ema21 * 100).toFixed(2);
  const pctFromSMA50 = +((price - sma50) / sma50 * 100).toFixed(2);

  return {
    ticker,
    price: +price.toFixed(2),
    signal,
    score,
    candle: candle.pattern,
    rsi: +rsi.toFixed(1),
    pctFromEMA,
    pctFromSMA50,
    volumeRatio: +(todayVol / avgVol20).toFixed(2),
    ema21: +ema21.toFixed(2),
    sma50: +sma50.toFixed(2),
    entryPrice,
    stopLoss,
    target1,
    target2,
    riskPerShare,
    signals: {
      trend: trendUp,
      pullback: pullbackToEMA,
      rsi: rsiGood,
      volumeDryUp,
      bullishCandle,
    },
    scannedAt: new Date().toISOString(),
  };
}

module.exports = { analyzeStock };
