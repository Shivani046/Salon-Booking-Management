"use client";

import { useEffect, useState } from "react";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");

  const loadServices = async () => {
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const addService = async () => {
    if (!type || !price) return;

    await fetch("/api/admin/services", {
      method: "POST",
      body: JSON.stringify({
        type,
        price: Number(price),
      }),
    });

    setType("");
    setPrice("");
    loadServices();
  };

  const deleteService = async (id: number) => {
    await fetch(`/api/admin/services?id=${id}`, {
      method: "DELETE",
    });

    loadServices();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Services</h1>

      {/* ADD SERVICE */}
      <div style={{ marginBottom: 10 }}>
        <input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Service name"
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          type="number"
        />

        <button onClick={addService}>Add</button>
      </div>

      {/* LIST */}
      <ul>
        {services.map((s) => (
          <li key={s.serviceId}>
            {s.type} - ₹{s.price}

            <button onClick={() => deleteService(s.serviceId)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}