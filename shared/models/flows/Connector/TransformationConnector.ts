import { capitalize } from "lodash";
import { Connector, IConnector } from ".";
import { ConnectionType } from "../Connection";
import { ParameterFactory, TParameterFactory } from "../Parameter";
import {
  Transformation,
  TransformationCategory,
  TransformationFactory,
  TransformationName,
  TTransformationFactory
} from "../transformations";

export class TransformationConnector extends Connector {

  readonly category: TransformationCategory;

  protected transformations: Partial<Record<TransformationName, Transformation>>;
  private readonly transformationFactory: TTransformationFactory;

  constructor(
    category: TransformationCategory,
    transformationFactory: TTransformationFactory = TransformationFactory,
    parameterFactory: TParameterFactory = ParameterFactory) {
    const name = `${capitalize(category)} Transformations`;
    const connector: IConnector = {
      id: `transformation${capitalize(category)}`,
      name: name,
      description: name,
      type: ConnectionType.TRANSFORMATION,
      specification_processed: null
    }

    super(connector, parameterFactory);

    this.category = category;
    this.transformationFactory = transformationFactory;
    this.initTransformations();
  }

  private initTransformations() {
    this.transformations = {};

    Object.values(TransformationName).forEach(transName => {
      const transformation = this.transformationFactory(transName);

      if (transformation.category === this.category)
        this.transformations[transName] = transformation;
    })
  }
}