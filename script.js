function getCookie(name) {
  if (!name) return;
  let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function getUrlParam(name) {
  if (!name) return;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const paramValue = urlParams.get(name);
  return paramValue;
}
function sendRequest(url, type = "GET", param = {}, func = null, atr = {}) {
  let xhr = new XMLHttpRequest();
  xhr.open(type, url);
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        try {
          let result = JSON.parse(this.responseText);
          console.log("API запрос", result);
          if (func) {
            try {
              func(result, atr);
            } catch {
              console.error("error function", func);
            }
          }
        } catch {
          console.error("error parse", this.responseText);
        }
      } else if (this.status == 301) {
        location.href = "./login.html";
      }
    }
  };
  xhr.send(JSON.stringify(param));
}
function enumerate(num, dec) {
  if (num > 100) num = num % 100;
  if (num <= 20 && num >= 10) return dec[2];
  if (num > 20) num = num % 10;
  return num === 1 ? dec[0] : num > 1 && num < 5 ? dec[1] : dec[2];
}
function mDate(timestamp) {
  let date = new Date(timestamp * 1000);
  let options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return date.toLocaleString("uk-ua", options);
}
function dDate(datetime) {
  let date = new Date(datetime);
  let options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return date.toLocaleString("uk-ua", options);
}
function dTime(datetime) {
  let date = new Date(datetime);
  let options = {
    hour: "numeric",
    minute: "numeric",
  };
  return date.toLocaleString("uk-ua", options);
}
function differenceDateTime(date1, date2) {
  if (date2 == undefined) date2 = new Date();
  var d1 = new Date(typeof date1 == "string" ? date1 : date1.getTime()),
    d2 = new Date(typeof date2 == "string" ? date2 : date2.getTime());
  var Y, M, D, ms, h, m, s;
  M = 0;
  var d = new Date(d1.getTime());
  while (true) {
    d.setMonth(d.getMonth() + 1);
    if (d.getTime() < d2.getTime()) M++;
    else {
      d.setMonth(d.getMonth() - 1);
      break;
    }
  }
  Y = Math.round(M / 12);
  M = M - Y * 12;
  ms = d2.getTime() - d.getTime();
  D = Math.round(ms / 86400000);
  ms = ms - D * 86400000;
  h = Math.round(ms / 3600000);
  ms = ms - h * 3600000;
  m = Math.round(ms / 60000);
  ms = ms - m * 60000;
  s = Math.round(ms / 1000);
  if (Y >= 1) {
    return `${Y} ${enumerate(Y, ["рік", "роки", "років"])} тому`;
  }
  if (M >= 1) {
    return `${M} ${enumerate(M, ["місяць", "місяці", "місяців"])} тому`;
  }
  if (D >= 1) {
    return `${D} ${enumerate(D, ["день", "дні", "днів"])} тому`;
  }
  if (h >= 1) {
    return `${h} ${enumerate(h, ["годину", "години", "годин"])} тому`;
  }
  if (m >= 1) {
    return `${m} ${enumerate(m, ["хвилину", "хвилини", "хвилин"])} тому`;
  }
  if (s >= 1) {
    return `${s} ${enumerate(s, ["секунду", "секунди", "секунд"])} тому`;
  }
}
window.onpopstate = function (event) {
  console.log("state", event);
  if (event.state == "chatList") {
    document.getElementsByClassName("chat-list")[0].classList.remove("hidden");
    document.getElementsByClassName("chat-message")[0].classList.add("hidden");
    document.getElementsByClassName("user-detail")[0].classList.add("hidden");
    document.getElementsByClassName("chat-wrap")[0].tempNextPage = document.getElementsByClassName("chat-wrap")[0].nextPage;
    document.getElementsByClassName("chat-wrap")[0].nextPage = 1;
    document.getElementsByClassName("chat-wrap")[0].removeEventListener("scroll", addLoadMessages);
  } else if (event.state.includes("selectChat")) {
    let chatId = event.state.split("-")[1];
    if (chatId != document.getElementsByClassName("chat-wrap")[0].dataset.chatId) {
      document.getElementsByClassName("chat-wrap")[0].dataset.chatId = chatId;
      document.getElementsByClassName("chat-wrap")[0].nextPage = 1;
      openChat.call(document.getElementsByClassName("chat-wrap")[0]);
    } else {
      document.getElementsByClassName("chat-list")[0].classList.add("hidden");
      document.getElementsByClassName("user-detail")[0].classList.add("hidden");
      document.getElementsByClassName("chat-message")[0].classList.remove("hidden");
      document.getElementsByClassName("chat-wrap")[0].nextPage = document.getElementsByClassName("chat-wrap")[0].tempNextPage;
      document.getElementsByClassName("chat-wrap")[0].addEventListener("scroll", addLoadMessages);
    }
  } else if (event.state.includes("userDetail")) {
    let userId = event.state.split("-")[1];
    if (userId == currentUserId) {
      document.getElementsByClassName("chat-list")[0].classList.add("hidden");
      document.getElementsByClassName("chat-message")[0].classList.add("hidden");
      document.getElementsByClassName("user-detail")[0].classList.remove("hidden");
    } else {
      window.currentUserId = userId;
      userDetail();
    }
  }
};

// base function
function loadChats(page = 1) {
  history.replaceState("chatList", null, location.href);
  if (page == 1) {
    sendRequest("./project.php", "GET", "", function (result) {
      document.getElementById("headProjectImg").src = result.project.photo;
      document.getElementById("headProjectImg").alt = result.project.name;
      document.getElementById("headProjectName").innerHTML = result.project.name;
    });
    if (getUrlParam("selectedContactId")) {
      sendRequest(`./contactChat.php?id=${getUrlParam("selectedContactId")}`, "GET", "", function (result) {
        if (result.state) {
          openChat.apply({ dataset: { chatId: result.contactInfo.id } });
        }
      });
    }
  }
  sendRequest(`./chats.php?page=${page}`, "GET", "", function (result) {
    if (result.state) {
      let chatList = document.getElementById("project-chat-list");
      for (let c = 0; c < result.collection.length; c++) {
        try {
          appendChatElem(chatList, result.collection[c]);
        } catch {
          console.error("failed append chat", result.collection[c]);
        }
      }
      document.getElementsByClassName("chat-list-project")[0].nextPage = page + 1;
      if (result.cursor.page < result.cursor.pages) {
        document.getElementsByClassName("chat-list-project")[0].addEventListener("scroll", addLoadChats);
      }
    } else {
      alert(result.error.message.join("\n"));
    }
  });
}
function addLoadChats() {
  if (this.scrollHeight <= this.scrollTop + this.clientHeight + 1) {
    this.removeEventListener("scroll", addLoadChats);
    loadChats(this.nextPage);
  }
}
function appendChatElem(chatList, chatData) {
  let chatElem = document.getElementsByClassName(`chat chat-${chatData.id}`)[0];
  if (!chatElem) {
    chatElem = document.createElement("li");
  }
  chatElem.className = `chat chat-${chatData.id}`;
  chatElem.dataset.chatId = chatData.id;
  let updatedAt = new Date(chatData.updatedAt);

  chatElem.innerHTML = `
    <img src="${chatData.image}" alt="${chatData.name}">
    <div><span class="chat-name">${chatData.name}</span>
    <span class="chat-date">${differenceDateTime(chatData.updatedAt)}</span></div>
    `;
  if (chatData.unreadMessages >= 1) {
    chatElem.innerHTML += `<span class="unread">${chatData.unreadMessages}</span>`;
  }
  chatList.appendChild(chatElem);
  chatElem.addEventListener("click", openChat);
}
function openChat() {
  let chatContent = document.getElementsByClassName("chat-content")[0];
  let page = chatContent.parentNode.nextPage;
  if (!page) {
    page = 1;
  }
  let chatId = this.dataset.chatId;
  if (page == 1) {
    if (!history.state.includes("selectChat")) {
      history.pushState(`selectChat-${chatId}`, null, location.href);
    }
    sendRequest(`./chatInfo.php?id=${this.dataset.chatId}`, "GET", "", function (result) {
      document.getElementsByClassName("chat-list")[0].classList.add("hidden");
      document.getElementsByClassName("chat-message")[0].classList.remove("hidden");
      document.getElementById("contactName").innerHTML = result.chatInfo.name;
      window.currentUserId = result.chatInfo.contact.originalId;
      let messengersBlock = document.getElementsByClassName("chat-messengers")[0];
      messengersBlock.innerHTML = "";
      let unsubscribe = true;
      for (let m = 0; m < result.chatInfo.gates.length; m++) {
        try {
          let messengerElem = document.createElement("span");
          messengerElem.className = "chat-icon";
          if (result.chatInfo.gates[m].subscribed) {
            messengerElem.classList.add("active");
            unsubscribe = false;
          } else {
            messengerElem.classList.add("inactive");
          }
          if (result.chatInfo.gates[m].channel.type == "telegram") {
            messengerElem.innerHTML = `<svg class="icon icon-telegram"><use xlink:href="./img/sprite.svg#icon-telegram"></use></svg>`;
          } else if (result.chatInfo.gates[m].channel.type == "viber") {
            messengerElem.innerHTML = `<svg class="icon icon-viber"><use xlink:href="./img/sprite.svg#icon-viber"></use></svg>`;
          } else if (result.chatInfo.gates[m].channel.type == "instagram") {
            messengerElem.innerHTML = `<img src="https://messenger.smartsender.com/img/set-up-ig.png" class="gate-icon icon">`;
          } else if (result.chatInfo.gates[m].channel.type == "facebook") {
            messengerElem.innerHTML = `<svg class="icon icon-facebook"><use xlink:href="./img/sprite.svg#icon-facebook"></use></svg>`;
          } else {
            console.warn("not supporten messenger", result.chatInfo.gates[m]);
          }
          messengersBlock.appendChild(messengerElem);
        } catch {
          console.error("fail append channel", result.chatInfo.gates[m]);
        }
      }
      if (unsubscribe) {
        document.getElementsByClassName("textarea-send")[0].setAttribute("disabled", "");
      } else {
        document.getElementsByClassName("textarea-send")[0].removeAttribute("disabled");
      }
    });
  }
  sendRequest(`./chat.php?id=${this.dataset.chatId}&page=${page}`, "GET", "", function (result) {
    if (result.state) {
      if (page == 1) {
        chatContent.innerHTML = "";
      }
      for (let c = 0; c < result.collection.length; c++) {
        try {
          appendMessage(chatContent, result.collection[c], result.cursor);
        } catch {
          console.error("fail append message", result.collection[c]);
        }
      }
      if (result.cursor.pages > result.cursor.page) {
        try {
          chatContent.parentNode.nextPage = result.cursor.page + 1;
          chatContent.parentNode.dataset.chatId = chatId;
          chatContent.parentNode.addEventListener("scroll", addLoadMessages);
        } catch {
          console.error("fail addEvent scroll");
        }
      }
    }
  });
}
function addLoadMessages() {
  if (this.scrollTop == 0) {
    this.removeEventListener("scroll", addLoadMessages);
    openChat.call(this);
  }
}
function appendMessage(chat, message, cursor, mode = "top") {
  let msg = document.createElement("div");
  if (message.sender.type == "contact") {
    msg.className = "chat-get-msg";
  } else {
    msg.className = "chat-send-msg";
  }
  if (message.content.type == "pendingText") {
    for (k in message.content.resource.parameters.replacement) {
      message.content.resource.parameters.content = message.content.resource.parameters.content.replaceAll(k, message.content.resource.parameters.replacement[k]);
    }
    message.content.type = "text";
  }
  if (!message.sender.image.includes("https")) {
    message.sender.image = "." + message.sender.image;
  }
  let appendMsgClass = "";
  let noteMsg = "";
  let delMsg = false;
  if (message.content.type == "transient") {
    delMsg = true;
    appendMsgClass += "transient-message ";
    noteMsg = `Видалено ${dDate(message.content.resource.parameters.context.timestamp)}`;
    message.content = message.content.resource.parameters.original;
  }
  if (message.internal) {
    appendMsgClass += "internal-message ";
  }
  if (message.content.type == "text" || message.content.type == "input") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container text ${appendMsgClass}">
    <div class="brdcst-msg"><div class="brdcst-msg-text">
    <span>${message.content.resource.parameters.content.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>")}</span></div></div>`;
  } else if (message.content.type == "file") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container file ${appendMsgClass}">
    <div class="brdcst-msg"><div class="brdcst-msg-file">
    <a href="${message.content.resource.parameters.url}" target="_blank">
    <svg class="icon icon-chat-files"><use xlink:href="./img/sprite.svg#icon-chat-files"></use></svg>
    </a></div></div>`;
  } else if (message.content.type == "mediaGroup") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container mediaGroup ${appendMsgClass}">
    <div class="brdcst-msg"><div class="brdcst-msg-gallery">
    <div class="brdcst-msg-gallery-left" onclick="galleryleft(this)"><svg class="icon icon-arrow-big"><use xlink:href="./img/sprite.svg#icon-arrow-big"></use></svg></div>
    <div class="brdcst-msg-gallery-right" onclick="galleryright(this)"><svg class="icon icon-arrow-big"><use xlink:href="./img/sprite.svg#icon-arrow-big"></use></svg></div>
    <div class="brdcst-msg-gallery-image" style="background: url(${message.content.resource.parameters.media[0].resource.parameters.url})"></div>
    </div></div>`;
    msg.getElementsByClassName("brdcst-msg-gallery-image")[0].gallery = message.content.resource.parameters.media;
    msg.getElementsByClassName("brdcst-msg-gallery-image")[0].currentMedia = 0;
  } else if (message.content.type == "link") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container text">
    <div class="brdcst-msg"><div class="brdcst-msg-text">
    <span><a href="${message.content.resource.parameters.url}">${message.content.resource.parameters.url}</a></span></div></div>`;
  } else if (message.content.type == "picture" || message.content.type == "telegramCaptionedPicture" || message.content.type == "animation") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container picture ${appendMsgClass}">
    <div class="brdcst-msg"><div class="picture-container">
    <a href="${message.content.resource.parameters.url}" target="_blank">
    <img src="${message.content.resource.parameters.url}" alt="${message.content.resource.parameters.caption}"></a>
    </div></div>`;
    if ("caption" in message.content.resource.parameters) {
      let caption = document.createElement("p");
      caption.innerHTML = message.content.resource.parameters.caption;
      msg.getElementsByClassName("picture-container")[0].appendChild(caption);
    }
  } else if (message.content.type == "telegramInvoice") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container telegramInvoice ${appendMsgClass}">
    <div class="brdcst-msg"><div class="picture-container build-in-invoice-container">
    <p class="invoice-type"><svg class="icon icon-built-in-invoice"><use xlink:href="./img/sprite.svg#icon-built-in-invoice"></use></svg> Вбудований рахунок </p>
    <p>- ${message.content.resource.parameters.receipt.title}</p>
    <p>${message.content.resource.parameters.receipt.description}</p>
    </div></div>`;
  } else if (message.content.type == "telegramVideoNote" || message.content.type == "video") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container telegramVideoNote ${appendMsgClass}">
    <div class="brdcst-msg"><div class="video-container">
    <video src="${message.content.resource.parameters.url}" controls></video>
    </div></div>`;
  } else if (message.content.type == "action") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container action ${appendMsgClass}">
    <div class="brdcst-msg"><div class="brdcst-msg-text">
    <span>${message.content.resource.parameters.content}</span>
    </div></div>`;
  } else if (message.content.type == "contact") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container contact ${appendMsgClass}">
    <div class="brdcst-msg"><div class="brdcst-msg-text"><div class="contact-info">
    <svg class="icon"><use xlink:href="./img/sprite.svg#icon-ic_call_end"></use></svg>
    <p class="contact-description"> ${message.content.resource.parameters.name} <br><a href="tel:${message.content.resource.parameters.phoneNumber}">${message.content.resource.parameters.phoneNumber}</a></p>
    </div></div></div>`;
  } else if (message.content.type == "location") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container location ${appendMsgClass}">
    <div class="brdcst-msg"><div class="brdcst-map-container">
    <iframe src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d20716.96858191463!2d${message.content.resource.parameters.longitude}!3d${message.content.resource.parameters.latitude}!3m2!1i1024!2i768!4f13.1!5e0!3m2!1suk!2sua!4v1698664662475!5m2!1suk!2sua" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div></div>`;
    //
  } else if (message.content.type == "audio" || message.content.type == "voice") {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container telegramVideoNote ${appendMsgClass}">
    <div class="brdcst-msg"><div class="audio-container">
    <audio src="${message.content.resource.parameters.url}" controls></audio>
    </div></div>`;
  } else {
    msg.innerHTML = `
    <div class="chat-user"><img src="${message.sender.image}" alt="${message.sender.fullName}"><p>${dTime(message.createdAt)}</p></div>
    <div class="msg-container error ${appendMsgClass}">
    <div class="brdcst-msg"><div class="brdcst-msg-error">
    <span>Повідомлення не підтримується...</span></div></div>`;
    console.warn("unsupported type message", message);
  }
  if (mode == "bottom") {
    chat.appendChild(msg);
  } else {
    chat.prepend(msg);
  }
  if ("buttons" in message.content.resource) {
    for (let b = 0; b < message.content.resource.buttons.length; b++) {
      try {
        let msgBtn = document.createElement("div");
        msgBtn.className = "brdcst-msg-button";
        if (b == 0) {
          msgBtn.classList.add("bordered-button-top");
        }
        if (b == message.content.resource.buttons.length - 1) {
          msgBtn.classList.add("bordered-button-bottom");
        }
        msgBtn.innerHTML = `<p>${message.content.resource.buttons[b].parameters.text}</p>`;
        msg.getElementsByClassName("msg-container")[0].appendChild(msgBtn);
      } catch {
        console.error("failed append msgbtn", message.content.resource.buttons[b]);
      }
    }
  }
  let msgDate = document.createElement("div");
  msgDate.className = "msg-note";
  if (noteMsg != "") {
    msgDate.innerHTML = `<p>${noteMsg}</p>`;
  } else if (message.seenAt != null) {
    msgDate.innerHTML = `<p>Прочитано ${dDate(message.seenAt)}</p>`;
  } else if (message.deliveredAt != null) {
    msgDate.innerHTML = `<p>Доставлено ${dDate(message.deliveredAt)}</p>`;
  } else if (message.createdAt != null) {
    msgDate.innerHTML = `<p>Відправлено ${dDate(message.createdAt)}</p>`;
  }
  if (!message.internal && message.sender.type != "contact") {
    msg.getElementsByClassName("msg-container")[0].appendChild(msgDate);
    if (message.gate.channel.type == "telegram" && !delMsg) {
      let actionBtn = document.createElement("div");
      actionBtn.className = "msg-operation-container";
      actionBtn.messageInfo = message;
      if (message.content.type == "text" || message.content.type == "pendingText") {
        actionBtn.innerHTML = `
          <svg class="icon icon-bin" onclick="deleteMessage(this)"><use xlink:href="./img/sprite.svg#icon-bin"></use></svg>
          <svg class="icon icon-pen" onclick="editMessage(this)"><use xlink:href="./img/sprite.svg#icon-pen"></use></svg>`;
      } else {
        actionBtn.innerHTML = `<svg class="icon icon-bin" onclick="deleteMessage(this)"><use xlink:href="./img/sprite.svg#icon-bin"></use></svg>`;
      }
      msgDate.appendChild(actionBtn);
    }
  }
  if (cursor.page == 1) {
    chat.scrollIntoView(false);
    if (message.content.type == "picture") {
      setTimeout(function () {
        chat.scrollIntoView(false);
      }, 400);
    }
  } else if (chat.parentNode.scrollTop == 0) {
    chat.parentNode.scrollBy(0, msg.scrollHeight);
  }
}
function galleryleft(elem) {
  let galleryBlock = elem.parentNode.getElementsByClassName("brdcst-msg-gallery-image")[0];
  galleryBlock.currentMedia--;
  if (galleryBlock.currentMedia < 0) {
    galleryBlock.currentMedia = galleryBlock.gallery.length - 1;
  }
  galleryBlock.style = `background: url(${galleryBlock.gallery[galleryBlock.currentMedia].resource.parameters.url})`;
}
function galleryright(elem) {
  let galleryBlock = elem.parentNode.getElementsByClassName("brdcst-msg-gallery-image")[0];
  galleryBlock.currentMedia++;
  if (galleryBlock.currentMedia >= galleryBlock.gallery.length) {
    galleryBlock.currentMedia = 0;
  }
  galleryBlock.style = `background: url(${galleryBlock.gallery[galleryBlock.currentMedia].resource.parameters.url})`;
}
function editMessage(node) {
  let msg = node.parentNode.messageInfo;
  let data = {
    gateId: msg.gate.id,
    messageId: msg.id,
    text: prompt("Введіть новий текст повідомлення", msg.content.resource.parameters.content),
  };
  console.log("edit", data);
  if (data.text != null) {
    sendRequest("./chat.php", "PUT", data, function (result) {
      if (result.state) {
        node.parentNode.parentNode.parentNode.getElementsByTagName("span")[0].innerHTML = data.text;
      } else {
        alert("Виникла помилка при редагуванні повідомлення");
      }
    });
  }
}
function deleteMessage(node) {
  if (confirm("Підтвердіть видалення повідомлення")) {
    let msg = node.parentNode.messageInfo;
    sendRequest(
      "./chat.php",
      "DELETE",
      {
        gateId: msg.gate.id,
        messageId: msg.id,
      },
      function (result) {
        if (result.state) {
          node.parentNode.parentNode.parentNode.classList.add("transient-message");
          node.parentNode.parentNode.innerHTML = `<p>Видалено ${dDate(new Date())}</p>`;
        } else {
          alert("Виникла помилка при видалені повідомлення");
        }
      }
    );
  }
}
function writeMessage(text) {
  if (text != "") {
    document.getElementsByClassName("chat-bottom-send")[0].classList.add("active");
    document.getElementsByClassName("chat-bottom-send")[0].setAttribute("onclick", "sendMessage()");
  } else {
    document.getElementsByClassName("chat-bottom-send")[0].classList.remove("active");
    document.getElementsByClassName("chat-bottom-send")[0].removeAttribute("onclick");
  }
}
function sendMessage() {
  let data = {
    userId: currentUserId,
    type: "text",
    content: document.getElementsByClassName("textarea-send")[0].value,
  };
  sendRequest("./chat.php", "POST", data, function (result) {
    if (result.state) {
      appendMessage(document.getElementsByClassName("chat-content")[0], result.message, { page: 1 }, "bottom");
      document.getElementsByClassName("textarea-send")[0].value = "";
      writeMessage("");
    } else {
      alert(result.error.message.join("\n"));
    }
  });
}
function userDetail() {
  let userId = currentUserId;
  sendRequest(`./user.php?id=${userId}`, "GET", "", function (result) {
    if (result.state) {
      if (!history.state.includes("userDetail")) {
        history.pushState(`userDetail-${userId}`, null, location.href);
      }
      document.getElementsByClassName("chat-list")[0].classList.add("hidden");
      document.getElementsByClassName("chat-message")[0].classList.add("hidden");
      document.getElementsByClassName("user-detail")[0].classList.remove("hidden");
      // based info
      document.getElementsByClassName("detail-top-name")[0].innerHTML = result.userDetail.fullName;
      document.getElementsByClassName("detail-main-photo")[0].src = result.userDetail.photo;
      document.getElementsByClassName("detail-main-photo")[0].alt = result.userDetail.fullName;
      document.getElementsByClassName("detail-main-name")[0].innerHTML = result.userDetail.fullName;
      document.getElementsByClassName("detail-main-userId")[0].innerHTML = `<svg class="icon icon-card"><use xlink:href="./img/sprite.svg#icon-card"></use></svg> User ID: ${result.userDetail.id}`;
      document.getElementsByName("firstName")[0].value = result.userDetail.firstName;
      document.getElementsByName("lastName")[0].value = result.userDetail.lastName;
      document.getElementsByName("email")[0].value = result.userDetail.email;
      document.getElementsByName("phone")[0].value = result.userDetail.phone;
      // tags
      let tagList = document.getElementById("contactTagsList");
      for (let t = 0; t < result.userDetail.tags.length; t++) {
        let tagElem = document.createElement("button");
        tagElem.className = "btn";
        tagElem.tagInfo = result.userDetail.tags[t];
        tagElem.innerHTML = ` ${result.userDetail.tags[t].name} <svg class="icon icon-close"><use xlink:href="./img/sprite.svg#icon-close"></use></svg>`;
        tagElem.setAttribute("onclick", "deleteTag(this)");
        tagList.appendChild(tagElem);
      }
      // funnels
      let funnelList = document.getElementById("contactFunnelsList");
      for (let f = 0; f < result.userDetail.funnels.length; f++) {
        let funnelElem = document.createElement("button");
        funnelElem.className = "btn";
        funnelElem.innerHTML = ` ${result.userDetail.funnels[f].name} <svg class="icon icon-close"><use xlink:href="./img/sprite.svg#icon-close"></use></svg>`;
        funnelElem.funnelInfo = result.userDetail.funnels[f];
        funnelElem.setAttribute("onclick", "deleteFunnel(this)");
        funnelList.appendChild(funnelElem);
      }
      // notes
      let noteList = document.getElementById("contactNotesList");
      for (let n = 0; n < result.userDetail.notes.length; n++) {
        let noteElem = document.createElement("div");
        noteElem.className = "detail-attributes-note";
        noteElem.noteInfo = result.userDetail.notes[n];
        noteElem.innerHTML = `
          <div class="note-attribute">
          <div class="note-text">${result.userDetail.notes[n].content}</div>
          <div class="note-delete" onclick="deleteNote(this)">
          <svg class="icon icon-close"><use xlink:href="./img/sprite.svg#icon-close"></use></svg>
          </div></div>
          <p class="note-creator"> ${dDate(result.userDetail.notes[n].createdAt)} від ${result.userDetail.notes[n].user.fullName} 
          <img src="${result.userDetail.notes[n].user.photo}" alt="${result.userDetail.notes[n].user.fullName}"></p>`;
        noteList.appendChild(noteElem);
      }
      // variables
      let varList = document.getElementById("contactVariablesList");
      for (let v = 0; v < result.userDetail.variables.length; v++) {
        let varElem = document.createElement("label");
        varElem.className = "label-text label-text-variable";
        varElem.varInfo = result.userDetail.variables[v];
        varElem.innerHTML = `
        <input type="text" placeholder=" " name="${result.userDetail.variables[v].name}" disabled class="input-text" value="${result.userDetail.variables[v].value}">
        <span class="span-input-text">${result.userDetail.variables[v].name}</span>`;
        varElem.setAttribute("onclick", "editVariable(this)");
        varList.appendChild(varElem);
      }
    } else {
      alert(result.error.message.join("\n"));
    }
  });
}
function saveBaseInfo(form) {
  event.preventDefault();
}
function deleteTag(node) {
  if (confirm(`Підтвердіть видалення тегу "${node.tagInfo.name}"`)) {
    sendRequest(
      "./tags.php",
      "DELETE",
      {
        userId: currentUserId,
        tagId: node.tagInfo.id,
      },
      function (result) {
        if (result.state) {
          node.parentNode.removeChild(node);
        } else {
          alert("Виникла помилка при видаленні тегу");
        }
      }
    );
  }
}
function deleteFunnel(node) {
  if (confirm(`Підтвердіть відписку від воронки "${node.funnelInfo.name}"`)) {
    sendRequest(
      "./funnels.php",
      "DELETE",
      {
        userId: currentUserId,
        funnelId: node.funnelInfo.serviceKey,
      },
      function (result) {
        if (result.state) {
          node.parentNode.removeChild(node);
        } else {
          alert("Виникла помилка при відписці від воронки");
        }
      }
    );
  }
}
function deleteNote(node) {
  node = node.parentNode;
}
function editVariable(node) {}

function showVariables(elem) {
  elem.classList.add("rotated");
  elem.innerHTML = '<svg class="icon icon-arrow-down"><use xlink:href="./img/sprite.svg#icon-arrow-down"></use></svg>Приховати змінні';
  elem.setAttribute("onclick", "hideVariables(this)");
  document.getElementById("contactVariablesList").classList.remove("hidden");
}
function hideVariables(elem) {
  elem.classList.remove("rotated");
  elem.innerHTML = '<svg class="icon icon-arrow-down"><use xlink:href="./img/sprite.svg#icon-arrow-down"></use></svg>Показати змінні';
  elem.setAttribute("onclick", "showVariables(this)");
  document.getElementById("contactVariablesList").classList.add("hidden");
}

function thisAuth(form) {
  event.preventDefault();
  if (!form) {
    return console.log("form not found");
  }
  let inputs = form.elements;
  let auth = {};
  Array.prototype.forEach.call(inputs, function (input) {
    auth[input.name] = input.value;
  });
  sendRequest(`./login.php`, "POST", auth, function (result) {
    if (result.state) {
      location.href = "./";
    } else {
      if ("error" in result && "message" in result.error) {
        alert(result.error.message.join("\n"));
      } else {
        alert("Виникла не передбачена помилка");
      }
    }
  });
}
