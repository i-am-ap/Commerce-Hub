import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/lib/api";

const initialState = {
  featured: [],
  categories: [],
  listing: [],
  pagination: { page: 1, pages: 1, total: 0, limit: 12 },
  selected: null,
  related: [],
  recommendations: [],
  status: "idle",
  error: null,
};

export const fetchFeaturedProducts = createAsyncThunk("products/fetchFeatured", async (_, thunkApi) => {
  try {
    const response = await api.get("/products/featured");
    return response.data.items;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to load featured products.");
  }
});

export const fetchCategories = createAsyncThunk("products/fetchCategories", async (_, thunkApi) => {
  try {
    const response = await api.get("/categories");
    return response.data.items;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to load categories.");
  }
});

export const fetchProducts = createAsyncThunk("products/fetchProducts", async (params, thunkApi) => {
  try {
    const response = await api.get("/products", { params });
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to load products.");
  }
});

export const fetchProductDetails = createAsyncThunk("products/fetchProductDetails", async (slug, thunkApi) => {
  try {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Unable to load product.");
  }
});

export const fetchRecommendations = createAsyncThunk(
  "products/fetchRecommendations",
  async (limit = 8, thunkApi) => {
    try {
      const response = await api.get("/recommendations", { params: { limit } });
      return response.data.items;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "Unable to load recommendations."
      );
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.listing = action.payload.items;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.selected = action.payload.item;
        state.related = action.payload.related;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      });
  },
});

export default productsSlice.reducer;

