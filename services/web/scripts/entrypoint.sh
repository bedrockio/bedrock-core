#!/bin/bash
export PATH=$PATH:./node_modules/.bin/:./../node_modules/.bin/
echo "Web Entrypoint"
yarn build
yarn run static
