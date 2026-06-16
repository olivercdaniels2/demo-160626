// AIP Template - Based on NEW_AIP_ALG.svg

function _buildAIPHtmlNew(data) {
    const isSME = !!data.isSME;
    const accent = isSME ? '#67c9ba' : '#f9a67e';
    const vpLabel = isSME ? '90 DAY' : '180 DAY';
    const css = `<style>
@font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:400}
@font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:600}
.aip-wrap *,.aip-wrap *::before,.aip-wrap *::after{box-sizing:border-box}
.aip-wrap h1::before,.aip-wrap h1::after,.aip-wrap h2::before,.aip-wrap h2::after{content:none !important;display:none !important}
.aip-wrap,.aip-wrap *{font-family:'Argent Regular',serif !important}
.aip-wrap{font-family:'Argent Regular',serif;background:#fff;padding:0;margin:0}
.aip-wrap .page{width:794px;min-height:1123px;padding:60px 52px;background:#fff;position:relative}
.aip-wrap .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
.aip-wrap .header-left{flex:1}
.aip-wrap .header-right img{max-height:48px;width:auto}
.aip-wrap .header-title{font-family:'Argent CF',serif;font-size:24px;font-weight:400;color:#212c60;margin-bottom:4px;letter-spacing:-0.02em}
.aip-wrap .header-subtitle{font-size:14px;color:#35488f;margin-bottom:4px;font-family:'Montserrat',Arial,sans-serif}
.aip-wrap .header-date{font-size:14px;color:${accent};font-weight:400;margin-bottom:0;font-family:'Montserrat',Arial,sans-serif}
.aip-wrap .header-divider{border:none;border-top:0.75px solid #e5e5e5;margin-bottom:25px;margin-top:12px}
.aip-wrap .info-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:18px}
.aip-wrap .info-card{background:#f9fbfc;border:0.75px solid #e5e5e5;border-radius:3px;padding:14px}
.aip-wrap .info-card-label{font-size:7.5px;color:#6c7280;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;font-weight:600}
.aip-wrap .info-card-value{font-size:10.5px;color:#051f3c;font-weight:500;line-height:1.4}
.aip-wrap .loan-summary{background:#212c60;border-radius:4.5px;padding:26px;margin:25px 0}
.aip-wrap .loan-summary-title{font-family:'Argent CF',serif;font-size:15px;color:${accent};margin-bottom:18px;letter-spacing:-0.02em}
.aip-wrap .loan-row{display:grid;grid-template-columns:1fr 1fr;gap:60px;padding:11px 0;border-bottom:0.25px solid #c7c7c6}
.aip-wrap .loan-row:last-of-type{border-bottom:none}
.aip-wrap .loan-field{display:flex;justify-content:space-between;align-items:center}
.aip-wrap .loan-label{font-size:9px;color:#c7c7c6}
.aip-wrap .loan-value{font-size:10.5px;color:#fff;font-weight:600}
.aip-wrap .net-loan-box{background:${accent};border-radius:4.5px;padding:14px 20px;margin-top:12px;display:flex;justify-content:space-between;align-items:center}
.aip-wrap .net-loan-label{font-size:9.75px;color:#051f3c;font-weight:600}
.aip-wrap .net-loan-value{font-family:'Argent CF',serif;font-size:14px;color:#051f3c;font-weight:600}
.aip-wrap .section-title{font-family:'Montserrat',Arial,sans-serif;font-size:13.5px;color:#051f3c;margin-bottom:12px;letter-spacing:0.05em;text-transform:uppercase;font-weight:600}
.aip-wrap .section-divider{border:none;border-top:0.75px solid #e5e5e5;margin-bottom:16px}
.aip-wrap .property-table{border:0.75px solid #e5e5e5;border-radius:4.5px;overflow:hidden;margin-bottom:25px}
.aip-wrap .property-table-header{background:#f9fbfc;display:grid;grid-template-columns:2.5fr 0.8fr 1fr 0.8fr 0.9fr;gap:12px;padding:10px 16px}
.aip-wrap .property-table-header-cell{font-size:7.5px;color:#061633;font-weight:600;letter-spacing:0.1em;text-transform:uppercase}
.aip-wrap .property-table-row{display:grid;grid-template-columns:2.5fr 0.8fr 1fr 0.8fr 0.9fr;gap:12px;padding:11px 16px;border-bottom:0.75px solid #e5e5e5;background:#fff}
.aip-wrap .property-table-row:last-child{border-bottom:none}
.aip-wrap .property-name{font-family:'Argent CF',serif;font-size:9.75px;color:#384252;font-weight:600;margin-bottom:2px}
.aip-wrap .property-address{font-family:'Argent CF',serif;font-size:8.25px;color:#6c7280;line-height:1.3}
.aip-wrap .property-cell{font-family:'Argent CF',serif;font-size:9.75px;color:#384252}
.aip-wrap .property-totals{background:${accent};display:grid;grid-template-columns:2.5fr 0.8fr 1fr 0.8fr 0.9fr;gap:12px;padding:6px 16px}
.aip-wrap .property-totals-label{font-family:'Montserrat',Arial,sans-serif;font-size:9px;color:#051f3c;font-weight:600}
.aip-wrap .property-totals-value{font-family:'Montserrat',Arial,sans-serif;font-size:9px;color:#051f3c;font-weight:600}
.aip-wrap .conditions-box{background:#f9fbfc;border:0.75px solid #e5e5e5;border-radius:4.5px;padding:18px;margin-bottom:18px}
.aip-wrap .condition-group-label{font-size:7.5px;font-weight:700;color:#6c7280;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;margin-top:12px}
.aip-wrap .condition-group-label:first-child{margin-top:0}
.aip-wrap .condition-item{font-family:'Argent CF',serif;display:flex;gap:8px;margin-bottom:8px;font-size:9.75px;color:#384252;line-height:1.5}
.aip-wrap .condition-item:last-child{margin-bottom:0}
.aip-wrap .condition-separator{border:none;border-top:0.5px solid #e5e5e5;margin:10px 0}
.aip-wrap .condition-bullet{color:#051f3c;font-weight:700;flex-shrink:0}
.aip-wrap .validity-box{background:#f9fbfc;border:0.75px solid #e5e5e5;border-radius:4.5px;padding:14px;text-align:center;margin-bottom:16px}
.aip-wrap .validity-text{font-size:9.75px;color:#384252;font-weight:500}
.aip-wrap .footer{border-top:0.75px solid #e5e5e5;padding-top:12px;text-align:center}
.aip-wrap .footer-company{font-size:7.5px;color:#6c7280;font-weight:600;margin-bottom:3px}
.aip-wrap .footer-disclaimer{font-size:7.5px;color:#6c7280}
.aip-wrap .terms-title{font-family:'Argent CF',serif;font-size:20px;color:#212c60;margin-bottom:25px;text-align:center}
.aip-wrap .validity-info{text-align:center;font-size:10px;color:#6c7280;margin-bottom:20px;padding:12px;background:#f9fbfc;border:0.75px solid #e5e5e5;border-radius:4.5px}
.aip-wrap .validity-info-date{font-weight:600;color:#212c60}
.aip-wrap .terms-list{list-style:none;padding:0;margin:0}
.aip-wrap .terms-list>li{font-size:9.5px;color:#384252;line-height:1.7;margin-bottom:10px;padding-left:18px;position:relative}
.aip-wrap .terms-list>li:before{content:"•";position:absolute;left:0;color:#212c60;font-weight:700;font-size:9.5px}
.aip-wrap .terms-sub-list{list-style:none;padding:0;margin:6px 0 0 18px}
.aip-wrap .terms-sub-list li{font-size:9px;color:#384252;line-height:1.6;margin-bottom:5px;padding-left:14px;position:relative}
.aip-wrap .terms-sub-list li:before{content:"○";position:absolute;left:0;color:#6c7280;font-size:8px}
</style>`;
    return `<div class="aip-wrap">${css}
<div class="page">
<div class="header">
<div class="header-left">
<div class="header-title">Agreement in Principle</div>
<div class="header-subtitle">Confidential Loan Offer</div>
<div class="header-date">${data.todayDate}</div>
</div>
<div class="header-right"><img src="${data.logoSrc}" alt="Albatross Lending Group"></div>
</div>
<hr class="header-divider"/>
<div class="info-cards">
<div class="info-card"><div class="info-card-label">BROKER NAME</div><div class="info-card-value">${data.brokerName}</div></div>
<div class="info-card"><div class="info-card-label">BROKERS FIRM</div><div class="info-card-value">${data.brokerFirm}</div></div>
<div class="info-card"><div class="info-card-label">BORROWER</div><div class="info-card-value">${data.borrower}</div></div>
</div>
<div class="info-cards">
<div class="info-card"><div class="info-card-label">GUARANTORS</div><div class="info-card-value">${data.guarantors}</div></div>
<div class="info-card"><div class="info-card-label">PURPOSE</div><div class="info-card-value">${data.purpose}</div></div>
<div class="info-card"><div class="info-card-label">EXIT STRATEGY</div><div class="info-card-value">${data.exitStrategy}</div></div>
</div>
<div class="loan-summary">
<div class="loan-summary-title">Loan Summary</div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Gross Loan</span><span class="loan-value">${data.grossLoan}</span></div><div class="loan-field"><span class="loan-label">Term</span><span class="loan-value">${data.term}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Arrangement Fee</span><span class="loan-value">${data.arrangementFee}</span></div><div class="loan-field"><span class="loan-label">Proc Fee</span><span class="loan-value">${data.procFee}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Additional Broker Fee</span><span class="loan-value">${data.additionalBrokerFee}</span></div><div class="loan-field"><span class="loan-label">Retained</span><span class="loan-value">${data.retained}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Admin Fee</span><span class="loan-value">${data.adminFee}</span></div><div class="loan-field"><span class="loan-label">Interest pcm</span><span class="loan-value">${data.interestPcm}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Interest Per Month</span><span class="loan-value">${data.interestPerMonth}</span></div><div class="loan-field"><span class="loan-label">Interest Over Term</span><span class="loan-value">${data.interestOverTerm}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Net Loan</span><span class="loan-value">${data.netLoan}</span></div><div class="loan-field"><span class="loan-label">Exit Fee</span><span class="loan-value">${data.exitFee}</span></div></div>
${data.hasAVM ? `<div class="loan-row"><div class="loan-field"><span class="loan-label">AVM Fee</span><span class="loan-value">${data.avmFee}</span></div><div class="loan-field"></div></div>` : ''}
${data.hasSecondCharge ? `<div class="loan-row"><div class="loan-field"><span class="loan-label">Second Charge Consent Fee</span><span class="loan-value">${data.secondChargeFee}</span></div><div class="loan-field"></div></div>` : ''}
</div>
<div class="section-title">Security Properties</div>
<hr class="section-divider"/>
<div class="property-table">
<div class="property-table-header">
<div class="property-table-header-cell">PROPERTY</div>
<div class="property-table-header-cell">CHARGE</div>
<div class="property-table-header-cell">OUTSTANDING</div>
<div class="property-table-header-cell">MV</div>
<div class="property-table-header-cell">${vpLabel}</div>
</div>
${data.securityProperties.map(p=>`<div class="property-table-row"><div><div class="property-name">${p.name}</div><div class="property-address">${p.address}</div></div><div class="property-cell">${p.charge}</div><div class="property-cell">${p.outstanding}</div><div class="property-cell">${p.mv}</div><div class="property-cell">${p.day180}</div></div>`).join('')}
<div class="property-totals">
<div class="property-totals-label">TOTALS</div>
<div class="property-totals-value"></div>
<div class="property-totals-value">${data.totalsOutstanding}</div>
<div class="property-totals-value">${data.totalsMV}</div>
<div class="property-totals-value">${data.totals180}</div>
</div>
</div>
<div class="section-title">Conditions</div>
<hr class="section-divider"/>
<div class="conditions-box">
${(()=>{
  const prec = Array.isArray(data.conditionsPrecedent) && data.conditionsPrecedent.length > 0 ? data.conditionsPrecedent : [];
  const subs = Array.isArray(data.conditionsSubsequent) && data.conditionsSubsequent.length > 0 ? data.conditionsSubsequent : [];
  const renderItems = arr => arr.map(c=>`<div class="condition-item"><span class="condition-bullet">•</span><span>${c}</span></div>`).join('');
  if (prec.length === 0 && subs.length === 0) return '<div class="condition-item"><span class="condition-bullet">•</span><span>No conditions specified</span></div>';
  let html = '';
  html += '<div class="condition-group-label">Conditions Precedent</div>';
  html += prec.length > 0 ? renderItems(prec) : '<div class="condition-item"><span class="condition-bullet">•</span><span>None</span></div>';
  html += '<hr class="condition-separator"/>';
  html += '<div class="condition-group-label">Conditions Subsequent</div>';
  html += subs.length > 0 ? renderItems(subs) : '<div class="condition-item"><span class="condition-bullet">•</span><span>None</span></div>';
  return html;
})()}
</div>
<div class="validity-box">
<div class="validity-text">This offer is valid for ${data.validityDays} days from the date issued.</div>
</div>
<div class="footer">
<div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
<div class="footer-disclaimer">This Agreement in Principle is subject to full underwriting and legal review.</div>
</div>
</div>
<div class="page">
<div class="terms-title">Standard Terms and Conditions</div>
<div class="validity-info">This Agreement in Principle is valid until <span class="validity-info-date">${data.validityExpiryDate}</span></div>
<ul class="terms-list">
<li>The facility must be unregulated and for business use only</li>
<li>This proposal has been underwritten by Albatross' credit team based on the information provided to date, but this does not provide a guarantee to lend.</li>
<li>The procurement fee noted in the summary is paid by Albatross to the broker for introducing the loan to us on completion of the facility.</li>
<li>Where the transaction contains a refinance it is assumed that there is no debt write off from the existing lender.</li>
<li>A satisfactory exit plan is required and where possible is to be evidenced during the underwriting process</li>
<li>The Lender assumes that the borrower does not, directly or indirectly, control any land/property adjacent to, or in any other way connected to or dependent on, any security property</li>
<li>The lender assumes there is no sub-sale or flip involved as part of the transaction</li>
<li>Both the valuation and Legal fees are paid by the borrower upon instruction.</li>
<li>Borrowers solicitors are to pay a legal undertaking as soon as possible after instruction with the valuation fee payable directly to the surveyor.</li>
<li>Additional pre-completion requirements or conditions subsequent may be added to the facility as a result of underwriting</li>
<li>A full RICS RedBook valuation report is required for each property unless otherwise agreed.</li>
<li>Market value assumes the Property is sold in its current condition with the benefit of any existing leases (or, if applicable, as a fully equipped and operational entity, valued with regard to trading potential).</li>
${isSME ? `<li>90 day VP MV assumes the Property is sold in 90 days with vacant possession (and, if applicable, stripped of all inventory with no accounts available and licenses lost).</li>` : `<li>180 day VP MV assumes the Property is sold in 180 days with vacant possession.</li>
<li>90 day VP MV assumes the Property is sold in 90 days with vacant possession (and, if applicable, stripped of all inventory with no accounts available and licenses lost).</li>`}
<li>All valuations will include any existing planning consents, however they will discount any hope value attributable to proposed planning consent, or for any other reason.</li>
<li>The borrowers solicitors firm is to benefit from at least two SRA partners and not have been subject to any regulatory action in the past</li>
<li>If you are purchasing the security property or have done works to the property in the last three years a full set of legal searches will be required before completion.</li>
<li>A copy of the freeholders management pack will be required for any leasehold properties.</li>
<li>Standard security will include but is not limited to:
<ul class="terms-sub-list">
<li>Charges over any relevant leases, which must be arms-length and on terms acceptable to the Lender</li>
<li>For corporate borrowers: Extra security including a debenture and charge over shares</li>
<li>For offshore corporate borrowers: A legal opinion</li>
<li>For second charges: Deed of Priority with the first charge holder restricting their priority to the amount shown above along with sight of the loan agreement with the first charge holder which must be a PRA regulated lender</li>
<li>Other security as recommended by the Lender's lawyers</li>
</ul>
</li>
</ul>
<div class="footer" style="position:absolute;bottom:60px;left:52px;right:52px">
<div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
<div class="footer-disclaimer">This Agreement in Principle is subject to full underwriting and legal review.</div>
</div>
</div>
</div>`;
}

async function downloadAIPNew(ref) {
    console.log(' downloadAIPNew() called with ref:', ref);    
    // Notify user immediately that download has started
    if (typeof showCreditNotification === 'function') {
        showCreditNotification('Download started...', 'info');
    }
        let renderFrame = null;
    try {
        const req = mockAIPRequests.find(r => r.ref === ref);
        if (!req) {
            if (typeof showCreditNotification === 'function') showCreditNotification('Request not found', 'error');
            return;
        }

        // Detect SME product and fetch correct logo
        const isSME = req.product === 'sme' || (typeof State !== 'undefined' && State.product === 'sme');
        const logoFile = isSME ? 'SME_logo.png' : 'al_logo_blue.png';
        const logoResponse = await fetch(logoFile);
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(logoBlob);
        });

        // Format dates
        const today = new Date();
        const ordinal = (d) => { const s=['th','st','nd','rd'], v=d%100; return d+(s[(v-20)%10]||s[v]||s[0]); };
        const fmtDate = (dt) => `${ordinal(dt.getDate())} ${dt.toLocaleDateString('en-GB',{month:'long'})} ${dt.getFullYear()}`;
        const todayDate = fmtDate(today);
        
        const validityDays = 28;
        const expiryDate = new Date(today);
        expiryDate.setDate(expiryDate.getDate() + validityDays);
        const validityExpiryDate = fmtDate(expiryDate);
        const fmtMoney = (value) => `£${Number(value || 0).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        const normalizeChargeLabel = (value) => {
            const chargeVal = String(value ?? '').trim().toLowerCase();
            if (['1', '1st', 'first'].includes(chargeVal)) return '1st';
            if (['2', '2nd', 'second'].includes(chargeVal)) return '2nd';
            return value || '1st';
        };
        const parseRatePercent = (value) => {
            if (typeof value === 'string') {
                const cleaned = value.replace('%', '').trim();
                const parsed = parseFloat(cleaned);
                if (Number.isFinite(parsed)) return parsed;
                return 0;
            }
            const numeric = Number(value || 0);
            if (!Number.isFinite(numeric)) return 0;
            return numeric <= 1 ? numeric * 100 : numeric;
        };

        const termMonths = Number(req.term || req.calculatorSummary?.term || 12);
        const grossLoanAmount = Number(req.calculatorSummary?.grossLoan || req.loanAmount || 0);
        const ratePercent = parseRatePercent(req.rate ?? req.calculatorSummary?.interestRate ?? 0);
        const interestPerMonthAmount = grossLoanAmount * (ratePercent / 100);
        const interestOverTermAmount = interestPerMonthAmount * termMonths;

        const exitFeeRaw = req.calculatorSummary?.exitFee;
        const exitFeeAmount = typeof exitFeeRaw === 'object' ? Number(exitFeeRaw?.amount || 0) : Number(exitFeeRaw || 0);
        const exitFeePercent = typeof exitFeeRaw === 'object' && exitFeeRaw?.percent != null ? Number(exitFeeRaw.percent) : null;
        const formattedExitFee = Number.isFinite(exitFeePercent)
            ? `${fmtMoney(exitFeeAmount)} / ${exitFeePercent.toFixed(2)}%`
            : fmtMoney(exitFeeAmount);

        const hasAVM = ((req.decision?.propertyValuations || []).some(pv => String(pv?.valuationType || '').toLowerCase().includes('avm')))
            || String(req.decision?.valuationType || req.decision?.valuationMethod || '').toLowerCase().includes('avm');
        const hasSecondCharge = normalizeChargeLabel(req.chargePosition) === '2nd';

        const data = {
            brokerName: req.brokerName || 'N/A',
            brokerFirm: req.broker || 'N/A',
            borrower: req.borrowerName || req.borrower || 'N/A',
            guarantors: req.guarantors || 'N/A',
            purpose: req.loanPurpose || 'N/A',
            exitStrategy: req.exitStrategy || 'N/A',
            grossLoan: `£${(req.calculatorSummary?.grossLoan || req.loanAmount || 0).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
            term: `${termMonths} Months`,
            arrangementFee: `£${(req.calculatorSummary?.arrangementFee?.amount || 0).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / ${(req.calculatorSummary?.arrangementFee?.percent || 0).toFixed(2)}%`,
            procFee: `£${(req.calculatorSummary?.procFee?.amount || 0).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / ${(req.calculatorSummary?.procFee?.percent || 0).toFixed(2)}%`,
            additionalBrokerFee: `£${(req.calculatorSummary?.brokerFee?.amount || 0).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / ${(req.calculatorSummary?.brokerFee?.percent || 0).toFixed(2)}%`,
            retained: `${termMonths} Months`,
            adminFee: `£${(req.calculatorSummary?.adminFee?.amount || 0).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
            interestPcm: `${ratePercent.toFixed(2)}%`,
            interestPerMonth: fmtMoney(interestPerMonthAmount),
            interestOverTerm: fmtMoney(interestOverTermAmount),
            netLoan: `£${(req.calculatorSummary?.netLoan || (req.loanAmount * 0.95) || 0).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
            exitFee: formattedExitFee,
            avmFee: '£75.00',
            secondChargeFee: '£250.00',
            hasAVM,
            hasSecondCharge,
            securityProperties: [{name: req.address?.split(',')[0] || 'Security Property', address: req.address || 'Address not available', charge: normalizeChargeLabel(req.chargePosition), outstanding: req.existingDebt && req.existingDebt !== 'None' ? req.existingDebt : 'N/A', mv: `£${(req.propertyValue || 0).toLocaleString('en-GB')}`, day180: `£${(req.propertyValue || 0).toLocaleString('en-GB')}`}],
            totalsOutstanding: req.existingDebt && req.existingDebt !== 'None' ? req.existingDebt : '£0.00',
            totalsMV: `£${(req.propertyValue || 0).toLocaleString('en-GB')}`,
            totals180: `£${(req.propertyValue || 0).toLocaleString('en-GB')}`,
            conditionsPrecedent: Array.isArray(req.decision?.conditions?.precedent) ? req.decision.conditions.precedent : (Array.isArray(req.decision?.conditions) ? req.decision.conditions : (req.decision?.conditions ? [req.decision.conditions] : [])),
            conditionsSubsequent: Array.isArray(req.decision?.conditions?.subsequent) ? req.decision.conditions.subsequent : [],
            validityDays: validityDays,
            todayDate: todayDate,
            validityExpiryDate: validityExpiryDate,
            logoSrc: logoBase64,
            isSME: isSME
        };

        const html = _buildAIPHtmlNew(data);
        renderFrame = document.createElement('div');
        renderFrame.style.cssText = 'position:fixed;top:0;left:0;z-index:-9999;opacity:0.01;pointer-events:none;';
        renderFrame.setAttribute('aria-hidden', 'true');
        renderFrame.innerHTML = html;
        document.body.appendChild(renderFrame);

        // Wait for fonts to load (relative paths resolve correctly against main document)
        try {
            await document.fonts.ready;
        } catch (e) {
            console.warn('Font loading check failed:', e);
        }

        await new Promise(resolve => setTimeout(resolve, 600));

        // Check for required libraries
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library not loaded');
        }
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            throw new Error('jsPDF library not loaded');
        }

        const pages = renderFrame.querySelectorAll('.page');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({unit: 'px', format: [794, 1123], compress: true});

        for (let i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage();
            const canvas = await html2canvas(pages[i], {scale: 4, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', width: 794, height: 1123, windowWidth: 794, scrollX: 0, scrollY: 0, logging: false});
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123, undefined, 'FAST');
        }

        const aipBorrower = (req.borrowerName || req.borrower || 'Unknown').replace(/[/\\?%*:|"<>]/g, '-').trim();
        pdf.save(`${aipBorrower} - ${req.ref}.pdf`);
        console.log('✅ AIP PDF generated successfully using NEW template');
        if (typeof showCreditNotification === 'function') showCreditNotification('AIP PDF downloaded', 'success');
    } catch (error) {
        console.error('❌ Error generating AIP PDF:', error);
        console.error('Error stack:', error.stack);
        if (typeof showCreditNotification === 'function') {
            showCreditNotification(`Failed to generate AIP PDF: ${error.message}`, 'error');
        }
    } finally {
        if (renderFrame && renderFrame.parentNode) {
            renderFrame.parentNode.removeChild(renderFrame);
        }
    }
}

console.log('✓ aip-template-new.js loaded - downloadAIPNew() available');

/* ══════════════════════════════════════════════════════
 * Refurb / Development AIP Template
 * Same styling & structure as the standard AIP but with
 * refurb-specific loan rows and 7-col property table.
 * ══════════════════════════════════════════════════════ */
function _buildRefurbAIPHtml(data) {
    const accent = '#f9a67e';
    const asNAIfZero = (v) => {
        const raw = String(v ?? '').trim();
        if (!raw || raw === '–' || raw === '-') return raw || '–';
        const n = Number(raw.replace(/[^0-9.-]/g, ''));
        if (!isNaN(n) && n === 0) return 'N/A';
        return raw;
    };

    const css = `<style>
@font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:400}
@font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:600}
.aip-wrap *,.aip-wrap *::before,.aip-wrap *::after{box-sizing:border-box}
.aip-wrap h1::before,.aip-wrap h1::after,.aip-wrap h2::before,.aip-wrap h2::after{content:none !important;display:none !important}
.aip-wrap,.aip-wrap *{font-family:'Argent Regular',serif !important}
.aip-wrap{font-family:'Argent Regular',serif;background:#fff;padding:0;margin:0}
.aip-wrap .page{width:794px;min-height:1123px;padding:60px 52px;background:#fff;position:relative}
.aip-wrap .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
.aip-wrap .header-left{flex:1}
.aip-wrap .header-right img{max-height:48px;width:auto}
.aip-wrap .header-title{font-family:'Argent CF',serif;font-size:24px;font-weight:400;color:#212c60;margin-bottom:4px;letter-spacing:-0.02em}
.aip-wrap .header-subtitle{font-size:14px;color:#35488f;margin-bottom:4px;font-family:'Montserrat',Arial,sans-serif}
.aip-wrap .header-date{font-size:14px;color:${accent};font-weight:400;margin-bottom:0;font-family:'Montserrat',Arial,sans-serif}
.aip-wrap .header-divider{border:none;border-top:0.75px solid #e5e5e5;margin-bottom:25px;margin-top:12px}
.aip-wrap .info-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:18px}
.aip-wrap .info-card{background:#f9fbfc;border:0.75px solid #e5e5e5;border-radius:3px;padding:14px}
.aip-wrap .info-card-label{font-size:7.5px;color:#6c7280;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;font-weight:600}
.aip-wrap .info-card-value{font-size:10.5px;color:#051f3c;font-weight:500;line-height:1.4}
.aip-wrap .loan-summary{background:#212c60;border-radius:4.5px;padding:26px;margin:25px 0}
.aip-wrap .loan-summary-title{font-family:'Argent CF',serif;font-size:15px;color:${accent};margin-bottom:18px;letter-spacing:-0.02em}
.aip-wrap .loan-row{display:grid;grid-template-columns:1fr 1fr;gap:60px;padding:11px 0;border-bottom:0.25px solid #c7c7c6}
.aip-wrap .loan-row:last-of-type{border-bottom:none}
.aip-wrap .loan-field{display:flex;justify-content:space-between;align-items:center}
.aip-wrap .loan-label{font-size:9px;color:#c7c7c6}
.aip-wrap .loan-value{font-size:10.5px;color:#fff;font-weight:600}
.aip-wrap .section-title{font-family:'Montserrat',Arial,sans-serif;font-size:13.5px;color:#051f3c;margin-bottom:12px;letter-spacing:0.05em;text-transform:uppercase;font-weight:600}
.aip-wrap .section-divider{border:none;border-top:0.75px solid #e5e5e5;margin-bottom:16px}
.aip-wrap .property-table{border:0.75px solid #e5e5e5;border-radius:4.5px;overflow:hidden;margin-bottom:25px}
.aip-wrap .property-table-header{background:#f9fbfc;display:grid;grid-template-columns:2fr 0.55fr 0.85fr 0.75fr 0.75fr 0.75fr 0.85fr;gap:6px;padding:10px 14px}
.aip-wrap .property-table-header-cell{font-size:6.5px;color:#061633;font-weight:600;letter-spacing:0.08em;text-transform:uppercase}
.aip-wrap .property-table-row{display:grid;grid-template-columns:2fr 0.55fr 0.85fr 0.75fr 0.75fr 0.75fr 0.85fr;gap:6px;padding:10px 14px;border-bottom:0.75px solid #e5e5e5;background:#fff}
.aip-wrap .property-table-row:last-child{border-bottom:none}
.aip-wrap .property-name{font-family:'Argent CF',serif;font-size:9px;color:#384252;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aip-wrap .property-address{font-family:'Argent CF',serif;font-size:7.5px;color:#6c7280;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aip-wrap .property-cell{font-family:'Argent CF',serif;font-size:8.5px;color:#384252}
.aip-wrap .property-totals{background:${accent};display:grid;grid-template-columns:2fr 0.55fr 0.85fr 0.75fr 0.75fr 0.75fr 0.85fr;gap:6px;padding:6px 14px}
.aip-wrap .property-totals-label{font-family:'Montserrat',Arial,sans-serif;font-size:9px;color:#051f3c;font-weight:600}
.aip-wrap .property-totals-value{font-family:'Montserrat',Arial,sans-serif;font-size:8.5px;color:#051f3c;font-weight:600}
.aip-wrap .conditions-box{background:#f9fbfc;border:0.75px solid #e5e5e5;border-radius:4.5px;padding:18px;margin-bottom:18px}
.aip-wrap .condition-group-label{font-size:7.5px;font-weight:700;color:#6c7280;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;margin-top:12px}
.aip-wrap .condition-group-label:first-child{margin-top:0}
.aip-wrap .condition-item{font-family:'Argent CF',serif;display:flex;gap:8px;margin-bottom:8px;font-size:9.75px;color:#384252;line-height:1.5}
.aip-wrap .condition-item:last-child{margin-bottom:0}
.aip-wrap .condition-separator{border:none;border-top:0.5px solid #e5e5e5;margin:10px 0}
.aip-wrap .condition-bullet{color:#051f3c;font-weight:700;flex-shrink:0}
.aip-wrap .validity-box{background:#f9fbfc;border:0.75px solid #e5e5e5;border-radius:4.5px;padding:14px;text-align:center;margin-bottom:16px}
.aip-wrap .validity-text{font-size:9.75px;color:#384252;font-weight:500}
.aip-wrap .footer{border-top:0.75px solid #e5e5e5;padding-top:12px;text-align:center}
.aip-wrap .footer-company{font-size:7.5px;color:#6c7280;font-weight:600;margin-bottom:3px}
.aip-wrap .footer-disclaimer{font-size:7.5px;color:#6c7280}
.aip-wrap .terms-title{font-family:'Argent CF',serif;font-size:20px;color:#212c60;margin-bottom:25px;text-align:center}
.aip-wrap .validity-info{text-align:center;font-size:10px;color:#6c7280;margin-bottom:20px;padding:12px;background:#f9fbfc;border:0.75px solid #e5e5e5;border-radius:4.5px}
.aip-wrap .validity-info-date{font-weight:600;color:#212c60}
.aip-wrap .terms-list{list-style:none;padding:0;margin:0}
.aip-wrap .terms-list>li{font-size:9.5px;color:#384252;line-height:1.7;margin-bottom:10px;padding-left:18px;position:relative}
.aip-wrap .terms-list>li:before{content:"•";position:absolute;left:0;color:#212c60;font-weight:700;font-size:9.5px}
.aip-wrap .terms-sub-list{list-style:none;padding:0;margin:6px 0 0 18px}
.aip-wrap .terms-sub-list li{font-size:9px;color:#384252;line-height:1.6;margin-bottom:5px;padding-left:14px;position:relative}
.aip-wrap .terms-sub-list li:before{content:"○";position:absolute;left:0;color:#6c7280;font-size:8px}
</style>`;

    return `<div class="aip-wrap">${css}
<div class="page">
<div class="header">
<div class="header-left">
<div class="header-title">Agreement in Principle</div>
<div class="header-subtitle">Confidential Loan Offer</div>
<div class="header-date">${data.todayDate}</div>
</div>
<div class="header-right"><img src="${data.logoSrc}" alt="Albatross Lending Group"></div>
</div>
<hr class="header-divider"/>
<div class="info-cards">
<div class="info-card"><div class="info-card-label">BROKER NAME</div><div class="info-card-value">${data.brokerName}</div></div>
<div class="info-card"><div class="info-card-label">BROKERS FIRM</div><div class="info-card-value">${data.brokerFirm}</div></div>
<div class="info-card"><div class="info-card-label">BORROWER</div><div class="info-card-value">${data.borrower}</div></div>
</div>
<div class="info-cards">
<div class="info-card"><div class="info-card-label">GUARANTORS</div><div class="info-card-value">${data.guarantors}</div></div>
<div class="info-card"><div class="info-card-label">PURPOSE</div><div class="info-card-value">${data.purpose}</div></div>
<div class="info-card"><div class="info-card-label">EXIT STRATEGY</div><div class="info-card-value">${data.exitStrategy}</div></div>
</div>
<div class="loan-summary">
<div class="loan-summary-title">Loan Summary</div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Gross Initial Loan</span><span class="loan-value">${data.grossLoan}</span></div><div class="loan-field"><span class="loan-label">Net Initial Advance</span><span class="loan-value">${data.netLoan}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Arrangement Fee</span><span class="loan-value">${asNAIfZero(data.arrangementFee)}</span></div><div class="loan-field"><span class="loan-label">Proc Fee</span><span class="loan-value">${asNAIfZero(data.procFee)}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Additional Broker Fee</span><span class="loan-value">${asNAIfZero(data.additionalBrokerFee)}</span></div><div class="loan-field"><span class="loan-label">Admin Fee</span><span class="loan-value">${asNAIfZero(data.adminFee)}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Day 1 Interest</span><span class="loan-value">${data.day1Interest}</span></div><div class="loan-field"><span class="loan-label">Total Interest Rolled</span><span class="loan-value">${data.totalInterestRolled}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Interest pcm</span><span class="loan-value">${data.interestPcm}</span></div><div class="loan-field"><span class="loan-label">Term</span><span class="loan-value">${data.term}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Gross Drawdowns</span><span class="loan-value">${data.grossDrawdown}</span></div><div class="loan-field"><span class="loan-label">Net Drawdowns</span><span class="loan-value">${data.netDrawdown}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Total Cost of Works</span><span class="loan-value">${data.totalCostOfWorks}</span></div><div class="loan-field"><span class="loan-label">Total DD Fees (${data.numDrawdowns} draws)</span><span class="loan-value">${data.totalDrawdownFees}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Overall Gross Loan</span><span class="loan-value">${data.overallGross}</span></div><div class="loan-field"><span class="loan-label">Overall Net Advance</span><span class="loan-value">${data.overallNet}</span></div></div>
<div class="loan-row"><div class="loan-field"><span class="loan-label">Exit Fee</span><span class="loan-value">${asNAIfZero(data.exitFee)}</span></div><div class="loan-field"><span class="loan-label">Total Repayment</span><span class="loan-value">${data.totalRepayment}</span></div></div>
${data.hasAVM ? `<div class="loan-row"><div class="loan-field"><span class="loan-label">AVM Fee</span><span class="loan-value">${asNAIfZero(data.avmFee)}</span></div><div class="loan-field"></div></div>` : ''}
${data.hasSecondCharge ? `<div class="loan-row"><div class="loan-field"><span class="loan-label">Second Charge Consent Fee</span><span class="loan-value">${asNAIfZero(data.secondChargeFee)}</span></div><div class="loan-field"></div></div>` : ''}
</div>
<div class="section-title">Security Properties</div>
<hr class="section-divider"/>
<div class="property-table">
<div class="property-table-header">
<div class="property-table-header-cell">PROPERTY</div>
<div class="property-table-header-cell">CHARGE</div>
<div class="property-table-header-cell">OUTSTANDING</div>
<div class="property-table-header-cell">MV</div>
<div class="property-table-header-cell">180 DAY</div>
<div class="property-table-header-cell">GDV</div>
<div class="property-table-header-cell">COST OF WORKS</div>
</div>
${data.securityProperties.map(p=>`<div class="property-table-row"><div><div class="property-name">${p.name}</div><div class="property-address">${p.address}</div></div><div class="property-cell">${p.charge}</div><div class="property-cell">${p.outstanding}</div><div class="property-cell">${p.mv}</div><div class="property-cell">${p.day180}</div><div class="property-cell">${p.gdv}</div><div class="property-cell">${p.cw}</div></div>`).join('')}
<div class="property-totals">
<div class="property-totals-label">TOTALS</div>
<div class="property-totals-value"></div>
<div class="property-totals-value">${data.totalsOutstanding}</div>
<div class="property-totals-value">${data.totalsMV}</div>
<div class="property-totals-value">${data.totals180}</div>
<div class="property-totals-value">${data.totalsGDV}</div>
<div class="property-totals-value">${data.totalsCW}</div>
</div>
</div>
<div class="section-title">Conditions</div>
<hr class="section-divider"/>
<div class="conditions-box">
${(()=>{
  const prec = Array.isArray(data.conditionsPrecedent) && data.conditionsPrecedent.length > 0 ? data.conditionsPrecedent : [];
  const subs = Array.isArray(data.conditionsSubsequent) && data.conditionsSubsequent.length > 0 ? data.conditionsSubsequent : [];
  const renderItems = arr => arr.map(c=>`<div class="condition-item"><span class="condition-bullet">•</span><span>${c}</span></div>`).join('');
  if (prec.length === 0 && subs.length === 0) return '<div class="condition-item"><span class="condition-bullet">•</span><span>No conditions specified</span></div>';
  let html = '';
  html += '<div class="condition-group-label">Conditions Precedent</div>';
  html += prec.length > 0 ? renderItems(prec) : '<div class="condition-item"><span class="condition-bullet">•</span><span>None</span></div>';
  html += '<hr class="condition-separator"/>';
  html += '<div class="condition-group-label">Conditions Subsequent</div>';
  html += subs.length > 0 ? renderItems(subs) : '<div class="condition-item"><span class="condition-bullet">•</span><span>None</span></div>';
  return html;
})()}
</div>
<div class="validity-box">
<div class="validity-text">This offer is valid for ${data.validityDays} days from the date issued.</div>
</div>
<div class="footer">
<div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
<div class="footer-disclaimer">This Agreement in Principle is subject to full underwriting and legal review.</div>
</div>
</div>
<div class="page">
<div class="terms-title">Standard Terms and Conditions</div>
<div class="validity-info">This Agreement in Principle is valid until <span class="validity-info-date">${data.validityExpiryDate}</span></div>
<ul class="terms-list">
<li>The facility must be unregulated and for business use only</li>
<li>This proposal has been underwritten by Albatross' credit team based on the information provided to date, but this does not provide a guarantee to lend.</li>
<li>The procurement fee noted in the summary is paid by Albatross to the broker for introducing the loan to us on completion of the facility.</li>
<li>Where the transaction contains a refinance it is assumed that there is no debt write off from the existing lender.</li>
<li>A satisfactory exit plan is required and where possible is to be evidenced during the underwriting process</li>
<li>The Lender assumes that the borrower does not, directly or indirectly, control any land/property adjacent to, or in any other way connected to or dependent on, any security property</li>
<li>The lender assumes there is no sub-sale or flip involved as part of the transaction</li>
<li>Both the valuation and Legal fees are paid by the borrower upon instruction.</li>
<li>Borrowers solicitors are to pay a legal undertaking as soon as possible after instruction with the valuation fee payable directly to the surveyor.</li>
<li>Additional pre-completion requirements or conditions subsequent may be added to the facility as a result of underwriting</li>
<li>A full RICS RedBook valuation report is required for each property unless otherwise agreed.</li>
<li>Market value assumes the Property is sold in its current condition with the benefit of any existing leases (or, if applicable, as a fully equipped and operational entity, valued with regard to trading potential).</li>
<li>180 day VP MV assumes the Property is sold in 180 days with vacant possession.</li>
<li>90 day VP MV assumes the Property is sold in 90 days with vacant possession (and, if applicable, stripped of all inventory with no accounts available and licenses lost).</li>
<li>All valuations will include any existing planning consents, however they will discount any hope value attributable to proposed planning consent, or for any other reason.</li>
<li>The borrowers solicitors firm is to benefit from at least two SRA partners and not have been subject to any regulatory action in the past</li>
<li>If you are purchasing the security property or have done works to the property in the last three years a full set of legal searches will be required before completion.</li>
<li>A copy of the freeholders management pack will be required for any leasehold properties.</li>
<li>Standard security will include but is not limited to:
<ul class="terms-sub-list">
<li>Charges over any relevant leases, which must be arms-length and on terms acceptable to the Lender</li>
<li>For corporate borrowers: Extra security including a debenture and charge over shares</li>
<li>For offshore corporate borrowers: A legal opinion</li>
<li>For second charges: Deed of Priority with the first charge holder restricting their priority to the amount shown above along with sight of the loan agreement with the first charge holder which must be a PRA regulated lender</li>
<li>Other security as recommended by the Lender's lawyers</li>
</ul>
</li>
</ul>
<div class="footer" style="position:absolute;bottom:60px;left:52px;right:52px">
<div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
<div class="footer-disclaimer">This Agreement in Principle is subject to full underwriting and legal review.</div>
</div>
</div>
</div>`;
}