var app = angular.module("Calendar", []);
app.controller("CalendarCtrl", function ($scope, $http) {
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
  var current = 4;
  var year = 2023;
  var state = "Confirm Stay";
  function leapYear(year, month, days) {
    if (year % 4 == 0) {
      if (month == 1) {
        return days + 1;
      }
    }
    return days;
  }

  function listOfLastDates(year, month, days, lastMonthDays, months) {
    sd = months[month].month + " 1, " + year.toString();
    startDate = new Date(sd);
    startDay = startDate.getDay();
    return Array.from(
      { length: startDay - 1 },
      (_, i) => lastMonthDays - i
    ).reverse();
  }
  function listOfNextDates(year, month, days, months) {
    end = leapYear(year, month, days, months).toString();
    ed = months[month].month + " " + end + ", " + year.toString();
    endDate = new Date(ed);
    endDay = endDate.getDay();
    left = 7 - endDay;
    console.log(left);
    days = Array.from({ length: left }, (_, i) => i + 1);
    console.log(days);
    return days;
  }
  $scope.Month = months[current].month;
  $scope.Year = year;
  $scope.currentmonth = Array.from(
    { length: leapYear(year, current, months[current].days) },
    (_, i) => i + 1
  );
  $scope.lastmonth = listOfLastDates(
    year,
    current,
    months[current].days,
    months[current - 1].days,
    months
  );
  $scope.nextmonth = listOfNextDates(
    year,
    current,
    months[current].days,
    months
  );
  $scope.newmonth = function () {
    current = current + 1;
    if (current == 12) {
      current = 0;
      year = year + 1;
      $scope.Year = year;
    }
    $scope.Month = months[current].month;

    $scope.currentmonth = Array.from(
      { length: leapYear(year, current, months[current].days) },
      (_, i) => i + 1
    );
    $scope.lastmonth = listOfLastDates(
      year,
      current,
      months[current].days,
      months[current - 1].days,
      months
    );
    $scope.nextmonth = listOfNextDates(
      year,
      current,
      months[current].days,
      months
    );
  };
  $scope.oldmonth = function () {
    current = current - 1;
    if (current == -1) {
      current = 11;
      year = year - 1;
      $scope.Year = year;
    }
    $scope.Month = months[current].month;
    $scope.currentmonth = Array.from(
      { length: leapYear(year, current, months[current].days) },
      (_, i) => i + 1
    );
    $scope.lastmonth = listOfLastDates(
      year,
      current,
      months[current].days,
      months[current - 1].days,
      months
    );
    $scope.nextmonth = listOfNextDates(
      year,
      current,
      months[current].days,
      months
    );
  };
  $scope.reserve = function (dates, Month) {
    var book = document.getElementById("booking");
    book.style.visibility = "visible";
    $scope.dayOfReservation = Month + " " + dates.toString();
  };
  $scope.submit = function (tennantname) {
    var book = document.getElementById("booking");
    book.style.visibility = "hidden";
    console.log(tennantname);
    console.log(new Date($scope.dayOfReservation + ", " + year));
    $http({
      method: "POST",
      url: "/reserve",
      data: {
        time: new Date($scope.dayOfReservation + ", " + year).valueOf(),
        reserved: true,
        tennantName: tennantname,
      },
    }).then(
      function successCallback(response) {
        console.log("success");
      },
      function errorCallback(response) {
        console.log("failure");
      }
    );
  };
});
