import React, { FunctionComponent } from 'react';
import { Terminal } from 'lumbridge';
import gql from 'graphql-tag';
import CodeForm from '../../components/forms/CodeForm';
import apolloPersistor from '../../utils/apolloPersistor';
import useInstance from '../../effects/useInstance';
import useInstanceSuccess from '../../effects/useInstanceSuccess';
import { codeListQuery } from './FindCode';

export const createCodeMutation = apolloPersistor.instance({
  name: 'mutate',
  map: ({ ...args }) => ({
    ...args,
    mutation: gql`
      mutation CreateCode($input: CodeInput!) {
        addCode(input: $input) {
          id
        }
      }
    `,
  }),
});

export interface ICreateCodeProps {}

const CreateCode: FunctionComponent<ICreateCodeProps> = () => {
  const { error, loading } = useInstance(createCodeMutation);
  useInstanceSuccess(createCodeMutation, () => {
    codeListQuery.redo();
    setTimeout(() => Terminal.navigate('/'));
  });
  const data = {
    prefill: {},
    error,
    loading,
    title: 'Create Code',
  };
  const handlers = {
    submit: ({ name, shortcut, contents }: any) =>
      createCodeMutation.execute({
        variables: {
          input: { name, shortcut, contents },
        },
      }),
  };
  return <CodeForm data={data} handlers={handlers} />;
};

export default CreateCode;
