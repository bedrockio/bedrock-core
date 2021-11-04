# Authentication API

This API can be used for signing up new users, obtaining tokens and performing user self-administration such as resetting of password.

## Register

Creates a new user object in the system. This can be initiated without any authentication.

callSummary({method: 'POST', path: '/1/auth/register'})

## Login

This exchanges a user's credentials (email and password) for a JWT token. This token can be used for authentication on all subsequent API calls (See Getting Started). Unless the user has mfa enabled.

callSummary({method: 'POST', path: '/1/auth/login'})

Note if the user has mfa enabled the mfaToken is required for POST /1/auth/mfa/verify

## Logout

This deauthenticates all tokens for the given user

callSummary({method: 'POST', path: '/1/auth/logout'})

## Request Password

This call can be used for the user to reset their password. A temporary token and link will be mailed to the user's email address if found in the system.

callSummary({method: 'POST', path: '/1/auth/request-password'})

## Set Password

This call can be used to use a temporary token (obtained via request-password) to set a new password.

callSummary({method: 'POST', path: '/1/auth/set-password'})

## MFA / Verify

This allows the a user with mfa enabled to authenticate and get a JWT token that can be used for authentication on all subsequent API calls. This api should be called after login.

callSummary({method: 'POST', path: '/1/auth/mfa/verify'})

## MFA / Send Code

This sends an sms containg a one time code required to complete `/1/auth/mfa/verify`, assuming the users has mfa (method=sms) enabled.

callSummary({method: 'POST', path: '/1/auth/mfa/send-code'})

## MFA / Disable

This disable mfa for the given user.

callSummary({method: 'DELETE', path: '/1/auth/mfa/disable'})

## MFA / Setup

This generates a new mfa secret to be shared with the user. And sends an sms if phone is specified.
The response data `uri` can be used to generate a QR code that can be used by an authenticator app.

The response of this endpoint should be stored an submitted to `/1/auth/mfa/enable`.

callSummary({method: 'POST', path: '/1/auth/mfa/setup'})

## MFA / Generate Backup Codes

Provides (but does not save) the mfa backup codes, this output is required for `/1/auth/mfa/enable`.

callSummary({method: 'POST', path: '/1/auth/mfa/generate-backup-codes'})

## MFA / Enable

This enables mfa for the given user.

It requires output of `/1/auth/mfa/setup` and `/1/auth/mfa/generate-backup-codes`

callSummary({method: 'POST', path: '/1/auth/mfa/enable'})

## MFA / Check Code

This checks confirm that code is valid given the secret.

callSummary({method: 'POST', path: '/1/auth/mfa/check-code'})
