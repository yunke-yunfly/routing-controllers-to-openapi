export interface ServiceResponse<T = any> {
  code: number;
  data?: T;
  error?: any;
  error_detail?: any;
}

export interface MetaData {
  orgcode?: string;
  appid?: string;
  'trace-id'?: string;
  [propname: string]: any;
}

export interface AnyOptions {
  [propsname: string]: any;
}

export interface RpcServiceResponse<T = any> {
  error?: any;
  error_details?: string;
  response: T;
  metadata: any;
}
