# Authentication API

This API can be used for signing up new users, obtaining tokens and performing user self-administration such as resetting of password.

## Register

Creates a new user object in the system. This can be initiated without any authentication.

callSummary({method: 'POST', path: '/1/auth/register'})

## Login

This exchanges a user's credentials (email and password) for a JWT token. This token can be used for authentication on all subsequent API calls (See Getting Started).

callSummary({method: 'POST', path: '/1/auth/login'})

## Logout

This deauthenticates all tokens for the given user

callSummary({method: 'POST', path: '/1/auth/logout'})

## Request Password

This call can be used for the user to reset their password. A temporary token and link will be mailed to the user's email address if found in the system.

callSummary({method: 'POST', path: '/1/auth/request-password'})

## Set Password

This call can be used to use a temporary token (obtained via request-password) to set a new password.

callSummary({method: 'POST', path: '/1/auth/set-password'})
