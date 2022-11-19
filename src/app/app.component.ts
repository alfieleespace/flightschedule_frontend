import { FlightRaw } from './flight.raw';
import { FlightService } from './flight.service';
import { Component, OnInit } from '@angular/core';
import { Flight } from './flight';
import { HttpErrorResponse } from '@angular/common/http';
import airportsJson from '../assets/airports.json';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { StarAlliance } from './starAlliance';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'flightschedule_frontend';
  minDate: string = '';
  maxDate: string = '';
  departureDate: Date = new Date();
  returnDate: Date = new Date(new Date().setDate(new Date().getDate() + 7));
  editDate: Date = new Date();
  // Variable flights stores data comes from my backend 
  flights: Array<Flight> = [];
  editFlight: Flight = new Flight();
  deleteFlight: Flight = new Flight();
  // Variable allDepartureFlightsRaw and allReturnFlightsRaw store raw data comes from the opensky network API 
  allDepartureFlightsRaw: Array<FlightRaw> = [];
  allReturnFlightsRaw: Array<FlightRaw> = [];
  departureFlightsRaw: Array<FlightRaw> = [];
  returnFlightsRaw: Array<FlightRaw> = [];
  destination: string = '';
  departIndex: string = '-1';
  returnIndex: string = '-1';
  editIndex: string = '-1';
  airline: string = 'evaAir';
  travelType: string = 'roundtrip';
  returnDisabled: boolean = true;
  isOneWay: boolean = false;
  submissionDisabled: boolean = true;
  hasNoDepFlight: boolean = false;
  hasNoRetFlight: boolean = false;

  // In order to access the flight service, we need to inject it here
  constructor(private flightService: FlightService, private cdr: ChangeDetectorRef) {
    this.cdr.detach()
  }

  // Function getFlights is going to run whenever this component is initialized
  ngOnInit(): void {
    let minArr: Array<string> = new Date().toLocaleString().split(/\D/);
    this.minDate = `${minArr[2]}-${minArr[0]}-${minArr[1]}`;
    let maxArr: Array<string> = new Date(new Date().setMonth(new Date().getMonth() + 2)).toLocaleString().split(/\D/);
    this.maxDate = `${maxArr[2]}-${maxArr[0]}-${maxArr[1]}`;
    this.getFlights();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  // Use subscribe so we can be notified whenever server sends back the response
  public getFlights(): void {
    this.flightService.getFlights().subscribe(
      (response: Flight[]) => {
        this.flights = response;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    )
  }

  // Using Fetch to get Data from a public API called The OpenSky Network
  // json() takes the Response object and parses the body part's text as JSON https://developer.mozilla.org/en-US/docs/Web/API/Response/json
  public getDepartureFlights(airportIcao: string, mode: string) {
    this.departIndex = '-1';
    this.editIndex = '-1';
    this.submissionDisabled = true;
    // console.log('getDepartureFlights()');
    let date = new Date();
    let departureDate: Date = new Date();

    if (mode === 'edit') {
      (document.querySelector('.optionSelected') as HTMLOptionElement).textContent = '';
      departureDate = new Date(this.editDate);
    } else {
      departureDate = new Date(this.departureDate);
    }

    let day: number = departureDate.getDay();
    date.setDate(date.getDate() - (6 - day) - date.getDay() - 1);
    let begin: number = Math.trunc(date.setHours(0, 0, 0, 0) / 1000) - 86400 * 21;
    let end: number = Math.trunc(date.setHours(23, 59, 59, 999) / 1000) - 86400 * 21;;
    console.log(`https://opensky-network.org/api/flights/departure?airport=${airportIcao}&begin=${begin}&end=${end}`);
    fetch(`https://opensky-network.org/api/flights/departure?airport=${airportIcao}&begin=${begin}&end=${end}`)
      .then((response) => response.json())
      .then(
        (data) => {
          this.allDepartureFlightsRaw = [];
          for (let x of data) {
            if (x.estArrivalAirport !== null) {
              this.allDepartureFlightsRaw.push(x);
            }
          }
          if (this.airline === 'evaAir') {
            this.departureFlightsRaw = this.getEvaFlights(this.allDepartureFlightsRaw);
          } else if (this.airline === 'starAlliance') {
            this.departureFlightsRaw = this.getStarAllianceFLights(this.allDepartureFlightsRaw)
          } else {
            this.departureFlightsRaw = this.allDepartureFlightsRaw;
          }

          // console.log(this.departureFlightsRaw);

          if (this.departureFlightsRaw.length === 0) {
            this.hasNoDepFlight = true;
            this.submissionDisabled = true;
          } else {
            this.hasNoDepFlight = false;
          }
        })
  }

  public getReturnFlights() {
    this.returnIndex = '-1';
    if (!this.isOneWay) {
      let returnDate = new Date(this.returnDate);
      // console.log(returnDate);
      let date = new Date();
      let day = returnDate.getDay()
      date.setDate(date.getDate() - (6 - day) - date.getDay() - 1);
      let begin: number = Math.trunc(date.setHours(0, 0, 0, 0) / 1000 - 86400 * 21);
      let end: number = Math.trunc(date.setHours(23, 59, 59, 999) / 1000) - 86400 * 21;
      let destination = this.departureFlightsRaw[Number(this.departIndex)].estArrivalAirport;
      console.log('getReturnFlights()');
      console.log(`https://opensky-network.org/api/flights/departure?airport=${destination}&begin=${begin}&end=${end}`);
      fetch(`https://opensky-network.org/api/flights/departure?airport=${destination}&begin=${begin}&end=${end}`)
        .then((response) => response.json())
        .then(
          (data) => {
            if (this.allReturnFlightsRaw.length !== 0) {
              this.allReturnFlightsRaw = [];
            }

            for (let x of data) {
              if (x.estArrivalAirport == 'RCTP' && x.estArrivalAirport !== null) {
                this.allReturnFlightsRaw.push(x)
              }
            }

            if (this.airline === 'evaAir') {
              this.returnFlightsRaw = this.getEvaFlights(this.allReturnFlightsRaw);
            } else if (this.airline === 'starAlliance') {
              this.returnFlightsRaw = this.getStarAllianceFLights(this.allReturnFlightsRaw)
            } else {
              this.returnFlightsRaw = this.allReturnFlightsRaw;
            }

            console.log(this.returnFlightsRaw);

            if (this.returnFlightsRaw.length === 0) {
              this.hasNoRetFlight = true;
              this.submissionDisabled = true;
            } else {
              this.hasNoRetFlight = false;
            }
          })
      // whenever a property in a component changes, the view is rendered to reflect the change
      this.returnDisabled = false;
    } else {
      this.submissionDisabled = false;
    }
  }

  public showModal(flight: any, mode: string): void {
    const container = document.querySelector('.container');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-bs-toggle', 'modal');
    if (mode === 'add') {
      this.getDepartureFlights('RCTP', mode);
      button.setAttribute('data-bs-target', '#addFlightModal');
    } else if (mode === 'edit') {
      this.editFlight = flight;
      this.getDepartureFlights(this.editFlight.departureAirport, mode);
      this.editDate = new Date(this.editFlight.timeOfDeparture);
      (document.querySelector('.optionSelected') as HTMLOptionElement).textContent = this.formatCallsign(this.editFlight.callsign);
      // console.log(flight);
      if (this.editFlight.callsign.indexOf('EVA') === -1) {
        let starAlliance: Array<string> = Object.values(StarAlliance);
          for (let icao of starAlliance) {
            if (this.editFlight.callsign.indexOf(icao) !== -1) {
              this.airline = 'starAlliance';
            } else {
              this.airline = 'all';
            }
          }
      }
      button.setAttribute('data-bs-target', '#editFlightModal');
    } else {
      this.deleteFlight = flight;
      button.setAttribute('data-bs-target', '#deleteFlightModal');
    }
    container?.appendChild(button);
    button.click();
  }

  // Value on the form will be JSON representation of every single one of those inputs 
  public onAddFlight(addForm: NgForm): void {
    let departureDate = new Date(this.departureDate);
    let selectedDepart: FlightRaw = this.departureFlightsRaw[Number(this.departIndex)];
    console.log("selectedDepart:");
    console.log(selectedDepart);
    let departDiff = Math.ceil((departureDate.getTime() / 1000 - selectedDepart.firstSeen) / 86400);
    departDiff = departDiff > 29 ? departDiff : 28;
    console.log(departDiff);
    let lastSeen = new Date((selectedDepart.lastSeen + 86400 * departDiff) * 1000);
    let firstSeen = new Date((selectedDepart.firstSeen + 86400 * departDiff) * 1000);
    lastSeen.setDate(lastSeen.getDate());
    firstSeen.setDate(firstSeen.getDate());

    let depart: Flight = new Flight(0, selectedDepart.estArrivalAirport, selectedDepart.callsign, selectedDepart.estDepartureAirport,
      selectedDepart.estDepartureAirportHorizDistance, selectedDepart.estArrivalAirportHorizDistance, lastSeen, firstSeen, false);

      console.log("depart:");
      console.log(depart);

    if (!this.isOneWay) {
      let returnDate = new Date(this.returnDate);
      let returnSelected: FlightRaw = this.returnFlightsRaw[Number(this.returnIndex)];
      let returnDiff = Math.ceil((returnDate.getTime() / 1000 - returnSelected.firstSeen) / 86400);
      let returnLastSeen = new Date((returnSelected.lastSeen + 86400 * returnDiff) * 1000);
      let returnFirstSeen = new Date((returnSelected.firstSeen + 86400 * returnDiff) * 1000);
      returnLastSeen.setDate(returnLastSeen.getDate());
      returnFirstSeen.setDate(returnFirstSeen.getDate());

      let ret: Flight = new Flight(0, returnSelected.estArrivalAirport, returnSelected.callsign, returnSelected.estDepartureAirport,
        returnSelected.estDepartureAirportHorizDistance, returnSelected.estArrivalAirportHorizDistance, returnLastSeen, returnFirstSeen, true);
      // console.log('ret');
      // console.log(ret);

      this.flightService.addFlight(depart).subscribe(
        (response: Flight) => {
          // console.log(response);
          this.flightService.addFlight(ret).subscribe(
            (response: Flight) => {
              // console.log(response);
              this.getFlights();
            },
            (error: HttpErrorResponse) => {
              console.log(error.message)
            }
          )
        },
        (error: HttpErrorResponse) => {
          console.log(error.message)
        }
      )
    } else {
      this.flightService.addFlight(depart).subscribe(
        (response: Flight) => {
          // console.log(response);
          this.getFlights();
        },
        (error: HttpErrorResponse) => {
          console.log(error.message)
        }
      )
    }
    (document.querySelector('.addClose') as HTMLInputElement).click();
  }

  public onUpdateFlight(flight: any): void {
    let editDate = new Date(this.editDate);
    let selected: FlightRaw = this.departureFlightsRaw[Number(this.editIndex)];
    let diff = Math.ceil((editDate.getTime() / 1000 - selected.firstSeen) / 86400);
    let lastSeen = new Date((selected.lastSeen + 86400 * diff) * 1000);
    let firstSeen = new Date((selected.firstSeen + 86400 * diff) * 1000);

    let edit: Flight = new Flight(this.editFlight.id, selected.estArrivalAirport, selected.callsign, selected.estDepartureAirport,
      selected.estDepartureAirportHorizDistance, selected.estArrivalAirportHorizDistance, lastSeen, firstSeen, this.editFlight.returnFlight);

    this.flightService.updateFlight(edit).subscribe(
      (response: Flight) => {
        // console.log(response);
        this.getFlights();
      },
      (error: HttpErrorResponse) => {
        console.log(error.message)
      }
    );
    (document.querySelector('.editClose') as HTMLInputElement).click();
  }

  public onDeleteFlight(id: number): void {
    this.flightService.deleteFlight(id).subscribe(
      (response: void) => {
        this.getFlights();
      },
      (error: HttpErrorResponse) => {
        console.log(error.message)
      }
    )
  }

  public searchFlights(key: string): void {
    let result: Flight[] = [];
    for (let flight of this.flights) {
      if (flight.arrivalAirport.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
        flight.callsign.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
        flight.departureAirport.toLowerCase().indexOf(key.toLowerCase()) !== -1
      ) {
        result.push(flight);
      }
    }
    this.flights = result;
    if (result.length === 0 || !key) {
      this.getFlights();
    }
  }

  public onTravelTypeChange(e: any) {
    // console.log(' Value is : ', e.target.value);
    if (e.target.value === 'oneWay') {
      this.isOneWay = true;
      this.returnDisabled = true;
      if (this.departIndex !== '-1') {
        this.submissionDisabled = false;
      }
      (document.querySelector('.returnLabel') as HTMLInputElement).style.color = 'rgba(0,0,0,.38)';
    } else {
      this.isOneWay = false;
      this.returnDisabled = false;
      if (this.departIndex !== '-1') {
        this.getReturnFlights();
      }
      (document.querySelector('.returnLabel') as HTMLInputElement).style.color = 'rgba(33, 37, 34)';
    }
  }

  public onAirlineChange(airportIcao: string, e: any, mode: string) {
    // console.log(' Value is : ', e.target.value);
    if (e.target.value === 'evaAir') {
      this.getDepartureFlights(airportIcao, mode);
      this.departIndex = '-1';
      this.returnIndex = '-1';
      this.returnDisabled = true;
      this.submissionDisabled = true;
      this.returnDate = new Date(new Date().setDate(new Date().getDate() + 7));
    } else if (e.target.value === 'starAlliance') {
      this.getDepartureFlights(airportIcao, mode);
      this.departIndex = '-1';
      this.returnIndex = '-1';
      this.returnDisabled = true;
      this.submissionDisabled = true;
      this.returnDate = new Date(new Date().setDate(new Date().getDate() + 7));
    } else {
      this.getDepartureFlights(airportIcao, mode);
      this.departIndex = '-1';
      this.returnIndex = '-1';
      this.returnDisabled = true;
      this.submissionDisabled = true;
      this.returnDate = new Date(new Date().setDate(new Date().getDate() + 7));
    }
  }

  public getEvaFlights(allFlightsRaw: FlightRaw[]): Array<FlightRaw> {
    let result: FlightRaw[] = [];
    for (let flight of allFlightsRaw) {
      if (flight.callsign?.indexOf('EVA') !== -1) {
        result.push(flight);
      }
    }
    return result;
  }

  public getStarAllianceFLights(allFlightsRaw: FlightRaw[]): Array<FlightRaw> {
    let starAlliance: Array<string> = Object.values(StarAlliance);
    let result: FlightRaw[] = [];
    for (let flight of allFlightsRaw) {
      for (let icao of starAlliance) {
        if (flight.callsign.indexOf(icao) !== -1) {
          result.push(flight);
        }
      }
    }
    return result;
  }

  public reset(form: NgForm) {
    form.resetForm();
    this.airline = 'evaAir';
    this.isOneWay = false;
    this.returnDisabled = true;
    this.submissionDisabled = true;
    this.departureDate = new Date();
    this.returnDate = new Date(new Date().setDate(new Date().getDate() + 7));
    (document.getElementById('roundtrip') as HTMLInputElement).checked = true;
    (document.getElementById('oneWay') as HTMLInputElement).checked = false;
    (document.querySelector('.returnLabel') as HTMLInputElement).style.color = 'rgba(33, 37, 34)';
    (document.getElementById('evaAir') as HTMLInputElement).checked = true;
    (document.getElementById('starAlliance') as HTMLInputElement).checked = false;
    (document.getElementById('all') as HTMLInputElement).checked = false;
  }

  public getAirportInfoByIcao(icao: string) {
    let prop: string = icao;
    // https://stackoverflow.com/questions/57086672/element-implicitly-has-an-any-type-because-expression-of-type-string-cant-b
    return airportsJson[icao as keyof typeof airportsJson];
  }

  public formatCallsign(callsign: string): string {
    return callsign?.split(/(?=.{5}$)/).join(' ');
  }

  public formatUnixtime(time: number): Date {
    let result: Date = new Date(time * 1000);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  public formatDate(date: Date): string {
    return new Date(date).toDateString();
  }

  public formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString(undefined, { timeZoneName: 'short' });
  }

  public removeSpace(str: string): string {
    return str.replace(/\s/g, '');
  }

  public enableSubmission(): void {
    this.submissionDisabled = false;
  }

  public getTravelTime(timeOfDeparture: Date, timeOfArrival: Date): string {
    let hours = Math.floor(Math.abs((new Date(timeOfArrival)).getTime() - (new Date(timeOfDeparture)).getTime()) / 36e5);
    let minutes = Math.floor(Math.abs((new Date(timeOfArrival)).getTime() - (new Date(timeOfDeparture)).getTime()) % 36e5 / 6e4);
    return `${hours}h ${minutes}m total`
  }
}



