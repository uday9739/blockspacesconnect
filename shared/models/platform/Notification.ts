export interface Notification {
  _id?: string,
  tenant_id?: string,
  user_id?: string,
  expiration_date?: string,
  read?: boolean,
  read_date?: string,
  title: string,
  message: string,
  action_url?: string,
  email_id?: string,
  dynamic_email_data?: Record<string, any>,
  dynamic_email_template_id?: string,
}
