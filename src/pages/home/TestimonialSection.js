import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import SectionTitle from '../../components/SectionTitle';
import SingleTestimonial from '../../components/Testimonial';

import testimonialBG from '../../assets/img/testimonial/testimonial-bg.jpg';

const Testimonial = () => {
  const sliderOption = {
    speed: 1500,
    loop: true,
    slidesPerView: '3',
    spaceBetween: 50,
    autoplay: {
      delay: 3000,
    },
    breakpoints: {
      1400: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 3,
      },
      992: {
        slidesPerView: 2,
      },
      0: {
        slidesPerView: 1,
      },
    },
  };

  return (
    <div
      className="it-testimonial-area ed-testimonial-ptb fix p-relative"
      style={{ backgroundImage: `url(${testimonialBG})` }}
    >
      <div className="container">
        <div className="it-testimonial-title-wrap mb-90">
          <div className="row justify-content-center">
            <div className="col-xl-6">
              <SectionTitle
                itemClass="it-testimonial-title-box text-center"
                subTitle="Testimonios"
                title="Clientes comprometidos con el cuidado del medio ambiente."
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="ed-testimonial-wrapper">
              <div className="swiper-container">
                <Swiper
                  modules={[Autoplay]}
                  {...sliderOption}
                  className="swiper-wrapper ed-testimonial-active"
                >
                  <SwiperSlide className="swiper-slide">
                    <SingleTestimonial
                      description={`“Gracias a este servicio pude deshacerme de mi refrigerador antiguo de forma segura y ecológica. Excelente atención.”`}
                      authorName="Elena Orozco"
                      designation="Cliente"
                    />
                  </SwiperSlide>

                  <SwiperSlide className="swiper-slide">
                    <SingleTestimonial
                      description={`“Muy responsables con el reciclaje. Recogieron mi lavadora en desuso y me explicaron todo el proceso.”`}
                      authorName="María Paz"
                      designation="Cliente"
                    />
                  </SwiperSlide>

                  <SwiperSlide className="swiper-slide">
                    <SingleTestimonial
                      description={`“Un servicio rápido y confiable. Me ayudaron a reciclar varios electrodomésticos de mi negocio.”`}
                      authorName="Ellie Daza"
                      designation="Cliente"
                    />
                  </SwiperSlide>

                  <SwiperSlide className="swiper-slide">
                    <SingleTestimonial
                      description={`“Me encanta que promuevan el cuidado del medio ambiente. Muy recomendados para reciclar línea blanca.”`}
                      authorName="Lucero Oropeza"
                      designation="Cliente"
                    />
                  </SwiperSlide>
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;