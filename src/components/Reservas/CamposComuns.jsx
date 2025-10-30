import React from "react";
import "./CamposComuns.css";

export const CamposResponsavel = ({ register, errors, ddiOptions }) => (
  <div className="secao-form">
    <h3>📋 Dados do Responsável</h3>
    <div className="campo-form">
      <label>Nome do Responsável *</label>
      <input type="text" {...register("responsavel.nome")} />
      {errors.responsavel?.nome && (
        <span className="erro">{errors.responsavel.nome.message}</span>
      )}
    </div>
    <div className="campo-form">
      <label>E-mail do Responsável *</label>
      <input type="email" {...register("responsavel.email")} />
      {errors.responsavel?.email && (
        <span className="erro">{errors.responsavel.email.message}</span>
      )}
    </div>
    <div className="campos-linha">
      <div className="campo-form campo-pequeno">
        <label>DDI *</label>
        <select {...register("responsavel.ddi")} defaultValue="+55">
          {ddiOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.responsavel?.ddi && (
          <span className="erro">{errors.responsavel.ddi.message}</span>
        )}
      </div>
      <div className="campo-form campo-grande">
        <label>Telefone / Whatsapp *</label>
        <input type="tel" placeholder="(85) 98765-4321" {...register("responsavel.telefone")} />
        {errors.responsavel?.telefone && (
          <span className="erro">{errors.responsavel.telefone.message}</span>
        )}
      </div>
    </div>
  </div>
);

export const CamposQuantidades = ({ register, errors, comMalas = false }) => (
  <div className="secao-form">
    <h3>👥 Quantidade de Passageiros</h3>
    <div className="campos-linha">
      <div className="campo-form">
        <label>Quantidade de Adultos *</label>
        <input type="number" min="1" defaultValue={1} {...register("quantidades.adultos", { valueAsNumber: true })} />
        {errors.quantidades?.adultos && (
          <span className="erro">{errors.quantidades.adultos.message}</span>
        )}
      </div>
      <div className="campo-form">
        <label>Quantidade de Crianças</label>
        <input type="number" min="0" defaultValue={0} {...register("quantidades.criancas", { valueAsNumber: true })} />
        {errors.quantidades?.criancas && (
          <span className="erro">{errors.quantidades.criancas.message}</span>
        )}
      </div>
      {comMalas && (
        <div className="campo-form">
          <label>Quantidade de Malas</label>
          <input type="number" min="0" defaultValue={0} {...register("quantidades.malas", { valueAsNumber: true })} />
          {errors.quantidades?.malas && (
            <span className="erro">{errors.quantidades.malas.message}</span>
          )}
        </div>
      )}
    </div>
  </div>
);

export const CamposPassageiros = ({ register, errors }) => (
  <div className="secao-form">
    <h3>🎫 Relação dos Passageiros</h3>
    <div className="campo-form">
      <label>Relação dos Passageiros (Obrigatório) *</label>
      <textarea rows={6} placeholder="Exemplo:&#10;João Silva (CPF) 123.456.789-00&#10;Maria Santos (RG) 12345678&#10;Pedro Silva - 5 anos" {...register("passageiros")} />
      <small className="hint">
        Nome e Sobrenome + Nº do CPF ou RG de cada passageiro (um por linha).<br />
        OBS: Caso tenha criança(s), informar a(s) idade(s)
      </small>
      {errors.passageiros && (
        <span className="erro">{errors.passageiros.message}</span>
      )}
    </div>
  </div>
);

export const CamposPagamento = ({ register, errors }) => (
  <div className="secao-form">
    <h3>💳 Pagamento</h3>
    <div className="campos-linha">
      <div className="campo-form">
        <label>Forma de Pagamento *</label>
        <select {...register("pagamento.forma")}>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Pix">Pix</option>
          <option value="Cartão">Cartão</option>
          <option value="Link">Link</option>
          <option value="Outro">Outro</option>
        </select>
        {errors.pagamento?.forma && (
          <span className="erro">{errors.pagamento.forma.message}</span>
        )}
      </div>
      <div className="campo-form">
        <label>Valor Total Acertado (R$) *</label>
        <input type="number" step="0.01" min="0" placeholder="0,00" {...register("pagamento.valorTotal", { valueAsNumber: true })} />
        {errors.pagamento?.valorTotal && (
          <span className="erro">{errors.pagamento.valorTotal.message}</span>
        )}
      </div>
    </div>
    <div className="campo-form">
      <label>Observações</label>
      <textarea rows={3} {...register("observacoes")} />
    </div>
  </div>
);

export const CamposPolitica = ({ register, errors }) => (
  <div className="secao-form">
    <div className="campo-checkbox">
      <input type="checkbox" id="politica" {...register("aceitouPolitica")} />
      <label htmlFor="politica">
        Declaro que li e aceito a <a href="/politica" target="_blank" rel="noopener noreferrer">Política de Reservas, Cancelamento e Pagamento</a>. *
      </label>
    </div>
    {errors.aceitouPolitica && (
      <span className="erro">{errors.aceitouPolitica.message}</span>
    )}
    <div className="rodape-form">
      <p><strong>Empresa Certificada</strong> · Top 3 Tripadvisor · Site Blindado</p>
    </div>
  </div>
);
