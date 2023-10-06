
/** User Password Reset Model */
export interface IResetPassword {
    /** Context Id from AppId URL query */
    context: string,
    /** Users New Password to be saved to AppId */
    password: string
  }