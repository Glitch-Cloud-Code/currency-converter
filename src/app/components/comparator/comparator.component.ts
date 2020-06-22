import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  Validators,
  FormGroup,
  ValidatorFn,
  AbstractControl,
} from "@angular/forms";
import { Observable, merge } from "rxjs";
import { map, startWith, debounceTime } from "rxjs/operators";
import { CurrencyService } from "../../services/currency.service";
import { Symbols } from "src/app/enums/symbols";
import { isNullOrUndefined } from "util";

@Component({
  selector: "app-comparator",
  templateUrl: "./comparator.component.html",
  styleUrls: ["./comparator.component.scss"],
})
export class ComparatorComponent implements OnInit {

  //Variables
  symbols = Symbols;
  filteredOptions: Observable<string[]>;
  ratesResponse: {
    base: string;
    date: string;
    rates: any;
  };
  errorMessage = "";
  calculatedValues: { symbol: string; value: string }[];

  //Input form controls
  comparatorForm = new FormGroup({
    symbol: new FormControl(Symbols.EUR, [
      Validators.required,
      this._symbolValidator(this.symbols),
    ]),
    amount: new FormControl(1, [Validators.required, this._amountValidator()]),
    date: new FormControl(new Date(), this._datesValidator()),
  });

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    //Autocomplete for currency type input
    this.filteredOptions = this.comparatorForm.controls[
      "symbol"
    ].valueChanges.pipe(
      startWith(""),
      map((value) => this._optionsFilter(value))
    );

    //Initial reqest for rates data
    this._getRates(this.comparatorForm.get("symbol").value).add(() => {
      this.recalculate();
    });

    //Subscribe to currency amount changes with debounce time of 300ms
    this.comparatorForm
      .get("amount")
      .valueChanges.pipe(debounceTime(300))
      .subscribe((newValue) => {
        this.recalculate();
      });

    merge(
      this.comparatorForm.get("symbol").valueChanges,
      this.comparatorForm.get("date").valueChanges
    )
      .pipe(debounceTime(300))
      .subscribe((newValue) => {
        if (this.comparatorForm.status != "INVALID") {
          this._getRates(this.comparatorForm.get("symbol").value).add(() => {
            this.recalculate();
          });
        }
      });
  }

  //Validator for currency type input
  private _symbolValidator(allSymbols: any): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (isNullOrUndefined(control.value) || control.value === "") {
        return null;
      }
      const symbol = control.value;
      return Object.keys(this.symbols).includes(symbol)
        ? null
        : { unknownSymbol: { value: control.value } };
    };
  }

  //Validator for currncy amount input
  private _amountValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (isNullOrUndefined(control.value) || control.value === "") {
        return null;
      }
      return isNaN(control.value) ? { notNumeric: control.value } : null;
    };
  }

  //Filter for currency type input autocomplete
  private _optionsFilter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.symbols).filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    );
  }

  //Validator for the date input
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
      return null;
    };
  }

  //Filter for date input
  public datesFilter = (d: Date | null): boolean => {
    if (d > new Date()) {
      return false;
    }
    if (d <= new Date(1998, 11, 31)) {
      return false;
    }
    return true;
  };

  //Requests rates data from the api
  private _getRates(base: string) {
    if (this.comparatorForm.get("date").value != null) {
      return this.currencyService
        .getHistorical(this.comparatorForm.get("date").value, base)
        .subscribe(
          (success) => {
            this.ratesResponse = success as any;
            this.errorMessage = "";
          },
          (error) => {
            this.errorMessage = error.message;
          }
        );
    } else {
      return this.currencyService.getLatest(base).subscribe(
        (success) => {
          this.ratesResponse = success as any;
          this.errorMessage = "";
        },
        (error) => {
          this.errorMessage = error.message;
        }
      );
    }
  }

  //Recalculats rates based on the user inpts. It does not make any requests to the api!
  public recalculate() {
    if (this.ratesResponse && this.comparatorForm.status != "INVALID") {
      this.calculatedValues = [] as { symbol: string; value: string }[];
      let amount: number = parseFloat(this.comparatorForm.get("amount").value);
      let sortedRates = {};
      let rates = this.ratesResponse.rates;
      Object.keys(rates)
      .sort()
      .forEach(function (key) {
        sortedRates[key] = rates[key];
      });
      for (let rate of Object.keys(sortedRates)) {
        if (rate != this.comparatorForm.get("symbol").value) {
          this.calculatedValues.push({
            symbol: rate,
            value: (
              parseFloat(sortedRates[rate]) * amount
            ).toFixed(3),
          });
        }
      }
    }
  }
}
