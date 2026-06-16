// Indicative Terms PDF Template Functions
// This file contains the template and generation logic for Indicative Terms PDFs

function _buildIndicativeTermsHtml(data) {
    const {
        brokerName, brokerFirm, bdmName, borrower, purpose, exitStrategy,
        grossLoan, netLoan, term, arrangementFee, procFee, brokerFee,
        retained, adminFee, interestPcm, interest, exitFee, interestMonthly,
        interestOverTerm, avmFee, secondChargeFee, hasAVM, hasSecondCharge,
        propertyRows, totalsOutstanding, totalsMV, totals180,
        todayDate, logoSrc
    } = data;
    const isSME = !!data.isSME;
    const isRefurb = !!data.isRefurb;
    const accent = isSME ? '#67c9ba' : '#f9a67e';
    const vpLabel = isSME ? '90 DAY' : '180 DAY';
    const asNAIfZero = (v) => {
      const raw = String(v ?? '').trim();
      if (!raw || raw === '–' || raw === '-') return raw || '–';
      const n = Number(raw.replace(/[^0-9.-]/g, ''));
      if (!isNaN(n) && n === 0) return 'N/A';
      return raw;
    };
    const footerBdmName = String(bdmName || '').trim();
    const showFooterBdm = footerBdmName && footerBdmName.toUpperCase() !== 'ALB';

    const css = `
      <style>
        @font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:400}
        @font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:600}
        /* Scoped reset */
        .indicative-wrap *, .indicative-wrap *::before, .indicative-wrap *::after { box-sizing: border-box; }
        .indicative-wrap h1::before, .indicative-wrap h1::after,
        .indicative-wrap h2::before, .indicative-wrap h2::after { content: none !important; display: none !important; }
        
        .indicative-wrap {
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.4;
          color: #202b60;
          background: #fff;
          width: 794px;
        }
        
        .indicative-wrap .indicative-page {
          width: 794px;
          height: 1123px;
          padding: 50px 60px 40px 60px;
          background: #fff;
          position: relative;
          overflow: hidden;
        }
        
        .indicative-wrap .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .indicative-wrap .header-left h1 { font-family: 'Argent Regular', serif; font-weight: 400; font-size: 26px; color: #212c60; letter-spacing: -0.02em; line-height: 1.15; margin: 0; padding: 0; }
        .indicative-wrap .header-left .date { font-family: 'Montserrat', Arial, sans-serif; font-weight: 400; font-size: 14px; color: ${accent}; margin-top: 4px; }
        .indicative-wrap .header-right img { max-height: 48px; width: auto; }
        
        .indicative-wrap .divider { border: none; border-top: 1px solid #e5e5e5; margin: 16px 0; }
        
        .indicative-wrap .info-row { display: flex; gap: 12px; margin-bottom: 12px; }
        .indicative-wrap .info-card { background: #f9fbfc; border: 1px solid #e5e5e5; border-radius: 5px; padding: 14px 16px; flex: 1; }
        .indicative-wrap .info-card .label { font-size: 7.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #6c7280; margin-bottom: 6px; font-family: 'Montserrat', Arial, sans-serif; }
        .indicative-wrap .info-card .value { font-size: 10.5px; font-weight: 500; color: #051f3c; line-height: 1.3; font-family: 'Montserrat', Arial, sans-serif; }
        
        .indicative-wrap .loan-section { background: #212c60; border-radius: 7px; padding: 18px 20px; margin-bottom: 16px; }
        .indicative-wrap .loan-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .indicative-wrap .loan-table td { padding: 8px 0; font-size: 9px; vertical-align: middle; border-bottom: 0.25px solid rgba(199,199,198,0.3); font-family: 'Montserrat', Arial, sans-serif; }
        .indicative-wrap .loan-table tr:last-child td { border-bottom: none; }
        .indicative-wrap .loan-table .col-label { font-weight: 400; color: #c7c7c6; width: 26%; padding-right: 10px; }
        .indicative-wrap .loan-table .col-value { font-weight: 600; color: #fff; text-align: right; width: 20%; font-size: 9px; padding-right: 15px; }
        .indicative-wrap .loan-table .col-label-right { font-weight: 400; color: #c7c7c6; width: 28%; padding-left: 50px; }
        .indicative-wrap .loan-table .col-value-right { font-weight: 600; color: #fff; text-align: right; width: 22%; font-size: 9px; }
        
        
        
        .indicative-wrap .section-title { font-family: 'Montserrat', Arial, sans-serif; font-size: 13.5px; color: #051f3c; margin-bottom: 12px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 600; }
        .indicative-wrap .section-title.security-title { font-family: 'Argent Regular', serif; text-transform: none; letter-spacing: 0; }
        .indicative-wrap .section-divider { border: none; border-top: 0.75px solid #e5e5e5; margin-bottom: 16px; }
        .indicative-wrap .property-section { margin-bottom: 16px; }
        .indicative-wrap .property-table{border:0.75px solid #e5e5e5;border-radius:4.5px;overflow:hidden;margin-bottom:25px}
        .indicative-wrap .property-table-header{background:#f9fbfc;display:grid;grid-template-columns:2.5fr 0.8fr 1fr 0.8fr 0.9fr;gap:12px;padding:10px 16px}
        .indicative-wrap .property-table-header-cell{font-size:7.5px;color:#061633;font-weight:600;letter-spacing:0.1em;text-transform:uppercase}
        .indicative-wrap .property-table-row{display:grid;grid-template-columns:2.5fr 0.8fr 1fr 0.8fr 0.9fr;gap:12px;padding:11px 16px;border-bottom:0.75px solid #e5e5e5;background:#fff}
        .indicative-wrap .property-table-row:last-child{border-bottom:none}
        .indicative-wrap .property-name{font-family:'Argent Regular',serif;font-size:9.75px;color:#384252;font-weight:600;margin-bottom:2px}
        .indicative-wrap .property-address{font-family:'Argent Regular',serif;font-size:8.25px;color:#6c7280;line-height:1.3}
        .indicative-wrap .property-cell{font-family:'Argent Regular',serif;font-size:9.75px;color:#384252}
        .indicative-wrap .property-totals{background:${accent};display:grid;grid-template-columns:2.5fr 0.8fr 1fr 0.8fr 0.9fr;gap:12px;padding:6px 16px}
        .indicative-wrap .property-totals-label{font-size:9px;color:#051f3c;font-weight:600}
        .indicative-wrap .property-totals-value{font-size:9px;color:#051f3c;font-weight:600}
        
        .indicative-wrap .footer-notes { font-size: 11px; color: #061633; line-height: 1.6; margin-top: 20px; }
        .indicative-wrap .footer-notes p { margin: 0 0 10px 0; }
        .indicative-wrap .footer-notes ol { margin: 4px 0 4px 20px; padding: 0; }
        .indicative-wrap .footer-notes li { margin-bottom: 4px; }
        .indicative-wrap .footer-contact { margin-top: 18px; text-align: center; padding: 12px 20px; border-top: 1px solid #e5e5e5; }
        .indicative-wrap .footer-contact-text { font-size: 10px; color: #6c7280; }
        .indicative-wrap .footer-contact-bdm { font-size: 11px; font-weight: 600; color: #212c60; margin-top: 3px; }
      </style>`;

    const page1 = `
<div class="indicative-page">
  <div class="header">
    <div class="header-left">
      <h1>Indicative Terms</h1>
      <div class="date">${todayDate}</div>
    </div>
    <div class="header-right"><img src="${logoSrc}" alt="Albatross Lending Group"></div>
  </div>
  <hr class="divider">
  <div class="info-row">
    <div class="info-card"><div class="label">Broker Name</div><div class="value">${brokerName}</div></div>
    <div class="info-card"><div class="label">Broker Firm</div><div class="value">${brokerFirm}</div></div>
    <div class="info-card"><div class="label">BDM Name</div><div class="value">${bdmName}</div></div>
  </div>
  <div class="info-row">
    <div class="info-card"><div class="label">Borrower</div><div class="value">${borrower}</div></div>
    <div class="info-card"><div class="label">Purpose</div><div class="value">${purpose}</div></div>
    <div class="info-card"><div class="label">Exit Strategy</div><div class="value">${exitStrategy}</div></div>
  </div>
  <div class="loan-section">
    <table class="loan-table">
      <tr><td class="col-label">Gross Loan</td><td class="col-value">${grossLoan}</td><td class="col-label-right">Term</td><td class="col-value-right">${term}</td></tr>
      <tr><td class="col-label">Arrangement Fee</td><td class="col-value">${asNAIfZero(arrangementFee)}</td><td class="col-label-right">Proc Fee</td><td class="col-value-right">${asNAIfZero(procFee)}</td></tr>
      <tr><td class="col-label">Additional Broker Fee</td><td class="col-value">${asNAIfZero(brokerFee)}</td><td class="col-label-right">Retained</td><td class="col-value-right">${asNAIfZero(retained)}</td></tr>
      <tr><td class="col-label">Admin Fee</td><td class="col-value">${asNAIfZero(adminFee)}</td><td class="col-label-right">Interest pcm</td><td class="col-value-right">${interestPcm}</td></tr>
      <tr><td class="col-label">Interest Per Month</td><td class="col-value">${interest}</td><td class="col-label-right">Interest Over Term</td><td class="col-value-right">${interestOverTerm}</td></tr>
      <tr><td class="col-label">Net Loan</td><td class="col-value">${netLoan}</td><td class="col-label-right">Exit Fee</td><td class="col-value-right">${asNAIfZero(exitFee)}</td></tr>${hasAVM ? `
      <tr><td class="col-label">AVM Fee</td><td class="col-value">${asNAIfZero(avmFee)}</td><td class="col-label-right"></td><td class="col-value-right"></td></tr>` : ''}${hasSecondCharge ? `
      <tr><td class="col-label">Second Charge Consent Fee</td><td class="col-value">${asNAIfZero(secondChargeFee)}</td><td class="col-label-right"></td><td class="col-value-right"></td></tr>` : ''}
    </table>
  </div>
  <div class="section-title security-title">Security Properties</div>
  <hr class="section-divider">
  <div class="property-section">
    <div class="property-table">
      <div class="property-table-header">
        <div class="property-table-header-cell">PROPERTY</div>
        <div class="property-table-header-cell">CHARGE</div>
        <div class="property-table-header-cell">OUTSTANDING</div>
        <div class="property-table-header-cell">MV</div>
        <div class="property-table-header-cell">${vpLabel}</div>
      </div>
      ${propertyRows}
      <div class="property-totals">
        <div class="property-totals-label">TOTALS</div>
        <div class="property-totals-value"></div>
        <div class="property-totals-value">${totalsOutstanding}</div>
        <div class="property-totals-value">${totalsMV}</div>
        <div class="property-totals-value">${totals180}</div>
      </div>
    </div>
  </div>
  <div class="footer-notes">
    <p>Please note these terms are subject to:</p>
    <ol>
      <li>Signed and completed application form</li>
      <li>Satisfactory valuation report and legal due diligence both at a fee to the Borrower</li>
      <li>Satisfactory credit and internal KYC checks on the Borrower</li>
    </ol>
  </div>
  <div class="footer-contact">
    <div class="footer-contact-text">To proceed, please get in touch with your Albatross Contact</div>
    ${showFooterBdm ? `<div class="footer-contact-bdm">${bdmName}</div>` : ''}
  </div>
</div>`;

    return `<div class="indicative-wrap">${css}${page1}</div>`;
}

/* ──────────────────────────────────────────────────────
 * Refurb / Development Indicative Terms Template
 * Same logo, colours and overall layout as the standard
 * template but with refurb-specific fields:
 *   - Gross Loan / Gross Drawdown / Net Loan / Net Drawdown
 *   - Day 1 Interest / Total Interest Rolled
 *   - Drawdown Fees / Overall Gross Loan
 *   - Per-property GDV & Cost of Works columns
 * ────────────────────────────────────────────────────── */
function _buildRefurbTermsHtml(data) {
    const {
        brokerName, brokerFirm, bdmName, borrower, purpose, exitStrategy,
        grossLoan, netLoan, grossDrawdown, netDrawdown,
        term, arrangementFee, procFee, brokerFee,
        retained, adminFee, interestPcm,
        day1Interest, totalInterestRolled, exitFee,
        totalDrawdownFees, numDrawdowns, overallGross, overallNet,
        totalCostOfWorks, extraFees, totalRepayment,
        avmFee, secondChargeFee, hasAVM, hasSecondCharge,
        propertyRows, totalsOutstanding, totalsMV, totals180,
        totalsGDV, totalsCW,
        todayDate, logoSrc
    } = data;

    const accent = '#f9a67e';                 // peach (same as standard)
    const asNAIfZero = (v) => {
        const raw = String(v ?? '').trim();
        if (!raw || raw === '–' || raw === '-') return raw || '–';
        const n = Number(raw.replace(/[^0-9.-]/g, ''));
        if (!isNaN(n) && n === 0) return 'N/A';
        return raw;
    };
    const footerBdmName = String(bdmName || '').trim();
    const showFooterBdm = footerBdmName && footerBdmName.toUpperCase() !== 'ALB';

    /* ── CSS ── */
    const css = `
      <style>
        @font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:400}
        @font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:600}
        .refurb-wrap *, .refurb-wrap *::before, .refurb-wrap *::after { box-sizing: border-box; }
        .refurb-wrap h1::before, .refurb-wrap h1::after,
        .refurb-wrap h2::before, .refurb-wrap h2::after { content: none !important; display: none !important; }

        .refurb-wrap {
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.4;
          color: #202b60;
          background: #fff;
          width: 794px;
        }
        .refurb-wrap .indicative-page {
          width: 794px;
          height: 1123px;
          padding: 50px 60px 40px 60px;
          background: #fff;
          position: relative;
          overflow: hidden;
        }
        .refurb-wrap .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .refurb-wrap .header-left h1 { font-family: 'Argent Regular', serif; font-weight: 400; font-size: 26px; color: #212c60; letter-spacing: -0.02em; line-height: 1.15; margin: 0; padding: 0; }
        .refurb-wrap .header-left .date { font-family: 'Montserrat', Arial, sans-serif; font-weight: 400; font-size: 14px; color: ${accent}; margin-top: 4px; }
        .refurb-wrap .header-right img { max-height: 48px; width: auto; }
        .refurb-wrap .divider { border: none; border-top: 1px solid #e5e5e5; margin: 16px 0; }

        .refurb-wrap .info-row { display: flex; gap: 12px; margin-bottom: 12px; }
        .refurb-wrap .info-card { background: #f9fbfc; border: 1px solid #e5e5e5; border-radius: 5px; padding: 14px 16px; flex: 1; }
        .refurb-wrap .info-card .label { font-size: 7.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #6c7280; margin-bottom: 6px; font-family: 'Montserrat', Arial, sans-serif; }
        .refurb-wrap .info-card .value { font-size: 10.5px; font-weight: 500; color: #051f3c; line-height: 1.3; font-family: 'Montserrat', Arial, sans-serif; }

        /* ── Loan dark table (4-col like standard) ── */
        .refurb-wrap .loan-section { background: #212c60; border-radius: 7px; padding: 18px 20px; margin-bottom: 16px; }
        .refurb-wrap .loan-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .refurb-wrap .loan-table td { padding: 8px 0; font-size: 9px; vertical-align: middle; border-bottom: 0.25px solid rgba(199,199,198,0.3); font-family: 'Montserrat', Arial, sans-serif; }
        .refurb-wrap .loan-table tr:last-child td { border-bottom: none; }
        .refurb-wrap .loan-table .col-label { font-weight: 400; color: #c7c7c6; width: 26%; padding-right: 10px; }
        .refurb-wrap .loan-table .col-value { font-weight: 600; color: #fff; text-align: right; width: 20%; font-size: 9px; padding-right: 15px; }
        .refurb-wrap .loan-table .col-label-right { font-weight: 400; color: #c7c7c6; width: 28%; padding-left: 50px; }
        .refurb-wrap .loan-table .col-value-right { font-weight: 600; color: #fff; text-align: right; width: 22%; font-size: 9px; }

        /* ── Property table ── */
        .refurb-wrap .section-title { font-family: 'Montserrat', Arial, sans-serif; font-size: 13.5px; color: #051f3c; margin-bottom: 12px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 600; }
        .refurb-wrap .section-title.security-title { font-family: 'Argent Regular', serif; text-transform: none; letter-spacing: 0; }
        .refurb-wrap .section-divider { border: none; border-top: 0.75px solid #e5e5e5; margin-bottom: 16px; }
        .refurb-wrap .property-section { margin-bottom: 16px; }
        .refurb-wrap .property-table{border:0.75px solid #e5e5e5;border-radius:4.5px;overflow:hidden;margin-bottom:25px}
        .refurb-wrap .property-table-header{background:#f9fbfc;display:grid;grid-template-columns:2fr 0.55fr 0.85fr 0.75fr 0.75fr 0.75fr 0.85fr;gap:6px;padding:10px 14px}
        .refurb-wrap .property-table-header-cell{font-size:6.5px;color:#061633;font-weight:600;letter-spacing:0.08em;text-transform:uppercase}
        .refurb-wrap .property-table-row{display:grid;grid-template-columns:2fr 0.55fr 0.85fr 0.75fr 0.75fr 0.75fr 0.85fr;gap:6px;padding:10px 14px;border-bottom:0.75px solid #e5e5e5;background:#fff}
        .refurb-wrap .property-table-row:last-child{border-bottom:none}
        .refurb-wrap .property-name{font-family:'Argent Regular',serif;font-size:9px;color:#384252;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .refurb-wrap .property-address{font-family:'Argent Regular',serif;font-size:7.5px;color:#6c7280;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .refurb-wrap .property-cell{font-family:'Argent Regular',serif;font-size:8.5px;color:#384252}
        .refurb-wrap .property-totals{background:${accent};display:grid;grid-template-columns:2fr 0.55fr 0.85fr 0.75fr 0.75fr 0.75fr 0.85fr;gap:6px;padding:6px 14px}
        .refurb-wrap .property-totals-label{font-size:9px;color:#051f3c;font-weight:600}
        .refurb-wrap .property-totals-value{font-size:8.5px;color:#051f3c;font-weight:600}

        .refurb-wrap .footer-notes { font-size: 11px; color: #061633; line-height: 1.6; margin-top: 20px; }
        .refurb-wrap .footer-notes p { margin: 0 0 10px 0; }
        .refurb-wrap .footer-notes ol { margin: 4px 0 4px 20px; padding: 0; }
        .refurb-wrap .footer-notes li { margin-bottom: 4px; }
        .refurb-wrap .footer-contact { margin-top: 18px; text-align: center; padding: 12px 20px; border-top: 1px solid #e5e5e5; }
        .refurb-wrap .footer-contact-text { font-size: 10px; color: #6c7280; }
        .refurb-wrap .footer-contact-bdm { font-size: 11px; font-weight: 600; color: #212c60; margin-top: 3px; }
      </style>`;

    /* ── Page 1 ── */
    const page1 = `
<div class="indicative-page">
  <div class="header">
    <div class="header-left">
      <h1>Indicative Terms</h1>
      <div class="date">${todayDate}</div>
    </div>
    <div class="header-right"><img src="${logoSrc}" alt="Albatross Lending Group"></div>
  </div>
  <hr class="divider">
  <div class="info-row">
    <div class="info-card"><div class="label">Broker Name</div><div class="value">${brokerName}</div></div>
    <div class="info-card"><div class="label">Broker Firm</div><div class="value">${brokerFirm}</div></div>
    <div class="info-card"><div class="label">BDM Name</div><div class="value">${bdmName}</div></div>
  </div>
  <div class="info-row">
    <div class="info-card"><div class="label">Borrower</div><div class="value">${borrower}</div></div>
    <div class="info-card"><div class="label">Purpose</div><div class="value">${purpose}</div></div>
    <div class="info-card"><div class="label">Exit Strategy</div><div class="value">${exitStrategy}</div></div>
  </div>
  <div class="loan-section">
    <table class="loan-table">
      <tr><td class="col-label">Gross Initial Loan</td><td class="col-value">${grossLoan}</td><td class="col-label-right">Net Initial Advance</td><td class="col-value-right">${netLoan}</td></tr>
      <tr><td class="col-label">Arrangement Fee</td><td class="col-value">${asNAIfZero(arrangementFee)}</td><td class="col-label-right">Proc Fee</td><td class="col-value-right">${asNAIfZero(procFee)}</td></tr>
      <tr><td class="col-label">Additional Broker Fee</td><td class="col-value">${asNAIfZero(brokerFee)}</td><td class="col-label-right">Admin Fee</td><td class="col-value-right">${asNAIfZero(adminFee)}</td></tr>
      <tr><td class="col-label">Day 1 Interest</td><td class="col-value">${day1Interest}</td><td class="col-label-right">Total Interest Rolled</td><td class="col-value-right">${totalInterestRolled}</td></tr>
      <tr><td class="col-label">Interest pcm</td><td class="col-value">${interestPcm}</td><td class="col-label-right">Term</td><td class="col-value-right">${term}</td></tr>
      <tr><td class="col-label">Gross Drawdowns</td><td class="col-value">${grossDrawdown}</td><td class="col-label-right">Net Drawdowns</td><td class="col-value-right">${netDrawdown}</td></tr>
      <tr><td class="col-label">Total Cost of Works</td><td class="col-value">${totalCostOfWorks}</td><td class="col-label-right">Total DD Fees (${numDrawdowns} draws)</td><td class="col-value-right">${totalDrawdownFees}</td></tr>
      <tr><td class="col-label">Overall Gross Loan</td><td class="col-value">${overallGross}</td><td class="col-label-right">Overall Net Advance</td><td class="col-value-right">${overallNet}</td></tr>
      <tr><td class="col-label">Exit Fee</td><td class="col-value">${asNAIfZero(exitFee)}</td><td class="col-label-right">Total Repayment</td><td class="col-value-right">${totalRepayment}</td></tr>${hasAVM ? `
      <tr><td class="col-label">AVM Fee</td><td class="col-value">${asNAIfZero(avmFee)}</td><td class="col-label-right"></td><td class="col-value-right"></td></tr>` : ''}${hasSecondCharge ? `
      <tr><td class="col-label">Second Charge Consent Fee</td><td class="col-value">${asNAIfZero(secondChargeFee)}</td><td class="col-label-right"></td><td class="col-value-right"></td></tr>` : ''}
    </table>
  </div>
  <div class="section-title security-title">Security Properties</div>
  <hr class="section-divider">
  <div class="property-section">
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
      ${propertyRows}
      <div class="property-totals">
        <div class="property-totals-label">TOTALS</div>
        <div class="property-totals-value"></div>
        <div class="property-totals-value">${totalsOutstanding}</div>
        <div class="property-totals-value">${totalsMV}</div>
        <div class="property-totals-value">${totals180}</div>
        <div class="property-totals-value">${totalsGDV}</div>
        <div class="property-totals-value">${totalsCW}</div>
      </div>
    </div>
  </div>
  <div class="footer-notes">
    <p>Please note these terms are subject to:</p>
    <ol>
      <li>Signed and completed application form</li>
      <li>Satisfactory valuation report and legal due diligence both at a fee to the Borrower</li>
      <li>Satisfactory credit and internal KYC checks on the Borrower</li>
    </ol>
  </div>
  <div class="footer-contact">
    <div class="footer-contact-text">To proceed, please get in touch with your Albatross Contact</div>
    ${showFooterBdm ? `<div class="footer-contact-bdm">${bdmName}</div>` : ''}
  </div>
</div>`;

    return `<div class="refurb-wrap">${css}${page1}</div>`;
}

async function downloadIndicativeTerms() {
    try {
        // Show notification (with fallback)
        if (typeof showCreditNotification === 'function') {
            showCreditNotification('Download started...', 'info');
        } else {
            console.log('Download started...');
        }

        // Ensure Google Fonts is loaded (with fallback)
        if (typeof _ensureAIPFonts === 'function') {
            _ensureAIPFonts();
        }

        // Detect SME product and fetch correct logo
        const isSME = (typeof State !== 'undefined' && State.product === 'sme');
        const logoFile = isSME ? 'SME_logo.png' : 'al_logo_blue.png';
        const logoResponse = await fetch(logoFile);
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(logoBlob);
        });

        // Get current calculator values
        const fmt = (n) => n ? '£' + Number(n).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '–';
        
        const brokerName = document.getElementById('broker')?.value || 'Unknown Broker';
        const brokerFirm = 'Broker Firm'; // TODO: get from form if available
        const bdmName = document.getElementById('bdm')?.value || 'Unknown BDM';
        const borrowerName = document.getElementById('applicant')?.value || 'Unknown Borrower';
        const purpose = 'Development Finance'; // TODO: get from form
        const exitStrategy = 'Sale/Refinance'; // TODO: get from form
        
        // Get values from calculator summary - match by label text to avoid fragile nth-child
        const summaryEl = document.getElementById('summary');
        const findSummaryVal = (lbl) => { for (const el of (summaryEl?.querySelectorAll('.terms-item') || [])) { if (el.querySelector('.label')?.textContent?.trim().toLowerCase().startsWith(lbl.toLowerCase())) return el.querySelector('.value')?.textContent?.trim() || '–'; } return '–'; };
        const grossLoanText = findSummaryVal('Gross Loan');
        const netLoanText = findSummaryVal('Net Initial Loan');
        const arrFeeText = findSummaryVal('Arrangement Fee');
        const brokerFeeText = findSummaryVal('Broker Fee');
        const procFeeText = findSummaryVal('Proc Fee');
        const adminFeeText = findSummaryVal('Admin Fee');
        const interestText = findSummaryVal('Modelled Interest');
        const exitFeeText = findSummaryVal('Exit Fee');
        const monthlyInterestText = document.getElementById('rate')?.value ? parseFloat(document.getElementById('rate').value).toFixed(2) + '%' : '–';
        
        const rateVal = parseFloat(document.getElementById('rate')?.value || '0');
        const termVal = parseInt(document.getElementById('term')?.value || '12');
        const retained = document.getElementById('net_drawdowns')?.value ? fmt(parseFloat(document.getElementById('net_drawdowns').value)) : '–';
        const normalizeChargeLabel = (value) => {
          const chargeVal = String(value ?? '').trim().toLowerCase();
          if (['1', '1st', 'first'].includes(chargeVal)) return '1st';
          if (['2', '2nd', 'second'].includes(chargeVal)) return '2nd';
          return value || '1st';
        };
        
        // Get property data and check for AVM/Second Charge
        const propertyTable = document.getElementById('properties');
        const propertyRows = [];
        let hasSecondCharge = false;
        let hasAVM = false;
        
        if (propertyTable) {
            const rows = propertyTable.tBodies[0].rows;
            for (let row of rows) {
                if (row.classList.contains('inactive-property')) continue;
                const chargeSelect = row.cells[2]?.querySelector('select');
                if (chargeSelect?.value === 'None') continue;
                
                const address = row.cells[0]?.querySelector('input')?.value || 'Address not available';
                const propertyName = address.split(',')[0]?.trim() || 'Security Property';
                const chargeRaw = chargeSelect?.value || '1';
                const charge = normalizeChargeLabel(chargeRaw);
                const outstanding = row.querySelector('.debt-input')?.value || '0';
                const mv = row.cells[3]?.querySelector('.input-with-prefix input')?.value || '0';
                const mv180 = row.cells[4]?.querySelector('.input-with-prefix input')?.value || '0';
                
                // Check for second charge
                if (charge === '2nd') hasSecondCharge = true;
                
                propertyRows.push(`
                  <tr>
                    <td><div class="property-name">${propertyName}</div><div class="property-address">${address}</div></td>
                    <td>${charge}</td>
                    <td>${fmt(parseFloat(outstanding))}</td>
                    <td>${fmt(parseFloat(mv))}</td>
                    <td>${fmt(parseFloat(mv180))}</td>
                  </tr>`);
            }
        }
        
        // Check for AVM valuation type (check if there's a valuation selector)
        const valuationTypeSelect = document.getElementById('valuation-type') || document.querySelector('[name="valuation-type"]');
        if (valuationTypeSelect && valuationTypeSelect.value === 'AVM') {
            hasAVM = true;
        }
        
        // Calculate totals
        let totalOutstanding = 0, totalMV = 0, total180 = 0;
        if (propertyTable) {
            const rows = propertyTable.tBodies[0].rows;
            for (let row of rows) {
                if (row.classList.contains('inactive-property')) continue;
                const chargeSelect = row.cells[2]?.querySelector('select');
                if (chargeSelect?.value === 'None') continue;
                
            totalOutstanding += parseFloat(row.querySelector('.debt-input')?.value || '0');
                totalMV += parseFloat(row.cells[3]?.querySelector('.input-with-prefix input')?.value || '0');
                total180 += parseFloat(row.cells[4]?.querySelector('.input-with-prefix input')?.value || '0');
            }
        }
        
        const ordinal = (d) => { const s=['th','st','nd','rd'], v=d%100; return d+(s[(v-20)%10]||s[v]||s[0]); };
        const fmtDate = (dt) => `${ordinal(dt.getDate())} ${dt.toLocaleDateString('en-GB',{month:'long'})} ${dt.getFullYear()}`;
        const todayDate = fmtDate(new Date());
        
        // Calculate interest over term (interest per month should be already modelled interest, so calculate total)
        const grossLoanNum = parseFloat(grossLoanText.replace(/[£,]/g, '')) || 0;
        const interestPerMonth = (grossLoanNum * rateVal) / 100;
        const interestOverTerm = interestPerMonth * termVal;
        
        const html = _buildIndicativeTermsHtml({
            brokerName, brokerFirm, bdmName,
            borrower: borrowerName, purpose, exitStrategy,
            grossLoan: grossLoanText, netLoan: netLoanText,
            term: `${termVal} Months`, arrangementFee: arrFeeText,
            procFee: procFeeText, brokerFee: brokerFeeText,
            retained: `${termVal} Months`, adminFee: adminFeeText,
            interestPcm: rateVal.toFixed(2) + '%', interest: fmt(interestPerMonth),
            exitFee: exitFeeText, interestMonthly: rateVal.toFixed(2) + '%',
            interestOverTerm: fmt(interestOverTerm),
            avmFee: '£75.00', secondChargeFee: '£250.00',
            hasAVM, hasSecondCharge,
            propertyRows: propertyRows.join(''),
            totalsOutstanding: fmt(totalOutstanding), totalsMV: fmt(totalMV),
            totals180: fmt(total180),
            todayDate, logoSrc: logoBase64, isSME: isSME
        });

        // Render
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:fixed;top:0;left:0;z-index:-9999;opacity:0.01;pointer-events:none;';
        wrapper.innerHTML = html;
        document.body.appendChild(wrapper);

        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 600));

        const pages = wrapper.querySelectorAll('.indicative-page');
        if (!pages.length) throw new Error('No pages found');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const A4_W = 210, A4_H = 297;

        for (let i = 0; i < pages.length; i++) {
            const canvas = await html2canvas(pages[i], {
                scale: 4,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794,
                height: 1123,
                windowWidth: 794,
                scrollX: 0,
                scrollY: 0,
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, 0, A4_W, A4_H);
        }

        const itBorrower = (borrowerName || 'Unknown').replace(/[/\\?%*:|"<>]/g, '-').trim();
        pdf.save(`${itBorrower} - Indicative Terms.pdf`);
        document.body.removeChild(wrapper);

        // Log the Terms download
        if (typeof logUserAction === 'function') {
            logUserAction('DOWNLOADED INDICATIVE TERMS', {
                borrower: borrowerName,
                broker: brokerName,
                grossLoan: grossLoanText
            });
        }

        if (typeof showCreditNotification === 'function') {
            showCreditNotification('Indicative Terms PDF downloaded', 'success');
        } else {
            console.log('Indicative Terms PDF downloaded');
        }
    } catch (error) {
        console.error('Error generating Indicative Terms:', error);
        if (typeof showCreditNotification === 'function') {
            showCreditNotification('Error generating Indicative Terms document', 'error');
        } else {
            alert('Error generating Indicative Terms document');
        }
    }
}

// Make function globally available
window.downloadIndicativeTerms = downloadIndicativeTerms;
