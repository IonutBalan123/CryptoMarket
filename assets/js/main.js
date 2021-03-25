const topTokenSection = document.querySelector(".MainTokens");
const bottomTokenSection = document.querySelector(".RestOfTokens");
let currency = "USD";

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function convertToInternationalCurrencySystem(labelValue) {
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + "B"
    : Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + "M"
    : Math.abs(Number(labelValue)) >= 1.0e3
    ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + "K"
    : Math.abs(Number(labelValue));
}

const showError = (type, tokenName) => {
  document.querySelector(".ErrorDiv").style.transform = "translate(-50%,100%)";
  if (type === "BrokenAPI") {
    document.querySelector(".ErrorMessage").innerText =
      "The API does not work at the moment, please try again later.";
  } else if (type === "WrongName") {
    document.querySelector(
      ".ErrorMessage"
    ).innerText = `This cryptocurrency does not exist(${tokenName})`;
  }
  setTimeout(() => {
    document.querySelector(".ErrorDiv").style.transform =
      "translate(-50%,-110%)";
  }, 2000);
};

const setTokens = (token, place) => {
  if (place === "top") {
    topTokenSection.innerHTML += `
    <div class="Token" onClick="window.location='/${token.currency}'">
    <div class="UpTokenDiv">
    <h1 style="margin:5px">${token.rank}</h1>
                    <div class="TokenImageDiv">
                    <img src=${token.logo_url} alt="${token.name} image" ${
      token.name === "Ethereum" ? "class=Ethereum" : "class=NonEthereum"
    } />
                    </div>
                    <div class="TokenNamesDiv">
                        <p class="TokenShortName">${token.currency}</p>
                        <div class="TokenName">
                        <p ${
                          token.name === "Ethereum"
                            ? ""
                            : "style=text-align:center"
                        }>${token.name}</p>
                        </div>
                    </div>
                </div>
                <div class="BottomTokenDiv">
                <p class="TokenLivePrice">${numberWithCommas(
                  parseFloat(token.price).toFixed(2)
                )}${currency === "USD" ? "$" : "€"}</p>
            </div>
     `;
  } else if (place === "bottom") {
    if (!(token.symbol === "UNI")) {
      bottomTokenSection.innerHTML += `
    <div class="RestToken" onClick="window.location='/${token.currency}'">
                  <div class="NormalPos"> <h1>${token.rank}</h1></div>
                  <div style="display: flex;justify-content: center;align-items: center;">
                  <img src=${token.logo_url} alt="${token.name} image" />
                  </div>
                  <div class="UpDown">
                  <div class="BottomBorder UpDownCenter">
                  <p >${token.symbol}</p>
                  </div>
                  <div class="UpDownCenter">
                  <p ${token.name.length >= 10 && "class=LitteName"}>${
        token.name
      }</p>
                  </div>
                  </div>
                  <div class="NormalPos"><p>${numberWithCommas(
                    parseFloat(token.price).toFixed(2)
                  )}${currency === "USD" ? "$" : "€"}</p></div> 
                  <div class="NormalPos"><p>${convertToInternationalCurrencySystem(
                    token.market_cap
                  )}${currency === "USD" ? "$" : "€"}</p></div>
              </div>
    `;
    }
  }
};
const changeCurrency = (myCurrency) => {
  document.querySelector(".loadingIndicator").style.display = "block";
  document.querySelector(".attribution").style.display = "none";
  document.querySelector(".TokenInfos").style.display = "none";
  document.querySelector(".SearchbarDiv").style.display = "none";
  topTokenSection.innerHTML = "";
  bottomTokenSection.innerHTML = "";
  axios
    .get(
      `https://api.nomics.com/v1/currencies/ticker?key=376e879a60303749ab7b3b372d85f58f&interval=1d&convert=${myCurrency}&per-page=30&page=1`
    )
    .then((res) => {
      let topFour = res.data.splice(0, 4);
      let rest = res.data;
      topFour.forEach((token) => {
        setTokens(token, "top");
      });
      rest.forEach((token) => {
        setTokens(token, "bottom");
      });
      document.querySelector(".loadingIndicator").style.display = "none";
      document.querySelector(".attribution").style.display = "flex";
      document.querySelector(".TokenInfos").style.display = "grid";
      document.querySelector(".SearchbarDiv").style.display = "flex";
    });
};

const getCrypto = (currency) => {
  axios
    .get(
      `https://api.nomics.com/v1/currencies/ticker?key=376e879a60303749ab7b3b372d85f58f&interval=1d&convert=${currency}&per-page=30&page=1`
    )
    .then((res) => {
      document.querySelector(".loadingIndicator").style.display = "none";
      document.querySelector(".TokenInfos").style.display = "grid";
      document.querySelector(".SearchbarDiv").style.display = "flex";
      document.querySelector(".attribution").style.display = "flex";
      let topFour = res.data.splice(0, 4);
      let rest = res.data;
      topFour.forEach((token) => {
        setTokens(token, "top");
      });
      rest.forEach((token) => {
        setTokens(token, "bottom");
      });
    })
    .catch(() => {
      showError("BrokenAPI");
    });
};

window.onload = () => {
  getCrypto("USD");
};

const changeCurrencyButton = () => {
  if (document.querySelector(".currency").innerHTML === "USD") {
    changeCurrency("EUR");
    currency = "EUR";
    document.querySelector(".currency").innerHTML = currency = "EUR";
  } else {
    changeCurrency("USD");
    currency = "USD";
    document.querySelector(".currency").innerHTML = currency = "USD";
  }
};

document.querySelector(".searchbar").addEventListener("keydown", (e) => {
  if (e.keyCode === 13) {
    if (!(e.target.value === "")) {
      axios
        .get(
          `https://api.nomics.com/v1/currencies/ticker?key=376e879a60303749ab7b3b372d85f58f&ids=${e.target.value}&interval=1d&convert=USD&per-page=1&page=1`
        )
        .then((res) => {
          if (res.data.length == 0) {
            showError("WrongName", e.target.value);
            e.target.value = "";
          } else {
            window.location.href = `/${res.data[0].symbol}`;
            e.target.value = "";
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
});
