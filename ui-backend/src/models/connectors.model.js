const Connectors = mongoose => {
    const schema = mongoose.Schema({
        id: {
            type: String,
            unique: true,
            required: [true, 'Connector ID is required']
        },
        name: {
            type: String,
            required: [true, 'Connector name is required']
        },
        type: {
            type: String,
            required: [true, 'Connector type is required'],
            enum: ['System', 'Blockchain', 'Datastore', 'Transformation', 'Authentication', 'Iterator']
        },
        description:
        {
            type: String,
            required: false
        },
        system: {
            type: String,
            required: [true, 'System ID is required']
        },
        groups: {
            type: [String],
            required: true
        },
        servers: [{
            url: {
                type: String,
                required: true
            },
            "x-environment": {
                type: String,
                required: true,
                default: "Development"
            }
        }],
        securitySchemes: {
            type: Object,
            required: false
        },
        specification_raw: {
            type: Object,
            required: true
        },
        specification_dereferenced: {
            type: Object,
            required: true
        },
        specification_processed: {
            type: Object,
            required: true
        }
    },
        {
            timestamps: true
        });

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        //        object.id = _id;
        return object;
    });

    const Connectors = mongoose.model("connectors", schema);

    return Connectors;
};

export default Connectors;