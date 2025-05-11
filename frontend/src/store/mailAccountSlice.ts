import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MailAccount } from "../api/models/dto/mailAccount";
import MailAccountsService from "../api/services/mailAccountsService";
import MailService from "../api/services/mailService";
import { FolderInfo } from "../api/models/dto/folderInfo";
import { EmailInfo } from "../api/models/dto/mail";

interface MailAccountState {
  accounts: MailAccount[];
  selected: MailAccount | null;
  folders: FolderInfo[];
  selectedFolder: FolderInfo | null;
  emails: EmailInfo[];
  emailCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: MailAccountState = {
  accounts: [],
  selected: null,
  folders: [],
  selectedFolder: null,
  emails: [],
  emailCount: 0,
  loading: false,
  error: null,
};

export const fetchMailAccounts = createAsyncThunk(
  'mailAccounts/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await MailAccountsService.getAllMailAccounts();
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Ошибка загрузки аккаунтов');
    }
  }
);

export const fetchFolders = createAsyncThunk(
  'mailAccounts/fetchFolders',
  async (accountId: number, thunkAPI) => {
    try {
      return await MailService.fetchFolders(accountId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Ошибка загрузки папок');
    }
  }
);

export const fetchEmailsByFolder = createAsyncThunk(
  'mailAccounts/fetchEmailsByFolder',
  async (
    {
      accountId,
      folderName,
      offset = 0,
      limit = 20,
    }: { accountId: number; folderName: string; offset?: number; limit?: number },
    thunkAPI
  ) => {
    try {
      const data = await MailService.fetch(accountId, folderName, offset, limit);
      return { emails: data.emails, emailCount: data.email_count };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Ошибка загрузки писем');
    }
  }
);

const mailAccountSlice = createSlice({
  name: 'mailAccounts',
  initialState,
  reducers: {
    addMailAccount(state, action: PayloadAction<MailAccount>) {
      const exists = state.accounts.find((a) => a.id === action.payload.id);
      if (!exists) {
        state.accounts.push(action.payload);
      }
    },
    setCurrentMailAccount(state, action: PayloadAction<number>) {
      const found = state.accounts.find((a) => a.id === action.payload);
      if (found) {
        state.selected = found;
        state.selectedFolder = null;
        state.folders = [];
        state.emails = [];
        state.emailCount = 0;
      }
    },
    clearSelectedAccount(state) {
      state.selected = null;
      state.selectedFolder = null;
      state.folders = [];
      state.emails = [];
      state.emailCount = 0;
    },
    setFolders(state, action: PayloadAction<FolderInfo[]>) {
      state.folders = action.payload;
    },
    setSelectedFolder(state, action: PayloadAction<FolderInfo | null>) {
      state.selectedFolder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMailAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMailAccounts.fulfilled, (state, action: PayloadAction<MailAccount[]>) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchMailAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFolders.fulfilled, (state, action: PayloadAction<FolderInfo[]>) => {
        state.folders = action.payload;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchEmailsByFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmailsByFolder.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = action.payload.emails;
        state.emailCount = action.payload.emailCount;
      })
      .addCase(fetchEmailsByFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addMailAccount,
  setCurrentMailAccount,
  clearSelectedAccount,
  setFolders,
  setSelectedFolder,
} = mailAccountSlice.actions;

export default mailAccountSlice.reducer;
