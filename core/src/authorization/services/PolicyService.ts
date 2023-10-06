import { Injectable } from "@nestjs/common";
import { Enforcer } from "casbin";
import { Policy, PolicyPermission, PolicyResource } from "../types/Policy";
import { TenantRole } from "@blockspaces/shared/dtos/tenants";

export enum PolicyFilter {
  ROLE = 0,
  TENANT = 1,
  RESOURCE = 2,
  PERMISSION = 3,
}

/**
 * Provides operations for managing security/access policies within the Connect platform
 */
@Injectable()
export class PolicyService {

  constructor(private readonly enforcer: Enforcer) { this.enforcer.enableAutoSave(true) }

  async getPolicies(policyFilter: PolicyFilter, policyFilterValues: string[]): Promise<Policy[]> {
    const filteredPolicies = await this.enforcer.getFilteredPolicy(policyFilter, ...policyFilterValues);
    const policies: Policy[] = filteredPolicies.map((policyStringArray): Policy => {
      return {
        roleId: policyStringArray[0],
        tenantId: policyStringArray[1],
        resource: policyStringArray[2] as PolicyResource,
        permission: policyStringArray[3] as PolicyPermission
      }
    })
    return policies;
  }

  /**
   * 
   * getRoles - Gets all of the roles in the system
   * 
   * @returns {string[]} - The array of role names
   * 
   */
  async getRoles(): Promise<string[]> {
    const roles = await this.enforcer.getAllRoles();
    return roles;
  }


  /**
   * getRolesForUser - Gets all of the roles a user has within a tenant
   * 
   * @param  {string} userId
   * @param  {string} tenantId
   * 
   * @returns {string[]} - The array of role names
   * 
   */
  async getRolesForUser(userId: string, tenantId: string): Promise<string[]> {
    const roles = await this.enforcer.getRolesForUserInDomain(userId, tenantId);
    return roles;
  }

  /**
   * 
   * addUserToRoles - Adds a user to a set of roles within a tenant
   * 
   * @param  {string} userId
   * @param  {string} tenantId
   * @param  {PolicyRole[]} roles
   * 
   * @returns {boolean} - true if they were successfully added, false if not
   * 
   */
  async addUserToRoles(userId: string, tenantId: string, roles: TenantRole[]): Promise<boolean> {
    await Promise.all(roles.map((role) => { this.enforcer.addRoleForUser(userId, role, tenantId) }))
    // const test = await this.enforcer.save();
    return true;
  }

  /**
   * 
   * removeUserFromRoles - removes a user from selected roles in a tenant
   * 
   * @param  {string} userId
   * @param  {string} tenantId
   * @param  {PolicyRole[]} roles
   * 
   * @returns {boolean} - true if they were successfully removed, false if not
   * 
   */
  async removeUserFromRoles(userId: string, tenantId: string, roles: TenantRole[]): Promise<boolean> {
    await Promise.all(roles.map((role) => { return this.enforcer.deleteRoleForUser(userId, role, tenantId) }));
    // return await this.enforcer.savePolicy();
    return true;
  }

  /**
   * 
   * removeUserFromAllRoles - Removes a user from all roles within a tenant
   * 
   * @param  {string} userId
   * @param  {string} tenantId
   * 
   * @returns {boolean} - true if they were successfully removed, false if not
   * 
   */
  async removeUserFromAllRoles(userId: string, tenantId: string): Promise<boolean> {
    await this.enforcer.deleteRolesForUser(userId, tenantId);
    // return await this.enforcer.savePolicy();
    return true;
  }

  /**
   * Adds a policy
   *
   * @param policy the policy to add
   * @returns `true` if the policy was added, or `false` if the policy already exists
   *
   * @see https://casbin.io/docs/policy-storage for details on how Casbin stores policies
   */
  async addPolicy(policy: Policy): Promise<boolean> {

    if (!policy) {
      return false;
    }

    return await this.addPolicies([policy]);

  }

  /**
   * Adds a collection of policies
   *
   * @param policies the policies to add
   * @returns `true` if the policies were added, or `false` if the policies already exist
   *
   * @see https://casbin.io/docs/policy-storage for details on how Casbin stores policies
   */
  async addPolicies(policies: Policy[]): Promise<boolean> {
    if (!policies?.length) {
      return false;
    }

    await this.enforcer.addPolicies(policies.map(p => this.convertToCasbinPolicy(p)));
    // return await this.enforcer.savePolicy();
    return true;

  }

  /**
 * Removes a policy
 *
 * @param policy the policy to remove
 * @returns `true` if the policy was removed, or `false` if the policy didn't get removed
 *
 * @see https://casbin.io/docs/policy-storage for details on how Casbin stores policies
 */
  async removePolicy(policy: Policy): Promise<boolean> {

    if (!policy) {
      return false;
    }

    return await this.removePolicies([policy]);

  }

  /**
   * Removes a collection of policies
   *
   * @param policies the policies to remove
   * @returns `true` if the policies were removed, or `false` if the policies didn't get removed
   *
   * @see https://casbin.io/docs/policy-storage for details on how Casbin stores policies
   */
  async removePolicies(policies: Policy[]): Promise<boolean> {
    if (!policies?.length) {
      return false;
    }

    await this.enforcer.removePolicies(policies.map(p => this.convertToCasbinPolicy(p)));
    // return await this.enforcer.savePolicy();
    return true;

  }

  /** convert a policy object to a Casbin policy array */
  private convertToCasbinPolicy(policy: Policy): string[] {
    return [policy.roleId, policy.tenantId, policy.resource, policy.permission];
  }

  /** convert a collection of Casbin policies */
  private covertToCasbinPolicies(policies: Policy[]): string[][] {
    return policies?.map(p => this.convertToCasbinPolicy(p));
  }

  /** covert a casbin policy array to a policy object */
  private convertFromCasbinPolicy(policyArray: string[]): Policy {
    if (!policyArray?.length) {
      return null;
    }

    return {
      roleId: policyArray.at(0),
      tenantId: policyArray.at(1),
      resource: policyArray.at(2) as PolicyResource,
      permission: policyArray.at(3) as PolicyPermission
    };
  }
}