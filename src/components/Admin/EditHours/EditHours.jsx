import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./EditHours.css";

const EditHours = () => {
  const [hours, setHours] = useState([
    { day: "Segunda-feira", time: "" },
    { day: "Terça-feira", time: "" },
    { day: "Quarta-feira", time: "" },
    { day: "Quinta-feira", time: "" },
    { day: "Sexta-feira", time: "" },
    { day: "Sábado", time: "" },
    { day: "Domingo", time: "" },
  ]);

  useEffect(() => {
    const fetchHours = async () => {
      const docRef = doc(db, "content", "hours");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHours(docSnap.data().hours || []);
      }
    };
    fetchHours();
  }, []);

  const handleChange = (index, value) => {
    const newHours = [...hours];
    newHours[index].time = value;
    setHours(newHours);
  };

  const saveHours = async () => {
    const docRef = doc(db, "content", "hours");
    await setDoc(docRef, { hours });
    alert("Horários salvos com sucesso!");
  };

  return (
    <div className="edit-hours">
      <h2>Editar Horários de Funcionamento</h2>
      {hours.map((item, index) => (
        <div key={index} className="hour-item">
          <span>{item.day}</span>
          <input
            type="text"
            value={item.time}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder="Ex: 08:00 - 18:00"
          />
        </div>
      ))}
      <button onClick={saveHours}>Salvar</button>
    </div>
  );
};

export default EditHours;
