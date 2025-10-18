import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./OperatingHours.css";

const OperatingHours = () => {
  const [hoursData, setHoursData] = useState(null);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const docRef = doc(db, "content", "hours");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().hours?.length > 0) {
          setHoursData(docSnap.data());
        }
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
      }
    };

    fetchHours();
  }, []);

  // Don't render if no hours data or if hours array is empty
  if (!hoursData || !hoursData.hours || hoursData.hours.length === 0) {
    return null;
  }

  return (
    <div className="operating-hours">
      <h3>{hoursData.title || "Horários de Funcionamento"}</h3>
      <ul>
        {hoursData.hours.map((item, index) => (
          <li key={index}>
            <span className="day">{item.day}</span>
            <span className="time">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OperatingHours;