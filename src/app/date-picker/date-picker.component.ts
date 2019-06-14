import { Component, OnInit } from '@angular/core';
import { DatePickerService } from '../date-picker.service';

import * as moment from 'moment';
import { ThrowStmt } from '@angular/compiler';

/*
  달력 출력, 날짜 클릭시 입력
  시작날짜, 끝나는 날짜, 날짜 차이
*/
@Component({
  selector: 'date-picker',
  template: `
    <h2>date Picker</h2>
    <div class="date-picker-container">
      <div class="display-pannel">
          <div class="input-container">
            <span>To</span>
            <input type="text" class="date-picker-form" [value]="dateFrom" disabled>
            <span class="notice-text" *ngIf="dateFrom === '' ">시작 날짜를 설정하세요.</span>
          </div>
          <div class="input-container">  
            <span>From</span>
            <input type="text" class="date-picker-form" [value]="dateTo" disabled>
            <span class="notice-text" *ngIf="dateTo === '' ">끝나는 날짜를 설정하세요.</span>
            <span></span>
          </div>
          <div class="text-container">
            <h3>{{ displaySelectDays() }} Days</h3>
            <p><span>{{ dateFrom }}</span> to <span>{{ dateTo }}</span></p>
          </div>
      </div>
      <div class="button-container">
        <button (click)="selectPeriodOption( 'this', 'week' )"> 이번주 </button>
        <button (click)="selectPeriodOption( 'last', 'week' )"> 지난주 </button>
        <button (click)="selectPeriodOption( 'next', 'week' )"> 다음주 </button>
        <button (click)="selectPeriodOption( 'this', 'month' )"> 이번달 </button>
        <button (click)="selectPeriodOption( 'last', 'month' )"> 지난달 </button>
        <button (click)="selectPeriodOption( 'next', 'month' )"> 다음달 </button>
        <button (click)="selectAllDayInMonth()"> 선택달 </button>
        <button (click)="selectPeriodOption( 'this', 'year' )"> 올해 </button>
        <button (click)="selectPeriodOption( 'last', 'year' )"> 작년 </button>
        <button (click)="selectPeriodOption( 'next', 'year' )"> 내년 </button>
      </div>
      <div class="date-picker">
        <div class="calender-header">
          <span (click)="setPrevMonth()">
            <i class="icon-prev"></i>
          </span>
          <div class="calender-heading-year-month">
            <h3 class="month">{{ selectedMonth + 1 }}</h3>
            <select class="select-year" (change)="changeSelectYear($event.target.value)">
              <option *ngFor="let year of years" [selected]="isSelectedYear(year)">{{ year }}</option>
            </select>
          </div>
          <span (click)="setNextMonth()">
          <i class="icon-next"></i>
          </span>
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
            <tr *ngFor="let date of dates">
            <ng-container *ngFor="let data of date">
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
  textDate: string;

  today: string;

  selectedYear: number;
  selectedMonth: number;
  selectedDate: string;

  date = moment();
  dateFrom: string = '';
  dateTo: string = '';

  dates: any[];
  years: number[];

  constructor() {}

  setDateRange( date ) {
    
    if ( this.dateFrom === '' ) {
      this.dateFrom = date;
    } else if ( this.dateFrom && this.dateTo === '' ) {
      this.dateTo = date;
      this.checkDateOrder();
    } else if ( this.dateFrom && this.dateTo ) {
      // if ( moment( date ).isAfter( this.dateFrom ) && ! moment( date ).isSame( this.dateTo ) ) {
      //   this.dateTo = date;
      //   return;
      // }
      this.dateFrom = date;
      this.dateTo = '';
    }
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
    return moment( date ).isSame( this.today );
  }

  selectDate( date ) {
    this.selectedDate = date;
    this.setDateRange( date );
  }

  isSelectedDate( date ) {
    return ( date === this.dateFrom || date === this.dateTo ) ? true : false; 
  }

  isSelectedRange( date ) {
    if ( moment( date ).isAfter( this.dateFrom ) && moment( date ).isBefore( this.dateTo ) ) {
      return true;
    }
  }
  
  selectAllDayInMonth() {
    this.dateFrom = moment().year( this.selectedYear ).month( this.selectedMonth ).startOf( 'month' ).format( 'YYYY-MM-DD' );
    this.dateTo = moment().year( this.selectedYear ).month( this.selectedMonth ).endOf( 'month' ).format( 'YYYY-MM-DD' );
  }

  // last, this, next, year, month, week
  // 내역조회 용도..오늘, 이번주, 저번주, 다음주, 저번달, 다음달, 오늘을 기준으로..., 1주일, 한달, 6개월, 1년
  // 한달, 올해, 작년, 내년 범위 세팅
  selectPeriodOption( order, term ) {
    if ( order === 'last' ) {
      this.dateFrom = moment().subtract( 1, term ).startOf( term ).format( 'YYYY-MM-DD' );
      this.dateTo = moment().subtract( 1, term ).endOf( term ).format( 'YYYY-MM-DD' );
    } else if ( order === 'next' ) {
      this.dateFrom = moment().add( 1, term ).startOf( term ).format( 'YYYY-MM-DD' );
      this.dateTo = moment().add( 1, term ).endOf( term ).format( 'YYYY-MM-DD' );
    } else {
      this.dateFrom = moment().startOf( term ).format( 'YYYY-MM-DD' );
      this.dateTo = moment().endOf( term ).format( 'YYYY-MM-DD' );
    }
  }

  checkDateOrder() {
    if ( moment( this.dateFrom ).isAfter( this.dateTo ) ) {
      [ this.dateFrom, this.dateTo ] = [ this.dateTo, this.dateFrom ];
    }
  }

  selectFromToday( term ) {
    switch ( term ) {
      case 'week' : 
                    this.dateFrom = this.today;
                    this.dateTo = moment( this.dateFrom ).add(7, 'day' ).format( 'YYYY-MM-DD' );
                    this.checkDateOrder();
        break;
      case 'lastWeek' : 
                        this.dateFrom = this.today;
                        this.dateTo = moment( this.dateFrom ).subtract(7, 'day' ).format( 'YYYY-MM-DD' );
                        this.checkDateOrder();
        break;
      case 'month' :
                    this.dateFrom = this.today; 
                    this.dateTo = moment( this.dateFrom ).add(1, 'month' ).format( 'YYYY-MM-DD' );
                    this.checkDateOrder();
        break;      
      case 'lastMonth' : 
                        this.dateFrom = this.today;  
                        this.dateTo = moment( this.dateFrom ).subtract(1, 'month' ).format( 'YYYY-MM-DD' );
                        this.checkDateOrder();
        break;    
    }
  }

  displaySelectDays() {
    if ( this.dateFrom === '' || this.dateTo === '' ) {
      return 0; 
    }
    return moment( this.dateTo ).diff( this.dateFrom, 'days' ) + 1;
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

  // dayFormatted( date ) {
  //   date.format('YYYY-MM-DD');
  // }

  refresh() {
    this.makeArrayYears();

    const date = moment();
    // moment( month ).startOf('M')
    const startOfMonth = date.year( this.selectedYear ).month( this.selectedMonth ).startOf( 'month' ).day();
    const endOfMonth = date.year( this.selectedYear ).month( this.selectedMonth ).endOf( 'month' ).date();

    const makeDates = Array( endOfMonth ).fill( null ).map( (x, i) => i + 1);
    
    const datesInMonth = Array( this.countWeeks( endOfMonth, startOfMonth) ).fill(Array(7));
    
    this.dates = datesInMonth.map( ( item, index ) => {
      const count = 7;
      item = [];
      
      for ( let i = 0; i < count; i++ ) {
        if ( index === 0 && i < startOfMonth ) {
          continue;
        } else { 
          if ( makeDates.length > 0 ) {
            let task = makeDates.shift();
            const data = {
              ...( ( index === 0 && item.length === 0 ) ? { colspan: startOfMonth } : {}), 
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
