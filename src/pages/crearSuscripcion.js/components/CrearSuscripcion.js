import React, { useState } from "react";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from "react-redux";

import {
  crearSuscripcionThunk,  
} from "../slicesSuscripcion/SuscripcionThunk";

import {
  suscripcionSlice,
} from "../slicesSuscripcion/SuscripcionSlice";

const CrearSuscripcion = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  

  const [form, setForm] = useState({
    user_id: 1,
    servicio_id: 2,
    meses: 1,
    precio_unitario: 50,
    moneda: "BOB",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCrear = async () => {
    try {
      setLoading(true);
      const suscripcion = await dispatch(
        crearSuscripcionThunk({
          user_id: form.user_id,
          servicio_id: form.servicio_id,
          meses: form.meses,
          precio_unitario: form.precio_unitario,
          moneda: form.moneda,
        })
      ).unwrap();

      Swal.fire({
        icon: "success",
        title: "Suscripción creada",
        text: "Ahora puedes proceder al pago",
      });

      navigate(`/checkout-pagos/${suscripcion.id_suscripcion_pago}`);

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error || "No se pudo crear la suscripción",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="sub-root">
        <div className="sub-card">

          <div className="sub-header">
            <h2>Crear suscripción</h2>
            <p>Selecciona los datos de tu plan</p>
          </div>

          <div className="sub-form">

            <div className="sub-field">
              <label>Meses</label>
              <input
                type="number"
                value={form.meses}
                onChange={(e) => handleChange("meses", e.target.value)}
              />
            </div>

            <div className="sub-field">
              <label>Precio unitario</label>
              <input
                type="number"
                value={form.precio_unitario}
                onChange={(e) =>
                  handleChange("precio_unitario", e.target.value)
                }
                readOnly="readOnly"
              />
            </div>

            <div className="sub-field">
              <label>Moneda</label>
              <select
                value={form.moneda}
                onChange={(e) => handleChange("moneda", e.target.value)}
              >
                <option value="BOB">BOB</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="sub-summary">
              <span>Total:</span>
              <strong>
                Bs. {(form.meses * form.precio_unitario).toFixed(2)}
              </strong>
            </div>

            <button
              className="sub-btn"
              onClick={handleCrear}
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear y pagar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = `
.sub-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F7F2;
}

.sub-card {
  width: 420px;
  background: white;
  padding: 30px;
  border-radius: 20px;
  border: 1px solid #D6DBC8;
  box-shadow: 0 10px 30px rgba(0,0,0,.08);
}

.sub-header h2 {
  margin: 0;
  color: #2F3E2C;
}

.sub-header p {
  margin-top: 5px;
  color: #5A6650;
}

.sub-field {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
}

.sub-field input,
.sub-field select {
  margin-top: 6px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #D6DBC8;
  padding: 0 10px;
}

.sub-summary {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.sub-btn {
  margin-top: 20px;
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: #79864B;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
`;

export default CrearSuscripcion;