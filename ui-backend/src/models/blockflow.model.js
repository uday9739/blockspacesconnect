const Blockflow = mongoose => {

    const schema = mongoose.Schema({
        id: {
            type: String,
            required: [true,
                'Block Flow ID is required'
            ],
            unique: true
        },
        name: {
            type: String,
            required: false,
            "default": ""
        },
        parentId: [{
            type: String,
            required: false,
            "default": []
        }],
        clientId: {
            type: String,
            required: [true,
                'Response: Client Id is required'
            ]
        },
        type: {
            type: String,
            required: [true, 'Blockchain Type is Required'],
            enum: ['SCHEDULED', 'ROUNDTRIP', 'ONEWAY']
        },
        isAuthFlow: {
            type: Boolean,
            required: [true, 'Must specify if this is an auth flow or not'],
            "default": false
        },
        steps: {
            type: Array,
            "default": []
        },
        mappings: {
            type: Array,
            "default": []
        },
    }, { timestamps: true });

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        // object.id = _id;
        return object;
    });

    const blockflow = mongoose.model("blockflow", schema);
    return blockflow;
};

export default Blockflow;