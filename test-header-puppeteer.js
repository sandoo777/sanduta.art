#!/usr/bin/env node

/**
 * Test automat pentru verificare duplicare Header
 * Folosește Puppeteer pentru a verifica numărul de headere în pagină
 */

import puppeteer from 'puppeteer';

async function testHeaderDuplication() {
    console.log('🚀 Pornire test duplicare Header...\n');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const pages = [
        { url: 'http://localhost:3000', name: 'Homepage', expectedHeaders: 1 },
        { url: 'http://localhost:3000/produse', name: 'Produse', expectedHeaders: 1 },
        { url: 'http://localhost:3000/cart', name: 'Cart', expectedHeaders: 1 },
        { url: 'http://localhost:3000/account', name: 'User Panel', expectedHeaders: 1 },
    ];
    
    let failedTests = 0;
    let passedTests = 0;
    
    for (const test of pages) {
        const page = await browser.newPage();
        
        try {
            console.log(`📄 Testing: ${test.name} (${test.url})`);
            
            await page.goto(test.url, { waitUntil: 'networkidle2', timeout: 10000 });
            
            // Așteaptă ca React să se hidrateze
            await page.waitForTimeout(2000);
            
            // Numără headere
            const headerCount = await page.evaluate(() => {
                const headers = document.querySelectorAll('header');
                return headers.length;
            });
            
            if (headerCount === test.expectedHeaders) {
                console.log(`   ✅ PASS: ${headerCount} header(e) găsite (așteptat ${test.expectedHeaders})\n`);
                passedTests++;
            } else {
                console.log(`   ❌ FAIL: ${headerCount} header(e) găsite (așteptat ${test.expectedHeaders})\n`);
                failedTests++;
            }
            
        } catch (error) {
            console.log(`   ⚠️  ERROR: ${error.message}\n`);
            failedTests++;
        } finally {
            await page.close();
        }
    }
    
    await browser.close();
    
    console.log('================================================');
    console.log('📊 REZULTATE FINALE');
    console.log('================================================');
    console.log(`Total teste: ${pages.length}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log('================================================\n');
    
    if (failedTests === 0) {
        console.log('🎉 SUCCES! Nu există duplicări de Header!\n');
        process.exit(0);
    } else {
        console.log('⚠️  Există probleme cu Header-ul. Verifică manual.\n');
        process.exit(1);
    }
}

testHeaderDuplication().catch(console.error);
