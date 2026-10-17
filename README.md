# Dozeroaoprimeiroanuncio

Crie uma aplicação web funcional para vender o produto digital “Do Zero ao Primeiro Anúncio”, um guia em PDF por R$ 10,00. Faça a implementação inicial completa em uma única execução, economizando créditos e evitando recursos desnecessários.



OBJETIVO PRINCIPAL

Criar uma landing page de vendas focada em convencer iniciantes a aprender tráfego pago, apresentar o guia e conduzir o visitante à compra. Integrar o checkout do Mercado Pago e entregar automaticamente o PDF quando o pagamento estiver aprovado.



1. DESIGN DA LANDING PAGE

   Crie uma página moderna, chamativa, organizada e profissional, sem exagerar na complexidade visual.



- Layout responsivo, priorizando celulares.

- Fundo grafite/preto, detalhes em vermelho e amarelo, tipografia legível e botões de destaque.

- Seção inicial com o título “APRENDA A CRIAR ANÚNCIOS DO ZERO”.

- Subtítulo que explique que o guia ensina desde a preparação da presença digital até a publicação e acompanhamento dos anúncios.

- Mockup visual atraente de um guia digital em PDF.

- Preço em destaque: R$ 10,00.

- Botão principal: “QUERO COMEÇAR A APRENDER”.

- Seção explicando os problemas de quem quer anunciar, mas não sabe configurar uma campanha.

- Seção “O que você vai aprender”, com cartões ou blocos visuais.

- Seção apresentando o conteúdo do guia, seus benefícios e para quem ele foi criado.

- Perguntas frequentes e chamada final para compra.

- Não invente depoimentos, avaliações, estatísticas, resultados garantidos ou bônus inexistentes.



2. CONTEÚDO DO PRODUTO

   Apresente o guia como um material digital para iniciantes, organizado para ensinar o processo desde o começo até o acompanhamento dos anúncios.



Inclua visualmente os seguintes assuntos:



- Criar e configurar uma Página do Facebook.

- Preparar o Instagram profissional e organizar os dados comerciais.

- Configurar o WhatsApp Business e os canais de contato.

- Utilizar inteligência artificial para gerar ideias, textos publicitários e imagens.

- Criar campanhas no Meta Ads.

- Escolher o objetivo da campanha e o público.

- Definir orçamento, posicionamentos e programação.

- Configurar o anúncio e publicá-lo.

- Acompanhar métricas e identificar ajustes necessários.



Deixar claro que o produto é um guia em PDF. Não anunciar videoaulas, comunidade, acompanhamento individual ou outros materiais que não estejam incluídos.



3. INTEGRAÇÃO REAL COM O MERCADO PAGO

   Integrar o botão de compra ao checkout oficial do Mercado Pago, utilizando sua API e o fluxo de checkout adequado para uma compra de produto digital.



- Preço definido e validado no servidor: R$ 10,00.

- O comprador deve poder selecionar as formas de pagamento disponíveis no checkout do Mercado Pago, incluindo Pix e cartão, de acordo com a configuração da conta.

- Não obrigar o visitante a escolher Pix na landing page.

- Não criar um formulário próprio para coletar os dados do cartão.

- Criar um pedido individual para cada compra e associar o identificador do pedido ao pagamento.

- Mostrar os estados de pagamento pendente, aprovado, recusado ou cancelado.

- Implementar retorno do checkout e Webhook para receber notificações do Mercado Pago.

- Validar as notificações e consultar o pagamento pela API no servidor antes de liberar o produto.

- Processar notificações repetidas sem duplicar pedidos ou entregas.

- Não considerar uma captura de tela, comprovante enviado pelo cliente ou retorno visual do navegador como confirmação de pagamento.

- Não simular aprovações.



Usar credenciais configuradas em variáveis de ambiente seguras. Nunca expor Access Token, segredos, credenciais ou chaves privadas no frontend ou no GitHub.



4. ENTREGA DIGITAL AUTOMÁTICA

   Depois que o servidor confirmar que o pagamento correspondente foi aprovado:



- Redirecionar o cliente para uma página de compra confirmada.

- Disponibilizar o botão “BAIXAR MEU GUIA EM PDF”.

- Gerar um link seguro e temporário para o download.

- Validar no servidor se o pedido está realmente aprovado antes de liberar o arquivo.

- Impedir que pedidos não pagos acessem o PDF.

- Permitir que o comprador retorne à página de entrega usando um acesso seguro associado ao seu pedido.

- Tratar pagamentos pendentes corretamente, sem liberar o material antecipadamente.



A entrega deve funcionar de verdade, e não apenas apresentar uma tela simulada de sucesso.



5. PAINEL ADMINISTRATIVO PARA GERENCIAR O PDF

   Criar uma área /admin protegida por autenticação, com interface simples e funcional.



O administrador deve poder:



- Fazer upload do PDF que será vendido.

- Substituir o arquivo quando houver uma nova versão.

- Editar o título, a descrição, a imagem e o preço do produto.

- Visualizar pedidos e seus respectivos estados de pagamento.

- Consultar os pedidos aprovados e os downloads disponíveis.



Usar armazenamento privado para o PDF. Proteger as operações administrativas, impedir cadastro público de administradores e não permitir acesso ao painel sem autenticação.



6. TECNOLOGIA E SEGURANÇA

   Utilizar a estrutura de backend e banco de dados apropriada, podendo usar Supabase para autenticação, banco, armazenamento privado e funções de servidor.



- Manter as chaves secretas apenas no backend.

- Configurar políticas de acesso adequadas no banco e no armazenamento.

- Validar o preço e o estado do pedido no servidor.

- Usar links temporários para os downloads.

- Criar mensagens de erro claras e estados de carregamento.

- Não expor arquivos privados nem informações de outros compradores.

- Preparar a aplicação para configurar primeiro credenciais de teste e depois credenciais de produção do Mercado Pago.



7. ECONOMIA DE CRÉDITOS E ENTREGA DO PROJETO

   Implementar o escopo solicitado em uma única execução, com código organizado e componentes reutilizáveis.



Não criar blog, múltiplos produtos, assinaturas, área de membros, funcionalidades sociais ou outros recursos não solicitados.



Não gastar créditos com perguntas ou reformulações desnecessárias. Criar primeiro a aplicação funcional e informar, ao terminar, quais integrações externas exigem configuração de credenciais ou autorização da conta.



Preparar o projeto para conexão e sincronização com GitHub, permitindo continuar os ajustes e a integração pelo código.



IMPORTANTE: priorize a funcionalidade real sobre elementos decorativos. Não declarar pagamento ou entrega automática como concluídos se a integração ainda depender de credenciais, configuração do backend, Webhook ou testes.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dozeroaoprimeiroanuncio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/742d621c-99ac-4ef2-8e12-f7d3b91c68ee).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
