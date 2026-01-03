import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  Person,
  Phone,
  Email,
  LocationOn,
  Business,
  Edit,
  Store as StoreIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/stores";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProfile();
        setProfile(data.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress size={48} />
        <Typography sx={{ mt: 2 }} variant="body2">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Profile not found."}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
      {/* Profile Header Card */}
      <Card elevation={4} sx={{ mb: 4 }}>
        <CardHeader
          avatar={
            <Avatar
              src={profile.avatar}
              sx={{
                width: 120,
                height: 120,
                fontSize: "2rem",
                bgcolor: "primary.main",
                mx: "auto",
              }}
            >
              {initials}
            </Avatar>
          }
          title={
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                {profile.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                <Chip
                  icon={<Business />}
                  label={profile.role?.toUpperCase()}
                  color="primary"
                  variant="filled"
                />
                { profile.verified && (
                  <Chip icon={<StoreIcon />} label="Verified" color="success" />
                )}
                <Chip label={`⭐ ${profile.rating ? profile.rating : "5.0"}`} color="warning" />
              </Box>
            </Box>
          }
          action={
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate("/profile/edit")}
              sx={{ mr: 2 }}
            >
              Edit Profile
            </Button>
          }
          sx={{ pt: 4, pb: 2 }}
        />
      </Card>

      {/* Details Card */}
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={4}>
            
            {/* Contact Info */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Contact
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Phone color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={profile.username} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Email color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={profile.email ? profile.email : "NA"} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LocationOn color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={ profile.location ? profile.location : "NA" }
                    />
                  </ListItem>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
