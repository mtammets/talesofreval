import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import tourService from './tourService';

const initialState = {
  dates: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getDates = createAsyncThunk('dates/', async (_, thunkAPI) => {
  try {
    return await tourService.getDates();
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const initiateStripe = createAsyncThunk('stripe/initiate', async (data, thunkAPI) => {
  try {
    return await tourService.initiateSripe(data);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const tourSlice = createSlice({
  name: 'tour',
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
      .addCase(initiateStripe.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(initiateStripe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        window.location.href = action.payload.data;
      })
      .addCase(initiateStripe.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload);
      })
      .addCase(getDates.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(getDates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.dates = action.payload;
      })
      .addCase(getDates.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { reset } = tourSlice.actions;
export default tourSlice.reducer;
