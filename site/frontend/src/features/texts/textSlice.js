import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import textService from './textService';

const initialState = {
  home_texts: [],
  header_texts: [],
  footer_texts: [],
  misc_texts: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getMiscTexts = createAsyncThunk('texts/misc', async (_, thunkAPI) => {
  try {
    return await textService.getTextByCategory('misc');
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getHomeTexts = createAsyncThunk('texts/home', async (_, thunkAPI) => {
  try {
    return await textService.getTextByCategory('home-page');
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getHeaderTexts = createAsyncThunk('texts/header', async (_, thunkAPI) => {
  try {
    return await textService.getTextByCategory('header');
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getFooterTexts = createAsyncThunk('texts/footer', async (_, thunkAPI) => {
  try {
    return await textService.getTextByCategory('footer');
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const textSlice = createSlice({
  name: 'texts',
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
      .addCase(getHomeTexts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHomeTexts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.home_texts = action.payload;
      })
      .addCase(getHomeTexts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getHeaderTexts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHeaderTexts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.header_texts = action.payload;
      })
      .addCase(getHeaderTexts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getFooterTexts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFooterTexts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.footer_texts = action.payload;
      })
      .addCase(getFooterTexts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMiscTexts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMiscTexts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.misc_texts = action.payload;
      })
      .addCase(getMiscTexts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = textSlice.actions;
export default textSlice.reducer;
