const clientConnetions = mongoose => {
    const schema = mongoose.Schema({
        clientId: {
            type: String,
            required: [true, 'Client ID is required']
        },
        connectorId: {
            type: String,
            required: [true, 'Connector ID is required']
        },
        credentials: {
            type: String,
            required: [true, 'Credentials is required']
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

    const clientConnections = mongoose.model("clientconnections", schema);

    return clientConnections;
};

export default clientConnetions