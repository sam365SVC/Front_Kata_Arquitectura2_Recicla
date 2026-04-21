
import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";

import {crearSuscripcionThunk} from "../slicesSuscripcion/SuscripcionThunk";
import {obtenerPlanesThunk} from "../slicesPlanes/PlanThunk";

const CrearSuscripcion = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); // id del plan seleccionado desde la URL

  const [planSeleccionado, setPlanSeleccionado] = useState(null); 
  const [nombrePlan, setNombrePlan] = useState("");               

  const [form, setForm] = useState({
    user_id: 1,
    servicio_id: 2,
    meses: 1,
    precio_unitario: 0,
    moneda: "BOB",
  });

  const [loading, setLoading] = useState(false);

  // Al montar, carga los planes y busca el que coincide con el id de la URL
  useEffect(() => {
    const cargarPlan = async () => {
      try {
        const planes = await dispatch(obtenerPlanesThunk()).unwrap();

        const plan = planes.find((p) => p.id_plan === parseInt(id));

        if (plan) {
          setPlanSeleccionado(plan);
          setNombrePlan(plan.nombre); // 👈 guardas el nombre aquí
          setForm((prev) => ({
            ...prev,
            precio_unitario: parseFloat(plan.precio),
          }));
        } else {
          Swal.fire({
            icon: "warning",
            title: "Plan no encontrado",
            text: "No se encontró el plan seleccionado.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al cargar planes",
          text: error || "No se pudieron obtener los planes",
        });
      }
    };

    cargarPlan();
  }, [id]);

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
          nombre_plan: nombrePlan
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
            {/* Muestra el nombre del plan si ya cargó */}
            <p>{nombrePlan ? `Plan seleccionado: ${nombrePlan}` : "Cargando plan..."}</p>
          </div>

          <div className="sub-form">

            <div className="sub-field">
              <label>Meses</label>
              <input
                type="number"
                min={1}
                value={form.meses}
                onChange={(e) => handleChange("meses", e.target.value)}
              />
            </div>

            <div className="sub-field">
              <label>Precio unitario (por mes)</label>
              <input
                type="number"
                value={form.precio_unitario}
                readOnly
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
              disabled={loading || !planSeleccionado}
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