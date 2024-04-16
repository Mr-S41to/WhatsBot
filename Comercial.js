const fs = require("fs");
const wppconnect = require("@wppconnect-team/wppconnect");

let atendimentos = {};

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
    if (atendimentos[message.from] !== true) {
      if (horioAtendimento()) {
        await client.sendText(
          message.from,
          "Olá, aqui é a Luna, assistente comercial do Grupo Saint Paul.\nEm que posso ajudar?\n\n1️⃣ - Cessão de Direitos\n2️⃣ - Autorização para Escritura\n3️⃣ - Contratos\n4️⃣ - Unificação e Desmembramento de Lotes\n5️⃣ - Aditivos e Notas Devolutivas\n6️⃣ - Outros Serviços"
        )
          .then((result) => {
            console.log("Result: ", result); //return object successd
          })
          .catch((erro) => {
            console.error("Error when sending: ", erro); //return object error
          });
        console.log(atendimentos);
        atendimentos[message.from] = true;
      } else {
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
    if (message.body && horioAtendimento()) {
      switch (message.body) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          await client.sendText(
            message.from,
            "Por gentileza, *seu nome completo*?"
          );
          await waitForMessage(client, message.from);
          await client.sendText(message.from, "E o *seu CPF*?");
          await waitForMessage(client, message.from);
          await client.sendText(
            message.from,
            "Por favor, em uma mensagem me envie os dados da sua *(quadra, lote e residencial)*?\n\n*Ex: Q.XX, L.XX, Grand Trianon*"
          );
          await waitForMessage(client, message.from);
          await client.sendText(
            message.from,
            "Pronto! Agora é só aguardar que em breve sua solicitação será atendida.\n\n Caso precise de ajuda com outros assuntos, descreva a sua solicitação abaixou para nossos atendentes. 😉"
          );
          setTimeout(() => {
            delete atendimentos[message.from];
          }, 60 * 60 * 1000);
          break;
        case "6":
          await client.sendText(
            message.from,
            "Por gentileza, informe a solicitação que deseja fazer para prosseguirmos com o atendimento?"
          );
          await waitForMessage(client, message.from);
          await client.sendText(message.from, "Por gentileza, *seu nome completo*?");
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
            "Pronto! Agora é só aguardar que em breve sua solicitação será atendida.\n\n Caso precise de ajuda com outros assuntos, descreva a sua solicitação abaixou para nossos atendentes. 😉"
          );
          setTimeout(() => {
            delete atendimentos[message.from];
          }, 60 * 60 * 1000);
          break;
        default:
          break;
      }
    }
  });
}