import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [inventoryItems, setInventoryItems] = useState<Array<Schema["InventoryItem"]["type"]>>([]);
  const [showForm, setShowForm] = useState(false);
  const [idCounter, setIdCounter] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    category: "",
    sku: "",
  });

  useEffect(() => {
    // Try to connect to Amplify backend if available
    try {
      if (client?.models?.InventoryItem) {
        client.models.InventoryItem.observeQuery().subscribe({
          next: (data) => setInventoryItems([...data.items]),
        });
      }
    } catch (error) {
      console.log("Running in demo mode without backend connection");
    }
  }, []);

  function createDemoItem(): Schema["InventoryItem"]["type"] {
    const id = `demo-${Date.now()}-${idCounter}`;
    setIdCounter(idCounter + 1);
    return {
      id,
      name: formData.name,
      description: formData.description || null,
      quantity: formData.quantity,
      price: formData.price,
      category: formData.category || null,
      sku: formData.sku,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Try to use Amplify backend if available, otherwise use local state for demo
    try {
      if (client?.models?.InventoryItem?.create) {
        client.models.InventoryItem.create({
          name: formData.name,
          description: formData.description,
          quantity: formData.quantity,
          price: formData.price,
          category: formData.category,
          sku: formData.sku,
        });
      } else {
        // Demo mode: add to local state
        const newItem = createDemoItem();
        setInventoryItems([...inventoryItems, newItem]);
      }
    } catch (error) {
      // Demo mode fallback
      const newItem = createDemoItem();
      setInventoryItems([...inventoryItems, newItem]);
    }
    
    setFormData({
      name: "",
      description: "",
      quantity: 0,
      price: 0,
      category: "",
      sku: "",
    });
    setShowForm(false);
  }

  function deleteItem(id: string) {
    try {
      if (client?.models?.InventoryItem?.delete) {
        client.models.InventoryItem.delete({ id });
      } else {
        // Demo mode: remove from local state
        setInventoryItems(inventoryItems.filter(item => item.id !== id));
      }
    } catch (error) {
      // Demo mode fallback
      setInventoryItems(inventoryItems.filter(item => item.id !== id));
    }
  }

  function updateQuantity(id: string, currentQuantity: number, change: number) {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 0) {
      try {
        if (client?.models?.InventoryItem?.update) {
          client.models.InventoryItem.update({ id, quantity: newQuantity });
        } else {
          // Demo mode: update local state
          setInventoryItems(inventoryItems.map(item => 
            item.id === id ? { ...item, quantity: newQuantity } : item
          ));
        }
      } catch (error) {
        // Demo mode fallback
        setInventoryItems(inventoryItems.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        ));
      }
    }
  }

  return (
    <main>
      <h1>📦 Inventory Management System</h1>
      
      <button onClick={() => setShowForm(!showForm)} className="add-button">
        {showForm ? "Cancel" : "+ Add New Item"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="inventory-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU *</label>
              <input
                id="sku"
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Stock keeping unit"
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                id="quantity"
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                id="price"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Electronics, Furniture"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Item description"
                rows={3}
              />
            </div>
          </div>

          <button type="submit" className="submit-button">Add Item</button>
        </form>
      )}

      <div className="inventory-list">
        {inventoryItems.length === 0 ? (
          <p className="empty-state">No inventory items yet. Click "Add New Item" to get started!</p>
        ) : (
          <div className="items-grid">
            {inventoryItems.map((item) => (
              <div key={item.id} className="inventory-card">
                <div className="card-header">
                  <h3>{item.name}</h3>
                  <button onClick={() => deleteItem(item.id)} className="delete-button">
                    🗑️
                  </button>
                </div>
                
                <div className="card-content">
                  <p className="sku"><strong>SKU:</strong> {item.sku}</p>
                  {item.description && <p className="description">{item.description}</p>}
                  {item.category && <span className="category-badge">{item.category}</span>}
                  
                  <div className="item-details">
                    <div className="detail-row">
                      <span className="label">Price:</span>
                      <span className="value">${item.price?.toFixed(2)}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="label">Quantity:</span>
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity || 0, -1)}
                          className="quantity-button"
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity || 0, 1)}
                          className="quantity-button"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="detail-row total">
                      <span className="label">Total Value:</span>
                      <span className="value">${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="footer">
        <p>
          Total Items: {inventoryItems.length} | 
          Total Inventory Value: ${inventoryItems.reduce((sum, item) => 
            sum + ((item.quantity || 0) * (item.price || 0)), 0
          ).toFixed(2)}
        </p>
      </div>
    </main>
  );
}

export default App;
