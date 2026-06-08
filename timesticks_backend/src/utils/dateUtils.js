export const getLocalToday = (timezone) => {
    const tz = timezone || 'UTC'; 
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
    });
    return formatter.format(new Date()); 
};

export const getLocalYesterday = (timezone) => {
    const tz = timezone || 'UTC';
    const date = new Date();
    date.setDate(date.getDate() - 1);
    
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
    });
    return formatter.format(date);
};