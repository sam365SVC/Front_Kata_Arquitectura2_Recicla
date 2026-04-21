import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  FiDollarSign,
  FiRefreshCw,
  FiSearch,
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiPlus,
} from "react-icons/fi";

import styles from "./Saldo.module.scss";

import {
  fetchSaldoActual,
  fetchMovimientos,
  crearMovimiento,
} from "../slicesSaldo/saldoThunks";

// ======================
// HELPERS
// ======================
const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `Bs. ${amount.toLocaleString("es-BO")}`;
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

// ======================
// COMPONENTE
// ======================
const SaldoScreen = () => {
  const dispatch = useDispatch();

  const { saldo, movimientos, loading, error } = useSelector(
    (state) => state.saldo
  );

  const user = useSelector((state) => state.auth?.user);

  const userId = user?.uid;

  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");

  // ======================
  // FETCH DATA
  // ======================
  useEffect(() => {
    if (!userId) return;

    dispatch(fetchSaldoActual(userId));
    dispatch(fetchMovimientos(userId));
  }, [dispatch, userId]);

  // ======================
  // ERROR HANDLING
  // ======================
  useEffect(() => {
    if (!error) return;

    Swal.fire({
      icon: "error",
      title: "Error",
      text: error,
    });
  }, [error]);

  // ======================
  // FILTROS
  // ======================
  const movimientosFiltrados = useMemo(() => {
    const query = normalizeText(search);

    return (movimientos || []).filter((mov) => {
      const matchesSearch =
        !query ||
        normalizeText(mov.tipo_movimiento).includes(query) ||
        normalizeText(mov.observacion).includes(query);

      const matchesTipo =
        tipoFiltro === "Todos" ||
        (tipoFiltro === "Ingresos" && mov.naturaleza === "C") ||
        (tipoFiltro === "Egresos" && mov.naturaleza === "D");

      return matchesSearch && matchesTipo;
    });
  }, [movimientos, search, tipoFiltro]);

  // ======================
  // RESUMEN
  // ======================
  const resumen = useMemo(() => {
    let ingresos = 0;
    let egresos = 0;

    (movimientos || []).forEach((m) => {
      if (m.naturaleza === "C") ingresos += Number(m.monto);
      if (m.naturaleza === "D") egresos += Number(m.monto);
    });

    return {
      ingresos,
      egresos,
      total: movimientos?.length || 0,
    };
  }, [movimientos]);

  // ======================
  // ACCIONES
  // ======================
  const handleRefresh = () => {
    dispatch(fetchSaldoActual(userId));
    dispatch(fetchMovimientos(userId));
  };

  const handleNuevoMovimiento = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Nuevo movimiento",
      html: `
        <input id="monto" class="swal2-input" placeholder="Monto">
        <select id="tipo" class="swal2-input">
          <option value="C">Recarga (Ingreso)</option>
          <option value="D">Pago (Egreso)</option>
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          monto: document.getElementById("monto").value,
          naturaleza: document.getElementById("tipo").value,
        };
      },
    });

    if (!formValues) return;

    dispatch(
      crearMovimiento({
        user_id: userId,
        tipo_movimiento:
          formValues.naturaleza === "C" ? "RECARGA" : "PAGO",
        naturaleza: formValues.naturaleza,
        monto: Number(formValues.monto),
      })
    );
  };

  // ======================
  // UI
  // ======================
  return (
    <section className={styles.wrapper}>
      {/* HERO */}
      <div className={styles.hero}>
        <div>
          <h2>Mi saldo</h2>
          <p>Gestiona tu dinero, recargas y pagos</p>
        </div>

        <button onClick={handleRefresh} className={styles.button}>
          <FiRefreshCw /> Actualizar
        </button>
      </div>

      {/* SALDO */}
      <div className={styles.saldoCard}>
        <FiDollarSign size={28} />
        <h1>{formatMoney(saldo)}</h1>
        <span>Saldo disponible</span>
      </div>

      {/* STATS */}
      <div className={styles.stats}>
        <div>
          <strong>{formatMoney(resumen.ingresos)}</strong>
          <span>Ingresos</span>
        </div>
        <div>
          <strong>{formatMoney(resumen.egresos)}</strong>
          <span>Egresos</span>
        </div>
        <div>
          <strong>{resumen.total}</strong>
          <span>Movimientos</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <FiSearch />
          <input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
        >
          <option>Todos</option>
          <option>Ingresos</option>
          <option>Egresos</option>
        </select>

        <button onClick={handleNuevoMovimiento}>
          <FiPlus /> Nuevo
        </button>
      </div>

      {/* TABLA */}
      <div className={styles.table}>
        {loading ? (
          <p>Cargando...</p>
        ) : movimientosFiltrados.length === 0 ? (
          <p>No hay movimientos</p>
        ) : (
          movimientosFiltrados.map((mov) => (
            <div key={mov.id} className={styles.row}>
              <div>
                {mov.naturaleza === "C" ? (
                  <FiArrowUpCircle className={styles.ingreso} />
                ) : (
                  <FiArrowDownCircle className={styles.egreso} />
                )}
              </div>

              <div>
                <strong>{mov.tipo_movimiento}</strong>
                <span>{mov.observacion || "Sin detalle"}</span>
              </div>

              <div>
                <strong
                  className={
                    mov.naturaleza === "C"
                      ? styles.ingreso
                      : styles.egreso
                  }
                >
                  {mov.naturaleza === "C" ? "+" : "-"}
                  {formatMoney(mov.monto)}
                </strong>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default SaldoScreen;