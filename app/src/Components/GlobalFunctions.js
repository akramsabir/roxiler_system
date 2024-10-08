export function TimeFormater(datetimeString) {
    if (!datetimeString) {
        return "";
    }
    var timeString = datetimeString?.split(' ')[1];
    if(timeString){
        var timeComponents = timeString?.split(':');
        var hours = parseInt(timeComponents[0]);
        var minutes = parseInt(timeComponents[1]);
        var meridiem = (hours < 12) ? 'AM' : 'PM';
        hours = (hours % 12 === 0) ? 12 : hours % 12;
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        var formattedTime = hours + ':' + minutes + ' ' + meridiem;
        return formattedTime;
    }
    else{
        timeString = datetimeString?.split('T')[1];
        var timeComponents = timeString?.split(':');
        var hours = parseInt(timeComponents[0]);
        var minutes = parseInt(timeComponents[1]);
        var meridiem = (hours < 12) ? 'AM' : 'PM';
        hours = (hours % 12 === 0) ? 12 : hours % 12;
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        var formattedTime = hours + ':' + minutes + ' ' + meridiem;
        return formattedTime;
    }
}


export function DateFormater(GettedDate) {
        if (!GettedDate) {
            return ` `;
        }
    
        const date = new Date(GettedDate);
        if (isNaN(date.getTime())) {
            return ` `;
        }
    
        // Array of month names
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
    
        // Get the day, month, and year
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
    
        // Return the formatted date string, with padded day
        return `${day.toString().padStart(2, '0')}-${month}-${year}`;
}


 export function formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num; 
    }
  }