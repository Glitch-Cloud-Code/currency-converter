import { Component, OnInit } from "@angular/core";
import { CurrencyService } from "src/app/services/currency.service";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
} from "@angular/forms";
import { Symbols } from "src/app/enums/symbols";
import { isNullOrUndefined } from "util";
import { Observable } from "rxjs";
import { startWith, map, debounceTime } from "rxjs/operators";

declare var Plotly: any;

@Component({
  selector: "app-value-over-time",
  templateUrl: "./value-over-time.component.html",
  styleUrls: ["./value-over-time.component.scss"],
})
export class ValueOverTimeComponent implements OnInit {
  constructor(private currencyService: CurrencyService) {}

  //Variables
  private symbols = Symbols;
  graphData = [];
  graphLayout = { title: "Rate changes over time" };
  graphConfig = { displayModeBar: false, responsive: true };
  errorMessage = "";
  firstSymbolFilteredOptions: Observable<string[]>;
  secondSymbolFilteredOptions: Observable<string[]>;
  currentDate = new Date();


  //Form controls
  overTimeForm = new FormGroup({
    firstSymbol: new FormControl(Symbols.USD, [
      Validators.required,
      this._symbolValidator(this.symbols),
    ]),
    secondSymbol: new FormControl(Symbols.GBP, [
      Validators.required,
      this._symbolValidator(this.symbols),
    ]),
    startDate: new FormControl(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate() - 7 //One week ago
      ),
      this._datesValidator() //Current date
    ),
    endDate: new FormControl(new Date(), this._datesValidator()),
  });

  //Outputting this to separate variable to avoid unnecessary code repetitions
  formControls = this.overTimeForm.controls;

  ngOnInit(): void {
    //Autocompletes
    this.firstSymbolFilteredOptions = this.formControls[
      "firstSymbol"
    ].valueChanges.pipe(
      startWith(""),
      map((value) => this._optionsFilter(value))
    );

    this.secondSymbolFilteredOptions = this.formControls[
      "secondSymbol"
    ].valueChanges.pipe(
      startWith(""),
      map((value) => this._optionsFilter(value))
    );

    //Subscribing to form changes in order to update the data
    this.overTimeForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe((newValue) => {
        if (this.overTimeForm.status != "INVALID") {
          this._getRatesAndBuildGraph();
        }
      });
    this._getRatesAndBuildGraph();
  }

  //Filer for autocomplete in currency selects
  private _optionsFilter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.symbols).filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    );
  }

  //Takes response from the API, sorts data by date and transforms it into object for plotly graph
  private _transformToGraphData(response) {
    const rates = response.rates;
    let sortedRates = {};
    let graphs = {};
    //Data sorting
    Object.keys(rates)
      .sort()
      .forEach(function (key) {
        sortedRates[key] = rates[key];
      });
    for (const date of Object.keys(sortedRates)) {
      for (const base of Object.keys(sortedRates[date])) {
        if (!graphs.hasOwnProperty(base)) {
          graphs[base] = {
            x: [],
            y: [],
            type: "scatter",
            mode: "lines+points",
            name: base,
          };
        }
        graphs[base].x.push(date);
        graphs[base].y.push(sortedRates[date][base]);
      }
    }
    return Object.values(graphs);
  }

  //Validator for currncy type inputs
  private _symbolValidator(allSymbols: any): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (isNullOrUndefined(control.value) || control.value === "") {
        return null;
      }
      if (
        this.overTimeForm &&
        this.formControls["firstSymbol"].value ===
          this.formControls["secondSymbol"].value
      ) {
        return { equalSymbols: control.value };
      }
      const symbol = control.value;
      return Object.keys(this.symbols).includes(symbol)
        ? null
        : { unknownSymbol: { value: control.value } };
    };
  }

  //Validator for dates input.
  private _datesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (isNullOrUndefined(control.value) || control.value === "") {
        return null;
      }
      if (control.value > new Date()) {
        return { invalidDate: control.value };
      }
      if (control.value <= new Date(1998, 11, 31)) {
        return { invalidDate: control.value };
      }
      if (
        this.overTimeForm &&
        this.formControls["startDate"].value >
          this.formControls["endDate"].value
      ) {
        return { endDateBeforeStartDate: control.value };
      }

      return null;
    };
  }

  //Filter for endDate input
  public endDatesFilter = (d: Date | null): boolean => {
    if (d > new Date()) {
      return false;
    }
    if (d <= new Date(1998, 11, 31)) {
      return false;
    }
    if (d < this.formControls["startDate"].value) {
      return false;
    }
    return true;
  };
 //Filter for startDate input
  public startDatesFilter = (d: Date | null): boolean => {
    if (d > new Date()) {
      return false;
    }
    if (d <= new Date(1998, 11, 31)) {
      return false;
    }
    if (d > this.formControls["endDate"].value) {
      return false;
    }
    return true;
  };

  //Requests new rates from the API, transforms this data and redraws plotly graph
  private _getRatesAndBuildGraph() {
    this.currencyService
      .getComparison(
        this.formControls["firstSymbol"].value,
        this.formControls["secondSymbol"].value,
        this.formControls["startDate"].value,
        this.formControls["endDate"].value
      )
      .subscribe(
        (success) => {
          this.graphData = this._transformToGraphData(success);
          Plotly.newPlot(
            "graph",
            this.graphData,
            this.graphLayout,
            this.graphConfig
          );
          this.errorMessage = "";
        },
        (error) => {
          this.errorMessage = error.message;
        }
      );
  }
}
