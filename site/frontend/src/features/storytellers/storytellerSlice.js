import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import storytellerService from './storytellerService';

const initialState = {
  storytellers: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getStorytellers = createAsyncThunk('storytellers/all', async (_, thunkAPI) => {
  try {
    return await storytellerService.getStorytellers();
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const storytellerSlice = createSlice({
  name: 'storytellers',
  initialState,
  reducers: {
    reset: (state) => {
      state.storytellers = [];
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStorytellers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStorytellers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.storytellers = action.payload;
      })
      .addCase(getStorytellers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.storytellers = [];
      });
  },
});

export const { reset } = storytellerSlice.actions;
export default storytellerSlice.reducer;
