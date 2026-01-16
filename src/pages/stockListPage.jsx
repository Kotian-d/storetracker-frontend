// ExcelImportPage.jsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import * as XLSX from "xlsx";

const COLUMNS = [
  "Material Name",
  "Material Code",
  "Serialized",
  "Partner/Siebel ID",
  "Partner Name",
  "Parent Code",
  "Parent Partner Name",
  "SAP Vendor Code",
  "Good Stock",
  "Defective Stock",
  "Ready To Dispatch",
  "ISP InTransit",
  "Installer Good Stock",
  "Installer Defective Stock",
  "Total Stock",
  "ISP Max Stock",
  "Pending Order Qty",
  "Return In Transit",
];

const StoreListPage = () => {
  const [rows, setRows] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("ALL");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, {
      header: COLUMNS,
      range: 1,
      defval: "",
    }); // [web:3][web:10]

    setRows(json);
    setSelectedPartner("ALL");
  };

  // Unique Partner/Siebel IDs for dropdown
  const partnerOptions = useMemo(() => {
    const ids = new Set();
    rows.forEach((r) => {
      const id = r["Partner/Siebel ID"] || "UNKNOWN";
      ids.add(id);
    });
    return Array.from(ids);
  }, [rows]); // [web:13][web:16]

  // Filtered rows based on dropdown
  const visibleRows = useMemo(() => {
    if (selectedPartner === "ALL") return rows;
    return rows.filter(
      (r) => (r["Partner/Siebel ID"] || "UNKNOWN") === selectedPartner
    );
  }, [rows, selectedPartner]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Import Material Stock (Excel)
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Button variant="contained" component="label">
          Choose Excel File
          <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
        </Button>

        <FormControl
          size="small"
          sx={{ minWidth: 220 }}
          disabled={rows.length === 0}
        >
          <InputLabel id="partner-select-label">Partner/Siebel ID</InputLabel>
          <Select
            labelId="partner-select-label"
            label="Partner/Siebel ID"
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
          >
            <MenuItem value="ALL">All Partners</MenuItem>
            {partnerOptions.map((id) => (
              <MenuItem key={id} value={id}>
                {id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {rows.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Upload an Excel file to preview data and filter by Partner/Siebel ID.
        </Typography>
      )}

      {rows.length > 0 && (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableCell key={col}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row, idx) => (
                <TableRow key={idx}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col}>{row[col]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default StoreListPage;
