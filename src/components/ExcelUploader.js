import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { uploadExcel } from "../api/stores";

const ExcelUploader = ({ products = [], users = [], onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [productId, setProductId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel")
    ) {
      setSelectedFile(file);
      setStatus({ message: "", type: "" });
    } else {
      setSelectedFile(null);
      setStatus({
        message: "Please select a valid Excel file (.xlsx or .xls).",
        type: "error",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) {
      setStatus({ message: "Please select a product.", type: "warning" });
      return;
    }

    if (!selectedFile) {
      setStatus({ message: "No file selected for upload.", type: "warning" });
      return;
    }

    setLoading(true);
    setStatus({ message: "Uploading and processing data...", type: "info" });

    try {
      // Expect uploadExcel to handle FormData internally
      const response = await uploadExcel(selectedFile, productId, userId);

      setStatus({
        message:
          response.data.message ||
          `${response.data.importedCount} stores imported successfully!`,
        type: "success",
      });
      setSelectedFile(null);
      setProductId("");
      onSuccess && onSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      setStatus({
        message:
          error.response?.data?.message ||
          "Upload failed. Check server console.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Bulk Upload Store Data
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Hidden file input */}
        <input
          accept=".xlsx, .xls"
          style={{ display: "none" }}
          id="excel-upload-button"
          type="file"
          onChange={handleFileChange}
        />

        {/* Product dropdown */}
        <TextField
          select
          label="Product"
          name="product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          fullWidth
          placeholder="Select a product"
          helperText="Link this store to a specific product by ID"
          sx={{ mb: 2 }}
        >
          {products.map((p) => (
            <MenuItem key={p._id} value={p._id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>

        {/* User dropdown */}
        <TextField
          select
          label="User"
          name="user"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          fullWidth
          placeholder="Select a user"
          helperText="Link this store to a specific user by ID"
          sx={{ mb: 2 }}
        >
          {users.map((p) => (
            <MenuItem key={p._id} value={p._id}>
              {p.username}
            </MenuItem>
          ))}
        </TextField>

        {/* File chooser */}
        <label htmlFor="excel-upload-button">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />}
            disabled={loading}
          >
            {selectedFile ? selectedFile.name : "Choose Excel File (.xlsx)"}
          </Button>
        </label>

        {/* Submit */}
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 2 }}
          type="submit"
          disabled={!selectedFile || loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Import Data"
          )}
        </Button>
      </Box>

      {status.message && (
        <Alert severity={status.type} sx={{ mt: 2 }}>
          {status.message}
        </Alert>
      )}
    </Paper>
  );
};

export default ExcelUploader;
