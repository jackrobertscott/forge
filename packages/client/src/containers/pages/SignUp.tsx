import React, { FunctionComponent, useEffect } from 'react';
import gql from 'graphql-tag';
import { Terminal } from 'lumbridge';
import SignUpForm from '../../components/forms/SignUpForm';
import apolloPersistor from '../../utils/apolloPersistor';
import useInstance from '../effects/useInstance';
import { saveLocalAuth } from '../../utils/authScope';

export const signUpMutation = apolloPersistor.instance({
  name: 'mutate',
  map: ({ ...args }) => ({
    ...args,
    mutation: gql`
      mutation SignUp($username: String!, $password: String!, $email: String!) {
        authCreateCustom(
          username: $username
          password: $password
          email: $email
        ) {
          token
          userId
        }
      }
    `,
  }),
});

export interface ISignUpProps {}

const SignUp: FunctionComponent<ISignUpProps> = () => {
  const { error, loading } = useInstance(signUpMutation);
  useEffect(() => {
    const unwatch = signUpMutation.watch({
      data: ({ authCreateCustom }) => {
        saveLocalAuth.execute({ data: authCreateCustom });
        setTimeout(() => Terminal.navigate('/'));
      },
    });
    return () => unwatch();
  }, []);
  const data = {
    loading,
    error,
  };
  const handlers = {
    submit: (formData: any) => signUpMutation.execute({ variables: formData }),
  };
  return <SignUpForm data={data} handlers={handlers} />;
};

export default SignUp;
