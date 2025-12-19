@echo off
chcp 65001 >nul
title Stock Monitor

:loop
echo ===========================================
echo STOCK MONITOR - %date% %time%
echo ===========================================

cd /d C:\Users\flavio\Documents\estagio\kafka-nodejs

node -e "import('./stock-service/stockManager.js').then(module => { const { listAllProducts } = module; const products = listAllProducts(); console.log('ESTOQUE ATUAL:'); console.log(''); products.forEach(product => { const status = product.quantity > 10 ? '[OK]' : product.quantity > 5 ? '[WARN]' : '[LOW]'; console.log(`${status} ${product.sku}: ${product.quantity} unidades - ${product.name}`); }); console.log(''); console.log(`Total de produtos: ${products.length}`); console.log('==========================================='); console.log('Proxima atualizacao em 5 segundos...'); });"

timeout /t 5 /nobreak >nul
goto loop