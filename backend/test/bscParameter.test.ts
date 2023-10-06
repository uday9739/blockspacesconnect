import {IBaseOASParameterDefinition, IBaseParameterDefinition, Parameter, ParameterArray, ParameterFactory, ParameterGroup} from '../src/services/Parameter';

describe("Parameter class should construct off of Source/Destination Objects", () => {
  let parameterDefintion:IBaseOASParameterDefinition = {
    name: "test",
    in: "query",
    description: "Test Description",
    type: "string"
  };
  let myParameter = ParameterFactory.create(parameterDefintion);

  it("The new parameter should be defined and of type Parameter", () => {
    expect(myParameter).toBeDefined();
    expect(myParameter).toBeInstanceOf(Parameter);
  });

  it("A new Parameter Group should be defined and of type ParameterGroup", () => {
    parameterDefintion = {
      name: "testGroup",
      in: "",
      description: "A new Parameter Group",
      type:"object",
      properties: {
        field1: {
          type: "string",
          in: "query",
          description: "A string property",
          example: "Example string"
        }
      }
    };
    myParameter = ParameterFactory.create(parameterDefintion);
    expect(myParameter).toBeDefined();
    expect(myParameter).toBeInstanceOf(ParameterGroup);
    expect(myParameter.properties.field1).toBeInstanceOf(Parameter);

  });

  it("A new Parameter Array should be defined and of type ParameterArray", () => {
    parameterDefintion = {
      name: "testArray",
      in: "",
      description: "A new ParameterArray",
      type:"array",
      items: {
        type: "string",
        in: "query",
        description: "A string property",
        example: "Example string"
      }
    };
    myParameter = ParameterFactory.create(parameterDefintion);
    expect(myParameter).toBeDefined();
    expect(myParameter).toBeInstanceOf(ParameterArray);

  });

  it("A new Parameter Group should be created off of an OAS Spec", () => {
    parameterDefintion = {
      "type": "object",
      "properties": {
        "numberOfRecords": {
          "type": "number"
        },
        "hasMoreRecords": {
          "type": "boolean"
        },
        "nextPageHref": {
          "type": "string"
        },
        "updatedRelationships": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "supplierId": {
                "type": "string"
              },
              "status": {
                "type": "string"
              },
              "supplierHRef": {
                "type": "string"
              },
              "updatedDate": {
                "type": "string",
                "format": "date-time"
              },
              "supplierLiaisons": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string"
                    },
                    "name": {
                      "type": "string"
                    },
                    "invitationDate": {
                      "type": "string",
                      "format": "date-time"
                    }
                  }
                }
              },
              "buyerLiaisons": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string"
                    },
                    "name": {
                      "type": "string"
                    }
                  }
                }
              },
              "numberOfQuestionnairesAssigned": {
                "type": "number"
              },
              "numberOfUnansweredQuestionnaires": {
                "type": "number"
              },
              "statusHistory": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string"
                    },
                    "statusChangeDate": {
                      "type": "string",
                      "format": "date-time"
                    },
                    "statusChangedBy": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    myParameter = ParameterFactory.create(parameterDefintion);
    expect(myParameter).toBeDefined();
    expect(myParameter).toBeInstanceOf(ParameterGroup);
    expect(myParameter.properties.numberOfRecords).toBeInstanceOf(Parameter);
    expect(myParameter.properties.hasMoreRecords).toBeInstanceOf(Parameter);
    expect(myParameter.properties.updatedRelationships).toBeInstanceOf(ParameterArray);
    expect(myParameter.properties.updatedRelationships.items.item).toBeInstanceOf(ParameterGroup);
    console.log('testing',myParameter);

  });

  it("A new Parameter Group should be created off of an OAS Spec", () => {
    parameterDefintion = {
      "type": "object",
      "properties": {
        "numberOfRecords": {
          "type": "number"
        },
        "hasMoreRecords": {
          "type": "boolean"
        },
        "nextPageHref": {
          "type": "string"
        },
        "updatedRelationships": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "supplierId": {
                "type": "string"
              },
              "status": {
                "type": "string"
              },
              "supplierHRef": {
                "type": "string"
              },
              "updatedDate": {
                "type": "string",
                "format": "date-time"
              },
              "supplierLiaisons": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string"
                    },
                    "name": {
                      "type": "string"
                    },
                    "invitationDate": {
                      "type": "string",
                      "format": "date-time"
                    }
                  }
                }
              },
              "buyerLiaisons": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string"
                    },
                    "name": {
                      "type": "string"
                    }
                  }
                }
              },
              "numberOfQuestionnairesAssigned": {
                "type": "number"
              },
              "numberOfUnansweredQuestionnaires": {
                "type": "number"
              },
              "statusHistory": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string"
                    },
                    "statusChangeDate": {
                      "type": "string",
                      "format": "date-time"
                    },
                    "statusChangedBy": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    myParameter = ParameterFactory.create(parameterDefintion);
    expect(myParameter).toBeDefined();
    expect(myParameter).toBeInstanceOf(ParameterGroup);
    expect(myParameter.properties.numberOfRecords).toBeInstanceOf(Parameter);
    expect(myParameter.properties.hasMoreRecords).toBeInstanceOf(Parameter);
    expect(myParameter.properties.updatedRelationships).toBeInstanceOf(ParameterArray);
    expect(myParameter.properties.updatedRelationships.items.item).toBeInstanceOf(ParameterGroup);
    console.log('testing',myParameter);

  });

  it("A new Parameter Group should be created off of an OAS Spec", () => {
    let bscParameterDefintion:IBaseParameterDefinition = {
      "name": "items",
      "description": "An array field that represents a collection of elements, for example, sublist lines, multiselect items, or search results.",
      "in": "",
      "type": "array",
      "required": false,
      "items": {
        "item": {
          "name": "item",
          "description": "item",
          "in": "",
          "type": "object",
          "required": false,
          "properties": {
            "balanceBase": {
              "name": "balanceBase",
              "description": "balanceBase",
              "in": "",
              "type": "number",
              "required": false,
              "example": 1234.56
            },
            "lastModifiedDate": {
              "name": "lastModifiedDate",
              "description": "lastModifiedDate",
              "in": "",
              "type": "string",
              "required": false,
              "example": "Example lastModifiedDate"
            },
            "externalId": {
              "name": "externalId",
              "description": "externalId",
              "in": "",
              "type": "string",
              "required": false,
              "example": "Example externalId"
            },
            "prepaymentBalanceBase": {
              "name": "prepaymentBalanceBase",
              "description": "prepaymentBalanceBase",
              "in": "",
              "type": "number",
              "required": false,
              "example": 1234.56
            },
            "isPrimarySub": {
              "name": "isPrimarySub",
              "description": "isPrimarySub",
              "in": "",
              "type": "boolean",
              "required": false,
              "example": true
            },
            "balance": {
              "name": "balance",
              "description": "The vendor&apos;s current accounts payable balance due appears here.",
              "in": "",
              "type": "number",
              "required": false,
              "example": 1234.56
            },
            "prepaymentBalance": {
              "name": "prepaymentBalance",
              "description": "prepaymentBalance",
              "in": "",
              "type": "number",
              "required": false,
              "example": 1234.56
            },
            "name": {
              "name": "name",
              "description": "name",
              "in": "",
              "type": "string",
              "required": false,
              "example": "Example name"
            },
            "id": {
              "name": "id",
              "description": "id",
              "in": "",
              "type": "string",
              "required": false,
              "example": "Example id"
            },
            "creditLimit": {
              "name": "creditLimit",
              "description": "Enter an optional credit limit for your purchases from this vendor. If you have a NetSuite OneWorld account, enter the global credit limit for this vendor and any assigned subsidiary. This value can exceed the sum of the vendor and subsidiary credit limits. This credit limit sets a maximum currency amount that should be spent using credit without making a payment. The value displays in the vendor’s primary currency. The default is no value, or no credit limit. You can place the vendor on hold by entering 0 (zero.) Any new purchase order or vendor bill transaction displays a warning message. You cannot enter a negative value. NetSuite validates the transaction amounts on purchase orders and vendor bills against the global credit limit specified in the Credit Limit field. NetSuite does not include individual subsidiary credit limits in the global credit limit validation.",
              "in": "",
              "type": "number",
              "required": false,
              "example": 1234.56
            },
            "unbilledOrders": {
              "name": "unbilledOrders",
              "description": "This field displays the total amount of orders that have been entered but not yet billed. If you have enabled the preference Vendor Credit Limit Includes Orders, then this total is included in credit limit calculations. Set this preference at Setup &gt; Accounting &gt; Preferences &gt; Accounting Preferences &gt; General.",
              "in": "",
              "type": "number",
              "required": false,
              "example": 1234.56
            },
            "unbilledOrdersBase": {
              "name": "unbilledOrdersBase",
              "description": "unbilledOrdersBase",
              "in": "",
              "type": "number",
              "required": false,
              "example": 1234.56
            },
            "refName": {
              "name": "refName",
              "description": "refName",
              "in": "",
              "type": "string",
              "required": false,
              "example": "Example refName"
            },
            "links": {
              "name": "links",
              "description": "links",
              "in": "",
              "type": "array",
              "required": false,
              "items": {
                "item": {
                  "name": "item",
                  "description": "item",
                  "in": "",
                  "type": "object",
                  "required": false,
                  "properties": {
                    "rel": {
                      "name": "rel",
                      "description": "rel",
                      "in": "",
                      "type": "string",
                      "required": false,
                      "example": "Example rel"
                    },
                    "href": {
                      "name": "href",
                      "description": "href",
                      "in": "",
                      "type": "string",
                      "required": false,
                      "example": "Example href"
                    }
                  }
                }
              }
            },
            "primaryCurrency": {
              "name": "primaryCurrency",
              "description": "primaryCurrency",
              "in": "",
              "type": "object",
              "required": false,
              "properties": {
                "id": {
                  "name": "id",
                  "description": "id",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example id"
                },
                "refName": {
                  "name": "refName",
                  "description": "refName",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example refName"
                },
                "externalId": {
                  "name": "externalId",
                  "description": "externalId",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example externalId"
                },
                "links": {
                  "name": "links",
                  "description": "links",
                  "in": "",
                  "type": "array",
                  "required": false,
                  "items": {
                    "item": {
                      "name": "item",
                      "description": "item",
                      "in": "",
                      "type": "object",
                      "required": false,
                      "properties": {
                        "rel": {
                          "name": "rel",
                          "description": "rel",
                          "in": "",
                          "type": "string",
                          "required": false,
                          "example": "Example rel"
                        },
                        "href": {
                          "name": "href",
                          "description": "href",
                          "in": "",
                          "type": "string",
                          "required": false,
                          "example": "Example href"
                        }
                      }
                    }
                  }
                }
              }
            },
            "taxItem": {
              "name": "taxItem",
              "description": "taxItem",
              "in": "",
              "type": "object",
              "required": false,
              "properties": {
                "id": {
                  "name": "id",
                  "description": "id",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example id"
                },
                "refName": {
                  "name": "refName",
                  "description": "refName",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example refName"
                },
                "externalId": {
                  "name": "externalId",
                  "description": "externalId",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example externalId"
                },
                "links": {
                  "name": "links",
                  "description": "links",
                  "in": "",
                  "type": "array",
                  "required": false,
                  "items": {
                    "item": {
                      "name": "item",
                      "description": "item",
                      "in": "",
                      "type": "object",
                      "required": false,
                      "properties": {
                        "rel": {
                          "name": "rel",
                          "description": "rel",
                          "in": "",
                          "type": "string",
                          "required": false,
                          "example": "Example rel"
                        },
                        "href": {
                          "name": "href",
                          "description": "href",
                          "in": "",
                          "type": "string",
                          "required": false,
                          "example": "Example href"
                        }
                      }
                    }
                  }
                }
              }
            },
            "baseCurrency": {
              "name": "baseCurrency",
              "description": "baseCurrency",
              "in": "",
              "type": "object",
              "required": false,
              "properties": {
                "id": {
                  "name": "id",
                  "description": "id",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example id"
                },
                "refName": {
                  "name": "refName",
                  "description": "refName",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example refName"
                },
                "externalId": {
                  "name": "externalId",
                  "description": "externalId",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example externalId"
                },
                "links": {
                  "name": "links",
                  "description": "links",
                  "in": "",
                  "type": "array",
                  "required": false,
                  "items": {
                    "item": {
                      "name": "item",
                      "description": "item",
                      "in": "",
                      "type": "object",
                      "required": false,
                      "properties": {
                        "rel": {
                          "name": "rel",
                          "description": "rel",
                          "in": "",
                          "type": "string",
                          "required": false,
                          "example": "Example rel"
                        },
                        "href": {
                          "name": "href",
                          "description": "href",
                          "in": "",
                          "type": "string",
                          "required": false,
                          "example": "Example href"
                        }
                      }
                    }
                  }
                }
              }
            },
            "subsidiary": {
              "name": "subsidiary",
              "description": "subsidiary",
              "in": "",
              "type": "object",
              "required": false,
              "properties": {
                "id": {
                  "name": "id",
                  "description": "id",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example id"
                },
                "refName": {
                  "name": "refName",
                  "description": "refName",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example refName"
                },
                "externalId": {
                  "name": "externalId",
                  "description": "externalId",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example externalId"
                },
                "links": {
                  "name": "links",
                  "description": "links",
                  "in": "",
                  "type": "array",
                  "required": false,
                  "items": {
                    "item": {
                      "name": "item",
                      "description": "item",
                      "in": "",
                      "type": "object",
                      "required": false,
                      "properties": {
                        "rel": {
                          "name": "rel",
                          "description": "rel",
                          "in": "",
                          "type": "string",
                          "required": false,
                          "example": "Example rel"
                        },
                        "href": {
                          "name": "href",
                          "description": "href",
                          "in": "",
                          "type": "string",
                          "required": false,
                          "example": "Example href"
                        }
                      }
                    }
                  }
                }
              }
            },
            "entity": {
              "name": "entity",
              "description": "entity",
              "in": "",
              "type": "object",
              "required": false,
              "properties": {
                "id": {
                  "name": "id",
                  "description": "id",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example id"
                },
                "refName": {
                  "name": "refName",
                  "description": "refName",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example refName"
                },
                "externalId": {
                  "name": "externalId",
                  "description": "externalId",
                  "in": "",
                  "type": "string",
                  "required": false,
                  "example": "Example externalId"
                },
                "links": {
                  "name": "links",
                  "description": "links",
                  "in": "",
                  "type": "array",
                  "required": false,
                  "items": {
                    "item": {
                      "name": "item",
                      "description": "item",
                      "in": "",
                      "type": "object",
                      "required": false,
                      "properties": {
                        "rel": {
                          "name": "rel",
                          "description": "rel",
                          "in": "",
                          "type": "string",
                          "required": false,
                          "example": "Example rel"
                        },
                        "href": {
                          "name": "href",
                          "description": "href",
                          "in": "",
                          "type": "string",
                          "required": false,
                          "example": "Example href"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    myParameter = ParameterFactory.load(bscParameterDefintion);
    console.log('testing',myParameter);
    expect(myParameter).toBeDefined();
    expect(myParameter).toBeInstanceOf(ParameterArray);
    expect(myParameter.items.item).toBeInstanceOf(ParameterGroup);

  });
});