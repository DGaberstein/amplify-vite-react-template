# Inventory Management System

This application implements a complete inventory management system using AWS Amplify, React, and TypeScript.

## Features

The inventory management system includes:

- **Add New Items**: Create new inventory items with the following fields:
  - Name (required)
  - SKU (Stock Keeping Unit) (required)
  - Quantity (required)
  - Price (required)
  - Description (optional)
  - Category (optional)

- **View All Items**: Display all inventory items in a table format showing:
  - SKU
  - Name
  - Description
  - Category
  - Quantity
  - Price
  - Actions

- **Update Quantity**: Edit the quantity of any item with inline editing

- **Delete Items**: Remove items from inventory with confirmation

- **Inventory Summary**: View summary statistics including:
  - Total number of items
  - Total quantity across all items
  - Total inventory value

## Backend Schema

The backend uses AWS Amplify with GraphQL API and DynamoDB. The `InventoryItem` model is defined in `amplify/data/resource.ts` with the following schema:

```typescript
InventoryItem: a
  .model({
    name: a.string().required(),
    description: a.string(),
    quantity: a.integer().required(),
    price: a.float().required(),
    sku: a.string().required(),
    category: a.string(),
  })
  .authorization((allow) => [allow.publicApiKey()])
```

## Frontend Components

- **Inventory.tsx**: Main component that handles all inventory operations
  - Uses AWS Amplify Data client for real-time CRUD operations
  - Implements `observeQuery()` for automatic updates when data changes
  - Provides inline editing for quantity updates
  - Includes confirmation dialogs for delete operations

- **App.tsx**: Main application component that renders the Inventory component

## Usage

### Prerequisites

Before running the application, you need to deploy the AWS Amplify backend:

1. Install the Amplify CLI (if not already installed):
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. Deploy the backend:
   ```bash
   npx ampx sandbox
   ```

   This will create the necessary AWS resources (AppSync API, DynamoDB tables, etc.) and generate the `amplify_outputs.json` configuration file.

### Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Architecture

- **Backend**: AWS Amplify with GraphQL API (AWS AppSync) and DynamoDB
- **Frontend**: React + TypeScript + Vite
- **Real-time Updates**: Uses Amplify's `observeQuery()` for automatic UI updates
- **Authorization**: Public API Key authentication (can be configured for user authentication)

## Future Enhancements

Potential improvements for the inventory system:

- Add search and filter functionality
- Implement pagination for large inventories
- Add export to CSV functionality
- Include low stock alerts
- Add barcode scanning support
- Implement user authentication with Amazon Cognito
- Add image uploads for items
- Create detailed item view pages
- Add inventory movement history/audit trail
