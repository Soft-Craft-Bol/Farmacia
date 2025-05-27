import React from 'react'
import DashboardIcon from '../../components/icon/DashboardIcon'
import { HiUser } from 'react-icons/hi'
import './Home.css'
import { FaClockRotateLeft } from 'react-icons/fa6'
import { GiTeacher } from 'react-icons/gi'
import { FcComboChart } from 'react-icons/fc'
import { IoAnalyticsSharp } from "react-icons/io5";
import { countUsers, contarTrabajos, contarEquipos, contarTrabajosPendientes, contarTrabajosPorEstado } from '../../service/api'
import { useEffect } from 'react'
import ChartComponent from '../../components/chart/ChartComponent'
import PieChartComponent from '../../components/chart/PieChartComponent'

export default function Home() {
const [dataUser, setDataUser] = React.useState(0);
const [dataTrabajos, setDataTrabajos] = React.useState(0);
const [dataEquipos, setDataEquipos] = React.useState(0);
const [dataPendientes, setDataPendientes] = React.useState(0);
const [dataPorEstado, setDataPorEstado] = React.useState(0);

  const countSummary = {
    total_users: 150,
    total_teachers: 50,
    indicators: {
      incomplete: 20,
      completed: 30
    }
  }

  useEffect(() => {
    const fetchCountSummary = async () => {
      try {
        const response = await countUsers();
        const response2 = await contarTrabajos();
        const response3 = await contarEquipos();
        const response4 = await contarTrabajosPendientes();
        const response5 = await contarTrabajosPorEstado();

        setDataUser(response.data);
        setDataTrabajos(response2.data);
        setDataEquipos(response3.data);
        setDataPendientes(response4.data);
        setDataPorEstado(response5.data);
      } catch (error) {
        console.error("Error fetching count summary:", error);
      }
    };

    fetchCountSummary();
  }, []);
const ventasData = [
  { time: '2024-01-01', value: 10 },
  { time: '2024-01-02', value: 15 },
  { time: '2024-01-03', value: 13 },
  { time: '2024-01-04', value: 20 },
  { time: '2024-01-05', value: 18 },
  { time: '2024-01-06', value: 25 },
];


const resumenEstados = {
  Pendiente: 0,
  Aceptado: 2,
  EnProgreso: 0,
  Rechazado: 6,
  Finalizado: 4,
  Cancelado: 0,
};


  return (
    <div className="parent">
      <div className="div1">
        <h1>Home</h1>
      </div>
      <div className="div3">
        <div className="counter-container">
          <div className="counter">
            <div className="title-counter">
              <h3>Total usuarios</h3>
              <DashboardIcon
                icon={HiUser}
                iconColor="#8280FF"
                bgColor="#E5E4FF"
                className="dashboard-icon"
              />
            </div>

            <p>{dataUser.total}</p>
            <small>
              <span>
                <IoAnalyticsSharp /> 60 %{" "}
              </span>
              Últimos cambios
            </small>
          </div>
        </div>
      </div>

      <div className="div4">
        <div className="counter-container">
          <div className="counter">
            <div className="title-counter">
              <h3>Total mantenimientos</h3>
              <DashboardIcon
                icon={GiTeacher}
                iconColor="#FEC53D"
                bgColor="#FFF3D6"
                className="dashboard-icon"
              />
            </div>
            <p>{dataTrabajos.total}</p>
            <small>
              <span>
                <IoAnalyticsSharp /> 80 %{" "}
              </span>
              Últimos cambios
            </small>
          </div>
        </div>
      </div>

      <div className="div5">
        <div className="counter-container">
          <div className="counter">
            <div className="title-counter">
              <h3>Equipos registrados</h3>
              <DashboardIcon
                icon={FcComboChart}
                iconColor="#FF9066"
                bgColor="#D9F7E8"
                className="dashboard-icon"
              />
            </div>
            <p>{dataEquipos.total}</p>
            <small>
              <span>
                <IoAnalyticsSharp /> 100 %{" "}
              </span>
              Últimos cambios
            </small>
          </div>
        </div>
      </div>

      <div className="div6">
        <div className="counter-container">
          <div className="counter">
            <div className="title-counter">
              <h3>Indicadores pendientes</h3>
              <DashboardIcon
                icon={FaClockRotateLeft}
                iconColor="#FF9066"
                bgColor="#FFDED1"
                className="dashboard-icon"
              />
            </div>
            <p>{dataPendientes.total}</p>
            <small>
              <span>
                <IoAnalyticsSharp /> 0 %{" "}
              </span>
              Últimos cambios
            </small>
          </div>
        </div>
      </div>

      <div className="div7">
        <div className="chart-container large">
          {/* Gráfico Estático 1 */}
                <ChartComponent data={ventasData} />
        </div>
      </div>

      <div className="div8">
        <div className="history-container">
          <h3>Actividades recientes </h3>
          <ul>
            <li>Indicador 1</li>
            <li>Indicador 2</li>
            <li>Indicador 3</li>
          </ul>
        </div>
      </div>

      <div className="div9">
        <div className="chart-container">
          {/* Gráfico Estático 2 */}
           <PieChartComponent data={dataPorEstado} />
        </div>
      </div>

      <div className="div10">
        <div className="chart-container">
          {/* Gráfico Estático 3 */}
        </div>
      </div>
      <div className="div11">
        <div className="chart-container">
          {/* Gráfico Estático 4 */}
        </div>
      </div>
      <div className="div12">
        <div className="chart-container">
          {/* Gráfico Estático 5 */}
        </div>
      </div>
    </div>
  )
}
