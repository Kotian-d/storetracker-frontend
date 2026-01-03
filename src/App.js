import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  styled,
  alpha,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Store,
  Add,
  List,
  Dashboard as DashboardIcon,
  Logout,
  Person,
} from "@mui/icons-material";
import StoreListPage from "./pages/StoreListPage";
import StoreForm from "./components/StoreForm";
import MapPage from "./pages/mapPage";
import LoginPage from "./components/LoginPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext.js";
import { ProtectedRoute } from "./ProtectedRoutes";
import { useNavigate } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage.jsx";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  backdropFilter: "blur(20px)",
}));

const Logo = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  fontWeight: 800,
  textDecoration: "none",
  color: "white",
}));

const NavButton = styled(Link)(({ theme }) => ({
  borderRadius: 25,
  padding: "8px 16px",
  textDecoration: "none",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "white",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: alpha("#ffffff", 0.2),
  },
}));

const UserMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { logout: userlogout } = useAuth();

  const handleLogout = async () => {
    try {
      await userlogout();
    } catch (error) {
      console.log("Logout error:", error);
    }
    navigate("/login", { replace: true });
    setAnchorEl(null);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleMenu}
        sx={{
          ml: 1,
          ...(isMobile && { ml: 0 }),
          "&:hover": { backgroundColor: alpha("#ffffff", 0.1) },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: "white",
            color: "primary.main",
          }}
        >
          <Person />
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={() => {navigate("/profile"); setAnchorEl(null);}} sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={600}>
            Profile
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={(theme) => ({
            px: 2,
            py: 1.5,
            color: theme.palette.error.main,
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
            },
          })}
        >
          <Logout fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" fontWeight={600}>
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <StyledAppBar position="static">
        <Toolbar>
          <Logo component={Link} to={isAuthenticated ? "/dashboard" : "/login"}>
            <Store /> Store Tracker
          </Logo>

          {isAuthenticated && (
            <Box
              sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}
            >
              <NavButton to="/dashboard">
                <DashboardIcon fontSize="small" /> Dashboard
              </NavButton>

              <NavButton to="/stores">
                <List fontSize="small" /> Stores
              </NavButton>
              {user?.role === "admin" && (
                <NavButton to="/stores/new">
                  <Add fontSize="small" /> New
                </NavButton>
              )}

              <UserMenu />
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>

      <Container maxWidth={false} sx={{ mt: 3, mb: 2, px: { xs: 2, sm: 3 } }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores"
            element={
              <ProtectedRoute>
                <StoreListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores/new"
            element={
              <ProtectedRoute>
                <StoreForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores/:id/edit"
            element={
              <ProtectedRoute>
                <StoreForm isEdit />
              </ProtectedRoute>
            }
          />

          {/* Default Redirects */}
          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/login"}
                replace
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </Container>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
