const data = {
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
    "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "ranges": [
        {
            "start": 65,
            "end": 90,
            "title": "range #0"
        },
        {
            "start": 176,
            "end": 191,
            "title": "range #1"
        },
        {
            "start": 73,
            "end": 79,
            "title": "range #2"
        },
        {
            "start": 136,
            "end": 141,
            "title": "range #3"
        },
        {
            "start": 7,
            "end": 12,
            "title": "range #4"
        },
        {
            "start": 445,
            "end": 445,
            "title": "range #5"
        },
        {
            "start": 136,
            "end": 148,
            "title": "range #6"
        },
        {
            "start": 136,
            "end": 148,
            "title": "range #7"
        },
        {
            "start": 291,
            "end": 302,
            "title": "range #8"
        },
        {
            "start": 184,
            "end": 191,
            "title": "range #9"
        },
        {
            "start": 402,
            "end": 408,
            "title": "range #10"
        },
        {
            "start": 543,
            "end": 548,
            "title": "range #11"
        },
        {
            "start": 296,
            "end": 309,
            "title": "range #12"
        }
    ]
};
const textElement = document.querySelector('#text').innerHTML = data.text;

const range = document.querySelector('#range');
const ul = document.createElement('ul');
range.appendChild(ul);

let ranges = data.ranges;

ul.innerHTML = ranges
    .map(function (name) {
        return `<li><span id="${name.title}" class=".border-none ">name: ${name.title} start: ${name.start} end: ${name.end}</span></li>`;
    })
    .join('');

ranges = ranges
    .sort(function (a, b) {
        return a.start - b.start;
    })
    .filter(function (currentRange) {
        return currentRange.start < data.text.length;
    });

let currentLi;
let highlightSpan = [];
let selectSpan;
ul.onclick = function (event) {
    if (currentLi && selectSpan) {
        currentLi.className = 'border-none';
        removeSpan(selectSpan)
    }

    let target = event.target;

    selectSpan = getSpan(target);

    if (!selectSpan) {
        alert('диапазон выходит за границы текста');
        return
    }

    target.className = 'border-range';
    selectSpan.className = 'border-range';

    currentLi = target;
};

function getSpan(target) {
    let span;
    let arrRanges = ranges.filter(function (name) {
        return target.id === name.title
    });
    if (!arrRanges.length) {
        return
    }
    let rng = document.createRange();
    for (let i = 0; i < highlightSpan.length; i++) {
        if (highlightSpan[i].range === arrRanges[0].title) {
            if (highlightSpan[i].start === arrRanges[0].start) {
                rng.setStartBefore(highlightSpan[i].span);
            }
            if (highlightSpan[i].end === arrRanges[0].end) {
                rng.setEndAfter(highlightSpan[i].span);
            }
        }
    }
    span = document.createElement('span');
    rng.surroundContents(span);
    return span
}

function removeSpan(span) {

    let textContainer = span.parentNode;
    while (span.firstChild) {
        textContainer.insertBefore(span.firstChild, span);
    }
    textContainer.removeChild(span)
}

function domRangeCreate(start, end) {
    let root = document.querySelector('#text').firstChild;
    let rng = document.createRange();
    rng.setStart(root, start);
    rng.setEnd(root, end);

    return rng
}

function getInterval(ranges) {
    let count = 0;
    let intersection = [];
    intersection[count] = [];

    for (let i = 0; i < ranges.length; i++) {
        let currentRange = ranges[i];
        let nextRange = ranges[i + 1];

        if (!nextRange) {
            intersection[count].push({
                ranges: [currentRange.title],
                start: currentRange.start,
                end: currentRange.end
            });
        } else if (currentRange.start < nextRange.start && currentRange.end > nextRange.end) {
            intersection[count].push({
                ranges: [currentRange.title, nextRange.title],
                start: nextRange.start,
                end: nextRange.end
            })
        } else if (nextRange.start < currentRange.end) {
            intersection[count].push({
                ranges: [currentRange.title, nextRange.title],
                start: nextRange.start,
                end: currentRange.end
            })

        } else {
            if (!intersection[count].length) {
                intersection[count].push({
                    ranges: [currentRange.title],
                    start: currentRange.start,
                    end: currentRange.end
                });

            }
            count++;
            intersection[count] = [];
        }
    }
    return intersection;
}

function getRange(intervalRange) {
    let resultRange = [];
    for (let i = 0; i < intervalRange.length; i++) {
        if (intervalRange[i + 1]) {
            let rng = domRangeCreate(intervalRange[i], intervalRange[i + 1]);
            resultRange.push({
                ranges: rng,
                start: intervalRange[i],
                end: intervalRange[i + 1]
            })
        }
    }

    return resultRange;
}

function getIntervalRange(intersection, ranges) {
    let intervalRange = [];
    let rangeNames = [];
    for (let i = 0; i < intersection.length; i++) {
        rangeNames = rangeNames.concat(intersection[i].ranges);
    }

    rangeNames = rangeNames.filter(function (range, index) {
        return rangeNames.indexOf(range) === index;
    });

    for (let i = 0; i < ranges.length; i++) {
        if (rangeNames.includes(ranges[i].title)) {
            intervalRange.push(ranges[i].start, ranges[i].end)
        }
    }

    if (intervalRange.length > 2) {
        intervalRange = intervalRange
            .sort(function (a, b) {
                return a - b;
            })
            .filter(function (point, index) {
                return intervalRange.indexOf(point) === index;
            });
    }
    let resultIntervalRange = getRange(intervalRange);

    return {
        intersection: intersection,
        resultIntervalRange: resultIntervalRange
    }
}

function getSpanRange(intersection, resultIntervalRange) {

    if (intersection.length > 1) {
        let rangesName = [];
        let ranges = [];

        for (let i = 0; i < intersection.length; i++) {
            ranges.push(intersection[i].start, intersection[i].end);
            rangesName = rangesName.concat(intersection[i].ranges)
        }

        ranges = ranges
            .sort(function (a, b) {
                return a - b;
            })
            .filter(function (point, index) {
                return ranges.indexOf(point) === index;
            });

        rangesName = rangesName
            .sort(function (a, b) {
                return a - b;
            })
            .filter(function (point, index) {
                return rangesName.indexOf(point) === index;
            });

        intersection = [];
        intersection.push({
            ranges: rangesName,
            start: ranges[0],
            end: ranges[ranges.length - 1]
        })
    }

    if (resultIntervalRange.length === 1) {
        let span = document.createElement("span");
        span.className = "color-light-grey";
        resultIntervalRange[0].ranges.surroundContents(span);

        highlightSpan.push({
            span: span,
            range: intersection[0].ranges[0],
            start: resultIntervalRange[0].start,
            end: resultIntervalRange[0].end
        })
    } else {
        for (let i = resultIntervalRange.length - 1; i >= 0; i--) {
            if (intersection[0].start <= resultIntervalRange[i].start && intersection[0].end >= resultIntervalRange[i].end) {
                let span = document.createElement('span');
                span.className = "color-dark-grey";
                resultIntervalRange[i].ranges.surroundContents(span);
                for (let j = 0; j < intersection[0].ranges.length; j++) {
                    highlightSpan.push({
                        span: span,
                        range: intersection[0].ranges[j],
                        start: resultIntervalRange[i].start,
                        end: resultIntervalRange[i].end
                    })
                }
            } else {
                let span = document.createElement('span');
                span.className = "color-light-grey";
                resultIntervalRange[i].ranges.surroundContents(span);
                for (let j = 0; j < intersection[0].ranges.length; j++) {
                    highlightSpan.push({
                        span: span,
                        range: intersection[0].ranges[j],
                        start: resultIntervalRange[i].start,
                        end: resultIntervalRange[i].end
                    })
                }
            }
        }
    }
}

function domRangeHighlight(ranges) {
    let intersection = getInterval(ranges);
    let result = [];
    for (let i = 0; i < intersection.length; i++) {
        result.push(getIntervalRange(intersection[i], ranges))
    }
    for (let j = 0; j < result.length; j++) {
        getSpanRange(result[j].intersection, result[j].resultIntervalRange)
    }
}

domRangeHighlight(ranges);

