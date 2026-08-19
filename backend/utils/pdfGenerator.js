const PDFDocument = require('pdfkit');
const axios = require('axios');

const PRIMARY_COLOR = '#0b2342';
const GOLD_COLOR = '#c69c53';
const BG_COLOR = '#f5f6f8';
const TEXT_DARK = '#000000';
const TEXT_LIGHT = '#6b7280';

// Helper to draw rounded rectangle
const drawRoundedRect = (doc, x, y, w, h, r, fillColor, strokeColor) => {
    doc.roundedRect(x, y, w, h, r);
    if (fillColor && strokeColor) doc.fillAndStroke(fillColor, strokeColor);
    else if (fillColor) doc.fill(fillColor);
    else if (strokeColor) doc.stroke(strokeColor);
};

// Helper to draw a badge title (like "CUSTOMER DETAILS")
const drawBadgeTitle = (doc, x, y, width, text) => {
    // Left circle/icon area
    doc.circle(x + 15, y, 15).fill(GOLD_COLOR);
    // Badge background
    doc.roundedRect(x + 25, y - 10, width - 25, 20, 10).fill(PRIMARY_COLOR);
    // Text
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text(text, x + 40, y - 4, { width: width - 50, align: 'left' });
};

const generateContractPDF = async (contract, customer, product) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 0 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // ---- HEADER ----
            
            // Top Right Ribbon
            doc.moveTo(500, 0)
               .lineTo(595, 0)
               .lineTo(595, 150)
               .lineTo(547, 120)
               .lineTo(500, 150)
               .fill(PRIMARY_COLOR);
            
            // Ribbon Gold Outline
            doc.moveTo(505, 0)
               .lineTo(505, 140)
               .lineTo(547, 115)
               .lineTo(590, 140)
               .lineTo(590, 0)
               .lineWidth(1).stroke(GOLD_COLOR);

            // Ribbon Text
            doc.fillColor(GOLD_COLOR).fontSize(16).font('Helvetica-BoldOblique').text('Thank', 500, 70, { width: 95, align: 'center' });
            doc.text('You!', 500, 90, { width: 95, align: 'center' });

            // Top Left Deco
            doc.moveTo(0, 0).lineTo(150, 0).lineTo(0, 80).fill(PRIMARY_COLOR);
            doc.moveTo(0, 85).lineTo(140, 10).lineTo(0, 10).fill(GOLD_COLOR);

            // Logo DM
            const logoX = 50, logoY = 60;
            doc.polygon(
                [logoX + 25, logoY],
                [logoX + 50, logoY + 15],
                [logoX + 50, logoY + 45],
                [logoX + 25, logoY + 60],
                [logoX, logoY + 45],
                [logoX, logoY + 15]
            );
            doc.lineWidth(2).stroke(GOLD_COLOR);
            doc.polygon(
                [logoX + 25, logoY + 5],
                [logoX + 45, logoY + 17],
                [logoX + 45, logoY + 43],
                [logoX + 25, logoY + 55],
                [logoX + 5, logoY + 43],
                [logoX + 5, logoY + 17]
            );
            doc.lineWidth(1).stroke(GOLD_COLOR);
            doc.fillColor(PRIMARY_COLOR).fontSize(28).font('Helvetica-Bold').text('D', logoX + 10, logoY + 15, { lineBreak: false });
            doc.fillColor(GOLD_COLOR).fontSize(28).text('M', logoX + 22, logoY + 25);

            // Title
            doc.fillColor(PRIMARY_COLOR).fontSize(30).font('Helvetica-Bold').text('Diya', 120, 70);
            doc.fillColor(GOLD_COLOR).text('Marketing', 120, 100);
            doc.fillColor(PRIMARY_COLOR).fontSize(12).font('Helvetica').text('Finance & Loans Receipt', 120, 140);
            doc.moveTo(60, 146).lineTo(110, 146).stroke(GOLD_COLOR);
            doc.moveTo(270, 146).lineTo(320, 146).stroke(GOLD_COLOR);

            // Receipt Date & No
            drawRoundedRect(doc, 360, 80, 130, 25, 12, null, '#e5e7eb');
            doc.circle(375, 92, 10).fill(PRIMARY_COLOR);
            doc.fillColor(PRIMARY_COLOR).fontSize(7).font('Helvetica-Bold').text('RECEIPT DATE', 395, 84);
            doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica').text(new Date(contract.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), 395, 94);

            drawRoundedRect(doc, 360, 115, 130, 25, 12, null, '#e5e7eb');
            doc.circle(375, 127, 10).fill(PRIMARY_COLOR);
            doc.fillColor(PRIMARY_COLOR).fontSize(7).font('Helvetica-Bold').text('RECEIPT NO.', 395, 119);
            doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica').text(`DMFLR-${new Date(contract.createdAt).getFullYear()}-${contract._id.toString().slice(-4).toUpperCase()}`, 395, 129);

            // ---- MIDDLE SECTION ----
            
            // Customer Details Card
            drawRoundedRect(doc, 40, 200, 245, 150, 10, null, '#d1d5db');
            drawBadgeTitle(doc, 60, 200, 160, 'CUSTOMER DETAILS');
            
            // Customer Details Text
            doc.circle(65, 240, 12).fill('#fef3c7').lineWidth(1).stroke(GOLD_COLOR);
            doc.fillColor(PRIMARY_COLOR).fontSize(9).font('Helvetica').text('Name', 85, 230);
            doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica-Bold').text(customer.fullName, 85, 242);
            
            doc.moveTo(60, 275).lineTo(265, 275).lineWidth(1).dash(2, {space: 2}).stroke('#d1d5db').undash();
            
            doc.circle(65, 310, 12).fill('#fef3c7').lineWidth(1).stroke(GOLD_COLOR);
            doc.fillColor(PRIMARY_COLOR).fontSize(9).font('Helvetica').text('Mobile', 85, 300);
            doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica-Bold').text(customer.mobileNumber, 85, 312);
            doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica').text(customer.address || '', 85, 327);

            // Product Details Card
            drawRoundedRect(doc, 310, 200, 245, 150, 10, null, '#d1d5db');
            drawBadgeTitle(doc, 330, 200, 160, 'PRODUCT DETAILS');

            // Centered Product Text
            doc.fillColor(PRIMARY_COLOR).fontSize(14).font('Helvetica-Bold').text(product.name, 310, 255, { width: 245, align: 'center' });
            drawRoundedRect(doc, 372.5, 285, 120, 20, 10, GOLD_COLOR, null);
            doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica').text(`(${product.category})`, 372.5, 291, { width: 120, align: 'center' });


            // ---- FINANCE SUMMARY ----
            const tableY = 390;
            drawRoundedRect(doc, 40, tableY, 515, 310, 10, BG_COLOR, GOLD_COLOR);
            
            // Badge for Finance Summary
            doc.roundedRect(217, tableY - 12, 160, 24, 12).fill(PRIMARY_COLOR);
            doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('FINANCE SUMMARY', 217, tableY - 4, { width: 160, align: 'center' });
            
            const freqLabel = contract.paymentFrequency === 'Daily' ? 'Days' : contract.paymentFrequency === 'Weekly' ? 'Weeks' : 'Months';
            const installmentsDisplay = contract.numberOfInstallments ? `${contract.numberOfInstallments} ${freqLabel}` : 'N/A';
            const emiLabel = contract.paymentFrequency ? `${contract.paymentFrequency} EMI` : 'Monthly EMI';

            const rows = [
                { label: 'Total Product Amount', value: `Rs ${contract.totalProductAmount}`, bg: null },
                { label: 'Advance Paid', value: `Rs ${contract.advanceAmount}`, bg: '#e5e7eb' },
                { label: 'Financed Amount', value: `Rs ${contract.financedAmount}`, bg: null },
                { label: 'Total Repayment Amount', value: `Rs ${contract.totalRepaymentAmount}`, bg: '#e5e7eb' },
                { label: emiLabel, value: `Rs ${contract.monthlyInstallment || 0}`, bg: null },
                { label: 'Installments', value: installmentsDisplay, bg: '#e5e7eb' },
                { label: 'Next Due Date', value: new Date(contract.dueDate).toLocaleDateString('en-IN'), bg: null }
            ];

            let rowY = tableY + 30;
            rows.forEach((row, i) => {
                if (row.bg) {
                    doc.rect(42, rowY - 10, 511, 40).fill(row.bg);
                }
                
                // Icon circle
                doc.circle(70, rowY + 10, 15).fill(PRIMARY_COLOR);
                
                doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica').text(row.label, 105, rowY + 5);
                doc.fillColor(PRIMARY_COLOR).fontSize(14).font('Helvetica-Bold').text(row.value, 400, rowY + 3, { width: 140, align: 'right' });
                
                // Draw dotted line between columns conceptually
                doc.moveTo(400, rowY - 10).lineTo(400, rowY + 30).lineWidth(1).dash(2, {space: 2}).stroke('#d1d5db').undash();

                rowY += 40;
            });


            // ---- FOOTER ----
            const footerY = 730;
            doc.fillColor(PRIMARY_COLOR).fontSize(18).font('Helvetica-BoldOblique').text('Thank you for choosing Diya Marketing!', 0, footerY, { align: 'center' });
            doc.fillColor(TEXT_LIGHT).fontSize(10).font('Helvetica').text('This is an automatically generated receipt.', 0, footerY + 25, { align: 'center' });
            
            // Bottom Bar
            doc.moveTo(0, 800).lineTo(595, 800).lineTo(595, 842).lineTo(0, 842).fill(PRIMARY_COLOR);
            doc.moveTo(0, 785).lineTo(595, 785).lineTo(595, 800).lineTo(0, 800).fill(GOLD_COLOR);

            // Contact Info
            doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica').text('+91 8971081524', 60, 815);
            doc.moveTo(200, 810).lineTo(200, 830).stroke('#FFFFFF');
            doc.text('diyamarketing@gmail.com', 220, 815);
            doc.moveTo(400, 810).lineTo(400, 830).stroke('#FFFFFF');
            doc.text('Your Trusted Finance Partner', 420, 815);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

const generatePaymentPDF = async (payment, contract, customer, product) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 0 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // ---- HEADER ----
            
            // Top Right Ribbon
            doc.moveTo(500, 0)
               .lineTo(595, 0)
               .lineTo(595, 150)
               .lineTo(547, 120)
               .lineTo(500, 150)
               .fill(PRIMARY_COLOR);
            
            // Ribbon Gold Outline
            doc.moveTo(505, 0)
               .lineTo(505, 140)
               .lineTo(547, 115)
               .lineTo(590, 140)
               .lineTo(590, 0)
               .lineWidth(1).stroke(GOLD_COLOR);

            // Ribbon Text
            doc.fillColor(GOLD_COLOR).fontSize(16).font('Helvetica-BoldOblique').text('Thank', 500, 70, { width: 95, align: 'center' });
            doc.text('You!', 500, 90, { width: 95, align: 'center' });

            // Top Left Deco
            doc.moveTo(0, 0).lineTo(150, 0).lineTo(0, 80).fill(PRIMARY_COLOR);
            doc.moveTo(0, 85).lineTo(140, 10).lineTo(0, 10).fill(GOLD_COLOR);

            // Logo DM
            const logoX = 50, logoY = 60;
            doc.polygon([logoX + 25, logoY], [logoX + 50, logoY + 15], [logoX + 50, logoY + 45], [logoX + 25, logoY + 60], [logoX, logoY + 45], [logoX, logoY + 15]);
            doc.lineWidth(2).stroke(GOLD_COLOR);
            doc.polygon([logoX + 25, logoY + 5], [logoX + 45, logoY + 17], [logoX + 45, logoY + 43], [logoX + 25, logoY + 55], [logoX + 5, logoY + 43], [logoX + 5, logoY + 17]);
            doc.lineWidth(1).stroke(GOLD_COLOR);
            doc.fillColor(PRIMARY_COLOR).fontSize(28).font('Helvetica-Bold').text('D', logoX + 10, logoY + 15, { lineBreak: false });
            doc.fillColor(GOLD_COLOR).fontSize(28).text('M', logoX + 22, logoY + 25);

            // Title
            doc.fillColor(PRIMARY_COLOR).fontSize(30).font('Helvetica-Bold').text('Diya', 120, 70);
            doc.fillColor(GOLD_COLOR).text('Marketing', 120, 100);
            doc.fillColor(PRIMARY_COLOR).fontSize(12).font('Helvetica').text('Finance & Loans Payment Receipt', 120, 140);
            doc.moveTo(60, 146).lineTo(110, 146).stroke(GOLD_COLOR);
            doc.moveTo(330, 146).lineTo(380, 146).stroke(GOLD_COLOR);

            // Receipt Date & No
            drawRoundedRect(doc, 360, 80, 130, 25, 12, null, '#e5e7eb');
            doc.circle(375, 92, 10).fill(PRIMARY_COLOR);
            doc.fillColor(PRIMARY_COLOR).fontSize(7).font('Helvetica-Bold').text('RECEIPT DATE', 395, 84);
            doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica').text(new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), 395, 94);

            drawRoundedRect(doc, 360, 115, 130, 25, 12, null, '#e5e7eb');
            doc.circle(375, 127, 10).fill(PRIMARY_COLOR);
            doc.fillColor(PRIMARY_COLOR).fontSize(7).font('Helvetica-Bold').text('RECEIPT NO.', 395, 119);
            doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica').text(`DMPAY-${new Date(payment.paymentDate).getFullYear()}-${payment._id.toString().slice(-4).toUpperCase()}`, 395, 129);

            // ---- MIDDLE SECTION ----
            
            // Customer Details Card
            drawRoundedRect(doc, 40, 200, 245, 150, 10, null, '#d1d5db');
            drawBadgeTitle(doc, 60, 200, 160, 'CUSTOMER DETAILS');
            
            // Customer Details Text
            doc.circle(65, 240, 12).fill('#fef3c7').lineWidth(1).stroke(GOLD_COLOR);
            doc.fillColor(PRIMARY_COLOR).fontSize(9).font('Helvetica').text('Name', 85, 230);
            doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica-Bold').text(customer.fullName, 85, 242);
            
            doc.moveTo(60, 275).lineTo(265, 275).lineWidth(1).dash(2, {space: 2}).stroke('#d1d5db').undash();
            
            doc.circle(65, 310, 12).fill('#fef3c7').lineWidth(1).stroke(GOLD_COLOR);
            doc.fillColor(PRIMARY_COLOR).fontSize(9).font('Helvetica').text('Mobile', 85, 300);
            doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica-Bold').text(customer.mobileNumber, 85, 312);
            doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica').text(customer.address || '', 85, 327);

            // Product Details Card
            drawRoundedRect(doc, 310, 200, 245, 150, 10, null, '#d1d5db');
            drawBadgeTitle(doc, 330, 200, 160, 'PRODUCT DETAILS');

            // Centered Product Text
            doc.fillColor(PRIMARY_COLOR).fontSize(14).font('Helvetica-Bold').text(product.name, 310, 255, { width: 245, align: 'center' });
            drawRoundedRect(doc, 372.5, 285, 120, 20, 10, GOLD_COLOR, null);
            doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica').text(`(${product.category})`, 372.5, 291, { width: 120, align: 'center' });


            // ---- PAYMENT DETAILS ----
            const tableY = 390;
            drawRoundedRect(doc, 40, tableY, 515, 310, 10, BG_COLOR, GOLD_COLOR);
            
            // Badge for Payment Details
            doc.roundedRect(217, tableY - 12, 160, 24, 12).fill(PRIMARY_COLOR);
            doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('PAYMENT DETAILS', 217, tableY - 4, { width: 160, align: 'center' });
            
            const rows = [
                { label: 'Amount Paid', value: `Rs ${payment.amountPaid}`, bg: null },
                { label: 'Payment Date', value: new Date(payment.paymentDate).toLocaleDateString('en-IN'), bg: '#e5e7eb' },
                { label: 'Payment Method', value: payment.paymentMethod, bg: null },
                { label: 'Remaining Balance', value: `Rs ${contract.remainingBalance}`, bg: '#e5e7eb' },
                { label: 'Contract Due Date', value: new Date(contract.dueDate).toLocaleDateString('en-IN'), bg: null }
            ];

            let rowY = tableY + 30;
            rows.forEach((row, i) => {
                if (row.bg) {
                    doc.rect(42, rowY - 10, 511, 40).fill(row.bg);
                }
                
                // Icon circle
                doc.circle(70, rowY + 10, 15).fill(PRIMARY_COLOR);
                
                doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica').text(row.label, 105, rowY + 5);
                doc.fillColor(PRIMARY_COLOR).fontSize(14).font('Helvetica-Bold').text(row.value, 400, rowY + 3, { width: 140, align: 'right' });
                
                // Draw dotted line between columns conceptually
                doc.moveTo(400, rowY - 10).lineTo(400, rowY + 30).lineWidth(1).dash(2, {space: 2}).stroke('#d1d5db').undash();

                rowY += 40;
            });


            // ---- FOOTER ----
            const footerY = 730;
            doc.fillColor(PRIMARY_COLOR).fontSize(18).font('Helvetica-BoldOblique').text('Thank you for choosing Diya Marketing!', 0, footerY, { align: 'center' });
            doc.fillColor(TEXT_LIGHT).fontSize(10).font('Helvetica').text('This is an automatically generated receipt.', 0, footerY + 25, { align: 'center' });
            
            // Bottom Bar
            doc.moveTo(0, 800).lineTo(595, 800).lineTo(595, 842).lineTo(0, 842).fill(PRIMARY_COLOR);
            doc.moveTo(0, 785).lineTo(595, 785).lineTo(595, 800).lineTo(0, 800).fill(GOLD_COLOR);

            // Contact Info
            doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica').text('+91 8971081524', 60, 815);
            doc.moveTo(200, 810).lineTo(200, 830).stroke('#FFFFFF');
            doc.text('diyamarketing@gmail.com', 220, 815);
            doc.moveTo(400, 810).lineTo(400, 830).stroke('#FFFFFF');
            doc.text('Your Trusted Finance Partner', 420, 815);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateContractPDF, generatePaymentPDF };
