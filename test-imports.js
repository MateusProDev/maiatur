// Teste de importação de todos os componentes relacionados
import CheckoutTransparente from './src/components/CheckoutTransparente/CheckoutTransparente';
import ModalConfirmacaoReserva from './src/components/ModalConfirmacaoReserva/ModalConfirmacaoReserva';
import ModalLoginRequerido from './src/components/ModalLoginRequerido/ModalLoginRequerido';
import ReservaModalV2 from './src/components/ReservaModalV2/ReservaModalV2';

console.log('✅ CheckoutTransparente:', typeof CheckoutTransparente);
console.log('✅ ModalConfirmacaoReserva:', typeof ModalConfirmacaoReserva);
console.log('✅ ModalLoginRequerido:', typeof ModalLoginRequerido);
console.log('✅ ReservaModalV2:', typeof ReservaModalV2);

// Verifica se são componentes válidos
console.log('✅ CheckoutTransparente é função:', typeof CheckoutTransparente === 'function');
console.log('✅ ModalConfirmacaoReserva é função:', typeof ModalConfirmacaoReserva === 'function');
console.log('✅ ModalLoginRequerido é função:', typeof ModalLoginRequerido === 'function');
console.log('✅ ReservaModalV2 é função:', typeof ReservaModalV2 === 'function');

console.log('🚀 Todos os componentes foram importados com sucesso!');
