import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import serviceService from './serviceService';

const initialState = {
  service: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getService = createAsyncThunk('services/:name', async (name, thunkAPI) => {
  try {
    return await serviceService.getService(name);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getService.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.service = action.payload;
      })
      .addCase(getService.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = serviceSlice.actions;
export default serviceSlice.reducer;
