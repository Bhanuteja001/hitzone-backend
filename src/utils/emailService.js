import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Function to generate the PDF buffer in memory
export const generateAgreementPdf = (project) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Style configurations
      const primaryColor = "#020B1A";
      const textColor = "#333333";

      // ── HEADER ─────────────────────────────────────────────────────────────
      doc.fillColor(primaryColor).fontSize(20).text("AGREEMENT & QUOTATION DOCUMENT", { align: "center", underline: true });
      doc.moveDown(1.5);

      // ── PROJECT DETAILS ───────────────────────────────────────────────────
      doc.fillColor(primaryColor).fontSize(14).text("1. Project & Client Details", { underline: false });
      doc.strokeColor("#cccccc").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(10).fillColor(textColor);
      doc.text(`Project ID: `, { continued: true }).font("Helvetica-Bold").text(project.projectRefId).font("Helvetica");
      doc.text(`Project Name: `, { continued: true }).font("Helvetica-Bold").text(project.projectName).font("Helvetica");
      doc.text(`Client Name: `, { continued: true }).font("Helvetica-Bold").text(project.clientName).font("Helvetica");
      doc.text(`Client Phone: `, { continued: true }).font("Helvetica-Bold").text(project.clientMobile || "").font("Helvetica");
      doc.text(`Client Email: `, { continued: true }).font("Helvetica-Bold").text(project.clientEmail || "").font("Helvetica");
      doc.text(`Location: `, { continued: true }).font("Helvetica-Bold").text(project.location).font("Helvetica");
      doc.text(`Area (in sft): `, { continued: true }).font("Helvetica-Bold").text(project.area || "").font("Helvetica");
      
      const formattedStartDate = project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN") : "";
      doc.text(`Start Date: `, { continued: true }).font("Helvetica-Bold").text(formattedStartDate).font("Helvetica");
      
      if (project.endDate) {
        const formattedEndDate = new Date(project.endDate).toLocaleDateString("en-IN");
        doc.text(`End Date: `, { continued: true }).font("Helvetica-Bold").text(formattedEndDate).font("Helvetica");
      }
      
      if (project.projectDescription) {
        doc.text(`Description: ${project.projectDescription}`);
      }

      doc.moveDown(1.5);

      // ── FINANCIAL DETAILS ──────────────────────────────────────────────────
      doc.fillColor(primaryColor).fontSize(14).text("2. Quotation & Agreement Amounts");
      doc.strokeColor("#cccccc").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      const qAmt = Number(project.quotationAmount) || 0;
      const aAmt = Number(project.agreementAmount) || 0;
      const bAmt = Number(project.budget) || 0;

      doc.fontSize(10).fillColor(textColor);
      doc.text(`Quotation Amount: `, { continued: true }).font("Helvetica-Bold").text(`₹${qAmt.toLocaleString("en-IN")}`).font("Helvetica");
      doc.text(`Agreement Amount: `, { continued: true }).font("Helvetica-Bold").text(`₹${aAmt.toLocaleString("en-IN")}`).font("Helvetica");
      doc.text(`Project Budget/Cost: `, { continued: true }).font("Helvetica-Bold").text(`₹${bAmt.toLocaleString("en-IN")}`).font("Helvetica");

      doc.moveDown(1.5);

      // ── TERMS AND CONDITIONS ───────────────────────────────────────────────
      doc.fillColor(primaryColor).fontSize(14).text("3. Terms & Conditions");
      doc.strokeColor("#cccccc").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(8.5).fillColor(textColor);
      const terms = [
        "1. 50% Advance: Payable upon order confirmation.",
        "2. 30% Payment: Payable upon arrival of materials at site.",
        "3. 20% Balance: Payable upon completion of work.",
        "4. GST: 5% GST is included in the above quotation.",
        "5. 2-year service warranty is provided. Any issues not resulting from physical damage, misuse, or Unauthorized alterations will be covered under the warranty terms.",
        "6. Accommodation & Food: Food and accommodation for installers shall be provided by the management at site.",
        "7. Work Schedule: Work will commence after receipt of advance payment and site readiness confirmation.",
        "8. Completion Time: The completion timeline is subject to site conditions, weather, and uninterrupted workflow.",
        "9. Electricity & Water: Required electricity and water for installation shall be provided by the client at site free of cost.",
        "10. Material Handling: Safe storage space for materials must be provided by the client at site.",
        "11. Variation Clause: Any additional work or change in specifications will be charged extra upon mutual approval.",
        "12. Damage & Loss: The Company is not responsible for damages caused due to natural calamities, misuse, or third-party interference after handover."
      ];

      terms.forEach((term) => {
        doc.text(term);
        doc.moveDown(0.3);
      });

      doc.moveDown(2);

      // ── SIGNATURES ─────────────────────────────────────────────────────────
      doc.fontSize(10).fillColor("#111111");
      doc.text("_______________________                    _______________________", { align: "center" });
      doc.text("Client Signature                                 Authorised Signatory", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Function to send email
export const sendAgreementEmail = async (project) => {
  if (!project.clientEmail) {
    console.error("No client email specified. Skipping agreement dispatch.");
    return;
  }

  let pdfBuffer;
  try {
    pdfBuffer = await generateAgreementPdf(project);
  } catch (err) {
    console.error("Failed to generate PDF agreement document:", err);
    throw err;
  }

  const emailUser = process.env.EMAIL_USER || "dineshmodem5132@gmail.com";
  const emailPass = process.env.EMAIL_PASS;

  // If no password is provided in env, write a local copy of PDF and log it
  if (!emailPass) {
    console.warn("EMAIL_PASS not configured in backend .env! Cannot send email via SMTP.");
    
    // Save copy locally to temp_agreements for verification
    const backupDir = path.join(process.cwd(), "temp_agreements");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupPath = path.join(backupDir, `Agreement_${project.projectRefId}.pdf`);
    fs.writeFileSync(backupPath, pdfBuffer);
    console.log(`Saved agreement document PDF locally at: ${backupPath}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"HIT Zone" <${emailUser}>`,
    to: project.clientEmail,
    subject: `Project Agreement & Quotation - ${project.projectName} (${project.projectRefId})`,
    text: `Dear ${project.clientName},

Thank you for choosing HIT Zone. 

Please find attached the official Agreement & Quotation document for your project "${project.projectName}" (Ref ID: ${project.projectRefId}). 

The document details the project parameters, agreed quotation amounts, and our terms & conditions.

Best regards,
HIT Zone Management
Admin: dineshmodem5132@gmail.com`,
    attachments: [
      {
        filename: `Agreement_${project.projectRefId}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Agreement email sent successfully to ${project.clientEmail}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending agreement email:", error);
    
    // Fallback: save PDF copy locally
    const backupDir = path.join(process.cwd(), "temp_agreements");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupPath = path.join(backupDir, `Agreement_${project.projectRefId}.pdf`);
    fs.writeFileSync(backupPath, pdfBuffer);
    console.log(`Saved agreement document PDF locally at: ${backupPath}`);
    
    throw error;
  }
};
