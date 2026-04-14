import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import emailService from './emailService';

const initialState = {
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const sendMessage = createAsyncThunk('email/', async (data, thunkAPI) => {
  try {
    return await emailService.sendBooking(data);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const sendContactMessage = createAsyncThunk('email/contact', async (data, thunkAPI) => {
  try {
    return await emailService.sendContact(data);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const sendFreeTourMessage = createAsyncThunk(
  'email/free-tour',
  async (data, thunkAPI) => {
    try {
      return await emailService.sendFreeTour(data);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const emailSlice = createSlice({
  name: 'email',
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
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        if (action.payload === 1) {
          toast.success('Message sent successfully');
        } else {
          toast.error('Message not sent');
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendContactMessage.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(sendContactMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        if (action.payload === 1) {
          toast.success('Message sent successfully');
        } else {
          toast.error('Message not sent');
        }
      })
      .addCase(sendContactMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendFreeTourMessage.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(sendFreeTourMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        if (action.payload === 1) {
          toast.success('Message sent successfully');
        } else {
          toast.error('Message was not sent, please try again later.');
        }
      })
      .addCase(sendFreeTourMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
        toast.error('Message was not sent, please try again later.');
      });
  },
});

export const { reset } = emailSlice.actions;
export default emailSlice.reducer;
