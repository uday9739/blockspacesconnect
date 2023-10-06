const schedulerDefinition = mongoose => {
    const schema = mongoose.Schema({
        clientId: {
            type: String,
            required: [true, 'Client ID is required']
        },
        startDate: {
            type: Date,
            default: Date,
            required: [true, 'Start Date is required']
        },
        startTimeInMins: {
            type: Number,
            default: 540,
            required: [true, 'Start Time is required']
        },
        endDate: {
            type: Date,
        },
        endTimeInMins: {
            type: Number,
        },
        dwmFlag: {
            type: String,
            required: [true, 'Daily / Weekly / Monthly is required']
        },
        wAllDays: {
            type: Boolean,
            default: false,
        },
        wDays: {
            type: String,
        },
        mAllMonths: {
            type: Boolean,
            default: false,
        },
        mMonths: {
            type: String,
        },
        mDays: {
            type: String,
        },
        mWeekDays: {
            type: String,
        },
        repeatTaskEveryInMins: {
            type: Number,
            required: [true, 'Repeat Task every 15/30/45 minutes or 1 hour is required']
        },
        forDurationInDayInMins: {
            type: Number,
            required: [true, 'For Duration in a Day is required']
        },
        blockFlowId: {
            type: String,
            required: [true, 'BlockFlow ID is required']
        },
        initialData: {
            type: Object,
            default: {}
        },
        active: {
            type: Boolean,
            default: true,
            required: true
        },
    },
        {
            timestamps: true
        });

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const schedulerdefinition = mongoose.model("schedulerdefinition", schema);
    return schedulerdefinition;
};

export default schedulerDefinition;