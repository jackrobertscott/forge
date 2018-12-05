import React, { FunctionComponent } from 'react';
import styled, { css } from 'styled-components';
import bgs from '../../styles/bgs';
import shapes from '../../styles/shapes';
import shadows from '../../styles/shadows';
import Editor from './Editor';
import layouts from '../../styles/layouts';
import words from '../../styles/words';

const Wrap = styled('div')`
  ${bgs.dark}
  ${shapes.simple}
  ${shadows.simple}
  ${layouts.columns}
  flex-grow: 1;
`;

const Status = styled('div')`
  ${shapes.narrow}
  ${shadows.simple}
  ${layouts.rowsCenter}
  ${layouts.space}
  ${bgs.darkLight}
  ${words.secondary}
  ${({ active }: { active?: boolean | string; space?: string | string[] }) =>
    active &&
    css`
      ${bgs.marine}
      ${words.primary}
    `}
  margin-bottom: 20px;
`;

const Title = styled('span')``;

const Subtitle = styled('span')`
  margin-left: auto;
`;

interface IStatusEditorProps {
  active: boolean;
  [name: string]: any;
}

const StatusEditor: FunctionComponent<IStatusEditorProps> = ({
  active,
  ...args
}) => (
  <Wrap>
    <Status active={active} space="bottom">
      <Title>{active ? 'Insert mode' : 'Preview mode'}</Title>
      <Subtitle>Press Enter to Copy</Subtitle>
    </Status>
    <Editor {...args} />
  </Wrap>
);

export default StatusEditor;
