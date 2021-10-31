# Shops API

This API allows you to manage Shop objects.

## Shop Object

Information about a Shop.

<%= objectSummary({name: 'Shop'}) %>

## Create Shop

Create a new shop object. Requires admin permissions.

<%= callSummary({method: 'POST', path: '/1/shops'}) %>

## Get Shop

Obtain shop object by unique shop ID.

<%= callSummary({method: 'GET', path: '/1/shops/:shopId'}) %>

## List and Search Shops

List shops and filter by certain attributes. Requires admin permissions.

<%= callSummary({method: 'POST', path: '/1/shops/search'}) %>

## Update Shop

Update shop information by ID. Requires admin permissions.

<%= callSummary({method: 'PATCH', path: '/1/shops/:shopId'}) %>

## Delete Shop

Delete shop by ID. Requires admin permissions.

<%= callSummary({method: 'DELETE', path: '/1/shops/:shopId'}) %>
