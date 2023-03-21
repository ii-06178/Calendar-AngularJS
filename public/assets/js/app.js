// Module and Controller Code

var app = angular.module("Calendar", []);
app.controller("CalendarCtrl", function ($scope, $http) {
  // ------------------Initializing Variables----------------------------------
  // months is an array of objects with month names and number of days each has
  // This removes the hassle of extra calculation
  let months = [
    {
      month: "January",
      days: 31,
    },
    {
      month: "February",
      days: 28,
    },
    {
      month: "March",
      days: 31,
    },
    {
      month: "April",
      days: 30,
    },
    {
      month: "May",
      days: 31,
    },
    {
      month: "June",
      days: 30,
    },
    {
      month: "July",
      days: 31,
    },
    {
      month: "August",
      days: 31,
    },
    {
      month: "September",
      days: 30,
    },
    {
      month: "October",
      days: 31,
    },
    {
      month: "November",
      days: 30,
    },
    {
      month: "December",
      days: 31,
    },
  ];

  // current keeps track of the current month
  // year keeps track of the current year
  // The code intitializes from December 2019 as the data provided lies along this range

  var current = 11;
  var year = 2019;

  // state keeps track if the tennant can either book a slot or cancel the slot
  // time keeps track of time in unix

  var state = "Confirm Stay";
  var time = 0;

  //--------------------Helper Functions-----------------------------------

  // leapYear function checks that if the the year is a leapyear, return an extra day in February,otherwise the days in the month.
  // The function is generalized for all months to avoid repitition

  function leapYear(year, month, days) {
    if (year % 4 == 0) {
      if (month == 1) {
        return days + 1;
      }
    }
    return days;
  }

  // listOfLastDates returns a list of dates from last month.

  function listOfLastDates(year, month, lastMonthDays, months) {
    sd = months[month].month + " 1, " + year.toString();
    startDate = new Date(sd);
    startDay = startDate.getDay();
    return Array.from(
      { length: startDay },
      (_, i) => lastMonthDays - i
    ).reverse();
  }

  // listOfLastDates returns a list of dates of the next month.

  function listOfNextDates(year, month, days, months) {
    end = leapYear(year, month, days, months).toString();
    ed = months[month].month + " " + end + ", " + year.toString();
    endDate = new Date(ed);
    endDay = endDate.getDay();
    left = 6 - endDay;
    days = Array.from({ length: left }, (_, i) => i + 1);
    return days;
  }

  // listOfMonths calls all the list making functions
  // This saves repitition

  function listOfMonths(year, month, days, months) {
    $scope.currentmonth = Array.from(
      { length: leapYear(year, month, days) },
      (_, i) => i + 1
    );
    var prvsmonth = 0;
    if (month == 0) {
      prvsmonth = 11;
    } else {
      prvsmonth = month - 1;
    }
    $scope.lastmonth = listOfLastDates(
      year,
      month,
      months[prvsmonth].days,
      months
    );

    $scope.nextmonth = listOfNextDates(year, month, days, months);
  }

  // --------------------------Assigning Values---------------------------------------

  $scope.Month = months[current].month;
  $scope.Year = year;
  $scope.Staying = state;
  listOfMonths(year, current, months[current].days, months);

  // ------------------------On-Click Functions----------------------------------------

  // newmonth is triggered when the right arrow is clicked to go to the next month

  $scope.newmonth = function () {
    current = current + 1;
    if (current == 12) {
      current = 0;
      year = year + 1;
      $scope.Year = year;
    }
    $scope.Month = months[current].month;

    listOfMonths(year, current, months[current].days, months);
  };

  // old month is triggered when the left arrow is clicked to go to the previous month

  $scope.oldmonth = function () {
    current = current - 1;
    if (current == -1) {
      current = 11;
      year = year - 1;
      $scope.Year = year;
    }
    $scope.Month = months[current].month;

    listOfMonths(year, current, months[current].days, months);
  };

  // reserve is called when the user clicks on the date of the current month to book a slot. A box will appear.
  // Depending on the data, it will either show a booked slot or will ask for input.

  $scope.reserve = function (dates, Month) {
    var book = document.getElementById("booking");
    book.style.visibility = "visible";
    $scope.dayOfReservation = Month + " " + dates.toString();
    var url =
      "/reserve/" +
      Math.floor(
        new Date(
          $scope.dayOfReservation + ", " + year + " 00:00:00"
        ).getTime() / 1000
      ).toString() +
      "/" +
      Math.floor(
        new Date(
          $scope.dayOfReservation + ", " + year + " 23:59:59"
        ).getTime() / 1000
      ).toString();
    $http
      .get(url)
      .then(function (response) {
        var reserved = response.data.reserved;
        if (reserved.length > 0) {
          state = "Cancel Stay";
          $scope.Staying = state;
          document.getElementById("tennantreserved").style.visibility =
            "visible";
          document.getElementById("input").style.visibility = "hidden";
          document.getElementById("button").style.backgroundColor = "#ff0000";
          $scope.reservedtennant = reserved[0].tennantName;
          time = reserved[0].time;
        } else {
          state = "Confirm Stay";
          $scope.Staying = state;
          document.getElementById("tennantreserved").style.visibility =
            "hidden";
          document.getElementById("input").style.visibility = "visible";
          document.getElementById("button").style.backgroundColor = "#00ff00";
          time = Math.floor(
            new Date(
              $scope.dayOfReservation + ", " + year + " 23:59:58"
            ).getTime() / 1000
          );
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  // submit is called when the user clicks on the button and depending on what the state is, executes the respective post command
  // If there is an error a popup message comes up describing the error.
  // If it was a success a popup message comes to tell that is has been sucessfully done.

  $scope.submit = function (tennantname) {
    var book = document.getElementById("booking");
    book.style.visibility = "hidden";
    document.getElementById("tennantreserved").style.visibility = "hidden";
    document.getElementById("input").style.visibility = "hidden";
    var stay = false;
    if (state == "Confirm Stay") {
      stay = true;
      $scope.tennantname = "";
    }
    $http({
      method: "POST",
      url: "/reserve",
      data: {
        time: time,
        reserved: stay,
        tennantName: tennantname,
      },
    }).then(
      function successCallback(response) {
        if (state == "Confirm Stay") {
          $scope.error = "Slot successfully Added";
        } else {
          $scope.error = "Slot successfully Removed";
        }
        var popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
      },
      function errorCallback(response) {
        err = response.data;
        $scope.error = err;
        var popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
      }
    );
  };
});
