const Transaction = mongoose => {
    const schema = mongoose.Schema(
        {
          transactionId: {
                type: String,
                unique: true,
                required: [true, 'Transaction ID is required']
            },
          startedOn:
            {
              type: String,
              required: [true, 'startedOn is required']
            },
          completedOn:
            {
              type: String
            },
          status:
            {
              type: String,
              required: [true, 'status is required'],
              enum: ['started', 'running', 'waiting', 'error', 'retry', 'completed']
            },
          description:
            {
                type: String,
                required: [true, 'description ID is required']
            },
          transactionType: {
                type: String,
                required: [true, 'transactionType is required'],
                enum: ['triggered flow', 'scheduled flow', 'billing', 'reporting', 'other']
            }
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        //object.id = _id;
        return object;
    });

    const Transactions = mongoose.model("transactions", schema);

    return Transactions;
};

export default Transaction;