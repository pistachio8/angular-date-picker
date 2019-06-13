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
      <div class="input-container">
        <input type="text" class="date-picker-form" (input)="textDate = $event.target.value" [value]="dateFrom">
        <input type="text" class="date-picker-form" (input)="textDate = $event.target.value" [value]="dateTo">
      </div>
      <div class="date-picker">
        <div class="calender-header">
          <span (click)="setPrevMonth()">prev</span>
          <div class="calender-heading-year-month">
            <h3 class="month">{{ selectedMonth + 1 }}</h3>
            <select class="select-year" (change)="changeSelectYear($event.target.value)">
              <option *ngFor="let year of years" [selected]="isSelectedYear(year)">{{ year }}</option>
            </select>
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
              <div [ngClass]="{ 'selected-today' : selectedToday( data?.detail ), 'selected-date' : isSelectedDate( data?.detail ), 'selected-days' : isSelectedRange( data?.detail ) }" (click)="selectDate( data?.detail )"> {{ data?.date }} </div>
            </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
  // 오늘, 이번달 첫째날, 이번달 둘째날, 이전달, 다음달, 년도
  // 달의 시작하는 날 colspan
  textDate: string;

  today: any;
  prevMonth: number;
  nextMonth: number;

  startOfMonth: number;
  endOfMonth: number;

  selectedYear: number;
  selectedMonth: number;
  selectedDate: string;

  dateFrom: string = '';
  dateTo: string = '';

  dates: any[];
  datesInMonth: any[];
  years: number[];

  constructor() {}

  setDateRange( date ) {
    
    if ( this.dateFrom === '' ) {
      this.dateFrom = date;
    } else if ( this.dateFrom && this.dateTo === '' ) {
      this.dateTo = date;
      if ( moment( this.dateFrom ).isAfter( this.dateTo ) ) {
        [ this.dateFrom, this.dateTo ] = [ this.dateTo, this.dateFrom ];
        // this.swapDate( this.dateFrom, this.dateTo );
      }
    } else if ( this.dateFrom && this.dateTo ) {
      if ( moment( date ).isAfter( this.dateFrom ) && ! moment( date ).isSame( this.dateTo ) ) {
        this.dateTo = date;
        return;
      }
      this.dateFrom = date;
      this.dateTo = '';
    }
    // console.log( `${date}, ${this.dateFrom}, ${this.dateTo}` );
  }

  // swapDate(date1, date2) {
  //   [ date1, date2 ] = [ date2, date1 ];
  //   console.log( `${this.dateFrom}, ${this.dateTo}` );
  //   return date1;
  // }

  countWeeks( daysInMonth: number, firstDayInMonth: number ) {
    // 30 + 6 =  36 / 7 ? 5 + 1 = 6
    return ( Math.trunc( ( daysInMonth + firstDayInMonth ) / 7 ) ) + 1;
  }

  selectedToday( date: number ) {
    // moment().diff 두 날짜 사이의 반올림된 밀리 초 차이를 기반으로 값 반환, 전체값 보려면 세번째 매개 변수로 true 전달
    // moment().diff( date, 'days', true )
    
    return moment( date ).isSame( this.today );
  }

  selectDate( date ) {
    this.selectedDate = date;
    this.setDateRange( date );
  }

  isSelectedDate( date ) {
    if ( date === this.dateFrom || date === this.dateTo) {
      return true;
    } else {
      return false;
    }
    // return this.selectedDate === date ? true : false;
  }

  isSelectedRange( date ) {
    if ( moment( date ).isAfter( this.dateFrom ) && moment( date ).isBefore( this.dateTo ) ) {
      return true;
    }
  }

  // 한달, 올해, 작년, 내년 범위 세팅

  displaySelectDate() {
    return moment( this.dateFrom ).diff( this.dateTo, 'days' );
  }

  isSelectedYear( year: number ) {
    return (year === this.selectedYear) ? true : false;
  }

  // 현재 년도에서 -10 ~ +20 인 배열
  makeArrayYears() {
    let standardYear = this.selectedYear;

    const pastYears = Array(10).fill(null).reduce( (acc, value, index) => {

      if ( acc.length === 0 ) {
        acc[ index ] = this.selectedYear - 10;
      } else {
        acc[ index ] = acc[ index -1 ] + 1;
      }
      return acc;
    }, []);
    
    const futureYears = Array(20).fill(null).reduce( (acc, value, index) => {

      if ( acc.length === 0 ) {
        acc[ index ] = this.selectedYear + 1;
      } else {
        acc[ index ] = acc[ index - 1 ] + 1;
      }
      return acc;
    }, []);
    this.years = [ ...pastYears, standardYear, ...futureYears ];
    // console.log( this.years );
  }

  // setDateInMonth( year, month, date ) {
  //   return moment().year( year ).month( month ).date(date); 
  // }

  // dayFormatted( date ) {
  //   date.format('YYYY-MM-DD');
  // }

  refresh() {
    this.prevMonth = this.selectedMonth > 1 ? this.selectedMonth - 1 : 0;
    this.nextMonth = this.selectedMonth < 12 ? this.selectedMonth + 1 : 0; //12월일때 내년으로 바뀌어야

    // moment( month ).startOf('M')
    this.startOfMonth = moment().year( this.selectedYear ).month( this.selectedMonth ).startOf('month').day();
    this.endOfMonth = moment().year( this.selectedYear ).month( this.selectedMonth ).endOf('month').date();

    this.datesInMonth = Array( this.endOfMonth ).fill( null ).map( (x, i) => i + 1);
    
    const makeDates = Array( this.countWeeks( this.endOfMonth, this.startOfMonth) ).fill(Array(7));
    // const arr2 = Array.from({length: 5}, ( e ) =>  Array(7).fill() );
    
    const tasks = this.datesInMonth.slice();

    this.dates = makeDates.map( ( value, index ) => {
      const count = 7;
      value = [];
      
      for ( let i = 0; i < count; i++ ) {
        if ( index == 0 && i < this.startOfMonth ) {
          value.push( null );
        } else { 
          if ( tasks.length > 0 ) {
            let task = tasks.shift();
            value.push( { 
              date: task, 
              detail: moment().year( this.selectedYear ).month( this.selectedMonth ).date( task ).format('YYYY-MM-DD')
            } );   
          }
          
        }
      }
      
      // console.table( value );
       return value;
    });

    this.makeArrayYears();
    // console.log( `이번달 첫날은 ${ this.startOfMonth }`);
    // console.log( `이번달 마지막날은 ${ this.endOfMonth }`);
  }

  initDatePicker() {
    // moment().format('MM. D, YYYY [at] h:mm A z');
    // produces: "Jan. 30, 2019 at 2:35 PM"
    this.today = moment().format('YYYY-MM-DD');
    this.selectedYear = moment().year();
    this.selectedMonth = moment().month();
    this.selectDate( this.today );
    this.refresh();
  }

  setNextMonth() {
    // this.selectedDate.add(1, 'M')
    if ( this.selectedMonth > 10 ) {
      this.selectedMonth = 0;
      this.selectedYear += 1;
      this.refresh();
    } else {
      this.selectedMonth += 1;
      this.refresh();
    }
  }

  setPrevMonth() {
    // this.selectedDate.subtract(1, 'M')
    if ( this.selectedMonth < 2 ) {
      this.selectedMonth = 11;
      this.selectedYear -= 1;
      this.refresh();
    } else {
      this.selectedMonth -= 1;
      this.refresh();
    }
  }

  changeSelectYear( year ) {
    this.selectedYear = year;
    this.refresh();
  }

  ngOnInit() {
    this.initDatePicker();
  }

}
