import React, { Component, ReactNode } from 'react';
import Button from '../components/buttons/Button';
import GoodButton from '../components/buttons/GoodButton';
import BadButton from '../components/buttons/BadButton';
import Card from '../components/cards/Card';
import Background from '../components/layouts/Background';
import Header from '../components/menus/Header';
import Split from '../components/layouts/Split';
import StatusEditor from '../components/editors/StatusEditor';
import SimpleInput from '../components/inputs/SimpleInput';

class App extends Component {
  public render() {
    return (
      <Background>
        <Header />
        <Split sidebar={this.renderSidebar()}>
          <StatusEditor active={true} />
        </Split>
      </Background>
    );
  }
  /**
   * Must be in function or warning thrown.
   */
  private renderSidebar = (): ReactNode => {
    return (
      <Card>
        <SimpleInput placeholder="E.g. Fred Blogs" />
        <br />
        <Button>Hello</Button>
        <br />
        <GoodButton>Hello</GoodButton>
        <br />
        <BadButton>Hello</BadButton>
      </Card>
    );
  };
}

export default App;
