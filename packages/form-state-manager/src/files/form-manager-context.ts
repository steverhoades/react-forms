import { createContext } from 'react';
import { ManagerContextValue } from '../types/form-manager-context';
import createManagerApi from '../utils/manager-api';

const noop = () => {
  /**
   * empty function stub
   */
};

const FormManagerContext = createContext<ManagerContextValue>({
  handleSubmit: noop,
  registerField: noop,
  unregisterField: noop,
  change: noop,
  getState: () => ({}),
  formOptions: createManagerApi({
    onSubmit: noop,
    clearOnUnmount: false
  }),
  getFieldValue: noop,
  getFieldState: () => undefined,
  blur: noop,
  focus: noop
});

export default FormManagerContext;
