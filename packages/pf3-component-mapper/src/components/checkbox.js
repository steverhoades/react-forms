import React from 'react';
import PropTypes from 'prop-types';
import Pf3Checkbox from 'patternfly-react/dist/js/components/Form/Checkbox';
import { FieldLevelHelp } from 'patternfly-react/dist/js/components/FieldLevelHelp';
import MultipleChoiceList from '../form-fields/multiple-choice-list';
import FormGroup from '../common/form-wrapper';
import RequiredLabel from '../form-fields/required-label';

const SingleCheckbox = ({ label, helperText, meta, description, input, isRequired, isReadOnly, isDisabled }) => (
  <FormGroup hideLabel meta={meta} description={description}>
    <Pf3Checkbox {...input} disabled={isDisabled || isReadOnly}>
      {isRequired ? <RequiredLabel label={label} /> : label}
      {helperText && <FieldLevelHelp content={helperText} />}
    </Pf3Checkbox>
  </FormGroup>
);

SingleCheckbox.propTypes = {
  label: PropTypes.string,
  isReadOnly: PropTypes.bool,
  isRequired: PropTypes.bool,
  helperText: PropTypes.string,
  input: PropTypes.object.isRequired,
  isDisabled: PropTypes.bool,
  meta: PropTypes.object.isRequired,
  description: PropTypes.string
};

const Checkbox = ({ options, ...props }) => (options ? <MultipleChoiceList options={options} {...props} /> : <SingleCheckbox {...props} />);

Checkbox.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.string }))
};

export default Checkbox;
