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
      <button (click)="setMonth()"> 한달 </button>
      <button (click)="setYear()"> 1년 </button>
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
            <ng-container *ngFor="let data of item">
              <ng-container *ngIf="data.colspan">
              <td [attr.colspan]="data.colspan">
              </ng-container>
              <td [attr.aria-label]="data?.detail">
                <div [ngClass]="{ 'selected-today' : selectedToday( data?.detail ), 'selected-date' : isSelectedDate( data?.detail ), 'selected-days' : isSelectedRange( data?.detail ) }" (click)="selectDate( data?.detail )"> {{ data?.date }} </div>
              </td>
            </ng-container>
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

  // startOfMonth: number;
  // endOfMonth: number;

  selectedYear: number;
  selectedMonth: any;
  selectedDate: string;

  date = moment();
  dateFrom: string = '';
  dateTo: string = '';

  dates: any[];
  // datesInMonth: any[];
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
  }

  isSelectedRange( date ) {
    if ( moment( date ).isAfter( this.dateFrom ) && moment( date ).isBefore( this.dateTo ) ) {
      return true;
    }
  }

  // 한달, 올해, 작년, 내년 범위 세팅
  setMonth() {
    this.dateFrom = moment().year( this.selectedYear ).month( this.selectedMonth ).startOf( 'month' ).format( 'YYYY-MM-DD' );
    this.dateTo = moment().year( this.selectedYear ).month( this.selectedMonth ).endOf( 'month' ).format( 'YYYY-MM-DD' );
  }

  setYear() {
    this.dateFrom = moment().year( this.selectedYear ).startOf( 'year' ).format( 'YYYY-MM-DD' );
    this.dateTo = moment().year( this.selectedYear ).endOf( 'year' ).format( 'YYYY-MM-DD' );
  }

  displaySelectDate() {
    return moment( this.dateFrom ).diff( this.dateTo, 'days' );
  }

  isSelectedYear( year: number ) {
    return (year === this.selectedYear) ? true : false;
  }

  // 현재 년도에서 -10 ~ +20 인 배열
  makeArrayYears(): number[] {
    let standardYear = this.selectedYear;
    this.years = [];

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
    return this.years = [ ...pastYears, standardYear, ...futureYears ];
    // console.log( this.years );
  }

  // setDateInMonth( year, month, date ) {
  //   return moment().year( year ).month( month ).date(date); 
  // }

  // dayFormatted( date ) {
  //   date.format('YYYY-MM-DD');
  // }

  refresh() {
    this.makeArrayYears();
    this.prevMonth = this.selectedMonth > 1 ? this.selectedMonth - 1 : 0;
    this.nextMonth = this.selectedMonth < 12 ? this.selectedMonth + 1 : 0;

    const date = moment();
    // moment( month ).startOf('M')
    const startOfMonth = date.year( this.selectedYear ).month( this.selectedMonth ).startOf( 'month' ).day();
    const endOfMonth = date.year( this.selectedYear ).month( this.selectedMonth ).endOf( 'month' ).date();

    const makeDates = Array( endOfMonth ).fill( null ).map( (x, i) => i + 1);
    
    const datesInMonth = Array( this.countWeeks( endOfMonth, startOfMonth) ).fill(Array(7));
    
    this.dates = datesInMonth.map( ( item, index ) => {
      const count = 7;
      let colspan = startOfMonth;
      item = [];
      
      for ( let i = 0; i < count; i++ ) {
        if ( index === 0 && i < startOfMonth ) {
          continue;
        } else { 
          if ( makeDates.length > 0 ) {
            let task = makeDates.shift();
            const data = {
              ...( ( index === 0 && item.length === 0 ) && { colspan }), 
              date: task, 
              detail: date.year( this.selectedYear ).month( this.selectedMonth ).date( task ).format('YYYY-MM-DD')
            };

            item.push( data );  
          }
        }
      }

      // console.table( item );
       return item;
    });

    // console.log( `이번달 첫날은 ${ this.startOfMonth }`);
    // console.log( `이번달 마지막날은 ${ this.endOfMonth }`);
  }

  createCalender( date ) {
    const startOfMonth = date.startOf( 'month' ).day();
    const endOfMonth = date.endOf( 'month' ).date();
    const makeDates = Array( endOfMonth ).fill( null ).map( (x, i) => i + 1);
    const datesInMonth = Array( this.countWeeks( endOfMonth, startOfMonth) ).fill(Array(7));

    this.dates = datesInMonth.map( ( item, index ) => {
      // const count = 7;
      // item = [];
      
      item.reduce( (acc, value, index) => {
        if ( index == 0 ) {
          
          
        }

        return acc;
      }, []);
      
       return item;
    });

    this.makeArrayYears();
  }

  initDatePicker() {
    // moment().format('MM. D, YYYY [at] h:mm A z');
    // produces: "Jan. 30, 2019 at 2:35 PM"
    this.today = this.date.format('YYYY-MM-DD');
    this.selectedYear = this.date.year();
    this.selectedMonth = this.date.month();
    this.selectDate( this.today );
    this.refresh();
    // this.createCalender( this.date );
  }

  setNextMonth() {
    // this.selectedMonth = moment(this.selectedDate).add(1, 'M').month();
    // this.refresh();
    // this.date = moment( this.date ).add(1, 'M');
    // this.createCalender( this.date );
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
    // this.selectedMonth = moment(this.selectedDate).subtract(1, 'M').month();
    // this.refresh();
    // this.date = moment( this.date ).subtract(1, 'M');
    // this.createCalender( this.date );
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
    this.selectedYear = parseInt(year);
    // this.date.year();
    this.refresh();
    // this.createCalender( this.date );
  }

  ngOnInit() {
    this.initDatePicker();
  }

}
