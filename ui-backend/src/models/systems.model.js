const System = mongoose => {
    const schema = mongoose.Schema(
        {
            id: {
                type: String,
                unique: true,
                required: [true, 'System ID is required']
            },
            name: {
                type: String,
                required: [true, 'System name is required']
            },
            description:
            {
                type: String,
                required: false
            },
            type: {
                type: String,
                required: [true, 'System type is required'],
                enum: ['Source', 'Blockchain']
            },
            logo: {
                type: String,
                required: [true, 'System logo is required'],
            },
            icon: {
                type: String,
                required: [true, 'System icon is required'],
            }
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        //object.id = _id;
        return object;
    });

    const Systems = mongoose.model("systems", schema);

    return Systems;
};

export default System;