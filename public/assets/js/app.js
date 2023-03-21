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
  var current = 11;
  var year = 2019;
  var state = "Confirm Stay";
  var time = 0;
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
    console.log(startDay);
    return Array.from(
      { length: startDay },
      (_, i) => lastMonthDays - i
    ).reverse();
  }
  function listOfNextDates(year, month, days, months) {
    end = leapYear(year, month, days, months).toString();
    ed = months[month].month + " " + end + ", " + year.toString();
    endDate = new Date(ed);
    endDay = endDate.getDay();
    left = 6 - endDay;
    console.log(left);
    days = Array.from({ length: left }, (_, i) => i + 1);
    console.log(days);
    return days;
  }
  $scope.Month = months[current].month;
  $scope.Year = year;
  $scope.Staying = state;
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
    if (current == 0) {
      prvsmonth = 11;
    } else {
      prvsmonth = current - 1;
    }
    $scope.lastmonth = listOfLastDates(
      year,
      current,
      months[current].days,
      months[prvsmonth].days,
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
        console.log(url);
        var reserved = response.data.reserved;
        if (reserved.length > 0) {
          console.log(reserved);
          state = "Cancel Stay";
          $scope.Staying = state;
          document.getElementById("tennantreserved").style.visibility =
            "visible";
          document.getElementById("input").style.visibility = "hidden";
          document.getElementById("button").style.backgroundColor = "#ff0000";
          $scope.reservedtennant = reserved[0].tennantName;
          time = reserved[0].time;
        } else {
          console.log(reserved);
          state = "Confirm Stay";
          $scope.Staying = state;
          document.getElementById("tennantreserved").style.visibility =
            "hidden";
          document.getElementById("input").style.visibility = "visible";
          document.getElementById("button").style.backgroundColor = "#00ff00";
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  $scope.submit = function (tennantname) {
    var book = document.getElementById("booking");
    book.style.visibility = "hidden";
    document.getElementById("tennantreserved").style.visibility = "hidden";
    document.getElementById("input").style.visibility = "hidden";
    var stay = false;
    if (state == "Confirm Stay") {
      stay = true;
      time = Math.floor(
        new Date(
          $scope.dayOfReservation + ", " + year + " 23:59:58"
        ).getTime() / 1000
      );
      $scope.tennantname = "";
    }
    console.log(time);
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
        console.log("success");
      },
      function errorCallback(response) {
        console.log(response);
      }
    );
  };
});
