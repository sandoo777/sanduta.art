import React from "react";
import type { Material } from "@/models/material";

type Props = { materials?: Material[] };

export default function MaterialsList({ materials = [] }: Props) {
  return (
    <table role="table" aria-label="Materials table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Purchase</th>
          <th>Sell</th>
          <th>Waste</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {materials.map((m) => (
          <tr key={m.id}>
            <td>{m.sku}</td>
            <td>{m.name}</td>
            <td>{Number(m.purchasePrice).toFixed(2)}</td>
            <td>{Number(m.sellPrice).toFixed(2)}</td>
            <td>{m.wastePercent}%</td>
            <td>{m.active ? "Activ" : "Inactiv"}</td>
            <td>
              <button aria-label={`Edit ${m.sku}`}>Edit</button>
              <button aria-label={`Delete ${m.sku}`}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}import React from "react";
import type { Material } from "@/models/material";

type Props = { materials?: Material[] };

export default function MaterialsList({ materials = [] }: Props) {
  return (
    <table role="table" aria-label="Materials table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Purchase</th>
          <th>Sell</th>
          <th>Waste</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {materials.map((m) => (
          <tr key={m.id}>
            <td>{m.sku}</td>
            <td>{m.name}</td>
            <td>{Number(m.purchasePrice).toFixed(2)}</td>
            <td>{Number(m.sellPrice).toFixed(2)}</td>
            <td>{m.wastePercent}%</td>
            <td>{m.active ? "Activ" : "Inactiv"}</td>
            <td>
              <button aria-label={`Edit ${m.sku}`}>Edit</button>
              <button aria-label={`Delete ${m.sku}`}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
