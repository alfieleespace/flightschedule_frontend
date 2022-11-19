export class Flight {
    constructor(public id: number = 0, public arrivalAirport: string = '', public callsign: string = '', 
    public departureAirport: string = '', public distanceFromDepartureAirport: number = 0, 
    public distanceFromＡrrivalAirport: number = 0, public timeOfArrival: Date = new Date(), public timeOfDeparture: Date = new Date(),
    public returnFlight: boolean = true
        ) {
        this.id = id;
        this.arrivalAirport = arrivalAirport;
        this.callsign = callsign;
        this.departureAirport = departureAirport;
        this.distanceFromDepartureAirport = distanceFromDepartureAirport;
        this.distanceFromＡrrivalAirport = distanceFromＡrrivalAirport;
        this.timeOfArrival = timeOfArrival;
        this.timeOfDeparture = timeOfDeparture;
        this.returnFlight = returnFlight;
    }
}