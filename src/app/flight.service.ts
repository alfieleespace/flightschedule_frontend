import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight } from './flight';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public getFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${this.apiUrl}/flight/all`)
  }

  public addFlight(flight: Flight): Observable<Flight> {
    return this.http.post<Flight>(`${this.apiUrl}/flight/add`, flight);
  }

  public updateFlight(flight: Flight): Observable<Flight> {
    return this.http.put<Flight>(`${this.apiUrl}/flight/update`, flight);
  }

  public deleteFlight(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/flight/delete/${id}`);
  }
}
