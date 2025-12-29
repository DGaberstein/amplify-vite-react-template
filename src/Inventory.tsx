import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function Inventory() {
  const [items, setItems] = useState<Array<Schema["InventoryItem"]["type"]>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  useEffect(() => {
    client.models.InventoryItem.observeQuery().subscribe({
      next: (data) => setItems([...data.items]),
    });
  }, []);

  function createItem() {
    const name = window.prompt("Item name:");
    if (!name || name.trim() === "") return;

    const sku = window.prompt("SKU:");
    if (!sku || sku.trim() === "") return;

    const quantityStr = window.prompt("Quantity:");
    if (!quantityStr || quantityStr.trim() === "") return;
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity < 0) {
      alert("Please enter a valid quantity (0 or greater)");
      return;
    }

    const priceStr = window.prompt("Price:");
    if (!priceStr || priceStr.trim() === "") return;
    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      alert("Please enter a valid price (0 or greater)");
      return;
    }

    const description = window.prompt("Description (optional):");
    const category = window.prompt("Category (optional):");

    client.models.InventoryItem.create({
      name: name.trim(),
      sku: sku.trim(),
      quantity,
      price,
      description: description && description.trim() ? description.trim() : undefined,
      category: category && category.trim() ? category.trim() : undefined,
    });
  }

  function deleteItem(id: string) {
    if (window.confirm("Are you sure you want to delete this item?")) {
      client.models.InventoryItem.delete({ id });
    }
  }

  function startEditing(item: Schema["InventoryItem"]["type"]) {
    setEditingId(item.id);
    setEditQuantity(item.quantity);
  }

  function saveQuantity(id: string) {
    client.models.InventoryItem.update({
      id,
      quantity: editQuantity,
    });
    setEditingId(null);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  return (
    <div style={{ margin: "20px" }}>
      <h1>Inventory Management</h1>
      <button onClick={createItem} style={{ marginBottom: "20px", padding: "10px 20px", fontSize: "16px" }}>
        + Add New Item
      </button>
      
      {items.length === 0 ? (
        <p>No items in inventory. Add your first item!</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: "12px" }}>SKU</th>
              <th style={{ padding: "12px" }}>Name</th>
              <th style={{ padding: "12px" }}>Description</th>
              <th style={{ padding: "12px" }}>Category</th>
              <th style={{ padding: "12px" }}>Quantity</th>
              <th style={{ padding: "12px" }}>Price</th>
              <th style={{ padding: "12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }}>{item.sku}</td>
                <td style={{ padding: "12px" }}>{item.name}</td>
                <td style={{ padding: "12px" }}>{item.description || "-"}</td>
                <td style={{ padding: "12px" }}>{item.category || "-"}</td>
                <td style={{ padding: "12px" }}>
                  {editingId === item.id ? (
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={editQuantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value >= 0) {
                            setEditQuantity(value);
                          }
                        }}
                        style={{ width: "60px", padding: "4px" }}
                      />
                      <button onClick={() => saveQuantity(item.id)} style={{ marginLeft: "5px", padding: "4px 8px" }}>
                        Save
                      </button>
                      <button onClick={cancelEditing} style={{ marginLeft: "5px", padding: "4px 8px" }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span>
                      {item.quantity}{" "}
                      <button onClick={() => startEditing(item)} style={{ marginLeft: "5px", padding: "4px 8px" }}>
                        Edit
                      </button>
                    </span>
                  )}
                </td>
                <td style={{ padding: "12px" }}>${(item.price ?? 0).toFixed(2)}</td>
                <td style={{ padding: "12px" }}>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
        <h3>Inventory Summary</h3>
        <p>Total Items: {items.length}</p>
        <p>Total Quantity: {items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)}</p>
        <p>Total Value: ${items.reduce((sum, item) => sum + ((item.quantity ?? 0) * (item.price ?? 0)), 0).toFixed(2)}</p>
      </div>
    </div>
  );
}

export default Inventory;
