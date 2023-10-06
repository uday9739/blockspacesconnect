
/** Scheduler Job configuration (what creates the job) */
interface ISchedulerConfiguration {
    "_id"?: string;
    description: string; // Breif Description of Job.
    initialData?: Array<any>; // data to run for each job
    blockFlowId: string; // BlockFlow Id for each job
    interval: string; // CRON or Human readable interval for Job scheduling. example: [0 0 12 ? * 2#1] means first Monday of every month at Noon. (Handled in UI and passed into to API)
    jobId?: string; // Job Id is created by the agenda process. used when deleting a job from the Agenda.
    cancelled?: boolean; // If false Job is cancelled and does not run
    cancelledBy?: string; // The user who cancelled this job
    cancelledReason?: string; // Reason the user cancelled the job
    cancelledDate?: Date; // Date of cancellation.
};

/** Base scheduler Model. matches the Mongoose Model for MongoDB */
interface IScheduler {
    "_id"?: string; // MongoDB Id Unique Identifier(guid) for Schedule.
    id: string;
    tenantId: string; // Tennant Id of creator
    name: string; // Friendly name for UI display.
    description: string; // Friendly Description for UI display.
    type: SchedulerType; // Type of scheduled Task. (Flow is the only one in use)
    configuration: Array<ISchedulerConfiguration>; // Array of configurations for 1 to many schedules to Jobs. 
    createdBy: string; // User who created this Schedule.
    createdAt?: string; // MongoDB for when this schedule was saved to the DB.
    updatedAt?: string; // MongoDB for when this scheule was updated in the DB.
    "__v"?: number; // Mongo DD Document versioning.
};

/** What Kind of Schedule is being created? */
enum SchedulerType {
    FLOW = "Flow", // ONLY TYPE IN USE AT THE MOMENT
    EMAIL = "Email",
    EVENT = "Event",
    MEETING = "Meeting",
};

export type {
    IScheduler,
    ISchedulerConfiguration,
    SchedulerType
};


// eslint-disable-next-line no-unused-vars
/** EAMPLE REQUEST JSON */
const reqJsonFromBody: IScheduler = {
    "id": "XVc9Gw00qWLhw1hShgyXvmzEzoVriif3",
    "name": "Schedule Test JSON 2",
    "tenantId": "Kmch3jBxyhS6V8Wivk4G5CEs8Jt7KG6L",
    "description": "This is another test Scheduler schedule.",
    "type": "Flow" as SchedulerType,
    "createdBy": "username",
    "configuration": [
        {
            "description": "Run every Monday, Wednesday, Friday at 3pm",
            "blockFlowId": "6100324e56be8b8e62b1c4a8",
            "interval": "0 0 15 ? * MON,WED,FRI",
            "initialData": [
                {
                    "updatedSince": "2021-07-25",
                    "productId": ["00110562889583", "00110567284666"]
                }
            ]
        },
        {
            "description": "The 15th of each Month at 12pm",
            "blockFlowId": "6ffc383b-218e-4df9-aab6-5964d57bfb80",
            "interval": "0 0 12 15 * ?",
            "initialData": [
                {
                    "updatedSince": "2020-08-15",
                    "productId": ["urn:ibm:ift:product:class:2198393805709.Pilsn4_c0f500bd", "urn:ibm:ift:product:class:2198393805709.water3_c0f500bd", "00110567284666"],
                    "action": "GetClients",
                    "tenantId": "Kmch3jBxyhS6V8Wivk4G5CEs8Jt7KG6L"
                }
            ]
        }
    ]
};

/** EXAMPLE OF THE RESPONSE
 *  response is a duplicate of the ISheduler interface
 */
const resJson: IScheduler = {
    "_id": "6202c9a368e7e426408a9830",
    "id": "XVc9Gw00qWLhw1hShgyXvmzEzoVriif23",
    "tenantId": "Kmch3jBxyhS6V8Wivk4G5CEs8Jt7KG63",
    "name": "Schedule Test JSON 4",
    "description": "This is yet another test Scheduler schedule.",
    "type": "Flow" as SchedulerType,
    "configuration": [
        {
            "cancelled": false,
            "_id": "6202c9a368e7e426408a9831",
            "description": "Run every Monday, Wednesday, Friday at 3pm",
            "initialData": [{"updatedSince": "2021-07-25","productId": ["00110562889583","00110567284666"]}
            ],
            "blockFlowId": "6100324e56be8b8e62b1c4a8",
            "interval": "0 0 15 ? * MON,WED,FRI",
            "jobId": "e6db717c-0736-4921-b8ac-5625a770e279"
        },
        {
            "cancelled": false,
            "_id": "6202c9a368e7e426408a9832",
            "description": "The 15th of each Month at 12pm",
            "initialData": [
                {
                    "updatedSince": "2020-08-15",
                    "productId": ["urn:ibm:ift:product:class:2198393805709.Pilsn4_c0f500bd","urn:ibm:ift:product:class:2198393805709.water3_c0f500bd","00110567284666"],
                    "action": "GetClients",
                    "tenantId": "Kmch3jBxyhS6V8Wivk4G5CEs8Jt7KG6L"
                }
            ],
            "blockFlowId": "6ffc383b-218e-4df9-aab6-5964d57bfb80",
            "interval": "0 0 12 15 * ?",
            "jobId": "fb0eb6db-c621-4544-a996-2efc478153a9"
        }
    ],
    "createdBy": "username",
    "createdAt": "2022-02-08T19:50:59.700Z",
    "updatedAt": "2022-02-08T19:50:59.700Z",
    "__v": 0
}