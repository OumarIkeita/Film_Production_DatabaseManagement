import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
export default function App() {
  const [dat, setDat] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = () => {
    axios
      .get("http://127.0.0.1:8000/api/home")
      .then((response) => setDat([response.data]));
  };

  return (
    <div>
      <h2>Data coming from Django_Backend</h2>
      <ul>
        {dat.map((d) => (
          <li>{d.content}</li>
        ))}
      </ul>
    </div>
  );
}
