(function(root){
  'use strict';
  const storageKey='riskReward.portfolio.v1',legacyTotalKey='riskReward.totalInvestedCash',defaultThreshold=10;
  const finite=value=>value!==null&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  const multiplier=value=>Math.round(clamp(finite(value)??1,0,2)*10)/10;
  const currency=value=>String(value||'USD').trim().toUpperCase()==='CAD'?'CAD':'USD';
  function empty(){return {version:1,totalInvested:null,portfolioCurrency:'USD',alertThresholdPercent:defaultThreshold,holdings:{}};}
  function normalize(value){
    const result=empty();if(!value||typeof value!=='object')return result;
    const total=finite(value.totalInvested),threshold=finite(value.alertThresholdPercent);result.totalInvested=total>0?total:null;result.portfolioCurrency=currency(value.portfolioCurrency);result.alertThresholdPercent=threshold===null?defaultThreshold:clamp(threshold,0,100);
    if(value.holdings&&typeof value.holdings==='object'&&!Array.isArray(value.holdings))Object.entries(value.holdings).forEach(([ticker,item])=>{const shares=finite(item?.sharesHeld),key=String(ticker).trim().toUpperCase();if(key&&item&&typeof item==='object')result.holdings[key]={sharesHeld:shares>=0?shares:0,multiplier:multiplier(item.multiplier),configured:item.configured!==false};});
    return result;
  }
  function save(value,storage=root.localStorage){const normalized=normalize(value);storage.setItem(storageKey,JSON.stringify(normalized));return normalized;}
  function load(storage=root.localStorage){
    const saved=storage.getItem(storageKey);if(saved)return normalize(JSON.parse(saved));
    const result=empty(),legacy=finite(storage.getItem(legacyTotalKey));if(legacy>0){result.totalInvested=legacy;save(result,storage);storage.removeItem(legacyTotalKey);}return result;
  }
  function convert(value,from,to,usdCadRate){from=currency(from);to=currency(to);if(from===to)return value;const rate=finite(usdCadRate);if(!(rate>0))return null;return from==='USD'?value*rate:value/rate;}
  function calculate({totalInvested,portfolioCurrency='USD',allocationPercent,price,quoteCurrency='USD',usdCadRate=null,exchangeRateStale=false,sharesHeld=0,multiplier:factor=1,alertThresholdPercent=defaultThreshold,configured=true}){
    const total=finite(totalInvested),allocation=finite(allocationPercent),quote=finite(price),held=finite(sharesHeld),multiple=multiplier(factor),threshold=clamp(finite(alertThresholdPercent)??defaultThreshold,0,100),portfolioCode=currency(portfolioCurrency),quoteCode=currency(quoteCurrency);
    if(!(total>0&&allocation!==null&&allocation>=0&&quote>0&&held!==null&&held>=0))return null;
    if(portfolioCode!==quoteCode&&exchangeRateStale)return null;
    const expectedInvestment=total*allocation/100,targetAmount=expectedInvestment*multiple,targetQuoteAmount=convert(targetAmount,portfolioCode,quoteCode,usdCadRate);if(targetQuoteAmount===null)return null;
    const targetShares=targetQuoteAmount/quote,currentQuoteAmount=held*quote,currentAmount=convert(currentQuoteAmount,quoteCode,portfolioCode,usdCadRate);if(currentAmount===null)return null;
    const differenceShares=targetShares-held,differenceAmount=targetAmount-currentAmount;
    let differencePercent=0,action='hold';if(targetAmount===0){differencePercent=currentAmount>0?Number.NEGATIVE_INFINITY:0;if(configured&&held>0)action='sell';}else{differencePercent=differenceAmount/targetAmount*100;if(configured&&differencePercent>threshold)action='buy';else if(configured&&differencePercent<-threshold)action='sell';}
    return {expectedInvestment,targetAmount,targetQuoteAmount,targetShares,currentAmount,currentQuoteAmount,differenceShares,differenceAmount,differencePercent,action,threshold,multiplier:multiple,portfolioCurrency:portfolioCode,quoteCurrency:quoteCode};
  }
  function importJson(json){const value=typeof json==='string'?JSON.parse(json):json;if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('The selected file does not contain portfolio settings.');return normalize(value);}
  root.RiskRewardPortfolio={storageKey,empty,normalize,load,save,convert,calculate,importJson};
})(typeof globalThis!=='undefined'?globalThis:this);
