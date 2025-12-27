import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Link,
  Avatar,
  Fade,
  Container,
  IconButton,
  InputAdornment,
  CssBaseline,
} from "@mui/material";
import {
  Person as UserIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext.js";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // credentials object matches what your backend expects
      await login({ username, password });
      // Navigation is handled inside AuthContext.login()
    } catch (error) {
      console.error("Login failed:", error);
      alert(error); // Show error to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CssBaseline>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <Container maxWidth="sm">
          <Fade in timeout={800}>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 4, sm: 5 },
                borderRadius: 4,
                backdropFilter: "blur(20px)",
                background: "rgba(255, 255, 255, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "linear-gradient(90deg, #667eea, #764ba2)",
                },
              }}
              component="form"
              onSubmit={handleSubmit}
            >
              {/* Header */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    mb: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: 4,
                    }}
                  >
                    D
                  </Avatar>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    STORE TRACKER
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: "1.1rem" }}
                >
                  Welcome back! Please sign in to continue
                </Typography>
              </Box>

              {/* Error Message */}
              {error && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "error.50",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "error.200",
                  }}
                >
                  <Typography variant="body2" color="error.main">
                    {error}
                  </Typography>
                </Box>
              )}

              {/* Username */}
              <TextField
                fullWidth
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <UserIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Options */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{
                        color: "grey.400",
                        "&.Mui-checked": { color: "#667eea" },
                      }}
                    />
                  }
                  label="Remember me"
                />
                <Link href="#" underline="hover" color="primary">
                  Forgot password?
                </Link>
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: 3,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: 6,
                  },
                  "&:disabled": { background: "grey.400" },
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{ mr: 1, color: "white" }}
                    />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Footer */}
              <Box
                sx={{
                  mt: 4,
                  pt: 3,
                  textAlign: "center",
                  borderTop: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <Link
                    href="#"
                    underline="hover"
                    color="primary"
                    fontWeight={600}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
    </CssBaseline>
  );
};

export default LoginPage;
