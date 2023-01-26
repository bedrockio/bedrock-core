# Authentication API

This API can be used for signing up new users, obtaining tokens and performing
user self-administration such as resetting of password.

## Register

Creates a new user object in the system. This can be initiated without any
authentication.

callSummary({method: 'POST', path: '/1/auth/register'})

_Note: If you want to update other attributes on a User, please see the
`PATCH /1/users/me` API call_

## Login

This exchanges a user's credentials (email and password) for a JWT token. This
token can be used for authentication on all subsequent API calls (See Getting
Started). Unless the user has mfa enabled.

callSummary({method: 'POST', path: '/1/auth/login'})

Note if the user has mfa enabled the mfaToken is required for POST /1/mfa/verify

## Login with sms

### Send sms

This sends a one time login code to the user's phone number. Returns status code
204 on success.

callSummary({method: 'POST', path: '/1/auth/login/send-sms'})

### Verify sms

This verifies the user's one time code and returns a `data.token` on success

callSummary({method: 'POST', path: '/1/auth/login/verify-sms'})

Note if the user has mfa enabled the mfaToken is required for POST /1/mfa/verify

## Logout

This deauthenticates all tokens for the given user

callSummary({method: 'POST', path: '/1/auth/logout'})

## Request Password

This call can be used for the user to reset their password. A temporary token
and link will be mailed to the user's email address if found in the system.

callSummary({method: 'POST', path: '/1/auth/request-password'})

## Set Password

This call can be used to use a temporary token (obtained via request-password)
to set a new password.

callSummary({method: 'POST', path: '/1/auth/set-password'})
