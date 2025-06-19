export const getLocalDateString = (date: Date) => {
     const year = date.getFullYear();
     const month = (date.getMonth() + 1).toString().padStart(2, "0");
     const day = date.getDate().toString().padStart(2, "0");
     return `${year}-${month}-${day}`;
};

export function formatTimestampUTC(timestamp: string | Date): string {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} в ${hours}:${minutes}`;
}
export const combineDateTime = (date: Date, time: string) => {
     const [hours, minutes] = time.split(":");
     const year = date.getFullYear();
     const month = String(date.getMonth() + 1).padStart(2, "0");
     const day = String(date.getDate()).padStart(2, "0");
     const hh = String(hours).padStart(2, "0");
     const mm = String(minutes).padStart(2, "0");

     return `${year}-${month}-${day} ${hh}:${mm}`;
};