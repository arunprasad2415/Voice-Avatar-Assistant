const { Parser } = require("json2csv");

const generateLeadsCSV = (leads) => {
  const fields = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Message", value: "message" },
    { label: "Status", value: "status" },
    { label: "Source", value: "source" },
    { label: "Created At", value: "createdAt" },
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(leads);

  return csv;
};

module.exports = { generateLeadsCSV };