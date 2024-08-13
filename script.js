const KWH_PRICE_IN_AGURUT = 61.45

// Use fetch to load the local CSV file
function processFiles() {
    const csvFile = document.getElementById('csv-file').files[0];

    if (!csvFile) {
        alert("Please upload a CSV file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const csvData = event.target.result;
        fetchDiscountData(csvData);
    };
    reader.readAsText(csvFile);
}

// Fetch the discount data from the server
function fetchDiscountData(csvData) {
    fetch('/discounts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(discountData => {
            calculateAllDiscount(csvData, discountData);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

function calculateAllDiscount(csvData, discountData) {
    const discounts = [];

    discountData.forEach(discount => {
        const totalDiscount = calculateSingleDiscount(csvData, discount);
        discounts.push({ name: discount.name, totalDiscount });
    });

    discounts.sort((a, b) => b.totalDiscount - a.totalDiscount);

    const outputElement = document.getElementById('output');
    outputElement.innerHTML = '';

    discounts.forEach(discount => {
        const totalDiscountFormatted = (discount.totalDiscount / 100).toFixed(2);
        outputElement.innerHTML += `Total discount for ${discount.name}: ${totalDiscountFormatted}<br>`;
    });
}

function calculateSingleDiscount(csvData, discount) {
    let totalDiscount = 0;
    const rows = csvData.split('\n').slice(12); // Skip the first 12 rows

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.trim()) continue; // Skip empty rows
        const columns = row.split(',');
        if (columns.length < 3) {
            console.warn(`Skipping malformed row ${i + 13}: ${row}`);
            continue;
        }

        const dateStr = columns[0].trim().replace(/"/g, '');
        const currentTime = columns[1].trim().replace(/"/g, '');
        const amount = parseFloat(columns[2].trim()) * KWH_PRICE_IN_AGURUT;

        if (isInTimeRange(discount.start_time, discount.end_time, currentTime) && isBetweenWeekdays(dateStr, discount.start_day, discount.end_day)) {
            const rowDiscount = amount * (discount.discount_percentage / 100);
            totalDiscount += rowDiscount;
        }
    }

    return totalDiscount;
}

function isInTimeRange(startTime, endTime, currentTime) {
    const start = new Date(`1970-01-01T${startTime}Z`);
    const end = new Date(`1970-01-01T${endTime}Z`);
    const current = new Date(`1970-01-01T${currentTime}Z`);

    if (start > end) {
        end.setDate(end.getDate() + 1);
    }

    return current >= start && current <= end;
}

function isBetweenWeekdays(dateStr, startDay, endDay) {
    const date = new Date(dateStr.split('/').reverse().join('-'));
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startDayNum = weekDays.indexOf(startDay);
    const endDayNum = weekDays.indexOf(endDay);
    const dateWeekday = date.getUTCDay();

    if (startDayNum <= endDayNum) {
        return dateWeekday >= startDayNum && dateWeekday <= endDayNum;
    } else {
        return dateWeekday >= startDayNum || dateWeekday <= endDayNum;
    }
}

function isInTimeRange(startTime, endTime, currentTime) {
    const start = new Date(`1970-01-01T${startTime}Z`);
    const end = new Date(`1970-01-01T${endTime}Z`);
    const current = new Date(`1970-01-01T${currentTime}Z`);

    if (start > end) {
        end.setDate(end.getDate() + 1);
    }

    return current >= start && current <= end;
}

function isBetweenWeekdays(dateStr, startDay, endDay) {
    const date = new Date(dateStr.split('/').reverse().join('-'));
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startDayNum = weekDays.indexOf(startDay);
    const endDayNum = weekDays.indexOf(endDay);
    const dateWeekday = date.getUTCDay();

    if (startDayNum <= endDayNum) {
        return dateWeekday >= startDayNum && dateWeekday <= endDayNum;
    } else {
        return dateWeekday >= startDayNum || dateWeekday <= endDayNum;
    }
}
