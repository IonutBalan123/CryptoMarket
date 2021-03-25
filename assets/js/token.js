const ctx = document.getElementById("myChart").getContext("2d");

const currencySpan = document.querySelector(".currency");

const tokenImage = document.querySelector(".TokenImage");
const tokenName = document.querySelector(".TokenName");
const tokenSymbol = document.querySelector(".TokenSymbol");
const tokenPrice = document.querySelector(".TokenPrice");
const tokenCurrency = document.querySelector(".TokenCurrency");

const tokenMarketCap = document.querySelector(".marketCap");
const tokenMarketCapTransformed = document.querySelector(
  ".marketCapTransformed"
);
const tokenVolume = document.querySelector(".volume");
const tokenSupply = document.querySelector(".supply");
const tokenMaxSupply = document.querySelector(".maxSupply");

let myChart;
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
    document.querySelector(".loadingIndicator").style.display = "none";
  }, 2000);
};
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
const getGraph = (token) => {
  axios
    .get(
      `https://api.nomics.com/v1/currencies/sparkline?key=376e879a60303749ab7b3b372d85f58f&ids=${token}&start=2020-04-14T00%3A00%3A00Z`
    )
    .then((res) => {
      document.querySelector(".loadingIndicator").style.display = "none";
      let filteredTimestamps = res.data[0].timestamps
        .filter(function (element, index, array) {
          return index % 2 === 0;
        })
        .map((time) =>
          new Date(time).toDateString().split(" ").slice(1).join(" ")
        );

      let filteredPrices = res.data[0].prices
        .filter(function (element, index, array) {
          return index % 2 === 0;
        })
        .map((price) => {
          if (parseFloat(price) > 5) {
            return parseFloat(price).toFixed(2);
          } else {
            return parseFloat(price).toFixed(3);
          }
        });

      myChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: filteredTimestamps,
          datasets: [
            {
              label: "Price",
              data: filteredPrices,
              backgroundColor: "transparent",
              borderColor: "white",
              borderWidth: 1,
              color: "white",
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
          legend: {
            display: false,
          },
          scales: {
            yAxes: [
              {
                gridLines: {
                  color: "grey",
                },
              },
            ],
            xAxes: [
              {
                gridLines: {
                  color: "transparent",
                },
              },
            ],
          },
          elements: {
            point: {
              radius: 2,
            },
          },
        },
      });
    })
    .catch((err) => {
      if (err.message === "Cannot read property 'timestamps' of undefined") {
        console.log("token does not exist");
      }
      showError("BrokenAPI");
    });
};

const getTokenData = (token, theCurrency) => {
  axios
    .get(
      `https://api.nomics.com/v1/currencies/ticker?key=376e879a60303749ab7b3b372d85f58f&ids=${token}&interval=1d,30d&convert=${theCurrency}&per-page=100&page=1`
    )
    .then((res) => {
      tokenImage.src = res.data[0].logo_url;
      if (res.data[0].name === "Ethereum") {
        if (window.innerWidth >= 600) {
          tokenImage.style.width = "60px";
        } else {
          tokenImage.style.width = "45px";
        }
      }
      tokenName.innerText = res.data[0].name;
      tokenSymbol.innerText = res.data[0].currency;
      tokenPrice.innerText =
        numberWithCommas(parseFloat(res.data[0].price).toFixed(2)) +
        `${theCurrency === "USD" ? "$" : "€"}`;
      tokenMarketCap.innerText = numberWithCommas(
        parseFloat(res.data[0].market_cap) +
          `${theCurrency === "USD" ? "$" : "€"}`
      );
      tokenMarketCapTransformed.innerText = `(${convertToInternationalCurrencySystem(
        res.data[0].market_cap
      )} ${theCurrency === "USD" ? "$" : "€"})`;

      tokenVolume.innerText = convertToInternationalCurrencySystem(
        res.data[0]["1d"].volume
      );
      tokenSupply.innerText = convertToInternationalCurrencySystem(
        res.data[0].circulating_supply
      );
      tokenMaxSupply.innerText = convertToInternationalCurrencySystem(
        res.data[0].max_supply
      );
    })
    .catch((err) => {
      showError("BrokenAPI");
    });
};

window.onload = () => {
  let timeout = setTimeout(() => {
    getGraph(document.title);
    clearTimeout(timeout);
  }, 100);
  getTokenData(document.title, "USD");
};
const changeCurrencyButton = () => {
  document.querySelector(".chartWarning").style.display = "block";
  let timer = setTimeout(() => {
    clearTimeout(timer);
    document.querySelector(".chartWarning").style.display = "none";
  }, 1500);
  if (currencySpan.innerText === "USD") {
    getTokenData(document.title, "EUR");
    currencySpan.innerText = "EUR";
  } else {
    getTokenData(document.title, "USD");
    currencySpan.innerText = "USD";
  }
};
// myChart = new Chart(ctx, {
//   type: "line",
//   data: {
//     labels: [],
//     datasets: [
//       {
//         label: "Price",
//         data: [],
//         backgroundColor: "transparent",
//         borderColor: "#1f3447",
//         borderWidth: 1,
//       },
//     ],
//   },
//   options: {
//     maintainAspectRatio: false,
//     responsive: true,
//     scales: {
//       yAxes: [
//         {
//           ticks: {
//             beginAtZero: true,
//           },
//         },
//       ],
//     },
//     legend: {
//       display: false,
//     },
//   },
// });

//get main info, image, current price...

// axios
//   .get(
//     `https://api.nomics.com/v1/currencies/ticker?key=376e879a60303749ab7b3b372d85f58f&ids=ADA&interval=1d,30d&convert=USD&per-page=100&page=1`
//   )
//   .then((res) => {
//     console.log(res.data);
//   });
