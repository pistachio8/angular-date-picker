import { Component, OnInit } from '@angular/core';
import { DatePickerService } from '../date-picker.service';

import * as moment from 'moment';

/*
  달력 출력, 날짜 클릭시 입력
  시작날짜, 끝나는 날짜, 날짜 차이
*/
@Component({
  selector: 'date-picker',
  template: `
    <h2>date Picker</h2>
    <div class="date-picker-container">
      <input type="text" class="date-picker-form" (input)="textDate = $event.target.value" [value]="selectedDate">
      <div class="date-picker">
        <div class="calender-header">
          <span (click)="setPrevMonth()">prev</span>
          <div class="calender-heading-year-month">
            <h3 class="month">{{ selectedMonth + 1 }}</h3>
            <span>{{ selectedYear }}</span>
          </div>
          <span (click)="setNextMonth()">next</span>
        </div>
        <table class="date-picker-table">
          <thead>
            <tr>
              <th aria-label="Sunday">일</th>
              <th aria-label="Monday">월</th>
              <th aria-label="Tuesday">화</th>
              <th aria-label="Wednesday">수</th>
              <th aria-label="Thursday">목</th>
              <th aria-label="Friday">금</th>
              <th aria-label="Saturday">토</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of dates">
            <td *ngFor="let data of item" [attr.aria-label]="data?.detail">
              <div [class.selected-today]="selectedToday( data?.detail )" (click)="selectDate( data?.detail )"> {{ data?.date }} </div>
            </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }

    .date-picker-container {
      width: 80%;
      background: #fff;
      border-radius: 2px;
    }

    .calender-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 30px;
    }

    .calender-heading-year-month {
      position: relative;
      display: flex;
      jusitify-content: center;
      align-items: center;
    }

    .calender-heading-year-month span {
      position: absolute;
      left: 40px;
    }

    .calender-header span {
      cursor: pointer;
    }

    .date-picker-table {
      width: 100%;
    }

    .date-picker-table th, td {
      position: relative;
      width: calc(100% / 7);
      padding-top: 7.5%;
      padding-bottom: 7.5%;
      text-align: center;
    }

    .selected-today {
      border: 1px solid #0099fb; 
    }

    .selected-date {
      background: #0099fb;
      color: #fff;
    }

    .date-picker-table td {
      cursor: pointer;
    }

    .date-picker-table td div {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate( -50%, -50% );
      display: flex;
      justify-content: center;
      align-items: center;
      width: 90%;
      height: 90%;
    }
  `]
  // styleUrls: ['./date-picker-exam.component.scss']
})
export class DatePickerComponent implements OnInit {
  // 오늘, 이번달 첫째날, 이번달 둘째날, 이전달, 다음달, 년도
  // 달의 시작하는 날 colspan
  textDate: string;

  today: string;
  prevMonth: number;
  nextMonth: number;

  selectedYear: number;
  selectedMonth: number;
  selectedDate: number;

  startOfMonth: number;
  endOfMonth: number;

  dates:any[];
  datesInMonth: any[];

  constructor( private datePickerService: DatePickerService) { }

  countWeeks( daysInMonth, firstDayInMonth ) {
    // 30 + 6 =  36 / 7 ? 5 + 1 = 6
    // 31 + 3 = 34 / 7 ? 4 + 1 = 5
    return ( Math.trunc( ( daysInMonth + firstDayInMonth ) / 7 ) ) + 1;
  }

  selectedToday( date ) {
    if ( (moment( date ).diff( this.today, "days") === 0 ) ) {
      return true;
    }
  }

  selectDate( date ) {
    this.selectedDate = date;
  }

  displaySelectDate() {

  }

  refresh() {
    this.prevMonth = this.selectedMonth > 1 ? this.selectedMonth - 1 : 0;
    this.nextMonth = this.selectedMonth < 12 ? this.selectedMonth + 1 : 0; //12월일때 내년으로 바뀌어야

    this.startOfMonth = moment().year( this.selectedYear ).month( this.selectedMonth ).startOf('month').day();
    this.endOfMonth = moment().year( this.selectedYear ).month( this.selectedMonth ).endOf('month').date();

    this.datesInMonth = Array( this.endOfMonth ).fill( null ).map( (x, i) => i + 1);

    // const arr = Array(5).fill(Array);
    
    const makeDates = Array( this.countWeeks( this.endOfMonth, this.startOfMonth) ).fill(Array(7));
    // const arr2 = Array.from({length: 5}, ( e ) =>  Array(7).fill() );
    // 얕은 복사 새로운 배열객체, Array.from(arraylike[, mapFn[, thisArg ]] )

    const tesks = this.datesInMonth.slice();

    this.dates = makeDates.map( ( value, index ) => {
      const count = 7;
      value = [];
      
      for ( let i = 0; i < count; i++ ) {
        if ( index == 0 && i < this.startOfMonth ) {
          value.push( null );
        } else { 
          if ( tesks.length > 0 ) {
            let tesk = tesks.shift();
            value.push( { date: tesk, detail: moment().year( this.selectedYear ).month( this.selectedMonth ).date(tesk).format('YYYY-MM-DD') } );   
          }
          
        }
      }
      
      // console.log( value );
      
       return value;
    });

    // reduce( acc, value, index, array )
    
    // console.log( `이번달 첫날은 ${ this.startOfMonth }`);
    // console.log( `이번달 마지막날은 ${ this.endOfMonth }`);
  }

  initDatePicker() {
    this.today = moment().format('YYYY-MM-DD');
    this.selectedYear = moment().year();
    this.selectedMonth = moment().month();
    this.selectDate( this.today );
    this.refresh();

  }

  setDateLable( date:number ):string {
    return moment().month( this.selectedMonth ).date( date ).format('LL');
    // console.log( `이번달 ${ moment().month(this.selectedMonth).date(13).format('LL') }`);
  }

  initDates() {
    // console.log( `이번달 첫날은 ${ moment().dates() }`);
  }

  setDays() {

  }
  
  setNextMonth() {
    if ( this.selectedMonth > 10 ) { // 10 11 12
      this.selectedMonth = 0;
      this.selectedYear += 1;
      this.refresh();
    } else {
      this.selectedMonth += 1;
      this.refresh();
    }
  }

  setPrevMonth() {
    if ( this.selectedMonth < 2 ) {
      this.selectedMonth = 11;
      this.selectedYear -= 1;
      this.refresh();
    } else {
      this.selectedMonth -= 1;
      this.refresh();
    }
  }

  ngOnInit() {
    this.initDatePicker();
  }

}
