import { NetworkCuratedResourcesDto } from "@blockspaces/shared/dtos/network-catalog";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { NetworkCuratedResourcesDataServices } from "../NetworkCuratedResourcesDataServices";
import MockData from './NetworkCuratedResourcesDataServiceTestObjects.json';

describe(`${NetworkCuratedResourcesDataServices.name}`, () => {
  let service: NetworkCuratedResourcesDataServices;

  let mockServices: {
    db: ConnectDbDataContext
  };

  let mockData: NetworkCuratedResourcesDto[];

  beforeEach(() => {
    mockServices = {
      db: createMock<ConnectDbDataContext>(),
    };

    // mockData = createMock<NetworkCuratedResourcesDto>();
    mockData = <NetworkCuratedResourcesDto[]>MockData;

    service = new NetworkCuratedResourcesDataServices(mockServices.db);
  })

  it(`${NetworkCuratedResourcesDataServices.prototype.getCuratedResourcesForNetwork.name} find network`, async () => {
    // arrange
    mockServices.db.networkCuratedResources.find = jest.fn().mockImplementation((data) => { return mockData.filter((network) => network.network === mockData[0].network) });

    // act
    const results = await service.getCuratedResourcesForNetwork(mockData[0].network);

    // assert
    expect(results.data.network).toEqual(mockData[0].network);
    expect(results.data.resources.length).toBeGreaterThan(0);
  });

  it(`${NetworkCuratedResourcesDataServices.prototype.getCuratedResourcesForNetwork.name} don't find network`, async () => {
    // arrange
    mockServices.db.networkCuratedResources.find = jest.fn().mockImplementation((data) => { return mockData.filter((network) => network.network === 'notfound') });

    // act
    const results = await service.getCuratedResourcesForNetwork('notfound');

    // assert
    expect(results.data.network).toEqual('notfound');
    expect(results.data.resources.length).toBe(0);
  });

});
