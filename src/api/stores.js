import axios from "axios";

// IMPORTANT: Replace with your actual backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Use this if testing on Android Emulator:
// const API_BASE_URL = 'http://10.0.2.2:3000/api/store';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
});

// 1. Request Interceptor: Attach Token (if using JWT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Force redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to handle image/file uploads
const createStoreFormData = (storeData, imageFile) => {
  const formData = new FormData();

  // Append all text fields
  for (const key in storeData) {
    if (storeData.hasOwnProperty(key) && key !== "imageFile") {
      formData.append(key, storeData[key]);
    }
  }

  // Append the image file with the name 'storeImage' (must match Multer middleware)
  if (imageFile) {
    formData.append("storeImage", imageFile);
  }

  return formData;
};

export const createStore = async (storeData, imageFile) => {
  const formData = createStoreFormData(storeData, imageFile);
  // Axios will automatically set Content-Type to multipart/form-data
  return api.post("/api/store", formData);
};

export const getStores = async () => api.get("/api/store");

export const getStoreById = async (id) => api.get(`/${id}`);

export const getProducts = async () => api.get("/api/products");

export const getUsers = async () => api.get("/api/users");

export const getProfile = async () => api.get("/api/auth/profile");

export const updateStore = async (id, data, imageFile) => {
  // For updating, we can use a simpler PUT for text/location updates
  if (!imageFile) {
    return api.put(`/api/store/${id}/location`, data);
  }

  // For image update, we need multipart/form-data again
  const formData = createStoreFormData(data, imageFile);
  return api.post(`/api/store/${id}/image`, formData);
};

export const uploadExcel = (file, productId, userId) => {
  const formData = new FormData();
  formData.append("excelFile", file);
  formData.append("product", productId);
  formData.append("user", userId);

  return api.post("/api/store/upload-excel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export async function getGeoCode(place) {
  return api.get(`/api/geocode?q=${encodeURIComponent(place)}`);
}

export async function getRouteBetween(from, to) {
  const body = {
    fromLat: from.lat,
    fromLon: from.lon,
    toLat: to.lat,
    toLon: to.lon,
  };

  const res = await api.post("/api/getdirections", body, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = res.data; // GeoJSON FeatureCollection[web:81]
  console.log("Routing response data:", data);
  const coords = data.features?.[0]?.geometry?.coordinates || []; // [lon, lat][]

  // convert to [lat, lon] for Leaflet
  return {
    coords: coords.map(([lon, lat]) => [lat, lon]),
    features: data.features[0],
  };
}

// Login Function
export const userlogin = async (credentials) => {
  return await api.post('/api/auth/login', credentials); 
};

// Logout Function
export const userlogout = async () => {
  try {
    await api.post('/api/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const isAuthenticated = async() => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const deleteStore = async (id) => api.delete(`/${id}`);
