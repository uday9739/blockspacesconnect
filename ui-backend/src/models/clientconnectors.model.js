const clientConnectors = mongoose => {
    const schema = mongoose.Schema({
        clientId: {
            type: String,
            required: [true, 'Client ID is required']
        },
        subStartDate: {
            type: Date,
            required: [true, 'Subscription Start Date is required']
        },
        subEndDate: {
            type: Date,
            required: [true, 'Subscription End Date is required']
        },
        connectorId: {
            type: String,
            required: [true, 'Connector ID is required']
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

    const clientConnectors = mongoose.model("clientconnectors", schema);

    return clientConnectors;
};

export default clientConnectors;
