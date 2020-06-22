import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class CurrencyService {
  constructor(private http: HttpClient) {}

  getLatest(base) {
    return this.http.get("https://api.exchangeratesapi.io/latest?base=" + base);
  }

  getHistorical(date: Date, base) {
    return this.http.get(
      "https://api.exchangeratesapi.io/" +
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1) +
        "-" +
        date.getDate() +
        "?base=" +
        base
    );
  }

  getComparison (firstBase, secondBase, startDate: Date, endDate: Date) {

    return this.http.get(
      "https://api.exchangeratesapi.io/history?start_at=" +
        startDate.getFullYear() +
        "-" +
        (startDate.getMonth() + 1) +
        "-" +
        startDate.getDate() +
        "&end_at=" +
        endDate.getFullYear() +
        "-" +
        (endDate.getMonth() + 1) +
        "-" +
        endDate.getDate() +
        "&symbols=" +
        firstBase +
        "," +
        secondBase
    );
  }
}
