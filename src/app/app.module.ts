import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

// ng add @angular/material
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// npm i @angular/material-moment-adapter
import { MatMomentDateModule } from '@angular/material-moment-adapter';
// npm i @angular/material-date-fns-adapter
import {MatDateFnsModule} from '@angular/material-date-fns-adapter';
// npm i @angular/material-luxon-adapter
// npm i --save-dev @types/luxon
import {MatLuxonDateModule} from '@angular/material-luxon-adapter';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatMomentDateModule,
    MatDateFnsModule,
    MatLuxonDateModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
