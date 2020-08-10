# API_ts Typescript

```bash
cd services/api;
rm -rf node_modules
yarn global add typescript
yarn install
yarn build # build js from ts files, and copies fixtures and json files to `built` folder
yarn test # runs jest on js files in `built` folder
yarn start # runs nodemon on js in `built` folder
yarn dev # runs ts-node-dev on index.ts with hot reload on ts file changes
```