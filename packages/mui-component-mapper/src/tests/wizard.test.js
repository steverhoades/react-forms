import React from 'react';
import { FormRenderer, componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { mount } from 'enzyme';
import { Button } from '@material-ui/core';

import { componentMapper, FormTemplate } from '../index';
import { CONDITIONAL_SUBMIT_FLAG } from '@data-driven-forms/common/wizard';

describe('wizard', () => {
  let initialProps;
  let schema;
  let onSubmit;
  let onCancel;

  beforeEach(() => {
    schema = {
      fields: [
        {
          component: componentTypes.WIZARD,
          name: 'wizard',
          stepsInfo: [
            {
              title: 'AWS step',
            },
            {
              title: 'Summary',
            },
          ],
          fields: [
            {
              name: 'first-step',
              nextStep: 'summary',
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'aws',
                  validate: [{ type: validatorTypes.REQUIRED }],
                },
              ],
            },
            {
              name: 'summary',
              fields: [
                {
                  component: componentTypes.TEXTAREA,
                  name: 'summary',
                },
              ],
            },
          ],
        },
      ],
    };
    onSubmit = jest.fn();
    onCancel = jest.fn();
    initialProps = {
      componentMapper,
      FormTemplate: (props) => <FormTemplate {...props} showFormControls={false} />,
      schema,
      onSubmit: (values) => onSubmit(values),
      onCancel: (values) => onCancel(values),
    };
  });

  it('simple next and back', () => {
    const wrapper = mount(<FormRenderer {...initialProps} />);

    expect(wrapper.find('.MuiStepLabel-active').first().text()).toEqual('AWS step');

    wrapper.find(Button).last().simulate('click'); // disabled next
    wrapper.update();

    expect(wrapper.find('.MuiStepLabel-active').first().text()).toEqual('AWS step');

    wrapper.find('input').instance().value = 'something';
    wrapper.find('input').simulate('change');
    wrapper.update();

    wrapper.find(Button).last().simulate('click'); // next
    wrapper.update();

    expect(wrapper.find('.MuiStepLabel-active').first().text()).toEqual('Summary');

    wrapper.find(Button).at(1).simulate('click'); // back
    wrapper.update();

    expect(wrapper.find('.MuiStepLabel-active').first().text()).toEqual('AWS step');
  });

  it('conditional next', () => {
    schema = {
      fields: [
        {
          component: componentTypes.WIZARD,
          name: 'wizard',
          title: 'A title',
          description: 'A description',
          stepsInfo: [
            {
              title: 'First step',
            },
            {
              title: 'Last step',
            },
          ],
          fields: [
            {
              name: 'first-step',
              nextStep: {
                when: 'aws',
                stepMapper: {
                  aws: 'summary',
                  google: 'google',
                },
              },
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'aws',
                  validate: [{ type: validatorTypes.REQUIRED }],
                },
              ],
            },
            {
              name: 'summary',
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'summary',
                },
              ],
            },
            {
              name: 'google',
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'googlesummary',
                },
              ],
            },
          ],
        },
      ],
    };

    const wrapper = mount(<FormRenderer {...initialProps} schema={schema} />);

    expect(wrapper.find('.MuiStepLabel-active').first().text()).toEqual('First step');

    wrapper.find('input').instance().value = 'aws';
    wrapper.find('input').simulate('change');
    wrapper.update();

    wrapper.find(Button).last().simulate('click'); // next
    wrapper.update();

    expect(wrapper.find('.MuiStepLabel-active').first().text()).toEqual('Last step');
    expect(wrapper.find('input').instance().name).toEqual('summary');

    wrapper
      .find(Button)
      .at(1) // back
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('.MuiStepLabel-active').first().text()).toEqual('First step');

    wrapper.find('input').instance().value = 'google';
    wrapper.find('input').simulate('change');
    wrapper.update();

    wrapper
      .find(Button)
      .last() // next
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('.MuiStepLabel-active').first().text()).toEqual('Last step');
    expect(wrapper.find('input').instance().name).toEqual('googlesummary');
  });

  it('conditional submit', () => {
    schema = {
      fields: [
        {
          component: componentTypes.WIZARD,
          name: 'wizard',
          title: 'A title',
          description: 'A description',
          fields: [
            {
              name: 'first-step',
              nextStep: {
                when: 'aws',
                stepMapper: {
                  aws: 'summary',
                  google: 'google',
                },
              },
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'aws',
                  validate: [{ type: validatorTypes.REQUIRED }],
                },
              ],
            },
            {
              name: 'summary',
              fields: [
                {
                  component: componentTypes.TEXTAREA,
                  name: 'summary',
                },
              ],
            },
            {
              name: 'google',
              fields: [
                {
                  component: componentTypes.TEXTAREA,
                  name: 'googlesummary',
                },
              ],
            },
          ],
        },
      ],
    };

    const wrapper = mount(<FormRenderer {...initialProps} schema={schema} />);

    wrapper.find('input').instance().value = 'aws';
    wrapper.find('input').simulate('change');
    wrapper.update();

    wrapper.find(Button).last().simulate('click');
    wrapper.update();

    wrapper.find('textarea').first().instance().value = 'summary';
    wrapper.find('textarea').first().simulate('change');
    wrapper.update();

    wrapper.find(Button).last().simulate('click');
    wrapper.update();

    expect(onSubmit).toHaveBeenCalledWith({
      aws: 'aws',
      summary: 'summary',
    });
    onSubmit.mockClear();

    wrapper.find(Button).at(1).simulate('click');
    wrapper.update();

    wrapper.find('input').instance().value = 'google';
    wrapper.find('input').simulate('change');
    wrapper.update();

    wrapper.find(Button).last().simulate('click');
    wrapper.update();

    wrapper.find('textarea').first().instance().value = 'google summary';
    wrapper.find('textarea').first().simulate('change');
    wrapper.update();

    wrapper.find(Button).last().simulate('click');
    wrapper.update();

    expect(onSubmit).toHaveBeenCalledWith({
      aws: 'google',
      googlesummary: 'google summary',
    });
    onSubmit.mockClear();
  });

  it('sends values to cancel', () => {
    const wrapper = mount(<FormRenderer {...initialProps} />);

    wrapper.find('input').instance().value = 'something';
    wrapper.find('input').simulate('change');
    wrapper.update();

    wrapper.find(Button).first().simulate('click'); // disabled next
    wrapper.update();

    expect(onCancel).toHaveBeenCalledWith({
      aws: 'something',
    });
  });

  it('conditional submit step', () => {
    const submit = jest.fn();
    schema = {
      fields: [
        {
          component: componentTypes.WIZARD,
          name: 'wizard',
          fields: [
            {
              name: 'first-step',
              nextStep: {
                when: 'name',
                stepMapper: {
                  aws: 'summary',
                  submit: CONDITIONAL_SUBMIT_FLAG,
                },
              },
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'name',
                  validate: [{ type: validatorTypes.REQUIRED }],
                },
              ],
            },
          ],
        },
      ],
    };

    const wrapper = mount(<FormRenderer {...initialProps} onSubmit={submit} schema={schema} />);

    wrapper.find('input').instance().value = 'bla';
    wrapper.find('input').simulate('change');
    wrapper.update();

    expect(wrapper.find('button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary').text()).toEqual('Continue');

    wrapper.find('input').instance().value = 'submit';
    wrapper.find('input').simulate('change');
    wrapper.update();

    expect(wrapper.find('button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary').text()).toEqual('Submit');
    wrapper.find('button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary').simulate('click');
    expect(submit).toHaveBeenCalledWith({ name: 'submit' }, expect.any(Object), expect.any(Object));
  });
});
