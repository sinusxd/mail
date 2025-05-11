import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmailInfo } from '../api/models/dto/mail';

interface MailState {
  emails: EmailInfo[];
  selectedEmail: EmailInfo | null;
}

const initialState: MailState = {
  emails: [],
  selectedEmail: null,
};

export const mailSlice = createSlice({
  name: 'mail',
  initialState,
  reducers: {
    setEmails(state, action: PayloadAction<EmailInfo[]>) {
      state.emails = action.payload;
    },
    selectEmail(state, action: PayloadAction<EmailInfo | null>) {
      state.selectedEmail = action.payload;
    },
    clearEmails(state) {
      state.emails = [];
      state.selectedEmail = null;
    },
  },
});

export const { setEmails, selectEmail, clearEmails } = mailSlice.actions;
export default mailSlice.reducer;
