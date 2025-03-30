// import axios from "axios";

// export const axiosInstance = axios.create({
//   baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "https://chat-app-3qsw.onrender.com",
//   withCredentials: true,
// });



import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  withCredentials: true,
});
