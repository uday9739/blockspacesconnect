const scheduledJobs = mongoose => {

    const dataschema = new mongoose.Schema({
        clientId: { type: String },
        blockFlowId: { type: String },
        initialData: { type: Object },
        taskdefinitionId: { type: String },
        taskscheduled: { type: String },
        taskscheduletime: { type: Date },
        uniqueId: { type: String }
    });


    const schema = mongoose.Schema({
        name: { type: String },
        data: {
            type: dataschema
        },
        type: { type: String },
        priority: { type: Number },
        nextRunAt: {
            type: Date
        },
        lastModifiedBy: {
            type: Date
        }
    },
        {
            timestamps: true
        });

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const scheduledjobs = mongoose.model("jobs", schema);
    return scheduledjobs;
};

export default scheduledJobs