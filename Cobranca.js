const fs = require("fs");
const wppconnect = require("@wppconnect-team/wppconnect");

let atendimentos = {};
let primeiraMsg = {}

const engenharia = "556283045040@c.us";
const prefeituraAnapolis = "556239022882@c.us"
const prefeituraBarroAlto = "556296785529@c.us"

wppconnect
  .create({
    session: "sessionName",
    catchQR: (base64Qr, asciiQR) => {
      console.log(asciiQR); // Optional to log the QR in the terminal
      var matches = base64Qr.match(
        /^data:([A-Za-z-+\/]+);base64,(.+)$/
      ),
        response = {};

      if (matches.length !== 3) {
        return new Error("Invalid input string");
      }
      response.type = matches[1];
      response.data = new Buffer.from(matches[2], "base64");

      var imageBuffer = response;
      require("fs").writeFile(
        "out.png",
        imageBuffer["data"],
        "binary",
        function (err) {
          if (err != null) {
            console.log(err);
          }
        }
      );
    },
    logQR: false,
    whatsappVersion: 2.2413
  })
  .then((client) => start(client))
  .catch((error) => console.log(error));

// Função para esperar uma mensagem de um cliente especifico.
function waitForMessage(client, from) {
  return new Promise((resolve) => {
    client.onMessage((message) => {
      if (message.from === from) {
        resolve(message);
      }
    });
  });
}

function horioAtendimento() {
  var now = new Date;
  var hora = now.getHours();
  var dia = now.getDay();

  return hora >= 8 && hora < 18 && dia >= 1 && dia <= 5;
}

function start(client) {
  client.onMessage(async (message) => {
    // validar inicio do atendimento

    primeiraMsg[message.from] = false;
    if (atendimentos[message.from] !== true && message.body.toLowerCase() !== "continuar") {
      if (
          horioAtendimento() && 
          primeiraMsg[message.from] === false &&
          message.from !== engenharia &&
          message.from !== prefeituraAnapolis &&
          message.from !== prefeituraBarroAlto
        ) {
        await client.sendText(
          message.from,
          "Olá, aqui é a Luna, assistente de cobranças do Grupo Saint Paul.\nEm que posso ajudar?\n\n1️⃣ - Para Boletos\n2️⃣ - Informações de IPTU\n3️⃣ - Relatórios de Imposto de Renda\n4️⃣ - Cálculos de Quitação\n5️⃣ - Acordos de parcelas em atraso\n6️⃣ - Informações de atendimento\n7️⃣ - Outros Serviços"
        )
          .then((result) => {
            console.log("Result: ", result); //return object successd
          })
          .catch((erro) => {
            console.error("Error when sending: ", erro); //return object error
          });
        primeiraMsg[message.from] = true;
        atendimentos[message.from] = true;
        console.log(atendimentos);
      } else {
        if (message.from !== engenharia) {
          await client.sendText(
            message.from,
            "Desculpe, nosso horário de atendimento é de *8h00* até *18h00* de *segunda* a *sexta*\nPor favor retorne em horário comercial. Desde já, agradecemos o seu contato."
          );
          atendimentos[message.from] = true;
          setTimeout(() => {
            delete atendimentos[message.from];
          }, 60 * 30 * 1000);
        }
      }
    }
    // Processa a mensagem do cliente
    if (
        message.body.toLowerCase() && 
        message.body.toLowerCase() !== "continuar" && 
        horioAtendimento() && 
        message.from !== engenharia &&
        message.from !== prefeituraAnapolis &&
        message.from !== prefeituraBarroAlto
      ) {
      let alternativa;
      switch (message.body) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          alternativa = message.body;
          await client.sendText(
            message.from,
            "Por gentileza, em uma mensage *seu nome completo*?"
          );
          await waitForMessage(client, message.from);
          await client.sendText(message.from, "E o *seu CPF*?");
          await waitForMessage(client, message.from);
          await client.sendText(
            message.from,
            "Por favor, em uma mensagem me envie os dados da sua *(quadra, lote e residencial)*?\n\n*Ex: Q.XX, L.XX, Grand Trianon*"
          );
          await waitForMessage(client, message.from);
          if (alternativa === "1") {
            await client.sendText(
              message.from,
              "Pronto! Agora é só aguardar que em breve sua solicitação de *Boletos* 📄 será atendida.\n\nCaso precise de ajuda com outros assuntos, descreva a sua solicitação abaixou para nossos atendentes. 😉"
            );
          }
          if (alternativa === "2") {
            await client.sendText(
              message.from,
              "Pronto! Agora é só aguardar que em breve sua solicitação de *Informações de IPTU* 🧾 será atendida.\n\nCaso precise de ajuda com outros assuntos, descreva a sua solicitação abaixou para nossos atendentes. 😉"
            );
          }
          if (alternativa === "3") {
            await client.sendText(
              message.from,
              "Pronto! Agora é só aguardar que em breve sua solicitação de *Relatórios de Imposto de Renda* 🦁 será atendida.\n\nCaso precise de ajuda com outros assuntos, descreva a sua solicitação abaixou para nossos atendentes. 😉"
            );
          }
          if (alternativa === "4") {
            await client.sendText(
              message.from,
              "Pronto! Agora é só aguardar que em breve sua solicitação de *Cálculos de Quitação* 📊 será atendida.\n\nCaso precise de ajuda com outros assuntos, descreva a sua solicitação abaixou para nossos atendentes. 😉"
            );
          }
          if (alternativa === "5") {
            await client.sendText(
              message.from,
              "Pronto! Agora é só aguardar que em breve sua solicitação de *Acordos de parcelas em atraso* 🤝 será atendida.\n\nCaso precise de ajuda com outros assuntos, descreva a sua solicitação abaixou para nossos atendentes. 😉"
            );
          }
          setTimeout(() => {
            delete atendimentos[message.from];
            console.log(
              `Usuário ${message.from} removido após 2.5 horas.`
            );
            client.sendText(
              message.from,
              "Tempo de atendimento finalizado, caso não tenha sido atendido, digite: *Continuar*."
            );
          }, 3.5 * 60 * 60 * 1000);
          console.log(atendimentos);
          break;
        case "6":
          await client.sendText(
            message.from,
            "*Departamento Comercial*:\n📧 *E-Mail*: comercial@gruposaintpaul.com.br\n📱 *WhatsApp*: 62 99226-7385\n\n*Departamento de Vendas*:\n📧 *E-Mail*: vendas@gruposaintpaul.com.br\n📱 *WhatsApp*: 62 99347-383\n\n*Aluguel*:\n📧 *E-Mail*: cobranca@gruposaintpaul.com.br\n📱 *WhatsApp*: 62 99948-7288"
          );
          await client.sendText(
            message.from,
            "Se precisar de mais algum atendimento é só chamar."
          );
          delete atendimentos[message.from];
          delete primeiraMsg[message.from];
          break;
        case "7":
          await client.sendText(
            message.from,
            "Por gentileza,  em uma mensagem informe a solicitação que deseja fazer para prosseguirmos com o atendimento?"
          );
          await waitForMessage(client, message.from);
          await client.sendText(message.from, "Por gentileza, em uma mensage *seu nome completo*?");
          await waitForMessage(client, message.from);
          await client.sendText(message.from, "E o *seu CPF*?");
          await waitForMessage(client, message.from);
          await client.sendText(
            message.from,
            "Por favor, em uma mensagem me envie os dados da sua unidade *(quadra, lote e residencial)*?\n\n*Ex: Q.XX, L.XX, Grand Trianon*"
          );
          await waitForMessage(client, message.from);
          await client.sendText(
            message.from,
            "Pronto! Agora é só aguardar que em breve sua solicitação será atendida.\n\nCaso precise de ajuda com outros assuntos, descreva a sua solicitação abaixou para nossos atendentes. 😉"
          );
          setTimeout(() => {
            delete atendimentos[message.from];
            delete primeiraMsg[message.from];
            client.sendText(
              message.from,
              "Tempo de atendimento finalizado, caso não tenha sido atendido, digite: *Continuar*."
            );
          }, 3.5 * 60 * 60 * 1000);
          break;
        default:
          break;
      }
    }
    if (message.body.toLowerCase() === "continuar") {
      atendimentos[message.from] = true;
      console.log("Função de continuação chamada!")
      setTimeout(() => {
        delete atendimentos[message.from];
        delete primeiraMsg[message.from];
        client.sendText(
          message.from,
          "Obrigado pelo contato, caso precise de mais alguma coisa é so chamar."
        );
      }, 3.5 * 60 * 60 * 1000);
    } else {
      console.log("Não há mensagens de texto.")
    }
  });
}