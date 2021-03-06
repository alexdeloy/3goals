// --- Service Workers ----------------------------------------------------------------------------
// register empty service worker to show the install prompt
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}


// --- Helpers ------------------------------------------------------------------------------------
// Helper function to pad numbers to 2 digits
var pad = function(number) {
    if (number > 9) {
        return number;
    } else {
        return "0" + number;
    }
};

// trim whitespace and br tags on a string
var cleanup = function(str) {
    str = str.replace(/^<br(.*?)>/g, "");
    str = str.replace(/(<br(.?)>)*$/g, "");

    str = str.trim();
    return str;
};


// --- Swipe Input --------------------------------------------------------------------------------
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);

var xDown = null;
var yDown = null;

var handleTouchStart = function(e) {
    xDown = e.touches[0].clientX;
    yDown = e.touches[0].clientY;
};

var handleTouchMove = function(e) {
    if (!xDown || !yDown) {
        return;
    }

    var editingContent = document.querySelector(".editing");
    if (editingContent != null) {
        return;
    }

    var xUp = e.touches[0].clientX;
    var yUp = e.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            toggleSection(1);
        } else {
            toggleSection(-1);
        }
    }
    xDown = null;
    yDown = null;
};


// --- Data Handling ------------------------------------------------------------------------------
var saveData = function() {
    var dayItems = document.querySelectorAll("section.day .goal .content");
    for (var i=0; i < dayItems.length; i++) {
        localStorage.setItem("day-"+i, cleanup(dayItems[i].innerHTML));
        localStorage.setItem("day-"+i+"-done", dayItems[i].parentNode.classList.contains("done"));
    }
    var weekItems = document.querySelectorAll("section.week .goal .content");
    for (var i=0; i < weekItems.length; i++) {
        localStorage.setItem("week-"+i, cleanup(weekItems[i].innerHTML));
        localStorage.setItem("week-"+i+"-done", weekItems[i].parentNode.classList.contains("done"));
    }
    var monthItems = document.querySelectorAll("section.month .goal .content");
    for (var i=0; i < monthItems.length; i++) {
        localStorage.setItem("month-"+i, cleanup(monthItems[i].innerHTML));
        localStorage.setItem("month-"+i+"-done", monthItems[i].parentNode.classList.contains("done"));
    }

    // remove the editing state from all goals and cleanup
    var goals = document.querySelectorAll(".goal");
    for (var i=0; i < goals.length; i++) {
        goals[i].classList.remove("editing");
        var content = goals[i].querySelector(".content");
        content.contentEditable = false;
        content.innerHTML = cleanup(content.innerHTML);
        if (content.innerHTML == "") {
            goals[i].classList.add("empty");
        } else {
            goals[i].classList.remove("empty");
        }
    }
};

var loadData = function() {
    var dayItems = document.querySelectorAll("section.day .goal .content");
    for (var i=0; i < dayItems.length; i++) {
        var dayContent = localStorage.getItem("day-"+i) || "";
        // skip empty content to keep the onboarding texts
        if (dayContent != "") {
            dayItems[i].innerHTML = dayContent;
        }
        var done = (localStorage.getItem("day-"+i+"-done") == "true");
        if (done) {
            dayItems[i].parentNode.classList.add("done");
        } else {
            dayItems[i].parentNode.classList.remove("done");
        }
    }
    var weekItems = document.querySelectorAll("section.week .goal .content");
    for (var i=0; i < weekItems.length; i++) {
        weekItems[i].innerHTML = localStorage.getItem("week-"+i) || "";
        var done = (localStorage.getItem("week-"+i+"-done") == "true");
        if (done) {
            weekItems[i].parentNode.classList.add("done");
        } else {
            weekItems[i].parentNode.classList.remove("done");
        }
    }
    var monthItems = document.querySelectorAll("section.month .goal .content");
    for (var i=0; i < monthItems.length; i++) {
        monthItems[i].innerHTML = localStorage.getItem("month-"+i) || "";
        var done = (localStorage.getItem("month-"+i+"-done") == "true");
        if (done) {
            monthItems[i].parentNode.classList.add("done");
        } else {
            monthItems[i].parentNode.classList.remove("done");
        }
    }

    // set empty flag on empty goals
    var goals = document.querySelectorAll(".goal .content");
    for (var i=0; i < goals.length; i++) {
        if (goals[i].innerHTML == "") {
            if (goals[i].parentNode.classList.contains("done")) {
                goals[i].parentNode.classList.remove("done");
            }
            goals[i].parentNode.classList.add("empty");
        } else {
            goals[i].parentNode.classList.remove("empty");
        }
    }
};


// --- Sections -----------------------------------------------------------------------------------
var currentSection = 0;
var sections;

// toggle between sections, 1 = forward, -1 = backwards
var toggleSection = function(direction) {
    currentSection += direction;
    if (currentSection < 0) {
        currentSection = sections.length - 1;
    }
    if (currentSection >= sections.length) {
        currentSection = 0;
    }

    saveData();

    for (var i=0; i < sections.length; i++) {
        if (i == currentSection) {
            sections[i].classList.add("visible");
        } else {
            sections[i].classList.remove("visible");
        }
    }
};


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


// --- Document ready -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function(event) {
    sections = document.querySelectorAll("section");
    sections[0].classList.add("visible");

    var sectionHeaders = document.querySelectorAll(".header");
    for (var i=0; i < sectionHeaders.length; i++) {
        sectionHeaders[i].addEventListener("click", function(e) {
            toggleSection(1);
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

            // if needed set a empty space to give the caret something to focus on
            if (e.target.innerHTML == "") {
                e.target.innerHTML = " ";
            }

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
            if (!e.target.parentNode.classList.contains("editing")) {
                for (var j=0; j < goals.length; j++) {
                    goals[j].classList.remove("editing");
                    goals[j].querySelector(".content").contentEditable = false;
                }
                e.target.parentNode.classList.toggle("done");
            }
            saveData();
        });
    }

    getDatesForHeaders();
    loadData();
});
