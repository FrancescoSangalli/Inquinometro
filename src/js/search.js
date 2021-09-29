import 'jquery';


const info = document.querySelector('.info');
const val = ['Buono', 'Medio', 'Non Consigliabile', 'Basso', 'Molto Basso', 'Pericoloso'];
const api_key = process.env.API_KEY;

function init(inputId, outputId) {
  const input = $(inputId);
  let timer = null;
  const output = $(outputId);

  input.on("keyup", function () {
    $('.stations').css('visibility', 'visible');
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      search(input.val(), output);
    }, 250);
    output.text('');
  });
};

init($('#search-bar'), $('#stations'));

function search(keyword, output) {
  output.append($("<div/>").html("Caricamento..."));
  output.append($("<div/>").addClass("cp-spinner cp-meter"));

  $.getJSON(
    "https://api.waqi.info/search/?token=" + api_key + "&keyword=" + keyword,
    function (result) {
      if (!result || result.status != "ok") {
        output.append("Errore: ");
        if (result.data) output.append($("<code>").html(result.data));
        return;
      }

      if (result.data.length == 0) {
        output.append("Nessun risultato!");
        return;
      }

      let table = $("<table/>").addClass("result");
      output.append(table);

      output.append(
        $("<div/>").html("Clicca sulla stazione per i dettagli")
      );

      let stationInfo = $("<div/>");
      output.append(stationInfo);

      result.data.forEach(function (station, i) {
        let tr = $("<tr class='pointer'>");
        tr.append($("<td>").html(station.station.name));
        tr.append($("<td>").html(colorize(station.aqi)));
        tr.append($("<td>").html(station.time.stime));
        tr.on("click", function () {
          showStation(station, stationInfo);
          output.text('');
          $('.stations').css('visibility', 'hidden');
        });
        table.append(tr);
      });
    }
  );
}

function showStation(station, output) {
  output.append($("<div/>").html("Caricamento..."));
  output.append($("<div/>").addClass("cp-spinner cp-meter"));

  $.getJSON(
    "https://api.waqi.info/feed/@" + station.uid + "/?token=" + api_key,
    function (result) {
      function currentValue(){
        if (result.data.aqi >= 0 && result.data.aqi <= 50) {
          return val[0];
        } else if (result.data.aqi > 50 && result.data.aqi <= 100) {
          return val[1];
        } else if (result.data.aqi > 100 && result.data.aqi <= 150) {
          return val[2];
        } else if (result.data.aqi > 150 && result.data.aqi <= 200) {
          return val[3];
        } else if (result.data.aqi > 200 && result.data.aqi <= 300) {
          return val[4];
        } else {
          return val[5];
        }
      }

      info.innerHTML = `
        <div class="card-body">
          <h5 class="card-title card-title1">${result.data.city.name}</h5>
          <div class="d-flex justify-content-around">
            <h1 class="card-title card-title2">${result.data.aqi}</h1>
            <div>
              <h2 class="card-title card-title3">${currentValue()}</h2>
              <p class="card-text card-date">Aggiornato il: ${result.data.time.s}</p>
              <p class="card-text card-temp">Temperatura: ${Math.round(result.data.iaqi.t.v)}°C</p>
            </div>
          </div>

          <table class="table loc-data">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Media-oggi</th>
                <th scope="col">Min</th>
                <th scope="col">Max</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">pm2.5</th>
                <td>${result.data.forecast.daily.pm25[1].avg}</td>
                <td class="min">${result.data.forecast.daily.pm25[1].min}</td>
                <td class="max">${result.data.forecast.daily.pm25[1].max}</td>
              </tr>
              <tr>
                <th scope="row">pm10</th>
                <td>${result.data.forecast.daily.pm10[1].avg}</td>
                <td class="min">${result.data.forecast.daily.pm10[1].min}</td>
                <td class="max">${result.data.forecast.daily.pm10[1].max}</td>
              </tr>
              <tr>
                <th scope="row">o3</th>
                <td>${result.data.forecast.daily.o3[1].avg}</td>
                <td class="min">${result.data.forecast.daily.o3[1].min}</td>
                <td class="max">${result.data.forecast.daily.o3[1].max}</td>
              </tr>
              <tr>
                <th scope="row">no2</th>
                <td colspan="3">${(!result.data.iaqi.no2) ? '-' : Math.round(result.data.iaqi.no2.v)}</td>
              </tr>
              <tr>
                <th scope="row">Temp</th>
                <td colspan="3">${(!result.data.iaqi.t) ? '-' : Math.round(result.data.iaqi.t.v)}°C</td>
              </tr>
              <tr>
                <th scope="row">Pressione</th>
                <td colspan="3">${(!result.data.iaqi.p) ? '-' : Math.round(result.data.iaqi.p.v)}</td>
              </tr>
              <tr>
                <th scope="row">Umidità</th>
                <td colspan="3">${(!result.data.iaqi.h) ? '-' : Math.round(result.data.iaqi.h.v)}</td>
              </tr>
              <tr>
                <th scope="row">Vento</th>
                <td colspan="3">${(!result.data.iaqi.w) ? '-' : Math.round(result.data.iaqi.w.v)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      const pollutionVal = document.querySelector('.card-title2');
      const pollutionDes = document.querySelector('.card-title3');

      if (pollutionDes.textContent === val[0]) {
        pollutionVal.classList.add('bg-success');
        pollutionDes.classList.add('text-success');
      } else if (pollutionDes.textContent === val[1]) {
        pollutionVal.classList.add('bg-primary');
        pollutionDes.classList.add('text-primary');
      } else if (pollutionDes.textContent === val[2]) {
        pollutionVal.classList.add('bg-secondary');
        pollutionDes.classList.add('text-secondary');
      } else if (pollutionDes.textContent === val[3]) {
        pollutionVal.classList.add('bg-warning');
        pollutionDes.classList.add('text-warning');
        pollutionVal.style.color = '#000';
      } else if (pollutionDes.textContent === val[4]) {
        pollutionVal.classList.add('bg-danger');
        pollutionDes.classList.add('text-danger');
      } else {
        pollutionVal.classList.add('bg-dark');
        pollutionDes.classList.add('text-dark');
      }

      info.style.visibility = 'visible';
    }
  );
}

function colorize(aqi, specie) {
  specie = specie || "aqi";
  if (["pm25", "pm10", "no2", "so2", "co", "o3", "aqi"].indexOf(specie) < 0)
    return aqi;

  let spectrum = [
    { a: 0, b: "#cccccc", f: "#ffffff" },
    { a: 50, b: "#198754", f: "#ffffff" },
    { a: 100, b: "#0d6efd", f: "#ffffff" },
    { a: 150, b: "#adb5bd", f: "#ffffff" },
    { a: 200, b: "#ffc107", f: "#000000" },
    { a: 300, b: "#dc3545", f: "#ffffff" },
    { a: 800, b: "#000000", f: "#ffffff" },
  ];

  let i = 0;
  for (i = 0; i < spectrum.length - 1; i++) {
    if (aqi == "-" || aqi <= spectrum[i].a) break;
  }
  return $("<div/>")
    .html(aqi)
    .css("font-size", "120%")
    .css("min-width", "30px")
    .css("text-align", "center")
    .css("background-color", spectrum[i].b)
    .css("color", spectrum[i].f);
}
