import axios from "axios";

export const ApiClient = axios.create({
  baseURL: process.env.API_URL,
});
