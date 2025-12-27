// StoreList.jsx
import React from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  CircularProgress,
  Chip,
  Avatar,
  TablePagination,
  alpha,
  styled,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 32px ${alpha(theme.palette.grey[900], 0.12)}`,
  "& .MuiTableCell-root": {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    transition: "all 0.2s ease-in-out",
  },
  "&.MuiTableRow-head": {
    background: `linear-gradient(90deg, ${alpha(
      theme.palette.primary.main,
      0.08
    )} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: "0.875rem",
  padding: theme.spacing(2.5),
  "&:first-child": {
    paddingLeft: theme.spacing(3),
  },
  "&:last-child": {
    paddingRight: theme.spacing(3),
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  height: 28,
  fontWeight: 600,
  fontSize: "0.75rem",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 40,
  height: 40,
  borderRadius: 10,
  boxShadow: `0 2px 8px ${alpha(theme.palette.grey[400], 0.3)}`,
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: `0 4px 16px ${alpha(theme.palette.grey[400], 0.4)}`,
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  minHeight: 400,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: alpha(theme.palette.grey[100], 0.5),
  borderRadius: theme.shape.borderRadius * 2,
  border: `2px dashed ${alpha(theme.palette.grey[400], 0.3)}`,
}));

const StoreList = ({
  stores = [],
  loading,
  onEdit,
  onDelete,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}) => {
  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress size={48} sx={{ color: "primary.main" }} />
      </LoadingContainer>
    );
  }

  const handleEdit = (store) => {
    onEdit?.(store);
  };

  const handleDelete = (id) => {
    onDelete?.(id);
  };

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Store Directory
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ opacity: 0.8 }}
        >
          Manage your store locations and technician assignments
        </Typography>
      </Box>

      {/* Table */}
      <StyledTableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                Store Details
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PersonIcon fontSize="small" color="inherit" />
                  Owner
                </Box>
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PhoneIcon fontSize="small" color="inherit" />
                  Contact
                </Box>
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOnIcon fontSize="small" color="inherit" />
                  Location
                </Box>
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                Technician
              </StyledTableCell>
              <StyledTableCell
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  textAlign: "right",
                }}
              >
                Actions
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store) => (
              <StyledTableRow key={store._id}>
                <StyledTableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {store.storeImage ? (
                      <Avatar
                        src={
                          store.storeImage.startsWith("http")
                            ? store.storeImage
                            : `http://localhost:3000${store.storeImage}`
                        }
                        sx={{ width: 48, height: 48 }}
                      />
                    ) : (
                      <Avatar
                        sx={{ width: 48, height: 48, bgcolor: "primary.main" }}
                      >
                        {store.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {store.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {store.email}
                      </Typography>
                    </Box>
                  </Box>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography fontWeight={500}>{store.owner}</Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography>{store.contact}</Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography variant="body2" color="text.secondary">
                    {store.lat?.toFixed ? store.lat.toFixed(4) : store.lat},{" "}
                    {store.long?.toFixed ? store.long.toFixed(4) : store.long}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  {store.isTechnician ? (
                    <StatusChip
                      label={store.technicianId || "Assigned"}
                      color="success"
                      size="small"
                      icon={<PersonIcon fontSize="small" />}
                    />
                  ) : (
                    <StatusChip
                      label="No Tech"
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  )}
                </StyledTableCell>
                <StyledTableCell sx={{ paddingRight: 3 }}>
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                  >
                    <ActionButton
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(store)}
                      sx={{
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": { backgroundColor: "primary.dark" },
                      }}
                    >
                      Edit
                    </ActionButton>
                    <ActionButton
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(store._id)}
                      sx={(theme) => ({
                        color: theme.palette.error.main,
                        borderColor: theme.palette.error.main,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          borderColor: theme.palette.error.main,
                        },
                      })}
                    >
                      Delete
                    </ActionButton>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
            ))}

            {stores.length === 0 && (
              <StyledTableRow>
                <StyledTableCell
                  colSpan={6}
                  sx={{ py: 8, textAlign: "center" }}
                >
                  <Box sx={{ opacity: 0.6 }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No stores found
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Create your first store to get started
                    </Typography>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Pagination */}
      {stores.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <TablePagination
            component="div"
            count={totalCount} 
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Stores per page:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to === count ? "all" : to} of ${count}`
            }
            sx={{
              "& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                {
                  color: "text.secondary",
                },
              "& .MuiTablePagination-selectIcon": {
                color: "primary.main",
              },
            }}
          />
        </Box>
      )}
    </Container>
  );
};

export default StoreList;
