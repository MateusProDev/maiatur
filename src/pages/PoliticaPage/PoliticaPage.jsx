import React from "react";
import "./PoliticaPage.css";
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { seoData } from '../../utils/seoData';

const PoliticaPage = () => {
  return (
    <>
      <SEOHelmet
        title={seoData.politica?.title || 'Política de Reservas e Cancelamento'}
        description={seoData.politica?.description || 'Confira as regras de reservas, cancelamento e pagamento dos serviços da Transfer Fortaleza Tur.'}
        canonical={seoData.politica?.canonical || '/politica'}
        noindex={seoData.politica?.noindex}
      />
      <div className="politica-page">
        <div className="politica-container">
          <h1>Política de Reservas, Cancelamento e Pagamento</h1>
          
          <section>
            <h2>1. Reservas</h2>
            <ul>
              <li>Todas as reservas devem ser feitas com no mínimo 24 horas de antecedência.</li>
              <li>A reserva será confirmada após o recebimento do voucher por e-mail.</li>
              <li>É necessário apresentar documento de identificação no dia do serviço.</li>
              <li>Crianças devem ser acompanhadas por adultos responsáveis.</li>
            </ul>
          </section>

          <section>
            <h2>2. Cancelamento</h2>
            <ul>
              <li><strong>Com mais de 48h de antecedência:</strong> Cancelamento gratuito com reembolso total.</li>
              <li><strong>Entre 24h e 48h:</strong> Multa de 50% do valor pago.</li>
              <li><strong>Menos de 24h ou no-show:</strong> Sem reembolso.</li>
              <li>Para cancelar, entre em contato através do WhatsApp ou e-mail.</li>
            </ul>
          </section>

          <section>
            <h2>3. Pagamento</h2>
            <ul>
              <li><strong>Formas aceitas:</strong> Dinheiro, Pix, Cartão de Crédito/Débito, Link de Pagamento.</li>
              <li><strong>Pagamento antecipado:</strong> Recomendado para garantir a reserva.</li>
              <li><strong>Pagamento no local:</strong> Aceito conforme disponibilidade.</li>
              <li>Os valores são por pessoa, exceto se especificado o contrário.</li>
              <li>Crianças até 5 anos: gratuito (consulte condições).</li>
            </ul>
          </section>

          <section>
            <h2>4. Responsabilidades</h2>
            <ul>
              <li>A Transfer Fortaleza Tur não se responsabiliza por pertences pessoais perdidos ou danificados.</li>
              <li>O cliente deve informar condições médicas relevantes antes do passeio.</li>
              <li>Horários estão sujeitos a alterações devido a condições climáticas ou operacionais.</li>
              <li>A empresa se reserva o direito de recusar serviço a clientes sob efeito de álcool ou drogas.</li>
            </ul>
          </section>

          <section>
            <h2>5. Informações de Contato</h2>
            <p>
              <strong>E-mail:</strong> contato@transferfortalezatur.com.br<br />
              <strong>WhatsApp:</strong> +55 (85) 0000-0000<br />
              <strong>CNPJ:</strong> 00.000.000/0001-00
            </p>
          </section>

          <div className="politica-footer">
            <p>
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>
            <p>
              Ao realizar uma reserva, você declara ter lido e concordado com todos os termos desta política.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default PoliticaPage;