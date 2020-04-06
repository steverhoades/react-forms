/* eslint-disable no-prototype-builtins */
import DefaultSchemaError from './schema-errors';
//import isValidComponent from './isValidComponent';
import componentTypes from './component-types';
import dataTypes from './data-types';

const componentBlackList = [componentTypes.FIELD_ARRAY, 'tab-item'];

const checkFieldsArray = (obj, objectKey) => {
  if (!obj.hasOwnProperty('fields')) {
    throw new DefaultSchemaError(`Component of type ${objectKey} must contain "fields" property of type array, received undefined!`);
  }

  if (!Array.isArray(obj.fields)) {
    throw new DefaultSchemaError(`Component of type ${objectKey} must contain "fields" property of type array, received type: ${typeof obj.fields}!`);
  }
};

const checkCondition = (condition, fieldName) => {
  /**
   * validate array condition
   */
  if (Array.isArray(condition)) {
    return condition.forEach((item) => checkCondition(item, fieldName));
  }

  if (condition.hasOwnProperty('and') && !Array.isArray(condition.and)) {
    throw new DefaultSchemaError(`
      Error occured in field definition with "name" property: "${fieldName}".
      'and' property in a field condition must be an array! Received: ${typeof condition.and}.
    `);
  }

  if (condition.hasOwnProperty('or') && !Array.isArray(condition.or)) {
    throw new DefaultSchemaError(`
      Error occured in field definition with "name" property: "${fieldName}".
      'or' property in a field condition must be an array! Received: ${typeof condition.or}.
    `);
  }

  if (typeof condition !== 'object') {
    throw new DefaultSchemaError(`
      Error occured in field definition with name: "${fieldName}".
      Field condition must be an object, received ${Array.isArray(condition) ? 'array' : typeof condition}!
    `);
  }

  if (!condition.hasOwnProperty('and') && !condition.hasOwnProperty('or') && !condition.hasOwnProperty('not')) {
    if (!condition.hasOwnProperty('when')) {
      throw new DefaultSchemaError(`
      Error occured in field definition with "name" property: "${fieldName}".
      Field condition must have "when" property! Properties received: [${Object.keys(condition)}].
    `);
    }

    if (!(typeof condition.when === 'string' || Array.isArray(condition.when))) {
      throw new DefaultSchemaError(`
      Error occured in field definition with name: "${fieldName}".
      Field condition property "when" must be oof type "string", ${typeof condition.when} received!].
    `);
    }

    if (
      !condition.hasOwnProperty('is') &&
      !condition.hasOwnProperty('isEmpty') &&
      !condition.hasOwnProperty('isNotEmpty') &&
      !condition.hasOwnProperty('pattern')
    ) {
      throw new DefaultSchemaError(`
      Error occured in field definition with name: "${fieldName}".
      Field condition must have one of "is", "isEmpty", "isNotEmpty", "pattern" property! Properties received: [${Object.keys(condition)}].
    `);
    }

    if (condition.hasOwnProperty('notMatch') && !condition.hasOwnProperty('pattern') && !condition.hasOwnProperty('is')) {
      throw new DefaultSchemaError(`
      Error occured in field definition with name: "${fieldName}".
      Field condition must have "pattern" or "is" property when "notMatch" is set! Properties received: [${Object.keys(condition)}].
    `);
    }

    if (condition.hasOwnProperty('pattern') && !(condition.pattern instanceof RegExp) && typeof condition.pattern !== 'string') {
      throw new DefaultSchemaError(`
      Error occured in field definition with name: "${fieldName}".
      Field condition must have "pattern" of instance "RegExp" or "string"! Instance received: [${condition.pattern.constructor.name}].
    `);
    }
  }
};

const checkValidators = (validate, fieldName, validatorTypes, validatorMapper = {}) => {
  if (validate === undefined) {
    return;
  }

  if (!Array.isArray(validate)) {
    throw new DefaultSchemaError(`
      Error occured in field definition with name: "${fieldName}".
      Field validate property must be an Array, ${typeof validate} received!
    `);
  }

  validate.forEach((validator, index) => {
    if (Array.isArray(validator) || (typeof validator !== 'object' && typeof validator !== 'function')) {
      throw new DefaultSchemaError(`
        Error occured in field definition with name: "${fieldName}".
        Field validator at index: ${index} must be an object or a function, ${Array.isArray(validator) ? 'array' : typeof validator} received!
      `);
    }

    if (typeof validator !== 'function') {
      if (!validator.hasOwnProperty('type')) {
        throw new DefaultSchemaError(`
        Error occured in field definition with name: "${fieldName}".
        Field validator at index: ${index} does not have "type" property! Properties received: [${Object.keys(validator)}].
      `);
      }

      if (!validatorTypes.includes(validator.type)) {
        throw new DefaultSchemaError(`
        Error occured in field definition with name: "${fieldName}".
        Field validator at index: ${index} does not have correct "type" property!
        Received "${validator.type}", expected one of: [${validatorTypes}].
      `);
      }

      if (validatorMapper.hasOwnProperty(validator.type)) {
        validatorMapper[validator.type](validator, fieldName);
      }
    }
  });
};

const checkDataType = (type, fieldName) => {
  if (typeof type !== 'string') {
    throw new DefaultSchemaError(`
    Error occured in field definition with name: "${fieldName}".
    Unknow dataType. Data type must be string
    `);
  }

  if (!Object.values(dataTypes).includes(type)) {
    throw new DefaultSchemaError(`
    Error occured in field definition with name: "${fieldName}".
    Unknow dataType ${type}. Must be one these values: ${Object.values(dataTypes)}
    `);
  }
};

const checkActions = (actions, name, actionTypes, actionsValidator = {}) => {
  Object.keys(actions).forEach((prop) => {
    if (!Array.isArray(actions[prop])) {
      throw new DefaultSchemaError(`
      Action on prop "${prop}" in component "${name}" is not an array.
      Please, make sure you defined your action in the schema.
      ActionMapper has these values: [${actionTypes}]
    `);
    }

    if (!actions[prop][0]) {
      throw new DefaultSchemaError(`
      Action on prop "${prop}" in component "${name}" has not defined action type as the first element.
      Please, make sure you defined your action in the schema.
      ActionMapper has these values: [${actionTypes}]
    `);
    }

    if (!actionTypes.includes(actions[prop][0])) {
      throw new DefaultSchemaError(`
      Action on prop "${prop}" in component "${name}" does not exist in ActionMapper.
      ActionMapper has these values: [${actionTypes}].
      Use one of them or define new action in the mapper.
    `);
    }

    if (actionsValidator.hasOwnProperty(actions[prop][0])) {
      actionsValidator[actions[prop][0]](actions[prop], name);
    }
  });
};

const iterateOverFields = (fields, componentMapper, validatorTypes, actionTypes, schemaValidatorMapper, parent = {}) => {
  fields.forEach((field) => {
    if (Array.isArray(field)) {
      return iterateOverFields(field, componentMapper, validatorTypes, actionTypes, schemaValidatorMapper);
    }

    if (parent.component !== componentTypes.WIZARD) {
      if (parent.component !== componentTypes.WIZARD && !field.hasOwnProperty('component')) {
        throw new DefaultSchemaError(`Each fields item must have "component" property!`);
      }

      if (!componentBlackList.includes(field.component) && !componentMapper.hasOwnProperty(field.component)) {
        throw new DefaultSchemaError(`
          Component of type "${field.component}" is not present in componentMapper.
          Please make sure "${field.component} is included in your componentMapper."
          componentMapper has these values: [${Object.keys(componentMapper)}]
        `);
      }

      /**
       * Investiage
       */
      //if (!componentBlackList.includes(field.component) && !isValidComponent(componentMapper[field.component])) {
      //  throw new DefaultSchemaError(`FormComponent "${field.component}" from componentMapper is not a valid React component!`);
      //}
    }

    if (!field.hasOwnProperty('name') && parent.component !== 'field-array') {
      throw new DefaultSchemaError(`Each fields item must have "name" property! Name is used as a unique identifier of form fields.`);
    }

    if (field.hasOwnProperty('condition')) {
      checkCondition(field.condition, field.name);
    }

    if (field.hasOwnProperty('validate')) {
      checkValidators(field.validate, field.name, validatorTypes, schemaValidatorMapper.validators);
    }

    if (field.hasOwnProperty('dataType')) {
      checkDataType(field.dataType, field.name);
    }

    if (field.hasOwnProperty('fields')) {
      iterateOverFields(field.fields, componentMapper, validatorTypes, actionTypes, schemaValidatorMapper, field);
    }

    if (field.hasOwnProperty('actions')) {
      checkActions(field.actions, field.name, actionTypes, schemaValidatorMapper.actions);
    }

    if (schemaValidatorMapper.components && schemaValidatorMapper.components.hasOwnProperty(field.component)) {
      schemaValidatorMapper.components[field.component](field);
    }
  });
};

const defaultSchemaValidator = (schema, componentMapper, validatorTypes = [], actionTypes = [], schemaValidatorMapper = {}) => {
  if (Array.isArray(schema) || typeof schema !== 'object') {
    throw new DefaultSchemaError(`Form Schema must be an object, received ${Array.isArray(schema) ? 'array' : typeof schema}!`);
  }

  checkFieldsArray(schema, 'schema');
  iterateOverFields(schema.fields, componentMapper, validatorTypes, actionTypes, schemaValidatorMapper);
};

export default defaultSchemaValidator;