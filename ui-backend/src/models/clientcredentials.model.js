const ClientCredentials = mongoose => {

  const schema = mongoose.Schema({
    credentialId: {
      type: String,
      required: [
        true,
        'Client Credential ID is required'
      ],
      unique: true
    },
    clientId: {
      type: String,
      required: [
        true,
        'Response: Client Id is required'
      ]
    },
    connectorId: {
      type: String,
      required: [
        true,
        'Connector ID is Required'
      ]
    },
    label: {
      type: String,
      required: [
        true,
        'Client Credential Label is Required'
      ]
    },
    description: {
      type: String,
      required: false
    }
  }, { timestamps: true });

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    // object.id = _id;
    return object;
  });

  const clientCredential = mongoose.model("clientCredential", schema);
  return clientCredential;
};

export default ClientCredentials;