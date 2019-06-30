import React, {Component} from 'react';

import Amplify from 'aws-amplify';
import {withAuthenticator} from 'aws-amplify-react';
import aws_exports from '../../aws-exports';

import Main from './Main.jsx';

Amplify.configure(aws_exports);


class App extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="site-wrapper">
        <Main/>
      </div>
    );
  }

  componentWillMount() {
  }

}
export default withAuthenticator(App, { includeGreetings: true });
