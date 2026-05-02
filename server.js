const express = require("express");
const cors = require("cors");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());

// ─── STOCK UNIVERSE ───────────────────────────────────────────────────────────
const STOCKS = [
  // ── US S&P 100 ──────────────────────────────────────────────────────────────
  {t:"AAPL",m:"US",c:"USD"},{t:"MSFT",m:"US",c:"USD"},{t:"NVDA",m:"US",c:"USD"},
  {t:"AMZN",m:"US",c:"USD"},{t:"META",m:"US",c:"USD"},{t:"GOOGL",m:"US",c:"USD"},
  {t:"TSLA",m:"US",c:"USD"},{t:"JPM",m:"US",c:"USD"},{t:"V",m:"US",c:"USD"},
  {t:"UNH",m:"US",c:"USD"},{t:"XOM",m:"US",c:"USD"},{t:"JNJ",m:"US",c:"USD"},
  {t:"WMT",m:"US",c:"USD"},{t:"MA",m:"US",c:"USD"},{t:"PG",m:"US",c:"USD"},
  {t:"HD",m:"US",c:"USD"},{t:"CVX",m:"US",c:"USD"},{t:"MRK",m:"US",c:"USD"},
  {t:"ABBV",m:"US",c:"USD"},{t:"KO",m:"US",c:"USD"},{t:"PEP",m:"US",c:"USD"},
  {t:"AVGO",m:"US",c:"USD"},{t:"COST",m:"US",c:"USD"},{t:"TMO",m:"US",c:"USD"},
  {t:"ACN",m:"US",c:"USD"},{t:"MCD",m:"US",c:"USD"},{t:"BAC",m:"US",c:"USD"},
  {t:"CRM",m:"US",c:"USD"},{t:"CSCO",m:"US",c:"USD"},{t:"ABT",m:"US",c:"USD"},
  {t:"LIN",m:"US",c:"USD"},{t:"DHR",m:"US",c:"USD"},{t:"TXN",m:"US",c:"USD"},
  {t:"NEE",m:"US",c:"USD"},{t:"ADBE",m:"US",c:"USD"},{t:"NKE",m:"US",c:"USD"},
  {t:"PM",m:"US",c:"USD"},{t:"ORCL",m:"US",c:"USD"},{t:"RTX",m:"US",c:"USD"},
  {t:"AMGN",m:"US",c:"USD"},{t:"UPS",m:"US",c:"USD"},{t:"HON",m:"US",c:"USD"},
  {t:"QCOM",m:"US",c:"USD"},{t:"LOW",m:"US",c:"USD"},{t:"GS",m:"US",c:"USD"},
  {t:"CAT",m:"US",c:"USD"},{t:"IBM",m:"US",c:"USD"},{t:"INTU",m:"US",c:"USD"},
  {t:"MS",m:"US",c:"USD"},{t:"AMD",m:"US",c:"USD"},

  // ── UK FTSE ──────────────────────────────────────────────────────────────────
  {t:"HSBA.L",m:"UK",c:"GBP"},{t:"BP.L",m:"UK",c:"GBP"},{t:"SHEL.L",m:"UK",c:"GBP"},
  {t:"AZN.L",m:"UK",c:"GBP"},{t:"ULVR.L",m:"UK",c:"GBP"},{t:"GSK.L",m:"UK",c:"GBP"},
  {t:"RIO.L",m:"UK",c:"GBP"},{t:"LSEG.L",m:"UK",c:"GBP"},{t:"DGE.L",m:"UK",c:"GBP"},
  {t:"VOD.L",m:"UK",c:"GBP"},{t:"BATS.L",m:"UK",c:"GBP"},{t:"NG.L",m:"UK",c:"GBP"},
  {t:"LLOY.L",m:"UK",c:"GBP"},{t:"BARC.L",m:"UK",c:"GBP"},{t:"NWG.L",m:"UK",c:"GBP"},
  {t:"AAL.L",m:"UK",c:"GBP"},{t:"PRU.L",m:"UK",c:"GBP"},{t:"EXPN.L",m:"UK",c:"GBP"},
  {t:"CRH.L",m:"UK",c:"GBP"},{t:"IMB.L",m:"UK",c:"GBP"},{t:"GLEN.L",m:"UK",c:"GBP"},
  {t:"ABF.L",m:"UK",c:"GBP"},{t:"TSCO.L",m:"UK",c:"GBP"},{t:"SDR.L",m:"UK",c:"GBP"},
  {t:"BNZL.L",m:"UK",c:"GBP"},{t:"FLTR.L",m:"UK",c:"GBP"},{t:"REL.L",m:"UK",c:"GBP"},
  {t:"WPP.L",m:"UK",c:"GBP"},{t:"III.L",m:"UK",c:"GBP"},{t:"FERG.L",m:"UK",c:"GBP"},

  // ── JAPAN DIRECT (.T) ────────────────────────────────────────────────────────
  {t:"7203.T",m:"JP",c:"JPY",name:"Toyota"},{t:"6758.T",m:"JP",c:"JPY",name:"Sony"},
  {t:"8306.T",m:"JP",c:"JPY",name:"Mitsubishi UFJ"},{t:"9432.T",m:"JP",c:"JPY",name:"NTT"},
  {t:"6861.T",m:"JP",c:"JPY",name:"Keyence"},{t:"8035.T",m:"JP",c:"JPY",name:"Tokyo Electron"},
  {t:"9984.T",m:"JP",c:"JPY",name:"SoftBank"},{t:"7974.T",m:"JP",c:"JPY",name:"Nintendo"},
  {t:"4519.T",m:"JP",c:"JPY",name:"Chugai Pharma"},{t:"6367.T",m:"JP",c:"JPY",name:"Daikin"},
  {t:"8058.T",m:"JP",c:"JPY",name:"Mitsubishi Corp"},{t:"9983.T",m:"JP",c:"JPY",name:"Fast Retailing"},
  {t:"4063.T",m:"JP",c:"JPY",name:"Shin-Etsu Chem"},{t:"6902.T",m:"JP",c:"JPY",name:"Denso"},
  {t:"7267.T",m:"JP",c:"JPY",name:"Honda"},

  // ── ASIAN ADRs (NYSE, USD) ───────────────────────────────────────────────────
  // Japan ADRs
  {t:"TM",m:"AS",c:"USD",name:"Toyota ADR"},{t:"SONY",m:"AS",c:"USD",name:"Sony ADR"},
  {t:"HMC",m:"AS",c:"USD",name:"Honda ADR"},{t:"NTT",m:"AS",c:"USD",name:"NTT ADR"},
  {t:"NTDOY",m:"AS",c:"USD",name:"Nintendo ADR"},
  // India ADRs
  {t:"INFY",m:"AS",c:"USD",name:"Infosys"},{t:"WIT",m:"AS",c:"USD",name:"Wipro"},
  {t:"HDB",m:"AS",c:"USD",name:"HDFC Bank"},{t:"IBN",m:"AS",c:"USD",name:"ICICI Bank"},
  {t:"TTM",m:"AS",c:"USD",name:"Tata Motors"},{t:"REDDY",m:"AS",c:"USD",name:"Dr Reddy"},
  // China ADRs
  {t:"BABA",m:"AS",c:"USD",name:"Alibaba"},{t:"JD",m:"AS",c:"USD",name:"JD.com"},
  {t:"PDD",m:"AS",c:"USD",name:"PDD Holdings"},{t:"BIDU",m:"AS",c:"USD",name:"Baidu"},
  {t:"NIO",m:"AS",c:"USD",name:"NIO"},{t:"LI",m:"AS",c:"USD",name:"Li Auto"},
  // Korea / Taiwan ADRs
  {t:"TSM",m:"AS",c:"USD",name:"TSMC ADR"},{t:"KEP",m:"AS",c:"USD",name:"Korea Electric"},
  {t:"SKM",m:"AS",c:"USD",name:"SK Telecom"},
];

// ─── HTTP HELPER ──────────────────────────────────────────────────────────────
function httpsGet(url) {
  return new Promise(function(resolve, reject) {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      }
    }, function(res) {
      let data = "";
      res.on("data", function(chunk) { data += chunk; });
      res.on("end", function() {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error("JSON parse error")); }
      });
    });
    req.on("error", reject);
    req.setTimeout(12000, function() { req.destroy(); reject(new Error("Timeout")); });
  });
}

// ─── FETCH YAHOO FINANCE ──────────────────────────────────────────────────────
async function fetchStockData(ticker, market, currency) {
  try {
    const end   = Math.floor(Date.now() / 1000);
    const start = end - (365 * 24 * 60 * 60);
    const url   = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker +
      "?period1=" + start + "&period2=" + end + "&interval=1d&includePrePost=false";
    const data   = await httpsGet(url);
    const result = data && data.chart && data.chart.result && data.chart.result[0];
    if (!result) return null;
    const timestamps = result.timestamp;
    const q = result.indicators && result.indicators.quote && result.indicators.quote[0];
    if (!timestamps || !q) return null;

    const quotes = timestamps.map(function(t, i) {
      let close = q.close[i], open = q.open[i], high = q.high[i], low = q.low[i];
      // UK stocks quoted in pence — convert to pounds
      if (market === "UK" && close && close > 200) {
        close /= 100; open /= 100; high /= 100; low /= 100;
      }
      return { date: new Date(t * 1000), open, high, low, close, volume: q.volume[i] };
    }).filter(function(q) { return q.close && q.open && q.high && q.low && q.volume; });

    return quotes;
  } catch(e) { return null; }
}

// ─── INDICATORS ───────────────────────────────────────────────────────────────
function calcEMA(closes, period) {
  if (closes.length < period) return null;
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce(function(a,b){return a+b;},0) / period;
  for (let i = period; i < closes.length; i++) ema = closes[i] * k + ema * (1-k);
  return ema;
}
function calcSMA(arr, period) {
  if (arr.length < period) return null;
  return arr.slice(-period).reduce(function(a,b){return a+b;},0) / period;
}
function calcRSI(closes, period) {
  period = period || 14;
  if (closes.length < period + 1) return null;
  const slice = closes.slice(-(period+1));
  let gains = 0, losses = 0;
  for (let i = 1; i < slice.length; i++) {
    const d = slice[i] - slice[i-1];
    if (d > 0) gains += d; else losses += Math.abs(d);
  }
  const ag = gains/period, al = losses/period;
  if (al === 0) return 100;
  return parseFloat((100 - 100/(1 + ag/al)).toFixed(1));
}
function detectCandle(quotes) {
  if (quotes.length < 2) return { pattern: "None", bullish: false };
  const q = quotes[quotes.length-1], prev = quotes[quotes.length-2];
  const o=q.open, h=q.high, l=q.low, c=q.close;
  const body = Math.abs(c-o), range = h-l || 0.001;
  const lw = Math.min(o,c)-l, uw = h-Math.max(o,c);
  if (c>o && prev.close<prev.open && c>prev.open && o<prev.close) return {pattern:"Bullish Engulfing",bullish:true};
  if (lw > body*2 && uw < body && c>o)   return {pattern:"Hammer",bullish:true};
  if (body/range < 0.1)                   return {pattern:"Doji",bullish:true};
  if (c>o && body/range > 0.75)           return {pattern:"Strong Bull Bar",bullish:true};
  if (c>o && o < prev.close*0.99)         return {pattern:"Morning Star",bullish:true};
  return {pattern: c>o ? "Green Bar":"Red Bar", bullish: c>o};
}

// ─── ANALYSIS ─────────────────────────────────────────────────────────────────
function analyzeStock(stock, quotes) {
  if (!quotes || quotes.length < 50) return null;
  const closes = quotes.map(function(q){return q.close;});
  const volumes = quotes.map(function(q){return q.volume;});
  const price   = closes[closes.length-1];

  const ema21  = calcEMA(closes, 21);
  const sma50  = calcSMA(closes, 50);
  const sma200 = calcSMA(closes, Math.min(200, closes.length));
  const rsi    = calcRSI(closes, 14);
  const avgVol = calcSMA(volumes, 20);
  const todayVol = volumes[volumes.length-1];
  const candle = detectCandle(quotes.slice(-2));
  if (!ema21 || !sma50 || !rsi || !avgVol) return null;

  const trendUp    = price > sma50 && (!sma200 || price > sma200);
  const pullback   = price >= ema21*0.96 && price <= ema21*1.04;
  const rsiGood    = rsi >= 35 && rsi <= 58;
  const volDryUp   = todayVol < avgVol*0.85;
  const bullCandle = candle.bullish;

  let score = 0;
  if (trendUp)    score += 2.5;
  if (pullback)   score += 2.5;
  if (rsiGood)    score += 2.0;
  if (volDryUp)   score += 1.5;
  if (bullCandle) score += 1.5;
  score = Math.round(score*10)/10;

  const sigCount = [trendUp,pullback,rsiGood,volDryUp,bullCandle].filter(Boolean).length;
  let signal = "WEAK";
  if (sigCount === 5)    signal = "STRONG BUY";
  else if (sigCount >= 4) signal = "WATCH";
  else if (score >= 5)   signal = "POSSIBLE";
  if (signal === "WEAK") return null;

  // 10-candle swing low stop loss
  const last10Lows = quotes.slice(-10).map(function(q){return q.low;});
  const swingLow   = Math.min.apply(null, last10Lows);
  const stopLoss   = parseFloat((swingLow*0.995).toFixed(2));
  const riskPerShare = parseFloat((price - stopLoss).toFixed(2));
  const entryPrice   = parseFloat((price*1.002).toFixed(2));
  const target1      = parseFloat((price + riskPerShare*1.5).toFixed(2));
  const target2      = parseFloat((price + riskPerShare*2.5).toFixed(2));

  // Currency symbol
  const symMap = { USD:"$", GBP:"£", JPY:"¥" };
  const sym = symMap[stock.c] || "$";

  return {
    ticker: stock.t, market: stock.m, currency: stock.c, sym,
    name: stock.name || stock.t,
    price: parseFloat(price.toFixed(2)),
    signal, score, candle: candle.pattern, rsi,
    pctFromEMA: parseFloat(((price-ema21)/ema21*100).toFixed(2)),
    volumeRatio: parseFloat((todayVol/avgVol).toFixed(2)),
    ema21: parseFloat(ema21.toFixed(2)),
    sma50: parseFloat(sma50.toFixed(2)),
    entryPrice, stopLoss, target1, target2, riskPerShare,
    swingLow: parseFloat(swingLow.toFixed(2)),
    signals: { trend:trendUp, pullback, rsi:rsiGood, volumeDryUp:volDryUp, bullishCandle:bullCandle },
    scannedAt: new Date().toISOString(),
  };
}

// ─── SCAN STATE ───────────────────────────────────────────────────────────────
let cachedResults = [];
let lastScanTime  = null;
let isScanning    = false;

async function runScan(marketFilter) {
  if (isScanning) return cachedResults;
  isScanning = true;

  let universe = STOCKS;
  if (marketFilter && marketFilter !== "ALL") {
    universe = STOCKS.filter(function(s){ return s.m === marketFilter; });
  }

  console.log("\n[" + new Date().toLocaleTimeString() + "] Scanning " + universe.length + " stocks...");
  const results = [];

  for (let i = 0; i < universe.length; i++) {
    const stock = universe[i];
    process.stdout.write("\r  " + (i+1) + "/" + universe.length + " [" + stock.m + "] " + stock.t + "        ");
    const quotes   = await fetchStockData(stock.t, stock.m, stock.c);
    const analysis = analyzeStock(stock, quotes);
    if (analysis) results.push(analysis);
    await new Promise(function(r){ setTimeout(r, 300); });
  }

  // Sort: STRONG BUY first, then score
  results.sort(function(a, b) {
    const order = {"STRONG BUY":0,"WATCH":1,"POSSIBLE":2};
    if (order[a.signal] !== order[b.signal]) return order[a.signal]-order[b.signal];
    return b.score - a.score;
  });

  cachedResults = lastScanTime ? cachedResults.filter(function(r){
    return !results.find(function(n){ return n.ticker === r.ticker; });
  }).concat(results) : results;

  // If full scan replace entirely
  if (!marketFilter || marketFilter === "ALL") cachedResults = results;

  lastScanTime = new Date().toISOString();
  isScanning   = false;

  const summary = ["US","UK","JP","AS"].map(function(m) {
    const sub = results.filter(function(r){ return r.market===m; });
    return m + ": " + sub.filter(function(r){ return r.signal==="STRONG BUY"; }).length + " strong / " + sub.length + " total";
  }).join(" | ");
  console.log("\n[" + new Date().toLocaleTimeString() + "] Done! " + results.length + " setups. " + summary);
  return results;
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.get("/", function(req,res){ res.json({status:"SwingScanner Running",lastScan:lastScanTime,setups:cachedResults.length,markets:["US","UK","JP","AS"]}); });
app.get("/status", function(req,res){ res.json({isScanning,lastScanTime,setups:cachedResults.length}); });
app.get("/cached", function(req,res){
  const m = req.query.market;
  const results = m && m !== "ALL" ? cachedResults.filter(function(r){return r.market===m;}) : cachedResults;
  res.json({success:true,lastScanTime,count:results.length,results});
});
app.get("/scan", async function(req,res){
  try {
    const m = req.query.market;
    const results = await runScan(m);
    const filtered = m && m!=="ALL" ? results.filter(function(r){return r.market===m;}) : results;
    res.json({success:true,lastScanTime,count:filtered.length,results:filtered});
  } catch(err) {
    res.status(500).json({success:false,error:err.message});
  }
});


// ─── KEEP ALIVE (prevents Render free tier sleeping during scan) ──────────────
// Pings self every 10 minutes to stay warm
const SELF_URL = process.env.RENDER_EXTERNAL_URL || "http://localhost:" + (process.env.PORT || 3000);
setInterval(function() {
  https.get(SELF_URL + "/", function(res) {
    console.log("[keep-alive] ping " + new Date().toLocaleTimeString());
  }).on("error", function() {});
}, 10 * 60 * 1000); // every 10 minutes

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", function() {
  console.log("==========================================");
  console.log("  SwingScanner v4 — US + UK + Asia");
  console.log("  " + STOCKS.length + " stocks across 4 markets");
  console.log("  Node " + process.version);
  console.log("==========================================");
  console.log("\n  Markets: US(50) | UK(30) | Japan direct(15) | Asian ADRs(20)");
  console.log("  Run 'ipconfig' to find your PC IP\n");
});
