import {Inject, Injectable} from "@nestjs/common";
import { HaproxyApiService } from "./HaproxyApiService";
import { ServiceUnavailableException } from "../../exceptions/common";

@Injectable()
export class HaproxyService {

  constructor(private readonly haproxyApiService: HaproxyApiService
  ){
  }

  /**
   *
   * GetMapEntries - get the entries in a map file
   *
   * @returns array of
   * @returns string key - the key in the key/value pair
   *
   */
  async getMapEntries(): Promise<Array<{ key: string }>> {
    try{
      const mapEntries = await this.haproxyApiService.getMapEntries();
      return mapEntries.map((mapEntry) => { return { key: mapEntry.key } });
    }catch (error){
      throw new ServiceUnavailableException(error, { cause: error, description: "HaproxyService.getMapEntries error"});
    }
  }

  /**
   *
   * GetStatus - get the status of the haproxy by reading the in a map file
   *
   * @returns Promise<boolean>
   *
   */
  async getStatus(): Promise<Boolean> {
    try {
      const mapEntries = await this.haproxyApiService.getMapEntries();
      return mapEntries.length >= 0;
    }catch (error){
      throw new ServiceUnavailableException(error, { cause: error, description: "HaproxyService.getStatus error"});
    }
  }

  /**
   *
   * AddMapEntry - adds a new entry in the map file
   *
   * @param  {string} key - the path of the endpoint
   * @param  {string} value - the provider of the backend services for the endpoint
   *
   * @returns Promise
   *
   */
  async addMapEntry(key: string, value: string): Promise<void> {
    try{
      await this.haproxyApiService.addMapEntry(key, value);
      return;
    }catch (error){
      throw new ServiceUnavailableException(error, { cause: error, description: "HaproxyService.addMapEntry error"});
    }
  }

  /**
   *
   * DeleteMapEntry - deletes an entry in the map file
   *
   * @param  {string} key - the key of the key/value of the entry in the map file
   * @returns Promise
   */
  async deleteMapEntry(key: string): Promise<void> {
    try{
      await this.haproxyApiService.deleteMapEntry(key);
      return;
    }catch (error){
      throw new ServiceUnavailableException(error, { cause: error, description: "HaproxyService.deleteMapEntry error"});
    }
  }
}
