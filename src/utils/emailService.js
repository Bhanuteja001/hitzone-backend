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
      doc.fillColor(primaryColor).fontSize(14).text("2. Quotation & Budget Details");
      doc.strokeColor("#cccccc").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      const qAmt = Number(project.quotationAmount) || 0;
      const bAmt = Number(project.budget) || 0;

      doc.fontSize(10).fillColor(textColor);
      doc.text(`Quotation Amount: `, { continued: true }).font("Helvetica-Bold").text(`₹${qAmt.toLocaleString("en-IN")}`).font("Helvetica");
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
  const emailPass = process.env.EMAIL_PASS || "";

  // Log warning if EMAIL_PASS is missing but continue attempting to send to surface any SMTP configuration errors
  if (!emailPass) {
    console.warn("EMAIL_PASS not configured in backend .env! Attempting SMTP send using empty password.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const formattedStartDate = project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN") : "";
  const qAmt = Number(project.quotationAmount) || 0;
  const bAmt = Number(project.budget) || 0;

  // Render a premium styled HTML body so details are viewable directly in the email
  const htmlBody = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 25px; border-radius: 8px; background-color: #fcfcfc;">
      <h2 style="color: #020B1A; border-bottom: 2px solid #AED500; padding-bottom: 12px; margin-top: 0; font-size: 22px;">PROJECT AGREEMENT & QUOTATION</h2>
      
      <p>Dear <strong>${project.clientName}</strong>,</p>
      <p>Thank you for choosing HIT Zone. Below are the details for your project and the terms of agreement. A PDF copy of this agreement is also attached for your records.</p>
      
      <h3 style="color: #020B1A; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; font-size: 16px;">1. Project & Client Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #666; width: 180px;">Project ID:</td><td style="font-weight: bold; color: #020B1A;">${project.projectRefId}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Project Name:</td><td style="font-weight: bold; color: #020B1A;">${project.projectName}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Client Name:</td><td style="font-weight: bold; color: #020B1A;">${project.clientName}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Client Phone:</td><td style="color: #333;">${project.clientMobile || ""}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Client Email:</td><td style="color: #333;">${project.clientEmail || ""}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Location:</td><td style="color: #333;">${project.location}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Area (in sft):</td><td style="color: #333;">${project.area || ""}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Start Date:</td><td style="color: #333;">${formattedStartDate}</td></tr>
      </table>

      <h3 style="color: #020B1A; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; font-size: 16px;">2. Financial Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #666; width: 180px;">Quotation Amount:</td><td style="font-weight: bold; color: #020B1A; font-size: 15px;">₹${qAmt.toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Project Budget/Cost:</td><td style="font-weight: bold; color: #020B1A; font-size: 15px;">₹${bAmt.toLocaleString("en-IN")}</td></tr>
      </table>

      <h3 style="color: #020B1A; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; font-size: 16px;">3. Terms & Conditions</h3>
      <ol style="padding-left: 20px; line-height: 1.6; font-size: 13px; color: #444;">
        <li style="margin-bottom: 6px;"><strong>50% Advance:</strong> Payable upon order confirmation.</li>
        <li style="margin-bottom: 6px;"><strong>30% Payment:</strong> Payable upon arrival of materials at site.</li>
        <li style="margin-bottom: 6px;"><strong>20% Balance:</strong> Payable upon completion of work.</li>
        <li style="margin-bottom: 6px;"><strong>GST:</strong> 5% GST is included in the above quotation.</li>
        <li style="margin-bottom: 6px;"><strong>2-year service warranty is provided.</strong> Any issues not resulting from physical damage, misuse, or Unauthorized alterations will be covered under the warranty terms.</li>
        <li style="margin-bottom: 6px;"><strong>Accommodation & Food:</strong> Food and accommodation for installers shall be provided by the management at site.</li>
        <li style="margin-bottom: 6px;"><strong>Work Schedule:</strong> Work will commence after receipt of advance payment and site readiness confirmation.</li>
        <li style="margin-bottom: 6px;"><strong>Completion Time:</strong> The completion timeline is subject to site conditions, weather, and uninterrupted workflow.</li>
        <li style="margin-bottom: 6px;"><strong>Electricity & Water:</strong> Required electricity and water for installation shall be provided by the client at site free of cost.</li>
        <li style="margin-bottom: 6px;"><strong>Material Handling:</strong> Safe storage space for materials must be provided by the client at site.</li>
        <li style="margin-bottom: 6px;"><strong>Variation Clause:</strong> Any additional work or change in specifications will be charged extra upon mutual approval.</li>
        <li style="margin-bottom: 6px;"><strong>Damage & Loss:</strong> The Company is not responsible for damages caused due to natural calamities, misuse, or third-party interference after handover.</li>
      </ol>

      <div style="margin-top: 35px; border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #666; text-align: center; line-height: 1.4;">
        Best regards,<br>
        <strong>HIT Zone Management</strong><br>
        Email: <a href="mailto:dineshmodem5132@gmail.com" style="color: #007bff; text-decoration: none;">dineshmodem5132@gmail.com</a>
      </div>
    </div>
  `;

  const formattedEndDate = project.endDate ? new Date(project.endDate).toLocaleDateString("en-IN") : "N/A";
  const desc = project.projectDescription || "N/A";

  const plainTextBody = `Dear ${project.clientName},

Thank you for choosing HIT Zone. 

Below is the complete details and terms of agreement for your project:

==================================================
AGREEMENT & QUOTATION DOCUMENT
==================================================

1. Project & Client Details
---------------------------
Project ID: ${project.projectRefId}
Project Name: ${project.projectName}
Client Name: ${project.clientName}
Client Phone: ${project.clientMobile || ""}
Client Email: ${project.clientEmail || ""}
Location: ${project.location}
Area (in sft): ${project.area || ""}
Start Date: ${formattedStartDate}
End Date: ${formattedEndDate}
Description: ${desc}

2. Quotation & Budget Details
-----------------------------
Quotation Amount: ₹${qAmt.toLocaleString("en-IN")}
Project Budget/Cost: ₹${bAmt.toLocaleString("en-IN")}

3. Terms & Conditions
---------------------
1. 50% Advance: Payable upon order confirmation.
2. 30% Payment: Payable upon arrival of materials at site.
3. 20% Balance: Payable upon completion of work.
4. GST: 5% GST is included in the above quotation.
5. 2-year service warranty is provided. Any issues not resulting from physical damage, misuse, or Unauthorized alterations will be covered under the warranty terms.
6. Accommodation & Food: Food and accommodation for installers shall be provided by the management at site.
7. Work Schedule: Work will commence after receipt of advance payment and site readiness confirmation.
8. Completion Time: The completion timeline is subject to site conditions, weather, and uninterrupted workflow.
9. Electricity & Water: Required electricity and water for installation shall be provided by the client at site free of cost.
10. Material Handling: Safe storage space for materials must be provided by the client at site.
11. Variation Clause: Any additional work or change in specifications will be charged extra upon mutual approval.
12. Damage & Loss: The Company is not responsible for damages caused due to natural calamities, misuse, or third-party interference after handover.

Client Signature: _______________________
Authorised Signatory: _______________________

Best regards,
HIT Zone Management
Admin: dineshmodem5132@gmail.com`;

  const mailOptions = {
    from: `"HIT Zone" <${emailUser}>`,
    to: project.clientEmail,
    subject: `Project Agreement & Quotation - ${project.projectName} (${project.projectRefId})`,
    text: plainTextBody,
    html: htmlBody,
    attachments: [
      {
        filename: `Agreement_${project.projectRefId}.pdf`,
        content: pdfBuffer,
      },
      {
        filename: `Agreement_${project.projectRefId}.txt`,
        content: plainTextBody,
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Agreement email sent successfully to ${project.clientEmail}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("SMTP sending failed. Error Details:", error);
    
    // Save PDF backup copy locally
    const backupDir = path.join(process.cwd(), "temp_agreements");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupPath = path.join(backupDir, `Agreement_${project.projectRefId}.pdf`);
    fs.writeFileSync(backupPath, pdfBuffer);
    console.warn(`Saved PDF locally at: ${backupPath}`);
    
    throw error;
  }
};
