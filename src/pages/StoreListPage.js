// StoreListPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import StoreList from "../components/StoreList";
import { getStores, deleteStore } from "../api/stores";

const StoreListPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  // Client-side pagination logic
  const paginatedStores = stores.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const totalCount = stores.length;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const handleEdit = (store) => {
    navigate(`/edit/${store._id}`, { state: { store } });
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

  const filteredStores = useMemo(() => {
    if (!search.trim()) return stores;
    const lower = search.toLowerCase();
    return stores.filter(
      (s) =>
        s.name?.toLowerCase().includes(lower) ||
        s.owner?.toLowerCase().includes(lower) ||
        s.email?.toLowerCase().includes(lower)
    );
  }, [stores, search]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Store Dashboard ({filteredStores.length} stores)
      </Typography>

      <Box sx={{ mb: 2, maxWidth: 400 }}>
        <TextField
          fullWidth
          label="Search Stores (Name, Owner, or Email)"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          // Optional: Add an icon
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, color: "action.active" }}>🔍</Box>
            ),
          }}
        />
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
