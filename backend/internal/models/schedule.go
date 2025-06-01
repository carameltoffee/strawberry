package models

type TodaySchedule struct {
	DaysOff      []string `json:"days_off"`
	Slots        []string `json:"slots"`
	Appointments []string `json:"appointments"`
}
