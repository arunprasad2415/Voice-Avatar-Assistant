const ExcelJS = require("exceljs");

const generateLeadsExcel = async (leads) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Leads");

  worksheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Message", key: "message", width: 40 },
    { header: "Status", key: "status", width: 15 },
    { header: "Source", key: "source", width: 20 },
    { header: "Created At", key: "createdAt", width: 22 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  leads.forEach((lead) => {
    worksheet.addRow({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      status: lead.status,
      source: lead.source,
      createdAt: lead.createdAt,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = { generateLeadsExcel };