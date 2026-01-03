// StoreListPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import StoreList from "../components/StoreList";
import { getStores, deleteStore } from "../api/stores";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import { Stack, Chip } from "@mui/material";

const StoreListPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showTechniciansOnly, setShowTechniciansOnly] = useState(false);
  const navigate = useNavigate();

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await getStores();
      setStores(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const filteredStores = useMemo(() => {
    let list = stores;

    if (showTechniciansOnly) {
      list = list.filter(
        (s) =>
          s.isTechnician
      );
    }

    if (!search.trim()) return list;

    const lower = search.toLowerCase();
    return list.filter(
      (s) =>
        s.name?.toLowerCase().includes(lower) ||
        s.owner?.toLowerCase().includes(lower) ||
        s.contact?.includes(lower)
    );
  }, [stores, search, showTechniciansOnly]);

  // Client-side pagination logic
  const paginatedStores = filteredStores.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const totalCount = filteredStores.length;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const handleEdit = (store) => {
    navigate(`/stores/${store._id}/edit`, { state: { store } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;
    try {
      await deleteStore(id);
      await fetchStores(); // refresh list
    } catch (error) {
      console.error("Error deleting store:", error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography
            variant="h5"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              lineHeight: 1.3,
            }}
          >
            Store Dashboard
            {/* Total count badge - moved here */}
            <Badge
              badgeContent={filteredStores.length}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.75rem",
                  minWidth: 20,
                  height: 20,
                  borderRadius: "10px",
                  fontWeight: 600,
                },
              }}
            />
          </Typography>

          <Chip
            label={showTechniciansOnly ? "Technicians Only" : "All Stores"}
            onClick={() => setShowTechniciansOnly((prev) => !prev)}
            onDelete={
              showTechniciansOnly
                ? () => setShowTechniciansOnly(false)
                : undefined
            }
            color={showTechniciansOnly ? "primary" : "default"}
            variant={showTechniciansOnly ? "filled" : "outlined"}
            sx={{
              cursor: "pointer",
              fontWeight: 600,
              minWidth: { xs: "100%", sm: "auto" },
              justifyContent: "space-between",
              "& .MuiChip-deleteIcon": {
                fontSize: "1rem",
              },
            }}
          />
        </Stack>

        <Box sx={{ mb: 2, maxWidth: 480 }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Search stores by name, owner, or contact"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="large"
                    edge="end"
                    onClick={() => setSearch("")}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={(theme) => ({
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                backgroundColor: theme.palette.action.hover,
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.divider,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 1px ${theme.palette.primary.main}33`,
                },
              },
            })}
          />
        </Box>
      </Box>
      <StoreList
        stores={paginatedStores}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default StoreListPage;
