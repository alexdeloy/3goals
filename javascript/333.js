var currentSection = 0;
var sections;

var toggleSection = function() {
    console.log("toggleSection:" + currentSection);
    currentSection++;
    currentSection = currentSection % sections.length;

    for (var i=0; i < sections.length; i++) {
        if (i == currentSection) {
            sections[i].classList.add("visible");
        } else {
            sections[i].classList.remove("visible");
        }
    }
};

var pad = function(number) {
    if (number > 9) {
        return number;
    } else {
        return "0" + number;
    }
}


var getDatesForHeaders = function() {
    var d = new Date();

    var headerToday = d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate());
    document.querySelector("section.day h2").innerHTML = headerToday;

    var weekDay = d.getDay() ;
    dFrom = new Date(d.getTime() - ((weekDay-1) * 24 * 60 * 60 * 1000));
    dTo = new Date(d.getTime() + ((7 - weekDay) * 24 * 60 * 60 * 1000));
    var weekFrom = dFrom.getFullYear() + "-" + pad(dFrom.getMonth()+1) + "-" + pad(dFrom.getDate());
    var weekTo = dTo.getFullYear() + "-" + pad(dTo.getMonth()+1) + "-" + pad(dTo.getDate());
    var headerWeek = weekFrom + " - " + weekTo;
    document.querySelector("section.week h2").innerHTML = headerWeek;

    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var headerMonth = months[d.getMonth()] + " " + d.getFullYear();
    document.querySelector("section.month h2").innerHTML = headerMonth;
};

var saveData = function() {
    var dayItems = document.querySelectorAll("section.day .goal .content");
    for (var i=0; i < dayItems.length; i++) {
        localStorage.setItem("day-"+i, dayItems[i].innerHTML);
    }
    var weekItems = document.querySelectorAll("section.week .goal .content");
    for (var i=0; i < weekItems.length; i++) {
        localStorage.setItem("week-"+i, weekItems[i].innerHTML);
    }
    var monthItems = document.querySelectorAll("section.month .goal .content");
    for (var i=0; i < monthItems.length; i++) {
        localStorage.setItem("month-"+i, monthItems[i].innerHTML);
    }
}

var loadData = function() {
    var dayItems = document.querySelectorAll("section.day .goal .content");
    for (var i=0; i < dayItems.length; i++) {
        var dayContent = localStorage.getItem("day-"+i) || "";
        // skip empty content to keep the onboarding texts
        if (dayContent != "") {
            dayItems[i].innerHTML = dayContent;
        }
    }
    var weekItems = document.querySelectorAll("section.week .goal .content");
    for (var i=0; i < weekItems.length; i++) {
        weekItems[i].innerHTML = localStorage.getItem("week-"+i) || "";
    }
    var monthItems = document.querySelectorAll("section.month .goal .content");
    for (var i=0; i < monthItems.length; i++) {
        monthItems[i].innerHTML = localStorage.getItem("month-"+i) || "";
    }

    // set empty flag on empty goals
    var goals = document.querySelectorAll(".goal .content");
    for (var i=0; i < goals.length; i++) {
        if (goals[i].innerHTML == "") {
            goals[i].parentNode.classList.add("empty");
        } else {
            goals[i].parentNode.classList.remove("empty");
        }
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    sections = document.querySelectorAll("section");
    sections[0].classList.add("visible");

    var sectionHeaders = document.querySelectorAll(".header");
    for (var i=0; i < sectionHeaders.length; i++) {
        sectionHeaders[i].addEventListener("click", function(e) {
            toggleSection();
        });
    }

    var goals = document.querySelectorAll(".goal");
    for (var i=0; i < goals.length; i++) {
        var content = goals[i].querySelector(".content");
        var options = goals[i].querySelector(".options");

        content.addEventListener("click", function(e) {
            for (var j=0; j < goals.length; j++) {
                goals[j].classList.remove("editing");
                goals[j].querySelector(".content").contentEditable = false;
            }

            if (e.target.parentNode.classList.contains("done")) {
                return;
            }
            e.target.parentNode.classList.add("editing");
            e.target.contentEditable = true;

            // set caret to the end
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(e.target, 1);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            e.target.focus();
        });

        content.addEventListener("keyup", function(e) {
            if (e.target.innerHTML.length > 0) {
                e.target.parentNode.classList.remove("empty");
            } else {
                e.target.parentNode.classList.add("empty");
            }
        });

        options.addEventListener("click", function(e) {
            if (e.target.parentNode.classList.contains("editing")) {
                e.target.parentNode.classList.remove("editing");
                e.target.parentNode.querySelector(".content").contentEditable = false;
                saveData();
            } else {
                for (var j=0; j < goals.length; j++) {
                    goals[j].classList.remove("editing");
                    goals[j].querySelector(".content").contentEditable = false;
                }

                e.target.parentNode.classList.toggle("done");
            }
        });
    }

    getDatesForHeaders();
    loadData();
});
