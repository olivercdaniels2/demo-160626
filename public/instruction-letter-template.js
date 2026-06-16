// Valuation Instruction Letter PDF Template
// Generates a professional PDF instruction letter to the surveyor
// Uses same html2canvas → jsPDF pattern as AIP & Indicative Terms templates
// Always uses standard (Albatross Lending) branding regardless of product

function _buildInstructionLetterHtml(data) {
    const accent = '#f9a67e';   // Always standard branding for instruction letters

    const css = `<style>
@font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:400}
@font-face{font-family:'Argent Regular';src:url('./Fonts/Argent-Regular.otf') format('opentype');font-weight:600}
.vil-wrap *,.vil-wrap *::before,.vil-wrap *::after{box-sizing:border-box;margin:0;padding:0}
.vil-wrap h1::before,.vil-wrap h1::after,.vil-wrap h2::before,.vil-wrap h2::after{content:none !important;display:none !important}
.vil-wrap,.vil-wrap *{font-family:'Argent Regular',serif !important}
.vil-wrap{font-family:'Argent Regular',serif;background:#fff;padding:0;margin:0;font-size:9.75px;color:#384252;line-height:1.5}
.vil-wrap .page{width:794px;min-height:1123px;padding:55px 52px 40px 52px;background:#fff;position:relative}
.vil-wrap .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.vil-wrap .header-left{flex:1}
.vil-wrap .header-title{font-family:'Argent CF',serif;font-size:24px;font-weight:400;color:#212c60;margin-bottom:4px;letter-spacing:-0.02em}
.vil-wrap .header-subtitle{font-size:14px;color:#35488f;margin-bottom:4px}
.vil-wrap .header-date{font-size:14px;color:${accent};font-weight:400;margin-bottom:0}
.vil-wrap .header-right img{max-height:48px;width:auto}
.vil-wrap .header-divider{border:none;border-top:0.75px solid #e5e5e5;margin:12px 0 18px 0}

.vil-wrap .info-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px}
.vil-wrap .info-card{background:#f9fbfc;border:0.75px solid #e5e5e5;border-radius:3px;padding:12px 14px}
.vil-wrap .info-card-label{font-size:7.5px;color:#6c7280;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;font-weight:600}
.vil-wrap .info-card-value{font-size:10.5px;color:#051f3c;font-weight:500;line-height:1.35}

.vil-wrap .section-title{font-family:'Argent CF',serif;font-size:13.5px;color:#051f3c;margin-bottom:10px;letter-spacing:0.05em;text-transform:uppercase;font-weight:600}
.vil-wrap .section-divider{border:none;border-top:0.75px solid #e5e5e5;margin-bottom:14px}

.vil-wrap .property-table{border:0.75px solid #e5e5e5;border-radius:4.5px;overflow:hidden;margin-bottom:20px;width:100%}
.vil-wrap .property-table-header{background:#f9fbfc;display:grid;grid-template-columns:2.5fr 1fr 1fr;gap:12px;padding:10px 16px}
.vil-wrap .property-table-header-cell{font-size:7.5px;color:#061633;font-weight:600;letter-spacing:0.1em;text-transform:uppercase}
.vil-wrap .property-table-row{display:grid;grid-template-columns:2.5fr 1fr 1fr;gap:12px;padding:11px 16px;border-bottom:0.75px solid #e5e5e5;background:#fff}
.vil-wrap .property-table-row:last-child{border-bottom:none}
.vil-wrap .property-name{font-family:'Argent CF',serif;font-size:9.75px;color:#384252;font-weight:600;margin-bottom:2px}
.vil-wrap .property-address{font-family:'Argent CF',serif;font-size:8.25px;color:#6c7280;line-height:1.3}
.vil-wrap .property-cell{font-family:'Argent CF',serif;font-size:9.75px;color:#384252}
.vil-wrap .property-totals{background:${accent};display:grid;grid-template-columns:2.5fr 1fr 1fr;gap:12px;padding:6px 16px}
.vil-wrap .property-totals-label{font-size:9px;color:#051f3c;font-weight:600}
.vil-wrap .property-totals-value{font-size:9px;color:#051f3c;font-weight:600}

.vil-wrap .letter-body{font-size:9.75px;color:#384252;line-height:1.65;margin-bottom:14px}
.vil-wrap .letter-body p{margin-bottom:10px}
.vil-wrap .letter-body strong{color:#051f3c;font-weight:600}

.vil-wrap .contact-box{background:#f9fbfc;border:0.75px solid #e5e5e5;border-radius:4.5px;padding:14px 18px;margin-bottom:18px}
.vil-wrap .contact-row{display:flex;gap:8px;margin-bottom:4px;font-size:9.75px}
.vil-wrap .contact-label{color:#6c7280;font-weight:600;min-width:120px}
.vil-wrap .contact-value{color:#051f3c;font-weight:500}

.vil-wrap .navy-bar{background:#212c60;border-radius:4.5px;padding:16px 22px;margin-bottom:18px}
.vil-wrap .navy-bar-title{font-family:'Argent CF',serif;font-size:13px;color:${accent};margin-bottom:10px;letter-spacing:-0.02em}
.vil-wrap .navy-bar-text{font-size:9px;color:#c7c7c6;line-height:1.6}
.vil-wrap .navy-bar-text strong{color:#fff;font-weight:600}

.vil-wrap .val-bases-list{margin:0;padding:0;list-style:none}
.vil-wrap .val-bases-list li{font-size:9px;color:#384252;line-height:1.65;margin-bottom:5px;padding-left:14px;position:relative}
.vil-wrap .val-bases-list li:before{content:"•";position:absolute;left:0;color:#212c60;font-weight:700;font-size:9px}

.vil-wrap .terms-list{list-style:none;padding:0;margin:0}
.vil-wrap .terms-list>li{font-size:9px;color:#384252;line-height:1.65;margin-bottom:7px;padding-left:16px;position:relative}
.vil-wrap .terms-list>li:before{content:"•";position:absolute;left:0;color:#212c60;font-weight:700;font-size:9px}

.vil-wrap .signoff{margin-top:22px;font-size:9.75px;color:#384252}
.vil-wrap .signoff-name{font-size:11px;color:#051f3c;font-weight:600;margin-top:3px}
.vil-wrap .signoff-title{font-size:9px;color:#6c7280}

.vil-wrap .footer{border-top:0.75px solid #e5e5e5;padding-top:10px;text-align:center;position:absolute;bottom:40px;left:52px;right:52px}
.vil-wrap .footer-company{font-size:7.5px;color:#6c7280;font-weight:600;margin-bottom:3px}
.vil-wrap .footer-disclaimer{font-size:7.5px;color:#6c7280}
.vil-wrap .footer-email{font-size:7.5px;color:#35488f;font-weight:600}
</style>`;

    // Property table rows
    const propRowsHtml = data.properties.map(p => `<div class="property-table-row">
        <div><div class="property-name">${p.name}</div><div class="property-address">${p.address}</div></div>
        <div class="property-cell">${p.charge}</div>
        <div class="property-cell">${p.estimatedValue}</div>
    </div>`).join('');

    // Page 1: Header, reference cards, property table, letter intro + contact box
    const page1 = `
<div class="page">
<div class="header">
    <div class="header-left">
        <div class="header-title">Valuation Instruction Letter</div>
        <div class="header-subtitle">Confidential – Addressed to Surveyor</div>
        <div class="header-date">${data.todayDate}</div>
    </div>
    <div class="header-right"><img src="${data.logoSrc}" alt="Albatross Lending Group"></div>
</div>
<hr class="header-divider"/>

<div class="info-cards">
    <div class="info-card"><div class="info-card-label">SURVEYOR</div><div class="info-card-value">${data.surveyorName}</div></div>
    <div class="info-card"><div class="info-card-label">OUR REFERENCE</div><div class="info-card-value">${data.caseRef}</div></div>
    <div class="info-card"><div class="info-card-label">BORROWER</div><div class="info-card-value">${data.borrower}</div></div>
</div>

<div class="letter-body">
    <p>Dear Sir,</p>
    <p>We would like to formally instruct you to prepare a Valuation and Report on behalf of <strong>Albatross Lending Group Ltd</strong>, or any successors in title and/or assignees, for the security propert${data.properties.length > 1 ? 'ies' : 'y'} stated below.</p>
</div>

<div class="section-title">Security Properties</div>
<hr class="section-divider"/>
<div class="property-table">
    <div class="property-table-header">
        <div class="property-table-header-cell">PROPERTY</div>
        <div class="property-table-header-cell">CHARGE</div>
        <div class="property-table-header-cell">ESTIMATED VALUE</div>
    </div>
    ${propRowsHtml}
    <div class="property-totals">
        <div class="property-totals-label">TOTAL ESTIMATED VALUE</div>
        <div class="property-totals-value"></div>
        <div class="property-totals-value">${data.totalEstimatedValue}</div>
    </div>
</div>

<div class="letter-body">
    <p>Please make contact with the Borrower to collect your fee and arrange access on the details below:</p>
</div>
<div class="contact-box">
    <div class="contact-row"><span class="contact-label">Name (${data.contactLabel || 'Borrower'}):</span><span class="contact-value">${data.borrowerContact}</span></div>
    <div class="contact-row"><span class="contact-label">Telephone Number:</span><span class="contact-value">${data.borrowerPhone}</span></div>
    <div class="contact-row"><span class="contact-label">Email Address:</span><span class="contact-value">${data.borrowerEmail}</span></div>
</div>

<div class="letter-body">
    <p>Albatross Lending Group Ltd, and/or any successors in title and/or assignees, places considerable reliance on the worth of the security property assuming always that we may be required to repossess and dispose of the security property in order to repay the customer's debt to us.</p>
    <p><strong>Introduction</strong> – You are instructed to provide a report and valuation of the Property for secured loan purposes in accordance with the latest version of RICS Valuation – Global Standards 2025 'the Red Book'.</p>
    <p>The report is to be addressed to <strong>Albatross Lending Group Ltd</strong> and associated group companies (the "Lender") in accordance with the terms set out in this instruction letter.</p>
    <p>You must retain a copy of the report and valuation including site notes / comparable evidence and also maintain appropriate run-off cover for a period of <strong>six years</strong> following the date of your report. The Professional Indemnity Insurance Policy must be in your own name, effected and maintained with an insurer approved by the Royal Institution of Chartered Surveyors, providing full cover against potential liabilities including claims for breach of instructions and professional negligence. The policy must comply with the RICS Approved Minimum Wording requirements.</p>
    <p>You will not do anything which might invalidate any Professional Indemnity Insurance Policy or prejudice our entitlement thereunder. You will upon request provide us with evidence of the existence and renewal of the policy, the name of the insurer and proof of payment of the premium.</p>
    <p>We never lend on security of property where we are taking a 1st legal charge and are aware that the borrower or any related or connected person uses or intends to use the property as a dwelling. Please report to us who is in occupation of the property and let us know immediately if you believe or suspect that the borrower or any related or connected person uses or intends to use the property as a dwelling.</p>
    <p>Please note that you are not our agent for any purpose and you must not make any representation or warranty on our behalf or commit us to any obligation or liability.</p>
</div>

<div class="footer">
    <div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
    <div class="footer-disclaimer">This instruction letter is confidential and intended solely for the addressed surveyor.</div>
</div>
</div>`;

    // Page 2: Valuation bases, key terms, access, fees, compliance, conflicts
    const page2 = `
<div class="page">
<div class="header">
    <div class="header-left">
        <div class="header-title" style="font-size:18px;">Valuation Instruction Letter</div>
        <div class="header-subtitle" style="font-size:11px;">continued – ${data.caseRef}</div>
    </div>
    <div class="header-right"><img src="${data.logoSrc}" alt="Albatross Lending Group" style="max-height:36px;"></div>
</div>
<hr class="header-divider"/>

<div class="navy-bar">
    <div class="navy-bar-title">Bases of Valuations</div>
    <div class="navy-bar-text">Your report and valuation should be on the following bases. Please provide a valuation of the property based on its existing planning / condition <strong>excluding</strong> any 'hope' value or goodwill:</div>
</div>

<ul class="val-bases-list">
    <li>Market Value subject to, and with the benefit of, any existing leases or tenancies</li>
    <li>Market Value subject to, and with the benefit of, any existing leases or tenancies, with the special assumption of a sale to be completed within <strong>180 days</strong></li>
    <li>Market Value subject to, and with the benefit of, any existing leases or tenancies, with the special assumption of a sale to be completed within <strong>90 days</strong></li>
    <li>Market Value with the assumption of vacant possession</li>
    <li>Market Value with the assumption of vacant possession, and the special assumption of a sale to be completed within <strong>180 days</strong></li>
    <li>Market Value with the assumption of vacant possession, and the special assumption of a sale to be completed within <strong>90 days</strong></li>
    <li>Market Rent</li>
    <li>Estimated Reinstatement Cost Assessment – the figure should allow for site clearance, building works, professional fees, debris removal and any local authority costs</li>
</ul>

<div style="margin-top:16px;" class="letter-body">
    <p><strong>For Development Sites</strong> (if applicable and in addition to the above):</p>
</div>
<ul class="val-bases-list">
    <li>Gross Development Value</li>
    <li>Gross Development Value with the assumption of vacant possession, with the special assumption of a sale to be completed within 180 days</li>
    <li>Market Rent with the special assumption that the stated works have been completed</li>
</ul>

<div style="margin-top:16px;" class="letter-body">
    <p><strong>For Going Concerns</strong> (if applicable):</p>
</div>
<ul class="val-bases-list">
    <li>MV1: Market Value including goodwill, fixtures &amp; fittings</li>
    <li>MV2: As above but assuming no trading records are available, but the business continues to trade</li>
    <li>MV3: As MV2 assuming that trade has ceased, no trading records are available and that the trade inventory has been removed</li>
    <li>MV4: As MV3 but assuming a sale is to be completed within 180 days</li>
    <li>MV5: As MV3 but assuming a sale is to be completed within 90 days</li>
</ul>

<div style="margin-top:16px;" class="letter-body">
    <p><strong>For Portfolio Valuations</strong> (if applicable): Separate valuations for the individual properties within a portfolio must be provided. Where a portfolio consists of numerous properties/units in one development or in close proximity, the valuer is expected to provide additional valuations taking into consideration a discount for quantum.</p>
    <p><strong>For New Build Properties:</strong> All valuations relating to newly built or newly converted properties must be based on second-hand values, supported by suitable comparable evidence sourced from within the resale market.</p>
</div>

<div style="margin-top:16px;">
    <div class="section-title">Key Terms</div>
    <hr class="section-divider"/>
</div>

<ul class="terms-list">
    <li><strong>Access</strong> – To arrange access to the Property please contact the borrower directly. Please provide details of any parts of the Property that were not inspected within your report.</li>
    <li><strong>Valuation Fee</strong> – You will collect the valuation fee from the borrower directly. Please obtain payment prior to booking your visit.</li>
    <li><strong>Compliance</strong> – You must carry out your report and valuation in accordance with the terms of this instruction letter. Where our instructions and your own terms of business conflict, our instructions will prevail. You must not sub-contract your duties. In accepting this instruction, you confirm that you hold professional indemnity insurance at a minimum level equal to the valuation you are providing.</li>
    <li><strong>Conflicts of Interest</strong> – Confirmation that no conflicts of interest exist, either personal or in relation to your firm, or to the borrower and/or the property.</li>
</ul>

<div class="footer">
    <div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
    <div class="footer-disclaimer">This instruction letter is confidential and intended solely for the addressed surveyor.</div>
</div>
</div>`;

    // Page 3: Report requirements, sign-off & signatory
    const page3 = `
<div class="page">
<div class="header">
    <div class="header-left">
        <div class="header-title" style="font-size:18px;">Valuation Instruction Letter</div>
        <div class="header-subtitle" style="font-size:11px;">continued – ${data.caseRef}</div>
    </div>
    <div class="header-right"><img src="${data.logoSrc}" alt="Albatross Lending Group" style="max-height:36px;"></div>
</div>
<hr class="header-divider"/>

<div class="section-title" style="font-size:12px;margin-bottom:6px;">Report Requirements</div>
<hr class="section-divider" style="margin-bottom:8px;"/>

<div class="letter-body" style="margin-bottom:6px;">
    <p style="margin-bottom:4px;">Below is a summary of our minimum requirements for the content of your report:</p>
</div>

<ul class="terms-list" style="margin-bottom:8px;">
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Executive Summary</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Location and detailed description of the property</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Construction, site area and ground conditions</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Schedule of accommodation and full measurement in line with the most recent RICS guidance</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Commentary on rights of access and whether the Property has access to an adopted highway</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Commentary on whether the Property is suitable for loan security purposes</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Tenure and principal lease terms for leasehold properties, including any unusual terms likely to affect value</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Tenancies – a summary of relevant leases and tenancy agreements, comments on tenant covenant strength; void periods and incentives</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Connected services, Council Tax band / Rateable Value</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Energy Performance Certificates – review and comment on impact of MEES Regulations; provide copy of most recent EPC</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">HMO Licensing – advise whether property is an HMO and whether registered under mandatory licensing; comment on minimum size requirements</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Town Planning – confirm current/intended use conforms to Use Classes Order; confirm listed building or conservation area status; confirm planning consent and building regulations compliance</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Invasive Vegetation, Contamination, and/or Hazardous Substances – comment on whether identified; recommend specialist report if appropriate</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Flooding – undertake appropriate checks to determine flood risk</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Fire Risk Assessment and Cladding (for flats) – comment on EWS1 form requirement per latest RICS guidance</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Economic Life – provide opinion on projected useful life assuming normal maintenance</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Local Market Commentary – discuss general letting and sales market; comment on value trends</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Comparable Evidence – provide details of comparable transactions relied upon with clear calculations</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Sales History – if recently marketed or sold, provide details; otherwise include a statement to that effect</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Valuation Methodology – clearly set out methodology and calculations; explain and justify any special assumptions</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Suitability for Secured Lending – provide opinion on present saleability and sustainability over the loan term; state any concerns re: realisation in a recoveries scenario</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Lender Action Points – explicit action points for the Lender, legal advisors or third-party specialists to underpin the valuation</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Lending risks both short and medium term</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Residential Element as a Percentage – state what percentage is residential and provide details</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Equality Act issues</li>
</ul>

<div style="margin-top:6px;" class="letter-body" style="margin-bottom:6px;">
    <p style="font-size:8.25px;margin-bottom:4px;"><strong>Additional Information for Development Sites:</strong> A full residual appraisal, breakdown of building costs benchmarked against BCIS/industry standards, commentary on anticipated duration of works, copies of relevant planning consents, commentary on anticipated demand and local market context.</p>
</div>

<div style="margin-top:8px;">
    <div class="section-title" style="font-size:12px;margin-bottom:6px;">Appendices &amp; Sign-Off</div>
    <hr class="section-divider" style="margin-bottom:6px;"/>
</div>

<ul class="terms-list" style="margin-bottom:6px;">
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Sufficient colour photographs of the street scene, exterior (front and rear) and interior of the Property</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">A general location map and detailed plan showing assumed boundaries</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Land Registry extract</li>
    <li style="margin-bottom:2px;font-size:8.25px;line-height:1.5;">Report on Title – The Lender may require its acting solicitors to send you a copy of their Report on Title. Please respond to any such post-valuation request without delay.</li>
</ul>

<div style="margin-top:6px;" class="letter-body">
    <p style="font-size:8.25px;margin-bottom:4px;"><strong>Sign Off</strong> – The report must be undertaken and signed by a qualified valuer with a minimum <strong>2 years PQE</strong> (MRICS/FRICS and RICS registered valuer). All residential and commercial valuation reports (excluding short-form residential templates) must be countersigned by a Chartered Surveyor with a minimum of <strong>5 years PQE</strong>.</p>
    <p style="font-size:8.25px;margin-bottom:4px;">Please send the Valuation Report as a PDF to <strong>lending@albatrosslending.co.uk</strong>. Draft reports are not acceptable. Following provision of the report, you should be prepared to discuss its contents with the Lender.</p>
</div>

<div class="signoff" style="margin-top:10px;">
    <p>Yours sincerely,</p>
    <div class="signoff-name">Joshua Field</div>
    <div class="signoff-title">Head of Credit</div>
</div>

<div class="footer">
    <div class="footer-company">Albatross Lending Group | www.albatrosslendinggroup.co.uk</div>
    <div class="footer-email">lending@albatrosslending.co.uk</div>
</div>
</div>`;

    return `<div class="vil-wrap">${css}${page1}${page2}${page3}</div>`;
}


/**
 * Generate and download a Valuation Instruction Letter PDF for a specific property.
 * Called from the valuation tab when the user clicks "Instruct Valuer" and selects a valuer.
 *
 * @param {object} opts
 * @param {number} opts.propIndex     - Index into _valState.properties
 * @param {string} opts.valuerName    - Name of the selected valuer firm
 * @param {number} opts.valuerFee     - Quoted fee (ex VAT)
 */
async function downloadInstructionLetter(opts) {
    let renderFrame = null;
    try {
        if (typeof showToast === 'function') showToast('Generating instruction letter…', 'info');

        // ── Logo (always standard Albatross branding) ──
        const logoResponse = await fetch('al_logo_blue.png');
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(logoBlob);
        });

        // ── Helpers ──
        const fmtMoney = n => n ? '£' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '–';
        const ordinal = d => { const s = ['th','st','nd','rd'], v = d % 100; return d + (s[(v-20)%10] || s[v] || s[0]); };
        const fmtDate = dt => `${ordinal(dt.getDate())} ${dt.toLocaleDateString('en-GB', { month: 'long' })} ${dt.getFullYear()}`;
        const today = new Date();
        const todayDate = fmtDate(today);

        // ── Case reference ──
        const currentCase = (typeof caseQueue !== 'undefined')
            ? caseQueue.find(q => q.id === (typeof State !== 'undefined' ? State.currentCaseId : null))
            : null;
        const caseRef = currentCase?.ref || 'CASE';

        // ── Borrower ──
        const companyName = document.getElementById('company-name-input')?.value?.trim();
        const firstIndividual = document.getElementById('individual-name-1')?.value?.trim();
        const borrower = companyName || firstIndividual || currentCase?.name || 'N/A';

        // ── Borrower contact details (read from Valuation Contact POC section) ──
        let borrowerContact = borrower;
        let borrowerPhone = 'To be confirmed';
        let borrowerEmail = 'To be confirmed';
        let contactLabel = 'Borrower';

        // Determine which valuation POC toggle is active
        const pocToggle = document.getElementById('valuation-poc-toggle');
        let pocType = 'applicant';
        if (pocToggle) {
            const activeBtn = pocToggle.querySelector('.toggle-group-btn.active');
            if (activeBtn) {
                const onclick = activeBtn.getAttribute('onclick') || '';
                const m = onclick.match(/setValuationPOC\('([^']+)'/);
                if (m) pocType = m[1];
            }
        }

        if (pocType === 'applicant') {
            // Read selected individual from dropdown
            const sel = document.getElementById('valuation-poc-individual');
            const selectedIdx = sel?.value;
            if (selectedIdx) {
                const name = document.getElementById(`individual-name-${selectedIdx}`)?.value?.trim();
                const phone = document.getElementById(`individual-phone-${selectedIdx}`)?.value?.trim();
                const email = document.getElementById(`individual-email-${selectedIdx}`)?.value?.trim();
                if (name) borrowerContact = name;
                if (phone) borrowerPhone = phone;
                if (email) borrowerEmail = email;
                contactLabel = 'Applicant';
            } else {
                // Fallback to first individual
                borrowerContact = firstIndividual || borrower;
                borrowerPhone = document.getElementById('individual-phone-1')?.value?.trim() || 'To be confirmed';
                borrowerEmail = document.getElementById('individual-email-1')?.value?.trim() || 'To be confirmed';
                contactLabel = 'Applicant';
            }
        } else if (pocType === 'agent') {
            const agentName = document.getElementById('valuation-agent-name')?.value?.trim();
            const agentCompany = document.getElementById('valuation-agent-company')?.value?.trim();
            const agentPhone = document.getElementById('valuation-agent-phone')?.value?.trim();
            const agentEmail = document.getElementById('valuation-agent-email')?.value?.trim();
            borrowerContact = agentName ? (agentCompany ? `${agentName} (${agentCompany})` : agentName) : (agentCompany || borrower);
            if (agentPhone) borrowerPhone = agentPhone;
            if (agentEmail) borrowerEmail = agentEmail;
            contactLabel = 'Agent';
        } else if (pocType === 'other') {
            const otherName = document.getElementById('valuation-other-name')?.value?.trim();
            const otherRole = document.getElementById('valuation-other-role')?.value?.trim();
            const otherPhone = document.getElementById('valuation-other-phone')?.value?.trim();
            const otherEmail = document.getElementById('valuation-other-email')?.value?.trim();
            borrowerContact = otherName ? (otherRole ? `${otherName} (${otherRole})` : otherName) : borrower;
            if (otherPhone) borrowerPhone = otherPhone;
            if (otherEmail) borrowerEmail = otherEmail;
            contactLabel = otherRole || 'Other';
        }

        // ── Charge normalisation ──
        const normalizeCharge = v => {
            const c = String(v ?? '').trim().toLowerCase();
            if (['1', '1st', 'first'].includes(c)) return '1st';
            if (['2', '2nd', 'second'].includes(c)) return '2nd';
            return v || '1st';
        };

        // ── Properties ──
        const propCount = (typeof State !== 'undefined' ? State.propertyCount : null) || 1;
        const properties = [];
        let totalEstimatedValue = 0;
        for (let i = 1; i <= propCount; i++) {
            const addr = document.getElementById(`property-addr-${i}`)?.value?.trim() || `Property ${i}`;
            const propName = addr.split(',')[0]?.trim() || 'Security Property';
            const chargeVal = document.getElementById(`property-charge-${i}`)?.value || '1';
            const charge = normalizeCharge(chargeVal);
            const mv = parseFloat((document.getElementById(`property-omv-${i}`)?.value || '0').replace(/,/g, '')) || 0;
            totalEstimatedValue += mv;
            properties.push({
                name: propName,
                address: addr,
                charge,
                estimatedValue: fmtMoney(mv)
            });
        }

        // ── Surveyor ──
        const surveyorName = opts.valuerName || 'N/A';

        // ── Build HTML ──
        const data = {
            todayDate,
            logoSrc: logoBase64,
            caseRef,
            surveyorName,
            borrower,
            borrowerContact,
            borrowerPhone,
            borrowerEmail,
            contactLabel,
            properties,
            totalEstimatedValue: fmtMoney(totalEstimatedValue)
        };

        const html = _buildInstructionLetterHtml(data);

        // ── Render off-screen ──
        renderFrame = document.createElement('div');
        renderFrame.style.cssText = 'position:fixed;top:0;left:0;z-index:-9999;opacity:0.01;pointer-events:none;';
        renderFrame.setAttribute('aria-hidden', 'true');
        renderFrame.innerHTML = html;
        document.body.appendChild(renderFrame);

        // Wait for fonts
        try { await document.fonts.ready; } catch (e) { /* ignore */ }
        await new Promise(resolve => setTimeout(resolve, 600));

        // ── html2canvas → jsPDF ──
        if (typeof html2canvas === 'undefined') throw new Error('html2canvas library not loaded');
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') throw new Error('jsPDF library not loaded');

        const pages = renderFrame.querySelectorAll('.page');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'px', format: [794, 1123], compress: true });

        for (let i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage();
            const canvas = await html2canvas(pages[i], {
                scale: 4, useCORS: true, allowTaint: true,
                backgroundColor: '#ffffff', width: 794, height: 1123,
                windowWidth: 794, scrollX: 0, scrollY: 0, logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123, undefined, 'FAST');
        }

        const safeBorrower = (borrower || 'Unknown').replace(/[/\\?%*:|"<>]/g, '-').trim();
        const safeSurveyor = (surveyorName || 'Valuer').replace(/[/\\?%*:|"<>]/g, '-').trim();
        pdf.save(`${safeBorrower} - Instruction Letter - ${safeSurveyor}.pdf`);

        console.log('✅ Instruction Letter PDF generated');
        if (typeof showToast === 'function') showToast('Instruction letter downloaded', 'success');

    } catch (error) {
        console.error('❌ Error generating Instruction Letter PDF:', error);
        if (typeof showToast === 'function') {
            showToast(`Failed to generate instruction letter: ${error.message}`, 'error');
        }
    } finally {
        if (renderFrame && renderFrame.parentNode) {
            renderFrame.parentNode.removeChild(renderFrame);
        }
    }
}

// Make available globally
window.downloadInstructionLetter = downloadInstructionLetter;

console.log('✓ instruction-letter-template.js loaded');
