import React from 'react';
import { Link } from 'react-router-dom';

import bgImg from '../../assets/img/footer/bg-1-1.jpg';
import Logo from '../../assets/img/logo/logo.png';
import footerImg1 from '../../assets/img/footer/thumb-1-1.png';
import footerImg2 from '../../assets/img/footer/thumb-1-2.png';
import footerImg3 from '../../assets/img/footer/thumb-1-3.png';
import footerImg4 from '../../assets/img/footer/thumb-1-4.png';
import footerImg5 from '../../assets/img/footer/thumb-1-5.png';
import footerImg6 from '../../assets/img/footer/thumb-1-6.png';

const Footer = (props) => {
  const { footerClass, footerLogo, copyrightTextClass } = props;

  return (
    <footer>
      <div
        className={
          footerClass
            ? footerClass
            : 'it-footer-area it-footer-bg black-bg pt-120 pb-70'
        }
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        <div className="container">
          <div className="row">
            <div
              className="col-xl-4 col-lg-4 col-md-6 col-sm-6 mb-50 wow animate__fadeInUp"
              data-wow-duration=".9s"
              data-wow-delay=".3s"
            >
              <div className="it-footer-widget footer-col-1">
                <div className="it-footer-logo pb-25">
                  <Link to="/">
                    <img src={footerLogo ? footerLogo : Logo} alt="" />
                  </Link>
                </div>
                <div className="it-footer-text pb-5">
                  <p>
                    Transformamos la industria de la electrónica a través de la economía circular. Cotiza, <br />
                    recicla y recibe beneficios por tus equipos en desuso
                    de forma segura y profesional.
                  </p>
                </div>
                <div className="it-footer-social">
                  <a href="#">
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                  <a href="#">
                    <i className="fa-brands fa-instagram"></i>
                  </a>
                  <a href="#">
                    <i className="fa-brands fa-pinterest-p"></i>
                  </a>
                  <a href="#">
                    <i className="fa-brands fa-twitter"></i>
                  </a>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-50 wow animate__fadeInUp"
              data-wow-duration=".9s"
              data-wow-delay=".5s"
            >
              <div className="it-footer-widget footer-col-2">
                <h4 className="it-footer-title">Equipos Aceptados:</h4>
                <div className="it-footer-list">
                  <ul>
                    <li>
                      <a href="#">
                        <i className="fa-regular fa-angle-right"></i>Refrigeradores
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-regular fa-angle-right"></i>Lavadoras
                        Design
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-regular fa-angle-right"></i>Lavaplatos
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-regular fa-angle-right"></i>Cocinas y más
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-regular fa-angle-right"></i>Nuevos Lanzamientos
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div
              className="col-xl-2 col-lg-4 col-md-6 col-sm-6 mb-50 wow animate__fadeInUp"
              data-wow-duration=".9s"
              data-wow-delay=".7s"
            >
              <div className="it-footer-widget footer-col-3">
                <h4 className="it-footer-title">Menú de Usuario:</h4>
                <div className="it-footer-list">
                  <ul>
                    <li>
                      <a href="#">
                        <i className="fa-regular fa-angle-right"></i>Cotización Instantánea
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-regular fa-angle-right"></i>Rastreo de Envío
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-regular fa-angle-right"></i>Portal de Proveedores (SaaS)
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-regular fa-angle-right"></i>Centro de Ayuda
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-50 wow animate__fadeInUp"
              data-wow-duration=".9s"
              data-wow-delay=".9s"
            >
              
            </div>
          </div>
        </div>
      </div>

      <div className="it-copyright-area it-copyright-height">
        <div className="container">
          <div className="row">
            <div
              className="col-12 wow animate__fadeInUp"
              data-wow-duration=".9s"
              data-wow-delay=".3s"
            >
              <div
                className={
                  copyrightTextClass
                    ? copyrightTextClass
                    : 'it-copyright-text text-center'
                }
              >
                <p>
                  Copyright &copy; 2026 <a href="#">  Gatobyte </a> || Derechos Reservados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
