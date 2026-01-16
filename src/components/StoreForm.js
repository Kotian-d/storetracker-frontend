// StoreForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  createStore,
  updateStore,
  getStoreById,
  getProducts,
  getUsers,
} from "../api/stores";
import {
  Box,
  MenuItem,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Avatar,
  Chip,
  alpha,
  styled,
} from "@mui/material";
import {
  LocationOn,
  Person,
  Phone,
  Store,
  Image,
  Save,
  CameraAlt,
  CheckCircle,
  ErrorOutline,
} from "@mui/icons-material";
import ExcelUploader from "./ExcelUploader.js";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 20px 60px ${alpha(theme.palette.grey[900], 0.12)}`,
  background: `linear-gradient(145deg, ${
    theme.palette.background.paper
  } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: "none",
  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
  "&:hover": {
    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
    transform: "translateY(-2px)",
  },
}));

const FileInputContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.grey[400], 0.5)}`,
  borderRadius: 12,
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: alpha(theme.palette.grey[50], 0.5),
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    borderColor: alpha(theme.palette.primary.main, 0.3),
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
}));

const StoreForm = ({ storeToEdit: propStoreToEdit, onSuccess }) => {
  const params = useParams();
  const location = useLocation();
  const routeStore = location.state?.store;
  const isEditMode = !!params.id || !!propStoreToEdit;

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [storeToEdit, setStoreToEdit] = useState(
    propStoreToEdit || routeStore || null
  );
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    email: "",
    contact: "",
    lat: 0,
    long: 0,
    isTechnician: false,
    technicianId: "",
    product: "",
    user: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Fetch products and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, usersRes] = await Promise.all([
          getProducts(),
          getUsers(),
        ]);
        setProducts(productsRes.data || []);
        setUsers(usersRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Load store for editing
  useEffect(() => {
    const loadStore = async () => {
      if (!isEditMode || storeToEdit || !params.id) return;
      try {
        const res = await getStoreById(params.id);
        setStoreToEdit(res.data);
        if (res.data.storeImage) {
          setImagePreview(`http://localhost:3000${res.data.storeImage}`);
        }
      } catch (e) {
        console.error("Failed to load store for edit", e);
      }
    };
    loadStore();
  }, [isEditMode, params.id, storeToEdit]);

  // Sync storeToEdit to formData
  useEffect(() => {
    if (storeToEdit) {
      setFormData({
        name: storeToEdit.name || "",
        owner: storeToEdit.owner || "",
        email: storeToEdit.email || "",
        contact: storeToEdit.contact || "",
        lat: storeToEdit.lat || 0,
        long: storeToEdit.long || 0,
        isTechnician: storeToEdit.isTechnician || false,
        technicianId: storeToEdit.technicianId || "",
        product: storeToEdit.product._id || "",
        user: storeToEdit.user || "",
      });
      if (storeToEdit.storeImage) {
        setImagePreview(`http://localhost:3000${storeToEdit.storeImage}`);
      }
    }
  }, [storeToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            long: position.coords.longitude.toFixed(6),
          }));
        },
        (error) => alert("Error getting location: " + error.message)
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");

    try {
      if (isEditMode && storeToEdit) {
        await updateStore(storeToEdit._id, formData, imageFile);
      } else {
        await createStore(formData, imageFile);
      }
      onSuccess?.();
    } catch (error) {
      setSubmitError(error.response?.data?.error || "Failed to save store");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.owner && formData.email;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      {/* Excel Uploader */}
      {!isEditMode && (
        <ExcelUploader
          products={products}
          users={users}
          onSuccess={onSuccess}
        />
      )}

      <StyledPaper sx={{ mt: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          {isEditMode ? "Edit Store" : "Add New Store"}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          {isEditMode
            ? "Update store information"
            : "Fill in store details below"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Store Details Section */}
            <Grid item xs={12}>
              <SectionHeader>
                <Store sx={{ color: "primary.main", fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  Store Details
                </Typography>
              </SectionHeader>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Store Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <Store sx={{ mr: 1, color: "grey.500" }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Owner Name"
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <Person sx={{ mr: 1, color: "grey.500" }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Contact Number"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <Phone sx={{ mr: 1, color: "grey.500" }} />
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Product & Technician Section */}
            <Grid item xs={12}>
              <SectionHeader>
                <CheckCircle sx={{ color: "success.main", fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  Configuration
                </Typography>
              </SectionHeader>

              <Grid container spacing={2}>
                <Grid item>
                  <TextField
                    select
                    label="Product *"
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    sx={{ width: "150px" }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: { width: "auto" },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Select Product</MenuItem>
                    {products.map((p) => (
                      <MenuItem key={p._id} value={p._id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item>
                  <TextField
                    select
                    label="User *"
                    name="user"
                    value={formData.user}
                    onChange={handleChange}
                    sx={{ width: "150px" }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: { width: "auto" },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Select User</MenuItem>
                    {users.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.username}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isTechnician}
                        onChange={handleChange}
                        name="isTechnician"
                        sx={{ "&.Mui-checked": { color: "success.main" } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Technician Store
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Mark as technician location
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                {formData.isTechnician && (
                  <Grid item xs={12}>
                    <TextField
                      label="Technician ID"
                      name="technicianId"
                      value={formData.technicianId}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Location Section */}
            <Grid item xs={12}>
              <SectionHeader>
                <LocationOn sx={{ color: "secondary.main", fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  Location
                </Typography>
              </SectionHeader>

              <Grid container spacing={2} alignItems="end">
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Latitude"
                    name="lat"
                    type="number"
                    value={formData.lat}
                    onChange={handleChange}
                    fullWidth
                    step={0.000001}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Longitude"
                    name="long"
                    type="number"
                    value={formData.long}
                    onChange={handleChange}
                    fullWidth
                    step={0.000001}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <ActionButton
                    variant="outlined"
                    fullWidth
                    onClick={handleGetLocation}
                    startIcon={<LocationOn />}
                  >
                    GPS
                  </ActionButton>
                </Grid>
              </Grid>
            </Grid>

            {/* Image Upload Section */}
            <Grid item xs={12}>
              <SectionHeader>
                <Image sx={{ color: "warning.main", fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  Store Image
                </Typography>
              </SectionHeader>

              <FileInputContainer
                onClick={() => document.getElementById("image-upload").click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                {imagePreview ? (
                  <>
                    <Avatar
                      src={imagePreview}
                      variant="rounded"
                      sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
                    />
                    <Chip
                      label="Change Image"
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </>
                ) : (
                  <>
                    <CameraAlt
                      sx={{ fontSize: 48, color: "grey.400", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      Click to upload
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      PNG, JPG up to 5MB
                    </Typography>
                  </>
                )}
              </FileInputContainer>
            </Grid>

            {/* Submit Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 4 }} />
              {submitError && (
                <Chip
                  label={submitError}
                  color="error"
                  icon={<ErrorOutline />}
                  sx={{ mb: 2, width: "100%", justifyContent: "flex-start" }}
                  variant="filled"
                />
              )}
              <ActionButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !isFormValid}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Save />
                  )
                }
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Store"
                  : "Create Store"}
              </ActionButton>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default StoreForm;
