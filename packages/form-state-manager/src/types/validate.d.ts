import AnyObject from './any-object';
import { ManagerApi } from './manager-api';

export interface FormLevelError {
  [key: string]: string;
}

export type Validator = (value: any, allValues: AnyObject) => undefined | string | Promise<string | undefined>;

export type FormValidator = (allValues: AnyObject) => FormLevelError | Promise<FormLevelError>;

export type FieldLevelValidator = (
  validator: Validator,
  value: any,
  allValues: AnyObject,
  managerApi: ManagerApi
) => string | undefined | Promise<string | undefined>;

export type FormLevelValidator = (validator: FormValidator, allValues: AnyObject, managerApi: ManagerApi) => FormLevelError | Promise<FormLevelError>;