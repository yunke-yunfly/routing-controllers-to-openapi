import { Role } from '../../types/common.type';
import { GroupDataWithUsers } from '../GroupService/type';

export interface ProjectData {
  id: string;
  unique_name: string;
  user_code: string;
  cache_control?: string;
  name: string;
  create_time: string;
  update_time: string;
}

interface ProjectUserData {
  user_code: string;
  group_id: string;
  role: Role;
}

interface EnvData {
  id: string;
  name: string;
}
interface ProjectEnvData {
  cache_control?: string;
  version?: string;
  create_time: string;
  update_time: string;
  env: EnvData;
}

export interface GetProjectResponse extends ProjectData {
  envs: ProjectEnvData[];
  users: ProjectUserData[];
  group: GroupDataWithUsers;
}

interface AddProjectRequest extends Pick<ProjectData, 'cache_control' | 'name' | 'unique_name'> {
  group_id: string;
  user_code: string;
  envs: string[];
}
export interface UpdateProjectRequest {
  user_code: string;
  project_id: string;
  envs: string[];
  name: string;
}

export interface UpdateEnvRequest {
  project_id: string;
  env: string;
  user_code: string;
  version?: string;
  cache_control?: string;
}

export interface AddUserRequest {
  project_id: string;
  role: Role;
  user_code: string;
}

export interface deleteUserRequest {
  project_id: string;
  user_code: string;
}
