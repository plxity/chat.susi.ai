import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Snackbar from 'material-ui/Snackbar';
import Blog from './components/Blog/Blog.react';
import ChatApp from './components/ChatApp/ChatApp.react';
import Contact from './components/Contact/Contact.react';
import Devices from './components/Devices/Devices.react';
import Logout from './components/Auth/Logout.react';
import NotFound from './components/NotFound/NotFound.react';
import Overview from './components/Overview/Overview.react';
import Settings from './components/ChatApp/Settings/Settings.react';
import Support from './components/Support/Support.react';
import Team from './components/Team/Team.react';
import Terms from './components/Terms/Terms.react';
import Privacy from './components/Privacy/Privacy.react';
import Login from './components/Auth/Login/Login.react';
import SignUp from './components/Auth/SignUp/SignUp.react';
import ForgotPassword from './components/Auth/ForgotPassword/ForgotPassword.react';
import actions from './redux/actions/app';
import ProtectedRoute from './components/ProtectedRoute';

const muiTheme = getMuiTheme({
  toggle: {
    thumbOnColor: '#5ab1fc',
    trackOnColor: '#4285f4',
  },
});

class App extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    closeVideo: PropTypes.func,
    actions: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      video: false,
      openLogin: false,
      openSignUp: false,
      openForgotPassword: false,
      snackBarOpen: false,
      snackBarMessage: '',
      snackBarDuration: 4000,
      snackBarAction: null,
      snackBarActionHandler: null,
    };
  }

  componentDidMount = () => {
    window.addEventListener('offline', this.onUserOffline);
    window.addEventListener('online', this.onUserOnline);

    this.props.actions.getApiKeys();
  };

  componentWillUnmount = () => {
    window.removeEventListener('offline', this.onUserOffline);
    window.removeEventListener('online', this.onUserOnline);
  };

  onUserOffline = () => {
    this.openSnackBar({
      snackBarMessage: 'It seems you are offline!',
    });
  };

  onUserOnline = () => {
    this.openSnackBar({
      snackBarMessage: 'Welcome back!',
    });
  };

  closeVideo = () =>
    this.setState({
      video: false,
    });

  onRequestOpenLogin = () => {
    this.setState({
      openLogin: true,
      openSignUp: false,
      openForgotPassword: false,
    });
  };

  onRequestOpenSignUp = () => {
    this.setState({
      openSignUp: true,
      openLogin: false,
      openForgotPassword: false,
    });
  };

  onRequestOpenForgotPassword = () => {
    this.setState({
      openLogin: false,
      openSignUp: false,
      openForgotPassword: true,
    });
  };

  onRequestClose = () => {
    this.setState({
      openLogin: false,
      openSignUp: false,
      openForgotPassword: false,
    });
  };

  openSnackBar = ({
    snackBarMessage,
    snackBarDuration = 4000,
    snackBarActionHandler,
    snackBarAction,
  }) => {
    this.setState({
      snackBarOpen: true,
      snackBarMessage,
      snackBarDuration,
      snackBarActionHandler,
      snackBarAction,
    });
  };

  closeSnackBar = () => {
    this.setState({
      snackBarOpen: false,
      snackBarMessage: '',
      snackBarDuration: 4000,
      snackBarAction: null,
      snackBarActionHandler: null,
    });
  };

  render() {
    const {
      openLogin,
      openSignUp,
      openForgotPassword,
      snackBarOpen,
      snackBarMessage,
      snackBarDuration,
      snackBarAction,
      snackBarActionHandler,
    } = this.state;

    if (location.pathname !== '/') {
      document.body.className = 'white-body';
    }

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Login
            openLogin={openLogin}
            onRequestOpenForgotPassword={this.onRequestOpenForgotPassword}
            onRequestOpenSignUp={this.onRequestOpenSignUp}
            onRequestClose={this.onRequestClose}
          />
          <SignUp
            openSignUp={openSignUp}
            onRequestClose={this.onRequestClose}
            onRequestOpenLogin={this.onRequestOpenLogin}
          />
          <ForgotPassword
            openForgotPassword={openForgotPassword}
            onRequestClose={this.onRequestClose}
          />
          <Snackbar
            autoHideDuration={snackBarDuration}
            action={snackBarAction}
            onActionTouchTap={snackBarActionHandler}
            open={snackBarOpen}
            message={snackBarMessage}
            onRequestClose={this.closeSnackBar}
          />
          <Switch>
            <Route
              exact
              path="/"
              render={routeProps => (
                <ChatApp
                  {...routeProps}
                  onRequestOpenLogin={this.onRequestOpenLogin}
                  closeSnackBar={this.closeSnackBar}
                  openSnackBar={this.openSnackBar}
                />
              )}
            />
            <Route exact path="/overview" component={Overview} />
            <Route exact path="/devices" component={Devices} />
            <Route exact path="/team" component={Team} />
            <Route exact path="/blog" component={Blog} />
            <Route exact path="/contact" component={Contact} />
            <Route
              exact
              path="/support"
              render={routeProps => (
                <Support
                  {...routeProps}
                  openSignUp={this.onRequestOpenSignUp}
                />
              )}
            />
            <Route exact path="/terms" component={Terms} />
            <Route exact path="/privacy" component={Privacy} />
            <Route exact path="/logout" component={Logout} />
            <ProtectedRoute exact path="/settings" component={Settings} />
            <Route exact path="/*:path(error-404|)" component={NotFound} />
          </Switch>
        </div>
      </MuiThemeProvider>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default withRouter(
  connect(
    null,
    mapDispatchToProps,
  )(App),
);
