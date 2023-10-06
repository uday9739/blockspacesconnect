/** Used to save the ToS to MongoDB */
export interface IToSContent {
    /** The Text/HTML for the ToS to display */
    content: string;
    id?: string;
    active?: boolean;
    /** who created or updated the ToS */
    author?: string;
    /** Is this ToS Network specific? */
    network?: string;
    /** Does this ToS require the user to accept? */
    acceptance?: boolean;
    // MONGODB Specific properties.
    /** MongoDB ID */
    "_id"?: string;
    /** MongoDB created Date */
    createdAt?: string;
    /** MongoDB Last updated Date */
    updatedAt?: string;
    /** MongoDB document version */
    "__v"?: string;
};