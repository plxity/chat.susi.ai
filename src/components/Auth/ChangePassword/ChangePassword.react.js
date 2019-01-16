import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import zxcvbn from 'zxcvbn';
import Cookies from 'universal-cookie';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import PasswordField from 'material-ui-password-field';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
import Close from 'material-ui/svg-icons/navigation/close';
import UserPreferencesStore from '../../../stores/UserPreferencesStore';
import Translate from '../../Translate/Translate.react';
import ForgotPassword from '../ForgotPassword/ForgotPassword.react';
import actions from '../../../redux/actions/app';
import './ChangePassword.css';

const cookies = new Cookies();

const styles = {
  closingStyle: {
    position: 'absolute',
    zIndex: 1200,
    fill: '#444',
    width: '26px',
    height: '26px',
    right: '10px',
    top: '10px',
    cursor: 'pointer',
  },
  fieldStyle: {
    height: '35px',
    borderRadius: 4,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '0px 12px',
    width: '125%',
  },
  labelStyle: {
    width: '30%',
    minWidth: '150px',
    float: 'left',
    marginTop: '12px',
    color:
      UserPreferencesStore.getTheme() === 'light' ||
      UserPreferencesStore.getTheme() === 'custom'
        ? 'black'
        : 'white',
  },
  submitBtnStyle: {
    float: 'left',
    width: '300px',
    margin: '0 auto',
    marginBottom: '50px',
  },
  inputStyle: {
    height: '35px',
    marginBottom: '10px',
  },
  containerStyles: {
    width: '100%',
    textAlign: 'left',
    padding: '10px',
    paddingTop: '0px',
  },
};

class ChangePassword extends Component {
  static propTypes = {
    history: PropTypes.object,
    settings: PropTypes.object,
    actions: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      password: '',
      passwordErrorMessage: '',
      newPassword: '',
      newPasswordErrorMessage: '',
      newPasswordStrength: '',
      newPasswordScore: -1,
      confirmNewPassword: '',
      newPasswordConfirmErrorMessage: '',
      dialogMessage: '',
      success: false,
      showDialog: false,
      showForgotPasswordDialog: false,
      loading: false,
    };
  }

  handleCloseResetPassword = () => {
    const { success } = this.state;
    if (success) {
      this.props.history.push('/logout');
    } else {
      this.setState({
        password: '',
        passwordErrorMessage: '',
        newPassword: '',
        newPasswordErrorMessage: '',
        newPasswordStrength: '',
        newPasswordScore: -1,
        confirmNewPassword: '',
        newPasswordConfirmErrorMessage: '',
        dialogMessage: '',
        success: false,
        showDialog: false,
        showForgotPasswordDialog: false,
        loading: false,
      });
    }
  };

  handleCloseForgotPassword = event => {
    this.setState({
      showForgotPasswordDialog: false,
    });
  };

  onForgotPassword = event => {
    event.preventDefault();
    this.setState({
      showForgotPasswordDialog: true,
    });
  };

  // Handle changes to current, new and confirm new passwords
  handleTextFieldChange = event => {
    switch (event.target.name) {
      case 'password': {
        const password = event.target.value.trim();
        const passwordError = !(
          password &&
          password.length >= 6 &&
          password.length <= 64
        );
        this.setState({
          password,
          passwordErrorMessage: passwordError ? (
            <Translate text="Must be between 6 to 64 characters" />
          ) : (
            ''
          ),
        });
        break;
      }
      case 'newPassword': {
        const {
          confirmNewPassword,
          newPasswordConfirmErrorMessage,
        } = this.state;
        const newPassword = event.target.value.trim();
        const newPasswordError = !(
          newPassword &&
          newPassword.length >= 6 &&
          newPassword.length <= 64
        );
        const newPasswordScore = !newPasswordError
          ? zxcvbn(newPassword).score
          : -1;
        const newPasswordStrength = !newPasswordError
          ? [
              <Translate key={1} text="Too Insecure" />,
              <Translate key={2} text="Bad" />,
              <Translate key={3} text="Weak" />,
              <Translate key={4} text="Good" />,
              <Translate key={5} text="Strong" />,
            ][newPasswordScore]
          : '';

        const newPasswordConfirmError =
          (confirmNewPassword || newPasswordConfirmErrorMessage) &&
          !(confirmNewPassword === newPassword);

        this.setState({
          newPassword,
          newPasswordErrorMessage: newPasswordError ? (
            <Translate text="Must be between 6 to 64 characters" />
          ) : (
            ''
          ),
          newPasswordScore,
          newPasswordStrength,
          newPasswordConfirmErrorMessage: newPasswordConfirmError ? (
            <Translate text="Password does not match" />
          ) : (
            ''
          ),
        });
        break;
      }
      case 'confirmNewPassword': {
        const { newPassword } = this.state;
        const confirmNewPassword = event.target.value.trim();
        const newPasswordConfirmError = !(
          confirmNewPassword && confirmNewPassword === newPassword
        );
        this.setState({
          confirmNewPassword,
          newPasswordConfirmErrorMessage: newPasswordConfirmError ? (
            <Translate text="Password does not match" />
          ) : (
            ''
          ),
        });
        break;
      }
      default:
        break;
    }
  };

  changePassword = event => {
    event.preventDefault();
    const {
      password,
      newPassword,
      passwordErrorMessage,
      newPasswordErrorMessage,
      newPasswordConfirmErrorMessage,
    } = this.state;
    const { actions } = this.props;

    const email = cookies.get('emailId') ? cookies.get('emailId') : '';

    if (
      !(
        passwordErrorMessage ||
        newPasswordErrorMessage ||
        newPasswordConfirmErrorMessage
      )
    ) {
      this.setState({
        loading: true,
      });
      actions
        .getChangePassword({
          email,
          password: encodeURIComponent(password),
          newPassword: encodeURIComponent(newPassword),
        })
        .then(({ payload }) => {
          let dialogMessage;
          let success;
          if (payload.accepted) {
            dialogMessage = `${payload.message}\n Please login again.`;
            success = true;
          } else {
            dialogMessage = `${payload.message}\n Please Try Again.`;
            success = false;
          }
          this.setState({
            dialogMessage,
            success,
            showDialog: true,
            loading: false,
          });
        })
        .catch(error => {
          this.setState({
            dialogMessage: 'Failed. Try Again',
            showDialog: true,
            loading: false,
          });
        });
    }
  };

  render() {
    const {
      password,
      passwordErrorMessage,
      newPassword,
      newPasswordErrorMessage,
      confirmNewPassword,
      newPasswordConfirmErrorMessage,
      newPasswordScore,
      newPasswordStrength,
      showForgotPasswordDialog,
      dialogMessage,
      showDialog,
      loading,
    } = this.state;

    const { settings } = this.props;

    const isValid =
      !passwordErrorMessage &&
      !newPasswordErrorMessage &&
      !newPasswordConfirmErrorMessage &&
      password &&
      newPassword &&
      confirmNewPassword;

    const themeBackgroundColor =
      (settings && settings.theme) === 'dark' ? '#19324c' : '#fff';
    const themeForegroundColor =
      (settings && settings.theme) === 'dark' ? '#fff' : '#272727';

    const PasswordClass = [`is-strength-${newPasswordScore}`];

    return (
      <div className="changePasswordForm">
        <Paper
          zDepth={0}
          style={{
            ...styles.containerStyles,
            backgroundColor: themeBackgroundColor,
          }}
        >
          <form onSubmit={this.changePassword}>
            <div style={styles.labelStyle}>Current Password</div>
            <div>
              <PasswordField
                name="password"
                style={styles.fieldStyle}
                value={password}
                onChange={this.handleTextFieldChange}
                inputStyle={{
                  ...styles.inputStyle,
                  color: themeForegroundColor,
                }}
                errorText={passwordErrorMessage}
                underlineStyle={{ display: 'none' }}
                disableButton={true}
                visibilityButtonStyle={{ display: 'none' }}
                visibilityIconStyle={{ display: 'none' }}
              />
            </div>
            <br />
            <div style={styles.labelStyle}>New Password</div>
            <div className={PasswordClass.join(' ')}>
              <PasswordField
                name="newPassword"
                placeholder="Must be between 6 to 64 characters"
                style={styles.fieldStyle}
                value={newPassword}
                onChange={this.handleTextFieldChange}
                inputStyle={{
                  ...styles.inputStyle,
                  color: themeForegroundColor,
                }}
                errorText={newPasswordErrorMessage}
                underlineStyle={{ display: 'none' }}
                disableButton={true}
                visibilityButtonStyle={{ display: 'none' }}
                visibilityIconStyle={{ display: 'none' }}
              />
              <div className="ReactPasswordStrength-strength-bar" />
              <div>{newPasswordStrength}</div>
            </div>
            <br />
            <div style={styles.labelStyle}>Verify Password</div>
            <div>
              <PasswordField
                name="confirmNewPassword"
                placeholder="Must match the new password"
                style={styles.fieldStyle}
                value={confirmNewPassword}
                onChange={this.handleTextFieldChange}
                inputStyle={{
                  ...styles.inputStyle,
                  color: themeForegroundColor,
                }}
                errorText={newPasswordConfirmErrorMessage}
                underlineStyle={{ display: 'none' }}
                disableButton={true}
                visibilityButtonStyle={{ display: 'none' }}
                visibilityIconStyle={{ display: 'none' }}
              />
            </div>
            <div style={styles.submitBtnStyle}>
              <div className="forgot">
                <a onClick={this.onForgotPassword}>Forgot your password?</a>
              </div>
              <div>
                <br />
                <RaisedButton
                  label={
                    !loading ? <Translate text="Save Changes" /> : undefined
                  }
                  type="submit"
                  disabled={!isValid || loading}
                  backgroundColor="#4285f4"
                  labelColor="#fff"
                  icon={loading ? <CircularProgress size={24} /> : undefined}
                />
              </div>
            </div>
          </form>
        </Paper>

        {/* Forgot Password Modal */}
        <div className="ModalDiv" style={{ width: '50%' }}>
          <Dialog
            modal={false}
            open={showForgotPasswordDialog}
            onRequestClose={this.handleCloseForgotPassword}
            className="ModalDiv"
          >
            <ForgotPassword closeModal={this.handleCloseForgotPassword} />
          </Dialog>
        </div>

        {dialogMessage && (
          <div>
            <Dialog
              modal={false}
              open={showDialog}
              onRequestClose={this.handleCloseResetPassword}
            >
              <Translate text={dialogMessage} />
              <Close
                style={styles.closingStyle}
                onTouchTap={this.handleCloseResetPassword}
              />
            </Dialog>
          </div>
        )}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(
  null,
  mapDispatchToProps,
)(ChangePassword);
