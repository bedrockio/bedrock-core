## Simplified Dependency Tree

- Data Model
  - API Routes
    - CRUD UI

### Data Model

- Model file with Mongoose spec (`src/models/warehouse.js`)

### API Routes

- Index inclusion (`src/v1/index.js`)
- Main route file with CRUD routes (`src/v1/warehouses.js`)
- Main route test with CRUD tests (`src/v1/__tests__/warehouses.js`)
- API documentation spec (`src/v1/__openapi__/warehouses.json`)

### CRUD UI

- Edit Modal View (`src/modals/EditWarehouse.js`)
  - CRUD Table View (`src/screens/Warehouses`)
  - Entry in Navigation (`src/components/AppWrapper.js`)
- Endpoint View (`src/screens/Warehouse`)

Non-essential:

- Endpoint Tab View (`src/screens/Warehouse/Something.js`)
