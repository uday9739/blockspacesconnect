
/** PRIVATE: Base Log that Designates an log entry made in code. */
interface ILogBase { 
    /** Brief message about the Log */
    message: string;
    /** The page name the log file was generated from. */
    module: string;
    /** Module internal method */
    source: string;
};

/** Designates finer-grained informational events than the DEBUG. */
interface ILogTrace extends ILogBase  { 
    /** Additional Detailed Trace message. */
    trace?: string;
};

/** Designates error events that might still allow the application to continue running. */
interface ILogError extends ILogBase { 
    /** Additional error stack trace or related information */
    error?: string;
};

/** Designates fine-grained informational events that are most useful to debug an application. */
interface ILogDebug extends ILogBase { 
    /** Additional debug details */
    response?: string;
};

/** Designates informational messages that highlight the progress of the application at coarse-grained level. */
interface ILogInfo  extends ILogBase { 
    /** Addional Information to be logged. */
    info?: string;
};

/** Designates potentially harmful situations. */
interface ILogWarn extends ILogBase { 
    /** Additional warning detailed information to be logged. */
    warning?: string;
};

/** Designates very severe error events that will presumably lead the application to abort. */
interface ILogFatal extends ILogBase { 
    /** Additional detailed Fatal information */
    fatal?: string;
};

export type { ILogError, ILogDebug, ILogTrace, ILogInfo, ILogWarn, ILogFatal };
