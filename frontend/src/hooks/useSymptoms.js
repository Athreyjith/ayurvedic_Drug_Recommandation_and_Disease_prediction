import { useState, useEffect } from "react";
import { get } from "../api";

export function useSymptoms() {
  const [symptoms, setSymptoms] = useState([]);

  useEffect(() => {
    get("/symptoms").then((r) => Array.isArray(r) && setSymptoms(r));
  }, []);

  return symptoms;
}
