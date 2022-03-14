export type AnyOpt = Record<string, any>;

export type AstType = Node | Node[] | null | undefined | AnyOpt;

export type ParamType = 'body' | 'header' | 'query' | 'cookie' | 'path';

export interface ParamTypesConfig {
  name: string;
  name_?: string;
  schema: AnyOpt;
  required: boolean;
  in: ParamType;
  decoratorType:
  | 'Body'
  | 'BodyParam'
  | 'HeaderParams'
  | 'HeaderParam'
  | 'CookieParam'
  | 'CookieParams'
  | 'UploadedFile'
  | 'UploadedFiles'
  | 'QueryParam'
  | 'QueryParams'
  | 'Param'
  | 'Params'
  | 'Session'
  | 'SessionParam'
  | 'Req'
  | 'Res'
  | 'State';
  description?: string;
  tags?: string[];
  default?: string;
  type?: string;
  example?: string;
}

export type Openapiv3ReturnTypeConfig = Record<string, {
  description?: string;
  content?: Record<string, AnyOpt>;
}>;

export type Openapiv3SchemasConfig = Record<string, AnyOpt>;

export interface Openapiv3ParametersConfig {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  schema?: AnyOpt;
  example?: string;
}

export interface Openapiv3RequestBodyConfig {
  description?: string;
  content?: AnyOpt;
}

export interface MethodConfig {
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: Openapiv3ParametersConfig[];
  operationId?: string;
  responses?: AnyOpt;
  requestBody?: Openapiv3RequestBodyConfig;
}

type PathItem = Record<string, MethodConfig>;

export type RequiredType = 'typescript' | 'routing-controllers';

export type Openapiv3Paths = Record<string, PathItem>;

export interface Openapiv3Info {
  title: string;
  description?: string;
  version?: string;
  [props: string]: any;
}

export interface Openapiv3Tags {
  name?: string;
  description?: string;
  [props: string]: any;
}

interface Openapiv3Components {
  schemas?: AnyOpt;
}

export interface Openapiv3Response {
  openapiv3: Openapiv3Config;
  tsTransfromData: AnyOpt;
}

export interface Openapiv3Config {
  openapi?: string;
  swagger?: string;
  info: Openapiv3Info;
  tags?: Openapiv3Tags;
  paths: Openapiv3Paths;
  components?: Openapiv3Components;
  servers?: InterfaceServers[];
  [props: string]: any;
}

export interface GenOpenapiv3Config {
  className: string;
  paths: AnyOpt[];
  controllerPrefix?: string;
  description?: string;
}

export interface TraverseAstConfig {
  className: string;
  paths: AnyOpt[];
  controllerPrefix?: string;
  description?: string;
}

export interface GenOpenApiOption {
  routePrefix?: string;
  responseSchema?: InterfaceSchema;
  filterFiles?: string[];
  servers?: InterfaceServers[];
  requiredType?: RequiredType;
}

export interface PropertiesConfigItem {
  type?: string;
  description?: string;
  $ref: '#Response';
}
export type PropertiesConfig = Record<string, PropertiesConfigItem>;

export interface InterfaceSchema {
  type: 'object';
  properties: PropertiesConfig;
  required?: string[];
}

export interface InterfaceConfig {
  controllers: string | string[];
  outfile: string;
  routePrefix?: string;
  responseSchema?: InterfaceSchema;
  filterFiles?: string[];
  servers?: InterfaceServers[];
  requiredType?: RequiredType;
}

export interface InterfaceServers {
  url: string;
  description?: string;
}

export interface DynamicRoutingConfig {
  isDynamicRouting: boolean;
  path: string;
  dynamicKey?: string;
}
