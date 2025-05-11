export interface MailAccount {
  imap_server: string;
  smtp_server: string
  mail_email: string;
  id: number;
  user_id: number
  email_count: number
  last_synced_uid: number
}