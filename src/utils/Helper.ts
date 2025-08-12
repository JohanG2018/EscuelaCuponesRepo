export const startOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}
export const endOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

export const isAfterDay = (date1: Date, date2: Date): boolean => {
  return startOfDay(date1) > startOfDay(date2);
};