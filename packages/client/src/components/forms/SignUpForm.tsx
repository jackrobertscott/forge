import React, { FunctionComponent } from 'react';
import { Formik, FormikProps, Field, Form } from 'formik';
import { paramCase } from 'change-case';
import * as Yup from 'yup';
import List from '../layouts/List';
import GoodButton from '../buttons/GoodButton';
import { IComponentProps } from '../../utils/components';
import SimpleInput from '../inputs/SimpleInput';
import Arrow from '../buttons/Arrow';
import Onboard from '../layouts/Onboard';
import Problems from '../cards/Problems';
import { cleanFormPrefill } from '../../utils/form';

interface IUserFragment {
  username?: string;
  password?: string;
  email?: string;
}

interface ISignUpFormProps extends IComponentProps {
  handlers: {
    submit: (data: any) => void;
  };
  data: {
    loading: boolean;
  };
}

const SignUpForm: FunctionComponent<ISignUpFormProps> = ({
  data,
  handlers,
}) => {
  const prefill: IUserFragment = cleanFormPrefill({
    username: '',
    password: '',
    email: '',
  });
  const validation = Yup.object().shape({
    username: Yup.string()
      .trim()
      .required(),
    password: Yup.string()
      .trim()
      .min(5)
      .required(),
    email: Yup.string()
      .trim()
      .email()
      .required(),
  });
  const form = ({
    errors,
    submitCount,
    setFieldValue,
  }: FormikProps<IUserFragment>) => {
    const usernameChange = (event: any) => {
      const name = String(event.target.value || '');
      setFieldValue('username', paramCase(name).toLowerCase());
    };
    const showProblems = !!submitCount && !!Object.keys(errors).length && (
      <Problems items={errors as any} />
    );
    return (
      <Onboard back={true}>
        <Form>
          <List>
            <Field
              type="text"
              name="username"
              placeholder="Claim a username"
              component={SimpleInput}
              onChange={usernameChange}
            />
            <Field
              type="password"
              name="password"
              placeholder="Password"
              component={SimpleInput}
            />
            <Field
              type="email"
              name="email"
              placeholder="Email"
              component={SimpleInput}
            />
            {showProblems}
            <GoodButton
              type="submit"
              bright="true"
              loading={data.loading}
              icon={<Arrow />}
            >
              Sign up
            </GoodButton>
          </List>
        </Form>
      </Onboard>
    );
  };
  return (
    <Formik
      initialValues={prefill}
      validationSchema={validation}
      onSubmit={handlers.submit}
      render={form}
    />
  );
};

export default SignUpForm;
