import 'bootstrap/dist/css/bootstrap.min.css';
import { Tooltip, Toast, Popover } from 'bootstrap';
import '../css/style.css';

const time = document.querySelector('.time');
const geoloc = document.querySelector('.geolocation');
const searchSec = document.querySelector('.search');
const info = document.querySelector('.info');
const val = ['Buono', 'Medio', 'Non Consigliabile', 'Basso', 'Molto Basso', 'Pericoloso'];
const api_key = process.env.API_KEY;

function getCurrentTime() {
  const date = new Date();
  time.textContent = date.toLocaleTimeString('it-IT', {timeStyle: 'short'});
}

setInterval(getCurrentTime, 1000);

geoloc.addEventListener('click', function () {
  navigator.geolocation.getCurrentPosition(position => {
    fetch(`https://api.waqi.info/feed/here/?token=${api_key}`)
      .then(res => {
        if (!res.status === "ok") {
          throw new Error("Dati non trovati");
        }
        return res.json();
      })
      .then(data => {
        function currentValue(){
          if (data.data.aqi >= 0 && data.data.aqi <= 50) {
            return val[0];
          } else if (data.data.aqi > 50 && data.data.aqi <= 100) {
            return val[1];
          } else if (data.data.aqi > 100 && data.data.aqi <= 150) {
            return val[2];
          } else if (data.data.aqi > 150 && data.data.aqi <= 200) {
            return val[3];
          } else if (data.data.aqi > 200 && data.data.aqi <= 300) {
            return val[4];
          } else {
            return val[5];
          }
        }

        info.innerHTML = `
          <div class="card-body">
            <h5 class="card-title card-title1">${data.data.city.name}</h5>
            <div class="d-flex justify-content-around">
              <h1 class="card-title card-title2">${data.data.aqi}</h1>
              <div>
                <h2 class="card-title card-title3">${currentValue()}</h2>
                <p class="card-text card-date">Aggiornato il: ${data.data.time.s}</p>
                <p class="card-text card-temp">Temperatura: ${Math.round(data.data.iaqi.t.v)}°C</p>
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
                  <td>${data.data.forecast.daily.pm25[1].avg}</td>
                  <td class="min">${data.data.forecast.daily.pm25[1].min}</td>
                  <td class="max">${data.data.forecast.daily.pm25[1].max}</td>
                </tr>
                <tr>
                  <th scope="row">pm10</th>
                  <td>${data.data.forecast.daily.pm10[1].avg}</td>
                  <td class="min">${data.data.forecast.daily.pm10[1].min}</td>
                  <td class="max">${data.data.forecast.daily.pm10[1].max}</td>
                </tr>
                <tr>
                  <th scope="row">o3</th>
                  <td>${data.data.forecast.daily.o3[1].avg}</td>
                  <td class="min">${data.data.forecast.daily.o3[1].min}</td>
                  <td class="max">${data.data.forecast.daily.o3[1].max}</td>
                </tr>
                <tr>
                  <th scope="row">no2</th>
                  <td colspan="3">${(!data.data.iaqi.no2) ? '-' : Math.round(data.data.iaqi.no2.v)}</td>
                </tr>
                <tr>
                  <th scope="row">Temp</th>
                  <td colspan="3">${(!data.data.iaqi.t) ? '-' : Math.round(data.data.iaqi.t.v)}°C</td>
                </tr>
                <tr>
                  <th scope="row">Pressione</th>
                  <td colspan="3">${(!data.data.iaqi.p) ? '-' : Math.round(data.data.iaqi.p.v)}</td>
                </tr>
                <tr>
                  <th scope="row">Umidità</th>
                  <td colspan="3">${(!data.data.iaqi.h) ? '-' : Math.round(data.data.iaqi.h.v)}</td>
                </tr>
                <tr>
                  <th scope="row">Vento</th>
                  <td colspan="3">${(!data.data.iaqi.w) ? '-' : Math.round(data.data.iaqi.w.v)}</td>
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
        document.querySelector('.stations').textContent = '';
        document.querySelector('.stations').style.visibility = 'hidden';
      })
      .catch(err => {
        console.error(err);
        searchSec.innerHTML += `
          <p class="err-data">${err}</p>
        `
      });
  });
});
